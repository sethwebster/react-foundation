# Blue-Green Vector Database Deployment

## Overview

The ingestion system uses **blue-green deployment** to ensure **zero downtime** during content re-ingestion. The chatbot always has access to a complete, working vector index.

## How It Works

### Traditional Approach (❌ Has Downtime)
```
1. Delete old data
2. Start crawling      ← Chatbot has NO DATA (downtime)
3. Generate embeddings ← Chatbot has NO DATA (downtime)
4. Store in Redis      ← Chatbot has NO DATA (downtime)
5. Chatbot can use new data
```

### Blue-Green Approach (✅ Zero Downtime)
```
1. Create NEW index (idx:chatbot:2025-01-24T12-30-45-abc123)
2. Crawl into NEW index       ← Chatbot still uses OLD index
3. Generate embeddings         ← Chatbot still uses OLD index
4. Store in NEW index          ← Chatbot still uses OLD index
5. Atomic swap (instant!)      ← Chatbot switches to NEW index
6. Delete OLD index (optional) ← Cleanup
```

## Key Components

### 1. Current Index Pointer
**Redis Key**: `vector-store:current-index`
**Value**: Name of the currently active index

```redis
GET vector-store:current-index
→ "idx:chatbot:2025-01-24T12-30-45-abc123"
```

The chatbot always reads this key to find which index to search.

### 2. Index Metadata
**Redis Keys**: `vector-store:index:<index-name>`
**Value**: JSON metadata about each index

```json
{
  "indexName": "idx:chatbot:2025-01-24T12-30-45-abc123",
  "prefix": "chatbot:idx:chatbot:2025-01-24T12-30-45-abc123:",
  "createdAt": "2025-01-24T12:30:45.123Z",
  "chunkCount": 487,
  "status": "active"
}
```

Statuses:
- `building`: Currently being built
- `active`: Currently in use by chatbot
- `inactive`: Old index, no longer in use

### 3. Index Naming
Each index gets a unique name:
```
idx:chatbot:<timestamp>-<random>

Examples:
idx:chatbot:2025-01-24T12-30-45-abc123
idx:chatbot:2025-01-24T18-15-22-xyz789
```

### 4. Index Prefix
Each index stores data under its own prefix:
```
chatbot:<index-name>:<chunk-id>

Examples:
chatbot:idx:chatbot:2025-01-24T12-30-45-abc123:home_chunk_0
chatbot:idx:chatbot:2025-01-24T12-30-45-abc123:about_chunk_0
```

This allows multiple indices to coexist without conflicts.

## Ingestion Flow

### Phase 1: Preparation
```typescript
// Get current active index
oldIndex = await getCurrentIndexName(redis)
// → "idx:chatbot:2025-01-24T12-00-00-old123"

// Generate new index name
newIndex = generateIndexName()
// → "idx:chatbot:2025-01-24T18-00-00-new456"

// Create new index with unique prefix
await createVectorIndex(redis, newIndex, prefix, dimensions)
```

### Phase 2: Build (Old Index Still Active)
```typescript
// Crawl site
crawlResults = await crawl()

// Extract and chunk
chunks = await extractAndChunk(crawlResults)

// Generate embeddings and store in NEW index
for (chunk of chunks) {
  embedding = await createEmbedding(chunk.content)
  await upsertChunk(redis, chunk.id, payload, newPrefix)
  //                                          ^^^^^^^^
  //                              Stores in NEW index prefix
}
```

