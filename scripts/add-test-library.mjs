#!/usr/bin/env node

/**
 * Add a test library to the pending queue
 * Usage: node scripts/add-test-library.mjs
 */

import Redis from 'ioredis';

const client = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

const testLibrary = {
  owner: 'testuser',
  repo: 'awesome-react-hooks',
  installationId: 12345,
  installedAt: new Date().toISOString(),
  githubUrl: 'https://github.com/testuser/awesome-react-hooks',
  description: 'A collection of awesome React hooks for everyday use',
  stars: 1234,
  topics: ['react', 'hooks', 'typescript', 'frontend'],
  language: 'TypeScript',
};

const key = `${testLibrary.owner}/${testLibrary.repo}`;

async function main() {
  try {
    // Add to pending
    await client.hset(
      'ris:libraries:pending',
      key,
      JSON.stringify(testLibrary)
    );

    console.log('✅ Added test library to pending queue:');
    console.log(`   ${key}`);
    console.log(`   ${testLibrary.description}`);
    console.log(`   ⭐ ${testLibrary.stars.toLocaleString()} stars`);
    console.log('\n👉 Visit http://localhost:3000/admin/data to see it!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

main();
