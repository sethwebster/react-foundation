# Chatbot Ingestion Troubleshooting Guide

## Current Issues

### Issue 1: Wrong URL Being Crawled

**Symptom:**
```
🚀 Starting ingestion for https://react-foundation-h89i4q83i-sethwebster-pro-team.vercel.app
```

**Expected:**
```
🚀 Starting ingestion for https://react.foundation
```

**Root Cause:**
The `NEXT_PUBLIC_SITE_URL` environment variable is not set in Vercel production, so it falls back to `VERCEL_URL` which is the preview deployment URL.

**Fix:**

1. **Go to Vercel Dashboard:**
   - https://vercel.com/your-team/react-foundation-store
   - Settings → Environment Variables

2. **Add Environment Variable:**
   - Name: `NEXT_PUBLIC_SITE_URL`
   - Value: `https://react.foundation`
   - Apply to: Production, Preview, Development

3. **Redeploy:**
   - Vercel → Deployments → Redeploy

4. **Verify:**
   - Next ingestion run should show: `🚀 Starting ingestion for https://react.foundation`

### Issue 2: 0 Pages Crawled

**Symptom:**
```
🕸️ Using static HTML crawler (fetch + jsdom)...
✅ Crawled 0 pages
```

**Possible Causes:**

#### A. URL Returns Error (Most Likely)

The crawler might be getting HTTP errors (404, 500, 403) when trying to fetch the start URL.

**New logs will show:**
```
⚠️ Website crawling failed: HTTP 404: Not Found for https://...
```

**Fix:**
- Ensure the site is live at the URL
- Check if middleware/auth is blocking the crawler
- Verify no robots.txt blocking

#### B. All Pages Filtered by excludePaths

**Default excludePaths:**
```
/api,/admin,/_next
```

If your site only has these paths, all pages would be excluded.

**New logs will show:**
```
ℹ️ Excluding paths: /api, /admin, /_next
```

**Fix:**
- Review excludePaths in admin UI
- Make sure you have crawlable content pages

#### C. Middleware Blocking Crawler

If you have middleware that requires authentication, the crawler fetch will fail.

**Check:**
```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  // Does this block unauthenticated requests?
}
```

**Fix (Option 1):** Add crawler bypass
```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  // Allow crawler with bypass token
  if (request.headers.get('X-Crawler-Bypass') === process.env.CRAWLER_BYPASS_TOKEN) {
    return NextResponse.next();
  }
  // ... rest of auth logic
}
```

**Fix (Option 2):** Set `CRAWLER_BYPASS_TOKEN` env var and pass it in ingestion request

#### D. Self-Crawling Issue

The ingestion API is running ON Vercel and trying to crawl itself (same deployment). This might cause issues with:
- Request looping
- Serverless timeout
- Internal networking

**Workaround:**
For now, rely on file ingestion from `public-context/` directory. Website crawling can be done:
- From a GitHub Action (external to Vercel)
- From a local script
- After setting NEXT_PUBLIC_SITE_URL to the public domain

## Improved Logging

**New version includes:**

1. **URL being crawled:**
   ```
   ℹ️ Start URL: https://react.foundation
   ```

2. **Filter configuration:**
   ```
   ℹ️ Excluding paths: /api, /admin, /_next
   ```

3. **Detailed errors:**
   ```
   ⚠️ Website crawling failed: HTTP 404: Not Found for https://...
   ```

4. **Crawler stats:**
   ```
   ℹ️ Crawler completed. Visited: 1, Queued: 5
   ```

## What's Working

✅ **File ingestion works perfectly:**
```
📁 Phase 3: Ingesting public-context files...
📄 Ingested README (1 chunks)
✅ Added 1 chunks from files (1 files)
```

Currently ingests:
- ✅ `public-context/README.md` (old version - 1 chunk)

**After next ingestion, will include:**
- ✅ `foundation/foundation-overview.md` (~30 chunks)
- ✅ `foundation/ris-system.md` (~25 chunks)
- ✅ `foundation/cis-system.md` (~30 chunks)
- ✅ `foundation/cois-system.md` (~20 chunks)
- ✅ `faq.md` (~40 chunks)
- ✅ Updated `README.md` (~10 chunks)

**Estimated total:** ~160 chunks of high-quality Foundation documentation

## Recommended Actions

### Short-term (Today)

1. **Set `NEXT_PUBLIC_SITE_URL` in Vercel** ✅
   - Ensures correct URL is used
   - Takes 2 minutes

2. **Re-run ingestion** ✅
   - Will pick up 5 new public-context files
   - File ingestion will work regardless of crawler issue
   - Chatbot will have ~160 chunks of content

3. **Check ingestion logs** ℹ️
   - Look for the new detailed error messages
   - Will show exactly why crawler fails

### Medium-term (This Week)

4. **Debug middleware/auth** if blocking crawler
   - Add CRAWLER_BYPASS_TOKEN
   - Update middleware to allow bypass

5. **Test crawler locally:**
   ```bash
   # From your local machine
   curl https://react.foundation
   ```
   - Should return HTML
   - If it returns redirect/error, that's your issue

### Long-term (Next Sprint)

6. **External ingestion via GitHub Actions**
   - Crawl from external server (not self-crawling)
   - More reliable
   - Can run on schedule

7. **Sitemap.xml integration**
   - Generate sitemap for Next.js pages
   - Crawler can use sitemap instead of following links
   - Guaranteed to find all pages

## Success Criteria

✅ **Minimal Success (Achievable Today):**
- `NEXT_PUBLIC_SITE_URL` = `https://react.foundation`
- 160+ chunks ingested from `public-context/` files
- Chatbot can answer Foundation questions

🎯 **Full Success (After Debugging):**
- URL shows `https://react.foundation`
- 20-50+ pages crawled from website
- 200+ total chunks (files + website)
- Chatbot has complete site knowledge

## Test After Fixes

**Test the chatbot:**

1. "What is the React Foundation?"
   → Should reference foundation-overview.md

2. "How does RIS work?"
   → Should explain 5 components

3. "Can educators get paid?"
   → Should explain CIS system

4. "How do I start a React meetup?"
   → Should reference CoIS (or say "coming soon" if guide not ready)

---

*Last updated: October 2025*
