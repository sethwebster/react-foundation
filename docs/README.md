# Developer Documentation

Internal documentation for React Foundation Store development. This directory contains technical guides, architecture docs, and setup instructions for developers working on the project.

## 📚 Documentation Sections

### [🚀 Getting Started](./getting-started/)
Essential guides for onboarding and deployment:
- **[Deployment Guide](./getting-started/deployment.md)** - Deploy to production with Vercel
- **[Troubleshooting](./getting-started/troubleshooting.md)** - Common issues and solutions *(coming soon)*
- **[Local Setup](./getting-started/local-setup.md)** - Environment setup *(coming soon)*

### [🏗️ Architecture](./architecture/)
System design and technical architecture *(coming soon)*:
- **Overview** - High-level system architecture
- **Data Flow** - How data flows through the system
- **Tech Stack Deep Dive** - Detailed technical explanations

### [🏛️ Foundation](./foundation/)
Foundation-specific developer documentation:
- **[Impact Systems](./foundation/impact-systems.md)** - RIS, CIS, and CoIS implementation
- **[Revenue Distribution](./foundation/revenue-distribution.md)** - Revenue allocation model
- **[Content Taxonomy](./foundation/content-taxonomy.md)** - Content organization system
- **[Design System](./foundation/design-system.md)** - RFDS component library
- **[Shopify CMS Guide](./foundation/shopify-cms-guide.md)** - Using Shopify as CMS
- **[Shopify Setup](./foundation/shopify-setup.md)** - Shopify integration setup
- **[Constellation Visualization](./foundation/react-constellation-visualization.md)** - 3D ecosystem visualization

### [🛒 Store](./store/)
Store-specific developer documentation:
- **[Store Management Guide](./store/store-management.md)** - Complete store system reference
- **[Metafields Reference](./store/metafields-reference.md)** - All 26 custom metafields
- **[Quick Start Guide](./store/quick-start.md)** - Daily tasks and common operations
- **[Shopify Scripts](./store/shopify-scripts.md)** - CLI tools for managing Shopify

### [🤖 Chatbot](./chatbot/)
Chatbot and content ingestion system:
- **[Architecture](./chatbot/architecture.md)** - Loader-based ingestion system
- **[Data Sources](./chatbot/data-sources.md)** - Where content comes from
- **[Blue-Green Ingestion](./chatbot/blue-green-ingestion.md)** - Zero-downtime updates
- **[Ingestion Summary](./chatbot/ingestion-summary.md)** - System overview
- **[Data Import Schema](./chatbot/data-import-schema.md)** - Data structure reference
- **[Crawler Bypass](./chatbot/crawler-bypass.md)** - Using loaders instead of crawlers
- **[Puppeteer Loader](./chatbot/puppeteer-loader.md)** - Browser-based page loading
- **[Troubleshooting](./chatbot/troubleshooting.md)** - Ingestion issues and solutions

### [👥 Community](./community/)
Community and educator systems:
- **[Educator and Community Systems](./community/educator-and-community.md)** - CIS and CoIS implementation
- **[Community Toolkit](./community/community-toolkit.md)** - Resources for community organizers
- **[Data Fixes](./community/data-fixes.md)** - Fixing stale community data

### [💻 Development](./development/)
Development guides and best practices:
- **[Theming](./development/theming.md)** - Semantic theming system
- **[RIS Setup](./development/ris-setup.md)** - React Impact Score data collection
- **[Ecosystem Libraries](./development/ecosystem-libraries.md)** - Tracked React libraries
- **[GitHub Bot Setup](./development/github-bot-setup.md)** - Bot account for reduced OAuth scopes

---

## 🔍 Looking for Something Else?

### Public Documentation
For external/public-facing documentation (used by chatbot):
- See **[public-context/](../public-context/)** directory
- These docs are ingested into the chatbot's knowledge base
- Focused on explaining the Foundation to users, not developers

### Code Documentation
For documentation that lives with the code:
- **[src/lib/ris/README.md](../src/lib/ris/README.md)** - RIS system implementation
- **[src/lib/cis/README.md](../src/lib/cis/README.md)** - CIS system implementation

### Main Project README
For project overview and quick start:
- See **[README.md](../README.md)** at project root

---

## 📝 Documentation Standards

When creating or updating documentation:

1. **Use Clear Headers** - Make it easy to scan
2. **Include Examples** - Show, don't just tell
3. **Link Liberally** - Cross-reference related docs
4. **Keep It Updated** - Update docs when code changes
5. **Markdown Format** - Use GitHub-flavored markdown
6. **Code Blocks** - Use proper syntax highlighting

### File Naming Convention
- Use lowercase with hyphens: `my-doc-name.md`
- Be descriptive: `ris-setup.md` not `setup.md`
- Avoid acronyms in filenames when possible

---

## 🗂️ Archive

Old or outdated documentation is preserved in **[../archive/](../archive/)** for historical reference.

---

*Last updated: October 26, 2025*
