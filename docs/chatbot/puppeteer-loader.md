# Puppeteer Pages Loader Implementation Guide

## Problem Statement

**Current PagesLoader limitation:**
- Fetches server-rendered HTML from live site
- Works great for server-rendered content (6/7 pages)
- Fails for client-heavy pages like `/communities` (30 chars vs expected thousands)

**Why it fails:**
- Client components wrapped in `<Suspense>` render on client-side
- Server HTML only contains skeleton/fallback
- Actual content (community cards, map, filters) requires JavaScript execution

**Current workaround:**
- CommunitiesLoader already loads all 65 communities from Redis
- We get the data, just not the page wrapper text

**Why we want it:**
- Complete page content coverage (7/7 pages instead of 6/7)
- Future-proof for other client-heavy pages
- Automatic extraction as pages evolve

---

## Solution: Puppeteer + @sparticuz/chromium

### What is @sparticuz/chromium?

A **serverless-optimized Chromium binary** specifically designed for AWS Lambda and Vercel:
- Compressed to ~50MB (vs 200MB+ full Chrome)
- Works in Node.js serverless functions
- Actively maintained (used by 1000s of production apps)
- Compatible with Puppeteer

**GitHub:** https://github.com/Sparticuz/chromium

---

## Implementation Steps

### Step 1: Install Dependencies

```bash
npm install puppeteer-core @sparticuz/chromium
```

**Why puppeteer-core?**
- Doesn't bundle Chromium (we provide it separately)
- Smaller package size
- More control over browser binary

### Step 2: Update PagesLoader

**File:** `src/lib/ingest/loaders/pages.tsx`

```typescript
import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';
import { parseHTML } from 'linkedom';
import type { ContentLoader, RawRecord } from '../types';
import { logger } from '@/lib/logger';

interface PageConfig {
  url: string;
  title: string;
  waitForSelector?: string; // Optional: wait for specific element
}

const PAGES: PageConfig[] = [
  { url: '/', title: 'Home' },
  { url: '/about', title: 'About' },
  { url: '/impact', title: 'Impact' },
  { url: '/store', title: 'Store' },
  { url: '/scoring', title: 'How Scoring Works' },
  { url: '/libraries', title: 'Libraries', waitForSelector: 'main' },
  {
    url: '/communities',
    title: 'Communities',
    waitForSelector: '[data-testid="community-card"]', // Wait for cards to render
  },
];

export class PagesLoader implements ContentLoader {
  name = 'PagesLoader';

  async load(): Promise<RawRecord[]> {
    const records: RawRecord[] = [];
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

    logger.info(`[${this.name}] Launching browser for ${PAGES.length} pages`);

    // Launch Puppeteer with serverless Chromium
    const browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    });

    try {
      for (const pageConfig of PAGES) {
        try {
          const page = await browser.newPage();

          logger.info(`[${this.name}] Loading ${pageConfig.url}...`);

          // Navigate to page
          await page.goto(`${baseUrl}${pageConfig.url}`, {
            waitUntil: 'networkidle0', // Wait for network to be idle
            timeout: 30000,
          });

          // Wait for specific selector if provided
          if (pageConfig.waitForSelector) {
            await page.waitForSelector(pageConfig.waitForSelector, {
              timeout: 10000,
            }).catch(() => {
              logger.warn(`[${this.name}] Selector not found: ${pageConfig.waitForSelector}`);
            });
          }

          // Get fully rendered HTML
          const html = await page.content();
          logger.info(`[${this.name}]   Fetched ${html.length} chars of HTML`);

          // Extract text content
          const body = extractText(html);
          logger.info(`[${this.name}]   Extracted ${body.length} chars of text`);

          await page.close();

          if (body.length < 100) {
            logger.warn(`[${this.name}] Skipping ${pageConfig.url} - insufficient content`);
            continue;
          }

          // Extract anchors
          const anchors = extractAnchors(html);

          records.push({
            id: `page-${pageConfig.url.replace(/\//g, '-') || 'home'}`,
            type: 'page',
            title: pageConfig.title,
            url: pageConfig.url,
            updatedAt: new Date().toISOString(),
            tags: { source: 'puppeteer-rendered' },
            body,
            anchors: anchors.length > 0 ? anchors : undefined,
          });

          logger.info(`[${this.name}] ✅ ${pageConfig.title}: ${body.length} chars, ${anchors.length} anchors`);
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : 'Unknown error';
          logger.error(`[${this.name}] Failed ${pageConfig.url}: ${errorMsg}`);
        }
      }
    } finally {
      await browser.close();
    }

    logger.info(`[${this.name}] Loaded ${records.length} pages successfully`);
    return records;
  }
}

