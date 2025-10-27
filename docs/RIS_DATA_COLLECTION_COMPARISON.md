# RIS Data Collection: Webhook vs Collector Comparison

## Executive Summary

The RIS system uses **TWO complementary data collection approaches**:

1. **Batch Collectors** (GitHub API + NPM API): Full historical data collection
2. **Real-Time Webhooks** (GitHub App): Incremental updates for approved libraries

**Key Finding**: Batch collectors provide the **initial baseline**, webhooks provide **real-time updates** to keep data fresh.

---

## Data Requirements for RIS Scoring

### Component 1: Ecosystem Footprint (30%)
**Metrics Needed:**
- ✅ `stars` - GitHub stargazer count
- ✅ `forks` - GitHub fork count
- ✅ `downloads_12mo` - NPM downloads (last 12 months)
- ✅ `dependents_count` - Number of packages depending on this library
- ✅ `typescript_support` - Has TypeScript definitions

### Component 2: Contribution Quality (25%)
**Metrics Needed:**
- ✅ `pr_count_12mo` - Pull requests opened in last 12 months
- ✅ `pr_merged_12mo` - Pull requests merged in last 12 months
- ✅ `issue_count_12mo` - Issues opened in last 12 months
- ✅ `issues_closed_12mo` - Issues closed in last 12 months
- ✅ `issue_resolution_rate` - Closed / Opened ratio
- ✅ `median_pr_response_hours` - How fast PRs get first response
- ✅ `median_issue_response_hours` - How fast issues get first response
- ✅ `pr_points` - Weighted PR score based on size/complexity

### Component 3: Maintainer Health (20%)
**Metrics Needed:**
- ✅ `active_maintainers` - Contributors with 12+ commits/year
- ✅ `unique_contribs_12mo` - Unique contributors in last 12 months
- ✅ `release_count_12mo` - Releases published in last 12 months
- ✅ `median_release_days` - Days between releases
- ✅ `top_contributor_share` - % of commits by top contributor
- ✅ `last_commit_date` - Most recent commit timestamp

### Component 4: Community Benefit (15%)
**Metrics Needed:**
- ✅ `downloads_last_month` - Recent adoption trend
- ✅ `issue_resolution_rate` - Support responsiveness
- ✅ `median_issue_response_hours` - Support speed
- ⚠️ `documentation_quality` - **(NOT AUTOMATED YET)**
- ⚠️ `tutorial_count` - **(NOT AUTOMATED YET)**

### Component 5: Mission Alignment (10%)
**Metrics Needed:**
- ⚠️ Manual scoring - **(ADMIN REVIEW)**
- Topics/tags (e.g., "react", "hooks", "components")
- License compatibility
- Foundation values alignment

---

## Data Collection: Batch Collectors

### GitHub Collector (`GitHubCollector`)

**What it collects:**

| Metric | How | Time Range |
|--------|-----|------------|
| `stars` | GraphQL `stargazerCount` | Current |
| `forks` | GraphQL `forkCount` | Current |
| `is_archived` | GraphQL `isArchived` | Current |
| `last_commit_date` | GraphQL `defaultBranchRef.target.committedDate` | Current |
| `unique_contribs_12mo` | REST API `/repos/{owner}/{repo}/contributors` | Last 12 months |
| `active_maintainers` | Count contributors with 12+ commits | Last 12 months |
| `top_contributor_share` | % of commits by #1 contributor | Last 12 months |
| `pr_count_12mo` | REST API `/repos/{owner}/{repo}/pulls` | Last 12 months |
| `pr_merged_12mo` | Count merged PRs | Last 12 months |
| `median_pr_response_hours` | Time from PR open to first comment | Last 12 months |
| `issue_count_12mo` | REST API `/repos/{owner}/{repo}/issues` | Last 12 months |
| `issues_opened_12mo` | Count issues created | Last 12 months |
| `issues_closed_12mo` | Count issues closed | Last 12 months |
| `median_issue_response_hours` | Time from issue open to first comment | Last 12 months |
| `release_count_12mo` | REST API `/repos/{owner}/{repo}/releases` | Last 12 months |
| `median_release_days` | Days between consecutive releases | Last 12 months |

**Strengths:**
- ✅ Complete historical data (12 months)
- ✅ Calculated metrics (medians, rates, shares)
- ✅ Works for any repository (no app install required)

