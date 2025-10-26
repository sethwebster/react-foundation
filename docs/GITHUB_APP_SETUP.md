# GitHub App Setup for RIS Collection

> **📌 Important:** Webhooks are **OPTIONAL**. This guide covers the full setup with webhooks (real-time updates), but you can skip Step 4 if you only need monthly updates. See [RIS Deployment Modes](./RIS_DEPLOYMENT_MODES.md) to choose the right configuration for your needs.

## Quick Navigation

- **Just need basic setup (no webhooks)?** → Follow Steps 1-3, 5-6, skip Step 4
- **Want real-time updates?** → Follow all steps including Step 4
- **Not sure which to choose?** → See [RIS Deployment Modes](./RIS_DEPLOYMENT_MODES.md)

---

## Why Use a GitHub App?

**Rate Limit Comparison:**

| Method | Rate Limit | Notes |
|--------|------------|-------|
| Single PAT | 5,000/hour | Tied to your account |
| Multiple PATs from same account | **Still 5,000/hour!** | All share the same limit |
| Multiple PATs from different accounts | 5,000/hour × accounts | Violates GitHub ToS |
| **GitHub App (1 installation)** | **5,000/hour** | Professional, scalable |
| **GitHub App (2 installations)** | **10,000/hour** | Install on multiple orgs |
| **GitHub App (3+ installations)** | **Scales linearly** | Plus repo-based increases |

**Bottom Line:** GitHub Apps are the only legitimate way to scale beyond 5,000/hour.

## Step-by-Step Setup

**Total time:**
- Without webhooks: ~15 minutes
- With webhooks: ~30 minutes

---

## REQUIRED STEPS

These steps are required for all deployments using the GitHub App (Mode 2 and Mode 3).

### 1. Create the GitHub App

Go to: **https://github.com/settings/apps/new**

#### Basic Information
- **GitHub App name:** `React Foundation RIS Collector` (or your preferred name)
- **Homepage URL:** `https://react.foundation` (or your domain)
- **Description:** `Collects metrics for React Impact Score calculation`

#### Webhook
- **Webhook:** ❌ Uncheck "Active" for now (you can enable this later in Step 4 if you want real-time updates)

#### Permissions

**Repository permissions:**
- **Contents:** `Read-only` ✅ (read repo data)
- **Issues:** `Read-only` ✅ (read issues)
- **Metadata:** `Read-only` ✅ (read basic repo info)
- **Pull requests:** `Read-only` ✅ (read PRs)

All other permissions: Leave as "No access"

#### Where can this GitHub App be installed?
- Select: **"Any account"** (allows installing on multiple orgs for scaling)

#### Click "Create GitHub App"

### 2. Generate Private Key

After creation, you'll see your app settings page:

1. Scroll down to **"Private keys"** section
2. Click **"Generate a private key"**
3. A `.pem` file will download - **save this securely!**
4. **Note your App ID** (shown at the top of settings page)

### 3. Install the App

1. In app settings, click **"Install App"** in left sidebar
2. Choose which organization/account to install on:
   - Your personal account
   - React Foundation org (if you have access)
   - Any other orgs you need data from
3. Select repository access:
   - **"All repositories"** (recommended - collector only has read access anyway)
   - Or select specific repos if preferred
4. Click **"Install"**

**Pro Tip:** Install on multiple orgs to scale rate limits!
- 1 installation = 5,000/hour
- 2 installations = 10,000/hour
- 3 installations = 15,000/hour

---

## OPTIONAL STEPS

These steps add real-time webhook support (Mode 3). **You can skip this section** if you only need monthly updates.

### 4. Enable Webhooks for Real-time Updates (OPTIONAL)

> **⚠️ Skip this step if:**
> - You're just testing the system
> - Monthly updates are sufficient for your use case
> - You want a simpler deployment
>
> **✅ Follow this step if:**
> - You want real-time score updates (< 2 minutes)
> - You want to engage maintainers with instant feedback
> - You want to reduce API polling load
>
> See [RIS Deployment Modes](./RIS_DEPLOYMENT_MODES.md) for a detailed comparison.

**If you're skipping webhooks, jump to Step 5.**

Back in app settings (only if you want real-time updates):

1. Scroll to **"Webhook"** section
2. Check **"Active"** ✅
3. **Webhook URL:** `https://react.foundation/api/webhooks/github`
   (Replace with your domain)
