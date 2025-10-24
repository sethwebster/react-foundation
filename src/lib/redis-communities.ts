/**
 * Redis Community Storage
 * Stores communities in Redis with runtime modification support
 */

import type { Community } from '@/types/community';

const COMMUNITIES_KEY = 'communities:all';
const SEEDED_FLAG_KEY = 'communities:seeded';
// No TTL - communities persist permanently in Redis (not cache, it's the database!)

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

    // Store communities as JSON (no expiry - permanent)
    await redis.set(
      COMMUNITIES_KEY,
      JSON.stringify(communities)
    );

    // Set seeded flag (no expiry - permanent)
    await redis.set(SEEDED_FLAG_KEY, 'true');

    console.log(`✅ Successfully seeded ${communities.length} communities`);
  } catch (error) {
    console.error('❌ Failed to seed communities:', error);
    throw error;
  }
}

/**
 * Get all communities from Redis
 * Returns null if not seeded or Redis unavailable
 */
export async function getCommunitiesFromRedis(): Promise<Community[] | null> {
  try {
    const redis = await getRedis();
    if (!redis) return null;

    const data = await redis.get(COMMUNITIES_KEY);
    if (!data) return null;

    const communities = JSON.parse(data);
    console.log(`✅ Loaded ${communities.length} communities from Redis`);
    return communities;
  } catch (error) {
    console.error('❌ Error reading communities from Redis:', error);
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
 */
export async function addCommunity(community: Community): Promise<void> {
  try {
    const redis = await getRedis();
    if (!redis) throw new Error('Redis not available');

    const communities = await getCommunities();

    // Check for duplicate
    if (communities.find((c) => c.id === community.id)) {
      throw new Error(`Community ${community.id} already exists`);
    }

    // Add new community
    communities.push(community);

    // Save back to Redis (permanent)
    await redis.set(
      COMMUNITIES_KEY,
      JSON.stringify(communities)
    );

    console.log(`✅ Added community: ${community.name}`);
  } catch (error) {
    console.error('❌ Failed to add community:', error);
    throw error;
  }
}

/**
 * Update an existing community in Redis
 */
export async function updateCommunity(
  communityId: string,
  updates: Partial<Community>
): Promise<void> {
  try {
    const redis = await getRedis();
    if (!redis) throw new Error('Redis not available');

    const communities = await getCommunities();
    const index = communities.findIndex((c) => c.id === communityId);

    if (index === -1) {
      throw new Error(`Community ${communityId} not found`);
    }

    // Merge updates
    communities[index] = {
      ...communities[index],
      ...updates,
      id: communityId, // Prevent ID changes
      updated_at: new Date().toISOString(),
    };

    // Save back to Redis (permanent)
    await redis.set(
      COMMUNITIES_KEY,
      JSON.stringify(communities)
    );

    console.log(`✅ Updated community: ${communities[index].name}`);
  } catch (error) {
    console.error('❌ Failed to update community:', error);
    throw error;
  }
}

/**
 * Delete a community from Redis
 */
export async function deleteCommunity(communityId: string): Promise<void> {
  try {
    const redis = await getRedis();
    if (!redis) throw new Error('Redis not available');

    const communities = await getCommunities();
    const filtered = communities.filter((c) => c.id !== communityId);

    if (filtered.length === communities.length) {
      throw new Error(`Community ${communityId} not found`);
    }

    // Save back to Redis (permanent)
    await redis.set(
      COMMUNITIES_KEY,
      JSON.stringify(filtered)
    );

    console.log(`✅ Deleted community: ${communityId}`);
  } catch (error) {
    console.error('❌ Failed to delete community:', error);
    throw error;
  }
}

/**
 * Force re-seed (for admin use)
 */
export async function forceSeed(communities: Community[]): Promise<void> {
  try {
    const redis = await getRedis();
    if (!redis) throw new Error('Redis not available');

    // Clear seeded flag
    await redis.del(SEEDED_FLAG_KEY);

    // Re-seed
    await seedCommunities(communities);

    console.log('✅ Force re-seed completed');
  } catch (error) {
    console.error('❌ Force re-seed failed:', error);
    throw error;
  }
}
