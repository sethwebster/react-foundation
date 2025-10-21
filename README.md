# React Foundation

Official website and merchandise store for the React Foundation, built with Next.js 15 and Shopify.

## Overview

The React Foundation website combines a mission-driven foundation site with an official merchandise store, creating a unified platform that supports the React ecosystem through transparent funding, contributor recognition, and community engagement.

## Features

### Foundation & Community
- **Foundation Site** - Mission statement, about page, and impact reporting
- **Author Profiles** - MDX-powered author pages with biographical information
- **Updates System** - Blog-style updates with MDX support for rich content
- **3D React Logo** - Interactive React logo animations with Three.js and React Three Fiber
- **Responsive Mobile Menu** - Context-aware navigation with user profile integration

### Store & Commerce
- **Official Store** - Time-limited drops and perennial collections via Shopify
- **Drop Management** - Automated status transitions (Upcoming → Current → Past)
- **Product Cataloging** - Detailed product pages with galleries and specifications
- **Collection Pages** - Curated collections with AI-generated banners

### Authentication & Profiles
- **Dual OAuth Providers** - GitHub and GitLab authentication via NextAuth
- **User Profiles** - Personal profile pages with account information
- **Contributor Status** - Track contributions across 54 React ecosystem libraries
- **Repository Activity** - View your activity in supported repositories
- **Tier-Based Access** - Unlock exclusive products based on contribution scores

### Developer Experience
- **React Foundation Design System (RFDS)** - Shared component library with primitives, layouts, and components
- **TypeScript** - Full type safety across the application
- **Turbopack** - Fast development server with hot reloading
- **Tailwind CSS 4** - Modern styling with inline tokens
- **Error Boundaries** - Graceful error handling throughout the app

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
- http://localhost:3000 - Foundation homepage with mission and key pillars
- http://localhost:3000/about - About the Foundation, mission, and governance
- http://localhost:3000/impact - Impact reports and fund distribution details
- http://localhost:3000/updates - Latest news and updates
- http://localhost:3000/store - Store homepage with drops and collections
- http://localhost:3000/profile - User profile (requires authentication)
- http://localhost:3000/authors/[slug] - Author profile pages

## Project Structure

```
react-foundation/
├── content/
│   └── updates/              # MDX update content
├── docs/
│   ├── foundation/           # Foundation documentation
│   └── store/                # Store documentation
├── public/                   # Static assets
├── scripts/                  # Shopify management scripts
└── src/
    ├── app/
    │   ├── about/            # About the Foundation
    │   ├── api/              # API routes
    │   │   ├── auth/         # NextAuth endpoints
    │   │   └── maintainer/   # Contributor stats API
    │   ├── auth/             # Authentication pages
    │   ├── authors/          # Author profile pages
    │   │   └── [slug]/       # Dynamic author routes
    │   ├── impact/           # Impact reports and metrics
    │   ├── profile/          # User profile system
    │   │   ├── contributor-status/  # Contribution tracking
    │   │   └── repos/        # Repository activity
    │   ├── store/            # Store section
    │   │   ├── products/     # Product detail pages
    │   │   └── collections/  # Collection pages
    │   ├── updates/          # Blog-style updates
    │   │   └── [slug]/       # Dynamic update routes
    │   ├── layout.tsx        # Root layout with auth provider
    │   └── page.tsx          # Foundation homepage
    ├── components/
    │   ├── home/             # Homepage components
    │   ├── layout/           # Header, Footer, Mobile Menu
    │   ├── providers/        # Auth provider
    │   ├── rfds/             # React Foundation Design System
    │   └── ui/               # UI primitives
    ├── lib/
    │   ├── providers/        # GitHub/GitLab API clients
    │   ├── auth.ts           # NextAuth configuration
    │   ├── authors.ts        # Author data management
    │   ├── maintainer-tiers.ts  # Tier system logic
    │   ├── shopify.ts        # Shopify API client
    │   └── updates.ts        # Updates content loader
    └── types/                # TypeScript type definitions
```

## Documentation

📚 **[Complete Documentation](./docs/)**

### Foundation
- **[Foundation Docs](./docs/foundation/)** - Content taxonomy, design system

### Store
- **[Store Management Guide](./docs/store/STORE_MANAGEMENT.md)** - Complete store reference
- **[Metafields Reference](./docs/store/METAFIELDS_REFERENCE.md)** - All 26 metafields
- **[Quick Start Guide](./docs/store/QUICK_START.md)** - Daily tasks cheat sheet

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

See [docs/store/QUICK_START.md](./docs/store/QUICK_START.md) for more commands.

## Routes

### Foundation Routes
- `/` - Foundation homepage with hero, mission, pillars, and CTAs
- `/about` - About the Foundation, mission statement, governance, and founding members
- `/impact` - Impact reports, fund distribution methodology, and ecosystem libraries
- `/updates` - Blog-style updates listing
- `/updates/[slug]` - Individual update post (MDX-powered)
- `/authors/[slug]` - Author profile pages with biographical information