4. **Webhook secret:** Click "Generate" → Copy the generated secret
5. **Subscribe to events:**
   - ✅ **Pull requests**
   - ✅ **Pushes**
   - ✅ **Issues**
   - ✅ **Releases**
   - ✅ **Meta** (installation events)
6. Click **"Save changes"**

**Note:** For local development, use ngrok or smee.io to tunnel webhooks:
```bash
# Using smee.io (recommended for testing)
npm install --global smee-client
smee --url https://smee.io/your-unique-url --target http://localhost:3000/api/webhooks/github
```

**Next:** If you enabled webhooks, continue to Step 5. If you skipped webhooks, jump to Step 5 and skip the webhook-related environment variables.

---

## CONFIGURATION

### 5. Configure Environment Variables

#### Option A: Inline Private Key (Vercel, Railway, etc.)

**Without webhooks (Mode 2):**
```bash
# .env

# REQUIRED: GitHub App credentials
GITHUB_APP_ID=123456
GITHUB_APP_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----
MIIEpAIBAAKCAQEA1234567890abcdefghijklmnopqrstuvwxyz...
(full key here, including newlines)
-----END RSA PRIVATE KEY-----"

# OPTIONAL: Fallback PAT if app fails
GITHUB_TOKEN=ghp_your_token_here
```

**With webhooks (Mode 3):**
```bash
# .env

# REQUIRED: GitHub App credentials
GITHUB_APP_ID=123456
GITHUB_APP_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----
MIIEpAIBAAKCAQEA1234567890abcdefghijklmnopqrstuvwxyz...
(full key here, including newlines)
-----END RSA PRIVATE KEY-----"

# REQUIRED (for webhooks): Webhook configuration
GITHUB_WEBHOOK_SECRET=your_webhook_secret_here
CRON_SECRET=your_random_cron_secret_here

# OPTIONAL: Public install URL (shown on /scoring page)
NEXT_PUBLIC_GITHUB_APP_INSTALL_URL=https://github.com/apps/your-app-name/installations/new

# OPTIONAL: Fallback PAT if app fails
GITHUB_TOKEN=ghp_your_token_here
```

#### Option B: File Path (Local development)

If your hosting platform supports file uploads:

**Without webhooks:**
```bash
# .env
GITHUB_APP_ID=123456
GITHUB_APP_PRIVATE_KEY_PATH=/path/to/private-key.pem
```

**With webhooks:**
```bash
# .env
GITHUB_APP_ID=123456
GITHUB_APP_PRIVATE_KEY_PATH=/path/to/private-key.pem
GITHUB_WEBHOOK_SECRET=your_webhook_secret_here
CRON_SECRET=your_random_cron_secret_here
```

Then update code to read from file:
```typescript
const privateKey = process.env.GITHUB_APP_PRIVATE_KEY ||
  (process.env.GITHUB_APP_PRIVATE_KEY_PATH
    ? fs.readFileSync(process.env.GITHUB_APP_PRIVATE_KEY_PATH, 'utf8')
    : undefined);
```

---

## TESTING

### 6. Test the Integration

#### Test A: Manual Collection (All Modes)

Run a collection to test app authentication:

```bash
curl -X POST http://localhost:3000/api/ris/collect \
  -H "Content-Type: application/json" \
  -H "Cookie: your-auth-cookie"
```

Watch the logs - you should see:
```
🤖 Initializing GitHub App authentication (App ID: 123456)...
   Found 1 installation(s)
   ✓ Installation 1: react-foundation-org
✅ GitHub App ready with 1 installation(s) (5000/hour total)
```

#### Test B: Webhook Delivery (Mode 3 only)

Test webhooks by triggering an event:

1. **Go to a test repo** where you installed the app
2. **Create a test PR or issue**
3. **Check webhook delivery:**
   - Go to GitHub App settings → Advanced → Recent Deliveries
   - Click on the latest delivery
   - Should show **✓ 200 OK** response
4. **Check server logs:**
   ```
   📥 Webhook received: pull_request (abc123-delivery-id)
   📥 Queued pull_request event for facebook/react
   ✓ Updated activity for facebook/react
   ```
5. **Verify score update:**
   - Visit `/scoring` page
   - Find your test repo in the dashboard
   - Should show ⚡ Real-time status
   - Score should update within 30 seconds

#### Test C: Local Webhook Testing (Mode 3 only)

For local development, use smee.io:

