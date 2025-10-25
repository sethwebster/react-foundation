# React Foundation Tech Stack

> **For Chatbot:** This document provides a high-level overview of the technologies used to build the React Foundation website and store.

## Overview

The React Foundation platform is built with modern web technologies, combining a content-rich foundation website with a Shopify-powered merchandise store.

**Not a setup guide** - This explains WHAT we use and WHY, not HOW to set it up.

## Core Technologies

### Frontend Framework

**Next.js 15 (App Router)**
- **Why:** Industry-leading React framework
- **Features used:**
  - App Router for file-based routing
  - React Server Components for performance
  - Server-side rendering (SSR)
  - Static generation (SSG) where appropriate
  - API routes for backend logic

**React 19**
- Latest React with Server Components
- Concurrent rendering features
- Modern hooks and patterns

**Turbopack**
- Next-generation bundler
- Faster development builds
- Replaces Webpack in Next.js 15

### Styling

**Tailwind CSS 4**
- Utility-first CSS framework
- Custom design system integration
- Dark mode support
- Responsive design utilities

**React Foundation Design System (RFDS)**
- Custom component library
- Semantic theming system
- Layered architecture (primitives → components → layouts)
- Reusable across Foundation properties

→ [Learn more: Design System Overview](./design-system-overview.md)

### CMS & E-Commerce

**Shopify**
- Headless commerce via Storefront API
- Product/collection management via Admin API
- 26 custom metafields for drops and products
- Print-on-demand integration

**Why Shopify:**
- Industry-leading e-commerce
- Handles payments, fulfillment, inventory
- Scalable (from 100 to 100k orders)
- Lets us focus on Foundation mission, not commerce infrastructure

### Authentication

**NextAuth.js**
- GitHub OAuth integration
- Session management
- Contributor verification via GitHub API

**Why GitHub Auth:**
- Developers already have GitHub accounts
- Automatic contribution tracking
- OAuth2 security
- No passwords to manage

### Data & State

**GitHub APIs**
- GraphQL API for contribution tracking
- REST API for user data
- Tracks 54 React ecosystem libraries
- Automatic metric collection

**Redis (Upstash)**
- Vector database for chatbot (semantic search)
- Access control caching
- Session storage
- Metric caching

**SWR (Stale-While-Revalidate)**
- Client-side data fetching
- Automatic caching and revalidation
- React hooks for data

### AI & Automation

**OpenAI GPT-4**
- Collection banner image generation
- Chatbot responses (with RAG via vector DB)
- Content assistance

**Why AI:**
- Faster content creation
- Consistent design quality
- Chatbot support for users

### 3D Graphics

**Three.js + React Three Fiber**
- Interactive React logo animations
- WebGL-based 3D graphics
- React component wrapper for Three.js

**React Three Drei**
- Helper components for R3F
- OrbitControls, lighting, effects

**Why 3D:**
- Visual identity for Foundation
- Showcases React's capabilities
- Engaging homepage experience

## Architecture

### Project Structure

```
react-foundation-store/
├── src/app/          # Next.js App Router (pages + API routes)
├── src/components/   # React components (RFDS)
├── src/lib/          # Business logic
│   ├── ris/         # React Impact Score system
│   ├── cis/         # Content Impact Score system
│   ├── cois/        # Community Impact Score system
│   ├── chatbot/     # Vector DB and AI chatbot
│   └── shopify.ts   # Shopify integration
├── scripts/          # Shopify management scripts
├── docs/            # Internal documentation
└── public-context/  # Public chatbot documentation
```

### Page Types

**Static pages** (pre-rendered at build):
- About page
- Documentation pages
- Blog posts

**Dynamic pages** (rendered per-request):
- Store homepage (live drop status)
- Product pages (live inventory)
- User profiles (personalized)
- Admin panels

**API routes** (serverless functions):
- `/api/auth/[...nextauth]` - Authentication
- `/api/maintainer/progress` - GitHub contribution tracking
- `/api/admin/ingest` - Chatbot content ingestion
- `/api/chat` - AI chatbot

## Key Features

### Impact Scoring Systems

**Three parallel systems:**
- **RIS**: Library maintainers (src/lib/ris/)
- **CIS**: Educators (src/lib/cis/)
- **CoIS**: Community organizers (src/lib/cois/)

Each includes:
- TypeScript type definitions
- Statistical normalization
- Scoring algorithms
- React hooks for UI
- Mock data for testing

### Contributor Tracking

- GitHub OAuth integration
- Automatic contribution scanning across 54 libraries
- Point calculation (PRs × 8 + Issues × 3 + Commits × 1)
- Tier-based store access
- Real-time updates

### Chatbot (RAG System)

- Crawls react.foundation for content
- Ingests public-context/ documentation
- Generates embeddings via OpenAI
- Stores in Redis vector database
- Semantic search for relevant context
- GPT-4 for natural responses

