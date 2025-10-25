# React Impact Score (RIS) System

> **For Chatbot:** This document explains the React Impact Score system used to evaluate and fund React ecosystem libraries.

## Overview

The React Impact Score (RIS) is a comprehensive, transparent method to:
1. **Measure** the impact of React ecosystem libraries across 5 key dimensions
2. **Score** each library on a 0-1 scale based on multiple metrics
3. **Allocate** funding proportionally based on impact scores

## Who It's For

RIS evaluates and rewards **library maintainers and OSS contributors** across **54 tracked React ecosystem libraries** including:

- React core libraries (React, React DOM)
- Routing (React Router, TanStack Router)
- State management (Redux, Zustand, Jotai, Recoil)
- Data fetching (TanStack Query, SWR, Apollo Client)
- Frameworks (Next.js, Remix, Gatsby)
- UI libraries (Material-UI, Chakra UI, Radix)
- Form libraries (React Hook Form, Formik)
- Animation (Framer Motion, React Spring)
- Testing (React Testing Library, Enzyme)
- ...and 40+ more

## Five Components

### 1. Ecosystem Footprint (30%)

**What it measures:** How widely used and adopted the library is

**Metrics:**
- **NPM downloads** (50%) - 12-month total downloads (bot-filtered)
- **GitHub dependents** (30%) - Number of projects depending on this library
- **Import mentions** (15%) - Appearances in top open-source repos
- **CDN hits** (5%) - jsDelivr/UNPKG request counts

**Why it matters:** Rewards libraries that are foundational to the ecosystem and widely adopted.

### 2. Contribution Quality (25%)

**What it measures:** Quality of contributions and maintenance, not just quantity

**Metrics:**
- **PR points** (60%) - Weighted by impact (semantic changes > bug fixes > docs)
- **Issue resolution rate** (20%) - Closed issues / opened issues
- **Response time** (10%) - Median time to first response (inverted - faster is better)
- **Unique contributors** (10%) - Number of different contributors

**Anti-gaming measures:**
- PRs under 6 lines ignored
- Per-author caps prevent flooding
- Impact classification (high/medium/low)
- Quality matters more than quantity

**Why it matters:** Ensures we reward meaningful contributions, not just activity.

### 3. Maintainer Health (20%)

**What it measures:** Sustainability of the maintenance team

**Metrics:**
- **Active maintainers** (30%) - Team members with meaningful participation
- **Release cadence** (25%) - Frequency of non-patch releases (inverted)
- **Bus factor** (25%) - Distribution of commits (low concentration is better)
- **Triage latency** (15%) - Time to label/triage issues (inverted)
- **Maintainer survey** (5%) - Self-reported team health

**Why it matters:** Sustainable projects avoid burnout and single-person dependencies.

### 4. Community Benefit (15%)

**What it measures:** Educational value, documentation, and support

**Metrics:**
- **Documentation completeness** (40%) - Automated doc coverage score
- **Tutorial references** (25%) - Citations in reputable tutorials/courses
- **Helpful interactions** (20%) - Accepted answers, helpful tags on Stack Overflow/Discord
- **User satisfaction** (15%) - Quarterly user survey results

**Why it matters:** Good docs and community support multiply a library's impact.

### 5. Mission Alignment (10%)

**What it measures:** Alignment with React's long-term goals

**Metrics:**
- **Accessibility advances** (20%) - A11y improvements
- **Performance & concurrency** (25%) - Performance optimization, concurrent features
- **TypeScript strictness** (20%) - TypeScript adoption and quality
- **RSC compatibility** (20%) - React Server Components support
- **Security practices** (15%) - OSSF scorecard normalized score

**Why it matters:** Nudges ecosystem toward React's strategic priorities.

## Scoring Formula

```
RIS = 0.30×EF + 0.25×CQ + 0.20×MH + 0.15×CB + 0.10×MA
```

Where each component (EF, CQ, MH, CB, MA) is normalized to 0-1 scale.

**Final RIS range:** 0.0 to 1.0

## Revenue Allocation

### Basic Formula

```
Library Allocation = (Library RIS / Sum of All RIS) × Available Pool
```

### Safeguards

| Rule | Description |
|------|-------------|
| **Floor** | Each library gets minimum $5,000/year |
| **Cap** | No library exceeds 12% of annual pool |
| **Reserve** | 10% held for appeals & emergency grants |
| **Smoothing** | EMA smoothing prevents volatility: 70% current + 30% previous quarter |

