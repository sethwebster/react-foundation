# Content Ingestion System - Complete Summary

## What You Now Have

A complete automated content ingestion system that:
1. ✅ Crawls your entire site (including dynamic React content)
2. ✅ Bypasses access control automatically
3. ✅ Generates vector embeddings for chatbot
4. ✅ Auto-runs after every production deployment
5. ✅ Supports unlimited pages
6. ✅ Only crawls your domain

## System Components

### 1. Enhanced Crawler (Puppeteer-based)
**File**: `src/lib/chatbot/crawler-enhanced.ts`

Uses headless Chrome to:
- Execute JavaScript and render React components
- Capture dynamically-loaded data (communities list, etc.)
- Wait for content to fully load (2 second default)
- Bypass access control with token header

### 2. Content Extractor
**File**: `src/lib/chatbot/content-extractor.ts`

- Removes navigation, headers, footers
- Chunks content into ~1000 character pieces
- Adds 200 character overlap between chunks
- Stores clean paths for citations

### 3. Ingestion Service
**File**: `src/lib/chatbot/ingest.ts`

Orchestrates:
- Crawling → Content extraction → Embedding → Storage
- Progress tracking with live logs
- Error handling and recovery
- Dual authentication (UI + API token)

### 4. API Endpoints
**Files**: `src/app/api/admin/ingest/*.ts`

- `POST /api/admin/ingest` - Start ingestion
- `GET /api/admin/ingest?ingestionId=X` - Check progress
- `GET /api/admin/ingest/inspect` - Debug vector store

### 5. Admin UI
**Files**: `src/app/admin/ingest/*.tsx`

- `/admin/ingest` - Start and monitor ingestion
- `/admin/ingest/inspect` - Inspect stored vectors

### 6. GitHub Actions Workflow
**File**: `.github/workflows/ingest-content.yml`

Auto-triggers after production deploy:
- Waits for deployment to stabilize
- Starts ingestion via API
- Monitors progress (polls every 10s)
- Reports success/failure

### 7. Access Control Bypass
**File**: `src/proxy.ts`

Checks for `X-Crawler-Bypass` header:
- Matches against `CRAWLER_BYPASS_TOKEN`
- Allows crawler through Coming Soon gate
- Crawler sends token automatically

## Setup Required

### 1. Local Development

Add to `.env.local`:
```bash
# Crawler bypass (allows ingestion to see actual content)
CRAWLER_BYPASS_TOKEN=<generate-with-crypto>

# Ingestion API token (for GitHub Actions)
INGESTION_API_TOKEN=<generate-with-crypto>
```

Generate tokens:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Restart dev server:
```bash
npm run dev
```

### 2. Production (Vercel)

Add environment variables in Vercel dashboard:
```bash
CRAWLER_BYPASS_TOKEN=<same-as-local>
INGESTION_API_TOKEN=<same-as-local>
```

### 3. GitHub Secrets

Add repository secrets:
```bash
PRODUCTION_URL=https://your-domain.com
INGESTION_API_TOKEN=<same-as-vercel>
```

## How to Use

### Manual Ingestion (Development)

1. Visit `/admin/ingest`
2. Configure options:
   - Check "Clear Existing Data" (first time)
   - Set max pages (0 = unlimited)
   - Add excluded paths: `/api,/admin,/_next`
3. Click "Start Ingestion"
4. Watch real-time logs and progress
5. Check results at `/admin/ingest/inspect`

### Automatic Ingestion (Production)

After setup:
1. Push to `main` branch
2. GitHub deploys to Vercel
3. Workflow auto-triggers after deploy
4. Ingestion runs in background
5. Chatbot gets updated content

### Manual Trigger (GitHub Actions)

1. Go to **Actions** tab
2. Select "Ingest Content After Deploy"
3. Click **Run workflow**
4. Set options and run

## What Gets Ingested

