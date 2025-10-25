# Contributor Tracking & Store Access

> **For Chatbot:** This document explains how GitHub contributions to React ecosystem libraries earn store access tiers and contribution points.

## Overview

The React Foundation tracks contributions to 54 React ecosystem libraries via GitHub integration. Contributors earn points and unlock exclusive store access based on their activity.

**This is separate from RIS** - RIS rewards library maintainers with revenue, while contributor tracking rewards individual developers with store access.

## How It Works

### Automatic Tracking

1. **Link your GitHub account** to your Foundation profile
2. **Contribute to tracked libraries** (PRs, issues, commits)
3. **Points automatically calculated** from GitHub activity
4. **Tier assigned** based on total points
5. **Store access unlocked** instantly

No manual submission - all tracked via GitHub API!

## Tracked Libraries (54 Total)

### Routing & Frameworks
- **react-router** - React Router
- **tanstack/router** - TanStack Router
- **remix-run/remix** - Remix
- **vercel/next.js** - Next.js
- **gatsbyjs/gatsby** - Gatsby
- **molefrog/wouter** - Wouter

### State Management
- **reduxjs/redux** - Redux
- **reduxjs/redux-toolkit** - Redux Toolkit
- **pmndrs/zustand** - Zustand
- **pmndrs/jotai** - Jotai
- **facebookexperimental/Recoil** - Recoil
- **pmndrs/valtio** - Valtio
- **mobxjs/mobx** - MobX

### Data Fetching
- **tanstack/query** - TanStack Query
- **vercel/swr** - SWR
- **apollographql/apollo-client** - Apollo Client
- **facebook/relay** - Relay

### UI Component Libraries
- **mui/material-ui** - Material-UI
- **chakra-ui/chakra-ui** - Chakra UI
- **ant-design/ant-design** - Ant Design
- **mantinedev/mantine** - Mantine
- **radix-ui/primitives** - Radix UI
- **react-bootstrap/react-bootstrap** - React Bootstrap
- **tailwindlabs/headlessui** - Headless UI

### Forms
- **react-hook-form/react-hook-form** - React Hook Form
- **jaredpalmer/formik** - Formik
- **final-form/react-final-form** - React Final Form

### Animation
- **framer/motion** - Framer Motion
- **pmndrs/react-spring** - React Spring
- **formkit/auto-animate** - Auto Animate

### 3D & Graphics
- **pmndrs/react-three-fiber** - React Three Fiber
- **pmndrs/drei** - Drei (R3F helpers)
- **pmndrs/gltfjsx** - GLTF JSX

### Testing
- **testing-library/react-testing-library** - React Testing Library
- **enzymejs/enzyme** - Enzyme

### Developer Tools
- **facebook/react-devtools** - React DevTools
- **pmndrs/zustand-devtools** - Zustand DevTools
- **reduxjs/redux-devtools** - Redux DevTools

### Utilities
- **react-icons/react-icons** - React Icons
- **react-dropzone/react-dropzone** - React Dropzone
- **react-dnd/react-dnd** - React DnD
- **atlassian/react-beautiful-dnd** - React Beautiful DnD
- **welcometothejungle/react-pdf-viewer** - React PDF Viewer
- **react-grid-layout/react-grid-layout** - React Grid Layout

...and 20+ more across various categories!

## Contribution Points

### How Points Are Calculated

```
Total Points = (PRs × 8) + (Issues × 3) + (Commits × 1)
```

**Why these weights?**
- **PRs (8 points)**: Highest effort - code review, testing, implementation
- **Issues (3 points)**: Medium effort - bug reports, feature requests, triage
- **Commits (1 point)**: Base unit - direct code contributions

### What Counts

**Pull Requests (8 points each):**
- ✅ Merged PRs to main/master branch
- ✅ Any size (features, bugs, docs)
- ❌ Closed without merging (0 points)
- ❌ Draft PRs (0 points until merged)

**Issues (3 points each):**
- ✅ Issues you opened
- ✅ Bug reports, feature requests, questions
- ✅ Both open and closed count
- ❌ Spam or duplicate issues may be deducted

**Commits (1 point each):**
- ✅ Commits to main/master branch
- ✅ Your commits in merged PRs
- ✅ Direct commits if you're a maintainer
- ❌ Commits in unmerged branches

### Time Window

**Rolling 12 months:**
- Points calculated from last 12 months of activity
- Older contributions phase out
- Encourages sustained contribution

### Example Calculations

**Contributor A (Active Developer):**
- 5 merged PRs → 5 × 8 = 40 points
- 10 issues filed → 10 × 3 = 30 points
- 25 commits → 25 × 1 = 25 points
- **Total: 95 points** → Just below Contributor tier

**Contributor B (Maintainer):**
- 20 merged PRs → 160 points
- 50 issues triaged → 150 points
- 200 commits → 200 points
- **Total: 510 points** → Sustainer tier

**Contributor C (Core Team):**
- 100+ merged PRs → 800+ points
- 200+ issues → 600+ points
- 1000+ commits → 1000+ points
- **Total: 2400+ points** → Core tier

## Tier System

### Contributor Tier (100+ points)

