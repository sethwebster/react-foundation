# RIS System Deployment Modes

This guide helps you choose the right deployment mode for the React Impact Score (RIS) data collection system based on your needs.

---

## 🤔 Which Mode Should I Use?

```
┌─────────────────────────────────────────────────────────────┐
│  Decision Tree: Choose Your Deployment Mode                │
└─────────────────────────────────────────────────────────────┘

START: Do you need real-time score updates?
│
├─ NO → Do you need to scale beyond 56 libraries?
│       │
│       ├─ NO → ✅ Mode 1: Simple (PAT-only)
│       │      Best for: MVP, small-scale testing
│       │
│       └─ YES → ✅ Mode 2: Professional (GitHub App, no webhooks)
│              Best for: Production without real-time updates
│
└─ YES → ✅ Mode 3: Real-time (GitHub App + Webhooks)
         Best for: Full-featured production with live updates
```

---

## Mode 1: Simple (PAT-only)

**Use when:** Testing, MVP, or supporting < 56 libraries

### Features
- ✅ Easiest setup (1 minute)
- ✅ No GitHub App needed
- ✅ Works immediately
- ❌ Limited to 5,000 requests/hour (shared across all PATs from same account)
- ❌ Monthly score updates only
- ❌ Not scalable beyond ~50 libraries

### Setup

**Step 1: Generate Personal Access Token**
1. Go to https://github.com/settings/tokens/new
2. Set scopes: `read:org`, `read:user`, `public_repo`
3. Click "Generate token"
4. Copy token (starts with `ghp_`)

**Step 2: Configure Environment**
```bash
# .env
GITHUB_TOKEN=ghp_your_token_here
```

**Step 3: Done!**
```bash
npm run dev
# Collection runs daily via cron job
```

### When to Upgrade
- Rate limit errors appear in logs
- Need to support > 56 libraries
- Want real-time updates

---

## Mode 2: Professional (GitHub App, no webhooks)

**Use when:** Production deployment without real-time updates

### Features
- ✅ Scalable rate limits (5,000/hour per installation)
- ✅ Production-ready
- ✅ Falls back to PAT if app not installed
- ✅ Works with any number of libraries
- ❌ Monthly score updates only
- ❌ Requires GitHub App setup (15 minutes)

### Setup

**Step 1: Create GitHub App**

Follow the [GitHub App Setup Guide](./GITHUB_APP_SETUP.md) **but skip Step 4 (webhooks)**.

Quick summary:
1. Go to https://github.com/settings/apps/new
2. Set **Name**: "React Foundation RIS Collector"
3. Set **Permissions** (all read-only):
   - Contents
   - Issues
   - Pull Requests
   - Metadata
4. **IMPORTANT:** Leave webhooks disabled (skip this step)
5. Generate private key → Save `.pem` file
6. Note App ID

**Step 2: Configure Environment**
```bash
# .env
GITHUB_APP_ID=123456
GITHUB_APP_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----
...full key here...
-----END RSA PRIVATE KEY-----"

# Optional: Keep PAT as fallback for repos without app
GITHUB_TOKEN=ghp_your_token_here
```

**Step 3: Install App on Repositories**
1. Go to GitHub App settings → Install App
2. Select organization or account
3. Choose "All repositories" or select specific repos
4. Click "Install"

**Step 4: Done!**
```bash
npm run dev
# System uses app for installed repos, PAT for others
```

### How It Works
```
Data Collection Flow (Mode 2):

1. Cron job runs daily (2 AM)
   ↓
2. For each library:
   - Check if GitHub App installed → Use app (5k/hr per repo)
   - Otherwise → Use PAT (5k/hr shared)
   ↓
3. Fetch data from GitHub API
   ↓
4. Calculate metrics & scores
   ↓
5. Cache in Redis
   ↓
6. Display on /scoring page
```

### When to Upgrade
- Need instant updates when maintainers merge PRs
- Want to engage maintainers with real-time feedback
- Want to reduce API polling load

