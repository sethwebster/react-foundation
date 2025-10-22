/**
 * Redis Client
 * Manages Redis connection and caching for RIS metrics
 */

import Redis from 'ioredis';
import type { LibraryRawMetrics, QuarterlyAllocation } from './ris/types';
import type { LibraryActivityData } from './ris/activity-types';
import { logger } from './logger';

/**
 * Sanitize input for use in Redis keys
 * Prevents injection attacks
 */
function sanitizeKeyParam(param: string): string {
  // Remove any characters that aren't alphanumeric, dash, underscore, or dot
  return param.replace(/[^a-zA-Z0-9._-]/g, '_').substring(0, 200);
}

// Singleton Redis client
let redis: Redis | null = null;

/**
 * Get Redis client instance (singleton)
 */
export function getRedisClient(): Redis {
  if (redis) {
    return redis;
  }

  const redisUrl = process.env.REDIS_URL;

  if (!redisUrl) {
    throw new Error('REDIS_URL environment variable is not set');
  }

  redis = new Redis(redisUrl, {
    maxRetriesPerRequest: 3,
    retryStrategy(times) {
      const delay = Math.min(times * 50, 2000);
      return delay;
    },
    reconnectOnError(err) {
      const targetErrors = ['READONLY', 'ECONNRESET'];
      if (targetErrors.some((targetError) => err.message.includes(targetError))) {
        // Reconnect on specific errors
        return true;
      }
      return false;
    },
  });

  redis.on('error', (err) => {
    logger.error('Redis connection error:', err);
  });

  redis.on('connect', () => {
    logger.info('Redis connected');
  });

  return redis;
}

/**
 * Redis key patterns (sanitized)
 */
export const REDIS_KEYS = {
  // Raw activity data for a library (permanent cache)
  libraryActivity: (owner: string, repo: string) =>
    `ris:activity:${sanitizeKeyParam(owner)}:${sanitizeKeyParam(repo)}`,

  // Calculated metrics for a single library (derived from activity)
  libraryMetrics: (owner: string, repo: string) =>
    `ris:metrics:${sanitizeKeyParam(owner)}:${sanitizeKeyParam(repo)}`,

  // Current quarterly allocation
  allocation: (period: string) => `ris:allocation:${sanitizeKeyParam(period)}`,

  // Last update timestamp
  lastUpdated: 'ris:last_updated',

  // Collection status
  collectionStatus: 'ris:collection_status',

  // Lock for preventing concurrent collections
  collectionLock: 'ris:collection_lock',

  // Error log for failed collections
  collectionErrors: 'ris:collection_errors',
};

/**
 * TTL (Time To Live) values in seconds
 */
export const CACHE_TTL = {
  libraryActivity: 0, // NO EXPIRATION (historical data is immutable)
  libraryMetrics: 7 * 24 * 60 * 60, // 7 days (calculated from activity)
  allocation: 7 * 24 * 60 * 60, // 7 days
  collectionLock: 10 * 60, // 10 minutes
};

/**
 * Cache library metrics
 */
export async function cacheLibraryMetrics(
  owner: string,
  repo: string,
  metrics: LibraryRawMetrics
): Promise<void> {
  const client = getRedisClient();
  const key = REDIS_KEYS.libraryMetrics(owner, repo);

  await client.setex(
    key,
    CACHE_TTL.libraryMetrics,
    JSON.stringify(metrics)
  );
}

/**
 * Get cached library metrics
 */
export async function getCachedLibraryMetrics(
  owner: string,
  repo: string
): Promise<LibraryRawMetrics | null> {
  const client = getRedisClient();
  const key = REDIS_KEYS.libraryMetrics(owner, repo);

  const data = await client.get(key);
  if (!data) return null;

  try {
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error parsing cached metrics for ${owner}/${repo}:`, error);
    return null;
  }
}

/**
 * Check freshness of cached metrics
 */
export type CacheFreshness = 'missing' | 'fresh' | 'stale' | 'expired';

export async function getMetricsFreshness(
  owner: string,
  repo: string,
  freshThresholdHours: number = 6,
  staleThresholdHours: number = 24
): Promise<{ freshness: CacheFreshness; age_hours?: number; metrics?: LibraryRawMetrics }> {
  const cached = await getCachedLibraryMetrics(owner, repo);

  if (!cached) {
    return { freshness: 'missing' };
  }

  const collectedAt = new Date(cached.collected_at);
  const ageMs = Date.now() - collectedAt.getTime();
  const ageHours = ageMs / (1000 * 60 * 60);

  let freshness: CacheFreshness;
  if (ageHours < freshThresholdHours) {
    freshness = 'fresh';
  } else if (ageHours < staleThresholdHours) {
    freshness = 'stale';
  } else {
    freshness = 'expired';
  }

  return {
    freshness,
    age_hours: ageHours,
    metrics: cached,
  };
}

/**
 * Cache quarterly allocation
 */
export async function cacheQuarterlyAllocation(
  allocation: QuarterlyAllocation
): Promise<void> {
  const client = getRedisClient();
  const key = REDIS_KEYS.allocation(allocation.period);

  await client.setex(
    key,
    CACHE_TTL.allocation,
    JSON.stringify(allocation)
  );
}

/**
 * Get cached quarterly allocation
 */
export async function getCachedQuarterlyAllocation(
  period: string
): Promise<QuarterlyAllocation | null> {
  const client = getRedisClient();
  const key = REDIS_KEYS.allocation(period);

  const data = await client.get(key);
  if (!data) return null;

  try {
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error parsing cached allocation for ${period}:`, error);
    return null;
  }
}

