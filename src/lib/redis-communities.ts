/**
 * Redis Community Storage
 * Stores communities in Redis with runtime modification support
 * 
 * Storage Strategy:
 * - Individual communities: communities:{id} (JSON)
 * - Index set: communities:index (Redis SET of all IDs)
 * - Seeded flag: communities:seeded
 * 
 * Benefits:
 * - O(1) lookups by ID
 * - Atomic add/delete operations
 * - Efficient pagination
 * - No need to load all communities for single operations
 */

import type { Community } from '@/types/community';

const COMMUNITIES_INDEX_KEY = 'communities:index';
const COMMUNITY_KEY_PREFIX = 'communities:';
const SEEDED_FLAG_KEY = 'communities:seeded';

function getCommunityKey(id: string): string {
  return `${COMMUNITY_KEY_PREFIX}${id}`;
}

/**
 * Get Redis client (lazy load to avoid import errors)
 */
async function getRedis() {
  try {
    const { getRedisClient } = await import('./redis');
    return getRedisClient();
  } catch {
    return null;
  }
}

/**
 * Check if communities have been seeded
 */
export async function isSeeded(): Promise<boolean> {
  try {
    const redis = await getRedis();
    if (!redis) return false;

    const flag = await redis.get(SEEDED_FLAG_KEY);
    return flag === 'true';
  } catch {
    return false;
  }
}

/**
 * Seed communities into Redis from initial data file
 * Migrates from old format if needed, or seeds fresh
 */
export async function seedCommunities(communities: Community[]): Promise<void> {
  try {
    const redis = await getRedis();
    if (!redis) {
      console.warn('⚠️ Redis not available, cannot seed communities');
      return;
    }

    // Check if already seeded
    if (await isSeeded()) {
      console.log('✅ Communities already seeded, skipping');
      return;
    }

    console.log(`🌱 Seeding ${communities.length} communities into Redis...`);

    // Use pipeline for atomic batch operations
    const pipeline = redis.pipeline();

    // Store each community in its own key
    const ids: string[] = [];
    for (const community of communities) {
      const key = getCommunityKey(community.id);
      pipeline.set(key, JSON.stringify(community));
      ids.push(community.id);
    }

    // Create index set with all IDs
    if (ids.length > 0) {
      pipeline.sadd(COMMUNITIES_INDEX_KEY, ...ids);
    }

    // Set seeded flag
    pipeline.set(SEEDED_FLAG_KEY, 'true');

    await pipeline.exec();

    console.log(`✅ Successfully seeded ${communities.length} communities`);
  } catch (error) {
    console.error('❌ Failed to seed communities:', error);
    throw error;
  }
}

/**
 * Get all communities from Redis
 * Returns null if not seeded or Redis unavailable
 * 
 * For large datasets, consider using getCommunitiesPaginated instead
 */
export async function getCommunitiesFromRedis(): Promise<Community[] | null> {
  try {
    const redis = await getRedis();
    if (!redis) return null;

    // Check if old format exists and migrate if needed
    const oldKey = 'communities:all';
    const oldDataExists = await redis.exists(oldKey);
    const indexExists = await redis.exists(COMMUNITIES_INDEX_KEY);
    
    // If old format exists but index doesn't, migrate
    if (oldDataExists && !indexExists) {
      console.log('🔄 Old format detected, migrating to new format...');
      const migrated = await migrateFromOldFormat();
      if (migrated) {
        return migrated;
      }
    }

    // Get all community IDs from index
    const ids = await redis.smembers(COMMUNITIES_INDEX_KEY);
    if (ids.length === 0) {
      // No communities found in either format
      return null;
    }

    // Fetch all communities in parallel
    const keys = ids.map(id => getCommunityKey(id));
    const values = await Promise.all(keys.map(key => redis.get(key)));

    const communities = values
      .filter((v): v is string => v !== null)
      .map(v => JSON.parse(v) as Community);

    console.log(`✅ Loaded ${communities.length} communities from Redis`);
    return communities;
  } catch (error) {
    console.error('❌ Error reading communities from Redis:', error);
    return null;
  }
}

