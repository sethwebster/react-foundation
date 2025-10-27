# React Foundation Store

E-commerce platform for React Foundation merchandise, built with Next.js 15 and Shopify.

## Features

- **Shopify CMS Integration** - Products and collections managed via Shopify
- **Drop Management** - Time-limited releases with automatic status transitions
- **Contributor Tracking** - GitHub-based contributor verification across 54 React ecosystem libraries
- **AI Image Generation** - Auto-generate collection banners with GPT-5 Vision + gpt-image-1
- **React Foundation Design System (RFDS)** - Layered component architecture
- **3D WebGL** - Interactive React logo animations with Three.js

## Quick Start

```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Fill in: SHOPIFY_STORE_DOMAIN, SHOPIFY_STOREFRONT_TOKEN, SHOPIFY_ADMIN_TOKEN, OPENAI_API_KEY

# Create metafield definitions (first time only)
npm run shopify:setup-metafields

# Start development server
npm run dev
```

## Documentation

📚 **[Complete Documentation](./docs/)** - All guides and references

- **[Store Management Guide](./docs/STORE_MANAGEMENT.md)** - Complete system reference (setup, drops, products, troubleshooting)
- **[Metafields Reference](./docs/METAFIELDS_REFERENCE.md)** - All 26 metafields with examples
- **[Quick Start Guide](./docs/QUICK_START.md)** - Daily tasks cheat sheet

## Environment Variables

Copy `.env.example` to `.env` and provide:

**Shopify (required):**
- `SHOPIFY_STORE_DOMAIN` - your-store.myshopify.com
- `SHOPIFY_STOREFRONT_TOKEN` - Storefront API access token
- `SHOPIFY_ADMIN_TOKEN` - Admin API access token

**GitHub OAuth (required for contributor tracking):**
- `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` - OAuth App credentials
- `GITHUB_TOKEN` - Personal access token with `read:user` and `public_repo` scopes
- `NEXTAUTH_SECRET` - Generate with `openssl rand -base64 32`
- `NEXTAUTH_URL` - http://localhost:3000 (for development) or your production URL (e.g., https://yourdomain.com)

**OpenAI (optional - for AI image generation):**
- `OPENAI_API_KEY` - OpenAI API key

## Management Scripts

```bash
# Drop management
npm run drops:create 8 Fall 2025 "Theme Name"  # Create new drop
npm run drops:list                             # List all drops with status

# Collection images
npm run collections:generate-images            # Generate missing images
npm run collections:generate-images <handle>   # Generate for specific collection
npm run collections:generate-images --force    # Replace existing images

# Setup
npm run shopify:setup-metafields      # Create metafield definitions (once)
npm run shopify:cleanup-metafields    # Remove obsolete metafields

# Development
npm run dev    # Start dev server
npm run build  # Build for production
```

See [docs/QUICK_START.md](./docs/QUICK_START.md) for more commands.

## Project Structure

```
storefront/
├── docs/                  # Documentation
├── scripts/               # Management scripts
├── src/
│   ├── app/              # Next.js app router
│   ├── components/       # React components
│   │   ├── ui/          # UI primitives
│   │   ├── rfds/        # Design system
│   │   └── layout/      # Layout components
│   └── lib/             # Utilities & data
│       ├── shopify.ts          # Shopify API client
│       ├── products-shopify.ts # Product data layer
│       └── maintainer-tiers.ts # Contributor tracking
└── .cache/               # AI generation cache (gitignored)
```

## Tech Stack

- **Framework:** Next.js 15 (App Router, React 19, Turbopack)
- **CMS:** Shopify (Storefront + Admin APIs)
- **Authentication:** NextAuth with GitHub OAuth
- **3D Graphics:** Three.js, React Three Fiber, React Three Drei
- **AI:** OpenAI GPT-5 Vision, gpt-image-1
- **Styling:** Tailwind CSS 4
- **Language:** TypeScript 5

## Key Features Explained

### Drop Management
Time-limited product releases with automatic status transitions:
- **Upcoming** → Before `drop_start_date`
- **Current** → Between start and end dates
- **Past** → After `drop_end_date`

No manual status updates needed - calculated from dates.

### Contributor Tracking
Tracks contributions across 54 React ecosystem libraries (Redux, TanStack Query, React Router, etc.)
- Fetches data from GitHub GraphQL API
- Calculates contributor score (PRs × 8 + Issues × 3 + Commits × 1)
- Unlocks tier-based products (Contributor, Sustainer, Core)

### Metafield Taxonomy
26 custom metafields in the `react_foundation` namespace:
- 14 collection metafields (drops, dates, themes)
- 12 product metafields (ratings, features, specs)

All metafields must have "Storefront access" enabled in Shopify Admin.

## Contributing

This is the React Foundation's official merchandise store. For questions or issues:
1. Check [documentation](./docs/)
2. Run diagnostics: `npm run shopify:test-storefront`
3. Review troubleshooting guides

## License

Proprietary - React Foundation

---

**Documentation:** [docs/](./docs/) | **Quick Start:** [docs/QUICK_START.md](./docs/QUICK_START.md)