/**
 * Set last updated timestamp
 */
export async function setLastUpdated(): Promise<void> {
  const client = getRedisClient();
  const key = REDIS_KEYS.lastUpdated;

  await client.set(key, new Date().toISOString());
}

/**
 * Get last updated timestamp
 */
export async function getLastUpdated(): Promise<string | null> {
  const client = getRedisClient();
  const key = REDIS_KEYS.lastUpdated;

  return await client.get(key);
}

/**
 * Acquire lock for data collection
 * Returns true if lock acquired, false if already locked
 */
export async function acquireCollectionLock(): Promise<boolean> {
  const client = getRedisClient();
  const key = REDIS_KEYS.collectionLock;

  const result = await client.set(
    key,
    'locked',
    'EX',
    CACHE_TTL.collectionLock,
    'NX' // Only set if not exists
  );

  return result === 'OK';
}

/**
 * Release collection lock
 */
export async function releaseCollectionLock(): Promise<void> {
  const client = getRedisClient();
  const key = REDIS_KEYS.collectionLock;

  await client.del(key);
}

/**
 * Set collection status
 */
export async function setCollectionStatus(status: {
  status: 'running' | 'completed' | 'failed';
  message?: string;
  progress?: number;
  total?: number;
  startedAt?: string;
  completedAt?: string;
}): Promise<void> {
  const client = getRedisClient();
  const key = REDIS_KEYS.collectionStatus;

  await client.setex(
    key,
    60 * 60, // 1 hour
    JSON.stringify(status)
  );
}

/**
 * Get collection status
 */
export async function getCollectionStatus(): Promise<Record<string, unknown> | null> {
  const client = getRedisClient();
  const key = REDIS_KEYS.collectionStatus;

  const data = await client.get(key);
  if (!data) return null;

  try {
    return JSON.parse(data);
  } catch (error) {
    console.error('Error parsing collection status:', error);
    return null;
  }
}

/**
 * Clear all cached RIS data
 */
export async function clearRISCache(): Promise<void> {
  const client = getRedisClient();

  // Get all RIS keys
  const keys = await client.keys('ris:*');

  if (keys.length > 0) {
    await client.del(...keys);
    console.log(`Cleared ${keys.length} RIS cache keys`);
  }
}

/**
 * Cache library activity data (permanent storage)
 */
export async function cacheLibraryActivity(
  owner: string,
  repo: string,
  activity: LibraryActivityData
): Promise<void> {
  const client = getRedisClient();
  const key = REDIS_KEYS.libraryActivity(owner, repo);

  // NO TTL - historical data never expires
  await client.set(key, JSON.stringify(activity));
}

/**
 * Get cached library activity data
 */
export async function getCachedLibraryActivity(
  owner: string,
  repo: string
): Promise<LibraryActivityData | null> {
  const client = getRedisClient();
  const key = REDIS_KEYS.libraryActivity(owner, repo);

  const data = await client.get(key);
  if (!data) return null;

  try {
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error parsing cached activity for ${owner}/${repo}:`, error);
    return null;
  }
}

/**
 * Log collection error
 */
export async function logCollectionError(
  library: string,
  error: string,
  details?: Record<string, unknown>
): Promise<void> {
  try {
    const client = getRedisClient();
    const errorEntry = {
      library,
      error,
      details,
      timestamp: new Date().toISOString(),
    };

    // Store as list (latest first)
    await client.lpush(
      REDIS_KEYS.collectionErrors,
      JSON.stringify(errorEntry)
    );

    // Keep only last 100 errors
    await client.ltrim(REDIS_KEYS.collectionErrors, 0, 99);

    logger.error(`Collection error for ${library}:`, error, details);
  } catch (_error) {
    logger.error('Failed to log collection error to Redis:', _error);
  }
}

/**
 * Get collection errors
 */
export async function getCollectionErrors(limit: number = 50): Promise<Array<Record<string, unknown>>> {
  try {
    const client = getRedisClient();
    const errors = await client.lrange(REDIS_KEYS.collectionErrors, 0, limit - 1);

    return errors.map(e => {
      try {
        return JSON.parse(e);
      } catch {
        return { error: 'Failed to parse', raw: e };
      }
    });
  } catch (_error) {
    logger.error('Failed to get collection errors:', _error);
    return [];
  }
}

/**
 * Close Redis connection
 */
export async function closeRedisConnection(): Promise<void> {
  if (redis) {
    await redis.quit();
    redis = null;
  }
}
