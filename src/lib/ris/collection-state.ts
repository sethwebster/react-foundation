/**
 * Collection State Tracking
 * Tracks which data sources have been successfully collected
 * Enables resumable collection after failures
 */

import { getRedisClient } from '../redis';
import { logger } from '../logger';

/**
 * Granular collection state for each data source
 */
export interface CollectionState {
  libraryKey: string; // "owner/repo"

  // Collection status for each data source
  github_basic: CollectionSourceState;
  github_prs: CollectionSourceState;
  github_issues: CollectionSourceState;
  github_commits: CollectionSourceState;
  github_releases: CollectionSourceState;
  npm_metrics: CollectionSourceState;
  cdn_metrics: CollectionSourceState;
  ossf_metrics: CollectionSourceState;

  // Overall status
  is_complete: boolean; // All sources succeeded
  is_partial: boolean; // Some sources succeeded

  // Metadata
  started_at: string;
  completed_at?: string;
  last_attempt_at: string;
  attempt_count: number;
  next_retry_at?: string; // When to retry failed sources
}

/**
 * State for individual data source
 */
export interface CollectionSourceState {
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  collected_at?: string;
  error?: string;
  retry_count: number;
  items_collected?: number; // For progress tracking
}

/**
 * Redis keys
 */
const REDIS_KEYS = {
  collectionState: (owner: string, repo: string) => `ris:collection:state:${owner}/${repo}`,
  failedCollections: 'ris:collection:failed', // Sorted set of failed collections
  pendingRetries: 'ris:collection:retry', // Sorted set of collections to retry
};

/**
 * Initialize collection state for a new library
 */
export async function initializeCollectionState(
  owner: string,
  repo: string
): Promise<CollectionState> {
  const libraryKey = `${owner}/${repo}`;

  const initialSource: CollectionSourceState = {
    status: 'pending',
    retry_count: 0,
  };

  const state: CollectionState = {
    libraryKey,
    github_basic: { ...initialSource },
    github_prs: { ...initialSource },
    github_issues: { ...initialSource },
    github_commits: { ...initialSource },
    github_releases: { ...initialSource },
    npm_metrics: { ...initialSource },
    cdn_metrics: { ...initialSource },
    ossf_metrics: { ...initialSource },
    is_complete: false,
    is_partial: false,
    started_at: new Date().toISOString(),
    last_attempt_at: new Date().toISOString(),
    attempt_count: 0,
  };

  await saveCollectionState(owner, repo, state);
  logger.info(`📋 Initialized collection state for ${libraryKey}`);

  return state;
}

/**
 * Get collection state for a library
 */
export async function getCollectionState(
  owner: string,
  repo: string
): Promise<CollectionState | null> {
  try {
    const client = getRedisClient();
    const key = REDIS_KEYS.collectionState(owner, repo);
    const data = await client.get(key);

    if (!data) {
      return null;
    }

    return JSON.parse(data) as CollectionState;
  } catch (error) {
    logger.error(`Failed to get collection state for ${owner}/${repo}:`, error);
    return null;
  }
}

/**
 * Save collection state
 */
export async function saveCollectionState(
  owner: string,
  repo: string,
  state: CollectionState
): Promise<void> {
  try {
    const client = getRedisClient();
    const key = REDIS_KEYS.collectionState(owner, repo);

    await client.set(key, JSON.stringify(state));

    // Update indexes based on state
    if (!state.is_complete) {
      if (state.is_partial || state.attempt_count > 0) {
        // Add to failed collections set (scored by last attempt)
        await client.zadd(
          REDIS_KEYS.failedCollections,
          new Date(state.last_attempt_at).getTime(),
          state.libraryKey
        );

        // Schedule retry if not already scheduled
        if (state.next_retry_at) {
          await client.zadd(
            REDIS_KEYS.pendingRetries,
            new Date(state.next_retry_at).getTime(),
            state.libraryKey
          );
        }
      }
    } else {
      // Remove from failed/retry sets if completed
      await client.zrem(REDIS_KEYS.failedCollections, state.libraryKey);
      await client.zrem(REDIS_KEYS.pendingRetries, state.libraryKey);
    }
  } catch (error) {
    logger.error(`Failed to save collection state for ${owner}/${repo}:`, error);
  }
}

/**
 * Mark a data source as in progress
 */
export async function markSourceInProgress(
  owner: string,
  repo: string,
  source: keyof Omit<CollectionState, 'libraryKey' | 'is_complete' | 'is_partial' | 'started_at' | 'completed_at' | 'last_attempt_at' | 'attempt_count' | 'next_retry_at'>
): Promise<void> {
  const state = await getCollectionState(owner, repo);
  if (!state) {
    logger.warn(`No collection state found for ${owner}/${repo}`);
    return;
  }

  state[source].status = 'in_progress';
  state.last_attempt_at = new Date().toISOString();

  await saveCollectionState(owner, repo, state);
}

/**
 * Mark a data source as completed
 */