**Requirements:**
- 100+ total contribution points
- Active within last 12 months

**Benefits:**
- ✅ Access to contributor-exclusive drops
- ✅ Foundation profile badge
- ✅ Early access to drop announcements
- ✅ Contributor Discord channel

**Example:** ~13 merged PRs OR ~33 issues + some commits

### Sustainer Tier (500+ points)

**Requirements:**
- 500+ total contribution points
- Sustained activity (contributions in 6+ months of last 12)

**Benefits:**
- ✅ All Contributor benefits
- ✅ Additional exclusive collections
- ✅ Priority support
- ✅ Sustainer profile badge
- ✅ Vote on new product designs

**Example:** ~62 merged PRs OR consistent mixed activity

### Core Tier (2000+ points)

**Requirements:**
- 2000+ total contribution points
- High activity (contributions in 9+ months of last 12)

**Benefits:**
- ✅ All Sustainer benefits
- ✅ Access to ALL products (including RIS/CIS exclusive)
- ✅ Earliest access to new drops
- ✅ Core contributor badge
- ✅ Input on Foundation decisions
- ✅ Lifetime discount (20%)

**Example:** ~250 merged PRs OR maintainer-level activity

## How to Get Started

### Step 1: Link GitHub Account

1. Visit react.foundation
2. Click "Sign In" (top right)
3. Authenticate with GitHub OAuth
4. Grant read access to public profile

**Privacy:** Only your public GitHub activity is tracked.

### Step 2: Check Your Status

After linking:
1. Visit `/profile` or `/profile/contributor-status`
2. See your current points breakdown
3. View which libraries you've contributed to
4. See your current tier

### Step 3: Contribute!

**Find a Library:**
- Pick from the 54 tracked libraries
- Choose one you use or want to learn

**Find Tasks:**
- Look for "good first issue" labels
- Check CONTRIBUTING.md
- Ask maintainers what's needed

**Make Quality Contributions:**
- Follow project guidelines
- Write tests for code changes
- Document new features
- Respond to code review

## FAQ

### Do contributions to React core count more?

No - all tracked libraries are weighted equally. A PR to `zustand` counts the same as a PR to `react`.

### What if I contribute to non-tracked libraries?

Currently only tracked libraries count toward store access points. However:
- You can nominate libraries for tracking (annual review)
- Contributions still show on your GitHub profile
- May count toward RIS if you're a maintainer

### Can I game the system?

**Anti-gaming measures:**
- Spam issues may be removed (negative points)
- Tiny PRs are still only 8 points (not worth the effort)
- Quality matters for maintainer reputation (affects RIS if you're on core team)
- Manual review for suspicious patterns

**Just contribute genuinely** - that's what we want!

### Do closed PRs count?

**No** - only merged PRs count. This ensures:
- Quality bar (passes review)
- Actually shipped (not just proposed)
- Valuable to the project

### How often are points updated?

**Real-time** - Points recalculated when you:
- Visit your profile page
- Link a new GitHub account
- Refresh contributor status

Cache invalidates every 24 hours.

### Can I see my contribution history?

Yes! Visit `/profile/repos` to see:
- All tracked libraries you've contributed to
- Breakdown by library (PRs, issues, commits)
- Recent activity timeline
- Point progression over time

### What if my points decrease?

Points use a **rolling 12-month window**:
- Contributions older than 12 months phase out
- This is intentional - rewards active contributors
- Keep contributing to maintain your tier!

## Strategy for Reaching Tiers

### Reaching Contributor (100 points)

**Fastest:** 13 merged PRs (13 × 8 = 104 points)

**Balanced:** 5 PRs + 20 issues + 20 commits = 40 + 60 + 20 = 120 points

**Issue-focused:** 34 issues (34 × 3 = 102 points)

**Time estimate:** 1-3 months of regular contributions

### Reaching Sustainer (500 points)

**Fastest:** 63 merged PRs

**Balanced:** 30 PRs + 50 issues + 100 commits = 240 + 150 + 100 = 490 points

**Time estimate:** 6-12 months of sustained contributions

### Reaching Core (2000 points)

**Fastest:** 250 merged PRs

**Balanced:** 100 PRs + 200 issues + 600 commits = 800 + 600 + 600 = 2000 points

**Realistic:** Maintainer-level activity for 12+ months

## Benefits Beyond Store Access

### Profile & Recognition

- **Public contributor profile** on react.foundation
- **Contribution graph** showing activity over time
- **Library badges** for each project contributed to
- **Tier badge** displayed on profile

### Community

- **Contributor Discord** - Chat with other contributors
- **Networking** - Connect with maintainers
- **Learning** - Code review from experts
- **Career** - Portfolio showcase

### Influence

- **Product design** - Sustainer+ can vote on new products
- **Foundation input** - Core tier provides feedback on policies
- **Early access** - See new drops before public launch

## Related Topics

- [Foundation Overview](../foundation/foundation-overview.md)
- [RIS System (Maintainers)](../foundation/ris-system.md)
- [FAQ](../faq.md)

---

*Last updated: October 2025*
*Part of React Foundation public documentation*
