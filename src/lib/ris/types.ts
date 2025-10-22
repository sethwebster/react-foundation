/**
 * React Impact Score (RIS) - Type Definitions
 * Based on REVENUE_DISTRIBUTION_MODEL.md
 */

// ============================================================================
// Core Types
// ============================================================================

/**
 * Raw metrics collected for a library before any normalization
 */
export interface LibraryRawMetrics {
  libraryName: string;
  owner: string;
  repo: string;

  // Metadata
  collected_at: string; // ISO timestamp when data was collected

  // Ecosystem Footprint (EF) signals
  npm_downloads: number; // Last 12-month sum (bot-filtered)
  gh_dependents: number; // GitHub "Used by" count
  import_mentions: number; // Appearances in top OSS repos
  cdn_hits: number; // jsDelivr/UNPKG requests (optional)

  // Contribution Quality (CQ) signals
  pr_points: number; // Σ(impact_weight × log10(1 + LOC_changed))
  issue_resolution_rate: number; // closed_issues / opened_issues (0-1)
  median_first_response_hours: number; // Median PR/issue first response time
  unique_contribs: number; // Unique merged authors (12 mo)

  // Maintainer Health (MH) signals
  active_maintainers: number; // Committers with ≥12 meaningful reviews/releases
  release_cadence_days: number; // Median days between non-patch releases
  top_author_share: number; // Share of top author's commits (bus factor proxy)
  triage_latency_hours: number; // Median time to label/triage an issue
  maintainer_survey: number; // Self-reported risk (0-1)

  // Community Benefit (CB) signals
  docs_completeness: number; // Lint/CI doc coverage score (0-1)
  tutorials_refs: number; // Citations in reputable tutorials/courses
  helpful_events: number; // Accepted answers/helpful tags
  user_satisfaction: number; // Quarterly user survey (0-1)

  // Mission Alignment (MA) signals
  a11y_advances: number; // Accessibility improvements (0/1)
  perf_concurrency_support: number; // Performance and concurrency (0-1)
  typescript_strictness: number; // TypeScript strictness adoption (0-1)
  rsc_compat_progress: number; // React Server Components compatibility (0-1)
  security_practices: number; // OSSF scorecard normalized (0-1)
}

/**
 * Normalized metrics after winsorizing and min-max normalization
 */
export interface LibraryNormalizedMetrics {
  libraryName: string;

  // EF - normalized
  logn_npm_downloads: number;
  logn_gh_dependents: number;
  logn_import_mentions: number;
  logn_cdn_hits: number;

  // CQ - normalized
  norm_pr_points: number;
  issue_resolution_rate: number; // Already 0-1, used directly
  norm_log_first_response: number; // Inverted: 1 - norm(log10(1 + hours))
  logn_unique_contribs: number;

  // MH - normalized
  logn_active_maintainers: number;
  norm_release_cadence: number; // Inverted: 1 - norm(days)
  norm_top_author_share: number; // Inverted: 1 - norm(share)
  norm_log_triage_latency: number; // Inverted: 1 - norm(log10(1 + hours))
  maintainer_survey: number; // Already 0-1, used directly

  // CB - normalized
  docs_completeness: number; // Already 0-1, used directly
  logn_tutorials_refs: number;
  logn_helpful_events: number;
  user_satisfaction: number; // Already 0-1, used directly

  // MA - normalized
  a11y_advances: number; // Already 0-1, used directly
  perf_concurrency_support: number; // Already 0-1, used directly
  typescript_strictness: number; // Already 0-1, used directly
  rsc_compat_progress: number; // Already 0-1, used directly
  security_practices: number; // Already 0-1, used directly
}

/**
 * Component scores (EF, CQ, MH, CB, MA)
 */
export interface ComponentScores {
  EF: number; // Ecosystem Footprint
  CQ: number; // Contribution Quality
  MH: number; // Maintainer Health
  CB: number; // Community Benefit
  MA: number; // Mission Alignment
}

/**
 * Complete library score including RIS and allocation
 */
export interface LibraryScore {
  libraryName: string;
  owner: string;
  repo: string;

  // Component scores (0-1 each)
  ef: number;
  cq: number;
  mh: number;
  cb: number;
  ma: number;

  // Final RIS (0-1, normalized)
  ris: number;

  // Previous quarter's RIS for smoothing
  ris_previous?: number;

  // Allocation
  allocation_usd: number;
  floor_applied: boolean;
  cap_applied: boolean;

  // Raw metrics for transparency
  raw: LibraryRawMetrics;

  // Normalized metrics
  normalized: LibraryNormalizedMetrics;
}

/**
 * Quarterly allocation output
 */
export interface QuarterlyAllocation {
  period: string; // e.g., "2025-Q4"
  total_pool_usd: number;
  weights: ComponentWeights;
  libraries: LibraryScore[];
}

/**
 * Component weights configuration
 */
export interface ComponentWeights {
  EF: number; // Default: 0.30
  CQ: number; // Default: 0.25
  MH: number; // Default: 0.20
  CB: number; // Default: 0.15
  MA: number; // Default: 0.10
}

/**
 * Configuration for the RIS calculation
 */
export interface RISConfig {
  // Component weights
  weights: ComponentWeights;

  // Floors, caps, and guards
  minimum_floor_usd: number; // Default: 5000
  maximum_cap_percent: number; // Default: 0.12 (12%)
  reserve_percent: number; // Default: 0.10 (10%)

  // Smoothing (EMA)
  ris_smoothing_current: number; // Default: 0.7
  ris_smoothing_previous: number; // Default: 0.3

  // Winsorization percentiles
  winsorize_lower: number; // Default: 0.05 (5th percentile)
  winsorize_upper: number; // Default: 0.95 (95th percentile)
}

// ============================================================================
// Default Configuration
// ============================================================================

export const DEFAULT_RIS_CONFIG: RISConfig = {
  weights: {
    EF: 0.30,
    CQ: 0.25,
    MH: 0.20,
    CB: 0.15,
    MA: 0.10,
  },
  minimum_floor_usd: 5000,
  maximum_cap_percent: 0.12,
  reserve_percent: 0.10,
  ris_smoothing_current: 0.7,
  ris_smoothing_previous: 0.3,
  winsorize_lower: 0.05,
  winsorize_upper: 0.95,
};

// ============================================================================
// Sub-component weights (within each major component)
// ============================================================================

export const EF_WEIGHTS = {
  npm_downloads: 0.50,
  gh_dependents: 0.30,
  import_mentions: 0.15,
  cdn_hits: 0.05,
};

export const CQ_WEIGHTS = {
  pr_points: 0.60,
  issue_resolution_rate: 0.20,
  median_first_response_hours: 0.10,
  unique_contribs: 0.10,
};

export const MH_WEIGHTS = {
  active_maintainers: 0.30,
  release_cadence_days: 0.25,
  top_author_share: 0.25,
  triage_latency_hours: 0.15,
  maintainer_survey: 0.05,
};

export const CB_WEIGHTS = {
  docs_completeness: 0.40,
  tutorials_refs: 0.25,
  helpful_events: 0.20,
  user_satisfaction: 0.15,
};

export const MA_WEIGHTS = {
  a11y_advances: 0.20,
  perf_concurrency_support: 0.25,
  typescript_strictness: 0.20,
  rsc_compat_progress: 0.20,
  security_practices: 0.15,
};
