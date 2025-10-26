# PRIME DIRECTIVES
Never use eslint disables for TSC errors. Fix the problem. If you don't know the type, use unknown, never use any.

# CURSOR DIRECTIVES
## Component Creation Priority
1. **ALWAYS check RFDS first**: `import { RFDS } from "@/components/rfds"`
2. **Use Semantic Components**: `RFDS.SemanticButton`, `RFDS.SemanticCard`, `RFDS.SemanticBadge`
3. **Compose from Primitives**: If custom needed, use `RFDS.Button`, `RFDS.Pill`, `RFDS.Rating`
4. **One-off components**: Still use design system primitives as building blocks
5. **NEVER create from scratch**: Always start with design system components

## Color Usage Rules
- **NEVER use hardcoded colors**: `bg-blue-500`, `text-red-600`, `border-gray-200`
- **ALWAYS use semantic colors**: `bg-primary`, `text-destructive`, `border-border`
- **Check theme-config.ts**: For available semantic color tokens
- **Test both themes**: Light and dark mode compatibility required

## Default Import Pattern
```typescript
// ✅ CORRECT - Start with design system
import { RFDS } from "@/components/rfds";

// Use semantic components first
<RFDS.SemanticButton variant="primary">Click me</RFDS.SemanticButton>
<RFDS.SemanticCard>Content</RFDS.SemanticCard>

// Compose from primitives if needed
<div className="bg-card text-card-foreground border border-border">
  <RFDS.Button variant="primary">Action</RFDS.Button>
</div>
```

# Claude Directives for React Foundation Store

## 🎯 CRITICAL RULES (NEVER BREAK)

1. **TypeScript MUST pass**: Run `npx tsc --noEmit` before claiming ANY task is complete
2. **Tests MUST pass**: Run `npm run lint` - NO EXCEPTIONS before commit
3. **Fix ALL warnings**: Warnings exist for a reason - fix them, don't ignore them
4. **NO console.log**: Use proper logging or remove debug statements
5. **Work incrementally**: Debug ONE thing at a time, prove it works, then move forward
6. **Document progress**: Create `/todos/<branch-name>-todo.md` for multi-session work

## 🏗️ ARCHITECTURE

### Project Structure
```
react-foundation-store/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── page.tsx           # Foundation homepage
│   │   ├── about/             # About the Foundation
│   │   ├── impact/            # Impact reports
│   │   ├── store/             # 🛒 Store section
│   │   │   ├── page.tsx       # Store home
│   │   │   ├── products/      # Product detail pages
│   │   │   └── collections/   # Collection pages
│   │   └── api/               # API routes (shared)
│   ├── components/
│   │   ├── rfds/              # React Foundation Design System
│   │   ├── layout/            # Header, Footer
│   │   ├── ui/                # UI primitives
│   │   └── home/              # Home page components
│   ├── lib/                   # Utilities & data
│   │   ├── ris/               # React Impact Score system
│   │   ├── shopify.ts         # Shopify integration
│   │   └── providers/         # Context providers
│   └── types/                 # TypeScript definitions
├── scripts/                   # Shopify management scripts
├── docs/                      # Documentation
│   ├── foundation/            # Foundation docs
│   └── store/                 # Store docs
└── public/                    # Static assets
```

### Tech Stack
- **Framework**: Next.js 15 (App Router, React 19, Turbopack)
- **CMS**: Shopify (Storefront + Admin APIs)
- **Authentication**: NextAuth with GitHub OAuth
- **3D Graphics**: Three.js, React Three Fiber, React Three Drei
- **AI**: OpenAI GPT-5 Vision, gpt-image-1
- **Styling**: Tailwind CSS 4
- **Language**: TypeScript 5

## 📝 CODE QUALITY

