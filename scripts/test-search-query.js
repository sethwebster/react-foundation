const Redis = require('ioredis');
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

(async () => {
  try {
    // Search for chunks related to "starting a community"
    const allChunks = await redis.keys('chatbot:idx:*');

    console.log(`Total chunks: ${allChunks.length}\n`);

    // Look for chunks with community guide content
    console.log('Searching for community guide content...\n');

    // Check for specific sources
    const sources = new Set();
    for (const key of allChunks) {
      const chunk = await redis.hgetall(key);
      if (chunk.source) {
        sources.add(chunk.source);
      }
    }

    console.log(`Unique sources (${sources.size}):`);
    const sortedSources = Array.from(sources).sort();
    sortedSources.forEach(s => console.log(`  ${s}`));

    // Look for /communities/start specifically
    console.log('\n\nSearching for /communities/start...');
    const startSource = sortedSources.find(s => s.includes('/communities/start') || s.includes('community-building'));

    if (startSource) {
      console.log(`Found: ${startSource}`);

      // Get chunks for this source
      const chunks = [];
      for (const key of allChunks) {
        const chunk = await redis.hgetall(key);
        if (chunk.source === startSource) {
          chunks.push({ key, chunk });
        }
      }

      console.log(`\nChunks for this source: ${chunks.length}`);
      for (const { key, chunk } of chunks.slice(0, 3)) {
        console.log(`\n${key}`);
        console.log(`  Content: ${chunk.content ? chunk.content.substring(0, 200) : 'N/A'}...`);
      }
    } else {
      console.log('❌ No /communities/start content found!');
      console.log('\nLooking for any community-building related sources:');
      const communityBuildingSources = sortedSources.filter(s =>
        s.includes('community') || s.includes('start') || s.includes('guide')
      );
      communityBuildingSources.forEach(s => console.log(`  ${s}`));
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await redis.quit();
  }
})();
