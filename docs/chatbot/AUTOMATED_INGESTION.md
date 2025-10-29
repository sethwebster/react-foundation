# Automated Chatbot Content Ingestion

This guide covers multiple ways to automatically keep the chatbot's knowledge base up-to-date.

## Overview

The chatbot ingestion process:
1. **Generates sitemap.xml** automatically from Next.js routes
2. **Crawls pages** using sitemap for reliable discovery
3. **Extracts content** and chunks it for embedding
4. **Creates embeddings** using OpenAI
5. **Stores in Redis** vector database
6. **Atomically swaps** to new index (zero-downtime)

## Automation Options

### Option 1: Vercel Deploy Hooks (Recommended)

**Automatically triggers ingestion after every successful production deployment.**

#### Setup:

1. **Create Deploy Webhook Endpoint** ✅ Already created at:
   ```
   /api/webhooks/vercel-deploy
   ```

2. **Add Environment Variables** in Vercel:
   ```bash
   VERCEL_DEPLOY_WEBHOOK_SECRET=your-random-secret-here
   INGESTION_API_TOKEN=your-ingestion-token
   ```

3. **Configure Vercel Webhook**:
   - Go to: Vercel Project → Settings → Git → Deploy Hooks
   - Click "Create Hook"
   - Name: `Post-Deploy Ingestion`
   - Webhook URL: `https://react.foundation/api/webhooks/vercel-deploy`
   - Secret: Same as `VERCEL_DEPLOY_WEBHOOK_SECRET`
   - Events: Select "Deployment Succeeded"
   - Click "Create Hook"

4. **How it works**:
   ```
   GitHub Push
       ↓
   Vercel Deploy
       ↓
   Deployment Succeeds
       ↓
   Webhook Fires → /api/webhooks/vercel-deploy
       ↓
   Triggers Ingestion → /api/admin/ingest
       ↓
   Chatbot Updated ✅
   ```

**Pros:**
- ✅ Automatic - no manual work
- ✅ Always synced with latest deployment
- ✅ Zero-downtime updates
- ✅ Works for all content changes

**Cons:**
- ⚠️ Only triggers on deployment (not standalone content updates)

---

### Option 2: GitHub Actions Scheduled

**Runs ingestion on a schedule (e.g., daily at 2 AM).**

#### Setup:

1. **GitHub Workflow** ✅ Already created at:
   ```
   .github/workflows/trigger-ingestion.yml
   ```

2. **Add GitHub Secret**:
   - Go to: GitHub Repo → Settings → Secrets and variables → Actions
   - Add secret: `INGESTION_API_TOKEN`

3. **Schedule** (edit workflow file):
   ```yaml
   schedule:
     - cron: '0 2 * * *'  # Daily at 2 AM UTC
   ```

4. **Manual trigger** also available:
   - Go to: Actions → Trigger Chatbot Ingestion → Run workflow
   - Choose environment, max pages, use sitemap

**Pros:**
- ✅ Reliable scheduled updates
- ✅ Manual trigger available
- ✅ Can customize per environment
- ✅ Logs viewable in GitHub Actions

**Cons:**
- ⚠️ Not immediate after content changes
- ⚠️ Uses GitHub Actions minutes

---

### Option 3: Vercel Cron Jobs

**Scheduled ingestion using Vercel's built-in cron.**

#### Setup:

1. **Create cron config** in `vercel.json`:
   ```json
   {
     "crons": [
       {
         "path": "/api/cron/ingest",
         "schedule": "0 2 * * *"
       }
     ]
   }
   ```

2. **Create cron endpoint** at `src/app/api/cron/ingest/route.ts`:
   ```typescript
   import { NextResponse } from 'next/server';

   export async function GET(request: Request) {
     // Verify Vercel cron secret
     const authHeader = request.headers.get('authorization');
     if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
     }

     // Trigger ingestion
     const response = await fetch(
       `${process.env.NEXT_PUBLIC_SITE_URL}/api/admin/ingest`,
       {
         method: 'POST',
         headers: {
           'Authorization': `Bearer ${process.env.INGESTION_API_TOKEN}`,
           'Content-Type': 'application/json',
         },
         body: JSON.stringify({
           maxPages: 100,
           useSitemap: true,
         }),
       }
     );

     return NextResponse.json({ success: true });
   }
   ```

3. **Add environment variable**:
   ```bash
   CRON_SECRET=your-random-secret
   ```

**Pros:**
- ✅ Native Vercel integration
- ✅ No external dependencies
- ✅ Free on Vercel Pro

**Cons:**
- ⚠️ Requires Vercel Pro plan
- ⚠️ Less flexible than GitHub Actions

---

### Option 4: Manual Ingestion

**Run ingestion manually when needed.**

#### Via Admin UI:
```
1. Visit: https://react.foundation/admin/data
2. Click "Run Ingestion"
3. Wait for completion
```

#### Via API:
```bash
curl -X POST https://react.foundation/api/admin/ingest \
  -H "Authorization: Bearer $INGESTION_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "maxPages": 100,
    "useSitemap": true,
    "clearExisting": false
  }'
```

#### Via CLI Script:
```bash
# Create scripts/trigger-ingestion.sh
./scripts/trigger-ingestion.sh production
```

