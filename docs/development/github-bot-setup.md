# GitHub Bot Setup Guide

## Overview

The React Foundation Store uses a **GitHub bot account** to perform write operations (filing issues, creating PRs, etc.) on behalf of users. This approach reduces OAuth scope requirements - users only need to grant **read-only access** (`read:user user:email`), while the bot handles all write operations.

## Why Use a Bot?

### Before (scary OAuth):
```
User → Grants public_repo scope → Can write to ALL public repos ❌
```

### After (bot approach):
```
User → Grants read:user scope → Only read access ✅
User files issue → Backend → Bot files issue with attribution ✅
```

## Benefits

✅ **Users feel safe** - Only granting minimal read permissions
✅ **Full functionality** - Bot performs all write operations
✅ **Clear attribution** - Issues/PRs clearly show who filed them
✅ **Centralized control** - Rate limiting, validation, moderation
✅ **Audit trail** - All bot actions logged on your backend

## Setup Instructions

### 1. Create a Bot Account

1. **Sign out** of your GitHub account
2. Go to https://github.com/signup
3. Create a new account (e.g., `react-foundation-bot`)
4. Use a dedicated email (e.g., `bot@react.foundation`)
5. Complete email verification
6. Optional: Set a profile picture and bio identifying it as a bot

**Recommended profile:**
- **Name**: React Foundation Bot
- **Bio**: Automated assistant for the React Foundation Store
- **Location**: https://react.foundation
- **Company**: @facebook/react

### 2. Generate a Personal Access Token

1. **Sign in** as the bot account
2. Go to https://github.com/settings/tokens/new
3. **Note**: "React Foundation Store Bot Token"
4. **Expiration**: No expiration (or set to custom long duration)
5. **Select scopes**:
   - ✅ `public_repo` - Create issues/PRs in public repositories
6. Click **Generate token**
7. **Copy the token** - you won't see it again!

### 3. Add Token to Environment Variables

Add the token to your `.env` file:

```bash
GITHUB_BOT_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Important**:
- Never commit this token to version control
- Rotate the token periodically for security
- Use different tokens for dev/staging/production

### 4. Verify Setup

Test the bot configuration:

```bash
# Start your development server
npm run dev

# In another terminal, test the bot endpoint
curl -X POST http://localhost:3000/api/bot/file-issue \
  -H "Content-Type: application/json" \
  -d '{
    "owner": "your-username",
    "repo": "test-repo",
    "title": "Test issue from bot",
    "body": "This is a test to verify the bot is working."
  }'
```

If successful, you should see:
```json
{
  "success": true,
  "issue": {
    "number": 1,
    "url": "https://github.com/your-username/test-repo/issues/1"
  }
}
```

## API Usage

### File an Issue

**Endpoint**: `POST /api/bot/file-issue`

**Authentication**: Requires user session (NextAuth)

**Request Body**:
```typescript
{
  owner: string;        // Repository owner
  repo: string;         // Repository name
  title: string;        // Issue title (max 256 chars)
  body: string;         // Issue body (markdown supported)
  labels?: string[];    // Optional labels
  assignees?: string[]; // Optional assignees
}
```

**Response**:
```typescript
{
  success: true;
  issue: {
    number: number;   // Issue number
    url: string;      // Issue HTML URL
  }
}
```

**Example** (from frontend):
```typescript
async function fileIssue() {
  const response = await fetch('/api/bot/file-issue', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      owner: 'facebook',
      repo: 'react',
      title: 'Bug: useEffect runs twice in development',
      body: 'I noticed that useEffect runs twice...',
      labels: ['bug']
    })
  });

  const data = await response.json();

  if (data.success) {
    console.log('Issue filed:', data.issue.url);
  }
}
```

## Using the Bot Service Directly

You can also use the bot service in your backend code:

```typescript
import { fileIssue, addComment } from '@/lib/github-bot';

// File an issue
const issue = await fileIssue({
  owner: 'facebook',
  repo: 'react',
  title: 'Feature request: Add new hook',
  body: 'It would be great if...',
  filedBy: {
    username: 'johndoe',
    name: 'John Doe'
  }
});