---

## Mode 3: Real-time (GitHub App + Webhooks)

**Use when:** Full production deployment with maintainer engagement

### Features
- ✅ **Real-time score updates** (< 2 minutes from event to dashboard)
- ✅ **Scalable** (5,000/hour per installation)
- ✅ **Maintainer-friendly** (instant feedback loop)
- ✅ **Reduced API calls** (GitHub pushes data, not polling)
- ✅ **Live dashboard** (shows ⚡ Real-time badge)
- ⚠️ **Most complex** setup (30 minutes)

### Setup

Follow the complete [GitHub App Setup Guide](./GITHUB_APP_SETUP.md) **including Step 4 (webhooks)**.

**Step 1: Create GitHub App with Webhooks**

Same as Mode 2, but also:
1. **Enable webhooks**: ✅ Active
2. **Webhook URL**: `https://your-domain.com/api/webhooks/github`
3. **Webhook secret**: Generate random string
4. **Subscribe to events**:
   - Push
   - Pull requests
   - Issues
   - Releases
   - Meta (installation events)

**Step 2: Configure Environment**
```bash
# .env
GITHUB_APP_ID=123456
GITHUB_APP_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----
...full key here...
-----END RSA PRIVATE KEY-----"

# Webhook configuration
GITHUB_WEBHOOK_SECRET=your_secret_here

# Public install URL
NEXT_PUBLIC_GITHUB_APP_INSTALL_URL=https://github.com/apps/your-app/installations/new

# Cron job secret (protects background processing)
CRON_SECRET=your_cron_secret_here

# Optional: PAT as fallback
GITHUB_TOKEN=ghp_your_token_here
```

**Step 3: Deploy Cron Job**

Add to `vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/ris/collect",
      "schedule": "0 2 * * *"
    },
    {
      "path": "/api/ris/process-webhooks",
      "schedule": "*/2 * * * *"
    }
  ]
}
```

**Step 4: Test Webhooks**

1. Create test PR in installed repo
2. Check webhook delivery (GitHub App settings → Advanced)
3. Visit `/scoring` → Find your repo
4. Verify ⚡ Real-time status appears
5. Wait 30 seconds → Score updates

### How It Works
```
Data Collection Flow (Mode 3):

Real-time Updates (webhooks):
1. Maintainer merges PR
   ↓
2. GitHub sends webhook → /api/webhooks/github
   ↓
3. Webhook verified & queued in Redis
   ↓
4. Cron job (every 2 min) processes queue
   ↓
5. Metrics updated incrementally
   ↓
6. Dashboard auto-refreshes → Shows new score

Baseline Collection (polling):
1. Daily cron (2 AM) runs full collection
   ↓
2. Fetches complete history for all libraries
   ↓
3. Ensures webhook data is accurate
```

### Architecture Diagram
```
┌─────────────────────────────────────────────────────────────┐
│                     Mode 3 Architecture                     │
└─────────────────────────────────────────────────────────────┘

GitHub Events                    Your Application
─────────────                    ────────────────

PR merged ──────────────────────→ Webhook Handler
                                  │ (verify signature)
Issue closed ────────────────────→ │
                                  ↓
Release published ───────────────→ Redis Queue
                                  │ (deduplicate)
                                  ↓
Daily 2 AM ──────────────────────→ Event Processor
(full sync)                       │ (every 2 min)
                                  ↓
                                  Update Activity Data
                                  │
                                  ↓
                                  Recalculate Metrics
                                  │
                                  ↓
                                  Cache in Redis
                                  │
                                  ↓
Dashboard (auto-refresh) ←────────┘
```

---

## Comparison Table

