# Contributing to React Foundation Store

Thank you for your interest in contributing to the React Foundation Store! This document provides guidelines and information for contributors.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Process](#development-process)
- [Code Standards](#code-standards)
- [Documentation](#documentation)
- [Testing](#testing)
- [Pull Request Process](#pull-request-process)
- [Project Structure](#project-structure)

## Code of Conduct

This project is dedicated to providing a welcoming and inclusive experience for everyone. We expect all contributors to:

- Be respectful and considerate
- Welcome newcomers and help them get started
- Focus on what is best for the community
- Show empathy towards other community members

## Getting Started

### Prerequisites

- **Node.js 18+** - JavaScript runtime
- **npm** - Package manager
- **Git** - Version control
- **Shopify Store** - For store development (can use development store)
- **Redis** - For caching and data storage

### Initial Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/reactfoundation/store.git
   cd store
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your credentials
   ```

4. **Setup Shopify metafields** (first time only):
   ```bash
   npm run shopify:setup-metafields
   ```

5. **Start development server:**
   ```bash
   npm run dev
   ```

See **[docs/getting-started/](./docs/getting-started/)** for detailed setup instructions.

## Development Process

### Workflow

1. **Create a feature branch:**
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/bug-description
   ```

2. **Make your changes:**
   - Write code following our standards (see below)
   - Add tests if applicable
   - Update documentation as needed

3. **Test your changes:**
   ```bash
   # Type check
   npx tsc --noEmit

   # Lint
   npm run lint

   # Build
   npm run build
   ```

4. **Commit your changes:**
   ```bash
   git add .
   git commit -m "feat: add new feature"
   # or
   git commit -m "fix: resolve bug in component"
   ```

5. **Push and create PR:**
   ```bash
   git push origin feature/your-feature-name
   # Then create a Pull Request on GitHub
   ```

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation only
- `style:` - Code style (formatting, no code change)
- `refactor:` - Code refactor (no feature change)
- `perf:` - Performance improvement
- `test:` - Adding tests
- `chore:` - Build process or tooling

**Examples:**
```bash
feat: add RIS data collection button
fix: resolve metafield null issue in ProductCard
docs: update RIS setup guide
refactor: extract custom hooks from component
```

## Code Standards

### TypeScript

**Always use strict typing:**
```typescript
// ❌ Bad
function processData(data: any) { ... }

// ✅ Good
function processData(data: LibraryRawMetrics) { ... }
```

**Define interfaces in `types/` folder:**
```typescript
// types/library.ts
export interface Library {
  id: string;
  name: string;
  github: string;
}
```

**Run type check before committing:**
```bash
npx tsc --noEmit
```

### React Components

**Use functional components with hooks:**
```typescript
// ❌ Bad - class component
class MyComponent extends React.Component { ... }

// ✅ Good - functional component
export function MyComponent() { ... }
```

**Extract custom hooks:**
```typescript
// ❌ Bad - useEffect in component
export function ProductCard() {
  useEffect(() => {
    // complex logic
  }, []);
}

// ✅ Good - custom hook
export function ProductCard() {
  const product = useProduct(productId);
}
```

**Use RFDS (React Foundation Design System):**
```typescript
// ❌ Bad - creating from scratch
<button className="bg-blue-500...">Click</button>

// ✅ Good - using RFDS
import { RFDS } from "@/components/rfds"
<RFDS.Button variant="primary">Click</RFDS.Button>
```

### Styling

**Use semantic colors (never hardcoded):**
```typescript
// ❌ Bad - hardcoded colors
<div className="bg-blue-500 text-white">

// ✅ Good - semantic colors
<div className="bg-primary text-primary-foreground">
```

See **[docs/development/theming.md](./docs/development/theming.md)** for complete theming guide.

### Code Quality Checklist

Before submitting a PR, ensure:

- ✅ TypeScript passes (`npx tsc --noEmit`)
- ✅ ESLint passes (`npm run lint`)
- ✅ All warnings fixed
- ✅ No `console.log` statements
- ✅ Tested in both light and dark themes
- ✅ Works in both desktop and mobile
- ✅ Documentation updated

## Documentation

### When to Update Documentation

Update documentation when you:
- Add new features
- Change existing features
- Add new configuration options
- Change environment variables
- Add new scripts or commands
- Change API endpoints

### Documentation Structure

- **[docs/](./docs/)** - Internal developer documentation
- **[public-context/](./public-context/)** - External/public documentation (for chatbot)
- **[README.md](./README.md)** - Project overview
- **[CLAUDE.md](./CLAUDE.md)** - AI development instructions
- **Code comments** - For complex logic

### Documentation Standards

- Use clear, concise language
- Include examples
- Add code snippets with syntax highlighting
- Cross-reference related docs
- Keep it up to date

## Testing

### What to Test

✅ **DO TEST:**
- Business logic (calculations, algorithms)
- API integrations (Shopify, GitHub)
- Utility functions
- Data transformations
- Error handling

❌ **DON'T TEST:**
- UI components (we focus on integration testing)
- Next.js routing
- Static content
- Third-party libraries

### Running Tests

```bash
# Type check
npx tsc --noEmit

# Lint
npm run lint

# Build (catches many issues)
npm run build
```

## Pull Request Process

### Before Submitting

1. Update documentation if needed
2. Run all checks (TypeScript, ESLint, build)
3. Test your changes locally
4. Ensure commit messages follow conventions
5. Rebase on latest main if needed

### PR Description

Include in your PR description:

**Summary:**
- Brief description of changes
- Why the change is needed

**Changes:**
- List of specific changes made
- Components/files modified

**Testing:**
- How you tested the changes
- Manual testing steps if applicable

**Screenshots:**
- Before/after screenshots for UI changes
- Include both light and dark themes

### Review Process

1. PR is submitted
2. Automated checks run (TypeScript, ESLint)
3. Code review by maintainers
4. Address feedback if needed
5. PR is merged

### After Merge

- Delete your feature branch
- Pull latest main
- Close related issues

## Project Structure

```
react-foundation-store/
├── docs/                      # Internal developer documentation
│   ├── getting-started/       # Setup and deployment
│   ├── store/                 # Store management
│   ├── foundation/            # Foundation systems
│   ├── chatbot/               # Content ingestion
│   ├── community/             # Educator & community
│   └── development/           # Dev guides
├── public-context/            # External/public docs (chatbot)
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── page.tsx          # Foundation homepage
│   │   ├── about/            # About page
│   │   ├── impact/           # Impact reports
│   │   ├── store/            # Store section
│   │   └── api/              # API routes
│   ├── components/
│   │   ├── rfds/             # Design system
│   │   ├── layout/           # Header, Footer
│   │   └── ui/               # UI primitives
│   ├── lib/                  # Utilities & data
│   │   ├── ris/              # React Impact Score
│   │   ├── cis/              # Content Impact Score
│   │   └── shopify.ts        # Shopify integration
│   └── types/                # TypeScript definitions
├── scripts/                  # Management scripts
└── public/                   # Static assets
```

See **[docs/](./docs/)** for detailed documentation of each section.

## Key Technologies

- **Next.js 15** - React framework (App Router)
- **React 19** - UI library
- **TypeScript 5** - Type safety
- **Tailwind CSS 4** - Styling
- **Shopify** - CMS and e-commerce
- **Redis** - Caching and data storage
- **OpenAI** - AI features (image generation, chatbot)
- **Three.js** - 3D graphics

## Questions or Problems?

1. Check **[docs/](./docs/)** for documentation
2. Search existing issues
3. Create a new issue if needed
4. Ask in discussions

## License

By contributing, you agree that your contributions will be licensed under the same license as the project.

---

**Thank you for contributing to the React Foundation Store!**

For more information:
- **[Documentation](./docs/)** - Complete developer docs
- **[README.md](./README.md)** - Project overview
- **[CLAUDE.md](./CLAUDE.md)** - AI development instructions
