# Loader Architecture Deployment Guide

## Overview

This guide covers deploying and testing the new loader-based ingestion system implemented per AUTO_INGESTION_SETUP.md.

**Branch:** `fix/ingestion-pipeline`
**Status:** Ready for production testing

---

## Deployment Steps

### 1. Merge to Main

```bash
# Option A: Merge via GitHub PR
gh pr create --title "feat: Loader architecture for push-based ingestion" \
  --body "$(cat <<'EOF'
## Summary
- Implements AUTO_INGESTION_SETUP.md specification
- Replaces runtime crawling with push-based loaders
- Fixes jsdom bundling issues (switched to linkedom)
- Creates comprehensive public-context documentation

## Changes
- 🆕 Loader architecture (MDX, Communities, Libraries)
- 🆕 Chunking with overlap (950 words, 100 overlap)
- 🆕 Batch embedding generation
- 🆕 RediSearch index with vector + text search
- 🆕 Content map for navigation
- 🆕 /api/ingest/full endpoint
- 🆕 /admin/ingest-full UI
- 🐛 Fixed jsdom serverless bundling (→ linkedom)
- 🐛 Disabled website crawling in production (self-crawl deadlock)
- 📚 12 comprehensive public-context docs

## Test Plan
1. Merge to main and deploy
2. Visit /admin/ingest-full
3. Click "Start Full Ingestion"
4. Verify ~400-500 chunks ingested
5. Test chatbot knowledge
EOF
)"

# Option B: Fast-forward merge
git checkout main
git merge fix/ingestion-pipeline
git push origin main
```

### 2. Verify Deployment

**Vercel will automatically deploy** when merged to main.

**Check deployment:**
- Go to Vercel dashboard
- Wait for build to complete (~3-5 minutes)
- Verify no errors

### 3. Run Full Ingestion

**Navigate to:**
```
https://react.foundation/admin/ingest-full
```

**Click:** "🚀 Start Full Ingestion"

**Expected results:**
```
✅ Ingestion completed successfully in 45-90s

Loader Results:
- MDXLoader: 12 records (~30-45s)
- CommunitiesLoader: 65 records (~10-15s)
- LibrariesLoader: 54 records (~5-10s)

Ingestion:
- Records: 131
- Items: 131
- Chunks: 400-500
- Embeddings: 400-500

Content Map:
- Sections: 4-6
```

---

## Testing the Chatbot

### Test Queries

**Foundation & Impact Systems:**
```
User: What is the React Foundation?
Expected: Explains mission, revenue model, three impact systems

User: How does RIS work?
Expected: Explains 5 components, weights, allocation

User: Can educators get paid?
Expected: Explains CIS program, tiers, qualification

User: How do I start a React meetup?
Expected: Explains CoIS, provides community building steps
```

**Libraries:**
```
User: What libraries are tracked for RIS?
Expected: Lists categories (Core, Routing, State, etc.) with examples

User: How do I contribute to React Router?
Expected: Contribution points, GitHub link, RIS info

User: What is Zustand?
Expected: State management library, category, contribution info
```

**Communities:**
```
User: Are there React communities in London?
Expected: React Native London info

User: How do I find React communities near me?
Expected: Explains community finder, mentions map

User: What is CoIS tier for React Conf?
Expected: Community details, tier if available
```

**Store:**
```
User: What are drops?
Expected: Explains time-limited collections, themes, lifecycle

User: How do I get contributor access to the store?
Expected: Contribution points system, tiers (100/500/2000)
```

### Verification Checklist

- [ ] Chatbot responds to all test queries above
- [ ] Responses cite correct URLs (e.g., /docs/foundation/ris-system)
- [ ] Community and library data appears in responses
- [ ] Content map returns properly at /api/content-map
- [ ] No errors in Vercel function logs
- [ ] Ingestion completes without timeout

---

## Rollback Plan (If Needed)

If something goes wrong:

**Option A: Revert Merge**
```bash
git checkout main
git revert HEAD
git push origin main
```

**Option B: Use Old Ingestion**
The old `/admin/ingest` page still exists and works with file-only ingestion. It won't have communities/libraries data, but will have the 12 public-context docs.

---

## Troubleshooting

### Issue: Ingestion Times Out

**Cause:** Too many embeddings at once

**Solution:**
- Reduce batch size in `embed.ts` (currently 2048)
- Add delay between batches (currently 100ms)
- Split into multiple ingestion runs

### Issue: Redis Memory Error

**Cause:** Too many chunks stored

**Solution:**
- Check Redis memory limit in Upstash/Redis Cloud
- Upgrade Redis plan
- Reduce chunk overlap (currently 100 words)

### Issue: Embeddings Fail

**Cause:** OpenAI API key or rate limit

**Solution:**
- Check `OPENAI_API_KEY` in Vercel env vars
- Check OpenAI usage dashboard for rate limits
- Add retry logic with exponential backoff

### Issue: Communities/Libraries Not Appearing

**Cause:** Redis data not available or loader failing

**Solution:**
- Check Redis connection (`REDIS_URL`)
- Verify communities exist in Redis (`community:*` keys)
- Check Vercel function logs for loader errors
- Test loaders individually

---

## Performance Expectations

### Ingestion Duration

**MDX Loader:**
- 12 files
- ~30-45 seconds (file I/O + embedding)

**Communities Loader:**
- 65 communities
- ~15-20 seconds (Redis read + embedding)

**Libraries Loader:**
- 54 libraries
- ~10-15 seconds (in-memory + embedding)

**Total:** 60-90 seconds for full ingestion

### Chatbot Response Time

- **Query processing:** <500ms
- **Embedding query:** ~200ms (OpenAI)
- **Vector search:** <100ms (Redis)
- **LLM response:** 1-3s (OpenAI)

**Total:** 2-4 seconds typical response time

---

## Next Steps After Deployment

### Immediate (Day 1)

1. ✅ Deploy to production
2. ✅ Run full ingestion
3. ✅ Test chatbot with sample queries
4. ✅ Verify all loaders working

### Short-term (Week 1)

- Monitor chatbot usage and quality
- Collect user feedback on responses
- Fix any discovered bugs
- Add more comprehensive public-context docs if needed

### Medium-term (Month 1)

- Implement delta ingestion for efficiency
- Set up GitHub Action for auto-ingestion
- Add Vercel cron for daily updates
- Implement hybrid search in /api/search

### Long-term (Quarter 1)

- Add educator and organizer loaders (when data available)
- Multi-language support
- Coverage metrics dashboard
- A/B test response quality

---

## Success Metrics

**Ingestion Health:**
- ✅ Completes in <90 seconds
- ✅ <5% error rate
- ✅ 400-500+ chunks ingested
- ✅ All 3 loaders successful

**Chatbot Quality:**
- ✅ Responds to foundation questions accurately
- ✅ Cites correct sources (URLs)
- ✅ Includes community and library data
- ✅ <4s average response time

**System Reliability:**
- ✅ No timeouts or crashes
- ✅ Redis memory usage acceptable
- ✅ OpenAI costs reasonable (~$0.10-0.50 per ingestion)

---

## Current Status

**Code:** ✅ Complete and tested
**Build:** ✅ Passes locally
**Deployed:** ⏳ Pending merge to main
**Tested in Prod:** ⏳ Pending deployment

**Files Changed:** 19 files, ~2,300 lines added
**Commits:** 2 commits on `fix/ingestion-pipeline` branch

---

*Last Updated: October 25, 2025*
*Ready for production deployment*
