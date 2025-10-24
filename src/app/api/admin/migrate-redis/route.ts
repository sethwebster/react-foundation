/**
 * Redis Migration API
 * Migrates all data from an old Redis instance to the new one
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { UserManagementService } from '@/lib/admin/user-management-service';
import Redis from 'ioredis';
import { getRedisClient } from '@/lib/redis';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

interface MigrationProgress {
  status: 'running' | 'completed' | 'failed';
  progress: number;
  total: number;
  currentKey?: string;
  migratedKeys: number;
  skippedKeys: number;
  failedKeys: number;
  errors: string[];
  logs: string[];
  startedAt: string;
  completedAt?: string;
}

// Store migration progress in memory (could be moved to Redis if needed)
const migrationProgress = new Map<string, MigrationProgress>();

export async function POST(request: Request) {
  try {
    // Check authentication and admin status
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const isAdmin = await UserManagementService.isAdmin(session.user.email);
    if (!isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const { oldRedisUrl, dryRun = false } = body;

    if (!oldRedisUrl || typeof oldRedisUrl !== 'string') {
      return NextResponse.json(
        { error: 'oldRedisUrl is required and must be a string' },
        { status: 400 }
      );
    }

    // Generate migration ID
    const migrationId = `migration-${Date.now()}`;

    // Initialize progress tracking
    migrationProgress.set(migrationId, {
      status: 'running',
      progress: 0,
      total: 0,
      migratedKeys: 0,
      skippedKeys: 0,
      failedKeys: 0,
      errors: [],
      logs: [],
      startedAt: new Date().toISOString(),
    });

    // Start migration in background
    performMigration(migrationId, oldRedisUrl, dryRun, session.user.email).catch((error) => {
      logger.error('Migration failed:', error);
      const progress = migrationProgress.get(migrationId);
      if (progress) {
        progress.status = 'failed';
        progress.errors.push(error.message || 'Unknown error');
        progress.completedAt = new Date().toISOString();
      }
    });

    return NextResponse.json({
      migrationId,
      message: 'Migration started',
      dryRun,
    });
  } catch (error) {
    logger.error('Error starting migration:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to start migration' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    // Check authentication and admin status
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const isAdmin = await UserManagementService.isAdmin(session.user.email);
    if (!isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const migrationId = searchParams.get('migrationId');

    if (!migrationId) {
      return NextResponse.json(
        { error: 'migrationId is required' },
        { status: 400 }
      );
    }

    const progress = migrationProgress.get(migrationId);
    if (!progress) {
      return NextResponse.json(
        { error: 'Migration not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(progress);
  } catch (error) {
    logger.error('Error getting migration status:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get migration status' },
      { status: 500 }
    );
  }
}

async function performMigration(
  migrationId: string,
  oldRedisUrl: string,
  dryRun: boolean,
  userEmail: string
) {
  let oldRedis: Redis | null = null;
  let newRedis: Redis | null = null;

  // Helper to add logs to progress
  const addLog = (message: string, level: 'info' | 'warn' | 'error' = 'info') => {
    const progress = migrationProgress.get(migrationId);
    if (progress) {
      const timestamp = new Date().toLocaleTimeString();
      const icon = level === 'error' ? '❌' : level === 'warn' ? '⚠️' : 'ℹ️';
      progress.logs.push(`[${timestamp}] ${icon} ${message}`);
      // Keep only last 100 logs
      if (progress.logs.length > 100) {
        progress.logs.shift();
      }
    }
    // Also log to console
    if (level === 'error') {
      logger.error(message);
    } else if (level === 'warn') {
      logger.warn(message);
    } else {
      logger.info(message);
    }
  };

  try {
    addLog(`🚀 Starting Redis migration (${dryRun ? 'DRY RUN' : 'LIVE'}) by ${userEmail}`);

    // Connect to old Redis
    addLog('Connecting to old Redis instance...');
    oldRedis = new Redis(oldRedisUrl, {
      maxRetriesPerRequest: 3,
      retryStrategy(times) {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
    });
    addLog('✅ Connected to old Redis');

    // Connect to new Redis
    addLog('Connecting to new Redis instance...');
    newRedis = getRedisClient();
    addLog('✅ Connected to new Redis');

    // Get all keys from old Redis
    addLog('Scanning for keys in old Redis...');
    const keys = await scanAllKeys(oldRedis);
    const progress = migrationProgress.get(migrationId);
    if (!progress) throw new Error('Migration progress not found');

    progress.total = keys.length;
    addLog(`📊 Found ${keys.length} keys to migrate`);

    // Migrate each key
    addLog(`Starting migration of ${keys.length} keys...`);
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      progress.currentKey = key;
      progress.progress = i + 1;

      try {
        // Get key type
        const type = await oldRedis.type(key);

        if (dryRun) {
          addLog(`[DRY RUN] Would migrate ${type} key: ${key}`);
          progress.migratedKeys++;
          continue;
        }

        // Check if key already exists in new Redis
        const exists = await newRedis.exists(key);
        if (exists) {
          addLog(`⏭️ Skipping existing key: ${key}`, 'warn');
          progress.skippedKeys++;
          continue;
        }

        // Migrate based on type
        switch (type) {
          case 'string': {
            const value = await oldRedis.get(key);
            if (value !== null) {
              const ttl = await oldRedis.ttl(key);
              if (ttl > 0) {
                await newRedis.setex(key, ttl, value);
              } else {
                await newRedis.set(key, value);
              }
            }
            break;
          }

          case 'hash': {
            const hash = await oldRedis.hgetall(key);
            if (Object.keys(hash).length > 0) {
              await newRedis.hset(key, hash);
              const ttl = await oldRedis.ttl(key);
              if (ttl > 0) {
                await newRedis.expire(key, ttl);
              }
            }
            break;
          }

          case 'list': {
            const list = await oldRedis.lrange(key, 0, -1);
            if (list.length > 0) {
              await newRedis.rpush(key, ...list);
              const ttl = await oldRedis.ttl(key);
              if (ttl > 0) {
                await newRedis.expire(key, ttl);
              }
            }
            break;
          }

          case 'set': {
            const set = await oldRedis.smembers(key);
            if (set.length > 0) {
              await newRedis.sadd(key, ...set);
              const ttl = await oldRedis.ttl(key);
              if (ttl > 0) {
                await newRedis.expire(key, ttl);
              }
            }
            break;
          }

          case 'zset': {
            const zset = await oldRedis.zrange(key, 0, -1, 'WITHSCORES');
            if (zset.length > 0) {
              // Convert array to score-member pairs
              const pairs: (string | number)[] = [];
              for (let j = 0; j < zset.length; j += 2) {
                pairs.push(parseFloat(zset[j + 1]), zset[j]);
              }
              await newRedis.zadd(key, ...pairs);
              const ttl = await oldRedis.ttl(key);
              if (ttl > 0) {
                await newRedis.expire(key, ttl);
              }
            }
            break;
          }

          default:
            addLog(`⚠️ Unknown key type: ${type} for key: ${key}`, 'warn');
            progress.skippedKeys++;
            continue;
        }

        progress.migratedKeys++;
        // Only log every 10th key to avoid spam, or if it's the last key
        if (i % 10 === 0 || i === keys.length - 1) {
          addLog(`✅ Migrated ${type} key: ${key} (${i + 1}/${keys.length})`);
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        addLog(`❌ Failed to migrate key ${key}: ${errorMsg}`, 'error');
        progress.failedKeys++;
        progress.errors.push(`${key}: ${errorMsg}`);
      }
    }

    // Mark as completed
    progress.status = 'completed';
    progress.completedAt = new Date().toISOString();
    progress.currentKey = undefined;

    addLog(`✅ Migration completed! Total: ${progress.total}, Migrated: ${progress.migratedKeys}, Skipped: ${progress.skippedKeys}, Failed: ${progress.failedKeys}`);

  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Migration failed:', error);
    const progress = migrationProgress.get(migrationId);
    if (progress) {
      progress.status = 'failed';
      progress.errors.push(errorMsg);
      progress.completedAt = new Date().toISOString();
      const timestamp = new Date().toLocaleTimeString();
      progress.logs.push(`[${timestamp}] ❌ Migration failed: ${errorMsg}`);
    }
    throw error;
  } finally {
    // Clean up old Redis connection
    if (oldRedis) {
      await oldRedis.quit();
    }
  }
}

/**
 * Scan all keys in Redis using SCAN to avoid blocking
 */
async function scanAllKeys(redis: Redis): Promise<string[]> {
  const keys: string[] = [];
  let cursor = '0';

  do {
    const result = await redis.scan(cursor, 'COUNT', 100);
    cursor = result[0];
    keys.push(...result[1]);
  } while (cursor !== '0');

  return keys;
}