### ✅ Captured:
- Static HTML content
- Server-rendered React components
- Client-rendered content (communities list, etc.)
- Dynamic data loaded via fetch/API
- All text visible on the page

### ❌ Not Captured:
- Content behind authentication
- User-specific data
- Admin pages (excluded)
- API endpoints (excluded)
- Images (descriptions only if in alt text)

## Performance

### Crawling Speed:
- ~5-10 seconds per page (with JavaScript rendering)
- 50 pages ≈ 5-8 minutes
- 100 pages ≈ 10-15 minutes

### Costs (OpenAI):
- Embeddings: ~$0.13 per 1M tokens
- 100 pages ≈ 500 chunks ≈ 500K tokens
- **Cost**: ~$0.065 per full ingestion

### Resource Usage:
- Puppeteer needs ~300MB RAM per browser instance
- One browser instance shared across all pages
- Minimal impact on production site

## Testing

### Verify Crawler Bypass:

```bash
# Test locally (should see actual content, not Coming Soon)
curl -H "X-Crawler-Bypass: your-token-here" http://localhost:3000/about
```

### Verify Ingestion:

1. Run ingestion
2. Visit `/admin/ingest/inspect`
3. Check samples:
   - Different sources (`/about`, `/communities`, etc.)
   - Diverse content (not all "Coming Soon")
   - Content includes dynamic data (community names, etc.)

### Test Chatbot:

After ingestion:
```
User: "What communities are listed on the site?"
Bot: Should mention specific communities (React NYC, React Berlin, etc.)

User: "Tell me about the React Foundation's mission"
Bot: Should cite content from /about page
```

## Troubleshooting

### Issue: Still seeing "Coming Soon" content

**Solution:**
1. Verify `CRAWLER_BYPASS_TOKEN` is set
2. Restart dev server
3. Check proxy.ts has bypass code
4. Test bypass with curl command above

### Issue: No dynamic content (communities not showing)

**Solution:**
1. Verify using `EnhancedSiteCrawler` (not old `SiteCrawler`)
2. Check `waitTime` is set (default: 2000ms)
3. Increase wait time if content loads slowly
4. Check browser logs in ingestion output

### Issue: GitHub Actions workflow not triggering

**Solution:**
1. Check workflow name matches deployment workflow
2. Verify secrets are set in GitHub
3. Check workflow file is in `.github/workflows/`
4. Enable workflow in Actions tab

### Issue: Puppeteer fails in production

**Solution:**
1. Puppeteer needs Chrome/Chromium installed
2. Use `--no-sandbox` flag (already added)
3. Check Vercel build logs for errors
4. May need to configure Vercel for Puppeteer

### Issue: Timeout during ingestion

**Solution:**
1. Reduce `maxPages` (crawl fewer pages)
2. Increase `MAX_WAIT` in workflow (default: 600s)
3. Check for slow-loading pages
4. Monitor network requests in browser

## Monitoring

### Check Ingestion Status:
```bash
# Via UI
Visit: /admin/ingest/inspect

# Via API (with auth token)
curl -H "Authorization: Bearer your-token" \
  https://your-domain.com/api/admin/ingest?ingestionId=<id>
```

### GitHub Actions Logs:
```bash
gh run list --workflow=ingest-content.yml
gh run view --log
```

### Vercel Logs:
Check function logs for ingestion API calls

## Next Steps

1. **Test Locally First:**
   ```bash
   # Add tokens to .env.local
   # Restart server
   # Run ingestion from /admin/ingest
   # Verify at /admin/ingest/inspect
   ```

2. **Deploy to Production:**
   ```bash
   # Add tokens to Vercel
   # Add GitHub secrets
   # Push to main
   # Watch GitHub Actions
   ```

3. **Verify Chatbot:**
   ```
   # Ask about your content
   # Check citations
   # Verify dynamic data appears
   ```

