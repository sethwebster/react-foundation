# Getting Started

Essential guides for setting up and deploying the React Foundation Store.

## Documentation

### [📦 Deployment Guide](./deployment.md)
Complete guide for deploying to production with Vercel. Covers:
- Deployment steps and verification
- Testing the chatbot
- Rollback procedures
- Troubleshooting common issues
- Performance expectations

### 🔧 Local Setup *(Coming Soon)*
Environment setup for local development:
- Prerequisites and dependencies
- Environment variables configuration
- Database setup (Redis)
- Running the development server
- Running tests

### 🐛 Troubleshooting *(Coming Soon)*
Common issues and solutions:
- Build errors
- Environment variable issues
- API connection problems
- Common Next.js issues

## Quick Start

For the absolute fastest way to get started, see the main [README.md](../../README.md) at the project root.

### Essential Commands

```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your credentials

# Create Shopify metafields (first time only)
npm run shopify:setup-metafields

# Start development server
npm run dev
```

### Required Environment Variables

See `.env.example` for a complete list. Essential variables:

**Shopify (Store):**
- `SHOPIFY_STORE_DOMAIN`
- `SHOPIFY_STOREFRONT_TOKEN`
- `SHOPIFY_ADMIN_TOKEN`

**GitHub OAuth (Contributor Tracking):**
- `GITHUB_CLIENT_ID`
- `GITHUB_CLIENT_SECRET`
- `GITHUB_TOKEN`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`

**Redis (Access Control & RIS):**
- `REDIS_URL`

**OpenAI (Optional - AI Image Generation):**
- `OPENAI_API_KEY`

**Email (Access Requests):**
- `RESEND_API_KEY`
- `RESEND_FROM_DOMAIN`
- `ADMIN_EMAIL`

## Related Documentation

- **[Store Setup](../store/)** - Store-specific setup and management
- **[Development Guides](../development/)** - RIS setup, theming, etc.
- **[Architecture](../architecture/)** - Understanding the system *(coming soon)*

---

*For detailed deployment instructions, see [deployment.md](./deployment.md)*
