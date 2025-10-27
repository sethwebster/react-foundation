# RIS System Setup Guide

This guide explains how to set up and use the React Impact Score (RIS) system with real data from GitHub, NPM, CDN providers, and OSSF Scorecard.

## Prerequisites

1. **GitHub Personal Access Token (PAT)** - For fetching repository metrics
2. **Redis Database** - For caching metrics (can use Upstash, Redis Cloud, or local Redis)
3. **Vercel Deployment** (optional) - For automated daily collection

## Step 1: GitHub Personal Access Token

You should already have a `GITHUB_TOKEN` configured for the maintainer progress API. This same token will be used for RIS data collection.

If you need to create a new one:

1. Go to https://github.com/settings/tokens/new
2. Give it a descriptive name like "React Foundation Store API"
3. Select the following permissions:
   - `read:user` (for maintainer progress)
   - `public_repo` (for RIS data collection)
4. Click "Generate token"
5. **Copy the token** - you won't be able to see it again!

## Step 2: Set Up Redis

### Option A: Local Redis (Development)

```bash
# Install Redis (macOS)
brew install redis

# Start Redis
redis-server

# Redis will be available at redis://localhost:6379
```

### Option B: Upstash (Production - Recommended)

1. Go to https://upstash.com
2. Create a free account
3. Create a new Redis database
4. Copy the connection URL (format: `redis://default:password@host.upstash.io:6379`)

### Option C: Redis Cloud

1. Go to https://redis.com/try-free/
2. Create a free account
3. Create a new database
4. Copy the connection URL

## Step 3: Configure Environment Variables

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and add your credentials:
   ```bash
   # GitHub Token (same token used for maintainer progress API)
   GITHUB_TOKEN=ghp_your_token_here

   # Redis URL (from Step 2)
   REDIS_URL=redis://localhost:6379
   # OR for Upstash:
   # REDIS_URL=redis://default:password@host.upstash.io:6379

   # Enable real RIS data
   NEXT_PUBLIC_RIS_ENABLED=true
   ```

## Step 4: Install Dependencies

Dependencies are already installed if you ran `npm install`. The RIS system uses:
- `@octokit/graphql` - GitHub GraphQL API
- `@octokit/rest` - GitHub REST API
- `ioredis` - Redis client
- `swr` - React data fetching

## Step 5: Collect Initial Data

### Manual Collection (First Time)

```bash
# Start your dev server
npm run dev

# In another terminal, trigger collection:
curl -X POST http://localhost:3000/api/ris/collect
```

This will:
1. Check cache for each library
2. Skip libraries with fresh data (< 24h old)
3. Collect only missing/expired data
4. Calculate RIS scores for all libraries
5. Cache everything in Redis

**First run**: ~5-10 minutes (collects all 54 libraries)
**Subsequent runs**: ~1-2 minutes (uses cached data!)

### Incremental vs. Force Refresh

**Incremental (Default)**:
```bash
# Only collects data that's > 24h old
curl -X POST http://localhost:3000/api/ris/collect

# Response:
# {
#   "collected": 3,    ← Only 3 libraries needed fresh data
#   "cached": 51,      ← 51 used cache
#   "failed": 0,
#   "total": 54
# }
```

**Force Refresh** (quarterly or when needed):
```bash
# Ignore cache, collect everything fresh
curl -X POST "http://localhost:3000/api/ris/collect?force=true"

# Response:
# {
#   "collected": 54,   ← All libraries collected fresh
#   "cached": 0,
#   "failed": 0
# }
```

**Custom Age Threshold**:
```bash
# Refresh data older than 12 hours
curl -X POST "http://localhost:3000/api/ris/collect?maxAge=12"
```

### Check Collection Status

```bash
curl http://localhost:3000/api/ris/status
```

### View Results

Visit http://localhost:3000/libraries to see the dashboard with real data!

### Rate Limit Benefits 🚀

**With 3 tokens + Incremental collection**:

| Scenario | API Calls | Time | Tokens Needed |
|----------|-----------|------|---------------|
| **First run** (cold cache) | ~10,800 | 10 min | 3 tokens |
| **Daily run** (warm cache) | ~500-1,000 | 1-2 min | 1 token |
| **Force refresh** | ~10,800 | 10 min | 3 tokens |

✅ First run collects all 54 libraries
✅ Daily runs only refresh what's needed (90% cache hit rate)
✅ No wasted API calls on unchanged data

## Step 6: Automated Daily Collection (Vercel)

The system is configured to run daily at 2 AM UTC via Vercel Cron.

### On Vercel:

1. Deploy your app to Vercel:
   ```bash
   vercel
   ```

2. Add environment variables in Vercel dashboard:
   - Go to your project settings
   - Navigate to "Environment Variables"
   - Add `GITHUB_TOKEN` and `REDIS_URL` (if not already configured)

3. The cron job is already configured in `vercel.json`:
   ```json
   {
     "crons": [{
       "path": "/api/ris/collect",
       "schedule": "0 2 * * *"
     }]
   }
   ```

4. Verify cron is working:
   - Go to Vercel dashboard → Your Project → Cron Jobs
   - You should see the `/api/ris/collect` job listed

## API Endpoints

### POST `/api/ris/collect`

Triggers data collection for all libraries.

**Response:**
```json
{
  "success": true,
  "collected": 54,
  "total": 54,
  "period": "2025-Q4",
  "timestamp": "2025-10-20T..."
}
```

