# Vercel Deploy Webhook Troubleshooting

## Issue: "Invalid webhook signature"

The webhook now supports **3 authentication methods**. Try them in order:

### ✅ Method 1: Query Parameter (Simplest)

**Setup in Vercel:**
```
URL: https://react.foundation/api/webhooks/vercel-deploy?secret=YOUR_SECRET
```

**Environment Variable:**
```bash
VERCEL_DEPLOY_WEBHOOK_SECRET=your-secret-here
```

**How it works:**
- Secret passed as query parameter `?secret=xxx`
- No signature calculation needed
- Simplest and most reliable

**Test:**
```bash
curl -X POST "https://react.foundation/api/webhooks/vercel-deploy?secret=YOUR_SECRET" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "deployment.succeeded",
    "deployment": {"id": "test", "url": "react.foundation", "name": "test"},
    "createdAt": 1234567890,
    "region": "sfo1",
    "payload": {"deploymentUrl": "react.foundation", "projectId": "test"}
  }'
```

---

### ✅ Method 2: Bearer Token (Recommended)

**Setup in Vercel:**
```
URL: https://react.foundation/api/webhooks/vercel-deploy
Headers: Authorization: Bearer YOUR_SECRET
```

**Environment Variable:**
```bash
VERCEL_DEPLOY_WEBHOOK_SECRET=your-secret-here
```

**How it works:**
- Secret sent in `Authorization: Bearer xxx` header
- Clean and standard approach
- Works if Vercel supports custom headers

**Test:**
```bash
curl -X POST "https://react.foundation/api/webhooks/vercel-deploy" \
  -H "Authorization: Bearer YOUR_SECRET" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "deployment.succeeded",
    "deployment": {"id": "test", "url": "react.foundation", "name": "test"},
    "createdAt": 1234567890,
    "region": "sfo1",
    "payload": {"deploymentUrl": "react.foundation", "projectId": "test"}
  }'
```

---

### ✅ Method 3: HMAC Signature (Advanced)

**Setup in Vercel:**
```
URL: https://react.foundation/api/webhooks/vercel-deploy
Headers: x-vercel-signature: <computed-hmac>
```

**How it works:**
- Webhook computes HMAC-SHA1 of request body
- Vercel sends signature in `x-vercel-signature` header
- Most secure but complex

**Note:** This is for Vercel Integration webhooks, not Deploy Hooks.

---

## Current Logs

Check Vercel logs to see which auth method is being used:

```
Vercel webhook received: {
  hasAuthHeader: true/false,
  hasSignature: true/false,
  hasQuerySecret: true/false,
  hasSecret: true/false,
  bodyLength: 123
}
```

If authenticated successfully, you'll see:
```
✅ Authenticated via Bearer token
✅ Authenticated via query parameter
✅ Authenticated via HMAC signature
```

If failed:
```
❌ Webhook authentication failed - no valid auth method
```

---

## Step-by-Step Fix

### 1. Check Environment Variable

```bash
# In Vercel:
Settings → Environment Variables → Check VERCEL_DEPLOY_WEBHOOK_SECRET exists
```

Make sure:
- Variable name is exact: `VERCEL_DEPLOY_WEBHOOK_SECRET`
- Value is set (no spaces)
- Applied to Production environment
- Redeploy after adding

### 2. Use Query Parameter Method (Easiest)

In Vercel Deploy Hook settings:
```
Change URL from:
  https://react.foundation/api/webhooks/vercel-deploy

To:
  https://react.foundation/api/webhooks/vercel-deploy?secret=YOUR_SECRET
```

Replace `YOUR_SECRET` with the actual value from `VERCEL_DEPLOY_WEBHOOK_SECRET`.

### 3. Test Manually

```bash
# Get your secret
SECRET="your-secret-here"

# Test query parameter method
curl -X POST "https://react.foundation/api/webhooks/vercel-deploy?secret=$SECRET" \
  -H "Content-Type: application/json" \
  -d '{"type":"deployment.succeeded","deployment":{"id":"test","url":"react.foundation","name":"test"},"createdAt":1234567890,"region":"sfo1","payload":{"deploymentUrl":"react.foundation","projectId":"test"}}'

# Should return: {"message": "Ingestion triggered", ...}
```

### 4. Check Logs

In Vercel:
```
Project → Logs → Filter by "webhook"
```

Look for:
- "Vercel webhook received" - Webhook was called
- "Authenticated via..." - Auth succeeded
- "Ingestion triggered" - Success!
- "authentication failed" - Auth problem

### 5. Trigger Test Deploy

```bash
# Push a commit to trigger deployment
git commit --allow-empty -m "Test webhook"
git push

# Check Vercel logs for webhook call
```

---

## Alternative: Use GitHub Actions Instead

If webhooks are problematic, use GitHub Actions (already set up):

### Manual Trigger:
```
1. Go to: GitHub → Actions → "Trigger Chatbot Ingestion"
2. Click "Run workflow"
3. Select environment: production
4. Click "Run workflow"
```

### Scheduled (Automatic):
Already configured to run daily at 2 AM UTC.

### After Deploy (via GitHub):
Add to `.github/workflows/trigger-ingestion.yml`:

```yaml
on:
  push:
    branches: [main]
  workflow_run:
    workflows: ["Deploy"]
    types: [completed]
```

---

## Debug Mode

To see exactly what Vercel is sending, temporarily log everything:

**Edit:** `src/app/api/webhooks/vercel-deploy/route.ts`

Add after line 57:
```typescript
logger.info('Full webhook details:', {
  headers: Object.fromEntries(request.headers.entries()),
  url: request.url,
  method: request.method,
});
```

Redeploy and check logs to see exact headers Vercel sends.

---

## Quick Fix Checklist

- [ ] Environment variable `VERCEL_DEPLOY_WEBHOOK_SECRET` is set in Vercel
- [ ] Variable is applied to Production environment
- [ ] Redeployed after adding environment variable
- [ ] Using query parameter method: `?secret=YOUR_SECRET` in URL
- [ ] Secret matches exactly (no spaces, quotes, etc.)
- [ ] Webhook endpoint is publicly accessible (test with curl)
- [ ] Checked Vercel logs for authentication messages

---

## Still Not Working?

### Option 1: Disable Auth Temporarily

For testing only:

Edit `src/app/api/webhooks/vercel-deploy/route.ts`:

```typescript
// TEMPORARY: Skip auth for testing
const authenticated = true; // Always allow
```

If this works, the issue is authentication. Re-enable auth and use query parameter method.

### Option 2: Use Simpler Endpoint

Create a test endpoint at `src/app/api/test-webhook/route.ts`:

```typescript
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  console.log('Test webhook called!');
  return NextResponse.json({ success: true });
}
```

Point Vercel webhook to this to verify webhooks work at all.

### Option 3: Contact for Help

If still stuck, share:
1. Vercel logs screenshot (webhook received log)
2. Environment variable screenshot (redact secret value)
3. Deploy hook configuration screenshot
4. Result of manual curl test

---

## Success Indicators

When working correctly, you'll see:

**Vercel Logs:**
```
✅ Vercel webhook received
✅ Authenticated via query parameter
✅ Vercel deployment webhook received: type=deployment.succeeded
✅ Triggering post-deployment ingestion...
✅ Ingestion triggered successfully
```

**Chatbot:**
- New content appears in responses
- Source citations updated
- Community guide question works

**Admin UI:**
- Visit `/admin/data`
- See recent ingestion in logs
- Check "Last Ingestion" timestamp
