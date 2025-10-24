# Automatic Content Ingestion Setup

## Overview

This guide shows you how to set up automatic content ingestion that runs after every production deployment, keeping your chatbot's knowledge base up-to-date.

## How It Works

1. **Deploy to Production**: Push to `main` branch triggers Vercel deployment
2. **Deployment Completes**: GitHub Actions detects successful deployment
3. **Auto-Ingest Triggers**: Workflow crawls your production site
4. **Chatbot Updated**: New content available for chatbot queries

## Setup Instructions

### 1. Generate API Token

Generate a secure token for the ingestion API:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Example output:
```
a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8
```

### 2. Add Environment Variables

#### Local Development (`.env.local`)

```bash
# For local testing
INGESTION_API_TOKEN=your-token-from-step-1
```

#### Production (Vercel)

Add these secrets in your Vercel dashboard:

1. Go to your project settings
2. Navigate to **Environment Variables**
3. Add:

```bash
INGESTION_API_TOKEN=your-token-from-step-1
CRAWLER_BYPASS_TOKEN=your-crawler-bypass-token
```

### 3. Add GitHub Secrets

Add these secrets to your GitHub repository:

1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Add **Repository secrets**:

```bash
PRODUCTION_URL=https://your-domain.com
INGESTION_API_TOKEN=your-token-from-step-1
```

**Important**:
- `PRODUCTION_URL` should be your production domain (e.g., `https://react.foundation`)
- Use the same `INGESTION_API_TOKEN` value as in Vercel

### 4. Update Workflow Name (Optional)

If your Vercel deployment workflow has a different name, update `.github/workflows/ingest-content.yml`:

```yaml
workflow_run:
  workflows: ["Your Deployment Workflow Name"]  # Change this
  types:
    - completed
```

To find your workflow name:
1. Go to GitHub → **Actions** tab
2. Find your deployment workflow
3. Use that exact name

### 5. Deploy and Test

1. **Push to main branch**:
   ```bash
   git push origin main
   ```

2. **Monitor the workflow**:
   - Go to GitHub → **Actions** tab
   - Watch "Ingest Content After Deploy" workflow
   - Should complete in 2-10 minutes depending on site size

3. **Verify results**:
   - Go to `/admin/ingest/inspect`
   - Check that chunks have recent timestamps
   - Test chatbot with questions about your content

## Configuration Options

### Unlimited Crawling

By default, the workflow crawls all pages. To limit:

```yaml
# In .github/workflows/ingest-content.yml
"maxPages": 500  # Change from 0 to a specific number
```

### Custom Paths

Exclude specific paths:

```yaml
"excludePaths": ["/api", "/admin", "/_next", "/blog/drafts"]
```

Or include only specific paths:

```yaml
"allowedPaths": ["/docs", "/guides", "/about"]
```

## Manual Trigger

You can manually trigger ingestion from GitHub:

1. Go to **Actions** tab
2. Select "Ingest Content After Deploy"
3. Click **Run workflow**
4. Configure options:
   - Max pages (0 = unlimited)
   - Clear existing data (true/false)

## Monitoring

### Check Workflow Status

```bash
gh run list --workflow=ingest-content.yml
```

### View Logs

```bash
gh run view --log
```

### Admin Dashboard

- View status: `/admin/ingest/inspect`
- See stored chunks and their timestamps
- Verify content diversity

## Troubleshooting

### Workflow Not Triggering

**Problem**: Workflow doesn't run after deployment

**Solutions**:
1. Check workflow name matches your deployment workflow
2. Verify workflow is enabled (Actions tab → Enable workflow)
3. Check that deployment workflow completed successfully

### Authentication Errors

**Problem**: `401 Unauthorized` or `Invalid API token`

**Solutions**:
1. Verify `INGESTION_API_TOKEN` matches in:
   - GitHub Secrets
   - Vercel Environment Variables
2. Regenerate token if compromised
3. Check token has no extra spaces or newlines

### Coming Soon Content

**Problem**: Ingestion still getting "Coming Soon" pages

**Solutions**:
1. Verify `CRAWLER_BYPASS_TOKEN` is set in Vercel
2. Check proxy middleware has bypass code
3. Test bypass locally first
4. Ensure production environment loaded new variables

### Timeout Issues

