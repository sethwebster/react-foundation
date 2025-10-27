/**
 * Seed Admin Test Users
 * Populates Redis with a baseline set of admin/user accounts and pending access requests.
 *
 * Usage:
 *   npm run admin:seed-test-users               # seed baseline data (skips existing)
 *   npm run admin:seed-test-users -- --refresh  # reset previously seeded data first
 *   npm run admin:seed-test-users -- --extra-pending=5  # add more pending requests
 */

import crypto from 'node:crypto';
import Redis from 'ioredis';

const redisUrl = process.env.REDIS_URL;

if (!redisUrl) {
  console.error('❌ REDIS_URL environment variable not set');
  process.exit(1);
}

const dashIndex = process.argv.indexOf('--');
const rawArgs =
  dashIndex >= 0
    ? process.argv.slice(dashIndex + 1)
    : process.argv.slice(2);

const refreshRequested = rawArgs.some(arg => arg === '--refresh' || arg === '--force');
const extraPendingArg = rawArgs.find(arg => arg.startsWith('--extra-pending='));
const extraPendingCount = extraPendingArg
  ? Number.parseInt(extraPendingArg.split('=')[1] ?? '0', 10) || 0
  : refreshRequested
    ? 1
    : 0;

if (rawArgs.length > 0) {
  console.log(`⚙️  Seeding options: ${rawArgs.join(' ')}`);
}

const redis = new Redis(redisUrl);
const SEEDED_MARKER = 'seed-admin-test-users';

const baseUsers = [
  { email: 'ada.lovelace@example.com', roles: ['admin'] },
  { email: 'grace.hopper@example.com', roles: ['admin'] },
  { email: 'katherine.johnson@example.com', roles: ['community_manager'] },
  { email: 'margaret.hamilton@example.com', roles: ['library_manager'] },
  { email: 'annie.easley@example.com', roles: ['user'] },
];

const basePendingRequests = [
  {
    email: 'charles.babbage@example.com',
    message: 'Excited to explore the platform and collaborate with the community.',
  },
  {
    email: 'dorothy.vaughan@example.com',
    message: 'I lead a local React meetup and would love early access for our organizers.',
  },
  {
    email: 'mary.jackson@example.com',
    message: 'Looking forward to joining future access waves—please keep me posted!',
  },
];

const BASE_USER_EMAILS = baseUsers.map(user => user.email.toLowerCase().trim());
const BASE_REQUEST_EMAILS = basePendingRequests.map(req => req.email.toLowerCase().trim());

async function removeUserByEmail(email) {
  const normalized = email.toLowerCase().trim();
  const key = `admin:user:${normalized}`;
  const exists = await redis.exists(key);

  if (!exists) {
    return false;
  }

  await redis.del(key);
  await redis.srem('admin:users:all', normalized);
  await redis.srem('admin:users:admins', normalized);
  return true;
}

async function removeRequestByEmail(email) {
  if (!email) return false;
  const normalized = email.toLowerCase().trim();
  const emailKey = `admin:request:email:${normalized}`;
  const existingId = await redis.get(emailKey);
  let removedId = null;

  if (existingId) {
    await redis.del(`admin:request:${existingId}`);
    await redis.srem('admin:requests:pending', existingId);
    await redis.srem('admin:requests:all', existingId);
    removedId = existingId;
  }

  const removedFromPending = await redis.srem('admin:requests:pending', normalized);
  const removedFromAll = await redis.srem('admin:requests:all', normalized);
  await redis.del(emailKey);
  if (!removedId && (removedFromPending || removedFromAll)) {
    removedId = normalized;
  }
  return removedId;
}

async function cleanupSeededData() {
  console.log('🧹 Refresh mode enabled — clearing previously seeded users and requests...\n');

  for (const email of BASE_USER_EMAILS) {
    const removed = await removeUserByEmail(email);
    if (removed) {
      console.log(`   🗑️  Removed base seeded user ${email}`);
    }
  }

  const seededUserEmails = await redis.smembers('admin:users:all');
  for (const email of seededUserEmails) {
    const key = `admin:user:${email}`;
    const raw = await redis.get(key);
    if (!raw) continue;

    try {
      const record = JSON.parse(raw);
      if (record?.addedBy === SEEDED_MARKER) {
        await removeUserByEmail(email);
        console.log(`   🗑️  Removed seeded user ${email}`);
      }
    } catch {
      // Ignore malformed records
    }
  }

  for (const email of BASE_REQUEST_EMAILS) {
    const removedId = await removeRequestByEmail(email);
    if (removedId) {
      console.log(`   🗑️  Removed base pending request ${removedId} (${email})`);
    }
  }

  const seededRequestIds = await redis.smembers('admin:requests:all');
  for (const id of seededRequestIds) {
    const key = `admin:request:${id}`;
    const raw = await redis.get(key);
    if (!raw) continue;

    try {
      const record = JSON.parse(raw);
      if (record?.seededBy === SEEDED_MARKER) {
        const removedId = await removeRequestByEmail(record.email ?? '');
        if (removedId) {
          console.log(`   🗑️  Removed seeded request ${removedId} (${record.email ?? 'unknown'})`);
        }
      }
    } catch {
      // Ignore malformed records
    }
  }

  console.log('\n🔄 Ready to reseed fresh data...\n');
}