### TypeScript Standards
- **Complete interfaces**: Define ALL required properties
- **Proper unions**: Use `'A' | 'B' | 'C'` not `'A' as const`
- **No `any`**: All types defined in `types/` folder
- **Match definitions**: Return types must match interface exactly
- **Strict mode**: Always use strict TypeScript configuration

### Next.js App Router Patterns
- **Server Components**: Default to server components, use `'use client'` only when needed
- **Route handlers**: API routes in `app/api/` directory
- **Layouts**: Use layout.tsx for shared UI
- **Loading/Error**: Implement loading.tsx and error.tsx
- **Metadata**: Use generateMetadata for SEO

### React Foundation Design System (RFDS)
```typescript
import { RFDS } from "@/components/rfds"

// Use RFDS components consistently
<RFDS.Button variant="primary" size="lg">Click me</RFDS.Button>
<RFDS.ProductCard product={product} />
<RFDS.Header />
```

**Architecture Layers:**
- **Primitives**: Base building blocks (Button, Typography, etc.)
- **Components**: Composed from primitives (ProductCard, etc.)
- **Layouts**: Page structure (Header, Footer)
- **Semantic Components**: Themeable components (SemanticButton, SemanticCard, etc.)

## 🎨 DESIGN SYSTEM & THEMING

### CRITICAL: Always Use Design System
**NEVER create new components without checking the design system first!**

#### Design System Hierarchy
1. **Check RFDS first**: `import { RFDS } from "@/components/rfds"`
2. **Use Semantic Components**: For themeable, consistent UI
3. **Compose from Primitives**: If you need something custom
4. **One-off components**: Still use design system primitives

#### Semantic Theming System
All colors are semantic and themeable. **NEVER use hardcoded colors!**

```typescript
// ❌ WRONG - Hardcoded colors
<div className="bg-blue-500 text-white border-gray-200">

// ✅ CORRECT - Semantic colors
<div className="bg-primary text-primary-foreground border-border">
```

#### Available Semantic Colors
- **Background**: `bg-background`, `bg-card`, `bg-muted`
- **Text**: `text-foreground`, `text-muted-foreground`
- **Interactive**: `bg-primary`, `bg-secondary`, `bg-accent`
- **Status**: `bg-destructive`, `bg-success`, `bg-warning`
- **Borders**: `border-border`, `border-primary`, `border-destructive`

#### Component Creation Rules
1. **Check RFDS first**: Does `RFDS.SemanticButton` work?
2. **Use semantic components**: `RFDS.SemanticCard`, `RFDS.SemanticBadge`
3. **Compose from primitives**: If custom needed, use `RFDS.Button`, `RFDS.Pill`
4. **Theme-aware**: All components must work in light/dark themes
5. **One-off exception**: Even one-off components should use design system primitives

#### Migration Script
Use the migration script to convert hardcoded colors:
```bash
node scripts/migrate-to-semantic-colors.js
```

#### Theme Configuration
All themes defined in `src/lib/theme-config.ts`:
- Light theme colors
- Dark theme colors  
- Semantic color mappings
- Gradient definitions
- Shadow definitions

### Component Patterns
- **Functional components**: Use hooks, avoid class components
- **Default exports**: For components, named for utilities
- **Keep small**: Components >300-400 lines are too complex
- **Custom hooks**: Extract logic into custom hooks
- **Props interfaces**: Define clear prop interfaces

## 🛒 SHOPIFY INTEGRATION

### Metafield Management
The project uses 26 custom metafields in the `react_foundation` namespace:

**Collection Metafields (14):**
- `drop_start_date`, `drop_end_date`, `drop_theme`
- `collection_type`, `collection_status`
- `ai_generated_image`, `ai_prompt`

**Product Metafields (12):**
- `product_rating`, `product_features`
- `size_chart`, `care_instructions`
- `sustainability_score`

### Shopify API Patterns
```typescript
// Storefront API (public data)
import { getProducts, getCollections } from '@/lib/shopify'

// Admin API (management operations)
import { createProduct, updateMetafields } from '@/lib/shopify-admin'
```

