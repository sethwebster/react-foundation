# Crawler Bypass Setup Guide

## Problem

Your site has access control enabled (Coming Soon page), which blocks the content ingestion crawler from seeing your actual page content.

## Solution: Crawler Bypass Token

We've added a bypass mechanism that allows the internal crawler to access all pages during ingestion.

## Setup Instructions

### 1. Add Bypass Token to Environment

Add this to your `.env.local` file:

```bash
# Generate a secure random token
CRAWLER_BYPASS_TOKEN=your-secure-random-token-here
```

**Generate a secure token:**

```bash
# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Using OpenSSL
openssl rand -hex 32

# Manual (use a password generator)
# Example: crawler_bypass_8h3j9k2m4n5p6q7r8s9t0u1v2w3x4y5z
```

### 2. Restart Your Dev Server

```bash
# Stop your server (Ctrl+C)
# Start it again
npm run dev
```

### 3. Run Content Ingestion

1. Go to `/admin/ingest`
2. Configure your settings
3. Check "Clear Existing Data" (important - to remove old Coming Soon content)
4. Click "Start Ingestion"

The crawler will now send the `X-Crawler-Bypass` header with your token, and the access control middleware will allow it through.

## How It Works

1. **Crawler** sends `X-Crawler-Bypass: your-token` header
2. **Proxy middleware** checks if header matches `CRAWLER_BYPASS_TOKEN` env var
3. If match: Allow through (bypass access control)
4. If no match or missing: Apply normal access control

## Security Notes

✅ **Safe:**
- Token is server-side only (never exposed to client)
- Only works for requests with exact token match
- Only bypasses your Coming Soon gate (not authentication or authorization)

❌ **Keep Secret:**
- Don't commit the token to Git
- Don't share it publicly
- Rotate it if compromised

## Verification

After ingestion completes:

1. Visit `/admin/ingest/inspect`
2. Check sample chunks
3. You should see **diverse content** from different pages
4. NOT all "Coming Soon" text

**Example of good results:**
```
/about: "We're building a sustainable future for the React ecosystem..."
/store: "Official React Foundation storefront featuring limited drops..."
/impact: "See how React Foundation funds are distributed..."
```

**Example of bad results (Coming Soon still showing):**
```
/about: "Coming Soon We're building something revolutionary..."
/store: "Coming Soon We're building something revolutionary..."
/impact: "Coming Soon We're building something revolutionary..."
```

If you still see "Coming Soon" text:
1. Verify `CRAWLER_BYPASS_TOKEN` is set in `.env.local`
2. Verify you restarted your dev server
3. Check the ingestion logs for any errors
4. Try accessing `http://localhost:3000/about` directly - does it show Coming Soon?

## Troubleshooting

### Token Not Working?

Check the server logs during ingestion. You should see:
```
Crawler bypass granted for /about
Crawler bypass granted for /store
```

If you don't see these, the token isn't matching.

### Still Seeing Coming Soon?

1. **Token mismatch**: Make sure token in `.env.local` is exactly what crawler is sending
2. **Server not restarted**: Restart dev server after adding token
3. **Different environment**: Make sure you're running against localhost:3000
4. **Caching**: Clear existing chunks (check "Clear Existing Data" in ingestion UI)

### Production Deployment

For production:
1. Set `CRAWLER_BYPASS_TOKEN` in your hosting environment (Vercel, etc.)
2. Run ingestion from admin panel after deployment
3. Keep the token secret and rotate periodically