**Pros:**
- ✅ Full control
- ✅ No setup required
- ✅ Can customize per run

**Cons:**
- ❌ Manual work required
- ❌ Easy to forget

---

## Sitemap-Based Discovery

The ingestion system automatically generates and uses `sitemap.xml` for reliable page discovery.

### Generated Sitemap

**Location:** `https://react.foundation/sitemap.xml`

**Generator:** `src/app/sitemap.ts` (Next.js App Router)

**Includes:**
- All static routes (home, about, communities, etc.)
- Dynamic collection pages from Shopify
- Priority and change frequency metadata

### Benefits of Sitemap Crawling

1. **Reliable** - No risk of missing pages
2. **Fast** - Direct URL list, no link following
3. **Prioritized** - Can skip low-priority pages
4. **Metadata** - Uses lastModified, changefreq, priority

### Configuration

Ingestion options:
```typescript
{
  useSitemap: true,        // Use sitemap.xml (default: true)
  minPriority: 0.5,        // Only pages with priority >= 0.5
  maxPages: 100,           // Limit pages crawled
  allowedPaths: ['/docs'], // Only these paths
  excludePaths: ['/admin'] // Skip these paths
}
```

---

## Source Attribution

All chatbot responses include **source links** showing where information came from.

### How it Works:

1. **Content chunks** store source URL:
   ```typescript
   {
     id: "chunk-123",
     source: "/communities/start",  // ← URL of source page
     content: "To start a community...",
     embedding: [0.1, 0.2, ...]
   }
   ```

2. **Search results** include source:
   ```typescript
   const results = await searchSimilar(redis, embedding, { k: 6 });
   // Results have: id, source, score, content
   ```

3. **Chatbot response** includes citations:
   ```json
   {
     "message": "To start a React community, you'll need...",
     "citations": [
       {
         "id": "chunk-123",
         "source": "/communities/start",
         "score": 0.92
       }
     ]
   }
   ```

4. **Frontend displays** source links below message

### Source Filtering:

- ✅ Shows: Public pages (`/communities`, `/docs`, etc.)
- ❌ Hides: Admin paths (`/admin/*`, `/api/*`)
- ✅ Shows: Public context files (`public-context/*.md`)

---

## Monitoring & Debugging

### Check Ingestion Status:

**Admin UI:**
```
https://react.foundation/admin/data
```

**API:**
```bash
curl https://react.foundation/api/admin/ingest/status
```

### View Vector Store Content:

**Diagnostic Script:**
```bash
npx tsx scripts/diagnose-chatbot-content.ts
```

**Output:**
```
✅ Vector index found: idx:chatbot:chunks
✅ Found 156 content chunks
✅ Community guide content found (5 results)
```

### Logs:

**Server logs** (Vercel):
```
https://vercel.com/your-project/logs
```

**Search for:**
- `Ingestion started`
- `Crawled X pages`
- `Stored Y chunks`
- `Swapped to new index`

---

## Best Practices

### 1. Run After Content Changes
- ✅ New docs added → Run ingestion
- ✅ Page content updated → Run ingestion
- ✅ Sitemap routes changed → Run ingestion

### 2. Use Sitemap Crawling
- ✅ More reliable than link-following
- ✅ Faster and predictable
- ✅ Skip low-priority pages with `minPriority`

### 3. Automate for Production
- ✅ Set up Vercel Deploy Hooks (recommended)
- ✅ Or use GitHub Actions scheduled
- ✅ Manual as backup

### 4. Test Locally First
```bash
npm run dev
# Visit: http://localhost:3000/admin/data
# Click "Run Ingestion"
# Verify results with diagnostic script
```

### 5. Monitor Ingestion Quality
- Check citation sources in chatbot responses
- Use diagnostic script to verify content
- Test common queries to ensure good results

---

## Troubleshooting

### Problem: Ingestion Fails
**Symptoms:** 500 error, no chunks created

**Solutions:**
1. Check Redis connection
2. Verify OPENAI_API_KEY is set
3. Check ingestion logs in Vercel
4. Ensure sitemap.xml is accessible

### Problem: Chatbot Can't Find Content
**Symptoms:** "I don't have information on..."

**Solutions:**
1. Run diagnostic: `npx tsx scripts/diagnose-chatbot-content.ts`
2. Check if vector store is empty
3. Verify content exists in public-context/ or sitemap
4. Check source attribution is correct

### Problem: Outdated Content
**Symptoms:** Chatbot returns old information

**Solutions:**
1. Run manual ingestion
2. Verify automation is working (check logs)
3. Check that sitemap includes new pages
4. Verify new index was swapped successfully

### Problem: Webhook Not Firing
**Symptoms:** No ingestion after deployment

**Solutions:**
1. Check Vercel webhook is configured correctly
2. Verify VERCEL_DEPLOY_WEBHOOK_SECRET matches
3. Check webhook endpoint logs
4. Test webhook manually with curl

---

## Summary

**Recommended Setup:**
1. ✅ **Primary:** Vercel Deploy Hooks (automatic after every deploy)
2. ✅ **Backup:** GitHub Actions scheduled (daily at 2 AM)
3. ✅ **Emergency:** Manual via Admin UI

This ensures your chatbot always has the latest content with zero manual work!
