# React Foundation - Frequently Asked Questions

> **For Chatbot:** Comprehensive FAQ covering the React Foundation, impact systems, store, and how to get involved.

## General Questions

### What is the React Foundation?

The React Foundation is a non-profit organization that supports the React ecosystem through:
- **Financial support** for library maintainers (RIS)
- **Revenue sharing** with educators (CIS)
- **Funding** for community organizers (CoIS)
- **Sustainable funding model** via official merchandise store

→ [Learn more: Foundation Overview](./foundation/foundation-overview.md)

### How is the Foundation funded?

20% of official store profits are allocated to three impact pools:
- **60%** → React Impact Score (library maintainers)
- **24%** → Content Impact Score (educators)
- **16%** → Community Impact Score (organizers)

The remaining 80% covers store operations and Foundation overhead.

### Is this related to Meta/Facebook?

The React Foundation is **independent** from Meta, though we coordinate with the React core team. Meta develops React, but the Foundation focuses on ecosystem sustainability and community support.

### How can I trust the Foundation?

**Transparency:**
- Quarterly public reports with full allocation data
- Open-source scoring algorithms
- Published metrics for all recipients
- Public appeals process

**Governance:**
- Advisory board with React core team + community reps
- Financial audits
- Open methodology

## Impact Systems

### What's the difference between RIS, CIS, and CoIS?

- **RIS (React Impact Score)**: For library maintainers and OSS contributors
- **CIS (Content Impact Score)**: For educators and content creators
- **CoIS (Community Impact Score)**: For meetup/conference organizers

Each has its own scoring methodology and revenue pool.

### Can I qualify for multiple systems?

Yes! You could:
- Maintain a library (RIS)
- Create educational content about it (CIS)
- Organize a meetup featuring it (CoIS)

Each system evaluates independently.

### How often are scores calculated?

**Quarterly** (every 3 months):
- Metrics collected
- Scores calculated
- Revenue distributed
- Public reports published

### Can scores decrease from quarter to quarter?

Yes, but smoothing prevents dramatic drops:
- **EMA smoothing**: 70% current + 30% previous quarter
- Gradual changes reward consistency
- Temporary dips don't drastically affect allocation

## RIS (Library Maintainers)

### Which libraries are tracked for RIS?

54 React ecosystem libraries including:
- Core: React, React DOM
- Routing: React Router, TanStack Router
- State: Redux, Zustand, Jotai, Recoil
- Data: TanStack Query, SWR, Apollo Client
- Frameworks: Next.js, Remix, Gatsby
- UI: Material-UI, Chakra UI, Radix
- ...and 40+ more

→ [See full list: RIS System](./foundation/ris-system.md)

### How do I get my library tracked?

Currently, the 54 libraries are pre-selected based on ecosystem importance. New libraries may be added:
- Annual review of ecosystem landscape
- Community nomination process
- Board approval required
- Criteria: >100k weekly NPM downloads OR strategic importance

### Do individual contributors get paid from RIS?

RIS allocations go to **library maintainers** (typically the core team). How they distribute to contributors is up to each project. Some may:
- Share equally among core team
- Allocate based on contribution level
- Fund specific initiatives
- Create contributor bounties

### What counts as a "quality" contribution?

**High impact** (1.0 weight):
- New features with tests
- Performance improvements
- Accessibility enhancements
- Security fixes

**Medium impact** (0.6 weight):
- Bug fixes
- Documentation with examples

**Low impact** (0.1 weight):
- Typo fixes
- Formatting changes

**Ignored**:
- PRs under 6 lines without tests/docs
- Pure refactors without justification

## CIS (Educators)

### Who qualifies as an "educator"?

- YouTube content creators
- Course creators (Udemy, Teachable, etc.)
- Technical writers and bloggers
- Tutorial authors
- Workshop instructors

→ [Learn more: Educator Program](./getting-involved/educator-program.md)

### Is free content rewarded the same as paid?

**Yes!** The Community Teaching Impact component (15%) actually **rewards** free content:
- Free vs paid ratio is a positive metric
- Paid courses can still rank high via quality/outcomes
- Balance ensures both models are viable

### How is content quality verified?

**Peer Review Process:**
1. React core team + ecosystem experts review content
2. Automated code quality checks on examples
3. Community reports for inaccuracies
4. Alignment check with official React docs

### What if my content becomes outdated?

The **Consistency & Longevity** component (5%) rewards updates:
- Content freshness score
- React version alignment
- Update velocity tracking

Keeping content current boosts your score!

### Can I appeal my CIS score?

Yes! **21-day appeals window** after each quarterly publication:
- Submit evidence of metric errors
- Provide peer review rebuttals
- Request re-evaluation
- All decisions published

## CoIS (Community Organizers)

### What types of communities qualify?

