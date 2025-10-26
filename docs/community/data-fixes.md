# Fixing Stale Community Data (React Bangalore URL Issue)

## Problem

The chatbot is showing incorrect Meetup URLs for communities like React Bangalore:
- **Correct URL** (in `src/data/communities.ts`): `https://www.meetup.com/reactjs-bangalore/`
- **What chatbot sees**: `https://www.meetup.com/react-bangalore/`

## Root Cause

**Redis has stale community data** from before the URLs were corrected.

Flow of the issue:
```
1. communities.ts has correct data ✅
2. Redis has old/wrong data from earlier seed ❌
3. Website reads from Redis (shows wrong URL) ❌
4. Crawler crawls website (sees wrong URL in HTML) ❌
5. Vector store gets wrong URL ❌
6. Chatbot answers with wrong URL ❌
```

## Solution: Reset + Re-Ingest

### Step 1: Reset Communities in Redis

1. Go to: `/admin/reset`
2. Click "Reset Communities"
3. Confirm the action
4. Wait for completion (page will reload)

This clears Redis and re-seeds from `communities.ts` with the correct URLs.

### Step 2: Re-Ingest Content

1. Go to: `/admin/ingest`
2. Configure:
   - Check "Delete Old Index After Swap" ✓
   - Set max pages (0 = unlimited)
   - Excluded paths: `/api,/admin,/_next`
3. Click "Start Ingestion"
4. Watch progress through all phases:
   - 🕷️ Crawling Site
   - 📄 Extracting Content
   - 📁 Ingesting Files (public-context)
   - 🧠 Generating Embeddings
   - 🔄 Swapping Index
   - 🗑️ Cleaning Up

### Step 3: Verify Fix

1. Visit: `/admin/ingest/inspect`
2. Check sample chunks
3. Look for React Bangalore content
4. Verify URL shows: `https://www.meetup.com/reactjs-bangalore/` ✅

### Step 4: Test Chatbot

Ask the chatbot:
```
"What's the Meetup URL for React Bangalore?"
```

Should respond with the correct URL.

## Why This Happens

### Data Flow:
```
communities.ts (source of truth)
    ↓
Redis (runtime storage) ← Can get out of sync!
    ↓
Website (reads from Redis)
    ↓
Crawler (sees what website shows)
    ↓
Vector Store (stores what crawler sees)
    ↓
Chatbot (answers from vector store)
```

### When Redis Gets Stale:
- Manual edits to communities.ts
- Running old seed scripts
- Importing from external sources
- Merging community data

### Prevention:
1. Always reset communities after editing communities.ts
2. Run ingestion after resetting communities
3. Or use the seed script: `npm run seed:communities`

## Commands Reference

### Reset Communities (Clear Redis)
```bash
# Via UI
Visit: /admin/reset

# Via API
curl -X POST http://localhost:3000/api/admin/reset-communities \
  -H "Cookie: your-session-cookie"
```

### Re-Ingest Content
```bash
# Via UI
Visit: /admin/ingest

# Via API (with token)
curl -X POST http://localhost:3000/api/admin/ingest \
  -H "Authorization: Bearer your-token" \
  -d '{"deleteOldIndex": true, "maxPages": 0}'
```

## Checking Data Sources

### Check Source File:
```bash
grep -A 5 "React Bangalore" src/data/communities.ts | grep meetup_url
```

### Check Redis:
```bash
redis-cli GET communities:all | jq '.[] | select(.name == "React Bangalore") | .meetup_url'
```

### Check Vector Store:
Visit `/admin/ingest/inspect` and search for "Bangalore" in content previews.

## Other Affected Communities

Check if other communities also have URL mismatches:

```bash
# List all communities with meetup URLs
grep -B 10 "meetup_url" src/data/communities.ts | grep "name"
```

Compare with what the chatbot knows.

## Future Prevention

### Automated Sync:
- Add a nightly cron job to reset communities if communities.ts changed
- Or use file modification timestamps to detect changes
- Or make Redis read-through cache (fallback to communities.ts)

### CI/CD Integration:
```yaml
# .github/workflows/sync-communities.yml
on:
  push:
    paths:
      - 'src/data/communities.ts'

jobs:
  sync:
    - Reset Redis communities
    - Trigger re-ingestion
```

## Summary

The fix is simple:
1. **Reset Redis** → Re-seeds from communities.ts with correct data
2. **Re-Ingest** → Crawls fresh data, updates vector store
3. **Verify** → Check inspector and test chatbot

This is a one-time fix unless communities.ts changes again.