| Feature | Mode 1: Simple | Mode 2: Professional | Mode 3: Real-time |
|---------|----------------|---------------------|-------------------|
| **Setup Time** | 1 minute | 15 minutes | 30 minutes |
| **Rate Limit** | 5k/hr shared | 5k/hr per repo | 5k/hr per repo |
| **Update Frequency** | Daily | Daily | Real-time (< 2 min) |
| **Scalability** | ~50 libraries | Unlimited | Unlimited |
| **Maintainer Experience** | Monthly updates | Monthly updates | Instant feedback |
| **API Efficiency** | Polling only | Polling only | Webhooks + polling |
| **Dashboard Features** | Basic | Basic | Live status badges |
| **GitHub App Required** | ❌ No | ✅ Yes | ✅ Yes |
| **Webhooks Required** | ❌ No | ❌ No | ✅ Yes |
| **Fallback to PAT** | N/A | ✅ Yes | ✅ Yes |
| **Maintainer Engagement** | Low | Low | High |
| **Production Ready** | ⚠️ Testing only | ✅ Yes | ✅ Yes |

---

## Hybrid Approach (Recommended)

**Best practice:** Use Mode 3 for engaged maintainers, fallback to Mode 2/1 for others.

### How It Works
1. Deploy with **Mode 3** (GitHub App + webhooks)
2. Maintainers install app → Get real-time updates
3. Other libraries → Fallback to PAT (monthly updates)
4. Gradually encourage adoption via `/scoring` page

### Benefits
- ✅ Works immediately (PAT fallback)
- ✅ Scalable (app for high-impact repos)
- ✅ Engaging (real-time for participants)
- ✅ Flexible (supports both modes)

### Example Configuration
```bash
# .env (supports all modes)

# Mode 3: GitHub App + Webhooks
GITHUB_APP_ID=123456
GITHUB_APP_PRIVATE_KEY="..."
GITHUB_WEBHOOK_SECRET=your_secret_here
NEXT_PUBLIC_GITHUB_APP_INSTALL_URL=https://github.com/apps/your-app/installations/new
CRON_SECRET=your_cron_secret_here

# Mode 1: Fallback PAT
GITHUB_TOKEN=ghp_your_token_here

# System automatically uses:
# - App + webhooks for repos with app installed
# - App (no webhooks) for repos with app but no recent events
# - PAT for repos without app
```

---

## Migration Path

### Upgrading from Mode 1 → Mode 2
1. Create GitHub App (skip webhooks)
2. Add `GITHUB_APP_ID` and `GITHUB_APP_PRIVATE_KEY` to `.env`
3. Keep existing `GITHUB_TOKEN` as fallback
4. Install app on repositories
5. No code changes needed - system auto-detects

### Upgrading from Mode 2 → Mode 3
1. Enable webhooks in GitHub App settings
2. Add webhook URL and secret
3. Subscribe to events
4. Add webhook-related env vars
5. Deploy cron job for webhook processing
6. Test webhook delivery
7. No code changes needed - system auto-detects

### Downgrading from Mode 3 → Mode 2
1. Disable webhooks in GitHub App settings
2. Remove webhook env vars (optional)
3. Remove webhook cron job from `vercel.json`
4. System falls back to polling-only

---

## Troubleshooting

### Mode 1 Issues

**Problem:** Rate limit errors
```
Error: API rate limit exceeded for user
```

**Solutions:**
1. Wait for rate limit reset (check `X-RateLimit-Reset` header)
2. Reduce collection frequency
3. Upgrade to Mode 2 (GitHub App)

---

### Mode 2 Issues

**Problem:** App not being used
```
Using PAT for facebook/react (no app installation found)
```

**Solutions:**
1. Verify app is installed on the repository
2. Check `GITHUB_APP_ID` and `GITHUB_APP_PRIVATE_KEY` are correct
3. Check app has correct permissions

**Problem:** Authentication error
```
Error: GitHub App authentication failed
```

**Solutions:**
1. Verify private key format (must include header/footer)
2. Check App ID is correct
3. Regenerate private key if needed

---

### Mode 3 Issues

