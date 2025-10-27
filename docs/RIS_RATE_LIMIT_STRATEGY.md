# RIS Collection Rate Limit Strategy

## Problem
GitHub's API rate limit is **per account**, not per token. Multiple PATs from the same account share the same 5,000 requests/hour limit.

## Current Collection Requirements
- **56 ecosystem libraries** to collect
- **Estimated requests per library** (with 24-month window):
  - GitHub: ~50-200 requests (PRs, issues, releases, commits)
  - NPM: ~1-2 requests
  - CDN: ~1 request
  - Total: ~60-210 requests per library
- **Total for full collection**: ~3,360-11,760 requests
- **With 5,000/hour limit**: Can complete ~24-83 libraries per hour

## Rate Limit Solutions

### Option 1: GitHub App (RECOMMENDED)
**Pros:**
- 5,000 requests/hour **per installation**
- Can be installed on multiple orgs for more capacity
- More professional for production systems
- Better security (granular permissions)

**Cons:**
- Requires GitHub App setup
- More complex authentication flow

**Implementation:**
```typescript
import { App } from '@octokit/app';

const app = new App({
  appId: process.env.GITHUB_APP_ID!,
  privateKey: process.env.GITHUB_APP_PRIVATE_KEY!,
});

const octokit = await app.getInstallationOctokit(installationId);
```

**Rate Limit:**
- 5,000 requests/hour per installation
- Can scale by installing on multiple orgs

### Option 2: Multiple GitHub Accounts
**Pros:**
- Each account gets 5,000/hour
- Simple PAT authentication
- Easy to add more capacity

**Cons:**
- Need to create and maintain multiple GitHub accounts
- Managing multiple accounts may violate GitHub ToS
- Less maintainable

**Implementation:**
```bash
# .env
GITHUB_TOKENS=account1_token,account2_token,account3_token
```

**Rate Limit:**
- 5,000 requests/hour × number of accounts

### Option 3: Incremental Collection (Current Approach)
**Pros:**
- No changes needed
- Works with single account
- Respects rate limits

**Cons:**
- First run takes longer (multiple hours with waits)
- Subsequent runs are fast (only new data)

**Implementation:**
- Already implemented
- Collection fetches only new data after first run
- Redis caches all historical data permanently

**Rate Limit:**
- 5,000 requests/hour (single account)
- First run: ~2-3 hours with rate limit waits
- Subsequent runs: ~5-15 minutes (only new data)

### Option 4: Hybrid Approach
**Pros:**
- Best of both worlds
- Fast for dev, robust for production

**Cons:**
- More complex setup

**Implementation:**
```typescript
// Try GitHub App first, fallback to PAT
const githubAuth = process.env.GITHUB_APP_ID
  ? await getGitHubAppAuth()
  : getPersonalTokenAuth();
```

## Recommendation

### For Development/Testing:
**Use Option 3 (Incremental Collection)**
- First run takes 2-3 hours (acceptable for setup)
- All subsequent runs take 5-15 minutes
- No additional setup needed

### For Production:
**Use Option 1 (GitHub App)**
- More professional
- Better rate limits
- Easier to scale
- Better security

## Current Status

**What We Have:**
- 9 PATs from same account (all share same 5,000/hour limit)
- Incremental collection system (Redis caching)
- Smart token rotation (but doesn't help with single account)
- 24-month time window (reduces requests by 90%)
- Parallel batch processing (ready for multiple accounts/apps)

**What Happens Now:**
- With current setup: ~2-3 hours for first full collection
- Subsequent collections: ~5-15 minutes (only new data)
- This is **acceptable** for a production system that runs daily/weekly

## Implementation Plan

### Immediate (Keep Current System):
1. Run first collection during off-hours (overnight)
2. Wait for rate limit resets as needed
3. Subsequent runs will be fast (incremental)

### Future (If Needed):
1. Create GitHub App for React Foundation Store
2. Get 5,000/hour per installation
3. Can install on multiple orgs if needed
4. Implement hybrid fallback (App → PAT)

## Code Changes Needed for GitHub App

### 1. Install Dependencies
```bash
npm install @octokit/app
```

### 2. Update Aggregator
```typescript
// src/lib/ris/collectors/aggregator.ts
import { App } from '@octokit/app';

export class MetricsAggregator {
  private async createGitHubCollectors(): Promise<GitHubActivityCollector[]> {
    // Try GitHub App first
    if (process.env.GITHUB_APP_ID) {
      const app = new App({
        appId: process.env.GITHUB_APP_ID,
        privateKey: process.env.GITHUB_APP_PRIVATE_KEY!,
      });

      const installations = await app.octokit.request('GET /app/installations');

      return installations.data.map(installation =>
        new GitHubActivityCollector({
          auth: async () => {
            const octokit = await app.getInstallationOctokit(installation.id);
            return octokit.auth();
          }
        })
      );
    }

    // Fallback to PATs
    return githubTokens.map(token =>
      new GitHubActivityCollector({ token })
    );
  }
}
```

### 3. Environment Variables
```bash
# GitHub App (production)
GITHUB_APP_ID=123456
GITHUB_APP_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\n..."

# Personal Tokens (development fallback)
GITHUB_TOKENS=ghp_xxx,ghp_yyy
```

## Conclusion

**For now**: The current incremental collection system is **sufficient** and **correct**. The first run will take 2-3 hours, but all subsequent runs will be fast.

**For production scale**: Consider GitHub App when you need:
- Sub-5-minute full collections
- More than 5,000 requests/hour consistently
- Professional authentication approach
