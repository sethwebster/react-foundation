/**
 * RIS Data Collection API Route
 * Triggers collection of metrics for all ecosystem libraries
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { UserManagementService } from '@/lib/admin/user-management-service';
import { ecosystemLibraries } from '@/lib/maintainer-tiers';
import { MetricsAggregator } from '@/lib/ris/collectors/aggregator';
import { RISScoringService } from '@/lib/ris/scoring-service';
import { logger } from '@/lib/logger';
import {
  cacheLibraryMetrics,
  cacheLibraryActivity,
  getCachedLibraryActivity,
  cacheQuarterlyAllocation,
  setLastUpdated,
  acquireCollectionLock,
  releaseCollectionLock,
  keepCollectionLockAlive,
  setCollectionStatus,
  logCollectionError,
} from '@/lib/redis';
import {
  initializeCollectionState,
  getCollectionState,
  markSourceCompleted,
  markSourceFailed,
} from '@/lib/ris/collection-state';
import type { LibraryRawMetrics } from '@/lib/ris/types';
import { calculateMetricsFromActivity } from '@/lib/ris/activity-calculator';

export const maxDuration = 300; // 5 minutes max execution time

/**
 * Parse GitHub tokens from environment
 */
function parseGitHubTokens(): string[] {
  return process.env.GITHUB_TOKENS
    ? process.env.GITHUB_TOKENS
        .replace(/^\[|\]$/g, '') // Remove surrounding brackets if present
        .split(',')
        .map(t => t.trim())
        .filter(Boolean) // Remove empty strings
    : process.env.GITHUB_TOKEN
      ? [process.env.GITHUB_TOKEN]
      : [];
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication - require admin role
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      logger.warn('RIS collection attempted without authentication');
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const isAdmin = await UserManagementService.isAdmin(session.user.email);
    if (!isAdmin) {
      logger.warn(`RIS collection attempted by non-admin: ${session.user.email}`);
      return NextResponse.json(
        { error: 'Admin role required' },
        { status: 403 }
      );
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const forceRefresh = searchParams.get('force') === 'true';
    const maxAgeHours = parseInt(searchParams.get('maxAge') || '24', 10);

    logger.info(`RIS collection started by ${session.user.email}: ${forceRefresh ? 'FORCE' : 'INCREMENTAL'}`);
    logger.debug(`Max cache age: ${maxAgeHours} hours`);

    // Try to acquire lock
    const lockAcquired = await acquireCollectionLock();
    if (!lockAcquired) {
      return NextResponse.json(
        { error: 'Collection already in progress' },
        { status: 409 }
      );
    }

    // Set initial status
    await setCollectionStatus({
      status: 'running',
      message: 'Analyzing library data status...',
      progress: 0,
      total: ecosystemLibraries.length,
      startedAt: new Date().toISOString(),
    });

    // Create aggregator (try GitHub App first, then fall back to PATs)
    let aggregator: MetricsAggregator;

    if (process.env.GITHUB_APP_ID && process.env.GITHUB_APP_PRIVATE_KEY) {
      // Use GitHub App (better rate limits: 5,000/hour per installation)
      logger.info(`Using GitHub App authentication (App ID: ${process.env.GITHUB_APP_ID})`);

      try {
        aggregator = await MetricsAggregator.fromGitHubApp(
          process.env.GITHUB_APP_ID,
          process.env.GITHUB_APP_PRIVATE_KEY
        );
      } catch (error) {
        logger.error('Failed to initialize GitHub App, falling back to PAT:', error);

        // Fall back to PATs if App fails
        const githubTokens = parseGitHubTokens();
        if (githubTokens.length === 0) {
          logger.error('GitHub App failed and no PAT configured');
          await releaseCollectionLock();
          return NextResponse.json(
            { error: 'GitHub App failed and no GITHUB_TOKEN configured' },
            { status: 500 }
          );
        }

        logger.info(`Falling back to ${githubTokens.length} GitHub PAT(s)`);
        aggregator = new MetricsAggregator({
          githubToken: githubTokens[0],
          githubTokens
        });
      }
    } else {
      // Use PATs (original behavior)
      const githubTokens = parseGitHubTokens();

      if (githubTokens.length === 0) {
        logger.error('GITHUB_TOKEN not configured');
        await releaseCollectionLock();
        return NextResponse.json(
          { error: 'GITHUB_TOKEN or GITHUB_TOKENS environment variable not set' },
          { status: 500 }
        );
      }

      logger.info(`Using ${githubTokens.length} GitHub PAT(s) for collection`);

      aggregator = new MetricsAggregator({
        githubToken: githubTokens[0],
        githubTokens
      });
    }

    // Collect metrics for all libraries (in parallel batches)
    const allMetrics: LibraryRawMetrics[] = [];
    let collected = 0;
    let skipped = 0;
    let failed = 0;
    
    // Track progress with a shared counter (for parallel batch updates)
    let progressCounter = 0;

    // Prioritize libraries with no data first, then process libraries with existing data
    // This ensures that new libraries get baseline collection before incremental updates run
    // Strategy: Check cache, separate into two groups, process no-data group first
    logger.info('Checking which libraries have existing data...');
    const librariesWithData: typeof ecosystemLibraries = [];
    const librariesWithoutData: typeof ecosystemLibraries = [];

    for (const library of ecosystemLibraries) {
      const cachedActivity = await getCachedLibraryActivity(library.owner, library.name);
      if (cachedActivity) {
        librariesWithData.push(library);
      } else {
        librariesWithoutData.push(library);
      }
    }

    logger.info(`Prioritizing ${librariesWithoutData.length} libraries with no data, then ${librariesWithData.length} with existing data`);

    // Combine: no-data libraries first (baseline collection), then existing-data libraries (incremental updates)
    const orderedLibraries = [...librariesWithoutData, ...librariesWithData];

    // Create initial status message
    const initialMessage = librariesWithoutData.length > 0
      ? `Prioritizing ${librariesWithoutData.length} new libraries, then updating ${librariesWithData.length} existing`
      : `Updating ${librariesWithData.length} existing libraries`;

    // Update status with prioritization info
    await setCollectionStatus({
      status: 'running',
      message: initialMessage,
      progress: 0,
      total: orderedLibraries.length,
      startedAt: new Date().toISOString(),
    });

    // Start heartbeat to keep lock alive during long-running collection
    // Refresh lock every 60 seconds (lock TTL is 120 seconds)
    const lockHeartbeat = setInterval(async () => {
      const lockAlive = await keepCollectionLockAlive();
      if (!lockAlive) {
        logger.warn('Collection lock heartbeat: Lock expired, attempting to reacquire');
        const reacquired = await acquireCollectionLock();
        if (reacquired) {
          logger.info('Collection lock heartbeat: Successfully reacquired lock');
        } else {
          logger.error('Collection lock heartbeat: Failed to reacquire lock - another collection may have started');
        }
      } else {
        logger.debug('Collection lock heartbeat: Lock refreshed');
      }
    }, 60000); // Every 60 seconds

    // Start heartbeat to keep status alive during long-running collection
    // Refresh status every 20 seconds (status TTL is 30 seconds)
    let currentProgress = 0;
    let currentTotal = orderedLibraries.length;
    let currentMessage = initialMessage;
    let currentLibraryDisplay: string | undefined = undefined;
    let currentSourceDisplay: string | undefined = undefined;
    let currentActiveLibraries: Array<{ library: string; source?: string }> | undefined = undefined;

    const statusHeartbeat = setInterval(async () => {
      await setCollectionStatus({
        status: 'running',
        message: currentMessage,
        progress: currentProgress,
        total: currentTotal,
        startedAt: new Date().toISOString(),
        currentLibrary: currentLibraryDisplay,
        currentSource: currentSourceDisplay,
        activeLibraries: currentActiveLibraries,
      });
      logger.debug('Collection status heartbeat: Status refreshed');
    }, 20000); // Every 20 seconds

    // Ensure heartbeats are cleared on exit
    const cleanupHeartbeat = () => {
      clearInterval(lockHeartbeat);
      clearInterval(statusHeartbeat);
      logger.debug('Collection heartbeats stopped');
    };

    try {
      // Process in batches (match number of collectors for optimal throughput)
      const batchSize = aggregator.getCollectorCount();
      logger.info(`Processing libraries in batches of ${batchSize}`);

      for (let i = 0; i < orderedLibraries.length; i += batchSize) {
        const batch = orderedLibraries.slice(i, i + batchSize);
        currentProgress = progressCounter; // Sync before batch starts
        
        // Track active libraries in this batch with their current sources
        const activeLibrariesMap = new Map<string, string | undefined>();
        
        // Initialize all libraries in batch as active
        batch.forEach(library => {
          const libraryKey = `${library.owner}/${library.name}`;
          activeLibrariesMap.set(libraryKey, undefined); // No source yet
        });
        
        // Update status immediately to show all libraries being processed
        const activeLibraries: Array<{ library: string; source?: string }> = Array.from(activeLibrariesMap.entries()).map(([library, source]) => ({
          library,
          source,
        }));
        currentActiveLibraries = activeLibraries; // Store for heartbeat
        
        logger.info(`Starting batch with ${activeLibraries.length} libraries: ${activeLibraries.map(l => l.library).join(', ')}`);
        
        // Update status immediately with all libraries in batch (even before sources start)
        const initialStatus = {
          status: 'running' as const,
          message: currentMessage,
          progress: currentProgress,
          total: currentTotal,
          startedAt: new Date().toISOString(),
          activeLibraries,
        };
        
        logger.debug(`Setting initial status with ${activeLibraries.length} active libraries`);
        await setCollectionStatus(initialStatus);

        // Set up source callback BEFORE processing starts so it's ready when libraries begin collection
        // This callback will be shared across all libraries in the batch
        aggregator.setSourceCallbackWithLibrary((library: string, source: string) => {
          logger.debug(`Source callback received: library=${library}, source=${source}`);
          // Map internal source names to user-friendly names
          const sourceMap: Record<string, string> = {
            events: 'GitHub activity',
            basic_stats: 'basic stats',
            prs: 'PRs',
            issues: 'issues',
            commits: 'commits',
            releases: 'releases',
            npm_metrics: 'NPM metrics',
            cdn_metrics: 'CDN metrics',
            ossf_metrics: 'OSSF score',
          };
          const displaySource = sourceMap[source] || source;
          
          logger.debug(`Source callback: ${library} - ${displaySource}`);
          
          // Update the active libraries map
          if (library && activeLibrariesMap.has(library)) {
            activeLibrariesMap.set(library, displaySource);
          } else if (!library) {
            // Fallback: update first library in batch if library not provided
            const firstLib = `${batch[0].owner}/${batch[0].name}`;
            logger.warn(`Source callback missing library, using first: ${firstLib}`);
            activeLibrariesMap.set(firstLib, displaySource);
          } else {
            // Library provided but not in map - add it anyway
            logger.warn(`Library ${library} not in activeLibrariesMap, adding it`);
            activeLibrariesMap.set(library, displaySource);
          }
          
          // Build active libraries array for status update
          const updatedActiveLibraries: Array<{ library: string; source?: string }> = 
            Array.from(activeLibrariesMap.entries()).map(([lib, src]) => ({
              library: lib,
              source: src,
            }));
          currentActiveLibraries = updatedActiveLibraries; // Update for heartbeat callbacks
          
          logger.debug(`Updating status with ${updatedActiveLibraries.length} active libraries`);
          
          // Update status with all active libraries
          setCollectionStatus({
            status: 'running',
            message: currentMessage,
            progress: currentProgress,
            total: currentTotal,
            startedAt: new Date().toISOString(),
            activeLibraries: updatedActiveLibraries,
          }).catch(err => logger.error('Failed to update collection status:', err));
        });

      // Process batch in parallel
      const batchResults = await Promise.allSettled(
        batch.map(async (library, batchIndex) => {
          const libraryIndex = i + batchIndex; // Track which library this is in the full list
          
          try {
            // Ensure collection state exists (initialize if needed)
            let state = await getCollectionState(library.owner, library.name);
            if (!state || forceRefresh) {
              state = await initializeCollectionState(library.owner, library.name);
            }

            // Get cached activity data (permanent storage)
            const cachedActivity = await getCachedLibraryActivity(library.owner, library.name);

            // Collect or update activity (skip NPM for infrastructure repos)
            const activity = await aggregator.collectLibraryActivity(
              library.owner,
              library.name,
              library.name,
              forceRefresh ? null : cachedActivity, // Force refresh ignores cache
              library.hasNpmPackage !== false // Default to true if not specified
            );

            // Cache activity data (permanent, no TTL)
            await cacheLibraryActivity(library.owner, library.name, activity);

            // Convert activity to metrics (applies 12-month window)
            const metrics = calculateMetricsFromActivity(activity);

            // Cache calculated metrics (7 day TTL)
            await cacheLibraryMetrics(library.owner, library.name, metrics);

            // Update collection-state: Mark all sources as completed since aggregator successfully collected them
            // The aggregator collects all sources in one call, so if we reach here, all sources succeeded
            const allSources: Array<'github_basic' | 'github_prs' | 'github_issues' | 'github_commits' | 'github_releases' | 'npm_metrics' | 'cdn_metrics' | 'ossf_metrics'> = [
              'github_basic',
              'github_prs',
              'github_issues',
              'github_commits',
              'github_releases',
              'npm_metrics',
              'cdn_metrics',
              'ossf_metrics',
            ];

            // CRITICAL: Always mark ALL sources as completed after successful collection
            // The aggregator collects all sources atomically, so if we reach here, all succeeded
            // Execute sequentially to avoid race conditions with Redis
            for (const source of allSources) {
              try {
                // Calculate items collected for sources that track counts
                const itemsCollected = source === 'github_prs' ? activity.prs.length
                  : source === 'github_issues' ? activity.issues.length
                  : source === 'github_commits' ? activity.commits.length
                  : source === 'github_releases' ? activity.releases.length
                  : undefined;
                
                // Always mark as completed - aggregator already succeeded for all sources
                // (even if source was already completed, we refresh the timestamp)
                await markSourceCompleted(library.owner, library.name, source, itemsCollected);
              } catch (stateError) {
                // Log but don't fail the whole collection if state update fails
                logger.error(`Failed to mark ${source} as completed for ${library.owner}/${library.name}:`, stateError);
              }
            }
            
            // Final verification: Ensure state shows complete after all sources are marked
            const finalState = await getCollectionState(library.owner, library.name);
            if (!finalState) {
              logger.error(`❌ No collection state found for ${library.owner}/${library.name} after marking sources complete`);
            } else if (!finalState.is_complete) {
              // This should not happen, but if it does, log warning
              logger.warn(`⚠️ State not marked complete for ${library.owner}/${library.name} after marking all sources. Sources: ${allSources.map(s => `${s}=${finalState[s]?.status}`).join(', ')}`);
              
              // One more attempt: force mark all sources again
              for (const source of allSources) {
                try {
                  const sourceState = finalState[source];
                  if (sourceState?.status !== 'completed') {
                    const itemsCollected = source === 'github_prs' ? activity.prs.length
                      : source === 'github_issues' ? activity.issues.length
                      : source === 'github_commits' ? activity.commits.length
                      : source === 'github_releases' ? activity.releases.length
                      : undefined;
                    await markSourceCompleted(library.owner, library.name, source, itemsCollected);
                  }
                } catch (retryError) {
                  logger.error(`Failed to retry mark ${source} as completed:`, retryError);
                }
              }
            } else {
              logger.debug(`✅ Collection state verified complete for ${library.owner}/${library.name}`);
            }

            // Library completed successfully - count will be done after batch

            return {
              library,
              metrics,
              wasIncremental: !!(cachedActivity && !forceRefresh),
            };
          } catch (error) {
            // Capture full error details for debugging
            const errorObj = error instanceof Error ? error : new Error(String(error));
            const errorMsg = errorObj.message || String(error);
            const errorStack = errorObj.stack || '';
            
            // Log full error details
            logger.error(`Error collecting ${library.owner}/${library.name}:`, {
              message: errorMsg,
              stack: errorStack,
              name: errorObj.name,
            });
            
            // If error mentions Inngest/getStepMetadata, log additional context
            if (errorMsg.includes('getStepMetadata') || errorMsg.includes('step function')) {
              logger.error(`Inngest-related error detected for ${library.owner}/${library.name}. This may indicate a dependency issue or async context problem.`);
            }

            // Ensure collection state exists for error tracking
            let state = await getCollectionState(library.owner, library.name);
            if (!state) {
              state = await initializeCollectionState(library.owner, library.name);
            }

            // Mark all sources as failed since collection failed
            const allSources: Array<'github_basic' | 'github_prs' | 'github_issues' | 'github_commits' | 'github_releases' | 'npm_metrics' | 'cdn_metrics' | 'ossf_metrics'> = [
              'github_basic',
              'github_prs',
              'github_issues',
              'github_commits',
              'github_releases',
              'npm_metrics',
              'cdn_metrics',
              'ossf_metrics',
            ];

            // Mark failed sources (only ones that were pending/in_progress)
            // Execute sequentially to avoid race conditions with Redis
            for (const source of allSources) {
              try {
                const currentSourceState = state[source];
                if (currentSourceState?.status === 'pending' || currentSourceState?.status === 'in_progress') {
                  await markSourceFailed(library.owner, library.name, source, errorMsg);
                  // Refresh state after each update to get latest state
                  state = await getCollectionState(library.owner, library.name) || state;
                }
              } catch (stateError) {
                // Log but don't fail the whole error handling if state update fails
                logger.error(`Failed to mark ${source} as failed for ${library.owner}/${library.name}:`, stateError);
              }
            }

            // Check if this is a rate limit error
            if (errorMsg.includes('rate limit exceeded')) {
              // Extract reset time from error message
              const resetMatch = errorMsg.match(/Resets in (\d+) minutes/);
              const minutesUntilReset = resetMatch ? parseInt(resetMatch[1]) : 60;

              logger.error(`🚫 GitHub API rate limit exceeded! Will reset in ${minutesUntilReset} minutes`);

              // Store rate limit info and stop collection
              throw new Error(`RATE_LIMIT_EXCEEDED:${minutesUntilReset}`);
            }

            // Log error to Redis for admin review
            await logCollectionError(
              `${library.owner}/${library.name}`,
              errorMsg,
              { owner: library.owner, repo: library.name }
            );

            // Library failed - count will be done after batch

            throw error;
          }
        })
      );

      // Process results and check for rate limit errors
      let rateLimitHit = false;
      let rateLimitMinutes = 60;

      for (const result of batchResults) {
        if (result.status === 'fulfilled') {
          const { metrics, wasIncremental } = result.value;
          allMetrics.push(metrics);

          if (wasIncremental) {
            skipped++;
          } else {
            collected++;
          }
          
          // Increment progress counter for successful completion
          progressCounter++;
        } else {
          // Check if this failure is due to rate limiting
          const errorMsg = result.reason instanceof Error ? result.reason.message : String(result.reason);
          if (errorMsg.startsWith('RATE_LIMIT_EXCEEDED:')) {
            rateLimitHit = true;
            rateLimitMinutes = parseInt(errorMsg.split(':')[1]) || 60;
            logger.error(`🚫 Rate limit detected in batch, stopping collection`);
            break; // Stop processing immediately
          }
          failed++;
          
          // Increment progress counter even on failure (library was attempted)
          progressCounter++;
        }
      }

      // If rate limit hit, stop all processing
      if (rateLimitHit) {
        const resumeTime = new Date(Date.now() + rateLimitMinutes * 60 * 1000);
        const resumeTimeStr = resumeTime.toLocaleTimeString();

        await setCollectionStatus({
          status: 'rate_limited',
          message: `⏸️  GitHub API rate limit reached. Collection will automatically resume at ${resumeTimeStr} (in ${rateLimitMinutes} minutes). Collected ${collected} of ${currentTotal} libraries before limit.`,
          progress: currentProgress,
          total: currentTotal,
          startedAt: new Date().toISOString(),
          rateLimitResetAt: resumeTime.toISOString(),
        });

        cleanupHeartbeat();
        await releaseCollectionLock();

        logger.info(`⏸️  Collection paused due to rate limit. Resume at: ${resumeTimeStr}`);

        return NextResponse.json({
          success: false,
          rateLimited: true,
          collected,
          skipped,
          failed,
          total: ecosystemLibraries.length,
          message: `Rate limit reached after ${collected} libraries. Will reset in ${rateLimitMinutes} minutes at ${resumeTimeStr}`,
          resumeAt: resumeTime.toISOString(),
        });
      }

      // Update progress after batch completes (progressCounter tracks completed libraries)
      currentProgress = progressCounter;

      if (librariesWithoutData.length === 0) {
        // Only updating existing libraries
        currentMessage = `Updating existing: ${currentProgress}/${librariesWithData.length}`;
      } else {
        // Processing both new and existing
        const isProcessingNewLibraries = currentProgress <= librariesWithoutData.length;
        currentMessage = isProcessingNewLibraries
          ? `Collecting new libraries: ${currentProgress}/${librariesWithoutData.length} (${librariesWithData.length} existing will be updated next)`
          : `Updating existing: ${currentProgress - librariesWithoutData.length}/${librariesWithData.length} (${librariesWithoutData.length} new libraries collected)`;
      }

      // Determine next library to process (for status display)
      const nextLibraryIndex = currentProgress;
      const nextLibrary = orderedLibraries[nextLibraryIndex];
      currentLibraryDisplay = nextLibrary 
        ? `${nextLibrary.owner}/${nextLibrary.name}`
        : undefined;
      // Clear source when batch completes (will be set again when next batch starts)
      currentSourceDisplay = undefined;
      currentActiveLibraries = undefined; // Clear active libraries - next batch will set new ones

      // Update status immediately after batch completes
      await setCollectionStatus({
        status: 'running',
        message: currentMessage,
        progress: currentProgress,
        total: currentTotal,
        startedAt: new Date().toISOString(),
        currentLibrary: currentLibraryDisplay,
        currentSource: currentSourceDisplay,
        activeLibraries: currentActiveLibraries,
      });
      
      logger.info(`📊 Batch progress: ${currentProgress}/${currentTotal} libraries completed`);

        logger.debug(`Batch complete: ${collected} full, ${skipped} incremental, ${failed} failed / ${orderedLibraries.length} total`);
      }

      // Calculate RIS scores and allocation
      logger.debug('Calculating RIS scores and allocation...');
      const scoringService = new RISScoringService();
      const currentQuarter = getCurrentQuarter();
      const totalPool = 1_000_000; // $1M default pool

      // Get proration data for mid-quarter approved libraries
      const { getQuarterDates, getLibraryApprovalDates } = await import('@/lib/ris/proration-helpers');
      const { start: quarterStart, end: quarterEnd } = getQuarterDates(currentQuarter);
      const approvalDates = await getLibraryApprovalDates(currentQuarter);

      // Calculate all scores (including ineligible ones for debugging)
      const allScores = scoringService.calculateScores(allMetrics);
      logger.info(`📊 RIS Score Calculation Results:
  - Total libraries processed: ${allScores.length}
  - Eligibility threshold: 0.15 (15%)
  - Libraries above threshold: ${allScores.filter(s => s.ris >= 0.15).length}
  - Libraries below threshold: ${allScores.filter(s => s.ris < 0.15).length}
`);

      // Log top 5 scores
      const sortedScores = [...allScores].sort((a, b) => b.ris - a.ris);
      logger.info(`🏆 Top 5 RIS Scores:
${sortedScores.slice(0, 5).map((s, i) => `  ${i + 1}. ${s.libraryName}: ${(s.ris * 100).toFixed(2)}%`).join('\n')}`);

      // Log bottom 5 scores
      logger.warn(`⚠️ Bottom 5 RIS Scores:
${sortedScores.slice(-5).reverse().map((s, i) => `  ${i + 1}. ${s.libraryName}: ${(s.ris * 100).toFixed(2)}%`).join('\n')}`);

      // Log libraries filtered out by eligibility threshold
      const belowThreshold = allScores.filter(s => s.ris < 0.15);
      if (belowThreshold.length > 0) {
        logger.warn(`❌ ${belowThreshold.length} libraries below 15% threshold will receive $0 allocation`);
      }

      const allocation = scoringService.generateQuarterlyAllocation(
        allMetrics,
        totalPool,
        currentQuarter,
        undefined, // previousScores
        quarterStart,
        quarterEnd,
        approvalDates
      );

      // Log allocation results
      logger.info(`💰 Allocation Results:
  - Libraries receiving funding: ${allocation.libraries.length}
  - Total pool: $${(allocation.total_pool_usd / 1000).toFixed(0)}K
  - Average allocation: ${allocation.libraries.length > 0 ? `$${Math.round(allocation.total_pool_usd / allocation.libraries.length / 1000)}K` : 'N/A'}
`);

      // Cache the allocation
      await cacheQuarterlyAllocation(allocation);

      // Update last updated timestamp
      await setLastUpdated();

      // Release lock
      await releaseCollectionLock();

        // Set completion status (clear currentLibrary and currentSource since we're done)
        await setCollectionStatus({
          status: 'completed',
          message: `Completed: ${librariesWithoutData.length} new libraries collected, ${librariesWithData.length} existing updated (${failed} failed)`,
          progress: allMetrics.length,
          total: orderedLibraries.length,
          startedAt: new Date().toISOString(),
          completedAt: new Date().toISOString(),
          currentLibrary: undefined, // Clear current library on completion
          currentSource: undefined, // Clear current source on completion
        });

      return NextResponse.json({
        success: true,
        mode: forceRefresh ? 'force' : 'incremental',
        collected: collected,
        cached: skipped,
        failed: failed,
        newLibraries: librariesWithoutData.length,
        existingLibraries: librariesWithData.length,
        total: orderedLibraries.length,
        period: currentQuarter,
        timestamp: new Date().toISOString(),
      });
    } finally {
      // Always cleanup heartbeat, even on error
      cleanupHeartbeat();
    }
  } catch (error) {
    logger.error('Collection error:', error);

    // Release lock on error
    await releaseCollectionLock();

    // Set error status
    await setCollectionStatus({
      status: 'failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      startedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
    });

    return NextResponse.json(
      {
        error: 'Data collection failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * Get current quarter (e.g., "2025-Q4")
 */
function getCurrentQuarter(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1; // 0-indexed
  const quarter = Math.ceil(month / 3);

  return `${year}-Q${quarter}`;
}