### Drop Management

- Time-based status (upcoming/current/past)
- Automatic transitions via dates
- Custom metafields for drop metadata
- AI-generated collection images
- Inventory tracking

## Development Workflow

### Local Development

```bash
npm run dev  # Start development server with Turbopack
```

Visit:
- http://localhost:3000 - Foundation homepage
- http://localhost:3000/store - Store
- http://localhost:3000/admin - Admin panel

### Building

```bash
npm run build  # Production build
npm run start  # Run production build locally
```

### Code Quality

- **TypeScript 5** - Strict mode enabled
- **ESLint** - React + Next.js rules
- **Type checking** - Required before commits

## Deployment

### Platform

**Vercel**
- Automatic deployments from Git
- Serverless functions for API routes
- Edge network for static assets
- Preview deployments for PRs

### Environment Variables

Required (examples only, not actual values):
- `SHOPIFY_STORE_DOMAIN` - Shopify store URL
- `SHOPIFY_STOREFRONT_TOKEN` - Public API access
- `GITHUB_TOKEN` - For contribution tracking
- `NEXTAUTH_SECRET` - Session encryption
- `REDIS_URL` - Vector database
- `OPENAI_API_KEY` - AI features

### CI/CD

- **Git push** → Automatic Vercel deployment
- **Preview URLs** for every PR
- **Production** from main branch
- **Automated checks** - TypeScript, linting, build

## Performance

### Optimizations

- **React Server Components** - Reduced client JS
- **Image optimization** - Next.js Image component
- **Code splitting** - Automatic route-based splitting
- **Static generation** - Pre-render where possible
- **CDN caching** - Vercel Edge Network

### Monitoring

- **Vercel Analytics** - Performance metrics
- **Real User Monitoring** - Actual user experience
- **Error tracking** - Automatic error reports
- **Build times** - Optimize for fast deploys

## Security

### Measures

- **OAuth2** - Secure GitHub authentication
- **HTTPS** - All traffic encrypted
- **Environment variables** - Secrets never in code
- **Input validation** - All user input sanitized
- **Rate limiting** - Prevent abuse
- **CSRF protection** - NextAuth handles this

### Data Privacy

- **No tracking** without consent
- **Public data only** - GitHub public contributions
- **Opt-in** - Explicit consent for additional tracking
- **Right to deletion** - Users can remove data

## Scalability

### Current Scale

- ~1000s of visitors per day
- ~100s of transactions per drop
- ~100k GitHub API calls per quarter
- ~50k chatbot queries per month

### Designed For

- 10k-100k daily visitors
- 1000s of simultaneous drop purchases
- Millions of chatbot interactions
- Real-time contribution tracking

**Serverless architecture** scales automatically.

## Open Source

### Philosophy

**Core systems are open source:**
- Impact scoring algorithms (RIS/CIS/CoIS)
- Contribution tracking logic
- Design system components
- Public documentation

**Proprietary/Private:**
- Shopify integration details
- Admin panel internals
- Customer data
- Payment processing

**Why hybrid:**
- Transparency in scoring (anyone can audit)
- Security for payment/customer data
- Community can contribute to core logic
- Foundation retains control of operations

## Technology Choices Explained

### Why Next.js?

- Industry standard for React apps
- Server components for performance
- API routes for backend
- Great developer experience
- Vercel integration

### Why Shopify?

- Don't reinvent e-commerce
- Proven at scale
- Handles compliance (PCI, GDPR)
- Focus on Foundation mission

### Why GitHub Auth?

- Developers already have accounts
- Contribution tracking built-in
- OAuth security
- No password management

### Why Redis?

- Fast vector search for chatbot
- Proven for caching
- Upstash serverless offering
- Simple key-value for access control

### Why TypeScript?

- Type safety prevents bugs
- Better IDE support
- Self-documenting code
- Required for scale

## Future Tech

### Planned Additions

- **Stripe integration** - Direct RIS/CIS/CoIS payouts
- **PostgreSQL** - Relational data for educator/organizer metrics
- **Real-time updates** - WebSockets for live drop countdowns
- **Mobile app** - React Native app for contributors
- **GraphQL API** - Public API for third-party integrations

### Under Consideration

- **Blockchain** - For transparent allocation records (research phase)
- **AI code review** - Automated PR quality assessment for RIS
- **ML predictions** - Forecast impact scores
- **Video processing** - Automated content quality checks for CIS

## Related Topics

- [Design System Overview](./design-system-overview.md)
- [Store Overview](../store/store-overview.md)
- [Foundation Overview](../foundation/foundation-overview.md)

---

*Last updated: October 2025*
*Part of React Foundation public documentation*

*For detailed setup instructions, see internal docs in `/docs/` directory*
