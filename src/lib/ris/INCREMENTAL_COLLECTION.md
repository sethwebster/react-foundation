# Incremental Collection Architecture

## Overview

The RIS system now uses **true incremental collection** where historical data is fetched once and stored permanently, with only new activity collected on subsequent runs.

## Key Principle

**Historical data is immutable** - PRs, issues, and commits from the past never change, so we never re-fetch them.

## Architecture

### Two-Layer Storage

**Layer 1: Activity Data** (Permanent Cache)
- Redis key: `ris:activity:{owner}:{repo}`
- Contains: ALL historical PRs, issues, commits, releases
- TTL: **NEVER EXPIRES** (historical data is immutable)
- Updated: Append-only (merge new items with existing)

**Layer 2: Calculated Metrics** (Derived Data)
- Redis key: `ris:metrics:{owner}:{repo}`
- Contains: RIS metrics calculated from activity data
- TTL: 7 days
- Updated: Recalculated from activity data with 12-month rolling window

### Data Flow

```
First Run (Cold Start):
┌─────────────────────────────────────────┐
│ 1. Fetch ALL PRs (all time)             │
│ 2. Fetch ALL issues (all time)          │
│ 3. Fetch ALL commits (sampled)          │
│ 4. Fetch ALL releases                   │
│ 5. Store in ris:activity (permanent)    │
│ 6. Calculate metrics (12-mo window)     │
│ 7. Store in ris:metrics (7 day TTL)     │
└─────────────────────────────────────────┘

Daily Run (Incremental):
┌─────────────────────────────────────────┐
│ 1. Load cached activity data            │
│ 2. Fetch only NEW items since last run  │
│ 3. Merge new + cached (dedupe by ID)    │
│ 4. Update ris:activity (permanent)      │
│ 5. Recalculate metrics (12-mo window)   │
│ 6. Update ris:metrics (7 day TTL)       │
└─────────────────────────────────────────┘
```

## API Usage

### First Run (Per Library)
- **Fetch all PRs**: ~5-50 API calls (depends on repo size)
- **Fetch all issues**: ~5-50 API calls
- **Fetch commits**: ~10 API calls (sampled to 1000)
- **Fetch releases**: ~1-5 API calls
- **Basic stats**: ~1 API call
- **Total**: ~22-106 calls per library
- **54 libraries**: ~1,200-5,700 total calls ✅ Fits in 3 tokens!

### Daily Run (Per Library)
- **Fetch new PRs**: ~1 API call (maybe 0-10 new PRs/day)
- **Fetch new issues**: ~1 API call
- **Fetch new commits**: ~1 API call
- **Fetch new releases**: ~1 API call
- **Basic stats**: ~1 API call (always fetch - cheap)
- **Total**: ~5 calls per library
- **54 libraries**: ~270 total calls ✅ Fits in 1 token!

**98% reduction** in API usage after first run!

## File Structure

```
src/lib/ris/
├── activity-types.ts           # Activity data interfaces
├── activity-calculator.ts      # Convert activity → metrics
├── activity-merge.ts           # Merge cached + new activity
└── collectors/
    └── github-activity-collector.ts  # Fetch all/incremental activity
```

## Key Functions

### `GitHubActivityCollector`

```typescript
// Cold start: Fetch ALL history
fetchAllActivity(owner, repo, libraryName)
  → Returns LibraryActivityData with all PRs, issues, commits, releases

// Incremental: Fetch only new items
fetchIncrementalActivity(owner, repo, since)
  → Returns ActivityDelta with new items since timestamp
```

### `mergeActivityData()`

```typescript
// Combine cached + new, deduplicate by ID
mergeActivityData(cached, delta, updatedStats)
  → Returns merged LibraryActivityData
```

### `calculateMetricsFromActivity()`

```typescript
// Apply 12-month window and calculate RIS metrics
calculateMetricsFromActivity(activity, window?)
  → Filters activity to last 12 months
  → Returns LibraryRawMetrics
```

## Collection Modes

### Incremental (Default)
```bash
curl -X POST http://localhost:3000/api/ris/collect
```

- Checks for cached activity
- If exists: Fetch only new items since last update
- If missing: Full collection
- **Speed**: 1-2 minutes after first run

### Force Refresh
```bash
curl -X POST "http://localhost:3000/api/ris/collect?force=true"
```

- Ignores all caches
- Fetches all history fresh
- Use quarterly or when testing
- **Speed**: 10-15 minutes

## Benefits

✅ **Massive API savings** - 98% reduction after first run
✅ **True incremental** - Only fetch what's new
✅ **Historical preservation** - Old PRs/issues never re-fetched
✅ **Automatic rolling window** - 12-month window moves forward naturally
✅ **No data loss** - All historical data available for analysis
✅ **Fast daily runs** - 1-2 minutes instead of 10+ minutes

## Cache Strategy

| Data Type | Redis Key | TTL | Why |
|-----------|-----------|-----|-----|
| Activity data | `ris:activity:{owner}:{repo}` | Never | Historical data is immutable |
| Calculated metrics | `ris:metrics:{owner}:{repo}` | 7 days | Can be recalculated from activity |
| Quarterly allocation | `ris:allocation:{period}` | 7 days | Changes quarterly |

## Data Pruning

To keep Redis memory reasonable, we prune activity data:
- Keep last **3 years** of activity
- More than enough for 12-month rolling window
- Pruned automatically during merge

## Testing

```bash
# First run (will take ~10 min with 3 tokens)
curl -X POST http://localhost:3000/api/ris/collect

# Wait 1 minute, then run again (should be ~30 seconds)
sleep 60
redis-cli DEL ris:collection_lock
curl -X POST http://localhost:3000/api/ris/collect

# Should see:
# {
#   "collected": 0,     ← No full collections
#   "cached": 54,       ← All 54 used incremental
#   "mode": "incremental"
# }
```

## Migration

Since no real data has been collected yet, there's nothing to migrate! The new system will work from the first run.

## Future Enhancements

- Store PR review comments for better response time calculation
- Track issue triage labels for triage latency
- Fetch PR file changes for better quality scoring
- Implement true "import mentions" by scanning popular repos