// extractText() and extractAnchors() remain the same
```

### Step 3: Configure Vercel Function

**File:** `vercel.json`

```json
{
  "functions": {
    "app/api/ingest/full/route.ts": {
      "memory": 1024,
      "maxDuration": 300,
      "includeFiles": "node_modules/@sparticuz/chromium/**"
    }
  }
}
```

**Why 1024MB memory?**
- Chromium needs ~512MB to run
- Our function needs ~256MB
- Buffer for safety

### Step 4: Environment Variables (Optional)

For development, you can use local Chrome:

```bash
# .env.local
CHROME_EXECUTABLE_PATH=/Applications/Google Chrome.app/Contents/MacOS/Google Chrome
```

```typescript
// In PagesLoader
const executablePath = process.env.CHROME_EXECUTABLE_PATH ||
                      await chromium.executablePath();
```

This lets you use local Chrome in dev (faster) and bundled Chromium in production.

---

## Testing

### Local Testing

```bash
# Install dependencies
npm install puppeteer-core @sparticuz/chromium

# Start dev server
npm run dev

# Run ingestion
# Navigate to http://localhost:3000/admin/ingest-full
# Click "Start Full Ingestion"
```

**Expected logs:**
```
[PagesLoader] Launching browser for 7 pages
[PagesLoader] Loading /...
[PagesLoader]   Fetched 45231 chars of HTML
[PagesLoader]   Extracted 8432 chars of text
[PagesLoader] ✅ Home: 8432 chars, 12 anchors
...
[PagesLoader] Loading /communities...
[PagesLoader]   Fetched 82341 chars of HTML
[PagesLoader]   Extracted 12453 chars of text  ← Now has full content!
[PagesLoader] ✅ Communities: 12453 chars, 8 anchors
[PagesLoader] Loaded 7 pages successfully  ← All 7 pages!
```

### Production Testing

After deploying to Vercel:
1. Check function logs for Chromium loading
2. Verify pages load successfully
3. Monitor function duration (~60-90s total)
4. Check memory usage (should be <800MB)

---

## Performance Implications

### Local Development

**Current (fetch only):**
- 7 pages × 1 sec = ~7 seconds
- Memory: ~100MB

**With Puppeteer:**
- Browser launch: ~2-3 seconds (one-time)
- 7 pages × 2 sec = ~14 seconds
- Browser close: ~1 second
- **Total: ~17-20 seconds** (vs 7 seconds)
- Memory: ~600MB (vs 100MB)

### Production (Vercel)

**Current:**
- PagesLoader: ~10 seconds
- Total ingestion: ~60 seconds
- Function duration: 60s
- Memory: ~256MB
- Cost: ~$0.01 per ingestion

**With Puppeteer:**
- PagesLoader: ~25-30 seconds
- Total ingestion: ~75-90 seconds
- Function duration: 90s
- Memory: ~1GB (need to configure)
- Cost: ~$0.03-0.05 per ingestion (3-5x more)

**Cost per month** (daily ingestion):
- Current: ~$0.30/month
- With Puppeteer: ~$0.90-1.50/month

Still very affordable!

---

## Bundle Size Impact

**Current bundle:**
- Next.js app: ~2-3MB
- Ingest dependencies: ~5MB
- **Total: ~8MB**

**With @sparticuz/chromium:**
- Chromium binary: ~50MB
- Puppeteer-core: ~2MB
- **Total: ~60MB**

**Vercel limits:**
- Serverless function max: 250MB (we're well under)
- Cold start slower (~3-5 seconds vs ~1 second)

---

## Vercel Configuration

### Option A: Apply to Ingest Function Only

```json
{
  "functions": {
    "app/api/ingest/full/route.ts": {
      "memory": 1024,
      "maxDuration": 300,
      "includeFiles": "node_modules/@sparticuz/chromium/**"
    }
  }
}
```

### Option B: Apply to All API Routes (not recommended)

```json
{
  "functions": {
    "app/api/**": {
      "memory": 1024
    }
  }
}
```

**Recommendation:** Option A - only the ingestion function needs it.

---

## Alternative: Playwright

If Puppeteer doesn't work, **Playwright** has even better serverless support:

```bash
npm install playwright-core
```

```typescript
import { chromium } from 'playwright-core';

