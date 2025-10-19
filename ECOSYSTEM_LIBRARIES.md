# React Ecosystem Libraries Tracking

This document outlines the 54 React ecosystem libraries tracked for contributor recognition and tier progression in the React Foundation Store.

## Overview

We track contributions across **54 carefully curated repositories** that represent the most impactful and widely-used libraries in the React ecosystem. These libraries span multiple categories from core React infrastructure to popular community tools.

**Last Updated:** October 2025 (verified current for 2025)

**Scoring Model:**
- Pull Requests Opened: **8 points**
- Issues Opened: **3 points**
- Commits: **1 point**

**Time Window:** Past 12 months

**⚠️ Important Note:** Due to GitHub API limitations, we can only track PRs and issues you **created/opened**. The following do NOT count:
- Issue comments or discussions
- PR reviews or review comments
- Issue triage, labeling, or assignment
- Documentation reviews (unless in a PR you opened)

## Tier System

With 54 tracked libraries, tier thresholds have been calibrated to recognize meaningful ecosystem contributions:

| Tier | Min Score | Description |
|------|-----------|-------------|
| **Contributor Access** | 40 | Consistent contributions across the React ecosystem (~5 merged PRs) |
| **Sustainer Access** | 120 | Sustained engagement across multiple libraries (~15 merged PRs) |
| **Core Ally Access** | 250 | Top-tier maintainers who are pillars of the ecosystem (~30+ merged PRs) |

## Tracked Libraries (54 Total)

### Core React & React Native (9 repositories)
**Tier 1 (Critical Infrastructure):**
- `facebook/react` - The React core library (includes React Compiler in `/compiler` subdirectory)
- `facebook/react-native` - Native mobile development with React
- `facebook/hermes` - **NEW 2025** - JavaScript engine optimized for React Native (default engine)
- `reactjs/react.dev` - Official React documentation site
- `reactjs/rfcs` - React RFCs (Request for Comments)
- `react-navigation/react-navigation` - **NEW 2025** - Navigation library for React Native

**Tier 1 (First-party Tools):**
- `facebook/jest` - JavaScript testing framework
- `facebook/relay` - GraphQL client for React

**Tier 2:**
- `react-native-community/react-native-releases` - React Native release coordination

---

### State Management (6 repositories)
**Tier 1 (Most Popular):**
- `reduxjs/redux` - Predictable state container
- `reduxjs/redux-toolkit` - Official Redux toolset

**Tier 2 (Modern Alternatives):**
- `pmndrs/zustand` - Minimal state management
- `pmndrs/jotai` - Atomic state management
- `pmndrs/valtio` - Proxy-based state
- `statelyai/xstate` - State machines and statecharts

**⚠️ Removed:** `facebookexperimental/Recoil` - Archived by Meta on January 1, 2025. Alternatives: Jotai, Zustand

---

### Data Fetching (5 repositories)
**Tier 1 (Critical Tools):**
- `TanStack/query` - Powerful async state management (React Query)
- `vercel/swr` - React Hooks for data fetching
- `apollographql/apollo-client` - GraphQL client

**Tier 2:**
- `trpc/trpc` - End-to-end type-safe APIs
- `urql-graphql/urql` - Lightweight GraphQL client

---

### Routing (3 repositories)
**Tier 1:**
- `remix-run/react-router` - Declarative routing for React

**Tier 2:**
- `TanStack/router` - Type-safe routing

**Tier 3:**
- `molefrog/wouter` - Minimalist routing

---

### Meta-frameworks (5 repositories)
**Tier 1 (Production-Grade Frameworks):**
- `vercel/next.js` - The React framework for production
- `remix-run/remix` - Full-stack web framework
- `expo/expo` - **NEW 2025** - Official React Native framework (1.3M weekly downloads)

**Tier 2:**
- `gatsbyjs/gatsby` - Static site generator
- `withastro/astro` - Modern static site builder with React support

---

### Forms & Validation (5 repositories)
**Tier 1 (Most Adopted):**
- `react-hook-form/react-hook-form` - Performant forms with React Hooks
- `colinhacks/zod` - TypeScript-first schema validation

**Tier 2:**
- `jaredpalmer/formik` - Build forms in React
- `jquense/yup` - Schema validation library

**Tier 3:**
- `final-form/react-final-form` - Form state management

---

