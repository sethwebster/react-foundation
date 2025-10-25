# React Foundation Public Documentation

This directory contains curated documentation for the React Foundation chatbot. These documents are designed to help users understand the Foundation's mission, impact systems, and how to get involved.

## 📚 Document Index

### Foundation & Impact Systems

**Core Documentation:**
- **[foundation-overview.md](./foundation/foundation-overview.md)** - Complete overview of the React Foundation, mission, and revenue model
- **[ris-system.md](./foundation/ris-system.md)** - React Impact Score for library maintainers
- **[cis-system.md](./foundation/cis-system.md)** - Content Impact Score for educators
- **[cois-system.md](./foundation/cois-system.md)** - Community Impact Score for organizers
- **[revenue-distribution.md](./foundation/revenue-distribution.md)** *(Coming Soon)* - Detailed revenue allocation methodology

**Start Here:**
- **[FAQ](./faq.md)** - Frequently asked questions covering all systems

### Getting Involved

- **[contributor-tracking.md](./getting-involved/contributor-tracking.md)** *(Coming Soon)* - How GitHub contributions earn store access
- **[educator-program.md](./getting-involved/educator-program.md)** *(Coming Soon)* - Joining the CIS program as an educator
- **[community-building-guide.md](./getting-involved/community-building-guide.md)** *(Coming Soon)* - Starting and running React meetups/conferences

### Store & Products

- **[store-overview.md](./store/store-overview.md)** *(Coming Soon)* - How the official store works
- **[drops-explained.md](./store/drops-explained.md)** *(Coming Soon)* - Time-limited drops and collections

### Development

- **[tech-stack.md](./development/tech-stack.md)** *(Coming Soon)* - Technology overview (Next.js, Shopify, etc.)
- **[design-system-overview.md](./development/design-system-overview.md)** *(Coming Soon)* - React Foundation Design System (RFDS)

## 🎯 Purpose

These documents are ingested by the React Foundation chatbot to help answer questions about:

✅ **Foundation Mission** - What we do and why
✅ **Impact Systems** - How RIS, CIS, and CoIS work
✅ **Getting Involved** - How to contribute, teach, or organize
✅ **Store & Products** - Official merchandise and contributor access
✅ **Transparency** - Revenue allocation and governance

## 🚫 What's NOT Included

This directory contains **public-facing information only**. It does NOT include:

❌ Setup guides with API keys/credentials
❌ Internal development workflows
❌ Shopify/admin configuration details
❌ Database schemas
❌ Deployment procedures
❌ Troubleshooting for developers

For internal documentation, see:
- `docs/` - Complete technical documentation
- `CLAUDE.md` - AI development instructions
- `docs/store/` - Store management guides

## 📝 Document Format

Each document follows this structure:

```markdown
# [Title]

> **For Chatbot:** [1-2 sentence context]

## Overview
[High-level introduction]

## [Main Sections]
[Content...]

## Related Topics
- [Links to other docs]

---
*Last updated: [Date]*
*Part of React Foundation public documentation*
```

## 🔄 Keeping Current

**Update frequency:**
- Impact system docs: Quarterly (after methodology changes)
- Getting involved guides: As needed (when processes change)
- Store docs: When new drop types or policies launch
- FAQ: Ongoing (as new questions arise)

**Update process:**
1. Edit source documentation in `docs/` or `src/lib/*/README.md`
2. Sync changes to relevant `public-context/` documents
3. Test chatbot responses with updated content
4. Re-run ingestion to update vector database

## 🤖 Chatbot Integration

These files are automatically ingested by the chatbot system:

**Ingestion Process:**
1. Files in `public-context/` are discovered recursively
2. Markdown is parsed and chunked (~1000 chars per chunk)
3. Embeddings generated via OpenAI
4. Stored in Redis vector database
5. Chatbot queries semantic search for relevant chunks

**Optimization Tips:**
- Keep documents focused and concise
- Use clear section headers
- Include "For Chatbot" context at top
- Cross-link related topics
- Avoid implementation details

## 📊 Current Status

**Completed Documents:** 11 ✅
- ✅ foundation/foundation-overview.md
- ✅ foundation/ris-system.md
- ✅ foundation/cis-system.md
- ✅ foundation/cois-system.md
- ✅ faq.md
- ✅ getting-involved/contributor-tracking.md
- ✅ getting-involved/educator-program.md
- ✅ getting-involved/community-building-guide.md
- ✅ store/store-overview.md
- ✅ store/drops-explained.md
- ✅ development/tech-stack.md
- ✅ development/design-system-overview.md

**Optional (Can add later):** 1
- ⏳ foundation/revenue-distribution.md (detailed spec - can copy from docs/foundation/REVENUE_DISTRIBUTION_MODEL.md if needed)

**Estimated chunks:** ~200-250 chunks when fully ingested

## 🔗 External Resources

For users seeking more information:
- **Foundation Website**: https://react.foundation
- **GitHub Repository**: https://github.com/reactfoundation/store
- **Official React Docs**: https://react.dev
- **Contact**: foundation@react.org

---

*Last updated: October 2025*
*This directory is for public chatbot documentation only.*
