# Foundation Documentation

Developer documentation for React Foundation-specific features and systems.

## Documentation

### [💎 Impact Systems](./impact-systems.md)
Complete overview of the three impact scoring systems:
- **RIS** (React Impact Score) - For library maintainers
- **CIS** (Content Impact Score) - For educators
- **CoIS** (Community Impact Score) - For community organizers

How they work, how they're calculated, and how revenue is distributed.

### [💰 Revenue Distribution Model](./revenue-distribution.md)
Detailed specification for revenue allocation:
- Quarterly allocation cycles
- RIS calculation methodology
- 5 components with weights
- Normalization and scoring formulas
- Allocation examples

### [📋 Content Taxonomy](./content-taxonomy.md)
Content organization and structure:
- Navigation hierarchy
- Content types and categories
- URL structure
- Metadata standards

### [🎨 Design System](./design-system.md)
React Foundation Design System (RFDS):
- Component architecture layers
- Primitive components
- Composed components
- Semantic theming
- Usage guidelines

### [🛒 Shopify CMS Guide](./shopify-cms-guide.md)
Using Shopify as the content management system:
- Product management
- Collection management
- Metafields system
- Content workflows

### [⚙️ Shopify Setup](./shopify-setup.md)
Setting up Shopify integration:
- Getting credentials
- Configuring API access
- Setting up webhooks
- Testing connection

### [🌌 Constellation Visualization](./react-constellation-visualization.md)
3D visualization of the React ecosystem:
- Three.js implementation
- Interactive components
- Data visualization
- Animation system

## Foundation vs Store

The React Foundation Store is actually two integrated systems:

### Foundation Site (`/`, `/about`, `/impact`)
- Mission and values
- Impact reporting
- Contributor recognition
- Educational content
- Community resources

### Store (`/store`)
- Merchandise shop
- Time-limited drops
- Contributor perks
- Revenue generation for Foundation

Both share:
- Design system (RFDS)
- Authentication (GitHub OAuth)
- Data infrastructure
- Navigation and layout

## Impact Systems Overview

### React Impact Score (RIS)
**Who:** Library maintainers (React Router, Redux, etc.)
**What:** Tracks ecosystem impact across 54 libraries
**Revenue:** 30-40% of quarterly revenue

**Components:**
1. Ecosystem Footprint (30%)
2. Contribution Quality (25%)
3. Maintainer Health (20%)
4. Community Benefit (15%)
5. Mission Alignment (10%)

### Content Impact Score (CIS)
**Who:** Educators (course creators, tutorial authors)
**What:** Tracks educational content quality and reach
**Revenue:** 25-35% of quarterly revenue

**Tracks:**
- Course enrollments
- Tutorial views
- Student outcomes
- Content quality

### Community Impact Score (CoIS)
**Who:** Community organizers (meetups, conferences)
**What:** Tracks community building impact
**Revenue:** 20-30% of quarterly revenue

**Tracks:**
- Event attendance
- Community growth
- Organizer effort
- Geographic reach

## Related Documentation

### Public Documentation
For user-facing explanations of these systems:
- **[public-context/foundation/](../../public-context/foundation/)** - User-friendly overviews

### Code Documentation
For implementation details:
- **[src/lib/ris/](../../src/lib/ris/)** - RIS system code
- **[src/lib/cis/](../../src/lib/cis/)** - CIS system code

### Development Guides
For setting up these systems:
- **[docs/development/ris-setup.md](../development/ris-setup.md)** - RIS data collection setup

---

*These docs are for developers building and maintaining the Foundation systems. For user-facing docs, see [public-context/foundation/](../../public-context/foundation/).*
