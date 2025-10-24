/**
 * Update communities.ts from JSON
 * Overwrites src/data/communities.ts with data from normalized-meetups-data.json
 * Then clears Redis so auto-seed will reload the new data
 */

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

async function main() {
  console.log('📝 Updating communities.ts from JSON...');
  console.log('');

  // Read the import script output
  const { execSync } = require('child_process');
  const output = execSync('npx tsx scripts/import-json-communities.ts 2>&1', { encoding: 'utf-8' });

  console.log(output);

  // Now clear Redis through the app
  console.log('');
  console.log('🗑️  Clearing Redis cache...');

  // Delete the seeded flag so auto-seed triggers
  const { getRedisClient } = await import('../src/lib/redis');
  try {
    const redis = getRedisClient();
    await redis.del('communities:seeded');
    await redis.del('communities:all');
    console.log('✅ Redis cache cleared!');
  } catch (err) {
    console.log('⚠️  Redis not available - will auto-seed on next API call');
  }

  console.log('');
  console.log('✅ Complete! Refresh your browser to see 43 communities');
}

main().catch(console.error);
