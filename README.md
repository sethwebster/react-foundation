# React Foundation

Official website and merchandise store for the React Foundation, built with Next.js 15 and Shopify.

## Features

- **Foundation Site** - Mission, impact reports, and contributor recognition
- **Official Store** - Time-limited drops and perennial collections via Shopify
- **Contributor Tracking** - GitHub-based verification across 54 React ecosystem libraries
- **AI Image Generation** - Auto-generate collection banners with GPT-5 Vision + gpt-image-1
- **React Foundation Design System (RFDS)** - Shared component library
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

Visit:
- http://localhost:3000 - Foundation homepage
- http://localhost:3000/store - Store homepage
- http://localhost:3000/about - About the Foundation
- http://localhost:3000/impact - Impact reports

## Project Structure

```
react-foundation-store/
├── docs/
│   ├── foundation/           # Foundation documentation
│   └── store/                # Store documentation
├── src/
│   ├── app/
│   │   ├── page.tsx          # Foundation homepage
│   │   ├── about/            # About the Foundation
│   │   ├── impact/           # Impact reports
│   │   ├── store/            # 🛒 Store section
│   │   │   ├── page.tsx      # Store home
│   │   │   ├── products/     # Product detail pages
│   │   │   └── collections/  # Collection pages
│   │   └── api/              # API routes (shared)
│   ├── components/
│   │   ├── rfds/             # Design system
│   │   ├── layout/           # Header, Footer
│   │   ├── ui/               # UI primitives
│   │   └── home/             # Home page components
│   └── lib/                  # Utilities & data
├── scripts/                  # Shopify management scripts
└── public/                   # Static assets
```

## Documentation

📚 **[Complete Documentation](./docs/)** - Start here for internal developer documentation

### Quick Links

**Getting Started:**
- **[Getting Started Guide](./docs/getting-started/)** - Setup, deployment, troubleshooting
- **[Deployment Guide](./docs/getting-started/deployment.md)** - Deploy to production

**Store Management:**
- **[Store Documentation](./docs/store/)** - Complete store documentation index
- **[Store Management Guide](./docs/store/store-management.md)** - Complete store reference
- **[Metafields Reference](./docs/store/metafields-reference.md)** - All 26 metafields
- **[Quick Start Guide](./docs/store/quick-start.md)** - Daily tasks cheat sheet
- **[Shopify Scripts](./docs/store/shopify-scripts.md)** - CLI tools and setup

**Foundation Systems:**
- **[Foundation Documentation](./docs/foundation/)** - Foundation-specific dev docs
- **[Impact Systems](./docs/foundation/impact-systems.md)** - RIS, CIS, CoIS
- **[Revenue Distribution](./docs/foundation/revenue-distribution.md)** - Allocation model
- **[Design System](./docs/foundation/design-system.md)** - RFDS components

**Development:**
- **[Development Guides](./docs/development/)** - Dev best practices
- **[Theming Guide](./docs/development/theming.md)** - Semantic theming system
- **[RIS Setup](./docs/development/ris-setup.md)** - React Impact Score setup

**Chatbot & Ingestion:**
- **[Chatbot Documentation](./docs/chatbot/)** - Content ingestion system
- **[Architecture](./docs/chatbot/architecture.md)** - Loader-based ingestion
- **[Troubleshooting](./docs/chatbot/troubleshooting.md)** - Fix ingestion issues

**Community:**
- **[Community Documentation](./docs/community/)** - Educator & community systems

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

See [docs/store/quick-start.md](./docs/store/quick-start.md) for more commands.

## Routes

### Foundation Routes
- `/` - Foundation homepage
- `/about` - About the Foundation
- `/impact` - Impact reports

### Store Routes
- `/store` - Store homepage with drops and collections
- `/store/products/[slug]` - Product detail page
- `/store/collections/[handle]` - Collection page

### API Routes
- `/api/auth/[...nextauth]` - NextAuth GitHub OAuth
- `/api/maintainer/progress` - Contributor stats from GitHub

## Tech Stack

- **Framework:** Next.js 15 (App Router, React 19, Turbopack)
- **CMS:** Shopify (Storefront + Admin APIs)
- **Authentication:** NextAuth with GitHub OAuth
- **3D Graphics:** Three.js, React Three Fiber, React Three Drei
- **AI:** OpenAI GPT-5 Vision, gpt-image-1
- **Styling:** Tailwind CSS 4
- **Language:** TypeScript 5

## Environment Variables

Copy `.env.example` to `.env` and provide:

**Shopify (required for store):**
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

**Email Notifications (required for access request emails):**
- `RESEND_API_KEY` - Resend API key for sending emails
- `RESEND_FROM_DOMAIN` - Domain for sending emails (e.g., yourdomain.com)
- `ADMIN_EMAIL` - Email address to receive access request notifications

**Redis (required for access control):**
- `REDIS_URL` - Redis connection URL (e.g., redis://localhost:6379)

## Key Features

### Unified Foundation + Store

The site seamlessly combines the Foundation's mission with its official merchandise store:

- **Shared Design System** - RFDS components used throughout
- **Context-Aware Navigation** - Header adapts to Foundation vs Store sections
- **Single Authentication** - GitHub OAuth works across both sections
- **Seamless User Flow** - Learn about Foundation → Shop to support

### Drop Management

Time-limited product releases with automatic status transitions:
- **Upcoming** → Before `drop_start_date`
- **Current** → Between start and end dates
- **Past** → After `drop_end_date`

No manual status updates needed - calculated from dates.

### Contributor Tracking

Tracks contributions across 54 React ecosystem libraries:
- Redux, TanStack Query, React Router, Next.js, etc.
- GitHub GraphQL API integration
- Contributor score calculation (PRs × 8 + Issues × 3 + Commits × 1)
- Tier-based product unlocking (Contributor, Sustainer, Core)

### Metafield Taxonomy

26 custom metafields in the `react_foundation` namespace:
- 14 collection metafields (drops, dates, themes)
- 12 product metafields (ratings, features, specs)

All metafields must have "Storefront access" enabled in Shopify Admin.

## Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Run production build
npm run start

# Lint code
npm run lint
```

## Contributing

This is the React Foundation's official site. For questions or issues:
1. Check [documentation](./docs/)
2. Run diagnostics: `npm run shopify:test-storefront`
3. Review troubleshooting guides in docs

## License

Proprietary - React Foundation

---

**Documentation:** [docs/](./docs/) | **Store Guide:** [docs/store/](./docs/store/) | **Contributing:** [CONTRIBUTING.md](./CONTRIBUTING.md)
