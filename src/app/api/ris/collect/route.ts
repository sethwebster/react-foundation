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

    const statusHeartbeat = setInterval(async () => {
      await setCollectionStatus({
        status: 'running',
        message: currentMessage,
        progress: currentProgress,
        total: currentTotal,
        startedAt: new Date().toISOString(),
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

      // Process batch in parallel
      const batchResults = await Promise.allSettled(
        batch.map(async (library) => {
          try {
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

            return {
              library,
              metrics,
              wasIncremental: !!(cachedActivity && !forceRefresh),
            };
          } catch (error) {
            const errorMsg = error instanceof Error ? error.message : String(error);
            logger.error(`Error collecting ${library.owner}/${library.name}:`, errorMsg);

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

      // Update progress after batch
      currentProgress = collected + skipped + failed;

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

      await setCollectionStatus({
        status: 'running',
        message: currentMessage,
        progress: currentProgress,
        total: currentTotal,
        startedAt: new Date().toISOString(),
      });

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

      // Set completion status
      await setCollectionStatus({
        status: 'completed',
        message: `Completed: ${librariesWithoutData.length} new libraries collected, ${librariesWithData.length} existing updated (${failed} failed)`,
        progress: allMetrics.length,
        total: orderedLibraries.length,
        startedAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
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
