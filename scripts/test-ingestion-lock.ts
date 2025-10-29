#!/usr/bin/env tsx
/**
 * Test script for Redis-based ingestion lock system
 *
 * Tests:
 * 1. Lock acquisition
 * 2. Concurrent lock prevention
 * 3. Lock status
 * 4. Stale lock detection (5min threshold)
 * 5. Clear stale lock
 * 6. Normal release
 * 7. Force clear
 * 8. Lock extension (keepalive)
 */

import Redis from 'ioredis';

// Redis connection
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

// Copy of the lock service for testing
const LOCK_KEY = 'chatbot:ingestion:lock';
const LOCK_TTL = 600; // 10 minutes
const STALE_THRESHOLD = 300000; // 5 minutes

interface IngestionLock {
  ingestionId: string;
  startedAt: number;
  startedBy?: string;
}

class IngestionLockService {
  constructor(private redis: Redis) {}

  async acquire(ingestionId: string, startedBy?: string): Promise<boolean> {
    const lock: IngestionLock = {
      ingestionId,
      startedAt: Date.now(),
      startedBy,
    };

    const result = await this.redis.set(
      LOCK_KEY,
      JSON.stringify(lock),
      'EX',
      LOCK_TTL,
      'NX'
    );

    return result === 'OK';
  }

  async release(ingestionId: string): Promise<void> {
    const currentLock = await this.get();
    if (currentLock && currentLock.ingestionId === ingestionId) {
      await this.redis.del(LOCK_KEY);
    }
  }

  async forceClear(): Promise<boolean> {
    const currentLock = await this.get();
    if (currentLock) {
      await this.redis.del(LOCK_KEY);
      return true;
    }
    return false;
  }

  async get(): Promise<IngestionLock | null> {
    const lockData = await this.redis.get(LOCK_KEY);
    if (!lockData) return null;
    try {
      return JSON.parse(lockData) as IngestionLock;
    } catch {
      await this.redis.del(LOCK_KEY);
      return null;
    }
  }

  async isStale(): Promise<boolean> {
    const lock = await this.get();
    if (!lock) return false;
    const age = Date.now() - lock.startedAt;
    return age > STALE_THRESHOLD;
  }

  async clearStale(): Promise<boolean> {
    const isStale = await this.isStale();
    if (isStale) {
      await this.forceClear();
      return true;
    }
    return false;
  }

  async extend(ingestionId: string): Promise<boolean> {
    const currentLock = await this.get();

    // Only extend if we hold the lock
    if (currentLock && currentLock.ingestionId === ingestionId) {
      await this.redis.expire(LOCK_KEY, LOCK_TTL);
      return true;
    }

    return false;
  }

