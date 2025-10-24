/**
 * Auto-Seed on Startup
 * Automatically seeds Redis with initial data if not already seeded
 */

import { isSeeded, seedCommunities } from './redis-communities';
import { REACT_COMMUNITIES } from '@/data/communities';

let seedingInProgress = false;
let seedingComplete = false;

/**
 * Auto-seed communities if not already seeded
 * Safe to call multiple times (idempotent)
 */
export async function autoSeedCommunities(): Promise<void> {
  // Prevent concurrent seeding
  if (seedingInProgress) {
    console.log('⏳ Seeding already in progress...');
    return;
  }

  // Already completed this session
  if (seedingComplete) {
    return;
  }

  try {
    seedingInProgress = true;

    // Check if seeded
    const alreadySeeded = await isSeeded();

    if (alreadySeeded) {
      console.log('✅ Communities already seeded in Redis');
      seedingComplete = true;
      return;
    }

    // Not seeded - seed now
    console.log('🌱 Auto-seeding communities on startup...');
    await seedCommunities(REACT_COMMUNITIES);
    console.log(`✅ Auto-seeded ${REACT_COMMUNITIES.length} communities`);

    seedingComplete = true;
  } catch (error) {
    console.error('❌ Auto-seed failed:', error);
    console.warn('⚠️ App will continue but communities may not load');
    console.warn('⚠️ Run manually: npm run seed:communities');
  } finally {
    seedingInProgress = false;
  }
}

/**
 * Initialize all data on app startup
 */
export async function initializeData(): Promise<void> {
  console.log('🚀 Initializing React Foundation data...');

  await autoSeedCommunities();

  // Future: Add other data initialization here
  // - Educators
  // - RIS library data
  // - etc.

  console.log('✅ Data initialization complete');
}
