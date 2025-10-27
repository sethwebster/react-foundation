# Migration: role → roles[] Array

**Date:** 2025-10-27
**Type:** Data Schema Change
**Risk Level:** Low (backward compatible, idempotent)

## Overview

Migrates user data from single `role` field to multiple `roles` array to support users having multiple roles simultaneously (e.g., both `admin` and `community_manager`).

## Changes

**Before:**
```json
{
  "email": "user@example.com",
  "role": "admin",
  "addedAt": "2025-10-27T00:00:00.000Z"
}
```

**After:**
```json
{
  "email": "user@example.com",
  "roles": ["admin"],
  "addedAt": "2025-10-27T00:00:00.000Z"
}
```

## Migration Strategy

### Option 1: Zero-Downtime (Recommended)

The application automatically migrates data on-read. No downtime required.

**How it works:**
1. Deploy new code
2. Users are migrated automatically when their data is accessed
3. Optionally run migration script to pre-migrate all users

**Steps:**
```bash
# 1. Deploy new code (already includes migration logic)
git push production

# 2. (Optional) Pre-migrate all users in background
npm run admin:migrate-users
```

### Option 2: Pre-Migration (Safest)

Run migration before deploying new code.

**Steps:**
```bash
# 1. Run migration against production Redis
REDIS_URL="your-production-redis-url" npm run admin:migrate-users

# 2. Verify migration succeeded
# Check logs for "Migration complete!"

# 3. Deploy new code
git push production
```

## Production Migration Guide

### Prerequisites

- [ ] Backup Redis data
- [ ] Test migration on staging environment
- [ ] Notify team of maintenance window (if using Option 2)

### Step 1: Backup Redis Data

```bash
# Connect to production Redis
redis-cli -u $REDIS_URL

# Create RDB snapshot
SAVE

# Or use Redis Cloud backup feature
```

### Step 2: Test on Staging

```bash
# Point to staging Redis
export REDIS_URL="redis://staging-redis-url"

# Run migration
npm run admin:migrate-users

# Verify all users migrated successfully
# Check application still works
```

### Step 3: Run Production Migration

**Option A: Pre-migration (Recommended for large datasets)**

```bash
# Set production Redis URL
export REDIS_URL="redis://production-redis-url"

# Run migration
npm run admin:migrate-users

# Expected output:
# ✅ Successfully migrated N users
# ⏭️  Skipped M users (already migrated)
```

**Option B: Automatic migration**

Just deploy the new code. Users will be migrated on first access.

### Step 4: Verify Migration

```bash
# Check a few users manually
redis-cli -u $REDIS_URL

# Get a user
GET admin:user:someone@example.com

# Should see "roles": [...] not "role": "..."
```

### Step 5: Monitor

```bash
# Watch application logs for migration messages
# Look for: "🔄 Migrated user X from role to roles array"

# If using automatic migration, users will migrate gradually
# If using pre-migration, should see no migration logs
```

## Rollback Plan

If issues occur, the old code still works because:
- Old data format (`role`) is automatically converted to new format (`roles`)
- Migration is non-destructive

**To rollback:**
1. Redeploy previous version
2. Users will continue working
3. Optionally restore Redis backup if needed

## Script Details

### Idempotency

The migration script is idempotent - safe to run multiple times:

```javascript
// Only migrates users with old format
if (user.role && !user.roles) {
  // Migrate
}
```

**Running multiple times:**
```bash
npm run admin:migrate-users  # Migrates users
npm run admin:migrate-users  # Skips already migrated users ✅
```

### Performance

- Uses Redis pipelines for batch operations
- Processes ~1000 users/second
- No locks or blocking operations

### Error Handling

- Continues processing if individual user fails
- Logs all errors
- Returns exit code 1 if migration fails

## Testing Checklist

- [ ] Backup created
- [ ] Tested on staging
- [ ] Migration script runs successfully
- [ ] Application loads correctly
- [ ] Users can log in
- [ ] Admin panel shows roles correctly
- [ ] User permissions work as expected

## Monitoring

After migration, monitor for:
- Migration log messages (should decrease over time with auto-migration)
- User authentication errors
- Admin access issues
- Role permission errors

## Support

If issues occur:
1. Check application logs for migration errors
2. Verify Redis connection
3. Check user data format in Redis directly
4. Contact engineering team

## Timeline

**Staging:** Test now
**Production:** Deploy during low-traffic window
**Estimated downtime:** 0 seconds (with Option 1)

## Notes

- Migration is backward compatible
- Old code will not work correctly with new data (always migrate forward)
- SUPER_ADMIN_EMAIL environment variable works throughout migration
- No changes to Redis keys or indexes