At this point:
- ✅ Old index is ACTIVE (chatbot uses this)
- 🔨 New index is BUILDING (chatbot doesn't see it yet)
- 💬 Chatbot continues working normally

### Phase 3: Atomic Swap
```typescript
// Swap current index pointer (atomic operation)
await swapToNewIndex(redis, newIndex)

// This does:
// 1. SET vector-store:current-index = newIndex
// 2. Mark newIndex status = "active"
// 3. Mark oldIndex status = "inactive"
```

Result:
- ✅ New index is now ACTIVE
- ⏸️ Old index is INACTIVE
- 💬 Chatbot instantly switches to new index

### Phase 4: Cleanup (Optional)
```typescript
if (deleteOldIndex) {
  await deleteIndex(redis, oldIndex)
  // Drops the index and deletes all chunk data
}
```

## Atomic Swap Details

The swap is atomic because:

1. **Single Redis command**: `SET vector-store:current-index <new-name>`
2. **No lock needed**: Redis operations are atomic
3. **Instant switchover**: Next chatbot query uses new index
4. **No race conditions**: Redis guarantees consistency

Even if 1000 chatbot requests are happening:
- Before swap: All use old index
- After swap: All use new index
- No request gets confused or fails

## Rollback Capability

If something goes wrong with the new index:

### Manual Rollback
```typescript
// Swap back to old index (if not deleted)
await setCurrentIndex(redis, oldIndexName)
```

### Via Admin UI
1. Go to `/admin/ingest/inspect`
2. See all indices with status
3. Could add "Activate" button next to inactive indices

## Storage Efficiency

### With Old Index Deletion:
```
Before Ingestion: 500 chunks in old index
During Build:     500 old + 520 new = 1020 chunks (brief spike)
After Swap:       520 chunks in new index (old deleted)
```

### Without Deletion (Keep History):
```
Ingestion 1: 500 chunks
Ingestion 2: 500 + 520 = 1020 chunks
Ingestion 3: 1020 + 487 = 1507 chunks
```

You can keep old indices for:
- Rollback capability
- A/B testing
- Historical comparison

## Production Configuration

### GitHub Actions (Auto-Delete)
```yaml
"deleteOldIndex": true  # Clean up automatically
"maxPages": 0           # Unlimited crawling
```

### Manual Ingestion (Keep Old)
```typescript
{
  deleteOldIndex: false,  // Keep for rollback
  maxPages: 0
}
```

## Monitoring

### Check Active Index:
```bash
# Via Redis CLI
redis-cli GET vector-store:current-index

# Via API
curl https://your-domain.com/api/admin/ingest/inspect \
  -H "Authorization: Bearer your-token"
```

### List All Indices:
```bash
# Via Redis CLI
redis-cli KEYS "vector-store:index:*"

# Via Admin UI
Visit: /admin/ingest/inspect
```

### Check Index Size:
```bash
# Count chunks in current index
redis-cli --scan --pattern "chatbot:idx:*" | wc -l
```

## Cost Optimization

### Strategy 1: Incremental Updates
Instead of full re-crawl:
- Track last modified dates
- Only re-crawl changed pages
- Update specific chunks

### Strategy 2: Scheduled Off-Peak
```yaml
on:
  schedule:
    - cron: '0 2 * * 0'  # Weekly on Sunday at 2 AM
```

### Strategy 3: Smart Triggers
Only re-ingest when content actually changes:
```yaml
on:
  push:
    paths:
      - 'src/app/**/*.tsx'
      - 'src/app/**/*.mdx'
      - 'content/**'
```

## Comparison to Other Approaches

### Database Migrations (Similar Pattern)
```
Blue-Green: New DB → Migrate → Swap → Delete old
Vector Store: New index → Build → Swap → Delete old
```

### Load Balancer (Similar Pattern)
```
Blue-Green: New servers → Deploy → Switch traffic → Terminate old
Vector Store: New index → Build → Switch queries → Delete old
```

### Benefits:
- ✅ Zero downtime
- ✅ Instant rollback
- ✅ No partial state
- ✅ Production-proven pattern

## Advanced: Multi-Index Search

Future enhancement - search across multiple indices:

```typescript
// Search active + previous index for better recall
const activeIndex = await getCurrentIndexName(redis);
const allIndices = await listAllIndices(redis);
const searchIndices = [activeIndex, ...allIndices.slice(0, 1)];

// Combine results
const results = await Promise.all(
  searchIndices.map(idx => searchSimilarInIndex(redis, idx, embedding))
);
```

## Testing

### Test Locally:
```bash
# Run ingestion 1
npm run dev
Visit: /admin/ingest
Start ingestion

# Check inspector - note active index name
Visit: /admin/ingest/inspect

# Run ingestion 2 (without deleting old)
Start another ingestion with "Delete Old Index" unchecked

# Check inspector - should see 2 indices
Visit: /admin/ingest/inspect
```

### Verify Zero Downtime:
```bash
# While ingestion is running, test chatbot
# It should continue working normally with old data
# After swap, it should instantly have new data
```

## Summary

**Before**: Clear → Build → Downtime
**After**: Build NEW → Swap → Zero Downtime

This is production-grade deployment strategy used by major platforms. Your chatbot never experiences downtime during content updates! 🎉
