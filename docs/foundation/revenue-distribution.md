# React Impact Score (RIS) – Funding Spec

## Overview

- **Goal**: Allocate funds proportionally to a library's ecosystem impact, contribution quality, maintainer health, community benefit, and mission alignment
- **Period**: Rolling 12 months, recomputed quarterly
- **Transparency**: All raw inputs, intermediate scores, weights, and the final allocation are published

---

## Weights (Initial Defaults)

| Component | Weight |
|-----------|--------|
| **Ecosystem Footprint (EF)** | 30% |
| **Contribution Quality (CQ)** | 25% |
| **Maintainer Health (MH)** | 20% |
| **Community Benefit (CB)** | 15% |
| **Mission Alignment (MA)** | 10% |

> **Note**: You can tune these annually; any change must be published with rationale.

---

## Inputs & Normalization

### Notation

- `norm(x)` = min–max on the quarter's cohort after winsorizing at 5th/95th percentiles
- `logn(x)` = norm(log10(1 + x)) (tames extreme skew)
- When an input is missing or not applicable: use the cohort median (not zero) and flag it on the dashboard

### 1. Ecosystem Footprint (EF) – 30%

**Purpose**: Reward widely used, foundational libraries.

#### Signals

| Signal | Description | Transformation |
|--------|-------------|----------------|
| `npm_downloads` | Last 12-mo sum (bot-filtered) | `logn(npm_downloads)` |
| `gh_dependents` | GitHub "Used by" direct dependents (or Libraries.io dependents as backup) | `logn(gh_dependents)` |
| `import_mentions` | Appearances in top OSS repos (curated probe list; static for the year) | `logn(import_mentions)` |
| `cdn_hits` | jsDelivr/UNPKG requests (optional) | `logn(cdn_hits)` |

#### EF Formula

```
EF = 0.50 × logn(npm_downloads)
   + 0.30 × logn(gh_dependents)
   + 0.15 × logn(import_mentions)
   + 0.05 × logn(cdn_hits)
```

### 2. Contribution Quality (CQ) – 25%

**Purpose**: Value meaningful changes, not noise.

#### Preprocessing (Anti-Gaming)

- Ignore PRs with < 6 changed lines and no tests/docs
- Collapse "rename/format-only" diffs (git detect-renames + linguist)
- Cap per-author credit: at most the 90th percentile of PRs per repo to avoid one-person floods
- Weight PRs by impact class:
  - **High**: semantic code change or perf/a11y API change (+ tests/docs) → 1.0
  - **Medium**: bug fix or feature doc with examples → 0.6
  - **Low**: typo/docs/cosmetic only → 0.1

#### Signals

| Signal | Description | Transformation |
|--------|-------------|----------------|
| `pr_points` | Σ(impact_weight × log10(1 + LOC_changed)) for merged PRs | `norm(pr_points)` |
| `issue_resolution_rate` | closed_issues / opened_issues (bounded 0–1) | Direct |
| `median_first_response_hours` | Invert & normalize | `1 - norm(log10(1 + hours))` |
| `unique_contribs` | Unique merged authors (12 mo) | `logn(unique_contribs)` |

#### CQ Formula

```
CQ = 0.60 × norm(pr_points)
   + 0.20 × issue_resolution_rate
   + 0.10 × (1 - norm(log10(1 + median_first_response_hours)))
   + 0.10 × logn(unique_contribs)
```

### 3. Maintainer Health (MH) – 20%

**Purpose**: Sustainability, not heroics.

#### Signals

| Signal | Description | Transformation |
|--------|-------------|----------------|
| `active_maintainers` | Committers with ≥12 meaningful PR reviews or releases | `logn(active_maintainers)` |
| `release_cadence_days` | Median days between non-patch releases | `1 - norm(release_cadence_days)` |
| `bus_factor_proxy` | Share of top author's commits (lower is better) | `1 - norm(top_author_share)` |
| `triage_latency_hours` | Median time to label/triage an issue | `1 - norm(log10(1 + triage_latency_hours))` |
| `maintainer_survey` | Self-reported risk (0–1), verified by Foundation check | Direct |

#### MH Formula

```
MH = 0.30 × logn(active_maintainers)
   + 0.25 × (1 - norm(release_cadence_days))
   + 0.25 × (1 - norm(top_author_share))
   + 0.15 × (1 - norm(log10(1 + triage_latency_hours)))
   + 0.05 × maintainer_survey
```

### 4. Community Benefit (CB) – 15%

**Purpose**: Reward education, docs, and support.

#### Signals

| Signal | Description | Transformation |
|--------|-------------|----------------|
| `docs_completeness` | Lint/CI doc coverage score (0–1) | Direct |
| `tutorials_refs` | Counted citations in reputable tutorials/courses | `logn(tutorials_refs)` |
| `discussion_helpfulness` | Accepted answers/helpful tags across GH Discussions/Discord/StackOverflow | `logn(helpful_events)` |
| `user_satisfaction` | Quarterly user survey (0–1) with audited sample size | Direct |