**Problem:** Webhooks not being received
```
Webhook queue length: 0 (no events received)
```

**Solutions:**
1. Check webhook URL is correct and publicly accessible
2. Verify webhook secret matches `.env`
3. Check webhook delivery history in GitHub App settings
4. Use smee.io for local testing (see [GitHub App Setup Guide](./GITHUB_APP_SETUP.md))

**Problem:** Events queued but not processed
```
GET /api/ris/process-webhooks → queueLength: 25
```

**Solutions:**
1. Check cron job is running (Vercel dashboard)
2. Verify `CRON_SECRET` is correct
3. Check server logs for processing errors
4. Manually trigger: `curl -X POST /api/ris/process-webhooks -H "Authorization: Bearer CRON_SECRET"`

**Problem:** Scores not updating in real-time
```
Dashboard shows "Monthly" instead of "⚡ Real-time"
```

**Solutions:**
1. Check if app is installed on repository
2. Verify webhook events are being received (check queue length)
3. Wait up to 2 minutes for cron job to process events
4. Check Redis for cached metrics: `redis-cli GET ris:metrics:owner:repo`

---

## FAQ

### Can I switch modes without downtime?
**Yes.** All modes are supported simultaneously. The system automatically detects which authentication method to use for each repository.

### Do I need Redis for all modes?
**Yes.** All modes use Redis for caching metrics and activity data. Mode 3 also uses Redis for webhook queuing.

### Can I use multiple PATs from different accounts?
**No longer necessary.** With Mode 2/3 (GitHub App), each installation gets its own rate limit. PATs are only needed as fallback.

### What happens if a webhook fails?
**It's queued for retry.** GitHub retries failed webhooks automatically. We also deduplicate events to handle retries gracefully. Daily polling ensures data consistency even if webhooks are missed.

### How do I know which mode is being used?
**Check the dashboard.** Libraries with ⚡ Real-time badge use Mode 3 (webhooks). Others use Mode 2 (app) or Mode 1 (PAT).

### Can I disable webhooks temporarily?
**Yes.** Disable webhooks in GitHub App settings. System automatically falls back to Mode 2 (polling via app).

---

## Security Considerations

### Mode 1 (PAT)
- ✅ PAT stored in environment variables (not committed)
- ✅ Read-only permissions
- ⚠️ Single point of failure (if PAT leaked, all repos at risk)

### Mode 2 (GitHub App)
- ✅ Private key stored securely
- ✅ Per-repository authentication
- ✅ Revocable per installation
- ✅ Read-only permissions
- ✅ Better than PAT (isolated credentials)

### Mode 3 (GitHub App + Webhooks)
- ✅ All Mode 2 benefits
- ✅ Webhook signature verification (HMAC-SHA256)
- ✅ Event deduplication (prevents replay attacks)
- ✅ CRON_SECRET protects processing endpoint
- ✅ Public data only (never accesses private repos)

---

## Next Steps

1. **Choose your mode** using the decision tree above
2. **Follow setup guide**:
   - Mode 1: Copy PAT to `.env` → Done
   - Mode 2: Follow [GitHub App Setup Guide](./GITHUB_APP_SETUP.md) (skip webhooks)
   - Mode 3: Follow [GitHub App Setup Guide](./GITHUB_APP_SETUP.md) (full setup) + [Webhook Implementation Guide](./RIS_WEBHOOK_IMPLEMENTATION.md)
3. **Test your deployment**:
   - Check logs for API calls
   - Verify scores appear on `/scoring` page
   - Monitor rate limit usage
4. **Optimize over time**:
   - Start with Mode 1 (quick test)
   - Upgrade to Mode 2 (production)
   - Add Mode 3 (when maintainers are engaged)

---

**Questions?** See [GitHub App Setup Guide](./GITHUB_APP_SETUP.md) or [Webhook Implementation Guide](./RIS_WEBHOOK_IMPLEMENTATION.md) for detailed instructions.