- **Meetups**: Monthly React meetups
- **Conferences**: Annual or bi-annual React conferences
- **Hackathons**: React-focused hack events
- **Workshops**: Multi-session workshop series
- **Online communities**: Discord/Slack with regular events

→ [Learn more: Community Building Guide](./getting-involved/community-building-guide.md)

### Is a Code of Conduct required?

**YES.** Non-negotiable for CoIS eligibility:
- Must be published and public
- Must be enforced consistently
- Must provide incident reporting
- Must train organizers on enforcement

Missing/unenforced CoC = disqualified from CoIS.

### Can virtual/hybrid events qualify?

**Absolutely!** Virtual participation is 10% of Event Reach & Frequency:
- Hybrid events (in-person + virtual) score well
- Fully virtual events qualify
- Online communities with regular events qualify

### How small can a meetup be?

**Minimum**: 50 total attendees across 12 months
- Could be 5 events × 10 people
- Or 2 events × 25 people
- Or 1 conference × 50 people

Quality and consistency matter more than size.

## The Official Store

### Why does the Foundation run a store?

**Sustainable funding model:**
- Avoids dependence on corporate donations
- Community purchases directly support impact pools
- Transparent revenue → impact allocation

**Community identity:**
- High-quality React merchandise
- Limited edition collectibles
- Contributor-exclusive items

→ [Learn more: Store Overview](./store/store-overview.md)

### What are "drops"?

**Time-limited collections** with:
- Start and end dates (e.g., Fall 2025 Drop)
- Unique theme (e.g., "Leaves of Gold")
- Limited edition sizing
- Exclusive designs

They create excitement and scarcity while funding the Foundation.

### Can anyone buy from the store?

- **Public drops**: Anyone can purchase
- **Contributor drops**: Require GitHub verification
- **Tier-exclusive**: Require Sustainer/Core contributor status

### How do I get contributor access?

**Earn contribution points:**
- PRs to tracked libraries × 8 points
- Issues filed × 3 points
- Commits × 1 point

**Tiers:**
- **Contributor** (100+ points): Basic access
- **Sustainer** (500+ points): Additional collections
- **Core** (2000+ points): All products + early access

→ [Learn more: Contributor Tracking](./getting-involved/contributor-tracking.md)

## Getting Involved

### I maintain a React library. What do I do?

**If your library is tracked:**
1. Keep building quality features
2. Maintain good documentation
3. Respond to issues quickly
4. Metrics auto-collected from GitHub/NPM
5. Check quarterly reports

**If not tracked:**
- Nominate during annual review
- Focus on growing adoption
- Contribute to tracked libraries

### I'm an educator. How do I apply?

**Application process:**
1. Submit portfolio of React content
2. Pass initial peer review
3. Connect platform accounts (YouTube, etc.)
4. Submit metrics quarterly
5. Await tier assignment

→ [Learn more: Educator Program](./getting-involved/educator-program.md)

### I want to start a React meetup. Where do I begin?

**Getting started:**
1. Find a venue (coffee shop, coworking space, sponsor office)
2. Create Meetup.com page or Eventbrite
3. Pick a date and format (talks, hack night, study group)
4. Adopt a Code of Conduct
5. Promote in local dev communities
6. Run your first event!

→ [Full guide: Community Building Guide](./getting-involved/community-building-guide.md)

### I just want to contribute code. How?

**Contributing to React ecosystem:**
1. Pick a tracked library you use
2. Check their CONTRIBUTING.md
3. Find "good first issue" labels
4. Submit quality PRs
5. Link GitHub account to Foundation

**Benefits:**
- Contribution points for store access
- Support the maintainer (via RIS)
- Learn from code review
- Build your portfolio

## Transparency & Governance

### Where can I see the allocation data?

**Published quarterly** at:
- Foundation website (publicly accessible)
- CSV/JSON downloads
- Full methodology documentation
- Historical comparisons

### How do I report an issue?

**Metric errors:** Use appeals process (21-day window)

**CoC violations:** Report to community organizers + Foundation

**Inaccurate content:** Submit accuracy report for CIS review

**Gaming/fraud:** Email foundation@react.org (investigated by board)

### Can methodology change?

**Yes, but with transparency:**
- 30-day public comment period
- Rationale published
- Board approval required
- Effective date announced
- Applied to future quarters only (no retroactive changes)

## Related Topics

- [Foundation Overview](./foundation/foundation-overview.md)
- [RIS System Details](./foundation/ris-system.md)
- [CIS System Details](./foundation/cis-system.md)
- [CoIS System Details](./foundation/cois-system.md)
- [Educator Program](./getting-involved/educator-program.md)
- [Community Building Guide](./getting-involved/community-building-guide.md)
- [Contributor Tracking](./getting-involved/contributor-tracking.md)
- [Store Overview](./store/store-overview.md)

---

*Last updated: October 2025*
*Part of React Foundation public documentation*