### Drop Management
Time-limited releases with automatic status transitions:
- **Upcoming** → Before `drop_start_date`
- **Current** → Between start and end dates  
- **Past** → After `drop_end_date`

No manual status updates needed - calculated from dates.

## 📊 REACT IMPACT SCORE (RIS) SYSTEM

### Architecture
```
src/lib/ris/
├── types.ts              # TypeScript definitions
├── normalization.ts      # Statistical normalization
├── scoring-service.ts    # Main RIS calculation engine
├── hooks.ts              # React hooks for components
├── mock-data.ts          # Sample data for testing
└── README.md             # Complete documentation
```

### Five Components (with weights)
1. **Ecosystem Footprint (30%)** - How widely used and adopted
2. **Contribution Quality (25%)** - Quality of contributions and maintenance
3. **Maintainer Health (20%)** - Sustainability of the team
4. **Community Benefit (15%)** - Educational value and support
5. **Mission Alignment (10%)** - Alignment with React's goals

### Usage
```typescript
import { RISScoringService, type LibraryRawMetrics } from '@/lib/ris';

const service = new RISScoringService();
const scores = service.calculateScores(rawMetrics);
```

## 🧪 TESTING PHILOSOPHY

### Test ONLY Business Logic
✅ **DO TEST:**
- RIS calculation algorithms
- Shopify API integrations
- Utility functions
- Data normalization
- Business logic

❌ **DON'T TEST:**
- React components (UI rendering)
- Next.js routing
- Three.js animations
- Static content

### Test Commands
```bash
npm run lint              # Run ESLint
npm run build             # Build for production
npm run dev               # Development server
```

## 🌐 CONTRIBUTOR TRACKING

### GitHub Integration
Tracks contributions across 54 React ecosystem libraries:
- Redux, TanStack Query, React Router, Next.js, etc.
- GitHub GraphQL API integration
- Contributor score calculation (PRs × 8 + Issues × 3 + Commits × 1)
- Tier-based product unlocking (Contributor, Sustainer, Core)

### Access Control
```typescript
// Check contributor status
import { useAccessControl } from '@/lib/access-control'

const { hasAccess, tier } = useAccessControl()
```

## 🎨 UI/UX PATTERNS

### Design System Usage
- Follow React Foundation Design System (RFDS)
- Use Tailwind CSS 4 for styling
- Implement responsive design
- Follow accessibility guidelines

### 3D Graphics (Three.js)
```typescript
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'

// Interactive React logo animations
<Canvas>
  <OrbitControls />
  <ReactLogo />
</Canvas>
```

### AI Image Generation
```typescript
// Collection banner generation
import { generateCollectionImage } from '@/lib/ai'

const image = await generateCollectionImage(prompt)
```

## 🔄 WORKFLOW

### Before Starting
1. `npm install` to sync dependencies
2. Copy `.env.example` to `.env` and configure
3. Run `npm run shopify:setup-metafields` (first time only)
4. Check existing patterns in relevant directories
5. Create todo file: `/todos/<branch-name>-todo.md`

### Development Commands
```bash
# Development
npm run dev                    # Start dev server with Turbopack
npm run build                  # Build for production
npm run start                  # Run production build

# Shopify Management
npm run shopify:setup-metafields    # Create metafield definitions
npm run drops:create                # Create new drop
npm run drops:list                  # List all drops
npm run collections:generate-images # Generate AI images

# Linting
npm run lint                   # Run ESLint
```

### Before Committing
1. `npx tsc --noEmit` ✅
2. `npm run lint` ✅
3. Verify all interface properties included
4. Mark todos completed
5. Clean up any remaining issues

## 📋 PROJECT MANAGEMENT

