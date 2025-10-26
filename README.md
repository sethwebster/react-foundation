# React Foundation

Official website and merchandise store for the React Foundation, built with Next.js 15 and Shopify.

## Features

### Core Foundation
- **Foundation Site** - Mission, impact reports, and contributor recognition
- **React Impact Score (RIS)** - Track and reward React ecosystem library maintainers
- **Content Impact Score (CIS)** - Recognize and reward educators creating React content
- **Community Impact Score (CoIS)** - Support React meetup and conference organizers
- **Libraries Directory** - Browse 54 tracked React ecosystem libraries with scores
- **Communities Directory** - Discover React communities worldwide
- **Governance** - Board of Directors and Technical Steering Committee pages

### Official Store
- **Time-Limited Drops** - Seasonal collections with automatic status transitions
- **Contributor Perks** - Tier-based access (Contributor, Sustainer, Core)
- **GitHub Verification** - Automatic contribution tracking across React ecosystem
- **AI Image Generation** - Auto-generate collection banners with GPT-5 Vision + gpt-image-1
- **Shopify Integration** - Full e-commerce powered by Shopify

### User Experience
- **GitHub OAuth** - Sign in with GitHub to track contributions
- **Contributor Dashboard** - View your tier, stats, and linked repositories
- **Access Control** - Request and manage access to restricted content
- **Chatbot** - AI-powered chatbot trained on Foundation documentation
- **3D WebGL** - Interactive React logo animations with Three.js

### Admin & Data
- **Admin Panel** - User management, access requests, data inspection
- **RIS Data Collection** - Automated collection from GitHub, NPM, CDN, OSSF
- **Content Ingestion** - Loader-based system for chatbot knowledge base
- **Redis Data Inspection** - Real-time database statistics and debugging
- **React Foundation Design System (RFDS)** - Shared component library with semantic theming

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
- http://localhost:3000/about - About the Foundation
- http://localhost:3000/impact - Impact reports
- http://localhost:3000/libraries - React libraries with RIS scores
- http://localhost:3000/communities - Community directory
- http://localhost:3000/store - Store homepage
- http://localhost:3000/profile - Your contributor profile (after sign in)
- http://localhost:3000/admin - Admin panel (requires admin access)

## Project Structure

