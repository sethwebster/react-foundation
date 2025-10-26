# Foundation + Store Merger Migration Plan

**Date:** October 19, 2025
**Branch:** foundation-site
**Commit before migration:** d2ab4838a6877c032f252f4e71b31f0768186a60

## Objective

Combine the React Foundation site and Store into a single Next.js application at the root level.

## Current Structure

```
react-foundation-store/
├── docs/                       # Root docs (old)
│   ├── CONTENT_TAXONOMY.md
│   ├── DESIGN_SYSTEM.md
│   ├── SHOPIFY_CMS_GUIDE.md
│   └── ...
├── storefront/                 # Full Next.js app
│   ├── docs/                   # Store docs (new)
│   │   ├── STORE_MANAGEMENT.md
│   │   ├── METAFIELDS_REFERENCE.md
│   │   └── QUICK_START.md
│   ├── src/
│   │   ├── app/               # Current app routes
│   │   │   ├── page.tsx       # Home (store home)
│   │   │   ├── products/
│   │   │   ├── collections/
│   │   │   └── ...
│   │   ├── components/
│   │   └── lib/
│   ├── scripts/
│   ├── public/
│   ├── package.json
│   ├── .env
│   └── ...
├── ECOSYSTEM_LIBRARIES.md
├── STATUS.md
└── ...
```

## Target Structure

```
react-foundation-store/
├── docs/
│   ├── foundation/            # Foundation docs
│   └── store/                 # Store docs (from storefront/docs/)
├── src/
│   ├── app/
│   │   ├── page.tsx          # Foundation homepage
│   │   ├── about/
│   │   ├── impact/
│   │   ├── contributors/
│   │   ├── store/            # 🛒 Store section
│   │   │   ├── page.tsx      # Store home
│   │   │   ├── products/
│   │   │   ├── collections/
│   │   │   └── cart/
│   │   └── api/
│   ├── components/
│   │   ├── rfds/             # Design system (shared)
│   │   ├── foundation/       # Foundation-specific
│   │   └── store/            # Store-specific
│   └── lib/
├── scripts/
├── public/
├── package.json
├── .env
└── ...
```

## Migration Steps

### Phase 1: Preparation
- [x] Check git status and current commit
- [ ] Create this migration plan
- [ ] Commit current changes to save state

### Phase 2: Move Files to Root
- [ ] Move package.json to root
- [ ] Move src/ to root
- [ ] Move scripts/ to root
- [ ] Move public/ to root
- [ ] Move config files (.env, tsconfig.json, next.config.ts, etc.)
- [ ] Move .gitignore and merge with root
- [ ] Handle node_modules (will reinstall)

### Phase 3: Reorganize App Routes
- [ ] Create src/app/store/ directory
- [ ] Move current app routes under store:
  - page.tsx → store/page.tsx
  - products/ → store/products/
  - collections/ → store/collections/
  - not-found.tsx → store/not-found.tsx (or keep at root)
- [ ] Update route imports and references

### Phase 4: Reorganize Docs
- [ ] Move storefront/docs/ → docs/store/
- [ ] Move root docs/ → docs/foundation/
- [ ] Update doc links and references

### Phase 5: Create Foundation Pages
- [ ] Create src/app/page.tsx (Foundation homepage)
- [ ] Create src/app/about/page.tsx
- [ ] Create src/app/impact/page.tsx
- [ ] Create src/app/contributors/page.tsx (or reuse existing)

### Phase 6: Update Navigation
- [ ] Update Header component for dual navigation
- [ ] Add Foundation nav links
- [ ] Add Store nav links
- [ ] Handle active states

### Phase 7: Update Imports & Paths
- [ ] Update all import paths (remove any storefront/ references)
- [ ] Update next.config.ts paths if needed
- [ ] Update tsconfig.json paths

### Phase 8: Cleanup
- [ ] Remove empty storefront/ directory
- [ ] Update README.md
- [ ] Update documentation references
- [ ] Clear .next cache
- [ ] Reinstall dependencies: `npm install`

### Phase 9: Testing
- [ ] Start dev server: `npm run dev`
- [ ] Test Foundation routes (/, /about, /impact, /contributors)
- [ ] Test Store routes (/store, /store/products, /store/collections)
- [ ] Test shared components and utilities
- [ ] Test API routes
- [ ] Test build: `npm run build`

### Phase 10: Final Verification
- [ ] Verify all scripts still work
- [ ] Verify Shopify integration
- [ ] Verify GitHub OAuth
- [ ] Check all documentation links
- [ ] Commit changes

## Risks & Mitigations

**Risk:** Import path breakage
**Mitigation:** Careful search-replace of import paths, thorough testing

**Risk:** Lost files during move
**Mitigation:** Git tracks everything, can restore from commit d2ab4838

**Risk:** Config conflicts
**Mitigation:** Manual review of each config file during merge

**Risk:** Build failures
**Mitigation:** Test incrementally, fix issues as they arise

## Rollback Plan

If migration fails:
```bash
git reset --hard d2ab4838a6877c032f252f4e71b31f0768186a60
git clean -fd
```

## Success Criteria

- [x] Both Foundation and Store routes accessible
- [ ] No broken imports or missing files
- [ ] Dev server starts without errors
- [ ] Build completes successfully
- [ ] All scripts functional
- [ ] Documentation updated and accurate

## Notes

- Keeping branch name `foundation-site` as it represents the combined app
- Will create new Foundation pages as minimal stubs initially
- Can iterate on Foundation content after migration complete
