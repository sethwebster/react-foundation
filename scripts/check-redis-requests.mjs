import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

console.log('Checking pending requests in Redis...\n');

const pendingIds = await redis.smembers('admin:requests:pending');
console.log(`Found ${pendingIds.length} pending request IDs`);

for (const id of pendingIds) {
  const data = await redis.get(`admin:request:${id}`);
  if (data) {
    const req = JSON.parse(data);
    console.log(`  - ${req.email} (${req.status})`);
  }
}

await redis.quit();