```
react-foundation-store/
├── docs/                         # Developer documentation
│   ├── getting-started/          # Setup & deployment
│   ├── foundation/               # Foundation systems (RIS, CIS, CoIS)
│   ├── store/                    # Store management
│   ├── chatbot/                  # Chatbot & ingestion
│   ├── community/                # Community & educator systems
│   └── development/              # Dev guides & best practices
├── public-context/               # Public docs (chatbot knowledge base)
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── page.tsx              # Foundation homepage
│   │   ├── about/                # About the Foundation
│   │   │   ├── board-of-directors/
│   │   │   └── technical-steering-committee/
│   │   ├── impact/               # Impact reports
│   │   ├── libraries/            # React ecosystem libraries (RIS)
│   │   ├── scoring/              # RIS scoring explanation
│   │   ├── communities/          # Community directory
│   │   │   ├── [slug]/           # Individual community pages
│   │   │   ├── add/              # Add community
│   │   │   └── start/            # Start a community
│   │   ├── authors/              # Content creators (CIS)
│   │   ├── updates/              # Foundation updates/blog
│   │   ├── profile/              # User profile & contributor status
│   │   ├── store/                # 🛒 Store section
│   │   │   ├── products/[slug]/  # Product detail pages
│   │   │   └── collections/[handle]/  # Collection pages
│   │   ├── admin/                # Admin panel
│   │   │   ├── users/            # User management
│   │   │   ├── requests/         # Access requests
│   │   │   ├── data/             # Redis data inspection
│   │   │   ├── ingest/           # Content ingestion
│   │   │   └── reset/            # System reset
│   │   ├── auth/                 # Authentication pages
│   │   └── api/                  # API routes
│   │       ├── auth/             # NextAuth endpoints
│   │       ├── admin/            # Admin APIs
│   │       ├── ris/              # RIS data collection
│   │       ├── chat/             # Chatbot endpoint
│   │       ├── communities/      # Communities API
│   │       └── maintainer/       # Contributor tracking
│   ├── components/
│   │   ├── rfds/                 # React Foundation Design System
│   │   ├── layout/               # Header, Footer, Navigation
│   │   ├── ui/                   # UI primitives (shadcn/ui)
│   │   ├── home/                 # Homepage components
│   │   ├── communities/          # Community components
│   │   ├── ris/                  # RIS/library components
│   │   └── providers/            # React context providers
│   └── lib/                      # Utilities & services
│       ├── ris/                  # React Impact Score system
│       ├── cis/                  # Content Impact Score system
│       ├── cois/                 # Community Impact Score system
│       ├── access-control/       # Access control & permissions
│       ├── admin/                # Admin services
│       ├── chatbot/              # Chatbot integration
│       ├── ingest/               # Content ingestion loaders
│       ├── providers/            # Service providers
│       └── hooks/                # Shared React hooks
├── scripts/                      # Shopify & data management scripts
├── public/                       # Static assets
└── archive/                      # Archived/outdated documentation
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
- `/about/board-of-directors` - Board of Directors
- `/about/technical-steering-committee` - Technical Steering Committee
- `/impact` - Impact reports
- `/libraries` - React ecosystem libraries with RIS scores
- `/scoring` - RIS scoring methodology explained
- `/communities` - Community directory
- `/communities/[slug]` - Individual community page
- `/communities/add` - Add a community
- `/communities/start` - Start a community guide
- `/authors` - Content creators (CIS)
- `/authors/[slug]` - Individual author page
- `/updates` - Foundation updates & blog
- `/updates/[slug]` - Individual update post
- `/privacy` - Privacy policy
- `/terms` - Terms of service

### User Routes
- `/profile` - User profile
- `/profile/contributor-status` - Contributor tier & stats
- `/profile/repos` - Linked repositories
- `/auth/signin` - Sign in page

### Store Routes
- `/store` - Store homepage with drops and collections
- `/store/products/[slug]` - Product detail page
- `/store/collections/[handle]` - Collection page

### Admin Routes (Protected)
- `/admin` - Admin dashboard
- `/admin/users` - User management
- `/admin/requests` - Access request management
- `/admin/data` - Redis data inspection & RIS collection
- `/admin/ingest` - Content ingestion (legacy)
- `/admin/ingest-full` - Full content ingestion
- `/admin/import` - Data import tools
- `/admin/reset` - System reset

### API Routes
- `/api/auth/[...nextauth]` - NextAuth GitHub OAuth
- `/api/maintainer/progress` - Contributor stats from GitHub
- `/api/ris/collect` - Trigger RIS data collection
- `/api/ris/allocation` - Get quarterly RIS allocation
- `/api/ris/status` - RIS collection status
- `/api/chat` - Chatbot endpoint
- `/api/communities` - Communities API
- `/api/content-map` - Chatbot content navigation
- `/api/ingest/full` - Full content ingestion
- `/api/check-access` - Check user access level
- `/api/request-access` - Request access
- `/api/admin/*` - Admin management APIs

## Tech Stack

- **Framework:** Next.js 15 (App Router, React 19, Turbopack)
- **Language:** TypeScript 5 (Strict Mode)
- **Styling:** Tailwind CSS 4 (with semantic theming)
- **CMS:** Shopify (Storefront + Admin APIs)
- **Database:** Redis (Upstash/Redis Cloud) - User data, access control, RIS cache, communities
- **Authentication:** NextAuth with GitHub OAuth
- **AI:** OpenAI GPT-4 (chatbot), GPT-5 Vision + gpt-image-1 (image generation)
- **3D Graphics:** Three.js, React Three Fiber, React Three Drei
- **Email:** Resend (access request notifications)
- **Deployment:** Vercel (with Edge Functions)
- **UI Components:** Radix UI primitives (via shadcn/ui)
- **Design System:** RFDS (React Foundation Design System)

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

## Key Systems

### React Impact Score (RIS)

Tracks and rewards React ecosystem library maintainers:
- **54 Libraries Tracked** - Core libraries, routing, state management, data fetching, UI, testing, meta-frameworks
- **5 Components** - Ecosystem Footprint (30%), Contribution Quality (25%), Maintainer Health (20%), Community Benefit (15%), Mission Alignment (10%)
- **Data Sources** - GitHub API, NPM Registry, jsDelivr CDN, OSSF Scorecard
- **Quarterly Distribution** - Revenue allocated based on normalized scores
- **Automated Collection** - Daily updates with Redis caching (24h TTL)

**Contributor Tiers:**
- **Contributor** (100 points) - Basic store access
- **Sustainer** (500 points) - Enhanced benefits
- **Core** (2000 points) - Premium access

**Points:** PRs × 8 + Issues × 3 + Commits × 1

### Content Impact Score (CIS)

Recognizes and rewards React content creators:
- Course creators, tutorial authors, educational content
- Tracks enrollment, views, engagement, student outcomes
- Quarterly revenue share (25-35%)

### Community Impact Score (CoIS)

Supports React community organizers:
- Meetups, conferences, community events
- Tracks attendance, growth, effort, geographic reach
- Quarterly revenue share (20-30%)

### Drop Management

Time-limited product releases with automatic status transitions:
- **Upcoming** → Before `drop_start_date`
- **Current** → Between start and end dates
- **Past** → After `drop_end_date`

No manual status updates needed - calculated from dates.

26 custom metafields in the `react_foundation` namespace (14 collection, 12 product).

### Chatbot System

AI-powered chatbot trained on Foundation documentation:
- **Loader-Based Ingestion** - MDX files, communities data, libraries data
- **Vector Search** - Redis with RediSearch for semantic search
- **GPT-4 Integration** - Context-aware responses
- **Content Map** - Navigation structure for discovery

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

We welcome contributions to the React Foundation Store! Please see:

- **[CONTRIBUTING.md](./CONTRIBUTING.md)** - Complete contributor guidelines
  - Code of conduct
  - Development workflow
  - Code standards (TypeScript, React, theming)
  - Testing guidelines
  - Pull request process

**For questions or issues:**
1. Check [documentation](./docs/)
2. Run diagnostics: `npm run shopify:test-storefront`
3. Review [troubleshooting guides](./docs/)
4. Open an issue on GitHub

## License

Proprietary - React Foundation

---

**Documentation:** [docs/](./docs/) | **Store Guide:** [docs/store/](./docs/store/) | **Contributing:** [CONTRIBUTING.md](./CONTRIBUTING.md)