**Limitations:**
- ❌ Rate limited (5,000 requests/hour)
- ❌ Batch only (no real-time updates)
- ❌ Expensive (multiple API calls per library)

### NPM Collector (`NPMCollector`)

**What it collects:**

| Metric | Source API | Time Range |
|--------|-----------|------------|
| `downloads_12mo` | npmjs.org `/downloads` | Last 12 months |
| `downloads_last_month` | npmjs.org `/downloads` | Last 30 days |
| `package_name` | registry.npmjs.org | Current |
| `latest_version` | registry.npmjs.org | Current |
| `license` | registry.npmjs.org | Current |
| `typescript_support` | registry.npmjs.org (types field) | Current |
| `dependents_count` | npms.io API | Current (approx) |

**Strengths:**
- ✅ Fast (NPM APIs are not heavily rate-limited)
- ✅ Ecosystem footprint data (downloads, dependents)
- ✅ Works for any public npm package

**Limitations:**
- ❌ Only covers npm packages (not GitHub-only libraries)
- ❌ No real-time updates

---

## Data Collection: Real-Time Webhooks

### GitHub App Webhooks

**What events are captured:**

| Event Type | Data Captured | Updates Metric |
|------------|---------------|----------------|
| `installation` | App installed/uninstalled | Tracks which repos are approved |
| `installation_repositories` | Repos added/removed | Tracks which repos are approved |
| `push` | Commits (sha, author, date, message) | `last_commit_date`, contributor tracking |
| `pull_request` | PR created/updated/merged | `pr_count_12mo`, `pr_merged_12mo`, `pr_response_hours` |
| `issues` | Issue opened/closed/labeled | `issue_count_12mo`, `issues_closed_12mo`, `issue_resolution_rate` |
| `issue_comment` | Comments on issues/PRs | `median_pr_response_hours`, `median_issue_response_hours` |
| `release` | Release published | `release_count_12mo`, `median_release_days` |

**How it works:**
1. Webhook event arrives → Queued in Redis (`ris:webhook:queue`)
2. Processor fetches existing activity data from Redis cache
3. Event updates the activity arrays (commits, PRs, issues, releases)
4. Metrics recalculated from updated activity data
5. New metrics cached in Redis

**Strengths:**
- ✅ Real-time updates (no delay)
- ✅ No rate limit concerns
- ✅ Incremental (only processes new events)
- ✅ Keeps data fresh without full re-collection

**Limitations:**
- ❌ **Requires initial baseline** (must run batch collector first)
- ❌ Only works for approved libraries with app installed
- ❌ Doesn't capture NPM data (downloads, dependents)
- ❌ Can't backfill historical data before app installation

---

## Recommended Workflow

### Phase 1: Initial Collection (Batch Collectors)
**When:** New library approved
**What happens:**
1. Admin approves library in approval queue
2. System runs `GitHubCollector.collectMetrics(owner, repo)`
3. System runs `NPMCollector.collectMetrics(packageName)`
4. Complete 12-month historical data collected
5. Metrics calculated and cached in Redis
6. **Baseline established** ✅

### Phase 2: Real-Time Updates (Webhooks)
**When:** Activity happens on approved library
**What happens:**
1. GitHub sends webhook event (push, PR, issue, etc.)
2. Event queued in Redis
3. Webhook processor updates activity arrays incrementally
4. Metrics recalculated from updated activity
5. Fresh metrics cached in Redis
6. **Data stays current** ✅

### Phase 3: Periodic Refresh (Batch Collectors)
**When:** Weekly/monthly (configurable)
**Why:**
- Backfill any missed webhook events
- Update NPM download stats (no webhooks for this)
- Recalculate derived metrics (medians, rates)
- Ensure accuracy despite webhook delivery failures

---

## Data Coverage Matrix

