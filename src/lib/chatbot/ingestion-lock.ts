/**
 * Redis-based Ingestion Lock Service
 *
 * Prevents concurrent ingestions and handles crash recovery.
 * Lock automatically expires after 10 minutes to prevent permanent locks.
 */

import type Redis from 'ioredis';
import { logger } from '../logger';

const LOCK_KEY = 'chatbot:ingestion:lock';
const LOCK_TTL = 600; // 10 minutes in seconds
const STALE_THRESHOLD = 300000; // 5 minutes in milliseconds

export interface IngestionLock {
  ingestionId: string;
  startedAt: number;
  startedBy?: string;
}

/**
 * Ingestion Lock Service
 * Manages exclusive access to ingestion process using Redis
 */
export class IngestionLockService {
  constructor(private redis: Redis) {}

  /**
   * Acquire the ingestion lock
   * Returns true if acquired, false if already locked
   */
  async acquire(ingestionId: string, startedBy?: string): Promise<boolean> {
    const lock: IngestionLock = {
      ingestionId,
      startedAt: Date.now(),
      startedBy,
    };

    // Try to set lock with NX (only if not exists) and EX (expiry)
    const result = await this.redis.set(
      LOCK_KEY,
      JSON.stringify(lock),
      'EX',
      LOCK_TTL,
      'NX'
    );

    if (result === 'OK') {
      logger.info(`Ingestion lock acquired: ${ingestionId}`);
      return true;
    }

    logger.warn(`Ingestion lock already held by another process`);
    return false;
  }

  /**
   * Release the ingestion lock
   */
  async release(ingestionId: string): Promise<void> {
    const currentLock = await this.get();

    // Only release if we hold the lock
    if (currentLock && currentLock.ingestionId === ingestionId) {
      await this.redis.del(LOCK_KEY);
      logger.info(`Ingestion lock released: ${ingestionId}`);
    } else {
      logger.warn(
        `Cannot release lock - held by different ingestion: ${currentLock?.ingestionId}`
      );
    }
  }

  /**
   * Force clear the lock (admin override)
   */
  async forceClear(): Promise<boolean> {
    const currentLock = await this.get();

    if (currentLock) {
      await this.redis.del(LOCK_KEY);
      logger.warn(`Ingestion lock force-cleared: ${currentLock.ingestionId}`);
      return true;
    }

    return false;
  }

  /**
   * Get current lock details
   */
  async get(): Promise<IngestionLock | null> {
    const lockData = await this.redis.get(LOCK_KEY);

    if (!lockData) {
      return null;
    }

    try {
      return JSON.parse(lockData) as IngestionLock;
    } catch (error) {
      logger.error('Failed to parse lock data:', error);
      // Clear corrupted lock
      await this.redis.del(LOCK_KEY);
      return null;
    }
  }

  /**
   * Check if the current lock is stale (process likely crashed)
   * Returns true if lock exists but is older than threshold
   */
  async isStale(): Promise<boolean> {
    const lock = await this.get();

    if (!lock) {
      return false;
    }

    const age = Date.now() - lock.startedAt;
    return age > STALE_THRESHOLD;
  }

  /**
   * Clear stale lock if it exists
   * Returns true if a stale lock was cleared
   */
  async clearStale(): Promise<boolean> {
    const isStale = await this.isStale();

    if (isStale) {
      const lock = await this.get();
      logger.warn(
        `Clearing stale ingestion lock (age: ${Date.now() - lock!.startedAt}ms): ${lock!.ingestionId}`
      );
      await this.forceClear();
      return true;
    }

    return false;
  }

  /**
   * Extend lock TTL (call periodically during long ingestions)
   */
  async extend(ingestionId: string): Promise<boolean> {
    const currentLock = await this.get();

    // Only extend if we hold the lock
    if (currentLock && currentLock.ingestionId === ingestionId) {
      await this.redis.expire(LOCK_KEY, LOCK_TTL);
      return true;
    }

    return false;
  }

  /**
   * Get lock status for display
   */
  async getStatus(): Promise<{
    locked: boolean;
    lock?: IngestionLock;
    stale?: boolean;
    ageMs?: number;
  }> {
    const lock = await this.get();

    if (!lock) {
      return { locked: false };
    }

    const ageMs = Date.now() - lock.startedAt;
    const stale = ageMs > STALE_THRESHOLD;

    return {
      locked: true,
      lock,
      stale,
      ageMs,
    };
  }
}