4. **Schedule (Optional):**
   ```yaml
   # Add to workflow
   on:
     schedule:
       - cron: '0 2 * * *'  # Daily at 2 AM
   ```

## Files Changed/Created

### New Files:
- `src/lib/chatbot/crawler-enhanced.ts` - Puppeteer-based crawler
- `.github/workflows/ingest-content.yml` - Auto-ingestion workflow
- `docs/AUTO_INGESTION_SETUP.md` - Setup guide
- `docs/CRAWLER_BYPASS_SETUP.md` - Bypass guide
- `docs/INGESTION_TROUBLESHOOTING.md` - Troubleshooting
- `docs/INGESTION_SUMMARY.md` - This file

### Modified Files:
- `src/lib/chatbot/ingest.ts` - Use enhanced crawler
- `src/app/api/admin/ingest/route.ts` - Add API token auth
- `src/proxy.ts` - Add crawler bypass
- `.env.example` - Add new tokens

## Architecture Diagram

```
┌─────────────────────────────────────────────────────┐
│                 GitHub Actions                       │
│  (Triggered after production deploy)                │
└─────────────────┬───────────────────────────────────┘
                  │ POST /api/admin/ingest
                  │ (with Bearer token)
                  ▼
┌─────────────────────────────────────────────────────┐
│              Ingestion API                          │
│  - Validates API token                              │
│  - Starts IngestionService                          │
└─────────────────┬───────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────┐
│           IngestionService                          │
│  ┌─────────────────────────────────────────┐       │
│  │ 1. Crawl (EnhancedSiteCrawler)          │       │
│  │    - Launch Puppeteer browser           │       │
│  │    - Visit each URL                     │       │
│  │    - Execute JavaScript                 │       │
│  │    - Wait for dynamic content           │       │
│  │    - Capture fully-rendered HTML        │       │
│  └─────────────────────────────────────────┘       │
│                   │                                  │
│  ┌─────────────────────────────────────────┐       │
│  │ 2. Extract (ContentExtractor)           │       │
│  │    - Remove navigation/headers          │       │
│  │    - Extract main content               │       │
│  │    - Chunk into 1000 char pieces        │       │
│  └─────────────────────────────────────────┘       │
│                   │                                  │
│  ┌─────────────────────────────────────────┐       │
│  │ 3. Embed (OpenAI)                       │       │
│  │    - Generate vector embeddings         │       │
│  │    - Process in batches                 │       │
│  └─────────────────────────────────────────┘       │
│                   │                                  │
│  ┌─────────────────────────────────────────┐       │
│  │ 4. Store (Redis)                        │       │
│  │    - Save chunks with embeddings        │       │
│  │    - Create vector index                │       │
│  └─────────────────────────────────────────┘       │
└─────────────────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────┐
│              Redis (Vector Store)                    │
│  - Stores chunks with embeddings                    │
│  - Vector index for semantic search                 │
│  - Used by chatbot for RAG                          │
└─────────────────────────────────────────────────────┘
```

## Key Features

### 🚀 Automatic Updates
- Runs after every deploy
- No manual intervention
- Always current content

### 🔒 Secure
- API token authentication
- Bypass token for access control
- Server-side only tokens

### 📊 Observable
- Real-time progress logs
- Admin inspection UI
- GitHub Actions reporting

### ⚡ Performant
- Parallel processing
- Batch embedding generation
- Shared browser instance

### 🛡️ Robust
- Error handling and recovery
- Timeout protection
- Progress persistence

## Support & Documentation

- 📘 **Setup Guide**: `docs/AUTO_INGESTION_SETUP.md`
- 🔧 **Bypass Setup**: `docs/CRAWLER_BYPASS_SETUP.md`
- 🔍 **Troubleshooting**: `docs/INGESTION_TROUBLESHOOTING.md`
- 🎯 **This Summary**: `docs/INGESTION_SUMMARY.md`

---

**Ready to go!** Set up your tokens and run your first ingestion from `/admin/ingest`
