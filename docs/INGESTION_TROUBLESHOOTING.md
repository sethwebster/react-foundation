# Content Ingestion Troubleshooting

## Problem: Crawler Only Sees "Coming Soon" Page

If your ingestion shows all pages with identical "Coming Soon" content, your site likely has access control enabled.

### Solution A: Temporarily Disable Access Control

**During ingestion only:**

1. Comment out or temporarily disable your access control middleware
2. Run the ingestion
3. Re-enable access control after completion

**How to disable** (depends on your implementation):
- If you have a middleware file, comment out the access check
- If you have a layout wrapper with access gates, add a bypass for localhost
- Set `NEXT_PUBLIC_ENABLE_ACCESS_CONTROL=false` temporarily

### Solution B: Use Server-Side Ingestion

Instead of crawling via HTTP, read directly from the file system:

```typescript
// Read pages directly from src/app
// Parse MDX/TSX files
// Extract metadata and content
// No HTTP crawling needed
```

### Solution C: Add Crawler Bypass

Add to `.env.local`:
```bash
CRAWLER_BYPASS_TOKEN=your-secret-token
```

Then update your access control middleware to check for:
```typescript
if (request.headers.get('X-Crawler-Bypass') === process.env.CRAWLER_BYPASS_TOKEN) {
  return NextResponse.next(); // Allow crawler through
}
```

## Recommended Approach

**For production sites with access control:**

1. Create a separate ingestion script that:
   - Reads MDX/markdown files directly from your content directory
   - Parses front matter and content
   - Chunks and embeds the content
   - No HTTP crawling needed

2. Run this script as part of your build process or manually when content changes

3. This avoids HTTP round-trips and access control issues entirely

## Verifying Ingestion Worked

After ingestion, check `/admin/ingest/inspect`:

✅ **Good signs:**
- Diverse content previews (not all the same)
- Different sources (`/about`, `/store`, etc.)
- Content length varies per page

❌ **Bad signs:**
- All chunks have identical content
- Content all shows "Coming Soon" or navigation text
- Very short content chunks (< 100 chars)

## Quick Test

To verify what content the crawler sees:

```bash
curl http://localhost:3000/about
```

If this shows "Coming Soon" instead of your actual "About" page content, that's what the crawler is seeing too.