#### CB Formula

```
CB = 0.40 × docs_completeness
   + 0.25 × logn(tutorials_refs)
   + 0.20 × logn(helpful_events)
   + 0.15 × user_satisfaction
```

### 5. Mission Alignment (MA) – 10%

**Purpose**: Nudge toward React's long-term health.

#### Signals (Binary or Scored by RFC Acceptance/Labels)

| Signal | Description | Range |
|--------|-------------|-------|
| `a11y_advances` | Accessibility improvements | 0/1 |
| `perf_concurrency_support` | Performance and concurrency support | 0–1 |
| `typescript_strictness` | TypeScript strictness adoption | 0–1 |
| `rsc_compat_progress` | React Server Components compatibility progress | 0–1 |
| `security_practices` | OSSF scorecard normalized | 0–1 |

#### MA Formula

```
MA = 0.20 × a11y_advances
   + 0.25 × perf_concurrency_support
   + 0.20 × typescript_strictness
   + 0.20 × rsc_compat_progress
   + 0.15 × security_practices
```


---

## React Impact Score and Allocation

### Final Score Calculation

```
RIS = 0.30 × EF + 0.25 × CQ + 0.20 × MH + 0.15 × CB + 0.10 × MA
```

*RIS is normalized to [0,1] range*

### Allocation Formula

```
Allocation(library_i) = (RIS_i / Σ RIS_all) × TotalPool × SponsorshipAdjustment
```

Where `SponsorshipAdjustment` is the eligibility-based funding weight (0.0-1.0) based on existing corporate support. See **[Eligibility Policy](./ELIGIBILITY_POLICY.md)** for details.

**Key Principles:**
- **RIS scores remain pure** - Impact measurement is not affected by funding eligibility
- **Funding adjustments are transparent** - Sponsorship adjustments are applied separately and documented
- **Community-maintained projects receive full funding** - Libraries with no corporate support get 1.0x adjustment
- **Corporate-backed projects may be ineligible** - Projects with substantial dedicated resources get 0.0x adjustment

### Floors, Caps, and Guards

| Rule | Description |
|------|-------------|
| **Eligibility Threshold** | Libraries must have a RIS score ≥ 0.15 (15%) to qualify for funding - ensures meaningful impact |
| **No Guaranteed Minimum** | No floor payment - funds are distributed proportionally based on RIS score above threshold |
| **Cap** | No library may exceed 12% of the annual pool unless approved by the board after public comment |
| **Reserve** | Hold 10% of the pool for Appeals & Extraordinary Grants (e.g., critical zero-day work) |
| **Stability** | Apply EMA smoothing: `FinalRIS = 0.7 × RIS_this_quarter + 0.3 × RIS_last_quarter` |

---

## Anti-Gaming & Audit Rules

- **Low-value PR filter** and per-author caps (described above)
- **Coordination filters**: sudden spike in tiny PRs from new accounts triggers a review queue
- **Label honesty**: sampling audits compare PR labels vs. content; mislabeling leads to quarter penalties (-10% RIS)
- **Public Reports**: per-library CSV/JSON of raw metrics + scoring; anyone can reproduce

---

## Funding Eligibility Policy

Not all libraries are eligible for direct RIS-based grants. The Foundation focuses resources on projects that depend on community support to remain viable.

### Eligibility Categories

| Category | Funding Eligibility | Adjustment |
|----------|---------------------|------------|
| **Community-maintained** | ✅ Fully eligible | 1.0x (100% funding) |
| **Partially-sponsored** | 🟡 Eligible with adjustment | 0.4x-0.9x based on support level |
| **Corporate-maintained** | ❌ Ineligible for direct grants | 0.0x (may participate in Strategic Collaboration Program) |

### Sponsorship Adjustment Factors

| Sponsorship Level | Adjustment | Description |
|-------------------|------------|-------------|
| **None** | 1.0x (100%) | No corporate support - full funding |
| **Minimal** | 0.9x (90%) | <$50k/year or volunteer-only |
| **Moderate** | 0.7x (70%) | $50k-$200k/year or part-time support |
| **Substantial** | 0.4x (40%) | $200k-$500k/year or 1-2 dedicated FTE |
| **Exclusive** | 0.0x (0%) | $500k+/year or 3+ FTE - ineligible |

### Rationale

Corporate-backed frameworks already benefit from:
- Dedicated full-time engineering teams
- Marketing budgets and promotional resources
- Internal funding ensuring long-term sustainability
- Enterprise support contracts and consulting revenue

By focusing RIS funding on independent and under-resourced projects, the Foundation:
- Strengthens the open source commons around React
- Supports independent innovation
- Ensures funding decisions reflect genuine need

**Full Policy**: See **[ELIGIBILITY_POLICY.md](./ELIGIBILITY_POLICY.md)** for complete details, examples, FAQ, and review process.

---

## Data Sources (Implementable Today)

