const Redis = require('ioredis');
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

(async () => {
  try {
    console.log('Checking /communities/start content...\n');

    // Get all chunks for /communities/start
    const allChunks = await redis.keys('chatbot:idx:*');
    const startChunks = [];

    for (const key of allChunks) {
      const chunk = await redis.hgetall(key);
      if (chunk.source === '/communities/start') {
        startChunks.push({ key, chunk });
      }
    }

    console.log(`Found ${startChunks.length} chunks for /communities/start\n`);

    for (const { key, chunk } of startChunks) {
      console.log(`Key: ${key}`);
      console.log(`Content length: ${chunk.content ? chunk.content.length : 0} chars`);
      console.log(`Content:\n${chunk.content}\n`);
      console.log('---\n');
    }

    // Also check the community-building-guide
    console.log('\nChecking /docs/getting-involved/community-building-guide...\n');

    const guideChunks = [];
    for (const key of allChunks) {
      const chunk = await redis.hgetall(key);
      if (chunk.source === '/docs/getting-involved/community-building-guide') {
        guideChunks.push({ key, chunk });
      }
    }

    console.log(`Found ${guideChunks.length} chunks for community-building-guide\n`);

    for (const { key, chunk } of guideChunks.slice(0, 2)) {
      console.log(`Key: ${key}`);
      console.log(`Content preview (first 500 chars):\n${chunk.content ? chunk.content.substring(0, 500) : 'N/A'}...\n`);
      console.log('---\n');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await redis.quit();
  }
})();
