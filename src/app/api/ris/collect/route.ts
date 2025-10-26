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
      message: 'Starting data collection',
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

    // Process in batches (match number of collectors for optimal throughput)
    const batchSize = aggregator.getCollectorCount();
    logger.info(`Processing libraries in batches of ${batchSize}`);

    for (let i = 0; i < ecosystemLibraries.length; i += batchSize) {
      // Keep lock alive at start of each batch
      const lockAlive = await keepCollectionLockAlive();
      if (!lockAlive) {
        logger.warn('Collection lock expired during processing - attempting to continue');
      }

      const batch = ecosystemLibraries.slice(i, i + batchSize);

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
            logger.error(`Error collecting ${library.owner}/${library.name}:`, error);

            // Log error to Redis for admin review
            await logCollectionError(
              `${library.owner}/${library.name}`,
              error instanceof Error ? error.message : String(error),
              { owner: library.owner, repo: library.name }
            );

            throw error;
          }
        })
      );

      // Process results
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
          failed++;
        }
      }

      // Update progress after batch
      await setCollectionStatus({
        status: 'running',
        message: `Progress: ${collected} full, ${skipped} incremental, ${failed} failed / ${ecosystemLibraries.length} total`,
        progress: collected + skipped + failed,
        total: ecosystemLibraries.length,
        startedAt: new Date().toISOString(),
      });

      logger.debug(`Batch complete: ${collected} full, ${skipped} incremental, ${failed} failed / ${ecosystemLibraries.length} total`);
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

    const allocation = scoringService.generateQuarterlyAllocation(
      allMetrics,
      totalPool,
      currentQuarter,
      undefined, // previousScores
      quarterStart,
      quarterEnd,
      approvalDates
    );

    // Cache the allocation
    await cacheQuarterlyAllocation(allocation);

    // Update last updated timestamp
    await setLastUpdated();

    // Release lock
    await releaseCollectionLock();

    // Set completion status
    await setCollectionStatus({
      status: 'completed',
      message: `Completed: ${collected} collected, ${skipped} cached, ${failed} failed`,
      progress: allMetrics.length,
      total: ecosystemLibraries.length,
      startedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      mode: forceRefresh ? 'force' : 'incremental',
      collected: collected,
      cached: skipped,
      failed: failed,
      total: ecosystemLibraries.length,
      period: currentQuarter,
      timestamp: new Date().toISOString(),
    });
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