```bash
# Terminal 1: Start smee proxy
npm install --global smee-client
smee --url https://smee.io/YOUR-CHANNEL --target http://localhost:3000/api/webhooks/github

# Terminal 2: Start dev server
npm run dev

# Terminal 3: Trigger test event
# Open GitHub App settings → Advanced → Redeliver a recent event
```

## Rate Limit Monitoring

Check your current rate limit status:

```bash
# Using the GitHub CLI
gh api rate_limit

# Using curl
curl -H "Authorization: Bearer $GITHUB_TOKEN" \
  https://api.github.com/rate_limit
```

## Troubleshooting

### "Failed to initialize GitHub App"

**Possible causes:**
1. App ID is wrong (check settings page)
2. Private key is malformed (ensure full key including `BEGIN` and `END` lines)
3. App not installed on any organizations
4. Network issues

**Solution:** Check logs for specific error. The system will automatically fall back to PAT if configured.

### "All X tokens exhausted"

This means you're hitting rate limits. Solutions:
1. Install app on more organizations (each adds 5,000/hour)
2. Wait for rate limit reset (hourly)
3. Optimize collection (reduce batch size, add delays)

### Private Key Format Issues

**Common mistakes:**
```bash
# ❌ WRONG - Missing quotes
GITHUB_APP_PRIVATE_KEY=-----BEGIN RSA PRIVATE KEY-----
...

# ❌ WRONG - Escaped newlines lost
GITHUB_APP_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----MIIEpAIB..."

# ✅ CORRECT - Full key with newlines in quotes
GITHUB_APP_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----
MIIEpAIBAAKCAQEA...
-----END RSA PRIVATE KEY-----"
```

**Vercel/Railway:** Use the UI to paste the key - it handles escaping automatically.

## Security Best Practices

1. **Never commit** `.pem` files or private keys to Git
2. **Never log** the full private key (even in debug mode)
3. **Rotate keys** if exposed (generate new key in app settings)
4. **Use minimal permissions** (only what's needed)
5. **Monitor installations** (review which orgs have the app installed)

## Scaling Strategy

### Phase 1: Single Installation (5,000/hour)
- Install on your org
- Sufficient for 1-2 collections per day
- First collection: ~2 hours with waits
- Incremental updates: ~5-10 minutes

### Phase 2: Multiple Installations (10,000-15,000/hour)
- Install on 2-3 orgs (requires permission)
- Sufficient for frequent updates (hourly/daily)
- First collection: ~30-60 minutes
- Incremental updates: ~5 minutes

### Phase 3: Enterprise (50,000+/hour)
- GitHub Enterprise Cloud increases limits based on seat count
- Contact GitHub for higher limits if needed

## Migration from PAT to GitHub App

Already using PATs? Here's how to migrate:

1. **Create GitHub App** (follow steps above)
2. **Add environment variables:**
   ```bash
   GITHUB_APP_ID=123456
   GITHUB_APP_PRIVATE_KEY="..."
   ```
3. **Keep existing PAT** as fallback:
   ```bash
   GITHUB_TOKEN=ghp_... # Fallback if App fails
   ```
4. **Test:** Run collection - it will try App first, fall back to PAT if needed
5. **Remove PAT** once App is working reliably (optional)

The system automatically tries GitHub App first and falls back to PAT if:
- App initialization fails
- App credentials are invalid
- App is not installed on any orgs

## FAQ

**Q: Can I use both GitHub App and PAT?**
A: Yes! The system tries App first, falls back to PAT. Useful during migration.

**Q: How many installations can I have?**
A: No limit! Each org can install the app independently.

**Q: Do I need separate apps for dev/staging/prod?**
A: No - one app can be installed in multiple environments. Use separate installations if you want separate rate limit pools.

**Q: What happens if I hit the rate limit?**
A: Collection pauses and shows error. With incremental collection, subsequent runs are much faster and use fewer requests.

**Q: Can I revoke access later?**
A: Yes - uninstall from org settings or suspend the app in GitHub settings.

## Next Steps

Once your GitHub App is set up:

1. **Run first collection** (may take 1-2 hours with 1 installation)
2. **Set up automated collection** (daily/weekly cron job)
3. **Monitor rate limits** (check logs for warnings)
4. **Scale if needed** (install on more orgs)

---

**Need help?** Check the [RIS Rate Limit Strategy](./RIS_RATE_LIMIT_STRATEGY.md) for more details on optimization.