function createRandomPending(count) {
  return Array.from({ length: count }, (_, idx) => {
    const token = crypto.randomUUID().replace(/-/g, '').slice(0, 8);
    return {
      email: `pending.user.${token}@example.com`,
      message: `Looking forward to joining an upcoming access wave (ref ${token}, slot ${idx + 1}).`,
    };
  });
}

async function seedUsers() {
  console.log('🚀 Seeding admin test users into Redis...\n');

  for (const user of baseUsers) {
    const normalizedEmail = user.email.toLowerCase().trim();
    const key = `admin:user:${normalizedEmail}`;
    const exists = await redis.exists(key);

    if (exists && !refreshRequested) {
      console.log(`⏭️  Skipping ${normalizedEmail} (already present)`);
      continue;
    }

    if (exists && refreshRequested) {
      console.log(`🔁 Recreating ${normalizedEmail}`);
    }

    const userRecord = {
      email: normalizedEmail,
      roles: user.roles,
      addedAt: new Date().toISOString(),
      addedBy: SEEDED_MARKER,
    };

    await redis.set(key, JSON.stringify(userRecord));
    await redis.sadd('admin:users:all', normalizedEmail);

    if (user.roles.includes('admin')) {
      await redis.sadd('admin:users:admins', normalizedEmail);
    } else {
      await redis.srem('admin:users:admins', normalizedEmail);
    }

    console.log(`✅ Seeded ${normalizedEmail} (${user.roles.join(', ')})`);
  }
}

async function seedPendingRequests() {
  console.log('\n📥 Seeding pending access requests...\n');

  const extraRequests = createRandomPending(extraPendingCount);
  const allRequests = [...basePendingRequests, ...extraRequests];

  for (const request of allRequests) {
    const normalizedEmail = request.email.toLowerCase().trim();
    const emailKey = `admin:request:email:${normalizedEmail}`;
    const existingId = await redis.get(emailKey);

    if (existingId) {
      if (!refreshRequested) {
        console.log(`⏭️  Skipping request for ${normalizedEmail} (already present as ${existingId})`);
        continue;
      }

      console.log(`🔁 Replacing existing request ${existingId} (${normalizedEmail})`);
      await redis.del(`admin:request:${existingId}`);
      await redis.srem('admin:requests:pending', existingId);
      await redis.srem('admin:requests:all', existingId);
      await redis.del(emailKey);
    }

    const id = crypto.randomUUID().replace(/-/g, '');
    const requestRecord = {
      id,
      email: normalizedEmail,
      message: request.message,
      requestedAt: new Date().toISOString(),
      status: 'pending',
      seededBy: SEEDED_MARKER,
    };

    await redis.set(`admin:request:${id}`, JSON.stringify(requestRecord));
    await redis.sadd('admin:requests:pending', id);
    await redis.sadd('admin:requests:all', id);
    await redis.set(emailKey, id);

    console.log(`✅ Seeded pending request ${id} (${normalizedEmail})`);
  }

  if (extraRequests.length > 0) {
    console.log(`\n➕ Added ${extraRequests.length} additional random pending request(s).`);
  }
}

async function reportSummary() {
  const pendingIds = await redis.smembers('admin:requests:pending');
  const allIds = await redis.smembers('admin:requests:all');
  const sampleIds = pendingIds.slice(0, 5);

  console.log('\n📊 Redis Summary');
  console.log(`   Pending Requests: ${pendingIds.length}`);
  console.log(`   Total Requests (pending + processed): ${allIds.length}`);
  console.log(`   Pending IDs: ${sampleIds.length ? sampleIds.join(', ') : 'none'}`);

  if (sampleIds.length > 0) {
    const pipeline = redis.pipeline();
    for (const id of sampleIds) {
      pipeline.get(`admin:request:${id}`);
    }
    const results = await pipeline.exec();
    results.forEach(([, value]) => {
      if (!value) return;
      try {
        const parsed = JSON.parse(value);
        console.log(
          `   • ${parsed.email} (status: ${parsed.status}, requestedAt: ${parsed.requestedAt})`
        );
      } catch {
        // ignore parse errors
      }
    });
  }
}

async function seedUsersAndRequests() {
  try {
    if (refreshRequested) {
      await cleanupSeededData();
    }

    await seedUsers();
    await seedPendingRequests();
    await reportSummary();

    console.log('\n✨ Done! Test users and pending requests are ready.');
    if (!refreshRequested) {
      console.log('\n💡 Tip: use "--refresh" to reset previously seeded data before recreating it.');
    }
    if (extraPendingCount === 0) {
      console.log('   Need more pending requests? Try "--extra-pending=5".');
    }
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding test data:', error);
    process.exit(1);
  } finally {
    await redis.quit();
  }
}

seedUsersAndRequests();