### Testing (4 repositories)
**Tier 1 (Industry Standard):**
- `testing-library/react-testing-library` - React DOM testing utilities
- `vitest-dev/vitest` - Next-gen testing framework
- `microsoft/playwright` - End-to-end testing

**Tier 2:**
- `testing-library/react-hooks-testing-library` - Testing hooks in isolation

---

### UI/Component Libraries (6 repositories)
**Tier 1 (Widely Used):**
- `radix-ui/primitives` - Unstyled, accessible components
- `tailwindlabs/headlessui` - Unstyled UI components
- `mui/material-ui` - Material Design components

**Tier 2:**
- `adobe/react-spectrum` - Adobe's design system
- `ariakit/ariakit` - Accessible React components
- `chakra-ui/chakra-ui` - Component library with accessibility

---

### Animation (3 repositories)
**Tier 1:**
- `framer/motion` - Production-ready motion library

**Tier 2:**
- `pmndrs/react-spring` - Spring-physics based animation

**Tier 3:**
- `formkit/auto-animate` - Zero-config animation

---

### Dev Tools & Bundling (5 repositories)
**Tier 1 (Essential Tooling):**
- `storybookjs/storybook` - UI component dev environment
- `vitejs/vite` - Next-gen frontend tooling
- `facebook/react-devtools` - Browser DevTools for React

**Tier 2:**
- `facebook/metro` - React Native bundler
- `vercel/turbo` - Incremental bundler and build system

---

### Data Tables (1 repository)
**Tier 1:**
- `TanStack/table` - **NEW 2025** - Headless table library, most popular React table solution (used by Google, Apple, Microsoft)

---

### Styling (2 repositories)
**Tier 1:**
- `styled-components/styled-components` - **NEW 2025** - CSS-in-JS library (2.6M+ weekly downloads, in maintenance mode but widely used)
- `emotion-js/emotion` - **NEW 2025** - CSS-in-JS library with performance optimizations

**Note:** While runtime CSS-in-JS has declined in popularity for new projects (due to build-time solutions like Tailwind CSS), both libraries remain widely used in existing production applications.

---

## Category Definitions

| Category | Description | Example Use Cases |
|----------|-------------|-------------------|
| **Core** | Official React repositories and first-party tools | React itself, React Native, Expo, documentation |
| **State** | State management solutions | Redux, Zustand, Jotai, XState |
| **Data** | Data fetching, caching, and GraphQL clients | React Query, SWR, Apollo, tRPC |
| **Routing** | Client-side and full-stack routing | React Router, React Navigation, TanStack Router |
| **Framework** | Meta-frameworks that build on React | Next.js, Remix, Gatsby |
| **Forms** | Form handling and validation libraries | React Hook Form, Formik, Zod |
| **Testing** | Testing utilities and frameworks | React Testing Library, Vitest, Playwright |
| **UI** | Component libraries and design systems | Radix UI, Headless UI, MUI, Chakra UI |
| **Animation** | Motion and animation libraries | Framer Motion, React Spring |
| **Tooling** | Build tools, bundlers, and developer tools | Storybook, Vite, React DevTools |
| **Tables** | Data grid and table libraries | TanStack Table |
| **Styling** | CSS-in-JS and styling solutions | styled-components, Emotion |

## Selection Criteria

Libraries are included based on:

1. **Active Maintenance**: Regular commits/releases in the past 6 months
2. **Community Adoption**: Significant GitHub stars and npm downloads
3. **React Ecosystem Relevance**: Core to React development workflows
4. **Production Readiness**: Used in real-world production applications
5. **Unique Value**: Addresses a specific need or problem domain

## How Contributions Are Scored

Contributions are tracked via GitHub GraphQL API for the past 12 months:

1. **Pull Requests Opened** (8 points each):
   - PRs you **created** in any of the 53 tracked repositories
   - Includes features, bug fixes, refactors, and documentation PRs
   - ❌ **Does NOT include:** PR reviews, review comments, or approvals

2. **Issues Opened** (3 points each):
   - Issues you **created** in tracked repositories
   - Includes bug reports, feature requests, and documentation issues
   - ❌ **Does NOT include:** Issue comments, triage work, labels, or assignments

3. **Commits** (1 point each):
   - Individual commits you **authored** in tracked repositories
   - Often bundled in PRs but counted separately

### API Limitations

