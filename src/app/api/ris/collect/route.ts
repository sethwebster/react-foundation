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
  setCollectionStatus,
  logCollectionError,
} from '@/lib/redis';
import type { LibraryRawMetrics } from '@/lib/ris/types';
import { calculateMetricsFromActivity } from '@/lib/ris/activity-calculator';

export const maxDuration = 300; // 5 minutes max execution time

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

    // Parse GitHub tokens (supports both single and multiple)
    const githubTokens = process.env.GITHUB_TOKENS
      ? process.env.GITHUB_TOKENS
          .replace(/^\[|\]$/g, '') // Remove surrounding brackets if present
          .split(',')
          .map(t => t.trim())
          .filter(Boolean) // Remove empty strings
      : process.env.GITHUB_TOKEN
        ? [process.env.GITHUB_TOKEN]
        : [];

    if (githubTokens.length === 0) {
      logger.error('GITHUB_TOKEN not configured');
      return NextResponse.json(
        { error: 'GITHUB_TOKEN or GITHUB_TOKENS environment variable not set' },
        { status: 500 }
      );
    }

    logger.info(`Using ${githubTokens.length} GitHub token(s) for collection`);

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

    // Create aggregator with token rotation
    const aggregator = new MetricsAggregator({
      githubToken: githubTokens[0],
      githubTokens
    });

    // Collect metrics for all libraries
    const allMetrics: LibraryRawMetrics[] = [];
    let collected = 0;
    let skipped = 0;
    let failed = 0;

    for (const library of ecosystemLibraries) {
      try {
        // Get cached activity data (permanent storage)
        const cachedActivity = await getCachedLibraryActivity(library.owner, library.name);

        // Collect or update activity
        const activity = await aggregator.collectLibraryActivity(
          library.owner,
          library.name,
          library.name,
          forceRefresh ? null : cachedActivity // Force refresh ignores cache
        );

        // Cache activity data (permanent, no TTL)
        await cacheLibraryActivity(library.owner, library.name, activity);

        // Convert activity to metrics (applies 12-month window)
        const metrics = calculateMetricsFromActivity(activity);

        // Cache calculated metrics (7 day TTL)
        await cacheLibraryMetrics(library.owner, library.name, metrics);

        if (cachedActivity && !forceRefresh) {
          skipped++; // Incremental update
        } else {
          collected++; // Full collection
        }

        allMetrics.push(metrics);

        // Update progress
        await setCollectionStatus({
          status: 'running',
          message: `Progress: ${collected} full, ${skipped} incremental, ${failed} failed / ${ecosystemLibraries.length} total`,
          progress: collected + skipped,
          total: ecosystemLibraries.length,
          startedAt: new Date().toISOString(),
        });

        logger.debug(`Progress: ${collected} full, ${skipped} incremental / ${ecosystemLibraries.length} total`);
      } catch (error) {
        logger.error(`Error collecting ${library.owner}/${library.name}:`, error);

        // Log error to Redis for admin review
        await logCollectionError(
          `${library.owner}/${library.name}`,
          error instanceof Error ? error.message : String(error),
          { owner: library.owner, repo: library.name }
        );

        failed++;
        // Continue with other libraries even if one fails
      }
    }

    // Calculate RIS scores and allocation
    logger.debug('Calculating RIS scores and allocation...');
    const scoringService = new RISScoringService();
    const currentQuarter = getCurrentQuarter();
    const totalPool = 1_000_000; // $1M default pool

    const allocation = scoringService.generateQuarterlyAllocation(
      allMetrics,
      totalPool,
      currentQuarter
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