| Metric | Batch (GitHub) | Batch (NPM) | Webhooks | Notes |
|--------|----------------|-------------|----------|-------|
| **Ecosystem Footprint** |
| stars | ✅ | ❌ | ❌ | Batch only (no webhook event) |
| forks | ✅ | ❌ | ❌ | Batch only (no webhook event) |
| downloads_12mo | ❌ | ✅ | ❌ | NPM only (no webhook) |
| dependents_count | ❌ | ✅ | ❌ | NPM only (no webhook) |
| typescript_support | ❌ | ✅ | ❌ | NPM only |
| **Contribution Quality** |
| pr_count_12mo | ✅ | ❌ | ✅ | Batch: full history, Webhooks: incremental |
| pr_merged_12mo | ✅ | ❌ | ✅ | Batch: full history, Webhooks: incremental |
| issue_count_12mo | ✅ | ❌ | ✅ | Batch: full history, Webhooks: incremental |
| issues_closed_12mo | ✅ | ❌ | ✅ | Batch: full history, Webhooks: incremental |
| median_pr_response_hours | ✅ | ❌ | ✅ | Batch: historical, Webhooks: updates |
| median_issue_response_hours | ✅ | ❌ | ✅ | Batch: historical, Webhooks: updates |
| pr_points | ✅ | ❌ | ✅ | Calculated from PR size |
| **Maintainer Health** |
| active_maintainers | ✅ | ❌ | 🟡 | Batch: accurate, Webhooks: can track |
| unique_contribs_12mo | ✅ | ❌ | 🟡 | Batch: accurate, Webhooks: can track |
| release_count_12mo | ✅ | ❌ | ✅ | Batch: full history, Webhooks: incremental |
| median_release_days | ✅ | ❌ | ✅ | Calculated from release dates |
| top_contributor_share | ✅ | ❌ | 🟡 | Batch: accurate, Webhooks: can estimate |
| last_commit_date | ✅ | ❌ | ✅ | Updated on push events |
| **Community Benefit** |
| downloads_last_month | ❌ | ✅ | ❌ | NPM only |
| issue_resolution_rate | ✅ | ❌ | ✅ | Calculated from issues |
| **Mission Alignment** |
| topics/tags | ✅ | ❌ | ❌ | From GitHub repo metadata |
| license | ❌ | ✅ | ❌ | From NPM package.json |

**Legend:**
- ✅ Fully supported
- 🟡 Partially supported (less accurate than batch)
- ❌ Not supported

---

## Critical Gaps

### 1. NPM Data Has No Real-Time Updates
**Gap:** Download counts, dependent counts only available via batch collection

**Solution:** Run NPM collector on a schedule (daily/weekly)

### 2. Webhooks Can't Backfill Historical Data
**Gap:** If app installed today, we only get data from today forward

**Solution:** Always run batch collector first to establish 12-month baseline

### 3. Some Metrics Only Accurate via Batch
**Gap:** `active_maintainers`, `unique_contribs_12mo`, `top_contributor_share` require full commit history analysis

**Solution:** Periodic batch refresh to recalculate these metrics accurately

---

## Recommended Implementation Strategy

### For New Libraries (Approval Flow)
```typescript
// When library is approved:
1. Run GitHubCollector.collectMetrics(owner, repo)
2. Run NPMCollector.collectMetrics(packageName)
3. Calculate initial RIS score
4. Cache activity + metrics in Redis
5. Track installation (enables webhooks)
```

### For Ongoing Updates (Real-Time)
```typescript
// When webhook event arrives:
1. Check if library is approved (filter non-approved)
2. Queue event in Redis
3. Webhook processor updates activity incrementally
4. Recalculate metrics from updated activity
5. Cache updated metrics
```

### For Periodic Refresh (Weekly/Monthly)
```typescript
// Scheduled job:
1. For each approved library:
   - Run GitHubCollector (recalculate derived metrics)
   - Run NPMCollector (update download stats)
   - Merge with webhook activity data
   - Recalculate RIS scores
```

---

## Conclusion

### ✅ We Have Complete Coverage
All RIS metrics can be calculated using the **combination** of:
- **Batch collectors** for baseline + metrics without webhooks (stars, forks, downloads)
- **Real-time webhooks** for incremental updates (commits, PRs, issues, releases)

### 🎯 Recommended Approach
**HYBRID MODEL:**
1. Use batch collectors for initial data collection (**baseline**)
2. Use webhooks for real-time updates (**incremental**)
3. Use batch collectors periodically to **backfill and validate** (**weekly refresh**)

This gives us:
- ✅ Fast, real-time data for approved libraries
- ✅ Accurate historical data from batch collection
- ✅ No missing metrics (everything covered)
- ✅ Efficient use of GitHub API rate limits

### 📝 Next Steps
1. ✅ Webhook system implemented (done)
2. ✅ Batch collectors implemented (done)
3. ⏳ **TODO**: Implement scheduled periodic refresh job
4. ⏳ **TODO**: Add monitoring dashboard to track data freshness