### GET `/api/ris/allocation`

Returns quarterly allocation with scores.

**Query params:**
- `period` (optional) - e.g., "2025-Q4"

**Response:**
```json
{
  "period": "2025-Q4",
  "total_pool_usd": 1000000,
  "weights": {...},
  "libraries": [...]
}
```

### GET `/api/ris/status`

Returns collection status and last update time.

**Response:**
```json
{
  "status": {
    "status": "completed",
    "message": "Successfully collected...",
    "progress": 54,
    "total": 54
  },
  "lastUpdated": "2025-10-20T...",
  "currentQuarter": "2025-Q4"
}
```

## React Hooks

### `useRISAllocationFromAPI(period?)`

Fetch real allocation data from API.

```tsx
'use client';
import { useRISAllocationFromAPI } from '@/lib/ris';

export function MyComponent() {
  const { allocation, isLoading, isError, refetch } = useRISAllocationFromAPI();

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error loading data</div>;

  return <div>{allocation.libraries.length} libraries</div>;
}
```

### `useCollectionStatus()`

Monitor collection progress.

```tsx
import { useCollectionStatus } from '@/lib/ris';

export function StatusMonitor() {
  const { status, lastUpdated, isCollecting } = useCollectionStatus();

  return (
    <div>
      {isCollecting && <p>Collecting data... {status.progress}/{status.total}</p>}
      {lastUpdated && <p>Last updated: {new Date(lastUpdated).toLocaleString()}</p>}
    </div>
  );
}
```

### `useCollectRISData()`

Trigger collection from frontend.

```tsx
import { useCollectRISData } from '@/lib/ris';

export function CollectButton() {
  const { collect, isCollecting, error } = useCollectRISData();

  return (
    <button onClick={() => collect()} disabled={isCollecting}>
      {isCollecting ? 'Collecting...' : 'Collect Data'}
    </button>
  );
}
```

## Caching Strategy

The RIS system uses Redis with the following TTLs:

- **Library Metrics**: 24 hours
- **Quarterly Allocation**: 7 days
- **Collection Lock**: 10 minutes (prevents concurrent collections)

### Cache Keys

- `ris:metrics:{owner}:{repo}` - Individual library metrics
- `ris:allocation:{period}` - Quarterly allocation
- `ris:last_updated` - Last collection timestamp
- `ris:collection_status` - Current collection status
- `ris:collection_lock` - Lock to prevent concurrent runs

## Troubleshooting

### "GITHUB_TOKEN environment variable not set"

Make sure you added `GITHUB_TOKEN` to your `.env` file and restarted your dev server.

### "REDIS_URL environment variable is not set"

Add `REDIS_URL` to your `.env` file.

### "Collection already in progress"

Wait for the current collection to finish (check `/api/ris/status`) or wait 10 minutes for the lock to expire.

### GitHub API Rate Limiting

- Free tier: 5,000 requests/hour
- With PAT: 5,000 requests/hour per token
- The collector is designed to stay within limits
- Collection may take longer if you hit rate limits

### No Data Showing on Dashboard

1. Check if collection completed successfully:
   ```bash
   curl http://localhost:3000/api/ris/status
   ```

2. Check if allocation is cached:
   ```bash
   curl http://localhost:3000/api/ris/allocation
   ```

3. Check Redis connection:
   ```bash
   redis-cli ping
   # Should return: PONG
   ```

## Data Sources

The RIS system collects metrics from:

1. **GitHub API**
   - Repository stars, forks
   - PR/issue metrics
   - Contributors and maintainers
   - Release cadence

2. **NPM Registry**
   - Download statistics (12-month)
   - Package metadata
   - TypeScript support

3. **npms.io API**
   - Dependents count
   - Quality scores

4. **jsDelivr CDN**
   - CDN request statistics

5. **OSSF Scorecard**
   - Security best practices
   - OpenSSF scores

## Local Development Tips

### Skip Automated Collection

If you don't want automated collection in development:

1. Remove or comment out `vercel.json`
2. Manually trigger collection when needed

### Use Sample Data During Development

Set in `.env`:
```bash
NEXT_PUBLIC_RIS_ENABLED=false
```

This will use mock data instead of hitting APIs.

### Test Individual Collectors

```typescript
import { GitHubCollector } from '@/lib/ris/collectors/github-collector';

const collector = new GitHubCollector(process.env.GITHUB_TOKEN!);
const metrics = await collector.collectMetrics('facebook', 'react');
console.log(metrics);
```

## Production Deployment Checklist

- [ ] `GITHUB_TOKEN` configured in Vercel environment variables
- [ ] `REDIS_URL` configured (use Upstash or Redis Cloud)
- [ ] `NEXT_PUBLIC_RIS_ENABLED=true` set
- [ ] First collection completed successfully
- [ ] Cron job enabled and running
- [ ] Dashboard displays real data at `/libraries`

## Next Steps

- View the dashboard at `/libraries`
- Read the scoring explanation at `/scoring`
- Monitor collection status at `/api/ris/status`
- Explore the RIS API documentation in `src/lib/ris/README.md`

## Support

For issues or questions:
1. Check the RIS implementation docs: `src/lib/ris/README.md`
2. Review the specification: `docs/foundation/REVENUE_DISTRIBUTION_MODEL.md`
3. Open an issue on GitHub