/**
 * Migrate from old single-key format to new individual-key format
 * Public function so it can be called explicitly if needed
 */
export async function migrateFromOldFormat(): Promise<Community[] | null> {
  try {
    const redis = await getRedis();
    if (!redis) {
      console.error('❌ Redis not available for migration');
      return null;
    }

    // Check for old format
    const oldKey = 'communities:all';
    const oldData = await redis.get(oldKey);
    if (!oldData) {
      console.log('ℹ️ No old format data found for migration');
      return null;
    }

    console.log('🔄 Migrating communities from old format to new format...');
    const communities = JSON.parse(oldData) as Community[];

    if (communities.length === 0) {
      console.log('ℹ️ No communities to migrate');
      return null;
    }

    console.log(`   Found ${communities.length} communities to migrate`);

    // Seed using new format
    // Use batch processing for large datasets
    const batchSize = 100;
    const ids: string[] = [];

    for (let i = 0; i < communities.length; i += batchSize) {
      const batch = communities.slice(i, i + batchSize);
      const pipeline = redis.pipeline();

      for (const community of batch) {
        const key = getCommunityKey(community.id);
        pipeline.set(key, JSON.stringify(community));
        ids.push(community.id);
      }

      await pipeline.exec();
      console.log(`   Migrated batch ${Math.floor(i / batchSize) + 1} (${Math.min(i + batchSize, communities.length)}/${communities.length})`);
    }

    // Create index set with all IDs
    if (ids.length > 0) {
      // Redis SET ADD can handle large arrays, but let's batch if needed
      const indexBatchSize = 1000;
      for (let i = 0; i < ids.length; i += indexBatchSize) {
        const batch = ids.slice(i, i + indexBatchSize);
        await redis.sadd(COMMUNITIES_INDEX_KEY, ...batch);
      }
    }

    console.log(`✅ Successfully migrated ${communities.length} communities to new format`);
    console.log(`   Created ${ids.length} individual keys and index set`);

    // Optionally delete old key (uncomment to remove backup)
    // await redis.del(oldKey);
    // console.log('   Deleted old communities:all key');

    return communities;
  } catch (error) {
    console.error('❌ Migration failed:', error);
    if (error instanceof Error) {
      console.error('   Error details:', error.message, error.stack);
    }
    return null;
  }
}

/**
 * Get all communities (with fallback to seed data if needed)
 */
export async function getCommunities(): Promise<Community[]> {
  const communities = await getCommunitiesFromRedis();

  if (!communities) {
    console.warn('⚠️ No communities in Redis, returning empty array');
    console.warn('⚠️ Run seed script or trigger auto-seed on startup');
    return [];
  }

  return communities;
}

/**
 * Add a new community to Redis
 * Atomic operation - O(1) complexity
 */
export async function addCommunity(community: Community): Promise<void> {
  try {
    const redis = await getRedis();
    if (!redis) throw new Error('Redis not available');

    const key = getCommunityKey(community.id);

    // Check if already exists
    const exists = await redis.exists(key);
    if (exists) {
      throw new Error(`Community ${community.id} already exists`);
    }

    // Atomic operation: add to index and store data
    const pipeline = redis.pipeline();
    pipeline.set(key, JSON.stringify(community));
    pipeline.sadd(COMMUNITIES_INDEX_KEY, community.id);
    await pipeline.exec();

    console.log(`✅ Added community: ${community.name}`);
  } catch (error) {
    console.error('❌ Failed to add community:', error);
    throw error;
  }
}

/**
 * Update an existing community in Redis
 * Atomic operation - O(1) complexity
 */
