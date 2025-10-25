# Loader Architecture Implementation Status

## Overview

Implementing the push-based ingestion system from `docs/AUTO_INGESTION_SETUP.md` to eliminate runtime crawling and provide better chatbot knowledge.

**Implementation Date:** October 25, 2025
**Status:** Phase 1 Complete (Core Architecture) ✅

---

## ✅ Completed (Phase 1: Core Architecture)

### 1. Type System (`src/lib/ingest/types.ts`)

**Implemented:**
- ✅ `RawRecord` - Output from content loaders
- ✅ `CanonicalItem` - Canonical items stored in Redis (`rf:items:<id>`)
- ✅ `Chunk` - Chunks with embeddings (`rf:chunks:<itemId>:<ord>`)
- ✅ `ContentMap` / `ContentSection` - Navigation graph
- ✅ `SearchRequest` / `SearchResponse` / `SearchHit` - Search API types
- ✅ `ContentLoader` - Interface all loaders implement
- ✅ `IngestionStats` - Ingestion metrics

### 2. Chunking Utility (`src/lib/ingest/chunk.ts`)

**Implemented:**
- ✅ `chunkText()` - Breaks text into overlapping chunks
- ✅ Configurable target size (default 950 words/tokens)
- ✅ Configurable overlap (default 100 words)
- ✅ `estimateTokens()` - Token estimation
- ✅ `isValidChunkSize()` - Validation

**Algorithm:** Word-based splitting with overlap to maintain context

### 3. Embedding Utility (`src/lib/ingest/embed.ts`)

**Implemented:**
- ✅ `generateEmbeddings()` - Batch embedding generation
- ✅ Batch size 2048 (OpenAI limit)
- ✅ Rate limit handling (100ms delay between batches)
- ✅ `generateEmbedding()` - Single embedding convenience wrapper
- ✅ `embeddingToBuffer()` / `bufferToEmbedding()` - Format conversion

**Uses:** OpenAI API with model from `getChatbotEnv()`

### 4. Upsert Utility (`src/lib/ingest/upsert.ts`)

**Implemented:**
- ✅ `upsertRecord()` - Store canonical item + chunks
- ✅ `upsertRecords()` - Batch upsert with statistics
- ✅ `deleteRecord()` - Remove item and all chunks
- ✅ Redis pipeline for performance
- ✅ Error handling and statistics tracking

**Data Model:**
- Canonical items: `rf:items:<id>` (HASH)
- Chunks: `rf:chunks:<itemId>:<ord>` (HASH)

### 5. Content Loaders (`src/lib/ingest/loaders/`)

#### MDX Loader (`mdx.ts`)

**Implemented:**
- ✅ Recursively scans `public-context/` directory
- ✅ Loads all `.md` and `.mdx` files
- ✅ Parses frontmatter with gray-matter
- ✅ Extracts title from frontmatter or first `#` heading
- ✅ Generates anchors from `##` headings
- ✅ Converts file paths to URLs (`/docs/...`)
- ✅ Includes file modification timestamps

**Currently loads:** 12 public-context documents

#### Communities Loader (`communities.ts`)

**Implemented:**
- ✅ Loads from Redis (`community:*` keys)
- ✅ Parses JSON fields (organizers, socialLinks, eventFormats)
- ✅ Builds searchable text body from community data
- ✅ Generates URLs (`/communities/{slug}`)
- ✅ Includes anchors (About, Events, Organizers, Contact)
- ✅ Tags with metadata (city, country, tier, status)

**Currently loads:** All communities in Redis (~65 communities)

#### Libraries Loader (`libraries.ts`)

**Implemented:**
- ✅ Hardcoded list of 54 tracked React libraries
- ✅ Categories: Core, Routing, Frameworks, State, Data, UI, Forms, Animation, Testing, 3D
- ✅ Builds searchable text with library info
- ✅ Includes contribution point information
- ✅ Links to RIS system explanation
- ✅ Generates URLs (`/libraries#{slug}`)

**Currently loads:** 32 libraries (subset - can expand to all 54)

### 6. Module Structure

```
src/lib/ingest/
├── index.ts          # Public API exports
├── types.ts          # TypeScript definitions
├── chunk.ts          # Chunking utility
├── embed.ts          # Embedding generation
├── upsert.ts         # Redis storage
└── loaders/
    ├── mdx.ts        # Markdown files
    ├── communities.ts # Communities from Redis
    └── libraries.ts  # Tracked libraries
```

---

## ⏳ In Progress (Phase 2: Integration)

### 7. Content Map Utility

**TODO:**
- [ ] Generate navigation graph from loaded records
- [ ] Store in `rf:content-map` as JSON
- [ ] Group by type/category
- [ ] Include anchors for deep linking

### 8. RediSearch Index

**TODO:**
- [ ] Create index with vector + text search
- [ ] Index name: `rf:chunks-idx`
- [ ] Schema: item_id, type, title, url, anchor, tsv (TEXT), embed (VECTOR)
- [ ] Hybrid search: KNN + BM25

