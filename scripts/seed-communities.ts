/**
 * Seed Communities into Redis
 * Run this script to populate Redis with initial community data
 *
 * Usage:
 *   npm run seed:communities
 *   OR
 *   npx tsx scripts/seed-communities.ts
 */

import { seedCommunities, isSeeded } from '../src/lib/redis-communities';
import { REACT_COMMUNITIES } from '../src/data/communities';

async function main() {
  console.log('🌱 Community Seeding Script');
  console.log('================================');

  // Check if already seeded
  const alreadySeeded = await isSeeded();

  if (alreadySeeded) {
    console.log('⚠️  Communities already seeded!');
    console.log('');
    console.log('To force re-seed, run:');
    console.log('  npx tsx scripts/seed-communities.ts --force');
    console.log('');

    // Check for --force flag
    const force = process.argv.includes('--force');
    if (!force) {
      process.exit(0);
    }

    console.log('🔄 Force flag detected, re-seeding...');
    const { forceSeed } = await import('../src/lib/redis-communities');
    await forceSeed(REACT_COMMUNITIES);
  } else {
    // First time seed
    await seedCommunities(REACT_COMMUNITIES);
  }

  console.log('');
  console.log('✅ Seeding complete!');
  console.log(`   ${REACT_COMMUNITIES.length} communities now in Redis`);
  console.log('');
  console.log('Communities can now be:');
  console.log('  - Fetched via /api/communities');
  console.log('  - Updated via admin APIs (coming soon)');
  console.log('  - Modified at runtime without redeploying');
  console.log('');

  process.exit(0);
}

main().catch((error) => {
  console.error('❌ Seeding failed:', error);
  process.exit(1);
});