const browser = await chromium.launch({
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
});
```

Playwright bundles browsers automatically and has first-class serverless support.

---

## Implementation Checklist

When ready to implement:

- [ ] Install `puppeteer-core` and `@sparticuz/chromium`
- [ ] Update `src/lib/ingest/loaders/pages.tsx` with Puppeteer code
- [ ] Update `vercel.json` with memory and includeFiles config
- [ ] Test locally (use local Chrome for speed)
- [ ] Deploy to Vercel preview
- [ ] Test in preview environment
- [ ] Monitor function duration and memory
- [ ] Check logs for any Chromium errors
- [ ] Verify all 7 pages load successfully
- [ ] Check /communities page has full content (~10k+ chars)
- [ ] Deploy to production
- [ ] Monitor costs

---

## What You'll Get

**With Puppeteer implementation:**

**MDXLoader:** 15 docs (~250 chunks)
- Foundation docs, systems, guides

**PagesLoader:** 7 pages (~150-200 chunks) ← IMPROVED!
- Homepage: Full hero, mission, pillars, numbers
- About: Complete governance, how it works
- Impact: Full reporting content
- Store: Live drop data, categories
- Scoring: RIS explanation
- Libraries: Full library list with data
- Communities: Full community cards, map data ← NEW!

**CommunitiesLoader:** 65 communities (~250 chunks)
- Individual community details

**LibrariesLoader:** 32 libraries (~100 chunks)
- Library details

**Total:** ~750-800 chunks (vs current ~600)

**Chatbot will know:**
- ✅ Complete page content (not just server-rendered parts)
- ✅ Client-rendered community cards and data
- ✅ Live drop information from store page
- ✅ Dynamic library listings
- ✅ Everything visitors see on the site

---

## Cost-Benefit Analysis

### Benefits

**Content Quality:**
- Complete coverage (7/7 pages)
- Real dynamic data
- Client-rendered content included
- ~25% more chunks (~150 additional)

**Maintenance:**
- Zero - automatically gets latest content
- No manual markdown files
- Works as site evolves

**User Experience:**
- Chatbot can answer about anything on site
- Citations link to actual pages
- Up-to-date with live site

### Costs

**Financial:**
- +$0.60-1.20/month (~$15/year)
- Negligible for production app

**Performance:**
- +30 seconds per ingestion
- Still completes in <2 minutes
- Acceptable for daily/weekly runs

**Complexity:**
- +1 dependency (@sparticuz/chromium)
- +10 lines of code
- Minimal added complexity

**Bundle Size:**
- +50MB to deployment
- Still under Vercel limits (250MB max)
- Slower cold starts (+2-3 seconds)

### Recommendation

**Implement it!** The benefits far outweigh costs:
- ✅ Minimal cost increase (~$1/month)
- ✅ Complete content coverage
- ✅ Zero maintenance
- ✅ Scales as site grows

---

## Current Status (Without Puppeteer)

**What Works:**
- ✅ 6 pages with full content (home, about, impact, store, scoring, libraries)
- ✅ 65 communities from CommunitiesLoader
- ✅ 32 libraries from LibrariesLoader
- ✅ ~600 chunks total

**What's Missing:**
- ⚠️ /communities page wrapper text (~30 chars instead of ~10k)
- ⚠️ Any future client-heavy pages

**Is it good enough?**
Yes! Current coverage is comprehensive. Puppeteer is an enhancement, not a requirement.

---

## Decision Matrix

### Implement Now If:
- ✅ You want complete coverage
- ✅ Willing to spend extra ~$1/month
- ✅ Have 2-3 hours to implement and test
- ✅ Want future-proof solution

### Defer to Later If:
- ✅ Current coverage is sufficient
- ✅ Want to ship quickly
- ✅ Can revisit after seeing chatbot usage
- ✅ Want to minimize complexity

---

## Estimated Implementation Time

**Total: 2-3 hours**

- Install dependencies: 5 min
- Update PagesLoader: 30 min
- Update vercel.json: 5 min
- Local testing: 30 min
- Deploy to preview: 10 min
- Test in preview: 20 min
- Debug any issues: 30-60 min
- Deploy to production: 10 min
- Monitor and verify: 20 min

---

## Troubleshooting Guide

### Issue: "Chromium failed to launch"

**Cause:** Memory limit too low

**Fix:** Increase memory in vercel.json
```json
{
  "functions": {
    "app/api/ingest/full/route.ts": {
      "memory": 2048  // Try 2GB if 1GB fails
    }
  }
}
```

### Issue: "Timeout during page load"

**Cause:** Page takes too long to fully render

**Fix:** Increase timeout or adjust wait strategy
```typescript
await page.goto(url, {
  waitUntil: 'domcontentloaded', // Less strict than networkidle0
  timeout: 60000, // 60 seconds
});
```

### Issue: "Bundle size exceeded"

**Cause:** Vercel function bundle too large

**Fix:** Exclude Chromium from bundle, load from layer
- This is advanced - see @sparticuz/chromium docs
- Usually not needed (default works fine)

### Issue: "Still only getting 30 chars from /communities"

**Cause:** Not waiting long enough for client components

**Fix:** Add explicit wait
```typescript
await page.waitForSelector('[data-testid="community-card"]');
await page.waitForTimeout(2000); // Extra 2 seconds
```

---

## Monitoring After Implementation

### Key Metrics to Watch

**Function Duration:**
- Target: <90 seconds
- Alert if: >120 seconds

**Memory Usage:**
- Target: <800MB
- Alert if: >900MB (approaching 1GB limit)

**Success Rate:**
- Target: 7/7 pages
- Alert if: <6 pages loaded

**Content Quality:**
- Check /communities text length > 5000 chars
- Verify community cards present in extracted text

### Vercel Dashboard

Monitor at: https://vercel.com/your-team/project/logs

Filter for: `/api/ingest/full`

Watch for:
- Function duration
- Memory usage
- Error rates
- Cold start time

---

## Rollback Plan

If Puppeteer causes issues:

### Immediate Rollback

```typescript
// src/app/api/ingest/full/route.ts
const loaders = [
  new MDXLoader(),
  // new PagesLoader(), // DISABLED - revert to fetch-only approach
  new CommunitiesLoader(),
  new LibrariesLoader(),
];
```

Redeploy - back to 6 pages, still functional.

### Full Rollback

```bash
git revert <commit-hash>
git push origin main
```

Current system with fetch-only PagesLoader is already working and deployed.

---

## Future Enhancements

### Phase 1: Basic Puppeteer (This Doc)
- Launch browser per ingestion
- Fetch all pages
- Extract text

### Phase 2: Optimize
- Reuse browser instance across pages
- Parallel page loading (Promise.all)
- Cache rendered HTML for 1 hour

### Phase 3: Advanced
- Smart selectors per page type
- Screenshot generation for verification
- Accessibility tree extraction (for better context)
- PDF generation of pages for archival

---

## References

- **@sparticuz/chromium:** https://github.com/Sparticuz/chromium
- **Puppeteer Docs:** https://pptr.dev
- **Vercel Function Limits:** https://vercel.com/docs/functions/serverless-functions/runtimes#limits
- **Next.js Streaming:** https://nextjs.org/docs/app/building-your-application/routing/loading-ui-and-streaming

---

## Decision

**Date:** October 25, 2025

**Status:** Documented, not yet implemented

**Recommendation:** Implement after validating current system works well in production. Current coverage is good enough to ship, Puppeteer can be added as enhancement.

**Next Steps:**
1. Deploy current system to production
2. Monitor chatbot quality for 1-2 weeks
3. If users ask about content missing from /communities wrapper, implement Puppeteer
4. If current coverage is sufficient, defer indefinitely

---

*Document created: October 25, 2025*
*Ready for implementation when needed*
