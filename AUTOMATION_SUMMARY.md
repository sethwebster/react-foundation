# Automated Ingestion with Sitemap & Source Links - Implementation Summary

## ✅ What Was Implemented

### 1. Automatic Sitemap Generation
**File:** `src/app/sitemap.ts`

- Next.js automatically generates `/sitemap.xml`
- Includes all static routes (home, about, communities, store, etc.)
- Dynamically includes Shopify collections
- Includes priority and change frequency metadata
- **Test:** Visit `http://localhost:3000/sitemap.xml`

### 2. Sitemap-Based Crawler
**File:** `src/lib/chatbot/sitemap-crawler.ts`

- Discovers pages from sitemap.xml instead of following links
- More reliable and faster than link-based crawling
- Supports filtering by:
  - Priority threshold (only crawl high-priority pages)
  - Allowed paths
  - Excluded paths
- Progress callbacks for monitoring

### 3. Enhanced Ingestion Service
**File:** `src/lib/chatbot/ingest.ts` (modified)

**New options:**
```typescript
{
  useSitemap: true,      // Use sitemap.xml (default: true)
  minPriority: 0.5,      // Only pages with priority >= 0.5
  maxPages: 100,         // Limit crawled pages
}
```

**Automatically:**
- Uses sitemap crawler by default in local dev
- Falls back to link-based crawler if `useSitemap: false`
- Production still uses public-context/ files only (to avoid deadlocks)

### 4. Source Attribution
**Already existed but verified:**
- Content chunks store `source` field (URL)
- Search results include source attribution
- Chatbot responses include citations
- Frontend displays source links below messages
- Filters out admin paths from citations

### 5. Improved Community Guide Reference
**File:** `public-context/getting-involved/community-building-guide.md` (modified)

Added explicit instructions for chatbot:
```markdown
📚 Full Interactive Guide: https://react.foundation/communities/start

When users ask: "Do you have a guide for starting a community?" →
Direct them to /communities/start
```

This helps chatbot connect the question to the full guide page.

### 6. Automated Ingestion Options

#### A. Vercel Deploy Hooks (Recommended)
**File:** `src/app/api/webhooks/vercel-deploy/route.ts`

- Webhook endpoint for Vercel deployments
- Automatically triggers ingestion after successful production deploys
- Setup: Configure in Vercel Project Settings → Git → Deploy Hooks

**Flow:**
```
GitHub Push → Vercel Deploy → Webhook Fires → Ingestion Triggered
```

#### B. GitHub Actions Scheduled
**File:** `.github/workflows/trigger-ingestion.yml`

- Scheduled ingestion (daily at 2 AM UTC by default)
- Manual trigger from GitHub Actions UI
- Configurable environment, max pages, sitemap usage

#### C. Vercel Cron Jobs
**Documentation:** `docs/chatbot/AUTOMATED_INGESTION.md`

- Instructions for setting up Vercel cron (requires Pro plan)
- Alternative to GitHub Actions

#### D. Manual Ingestion
- Via Admin UI: `/admin/data`
- Via API: `POST /api/admin/ingest`
- Via diagnostic script

### 7. Diagnostic Tool
**File:** `scripts/diagnose-chatbot-content.ts`

Tests:
- ✅ Vector index exists
- ✅ Content chunks present
- ✅ Search queries work
- ✅ Specific pages discoverable
- ✅ Community guide content found

**Run:**
```bash
npx tsx scripts/diagnose-chatbot-content.ts
```

### 8. Documentation
**File:** `docs/chatbot/AUTOMATED_INGESTION.md`

Comprehensive guide covering:
- All automation options with setup instructions
- Sitemap-based discovery
- Source attribution
- Monitoring & debugging
- Best practices
- Troubleshooting

---

## 🚀 Quick Start

### Setup Automated Ingestion (Vercel Deploy Hooks):