### User & Profile Routes
- `/auth/signin` - Authentication page with GitHub and GitLab options
- `/profile` - User profile dashboard (requires authentication)
- `/profile/contributor-status` - Contribution tracking and tier information
- `/profile/repos` - Repository activity across supported libraries

### Store Routes
- `/store` - Store homepage with drops and collections
- `/store/products/[slug]` - Product detail page with gallery and specifications
- `/store/collections/[handle]` - Collection page with filtered products

### API Routes
- `/api/auth/[...nextauth]` - NextAuth endpoints (GitHub & GitLab OAuth)
- `/api/maintainer/progress` - Contributor statistics from GitHub GraphQL API

## Tech Stack

- **Framework:** Next.js 15 (App Router, React 19, Turbopack)
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS 4 (inline tokens)
- **Authentication:** NextAuth 4 with GitHub and GitLab OAuth providers
- **CMS:** Shopify (Storefront + Admin APIs) for product management
- **Content:** MDX for author profiles and blog-style updates
- **3D Graphics:** Three.js, React Three Fiber, React Three Drei, React Three Postprocessing
- **AI:** OpenAI GPT-5 Vision and gpt-image-1 for collection banner generation
- **Icons:** Simple Icons for ecosystem library logos
- **React Compiler:** Babel plugin for React Compiler integration

## Environment Variables

Create a `.env` file in the project root with the following variables:

**Shopify (required for store):**
- `SHOPIFY_STORE_DOMAIN` - your-store.myshopify.com
- `SHOPIFY_STOREFRONT_TOKEN` - Storefront API access token
- `SHOPIFY_ADMIN_TOKEN` - Admin API access token

**GitHub OAuth (required for authentication and contributor tracking):**
- `GITHUB_CLIENT_ID` - GitHub OAuth App client ID
- `GITHUB_CLIENT_SECRET` - GitHub OAuth App client secret
- `GITHUB_TOKEN` - Personal access token with `read:user` and `public_repo` scopes

**GitLab OAuth (optional - for GitLab authentication):**
- `GITLAB_CLIENT_ID` - GitLab OAuth App client ID
- `GITLAB_CLIENT_SECRET` - GitLab OAuth App client secret

**NextAuth (required for authentication):**
- `NEXTAUTH_SECRET` - Generate with `openssl rand -base64 32`
- `NEXTAUTH_URL` - http://localhost:3000 (or your production URL)

**OpenAI (optional - for AI image generation):**
- `OPENAI_API_KEY` - OpenAI API key for GPT-5 Vision and gpt-image-1

## Key Features

### Unified Foundation + Store

The site seamlessly combines the Foundation's mission with its official merchandise store:

- **Shared Design System** - RFDS components used throughout both sections
- **Context-Aware Navigation** - Header and mobile menu adapt to Foundation vs Store sections
- **Dual OAuth Support** - GitHub and GitLab authentication via NextAuth
- **Seamless User Flow** - Learn about Foundation → Shop to support → Track contributions

### Mobile-First Design

Responsive mobile experience with advanced navigation:
- **Mobile Menu** - Full-screen slide-in menu with smooth animations
- **User Profile Integration** - Profile picture replaces hamburger icon when signed in
- **Context-Aware Links** - Navigation adapts based on current section (Foundation vs Store)
- **Touch-Optimized** - Designed for mobile-first interaction patterns

### User Profile System

Comprehensive user profile and contribution tracking:
- **Profile Dashboard** - Account information and settings
- **Contributor Status** - Real-time tracking across 54 React ecosystem libraries
- **Repository Activity** - Detailed view of contributions to supported projects
- **Tier Progression** - Visual representation of contributor tier and progress

### Drop Management

Time-limited product releases with automatic status transitions:
- **Upcoming** → Before `drop_start_date`
- **Current** → Between start and end dates
- **Past** → After `drop_end_date`

No manual status updates needed - calculated from metafield dates.

### Contributor Tracking

Tracks contributions across 54 React ecosystem libraries:
- **Supported Libraries**: React, Redux, TanStack Query, React Router, Next.js, Remix, and 49 more
- **GitHub GraphQL API**: Real-time contribution data
- **Scoring Model**: PRs × 8 + Issues × 3 + Commits × 1 (12-month rolling window)
- **Three-Tier System**:
  - **Contributor Access** (40+ points) - ~5 merged PRs
  - **Sustainer Access** (120+ points) - ~15 merged PRs
  - **Core Ally Access** (250+ points) - ~30+ merged PRs

### Content Management

MDX-powered content system for dynamic pages:
- **Author Profiles** - Biographical information with gray-matter frontmatter
- **Updates/Blog** - Rich blog-style updates with MDX support
- **Static Generation** - All content is statically generated at build time

