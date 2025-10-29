const Redis = require('ioredis');
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

(async () => {
  try {
    // Check current index (correct key)
    const currentIndex = await redis.get('vector-store:current-index');
    console.log('Current index:', currentIndex);

    if (!currentIndex) {
      console.log('ERROR: No current index set!');

      // Try to find any chatbot keys
      const chatbotKeys = await redis.keys('chatbot:*');
      const vectorStoreKeys = await redis.keys('vector-store:*');
      const allKeys = [...chatbotKeys, ...vectorStoreKeys];
      console.log('\nChatbot keys:', chatbotKeys.length);
      console.log('Vector store keys:', vectorStoreKeys.length);

      // Look for index metadata (correct key pattern)
      const indexMeta = allKeys.filter(k => k.startsWith('vector-store:index:'));
      console.log('Index metadata keys:', indexMeta);

      // Look for chunks (they use the index prefix pattern)
      const chunkKeys = allKeys.filter(k => k.startsWith('chatbot:idx:'));
      console.log('Chunk keys:', chunkKeys.length);

      if (chunkKeys.length > 0) {
        console.log('Sample chunk keys:');
        chunkKeys.slice(0, 5).forEach(k => console.log('  ', k));

        // Extract index names (pattern: chatbot:idx:chatbot:timestamp-random:)
        const indexNames = new Set();
        chunkKeys.forEach(k => {
          const match = k.match(/^chatbot:(idx:[^:]+(?::[^:]+)*?):/);
          if (match) indexNames.add(match[1]);
        });
        console.log('\nIndex names found:', Array.from(indexNames));
      }
    } else {
      // Check if index exists
      const indexPrefix = `chatbot:${currentIndex}:`;
      const chunks = await redis.keys(`${indexPrefix}*`);
      console.log(`Chunks in ${currentIndex}:`, chunks.length);

      if (chunks.length > 0) {
        // Check a sample chunk
        console.log('\nSample chunk key:', chunks[0]);
        const sample = await redis.hgetall(chunks[0]);
        console.log('All fields in chunk:', Object.keys(sample));
        console.log('Sample chunk:', {
          id: sample.id,
          source: sample.source,
          hasEmbedding: !!sample.embedding,
          embeddingLength: sample.embedding ? sample.embedding.length : 0,
          contentPreview: sample.content ? sample.content.substring(0, 100) : 'N/A',
        });
      }

      // Try to check FT.INFO
      try {
        const info = await redis.call('FT.INFO', currentIndex);
        console.log('\nIndex exists and is searchable');
      } catch (error) {
        console.log('\nIndex search error:', error.message);
      }

      // List all available indexes
      try {
        const indexList = await redis.call('FT._LIST');
        console.log('\nAll RediSearch indexes:', indexList);
      } catch (error) {
        console.log('\nCould not list indexes:', error.message);
      }
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await redis.quit();
  }
})();
