/**
 * Bootstrap Admin User
 * Creates initial admin user in Redis
 * Usage: node --env-file=.env scripts/bootstrap-admin.mjs your@email.com
 */

import Redis from 'ioredis';

const email = process.argv[2];

if (!email) {
  console.error('❌ Usage: node --env-file=.env scripts/bootstrap-admin.mjs your@email.com');
  process.exit(1);
}

const redisUrl = process.env.REDIS_URL;

if (!redisUrl) {
  console.error('❌ REDIS_URL environment variable not set');
  process.exit(1);
}

const redis = new Redis(redisUrl);

async function bootstrap() {
  try {
    const normalizedEmail = email.toLowerCase().trim();

    const user = {
      email: normalizedEmail,
      role: 'admin',
      addedAt: new Date().toISOString(),
      addedBy: 'bootstrap-script',
    };

    // Store user
    await redis.set(`admin:user:${normalizedEmail}`, JSON.stringify(user));

    // Add to sets
    await redis.sadd('admin:users:all', normalizedEmail);
    await redis.sadd('admin:users:admins', normalizedEmail);

    console.log(`✅ Admin user created: ${normalizedEmail}`);
    console.log('   You can now sign in and access /admin/users');

    // Migrate existing ALLOWED_USERS if present
    const allowedUsers = process.env.ALLOWED_USERS;
    if (allowedUsers) {
      console.log('\n📦 Migrating existing ALLOWED_USERS...');

      const emails = allowedUsers.split(',').map(e => e.trim()).filter(Boolean);

      for (const userEmail of emails) {
        const normalized = userEmail.toLowerCase();

        // Skip if already added
        const exists = await redis.sismember('admin:users:all', normalized);
        if (exists) {
          console.log(`   ⏭️  ${normalized} already exists`);
          continue;
        }

        const migratedUser = {
          email: normalized,
          role: 'user',
          addedAt: new Date().toISOString(),
          addedBy: 'env-migration',
        };

        await redis.set(`admin:user:${normalized}`, JSON.stringify(migratedUser));
        await redis.sadd('admin:users:all', normalized);

        console.log(`   ✅ Migrated ${normalized} as user`);
      }

      console.log('\n✨ Migration complete!');
      console.log('   You can now remove ALLOWED_USERS from .env');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

bootstrap();
