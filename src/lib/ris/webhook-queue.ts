/**
 * Webhook Event Queue
 * Manages queuing and processing of GitHub webhook events
 */

import { getRedisClient } from '../redis';
import { logger } from '../logger';

export interface WebhookEvent {
  eventId: string;
  type: 'push' | 'pull_request' | 'issues' | 'issue_comment' | 'release';
  owner: string;
  repo: string;
  payload: Record<string, unknown>;
  receivedAt: string;
}

/**
 * Redis keys for webhook data
 */
const REDIS_KEYS = {
  // Queue of pending webhook events
  webhookQueue: 'ris:webhook:queue',

  // Set of processed event IDs (for deduplication)
  processedEvents: 'ris:webhook:processed',

  // Hash of installed repos { "owner/repo": installationId }
  installations: 'ris:installations',

  // Webhook processing errors
  webhookErrors: 'ris:webhook:errors',
};

/**
 * TTL values
 */
const TTL = {
  processedEvents: 7 * 24 * 60 * 60, // 7 days (prevent reprocessing recent events)
  webhookErrors: 30 * 24 * 60 * 60, // 30 days (keep error history)
};

/**
 * Queue a webhook event for processing
 */
export async function queueWebhookEvent(event: WebhookEvent): Promise<void> {
  const client = getRedisClient();

  // Check if already processed (GitHub sometimes sends duplicates)
  const wasProcessed = await client.sismember(
    REDIS_KEYS.processedEvents,
    event.eventId
  );

  if (wasProcessed) {
    logger.debug(`Skipping duplicate webhook event: ${event.eventId}`);
    return;
  }

  // Add to queue
  await client.rpush(
    REDIS_KEYS.webhookQueue,
    JSON.stringify(event)
  );

  logger.debug(`Queued webhook event: ${event.type} for ${event.owner}/${event.repo}`);
}

/**
 * Get next webhook event from queue (non-blocking)
 */
export async function dequeueWebhookEvent(): Promise<WebhookEvent | null> {
  const client = getRedisClient();

  const result = await client.lpop(REDIS_KEYS.webhookQueue);

  if (!result) {
    return null;
  }

  try {
    return JSON.parse(result) as WebhookEvent;
  } catch (error) {
    logger.error('Failed to parse webhook event:', error);
    return null;
  }
}

/**
 * Get queue length
 */
export async function getQueueLength(): Promise<number> {
  const client = getRedisClient();
  return await client.llen(REDIS_KEYS.webhookQueue);
}

/**
 * Mark event as processed (prevents reprocessing)
 */
export async function markEventProcessed(eventId: string): Promise<void> {
  const client = getRedisClient();

  await client.sadd(REDIS_KEYS.processedEvents, eventId);

  // Set TTL on the set (refresh each time we add)
  await client.expire(REDIS_KEYS.processedEvents, TTL.processedEvents);
}

/**
 * Track GitHub App installation
 */
export async function trackInstallation(
  owner: string,
  repo: string,
  installationId: number
): Promise<void> {
  const client = getRedisClient();
  const key = `${owner}/${repo}`;

  await client.hset(
    REDIS_KEYS.installations,
    key,
    installationId.toString()
  );

  logger.info(`Tracked installation: ${key} (ID: ${installationId})`);
}

/**
 * Remove installation tracking
 */
export async function removeInstallation(
  owner: string,
  repo: string
): Promise<void> {
  const client = getRedisClient();
  const key = `${owner}/${repo}`;

  await client.hdel(REDIS_KEYS.installations, key);

  logger.info(`Removed installation: ${key}`);
}

/**
 * Check if repo has app installed
 */
export async function isRepoInstalled(
  owner: string,
  repo: string
): Promise<boolean> {
  const client = getRedisClient();
  const key = `${owner}/${repo}`;

  const installationId = await client.hget(REDIS_KEYS.installations, key);

  return installationId !== null;
}

/**
 * Get installation ID for repo
 */
export async function getInstallationId(
  owner: string,
  repo: string
): Promise<number | null> {
  const client = getRedisClient();
  const key = `${owner}/${repo}`;

  const installationId = await client.hget(REDIS_KEYS.installations, key);

  if (!installationId) {
    return null;
  }

  return parseInt(installationId, 10);
}

/**
 * Get all installed repos
 */
export async function getAllInstallations(): Promise<Map<string, number>> {
  const client = getRedisClient();

  const installations = await client.hgetall(REDIS_KEYS.installations);
  const result = new Map<string, number>();

  for (const [key, value] of Object.entries(installations)) {
    result.set(key, parseInt(value, 10));
  }

  return result;
}

/**
 * Log webhook processing error
 */
export async function logWebhookError(
  eventId: string,
  error: string,
  details?: Record<string, unknown>
): Promise<void> {
  try {
    const client = getRedisClient();
    const errorEntry = {
      eventId,
      error,
      details,
      timestamp: new Date().toISOString(),
    };

    // Store as list (latest first)
    await client.lpush(
      REDIS_KEYS.webhookErrors,
      JSON.stringify(errorEntry)
    );

    // Keep only last 100 errors
    await client.ltrim(REDIS_KEYS.webhookErrors, 0, 99);

    logger.error(`Webhook error for ${eventId}:`, error, details);
  } catch (_error) {
    logger.error('Failed to log webhook error:', _error);
  }
}

/**
 * Get webhook processing errors
 */
export async function getWebhookErrors(limit: number = 50): Promise<Array<Record<string, unknown>>> {
  try {
    const client = getRedisClient();
    const errors = await client.lrange(REDIS_KEYS.webhookErrors, 0, limit - 1);

    return errors.map(e => {
      try {
        return JSON.parse(e);
      } catch {
        return { error: 'Failed to parse', raw: e };
      }
    });
  } catch (_error) {
    logger.error('Failed to get webhook errors:', _error);
    return [];
  }
}

/**
 * Clear all webhook queue data (admin only)
 */
export async function clearWebhookQueue(): Promise<void> {
  const client = getRedisClient();

  await Promise.all([
    client.del(REDIS_KEYS.webhookQueue),
    client.del(REDIS_KEYS.processedEvents),
    client.del(REDIS_KEYS.webhookErrors),
  ]);

  logger.info('Cleared webhook queue and processed events');
}