### Branch Tracking
```markdown
# /todos/<branch-name>-todo.md

## Completed
- [x] Task with file changes and decisions

## Deferred
- [ ] Task (WHEN: after 1000 users, WHY: diminishing returns)

## Skipped
- [ ] Task (RATIONALE: 80/20 rule, not worth effort)

## Next Steps
- Clear actions for next session
```

### 80/20 Rule
- **Ship when core works**, iterate based on data
- **Document deferrals** with clear criteria
- **Skip with rationale**, not silence
- Create testing guides for manual verification

## 🚨 COMMON PITFALLS

❌ **Don't:**
- Use `any` type (use `unknown` or proper types)
- Mix client/server component patterns incorrectly
- Hardcode Shopify data (use API)
- Ignore TypeScript errors
- Test UI components (test business logic)
- Say task is done before TypeScript passes

✅ **Do:**
- Use proper TypeScript types
- Follow Next.js App Router patterns
- Use RFDS components consistently
- Test business logic only
- Run TypeScript check before commit
- Use proper error boundaries

## 🔧 ENVIRONMENT SETUP

### Required Environment Variables
```bash
# Shopify (required for store)
SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
SHOPIFY_STOREFRONT_TOKEN=shpat_xxxxx
SHOPIFY_ADMIN_TOKEN=shpat_xxxxx

# GitHub OAuth (required for contributor tracking)
GITHUB_CLIENT_ID=xxxxx
GITHUB_CLIENT_SECRET=xxxxx
GITHUB_TOKEN=ghp_xxxxx
NEXTAUTH_SECRET=xxxxx
NEXTAUTH_URL=http://localhost:3000

# OpenAI (optional - for AI image generation)
OPENAI_API_KEY=sk-xxxxx

# Email Notifications (required for access request emails)
RESEND_API_KEY=xxxxx
RESEND_FROM_DOMAIN=yourdomain.com
ADMIN_EMAIL=admin@yourdomain.com

# Redis (required for access control)
REDIS_URL=redis://localhost:6379
```

### First Time Setup
```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Fill in all required variables

# Create metafield definitions (first time only)
npm run shopify:setup-metafields

# Start development server
npm run dev
```

## 📚 DOCUMENTATION

### Key Documentation

**Main Documentation Index:**
- **[docs/README.md](./docs/README.md)** - Start here for all internal developer documentation

**Most Used:**
- **[Store Management Guide](./docs/store/store-management.md)** - Complete store reference
- **[Metafields Reference](./docs/store/metafields-reference.md)** - All 26 metafields
- **[Quick Start Guide](./docs/store/quick-start.md)** - Daily tasks cheat sheet
- **[Shopify Scripts](./docs/store/shopify-scripts.md)** - CLI tools and setup
- **[Theming Guide](./docs/development/theming.md)** - Semantic theming system
- **[RIS Setup](./docs/development/ris-setup.md)** - React Impact Score setup
- **[RIS System](./src/lib/ris/README.md)** - RIS implementation details

**Documentation Sections:**
- [Getting Started](./docs/getting-started/) - Setup, deployment, troubleshooting
- [Store](./docs/store/) - Store management and operations
- [Foundation](./docs/foundation/) - Impact systems and design
- [Chatbot](./docs/chatbot/) - Content ingestion system
- [Community](./docs/community/) - Educator & community systems
- [Development](./docs/development/) - Development guides and best practices

### Routes
**Foundation Routes:**
- `/` - Foundation homepage
- `/about` - About the Foundation
- `/impact` - Impact reports

**Store Routes:**
- `/store` - Store homepage with drops and collections
- `/store/products/[slug]` - Product detail page
- `/store/collections/[handle]` - Collection page

**API Routes:**
- `/api/auth/[...nextauth]` - NextAuth GitHub OAuth
- `/api/maintainer/progress` - Contributor stats from GitHub

---

**Remember**: Good enough > Perfect. Ship working features, iterate based on real usage data. The React Foundation Store combines Foundation mission with merchandise store - keep both aspects in mind when making decisions.