export async function markSourceCompleted(
  owner: string,
  repo: string,
  source: keyof Omit<CollectionState, 'libraryKey' | 'is_complete' | 'is_partial' | 'started_at' | 'completed_at' | 'last_attempt_at' | 'attempt_count' | 'next_retry_at'>,
  itemsCollected?: number
): Promise<void> {
  const state = await getCollectionState(owner, repo);
  if (!state) {
    logger.warn(`No collection state found for ${owner}/${repo}`);
    return;
  }

  state[source].status = 'completed';
  state[source].collected_at = new Date().toISOString();
  state[source].items_collected = itemsCollected;
  state[source].error = undefined;

  // Check if all sources are complete
  const allComplete = Object.keys(state)
    .filter(key => key.startsWith('github_') || key.endsWith('_metrics'))
    .every(key => (state[key as keyof CollectionState] as CollectionSourceState).status === 'completed');

  state.is_complete = allComplete;
  state.is_partial = !allComplete && Object.keys(state)
    .filter(key => key.startsWith('github_') || key.endsWith('_metrics'))
    .some(key => (state[key as keyof CollectionState] as CollectionSourceState).status === 'completed');

  if (allComplete) {
    state.completed_at = new Date().toISOString();
    logger.info(`✅ Collection complete for ${owner}/${repo}`);
  }

  await saveCollectionState(owner, repo, state);
}

/**
 * Mark a data source as failed
 */
export async function markSourceFailed(
  owner: string,
  repo: string,
  source: keyof Omit<CollectionState, 'libraryKey' | 'is_complete' | 'is_partial' | 'started_at' | 'completed_at' | 'last_attempt_at' | 'attempt_count' | 'next_retry_at'>,
  error: string
): Promise<void> {
  const state = await getCollectionState(owner, repo);
  if (!state) {
    logger.warn(`No collection state found for ${owner}/${repo}`);
    return;
  }

  state[source].status = 'failed';
  state[source].error = error;
  state[source].retry_count++;
  state.attempt_count++;
  state.last_attempt_at = new Date().toISOString();

  // Calculate next retry time with exponential backoff
  const backoffMinutes = Math.min(2 ** state[source].retry_count, 60); // Cap at 60 minutes
  const nextRetry = new Date(Date.now() + backoffMinutes * 60 * 1000);
  state.next_retry_at = nextRetry.toISOString();

  // Check if any sources are complete (partial success)
  state.is_partial = Object.keys(state)
    .filter(key => key.startsWith('github_') || key.endsWith('_metrics'))
    .some(key => (state[key as keyof CollectionState] as CollectionSourceState).status === 'completed');

  logger.warn(`❌ ${source} failed for ${owner}/${repo}: ${error} (retry ${state[source].retry_count}, next: ${backoffMinutes}min)`);

  await saveCollectionState(owner, repo, state);
}

/**
 * Get libraries that need retry
 * Returns libraries where next_retry_at is in the past
 */
export async function getLibrariesNeedingRetry(limit: number = 50): Promise<string[]> {
  try {
    const client = getRedisClient();
    const now = Date.now();

    // Get libraries where retry time is in the past
    const libraries = await client.zrangebyscore(
      REDIS_KEYS.pendingRetries,
      0,
      now,
      'LIMIT',
      0,
      limit
    );

    return libraries;
  } catch (error) {
    logger.error('Failed to get libraries needing retry:', error);
    return [];
  }
}

/**
 * Get failed collections for admin monitoring
 */
export async function getFailedCollections(limit: number = 100): Promise<Array<{
  libraryKey: string;
  state: CollectionState;
}>> {
  try {
    const client = getRedisClient();

    // Get most recent failures
    const libraryKeys = await client.zrevrange(
      REDIS_KEYS.failedCollections,
      0,
      limit - 1
    );

    const results = await Promise.all(
      libraryKeys.map(async (key) => {
        const [owner, repo] = key.split('/');
        const state = await getCollectionState(owner, repo);
        return state ? { libraryKey: key, state } : null;
      })
    );

    return results.filter((r): r is { libraryKey: string; state: CollectionState } => r !== null);
  } catch (error) {
    logger.error('Failed to get failed collections:', error);
    return [];
  }
}

/**
 * Get sources that need collection for a library
 * Returns list of sources that are 'pending' or 'failed'
 */
export function getSourcesNeedingCollection(state: CollectionState): string[] {
  const sources: string[] = [];

  const checkSource = (key: string) => {
    const source = state[key as keyof CollectionState] as CollectionSourceState;
    if (source.status === 'pending' || source.status === 'failed') {
      sources.push(key);
    }
  };

  checkSource('github_basic');
  checkSource('github_prs');
  checkSource('github_issues');
  checkSource('github_commits');
  checkSource('github_releases');
  checkSource('npm_metrics');
  checkSource('cdn_metrics');
  checkSource('ossf_metrics');

  return sources;
}

/**
 * Reset collection state (for manual retry)
 */
export async function resetCollectionState(
  owner: string,
  repo: string
): Promise<void> {
  const state = await getCollectionState(owner, repo);
  if (!state) {
    logger.warn(`No collection state found for ${owner}/${repo}`);
    return;
  }

  // Reset all failed sources to pending
  Object.keys(state).forEach((key) => {
    if (key.startsWith('github_') || key.endsWith('_metrics')) {
      const source = state[key as keyof CollectionState] as CollectionSourceState;
      if (source.status === 'failed') {
        source.status = 'pending';
        source.error = undefined;
      }
    }
  });

  state.next_retry_at = new Date().toISOString(); // Retry now

  await saveCollectionState(owner, repo, state);
  logger.info(`🔄 Reset collection state for ${owner}/${repo}`);
}

/**
 * Get collection statistics
 */
export async function getCollectionStats(): Promise<{
  total_failed: number;
  pending_retries: number;
}> {
  try {
    const client = getRedisClient();

    const [total_failed, pending_retries] = await Promise.all([
      client.zcard(REDIS_KEYS.failedCollections),
      client.zcard(REDIS_KEYS.pendingRetries),
    ]);

    return { total_failed, pending_retries };
  } catch (error) {
    logger.error('Failed to get collection stats:', error);
    return { total_failed: 0, pending_retries: 0 };
  }
}
