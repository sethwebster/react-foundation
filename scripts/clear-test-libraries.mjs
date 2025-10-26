#!/usr/bin/env node

/**
 * Clear all test library approval data
 * Usage: node scripts/clear-test-libraries.mjs
 */

import Redis from 'ioredis';

const client = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

async function main() {
  try {
    console.log('🧹 Clearing library approval data...');

    const deleted = await Promise.all([
      client.del('ris:libraries:pending'),
      client.del('ris:libraries:approved'),
      client.del('ris:libraries:rejected'),
    ]);

    const total = deleted.reduce((sum, count) => sum + count, 0);

    console.log(`✅ Cleared ${total} keys`);
    console.log('   - ris:libraries:pending');
    console.log('   - ris:libraries:approved');
    console.log('   - ris:libraries:rejected');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

main();