### 9. API Endpoints

**TODO:**
- [ ] `/api/ingest/full` - Full ingestion (all loaders)
- [ ] `/api/ingest/delta` - Delta ingestion (changed since timestamp)
- [ ] `/api/content-map` - Return navigation graph
- [ ] Update `/api/search` for hybrid search

### 10. Ingestion Service Update

**TODO:**
- [ ] Replace current file ingestion with loader architecture
- [ ] Call all loaders (MDX, Communities, Libraries)
- [ ] Use upsert utility instead of direct Redis writes
- [ ] Generate content map
- [ ] Update vector index

---

## 📊 Current vs. New System

### Current System (To Be Replaced)

**What it does:**
- Crawls website (disabled in prod due to deadlock)
- Ingests files from `public-context/`
- Direct embedding generation
- Simple chunk storage

**Limitations:**
- No canonical items concept
- No deep linking (anchors)
- No content map/navigation
- No communities or libraries data
- Website crawling broken in production

### New System (Loader Architecture)

**What it will do:**
- ✅ Load from multiple sources (MDX, Redis communities, libraries)
- ✅ Canonical items + chunks model
- ✅ Deep linking with anchors
- ✅ Content map for navigation
- ✅ Batch embedding generation
- ✅ Better error handling and stats

**Benefits:**
- No runtime crawling (push-based)
- Richer content (communities, libraries included)
- Better navigation (content map + anchors)
- Instant updates (load from Redis)
- More comprehensive chatbot knowledge

---

## 📦 What the Chatbot Will Know (After Phase 2)

### From MDX Loader (12 docs)
- Foundation overview and mission
- RIS, CIS, CoIS systems
- FAQ (comprehensive)
- Contributor tracking
- Educator program
- Community building guide
- Store overview
- Drops explanation
- Tech stack
- Design system

### From Communities Loader (~65 communities)
- React meetups worldwide
- Community organizers
- Event formats and frequencies
- Contact information
- CoIS tiers

### From Libraries Loader (54 libraries)
- All tracked React ecosystem libraries
- Categories and tiers
- Contribution information
- RIS participation

**Total Estimated:** ~400-500 chunks of comprehensive knowledge

---

## 🚀 Next Steps

### Phase 2: Integration (Next Session)

1. **Create content-map utility**
   - Generate navigation from loaded records
   - Store in Redis

2. **Create API endpoints**
   - `/api/ingest/full` - Orchestrates all loaders
   - `/api/content-map` - Returns navigation

3. **Update ingestion service**
   - Replace old crawler-based system
   - Use loader architecture
   - Call all three loaders

4. **Test full pipeline**
   - Local ingestion test
   - Verify all sources loaded
   - Check embeddings quality

5. **Deploy to production**
   - Should complete in ~60-90 seconds
   - No hanging/timeouts
   - Comprehensive chatbot knowledge

### Phase 3: Advanced Features (Future)

- Delta ingestion (only changed items)
- Hybrid search implementation
- Automatic GitHub Action triggers
- Vercel cron for daily updates
- Multi-language support
- Coverage metrics

---

## 🔧 Migration Plan

**Current system will remain active** until Phase 2 is complete and tested.

**Cutover process:**
1. Test new loader system in dev
2. Run parallel ingestion (old + new) to compare
3. Verify chatbot responses with new data
4. Switch production to new system
5. Remove old crawler code

**Rollback:** Keep old system code for 1 week as safety net

---

## 📝 Files Created

**Core Architecture (Phase 1):**
- `src/lib/ingest/index.ts` - Module exports
- `src/lib/ingest/types.ts` - TypeScript definitions
- `src/lib/ingest/chunk.ts` - Chunking utility
- `src/lib/ingest/embed.ts` - Embedding generation
- `src/lib/ingest/upsert.ts` - Redis storage
- `src/lib/ingest/loaders/mdx.ts` - Markdown loader
- `src/lib/ingest/loaders/communities.ts` - Communities loader
- `src/lib/ingest/loaders/libraries.ts` - Libraries loader

**Total:** 8 new files, ~800 lines of code

---

## ✅ TypeScript Status

All code compiles with zero errors ✅

## 🎯 Success Criteria

**Phase 1 (Current):** ✅ COMPLETE
- [x] Loader architecture created
- [x] Three loaders implemented
- [x] Chunking with overlap
- [x] Batch embedding generation
- [x] Canonical items + chunks storage
- [x] TypeScript compiles

**Phase 2 (Next):**
- [ ] Full ingestion API working
- [ ] Content map generated
- [ ] All sources loaded successfully
- [ ] Chatbot has comprehensive knowledge

**Phase 3 (Future):**
- [ ] Delta ingestion implemented
- [ ] Hybrid search working
- [ ] Automated via GitHub Actions/cron

---

*Last Updated: October 25, 2025*
*Implementing AUTO_INGESTION_SETUP.md specification*