### Example

If the RIS pool is $600,000 for a quarter:
- **Reserve**: $60,000 set aside
- **Available**: $540,000 for distribution
- Library with RIS = 0.65 and total RIS = 15.0 gets: `(0.65 / 15.0) × $540,000 = $23,400`

## Data Collection

### Fully Automated Sources

- **NPM registry** - Download counts
- **GitHub API** - PRs, issues, commits, reviews, releases, dependents
- **jsDelivr/UNPKG** - CDN request stats
- **OSSF Scorecard** - Security posture
- **Libraries.io** - Dependency data

### Opt-in Manual Sources

- **Maintainer survey** - Team health self-assessment
- **User survey** - Satisfaction ratings

## Transparency

### Quarterly Publication

Every quarter, the Foundation publishes:

1. **Raw metrics** for all libraries (CSV/JSON)
2. **Component scores** (EF, CQ, MH, CB, MA)
3. **Final RIS scores**
4. **Allocation amounts**
5. **Any methodology changes** with rationale

**Anyone can reproduce the calculations** from the public data.

### Appeals Process

- **21-day window** after publication
- Submit evidence of metric errors
- Manual review by committee
- Adjustments bounded to ±15% of computed allocation
- Decisions published

## Anti-Gaming Measures

### Statistical Protections

- **Winsorization**: Caps extreme outliers at 5th/95th percentile
- **Multi-dimensional scoring**: Can't game one metric to boost overall score
- **Quality filters**: Low-value PRs ignored
- **Per-author caps**: Prevents single-person flooding

### Monitoring

- **Spike detection**: Sudden PR floods trigger review
- **Label audits**: Random sampling verifies PR classifications
- **Penalty system**: Mislabeling results in -10% RIS for the quarter

## How to Qualify

### As a Library

1. **Tracked library list** - Must be in the 54 tracked React ecosystem libraries
2. **NPM published** - Public package on NPM
3. **GitHub repository** - Public repo with issue tracker
4. **Community maintained** - Active development within last 12 months

### As a Contributor

1. **Contribute to tracked libraries** - Submit PRs, file issues, make commits
2. **Quality over quantity** - Focus on meaningful contributions
3. **Follow best practices** - Good commit messages, tests, documentation
4. **Automatic tracking** - GitHub metrics collected automatically

**No application required** - If you contribute to tracked libraries, you're automatically considered for RIS allocation (goes to the library maintainers, who can choose to distribute to contributors).

## Benefits of RIS

### For Libraries

- **Sustainable funding** - Predictable quarterly revenue
- **Recognition** - Public impact scores and rankings
- **Transparency** - Clear understanding of how scores are calculated
- **Fairness** - Multi-dimensional prevents gaming

### For Contributors

- **Contribution tracking** - Automatic GitHub integration
- **Store access tiers** - Based on contribution points (separate from RIS)
- **Community recognition** - Visible impact on ecosystem

### For the Ecosystem

- **Quality incentive** - Rewards good maintenance practices
- **Sustainability** - Supports teams, not individuals
- **Innovation** - Mission alignment rewards new features
- **Documentation** - Community benefit encourages docs

## Tracked Libraries (54 total)

**Routing & Frameworks:**
- React Router, TanStack Router, Wouter
- Next.js, Remix, Gatsby

**State Management:**
- Redux, Zustand, Jotai, Recoil, Valtio, MobX

**Data Fetching:**
- TanStack Query, SWR, Apollo Client, Relay

**UI Libraries:**
- Material-UI, Chakra UI, Ant Design, Mantine, Radix

**Forms:**
- React Hook Form, Formik, Final Form

**Animation:**
- Framer Motion, React Spring, Auto-Animate

**3D/Graphics:**
- React Three Fiber, React Three Drei

...and 30+ more across testing, accessibility, developer tools, and utilities.

## Related Topics

- [Foundation Overview](./foundation-overview.md)
- [CIS System (Educators)](./cis-system.md)
- [CoIS System (Organizers)](./cois-system.md)
- [Revenue Distribution Model](./revenue-distribution.md)
- [Contributor Tracking](../getting-involved/contributor-tracking.md)

---

*Last updated: October 2025*
*Part of React Foundation public documentation*
