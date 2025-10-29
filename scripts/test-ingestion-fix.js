const Redis = require('ioredis');
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

(async () => {
  try {
    console.log('Testing ingestion fix...\n');

    // 1. Check current index
    const currentIndex = await redis.get('vector-store:current-index');
    console.log('Current index before cleanup:', currentIndex);

    // 2. List all indexes
    const allIndexes = await redis.call('FT._LIST');
    console.log('All RediSearch indexes:', allIndexes);

    // 3. Clean up old chunks
    console.log('\nCleaning up old test data...');
    const oldChunks = await redis.keys('chatbot:idx:*');
    console.log(`Found ${oldChunks.length} old chunk keys`);

    if (oldChunks.length > 0) {
      const deleted = await redis.del(...oldChunks);
      console.log(`Deleted ${deleted} old chunk keys`);
    }

    // 4. Clear current index pointer to force fresh start
    await redis.del('vector-store:current-index');
    console.log('Cleared current index pointer');

    console.log('\n✅ Ready for fresh ingestion!');
    console.log('Run the ingestion from: http://localhost:3000/admin/ingest-full');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await redis.quit();
  }
})();
