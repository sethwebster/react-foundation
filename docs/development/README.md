# Development Guides

Practical development guides and best practices for working on the React Foundation Store.

## Documentation

### [🎨 Theming Guide](./theming.md)
Comprehensive guide to the semantic theming system:
- Semantic color system
- Replacing hardcoded colors
- Common color replacements
- Creating new themes
- Testing themes
- Migration checklist

**Quick Reference:**
```tsx
// ❌ Hardcoded colors
<div className="bg-blue-500 text-white">

// ✅ Semantic colors
<div className="bg-primary text-primary-foreground">
```

### [📊 RIS Setup](./ris-setup.md)
Setting up React Impact Score data collection:
- GitHub API setup
- Redis configuration
- Running data collection
- Incremental vs force refresh
- Automated daily collection with Vercel
- API endpoints and React hooks
- Troubleshooting

**Quick Start:**
```bash
# Collect RIS data
curl -X POST http://localhost:3000/api/ris/collect

# Check status
curl http://localhost:3000/api/ris/status
```

### [📚 Ecosystem Libraries](./ecosystem-libraries.md)
Complete list of 54 React ecosystem libraries tracked for RIS:
- Core libraries (React, React DOM)
- Routing (React Router, TanStack Router)
- State management (Redux, Zustand, Jotai)
- Data fetching (TanStack Query, SWR)
- Forms, UI, testing, meta-frameworks, etc.

## Development Standards

### TypeScript
- **Complete interfaces** - Define ALL required properties
- **Proper unions** - Use `'A' | 'B'` not `'A' as const`
- **No `any`** - All types defined in `types/` folder
- **Strict mode** - Always use strict TypeScript
- Run `npx tsc --noEmit` before committing

### Component Patterns
- **Functional components** - Use hooks, avoid classes
- **Server components** - Default to server components in Next.js App Router
- **'use client'** - Only when needed (interactivity, hooks)
- **Small components** - Keep under 300-400 lines
- **Custom hooks** - Extract logic into reusable hooks

### React Foundation Design System (RFDS)

Always use the design system:

```tsx
import { RFDS } from "@/components/rfds"

// Use RFDS components
<RFDS.Button variant="primary">Click me</RFDS.Button>
<RFDS.ProductCard product={product} />
<RFDS.SemanticCard>Content</RFDS.SemanticCard>
```

**Component Hierarchy:**
1. Check RFDS first
2. Use Semantic Components (themeable)
3. Compose from Primitives if needed
4. One-off components still use design system primitives

### Code Quality

**Before Committing:**
1. ✅ Run `npx tsc --noEmit` (TypeScript must pass)
2. ✅ Run `npm run lint` (ESLint must pass)
3. ✅ Fix ALL warnings
4. ✅ Remove console.log statements
5. ✅ Test in both light and dark themes

**Best Practices:**
- Work incrementally
- Test one thing at a time
- Document as you go
- Keep commits focused
- Write clear commit messages

## Environment Setup

### Required Tools
- **Node.js 18+** - JavaScript runtime
- **npm** - Package manager
- **Git** - Version control
- **VS Code** (recommended) - Code editor

### Recommended VS Code Extensions
- ESLint
- Prettier
- Tailwind CSS IntelliSense
- TypeScript Importer
- GitLens

### Environment Variables

See `.env.example` for complete list. Copy to `.env`:

```bash
cp .env.example .env
```

Key variables:
- `SHOPIFY_*` - Store integration
- `GITHUB_*` - OAuth and contributor tracking
- `REDIS_URL` - Data storage and caching
- `OPENAI_API_KEY` - AI features
- `NEXT_PUBLIC_*` - Client-side config

## Common Tasks

### Running Locally

```bash
# Install dependencies
npm install

# Start dev server (with Turbopack)
npm run dev

# Build for production
npm run build

# Run production build locally
npm run start
```

### Working with Shopify

```bash
# Setup metafields (first time only)
npm run shopify:setup-metafields

# Create a new drop
npm run drops:create 7 Summer 2025 "Theme"

# List all drops
npm run drops:list

# Test connection
npm run shopify:test-storefront
```

### RIS Data Collection

```bash
# Collect RIS data (incremental)
curl -X POST http://localhost:3000/api/ris/collect

# Force refresh all data
curl -X POST http://localhost:3000/api/ris/collect?force=true

# Check collection status
curl http://localhost:3000/api/ris/status
```

### Chatbot Ingestion

```bash
# Run full ingestion
curl -X POST http://localhost:3000/api/ingest/full

# Check ingestion status
curl http://localhost:3000/api/ingestion/status

# Test chatbot
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"messages": [{"role":"user","content":"What is RIS?"}]}'
```

## Testing

### Test Business Logic Only

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

### Running Tests

```bash
# Run linter
npm run lint

# Run type check
npx tsc --noEmit

# Build (catches many issues)
npm run build
```

## Troubleshooting

### Common Issues

**"Module not found"**
- Run `npm install`
- Delete `node_modules` and `.next`, reinstall

**TypeScript errors**
- Check types are defined in `types/` folder
- Run `npx tsc --noEmit` for details
- Never use `any` - use `unknown` or proper types

**Theme not working**
- Check you're using semantic colors
- Verify CSS variables in `globals.css`
- Test in both light and dark modes

**Shopify API errors**
- Check environment variables
- Verify API token scopes
- See [Store Management Guide](../store/store-management.md)

**RIS data not updating**
- Check Redis connection
- Verify GitHub token is valid
- See [RIS Setup Guide](./ris-setup.md)

## Related Documentation

### Getting Started
- **[docs/getting-started/](../getting-started/)** - Setup and deployment

### Architecture
- **[docs/architecture/](../architecture/)** - System design *(coming soon)*

### Store Management
- **[docs/store/](../store/)** - Store-specific guides

### Foundation Systems
- **[docs/foundation/](../foundation/)** - Impact systems and design

---

*For project overview, see [README.md](../../README.md). For setup instructions, see [Getting Started](../getting-started/).*