GitHub's Contributions API only tracks content **creation**:
- ✅ Counts: PRs opened, Issues opened, Commits made
- ❌ Does NOT count: Comments, reviews, triage, labels, discussions

This means valuable maintainer work like issue triage, code reviews, and community support is **not reflected** in scores. We acknowledge this limitation and encourage viewing scores as one metric among many for recognizing ecosystem contributions.

**Example Scoring:**
- Submit 5 merged PRs: **40 points** → Contributor tier unlocked
- Submit 15 merged PRs + 10 issues: **150 points** → Sustainer tier unlocked
- Submit 30 merged PRs + 20 issues + 50 commits: **350 points** → Core Ally tier unlocked

## Category Breakdown

The UI displays a **Category Breakdown** showing your total contributions per category:
- **Core React**: 15 contributions
- **State Management**: 8 contributions
- **Testing**: 5 contributions

This helps visualize your specialization within the ecosystem.

## Adding/Removing Libraries

### Criteria for Adding New Libraries:
- Minimum **5,000 GitHub stars** or **100K weekly npm downloads**
- Active maintenance (commits in last 3 months)
- Clear React integration/focus
- Community request with justification

### Criteria for Removing Libraries:
- No commits in past 6 months
- Deprecated by maintainers
- Superseded by another tracked library
- No longer relevant to modern React development

### Proposal Process:
1. Open an issue titled "Library Proposal: [library-name]"
2. Provide justification using the criteria above
3. Community discussion and maintainer review
4. Decision within 2 weeks

## Library Tiers Explained

**Tier 1 (Critical):**
- Industry-standard libraries
- Used in majority of React projects
- Strong community backing
- *Potential future weighting: 1.5x multiplier*

**Tier 2 (Popular):**
- Widely adopted but with alternatives
- Growing community
- *Potential future weighting: 1.2x multiplier*

**Tier 3 (Emerging):**
- Newer or niche libraries
- Smaller but active communities
- *Potential future weighting: 1.0x multiplier*

**Note:** Currently all tiers use the same scoring (no multipliers). Tier classification is for organization and potential future weighting.

## FAQ

**Q: Why isn't [my favorite library] tracked?**
A: We limit tracking to 50 libraries to maintain focus. Submit a proposal if you believe it meets our criteria!

**Q: Do contributions to forks count?**
A: No, only contributions to the official repositories listed above.

**Q: What if I contributed more than 12 months ago?**
A: We use a rolling 12-month window. Older contributions will age out, encouraging ongoing participation.

**Q: Can I see which libraries I've contributed to?**
A: Yes! The "Category Breakdown" section shows your activity across all categories.

**Q: Do draft PRs count?**
A: No, only merged PRs are counted in the scoring system.

## Changelog

**2025-10-17**: Updated to 54 libraries (2025-current verification)
- **REMOVED:** Recoil (archived by Meta on Jan 1, 2025)
- **REMOVED:** `facebook/react-compiler` as separate repo (it's a subdirectory of `facebook/react`, not a separate repository)
- **ADDED:** Hermes (JavaScript engine optimized for React Native, default engine since RN 0.70)
- **ADDED:** Expo (1.3M weekly downloads, officially recommended for React Native) - categorized as meta-framework
- **ADDED:** React Navigation (primary navigation for React Native apps)
- **ADDED:** TanStack Table (most popular React table library)
- **ADDED:** styled-components (2.6M+ weekly downloads, widely used)
- **ADDED:** Emotion (popular CSS-in-JS solution)
- **MOVED:** Expo moved from Core React to Meta-frameworks category (more accurate classification)
- **CLARIFIED:** React Compiler contributions count under `facebook/react` (compiler is in `/compiler` subdirectory)
- Added new categories: Tables, Styling
- Verified all libraries are actively maintained as of October 2025

**2025-10**: Expanded from 8 to 54 libraries
- Added 6 state management libraries
- Added 5 data fetching libraries
- Added 3 routing libraries
- Added 4 meta-frameworks
- Added 5 forms & validation libraries
- Added 4 testing libraries
- Added 6 UI/component libraries
- Added 3 animation libraries
- Added 5 dev tools & bundling libraries
- Updated tier thresholds: 12→40, 32→120, 56→250
- Added category breakdown UI

---

*This document is maintained by the React Foundation Store team. Last updated: October 17, 2025.*
