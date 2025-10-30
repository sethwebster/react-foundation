# RIS Pipeline Reliability Fix

## Problem Identified

The library data collection pipeline had an inconsistency between two collection paths:

1. **Bulk Collection** (`/api/ris/collect` - "Start Incremental Collection" / "Force Full Refresh" buttons):
   - Used `MetricsAggregator.collectLibraryActivity()` directly
   - Successfully collected and cached activity/metrics data
   - **BUT**: Never initialized or updated `collection-state` Redis keys
   - Result: Data was collected but UI couldn't see it

2. **Individual Library Kickoff** (`/api/admin/ris/retry` - "Kick Off Data Collection" button in library detail modal):
   - Used `collectBaselineForLibrary()` which properly tracks per-source state
   - Updated `collection-state` with granular progress
   - Result: UI showed accurate completion status

### Why This Caused Confusion

The library detail modal checks `/api/admin/ris/status?type=library&owner=...&repo=...` which queries `collection-state`. Since bulk collection never wrote to this state:

- Bulk runs would collect data successfully ✅
- But modal would show "Not Started" ❌
- Only after manually clicking "Kick Off Data Collection" would state be updated
- Then modal would show "Complete" with full details ✅

## Root Cause

The bulk collection route (`src/app/api/ris/collect/route.ts`) was optimized for throughput but bypassed the state tracking system designed for:
- Resumable collection (survives API failures)
- Per-source progress tracking
- Retry scheduling with exponential backoff
- UI status visibility

## Solution Implemented

Updated `/api/ris/collect` route to initialize and update `collection-state` for each library:

1. **Initialize state** before collection (if missing or on force refresh)
2. **Mark all sources as completed** after successful collection via aggregator
3. **Mark sources as failed** if collection errors occur
4. **Preserve existing completed state** for incremental updates (unless force refresh)

### Changes Made

**File**: `src/app/api/ris/collect/route.ts`

- Added imports for collection-state functions
- Initialize state before each library collection
- After successful collection, mark all 8 data sources as completed:
  - `github_basic`, `github_prs`, `github_issues`, `github_commits`, `github_releases`
  - `npm_metrics`, `cdn_metrics`, `ossf_metrics`
- On collection failure, mark pending/in-progress sources as failed
- Handle force refresh by resetting state before repopulating

**File**: `src/lib/ris/baseline-collection.ts`

- Updated `refreshLibrary()` function to also update collection-state
- Added same state tracking logic as bulk route for consistency
- Returns collection-state in result for better observability
- Ensures all collection paths maintain consistent state tracking

## Result

Now both collection paths are consistent:

✅ **Bulk Collection**: Updates state → UI shows correct status  
✅ **Individual Kickoff**: Already worked, continues to work  
✅ **Reliable Pipeline**: State tracking enables resumable collection and retries  
✅ **UI Accuracy**: Library detail modal reflects actual collection status  

## Next Steps for Reliability

To make the RIS pipeline fully reliable:

1. **Scheduled Jobs**:
   - Nightly incremental refresh: Call `/api/ris/collect?force=false`
   - Frequent retry worker: Call `/api/admin/ris/retry` (no body) to process failed collections

2. **Monitoring**:
   - Check `/api/admin/ris/status?type=failed` for failed collections
   - Review collection-state completion rates

3. **Webhook Integration**:
   - Keep `/api/ris/process-webhooks` active for real-time updates
   - Triggers incremental refresh on push/PR/issue events

4. **Future Enhancement**:
   - Consider adding granular progress tracking within aggregator (currently it collects all sources atomically, but could track each source independently for better resumability)

## Technical Notes

- The aggregator collects all sources in one atomic operation (for efficiency)
- Collection-state tracks each source independently (for resilience)
- After aggregator succeeds, we mark all sources complete (aggregator already succeeded for all)
- After aggregator fails, we mark pending sources as failed (will retry via scheduler)

## Files Changed

1. **`src/app/api/ris/collect/route.ts`** - Added collection-state tracking to bulk collection route
2. **`src/lib/ris/baseline-collection.ts`** - Updated `refreshLibrary()` function for consistency
3. **`RIS_PIPELINE_FIX.md`** - This documentation file

### Verified Consistent Paths

✅ **`/api/admin/libraries/approve`** - Already uses `collectBaselineForLibrary()` (correct)  
✅ **`/api/admin/ris/retry`** - Already uses `collectBaselineForLibrary()` (correct)  
✅ **`/api/ris/collect`** - Now updates collection-state (fixed)  
✅ **`refreshLibrary()`** - Now updates collection-state (fixed for consistency)  
✅ **Webhook processor** - Intentionally doesn't update state (real-time updates only, requires baseline first)

