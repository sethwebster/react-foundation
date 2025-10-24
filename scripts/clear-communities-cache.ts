/**
 * Clear Communities Cache
 * Clears seeded flag to force re-seed
 */

import { forceSeed } from '../src/lib/redis-communities';
import { REACT_COMMUNITIES } from '../src/data/communities';

async function main() {
  console.log('🗑️  Clearing communities cache and re-seeding...');
  await forceSeed(REACT_COMMUNITIES);
  console.log('✅ Cache cleared and re-seeded!');
}

main().catch(console.error);
