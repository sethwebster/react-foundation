/**
 * Collection Scheduler
 * Handles scheduled retry of failed collections
 * and periodic refresh of approved libraries
 */

import { getLibrariesNeedingRetry, getCollectionStats } from './collection-state';
import { collectBaselineForLibrary } from './baseline-collection';
import { getApprovedLibraries } from './library-approval';
import { logger } from '../logger';

/**
 * Process libraries that need retry
 * Called by scheduled job (e.g., every 15 minutes)
 */
export async function processRetries(maxRetries: number = 10): Promise<{
  attempted: number;
  succeeded: number;
  failed: number;
  partial: number;
}> {
  logger.info(`🔄 Processing collection retries (max: ${maxRetries})...`);

  const librariesToRetry = await getLibrariesNeedingRetry(maxRetries);

  if (librariesToRetry.length === 0) {
    logger.info(`  ℹ️  No libraries need retry`);
    return { attempted: 0, succeeded: 0, failed: 0, partial: 0 };
  }

  logger.info(`  📋 Found ${librariesToRetry.length} libraries needing retry`);

  let succeeded = 0;
  let failed = 0;
  let partial = 0;

  for (const libraryKey of librariesToRetry) {
    const [owner, repo] = libraryKey.split('/');

    try {
      // Attempt collection with resume
      const result = await collectBaselineForLibrary(
        owner,
        repo,
        repo, // Use repo name as library name
        { resume: true }
      );

      if (result.success && !result.isPartial) {
        succeeded++;
        logger.info(`    ✅ Retry succeeded: ${libraryKey}`);
      } else if (result.isPartial) {
        partial++;
        logger.warn(`    ⚠️  Retry partial: ${libraryKey} (${result.failedSources?.length} sources still failing)`);
      } else {
        failed++;
        logger.error(`    ❌ Retry failed: ${libraryKey} - ${result.error}`);
      }

      // Add delay between retries to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 2000));

    } catch (error) {
      failed++;
      logger.error(`    ❌ Retry crashed: ${libraryKey}:`, error);
    }
  }

  logger.info(`✅ Retry processing complete: ${succeeded} succeeded, ${partial} partial, ${failed} failed`);

  return {
    attempted: librariesToRetry.length,
    succeeded,
    failed,
    partial,
  };
}

/**
 * Refresh all approved libraries
 * Called by scheduled job (e.g., weekly)
 */
export async function refreshAllLibraries(): Promise<{
  total: number;
  succeeded: number;
  failed: number;
  partial: number;
}> {
  logger.info(`🔄 Starting weekly refresh of all approved libraries...`);

  const approved = await getApprovedLibraries();

  if (approved.length === 0) {
    logger.info(`  ℹ️  No approved libraries to refresh`);
    return { total: 0, succeeded: 0, failed: 0, partial: 0 };
  }

  logger.info(`  📋 Refreshing ${approved.length} approved libraries`);

  let succeeded = 0;
  let failed = 0;
  let partial = 0;

  for (const library of approved) {
    try {
      // Force refresh to update NPM/CDN data and recalculate metrics
      const result = await collectBaselineForLibrary(
        library.owner,
        library.repo,
        library.repo,
        { resume: true, force: false } // Resume existing, don't force full re-collection
      );

      if (result.success && !result.isPartial) {
        succeeded++;
      } else if (result.isPartial) {
        partial++;
      } else {
        failed++;
      }

      // Add delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 3000));

    } catch (error) {
      failed++;
      logger.error(`    ❌ Refresh failed for ${library.owner}/${library.repo}:`, error);
    }
  }

  logger.info(`✅ Refresh complete: ${succeeded} succeeded, ${partial} partial, ${failed} failed out of ${approved.length}`);

  return {
    total: approved.length,
    succeeded,
    failed,
    partial,
  };
}

/**
 * Get scheduler statistics for monitoring
 */
export async function getSchedulerStats(): Promise<{
  pending_retries: number;
  total_failed: number;
  approved_libraries: number;
}> {
  const [collectionStats, approved] = await Promise.all([
    getCollectionStats(),
    getApprovedLibraries(),
  ]);

  return {
    pending_retries: collectionStats.pending_retries,
    total_failed: collectionStats.total_failed,
    approved_libraries: approved.length,
  };
}