### Metafield Taxonomy

26 custom metafields in the `react_foundation` namespace:
- 14 collection metafields (drops, dates, themes, categories)
- 12 product metafields (contributor tiers, ratings, features, specifications)

All metafields must have "Storefront access" enabled in Shopify Admin.

## React Foundation Design System (RFDS)

A comprehensive component library built specifically for the React Foundation:

**Structure:**
- `src/components/rfds/primitives.ts` - Low-level building blocks (Container, Grid, Flex, Text)
- `src/components/rfds/layouts.ts` - Layout components (Section, Card, Hero)
- `src/components/rfds/components.ts` - High-level components (Button, Badge, Stat)

**Features:**
- Consistent design language across Foundation and Store sections
- Tailwind CSS-based styling with design tokens
- TypeScript types for all components
- Responsive and accessible by default

## Development

```bash
# Start development server (with Turbopack)
npm run dev

# Build for production
npm run build

# Run production build
npm run start

# Lint code
npm run lint
```

### Key Development Features

- **Hot Module Replacement** - Instant updates with Turbopack
- **TypeScript** - Full type safety with strict mode enabled
- **Error Boundaries** - Graceful error handling in production
- **Route Groups** - Organized app directory structure
- **Server Components** - Default server components with opt-in client components
- **Parallel Routes** - Efficient data fetching patterns

## Recent Updates

### Mobile Menu, Profile System, and GitLab Authentication

The latest release includes major enhancements to user experience and authentication:

**Mobile Navigation**
- Responsive mobile menu with slide-in animation (src/components/layout/mobile-menu.tsx:1)
- User profile integration - profile picture replaces hamburger icon when authenticated
- Context-aware navigation links based on current section
- Touch-optimized interactions with smooth transitions

**Profile System**
- Complete user profile pages with account dashboard
- Contributor status tracking with real-time GitHub API integration
- Repository activity viewer for all 54 supported libraries
- Tier progression visualization with detailed contribution metrics

**GitLab Authentication**
- Added GitLab OAuth provider alongside GitHub (src/lib/auth.ts:18)
- Dual authentication support via NextAuth
- Unified authentication experience across both providers
- Extended contribution tracking capabilities

**Content Management**
- MDX-powered author profiles with biographical information
- Blog-style updates system with rich content support
- Static generation for optimal performance

## Architecture

### Authentication Flow
1. User clicks "Sign in with GitHub" or "Sign in with GitLab"
2. NextAuth handles OAuth flow with chosen provider
3. User session stored with GitHub/GitLab username
4. Profile page displays account info and enables contributor tracking

### Contribution Tracking
1. User authenticates with GitHub
2. GitHub GraphQL API queries contributions across 54 libraries
3. Contributions scored: PRs (8 pts) + Issues (3 pts) + Commits (1 pt)
4. Tier calculated based on total score
5. Product access unlocked based on tier

### Drop Management
1. Collections created in Shopify with `react_foundation` metafields
2. Dates set via `drop_start_date` and `drop_end_date` metafields
3. Status calculated automatically: Upcoming → Current → Past
4. No manual status updates required

## Contributing

This is the React Foundation's official site. For questions or issues:
1. Check [documentation](./docs/)
2. Review [AGENTS.md](./AGENTS.md) for repository guidelines
3. Run diagnostics: `npm run shopify:test-storefront`
4. Consult troubleshooting guides in docs

### Coding Standards

Follow the guidelines in [AGENTS.md](./AGENTS.md):
- TypeScript for all new modules
- PascalCase for components, camelCase for hooks/utilities
- Feature-first file organization
- Conventional Commits for git messages
- 80%+ test coverage target

## Additional Documentation

- **[Store Management Guide](./docs/store/STORE_MANAGEMENT.md)** - Complete store operations reference
- **[Metafields Reference](./docs/store/METAFIELDS_REFERENCE.md)** - All 26 custom metafields
- **[Quick Start Guide](./docs/store/QUICK_START.md)** - Daily tasks cheat sheet
- **[Ecosystem Libraries](./ECOSYSTEM_LIBRARIES.md)** - All 54 tracked repositories
- **[Migration Plan](./MIGRATION_PLAN.md)** - Architecture evolution roadmap
- **[Status Notes](./STATUS.md)** - Working session notes and current state

## License

Proprietary - React Foundation

## Support

For support with this codebase:
- Check the documentation in [docs/](./docs/)
- Review architecture notes in [STATUS.md](./STATUS.md)
- Consult [AGENTS.md](./AGENTS.md) for development guidelines

---

**Documentation:** [docs/](./docs/) | **Store Guide:** [docs/store/STORE_MANAGEMENT.md](./docs/store/STORE_MANAGEMENT.md) | **Repository Guidelines:** [AGENTS.md](./AGENTS.md)