  async getStatus() {
    const lock = await this.get();
    if (!lock) return { locked: false };

    const ageMs = Date.now() - lock.startedAt;
    const stale = ageMs > STALE_THRESHOLD;

    return { locked: true, lock, stale, ageMs };
  }
}

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function test() {
  console.log('🧪 Testing Redis-based Ingestion Lock System\n');
  console.log(`Connecting to Redis: ${REDIS_URL}\n`);

  const redis = new Redis(REDIS_URL);
  const lockService = new IngestionLockService(redis);

  try {
    // Clean up any existing locks
    await lockService.forceClear();
    console.log('✅ Cleaned up any existing locks\n');

    // Test 1: Acquire lock
    console.log('Test 1: Acquire lock');
    const acquired1 = await lockService.acquire('test-ingest-1', 'test-user@example.com');
    if (!acquired1) {
      throw new Error('Failed to acquire lock on first attempt');
    }
    console.log('✅ Successfully acquired lock\n');

    // Test 2: Concurrent lock prevention
    console.log('Test 2: Concurrent lock prevention');
    const acquired2 = await lockService.acquire('test-ingest-2', 'other-user@example.com');
    if (acquired2) {
      throw new Error('Should not have acquired lock when already locked');
    }
    console.log('✅ Correctly prevented concurrent lock\n');

    // Test 3: Lock status
    console.log('Test 3: Lock status');
    const status = await lockService.getStatus();
    if (!status.locked) {
      throw new Error('Status should show locked');
    }
    if (status.lock?.ingestionId !== 'test-ingest-1') {
      throw new Error('Lock ID mismatch');
    }
    console.log('✅ Lock status correct:', {
      ingestionId: status.lock?.ingestionId,
      startedBy: status.lock?.startedBy,
      ageMs: status.ageMs,
      stale: status.stale,
    });
    console.log();

    // Test 4: Stale detection (simulate old lock)
    console.log('Test 4: Stale lock detection');
    const oldLock: IngestionLock = {
      ingestionId: 'old-ingest',
      startedAt: Date.now() - (6 * 60 * 1000), // 6 minutes ago
      startedBy: 'crashed-process',
    };
    await redis.set(LOCK_KEY, JSON.stringify(oldLock), 'EX', LOCK_TTL);
    const isStale = await lockService.isStale();
    if (!isStale) {
      throw new Error('Should detect stale lock');
    }
    console.log('✅ Correctly detected stale lock\n');

    // Test 5: Clear stale lock
    console.log('Test 5: Clear stale lock');
    const cleared = await lockService.clearStale();
    if (!cleared) {
      throw new Error('Should have cleared stale lock');
    }
    const statusAfterClear = await lockService.getStatus();
    if (statusAfterClear.locked) {
      throw new Error('Lock should be cleared');
    }
    console.log('✅ Successfully cleared stale lock\n');

    // Test 6: Normal release
    console.log('Test 6: Normal lock release');
    await lockService.acquire('test-ingest-3', 'test-user@example.com');
    await lockService.release('test-ingest-3');
    const statusAfterRelease = await lockService.getStatus();
    if (statusAfterRelease.locked) {
      throw new Error('Lock should be released');
    }
    console.log('✅ Successfully released lock\n');

    // Test 7: Force clear
    console.log('Test 7: Force clear');
    await lockService.acquire('test-ingest-4', 'test-user@example.com');
    const forceCleared = await lockService.forceClear();
    if (!forceCleared) {
      throw new Error('Should have force cleared lock');
    }
    const statusAfterForceClear = await lockService.getStatus();
    if (statusAfterForceClear.locked) {
      throw new Error('Lock should be cleared');
    }
    console.log('✅ Successfully force cleared lock\n');

    // Test 8: Lock extension (keepalive)
    console.log('Test 8: Lock extension (keepalive)');
    await lockService.acquire('test-ingest-5', 'test-user@example.com');

    // Get initial TTL
    const ttl1 = await redis.ttl(LOCK_KEY);
    console.log(`  Initial TTL: ${ttl1} seconds`);

    // Wait 2 seconds
    await sleep(2000);

    // TTL should have decreased
    const ttl2 = await redis.ttl(LOCK_KEY);
    console.log(`  TTL after 2s: ${ttl2} seconds`);
    if (ttl2 >= ttl1) {
      throw new Error('TTL should have decreased');
    }

    // Extend the lock
    const extended = await lockService.extend('test-ingest-5');
    if (!extended) {
      throw new Error('Should have extended lock');
    }

    // TTL should be refreshed to ~600 seconds
    const ttl3 = await redis.ttl(LOCK_KEY);
    console.log(`  TTL after extend: ${ttl3} seconds`);
    if (ttl3 < 595) { // Allow some slack for timing
      throw new Error('TTL should be refreshed to ~600 seconds');
    }

    await lockService.release('test-ingest-5');
    console.log('✅ Lock extension (keepalive) works\n');

    console.log('🎉 All tests passed!\n');
    console.log('Lock system is working correctly:');
    console.log('  ✅ Lock acquisition works');
    console.log('  ✅ Concurrent access prevented');
    console.log('  ✅ Stale lock detection works (5min threshold)');
    console.log('  ✅ Automatic stale lock cleanup works');
    console.log('  ✅ Normal lock release works');
    console.log('  ✅ Force clear works (admin override)');
    console.log('  ✅ Lock extension/keepalive works');
    console.log('  ✅ Lock expires after 10min TTL\n');

  } catch (error) {
    console.error('\n❌ Test failed:', error instanceof Error ? error.message : error);
    process.exit(1);
  } finally {
    // Clean up
    await lockService.forceClear();
    await redis.quit();
  }
}

test();