- **NPM registry downloads** (filtered by package + time window)
- **GitHub GraphQL v4**: PRs, issues, reviews, labels, releases, discussions, response times
- **GitHub REST or Libraries.io**: dependents counts (GitHub API doesn't expose transitive dependents; use libraries.io or scrape the "Used by" with care)
- **jsDelivr/UNPKG** (optional): request stats
- **OpenSSF Scorecard**: security posture
- **Surveys**: lightweight quarterly forms for maintainers and users (publish response counts and margin of error)

---

## Output Schema (Publish Each Quarter)

{
  "period": "2025-Q4",
  "total_pool_usd": 1000000,
  "weights": { "EF": 0.30, "CQ": 0.25, "MH": 0.20, "CB": 0.15, "MA": 0.10 },
  "libraries": [
    {
      "name": "react-router",
      "ef": 0.78,
      "cq": 0.61,
      "mh": 0.70,
      "cb": 0.58,
      "ma": 0.65,
      "ris": 0.672,
      "allocation_usd": 84213,
      "floor_applied": false,
      "cap_applied": false,
      "raw": {
        "npm_downloads": 132000000,
        "gh_dependents": 78000,
        "import_mentions": 215,
        "pr_points": 4382,
        "issue_resolution_rate": 0.76,
        "median_first_response_hours": 9,
        "unique_contribs": 124,
        "active_maintainers": 6,
        "release_cadence_days": 38,
        "top_author_share": 0.33,
        "triage_latency_hours": 6,
        "docs_completeness": 0.86,
        "tutorials_refs": 1240,
        "helpful_events": 3100,
        "user_satisfaction": 0.82,
        "ossf_scorecard": 0.82
      }
    }
  ]
}


---

## Reference Algorithm (Pseudocode)

function allocate(libs, totalPool, prevRIS = {}) {
  // 1) winsorize each raw metric across libs at 5/95 pct
  winsorized = winsorizeAll(libs);

  // 2) normalize with min-max or log->min-max as defined above
  metrics = normalizeAll(winsorized);

  // 3) compute EF, CQ, MH, CB, MA per formulas
  for (lib of libs) {
    lib.EF = 0.50*metrics.log_npm_downloads[lib] +
             0.30*metrics.log_dependents[lib] +
             0.15*metrics.log_import_mentions[lib] +
             0.05*metrics.log_cdn_hits[lib];

    lib.CQ = 0.60*metrics.norm_pr_points[lib] +
             0.20*metrics.issue_resolution_rate[lib] +
             0.10*(1 - metrics.log_first_response[lib]) +
             0.10*metrics.log_unique_contribs[lib];

    lib.MH = 0.30*metrics.log_active_maintainers[lib] +
             0.25*(1 - metrics.release_cadence_days[lib]) +
             0.25*(1 - metrics.top_author_share[lib]) +
             0.15*(1 - metrics.log_triage_latency[lib]) +
             0.05*metrics.maintainer_survey[lib];

    lib.CB = 0.40*metrics.docs_completeness[lib] +
             0.25*metrics.log_tutorials_refs[lib] +
             0.20*metrics.log_helpful_events[lib] +
             0.15*metrics.user_satisfaction[lib];

    lib.MA = 0.20*metrics.a11y_advances[lib] +
             0.25*metrics.perf_concurrency_support[lib] +
             0.20*metrics.ts_strictness[lib] +
             0.20*metrics.rsc_compat[lib] +
             0.15*metrics.security[lib];

    const RIS_now = 0.30*lib.EF + 0.25*lib.CQ + 0.20*lib.MH + 0.15*lib.CB + 0.10*lib.MA;
    lib.RIS = prevRIS[lib.name] ? 0.7*RIS_now + 0.3*prevRIS[lib.name] : RIS_now;
  }

  // 4) filter to eligible libraries (RIS >= 0.15)
  const eligible = libs.filter(l => l.RIS >= 0.15);
  const sumRIS = sum(eligible.map(l => l.RIS));

  // 5) proportional allocation (only eligible libraries)
  for (lib of eligible) {
    lib.allocation = (lib.RIS / sumRIS) * (totalPool * 0.90); // 10% reserve
  }

  // Ineligible libraries get $0
  for (lib of libs) {
    if (lib.RIS < 0.15) lib.allocation = 0;
  }

  // 6) enforce cap
  enforceCap(eligible, 0.12 * totalPool);

  return libs;
}


---

## Governance & Appeals

- **Quarterly publication** + CSV/JSON dumps
- **Manual adjustment lane** only for: security emergencies, critical infrastructure, or clear metric error; bounded to ±15% of computed allocation and must be publicly justified
- **Appeals window**: 21 days after publication; decisions logged

---

## What You Get From This Spec

- ✅ **Rewards true impact** and healthy maintenance
- ✅ **Penalizes gaming** without punishing small-but-mighty teams
- ✅ **Is reproducible** by anyone with the data
- ✅ **Leaves room for judgment** in rare cases—but bounded and transparent

---

> **Next Steps**: If you want, I can follow up with a companion spec for meetups using the same rigor (impact, quality, inclusion, alignment), plus a small-grants/seed track for new cities.