// Add a comment to an existing issue
await addComment({
  owner: 'facebook',
  repo: 'react',
  issue_number: 123,
  body: 'Thanks for the update!',
  commentBy: {
    username: 'johndoe',
    name: 'John Doe'
  }
});
```

## Attribution Format

All issues and comments filed by the bot include attribution to the original user:

```markdown
> **Filed by [@johndoe](https://github.com/johndoe)** via [React Foundation Store](https://react.foundation)

User's issue content here...
```

This ensures:
- Clear transparency about who filed the issue
- Users get GitHub notifications (if mentioned)
- Repository maintainers can contact the real user
- Maintains trust and accountability

## Security Considerations

### Rate Limiting

GitHub's rate limits apply to the bot account:
- **Public repositories**: 5,000 requests/hour
- **Authenticated**: Per-bot account

Consider implementing your own rate limiting to prevent abuse:

```typescript
// Example: Limit users to 5 issues per hour
import { RateLimiter } from '@/lib/rate-limiter';

const limiter = new RateLimiter({
  maxRequests: 5,
  windowMs: 60 * 60 * 1000 // 1 hour
});

export async function POST(request: NextRequest) {
  const session = await getServerAuthSession();
  const userId = session.user.email;

  if (!limiter.checkLimit(userId)) {
    return NextResponse.json(
      { error: 'Rate limit exceeded' },
      { status: 429 }
    );
  }

  // ... file issue
}
```

### Validation & Moderation

Add validation to prevent abuse:

```typescript
// Block spam keywords
const spamKeywords = ['viagra', 'casino', 'lottery'];
if (spamKeywords.some(keyword => title.toLowerCase().includes(keyword))) {
  return NextResponse.json(
    { error: 'Content blocked' },
    { status: 400 }
  );
}

// Require minimum content length
if (body.length < 20) {
  return NextResponse.json(
    { error: 'Issue body too short' },
    { status: 400 }
  );
}

// Validate repository whitelist
const allowedRepos = ['facebook/react', 'vercel/next.js'];
if (!allowedRepos.includes(`${owner}/${repo}`)) {
  return NextResponse.json(
    { error: 'Repository not allowed' },
    { status: 403 }
  );
}
```

### Logging & Monitoring

Log all bot actions for auditing:

```typescript
console.log(`[BOT] User ${session.user.email} filed issue in ${owner}/${repo}`);
console.log(`[BOT] Issue #${issue.number}: ${issue.html_url}`);
```

Consider integrating with monitoring services:
- Sentry for error tracking
- LogRocket for user session replay
- DataDog for metrics and alerts

## Troubleshooting

### "Bot is not configured" Error

**Cause**: `GITHUB_BOT_TOKEN` environment variable is not set

**Solution**:
1. Verify `.env` file contains `GITHUB_BOT_TOKEN=ghp_...`
2. Restart your dev server after adding the token
3. Check the token hasn't expired

### "Forbidden" Error (403)

**Cause**: Bot doesn't have permission to access the repository

**Solution**:
- Ensure the repository is **public** (bot can't access private repos)
- Verify the token has `public_repo` scope
- Check if the repository owner has blocked the bot account

### "Issues disabled" Error (410)

**Cause**: Issues are disabled for the target repository

**Solution**:
- Repository settings → Features → Enable Issues
- Or choose a different repository

### Rate Limit Exceeded

**Cause**: Bot has made too many requests (5,000/hour limit)

**Solution**:
- Implement user-level rate limiting on your backend
- Consider using multiple bot accounts for high-traffic scenarios
- Use GitHub's GraphQL API to reduce request count

## Next Steps

- **Add comment functionality**: Use `addComment()` to let users reply to issues
- **Create PRs**: Extend the bot service to create pull requests
- **GitHub App**: For even better scalability, consider creating a GitHub App instead of using a PAT
- **Rate limiting**: Implement user-level rate limiting
- **Analytics**: Track bot usage with analytics

## Related Documentation

- [NextAuth Configuration](./authentication.md)
- [GitHub OAuth Setup](./github-oauth.md)
- [API Routes](./api-routes.md)
