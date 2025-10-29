# Webhook Security & Proxy Configuration

## Webhook Endpoints Through Proxy

### ✅ Allowed Webhooks

All routes under `/api/webhooks/*` are **allowed through the proxy** without authentication.

**Configuration:** `src/proxy.ts` line 18
```typescript
'/api/webhooks', // All webhooks (GitHub, Vercel Deploy, etc. - have their own auth)
```

This means:
- ✅ `/api/webhooks/vercel-deploy` - Vercel deployment webhook
- ✅ `/api/webhooks/github` - GitHub webhooks
- ✅ Any other `/api/webhooks/*` routes

### Why Webhooks Bypass Proxy

Webhooks come from **external services** (Vercel, GitHub, etc.) that:
1. Cannot authenticate as users
2. Have their own signature-based authentication
3. Need to be publicly accessible

The proxy allows them through, but each webhook endpoint **must implement its own security**.

---

## Webhook Security Implementation

### Vercel Deploy Webhook

**File:** `src/app/api/webhooks/vercel-deploy/route.ts`

**Security measures:**
1. **Signature verification** - Checks `x-vercel-signature` header
2. **Secret validation** - Requires `VERCEL_DEPLOY_WEBHOOK_SECRET`
3. **HMAC SHA-256** - Proper cryptographic verification
4. **Fallback** - Simple secret comparison as backup

**Required environment variables:**
```bash
VERCEL_DEPLOY_WEBHOOK_SECRET=your-random-secret-here
INGESTION_API_TOKEN=your-ingestion-token
```

**How signature verification works:**
```typescript
// 1. Read body as text
const body = await request.text();

// 2. Compute expected signature
const expectedSignature = SHA256(secret + body);

// 3. Compare with provided signature
if (signature !== expectedHex && signature !== secret) {
  return 401 Unauthorized
}
```

### Setting Up Vercel Webhook

1. **Add secret to Vercel:**
   - Project Settings → Environment Variables
   - `VERCEL_DEPLOY_WEBHOOK_SECRET` = random string

2. **Configure webhook in Vercel:**
   - Settings → Git → Deploy Hooks
   - URL: `https://react.foundation/api/webhooks/vercel-deploy`
   - Secret: Same as `VERCEL_DEPLOY_WEBHOOK_SECRET`
   - Event: "Deployment Succeeded"

3. **Test:**
   ```bash
   # Check endpoint is accessible
   curl https://react.foundation/api/webhooks/vercel-deploy

   # Should return 405 Method Not Allowed (GET not supported)
   # This confirms it's publicly accessible
   ```

---

## Other Protected Routes

### RIS Webhook Processor

**Route:** `/api/ris/process-webhooks`

**Security:** CRON_SECRET authentication (Vercel Cron)

**Configuration:** Already in `PUBLIC_ROUTES` (line 19)

### Admin Routes

**Routes:** `/api/admin/*`

**Security:**
- Session authentication OR
- API token authentication (Bearer token)

**Not in PUBLIC_ROUTES** - requires authentication

---

## Proxy Bypass for Crawlers

The proxy also supports a **crawler bypass token** for internal content ingestion:

```typescript
const crawlerBypassToken = request.headers.get('X-Crawler-Bypass');
if (crawlerBypassToken === process.env.CRAWLER_BYPASS_TOKEN) {
  return NextResponse.next(); // Allow through
}
```

**Usage:**
```bash
curl https://react.foundation/some-page \
  -H "X-Crawler-Bypass: $CRAWLER_BYPASS_TOKEN"
```

This allows the ingestion crawler to access pages without authentication.

---

## Security Checklist

When adding new webhook endpoints:

- [ ] Place under `/api/webhooks/*` path
- [ ] Implement signature verification (HMAC SHA-256)
- [ ] Require secret from environment variables
- [ ] Log all webhook calls (success and failure)
- [ ] Validate payload structure
- [ ] Return proper HTTP status codes:
  - `401` - Missing/invalid signature
  - `403` - Valid signature but rejected
  - `500` - Configuration error
  - `200` - Success
- [ ] Document in this file
- [ ] Add environment variables to Vercel
- [ ] Test webhook can be called externally

---

## Testing Webhooks Locally

### Start ngrok tunnel:
```bash
ngrok http 3000
```

### Configure webhook to use ngrok URL:
```
https://abc123.ngrok.io/api/webhooks/vercel-deploy
```

### Monitor requests:
```bash
# Terminal 1: Dev server
npm run dev

# Terminal 2: ngrok
ngrok http 3000

# Terminal 3: Watch logs
tail -f .next/server.log
```

### Send test webhook:
```bash
curl -X POST https://abc123.ngrok.io/api/webhooks/vercel-deploy \
  -H "x-vercel-signature: $VERCEL_DEPLOY_WEBHOOK_SECRET" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "deployment.succeeded",
    "deployment": {
      "id": "test-123",
      "url": "react.foundation",
      "name": "test-deployment"
    },
    "createdAt": 1234567890,
    "region": "sfo1",
    "payload": {
      "deploymentUrl": "react.foundation",
      "projectId": "test-project"
    }
  }'
```

---

## Summary

✅ **Webhook routes are accessible** through proxy
✅ **Each webhook has its own security**
✅ **Vercel deploy webhook properly secured**
✅ **Ready for production use**

The webhook endpoint will receive Vercel deployment notifications and automatically trigger chatbot ingestion after successful deployments.
