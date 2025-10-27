#!/usr/bin/env node

/**
 * Migration Script: role → roles[]
 * Migrates all users in Redis from old 'role' field to new 'roles' array
 *
 * Usage:
 *   npm run admin:migrate-users              # Run migration
 *   npm run admin:migrate-users -- --dry-run # Preview changes without saving
 *   npm run admin:migrate-users -- --force   # Skip confirmation prompt
 */

import Redis from 'ioredis';
import readline from 'readline';

const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');
const isForce = args.includes('--force');

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
const redis = new Redis(redisUrl);

function askConfirmation(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.toLowerCase().startsWith('y'));
    });
  });
}

async function migrateUsers() {
  console.log('🔄 Starting user migration: role → roles[]\n');

  if (isDryRun) {
    console.log('🔍 DRY RUN MODE - No changes will be saved\n');
  }

  console.log(`📍 Redis: ${redisUrl}\n`);

  try {
    // Get all user emails
    const emails = await redis.smembers('admin:users:all');
    console.log(`Found ${emails.length} users to check\n`);

    if (emails.length === 0) {
      console.log('✅ No users found. Migration complete.');
      await redis.quit();
      return;
    }

    // Batch fetch all users
    const keys = emails.map(email => `admin:user:${email.toLowerCase()}`);
    const values = await redis.mget(...keys);

    let migratedCount = 0;
    let skippedCount = 0;
    const pipeline = redis.pipeline();

    for (let i = 0; i < values.length; i++) {
      const data = values[i];
      if (!data) {
        console.log(`⚠️  Skipping ${emails[i]} - no data found`);
        continue;
      }

      try {
        const user = JSON.parse(data);

        // Check if migration needed
        if (user.role && !user.roles) {
          // Migrate
          user.roles = [user.role];
          delete user.role;
          pipeline.set(keys[i], JSON.stringify(user));
          console.log(`✅ Migrating ${user.email}: "${user.roles[0]}" → ["${user.roles[0]}"]`);
          migratedCount++;
        } else if (user.roles) {
          console.log(`⏭️  Skipping ${user.email} - already has roles array`);
          skippedCount++;
        } else {
          console.log(`⚠️  Skipping ${user.email} - no role or roles field`);
          skippedCount++;
        }
      } catch (error) {
        console.error(`❌ Error processing ${emails[i]}:`, error.message);
      }
    }

    // Execute all migrations
    if (migratedCount > 0) {
      await pipeline.exec();
      console.log(`\n✅ Successfully migrated ${migratedCount} users`);
    } else {
      console.log('\n✅ No users needed migration');
    }

    console.log(`⏭️  Skipped ${skippedCount} users (already migrated or no data)`);
    console.log('\n🎉 Migration complete!');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await redis.quit();
  }
}

migrateUsers();