**Problem**: Workflow times out before completion

**Solutions**:
1. Increase `MAX_WAIT` in workflow (default: 600s)
2. Reduce `maxPages` to crawl fewer pages
3. Check for slow-loading pages on production
4. Monitor ingestion logs for stuck pages

### No Content Extracted

**Problem**: Pages crawled but no content in chunks

**Solutions**:
1. Check if pages are client-side rendered (need SSR/SSG)
2. Verify main content isn't in hidden elements
3. Check content extraction selectors
4. Test manually: `/admin/ingest` with low page count

## Best Practices

### 1. Test Locally First

Before enabling automatic ingestion:
```bash
# Test ingestion locally
# Go to /admin/ingest
# Run with low page count (10-20)
# Verify results in /admin/ingest/inspect
```

### 2. Use Selective Paths

Don't ingest everything:
```yaml
"excludePaths": [
  "/api",           # API endpoints
  "/admin",         # Admin pages
  "/_next",         # Next.js internals
  "/dashboard",     # User-specific pages
  "/profile",       # User-specific pages
  "/checkout"       # E-commerce flows
]
```

### 3. Schedule During Low Traffic

For large sites, consider scheduling:
```yaml
# Add schedule trigger
on:
  schedule:
    - cron: '0 2 * * *'  # 2 AM daily
  workflow_dispatch:
```

### 4. Monitor Costs

- OpenAI embeddings cost ~$0.13 per 1M tokens
- 100 pages ≈ 500 chunks ≈ 500K tokens ≈ $0.065
- Set budget alerts in OpenAI dashboard

### 5. Rate Limiting

If you hit rate limits:
```typescript
// In src/lib/chatbot/ingest.ts
const batchSize = 5;  // Reduce from 10
await new Promise((resolve) => setTimeout(resolve, 2000)); // Increase delay
```

## Security Considerations

### Token Security

✅ **Do:**
- Store tokens in GitHub Secrets and Vercel Environment Variables
- Rotate tokens periodically (quarterly)
- Use different tokens for staging/production
- Monitor access logs

❌ **Don't:**
- Commit tokens to Git
- Share tokens in Slack/Discord
- Use same token across multiple projects
- Log tokens in application logs

### Access Control

- Only allow ingestion from GitHub Actions IP ranges (optional)
- Monitor ingestion API usage
- Set up alerts for failed authentications
- Review ingestion logs regularly

## Advanced Configuration

### Multiple Environments

```yaml
# Staging ingestion
- name: Ingest Staging
  if: github.ref == 'refs/heads/develop'
  run: |
    curl -X POST "${{ secrets.STAGING_URL }}/api/admin/ingest" \
      -H "Authorization: Bearer ${{ secrets.STAGING_INGESTION_TOKEN }}"

# Production ingestion
- name: Ingest Production
  if: github.ref == 'refs/heads/main'
  run: |
    curl -X POST "${{ secrets.PRODUCTION_URL }}/api/admin/ingest" \
      -H "Authorization: Bearer ${{ secrets.PRODUCTION_INGESTION_TOKEN }}"
```

### Notifications

Add Slack notifications:
```yaml
- name: Notify Slack
  if: always()
  uses: 8398a7/action-slack@v3
  with:
    status: ${{ job.status }}
    text: 'Content ingestion ${{ job.status }}'
    webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

## FAQ

**Q: How long does ingestion take?**
A: 2-10 minutes for 50-100 pages. Scales linearly with page count.

**Q: Will it affect site performance?**
A: No, it crawls production after deployment is complete. Minimal impact.

**Q: What if ingestion fails?**
A: Chatbot continues using existing data. Fix issue and manually re-run.

**Q: Can I run it more frequently?**
A: Yes, but be mindful of OpenAI API costs and rate limits.

**Q: Does it work with static exports?**
A: Yes, as long as HTML is accessible at the URLs.

**Q: What about dynamic content?**
A: Only content rendered in initial HTML is captured. Use SSR/SSG for dynamic pages.

## Support

- 📖 Documentation: `/docs/CRAWLER_BYPASS_SETUP.md`
- 🔍 Inspect data: `/admin/ingest/inspect`
- 🐛 Troubleshooting: `/docs/INGESTION_TROUBLESHOOTING.md`
- 💬 Issues: GitHub Issues