export async function updateCommunity(
  communityId: string,
  updates: Partial<Community>
): Promise<void> {
  try {
    const redis = await getRedis();
    if (!redis) throw new Error('Redis not available');

    const key = getCommunityKey(communityId);

    // Get existing community
    const existing = await redis.get(key);
    if (!existing) {
      throw new Error(`Community ${communityId} not found`);
    }

    const community = JSON.parse(existing) as Community;

    // Merge updates
    const updated: Community = {
      ...community,
      ...updates,
      id: communityId, // Prevent ID changes
      updated_at: new Date().toISOString(),
    };

    // Atomic update
    await redis.set(key, JSON.stringify(updated));

    console.log(`✅ Updated community: ${updated.name}`);
  } catch (error) {
    console.error('❌ Failed to update community:', error);
    throw error;
  }
}

/**
 * Delete a community from Redis
 * Atomic operation - O(1) complexity
 */
export async function deleteCommunity(communityId: string): Promise<void> {
  try {
    const redis = await getRedis();
    if (!redis) throw new Error('Redis not available');

    const key = getCommunityKey(communityId);

    // Check if exists
    const exists = await redis.exists(key);
    if (!exists) {
      throw new Error(`Community ${communityId} not found`);
    }

    // Atomic deletion: remove from index and delete key
    const pipeline = redis.pipeline();
    pipeline.del(key);
    pipeline.srem(COMMUNITIES_INDEX_KEY, communityId);
    await pipeline.exec();

    console.log(`✅ Deleted community: ${communityId}`);
  } catch (error) {
    console.error('❌ Failed to delete community:', error);
    throw error;
  }
}

/**
 * Get a single community by ID
 * O(1) lookup
 */
export async function getCommunityById(id: string): Promise<Community | null> {
  try {
    const redis = await getRedis();
    if (!redis) return null;

    const key = getCommunityKey(id);
    const data = await redis.get(key);
    if (!data) return null;

    return JSON.parse(data) as Community;
  } catch (error) {
    console.error(`❌ Error reading community ${id}:`, error);
    return null;
  }
}

/**
 * Get communities with pagination
 * More efficient than loading all communities
 */
export async function getCommunitiesPaginated(
  page: number = 1,
  pageSize: number = 50
): Promise<{ communities: Community[]; total: number; page: number; pageSize: number }> {
  try {
    const redis = await getRedis();
    if (!redis) {
      return { communities: [], total: 0, page, pageSize };
    }

    // Get all IDs from index
    const allIds = await redis.smembers(COMMUNITIES_INDEX_KEY);
    const total = allIds.length;

    // Calculate pagination
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const paginatedIds = allIds.slice(start, end);

    // Fetch communities for this page
    const keys = paginatedIds.map(id => getCommunityKey(id));
    const values = await Promise.all(keys.map(key => redis.get(key)));

    const communities = values
      .filter((v): v is string => v !== null)
      .map(v => JSON.parse(v) as Community);

    return { communities, total, page, pageSize };
  } catch (error) {
    console.error('❌ Error reading paginated communities:', error);
    return { communities: [], total: 0, page, pageSize };
  }
}

/**
 * Force re-seed (for admin use)
 * Clears existing data and re-seeds with new format
 */
export async function forceSeed(communities: Community[]): Promise<void> {
  try {
    const redis = await getRedis();
    if (!redis) throw new Error('Redis not available');

    console.log('🗑️ Clearing existing communities...');

    // Get all existing IDs and delete them
    const existingIds = await redis.smembers(COMMUNITIES_INDEX_KEY);
    if (existingIds.length > 0) {
      const pipeline = redis.pipeline();
      for (const id of existingIds) {
        pipeline.del(getCommunityKey(id));
      }
      pipeline.del(COMMUNITIES_INDEX_KEY);
      await pipeline.exec();
    }

    // Clear old format if it exists
    await redis.del('communities:all');

    // Clear seeded flag
    await redis.del(SEEDED_FLAG_KEY);

    // Re-seed with new format
    await seedCommunities(communities);

    console.log('✅ Force re-seed completed');
  } catch (error) {
    console.error('❌ Force re-seed failed:', error);
    throw error;
  }
}