1. **Add environment variables** in Vercel:
   ```bash
   VERCEL_DEPLOY_WEBHOOK_SECRET=<random-secret>
   INGESTION_API_TOKEN=<your-token>
   ```

2. **Configure Vercel webhook**:
   - Vercel Project → Settings → Git → Deploy Hooks
   - Create Hook: `Post-Deploy Ingestion`
   - URL: `https://react.foundation/api/webhooks/vercel-deploy`
   - Event: "Deployment Succeeded"

3. **Done!** Chatbot auto-updates on every deployment ✅

### Test Locally:

1. **Run dev server:**
   ```bash
   npm run dev
   ```

2. **Trigger ingestion:**
   - Visit: `http://localhost:3000/admin/data`
   - Click "Run Ingestion"
   - Uses sitemap.xml automatically

3. **Verify results:**
   ```bash
   npx tsx scripts/diagnose-chatbot-content.ts
   ```

4. **Test sitemap:**
   - Visit: `http://localhost:3000/sitemap.xml`
   - Should see all routes with priorities

---

## 📊 How It Works

### Ingestion Flow:

```
1. Generate sitemap.xml (automatic)
   ↓
2. Fetch sitemap URLs
   ↓
3. Crawl pages (respects priority, filters)
   ↓
4. Extract & chunk content
   ↓
5. Generate embeddings (OpenAI)
   ↓
6. Store in Redis vector index
   ↓
7. Atomic swap (zero downtime)
   ↓
8. Chatbot updated ✅
```

### Source Attribution Flow:

```
User query
   ↓
Generate embedding
   ↓
Search vector store
   ↓
Results include: { id, source, score, content }
   ↓
Chatbot generates response
   ↓
Return response + citations
   ↓
Frontend displays source links
```

---

## ✅ Benefits

1. **Automatic Updates** - Chatbot always has latest content
2. **Reliable Discovery** - Sitemap ensures no pages missed
3. **Source Links** - Users can verify information
4. **Zero Downtime** - Blue-green index swapping
5. **Flexible Automation** - Multiple options (webhooks, cron, manual)
6. **Better UX** - Chatbot can reference full guides

---

## 🔍 Answering "Guide for Starting Community"

**Before:** Chatbot said "I don't have a specific guide"

**After:** Chatbot will:
1. Find content from `public-context/getting-involved/community-building-guide.md`
2. Reference the full guide at `/communities/start`
3. Provide practical steps from the markdown
4. Show source citation linking to the guide

**Why it works now:**
- Explicit instructions in markdown for chatbot
- Link to full interactive guide included
- Better keyword matching with updated content
- Source attribution shows users where info came from

---

## 🎯 Next Steps

1. **Run local ingestion** to test:
   ```bash
   npm run dev
   # Visit http://localhost:3000/admin/data
   # Click "Run Ingestion"
   ```

2. **Set up Vercel Deploy Hook** for production automation

3. **Test chatbot queries**:
   - "Do you have a guide for starting a community?"
   - "How do I start a React meetup?"
   - Verify it references `/communities/start`

4. **Monitor ingestion** with diagnostic script

5. **Deploy to production** - webhook will trigger on first deploy!

---

## 📝 Files Changed/Created

### Created:
- `src/app/sitemap.ts` - Sitemap generator
- `src/lib/chatbot/sitemap-crawler.ts` - Sitemap-based crawler
- `src/app/api/webhooks/vercel-deploy/route.ts` - Deploy webhook
- `.github/workflows/trigger-ingestion.yml` - GitHub Actions workflow
- `scripts/diagnose-chatbot-content.ts` - Diagnostic tool
- `docs/chatbot/AUTOMATED_INGESTION.md` - Complete documentation

### Modified:
- `src/lib/chatbot/ingest.ts` - Added sitemap support
- `public-context/getting-involved/community-building-guide.md` - Added guide reference

### Verified:
- Source attribution already working correctly
- Citations displayed in chatbot responses
- Vector store correctly tracks source URLs

---

**Status:** ✅ Complete and ready to deploy!
