/**
 * Content Impact Score (CIS) - Type Definitions
 * For measuring impact of React educators and content creators
 */

// ============================================================================
// Core Types
// ============================================================================

/**
 * Raw metrics collected for an educator before any normalization
 */
export interface EducatorRawMetrics {
  educatorId: string;
  name: string;
  platforms: string[]; // ['youtube', 'twitter', 'udemy', 'own-site']

  // Metadata
  collected_at: string; // ISO timestamp when data was collected

  // Educational Reach (ER) signals
  video_views_12mo: number; // Total video views across platforms (12 months)
  unique_learners: number; // Deduplicated learners across platforms
  course_enrollments: number; // Paid + free course enrollments
  article_reads_12mo: number; // Blog/article reads (12 months)
  geographic_countries: number; // Number of countries reached

  // Content Quality & Correctness (CQC) signals
  peer_review_score: number; // Average score from peer reviews (0-1)
  code_quality_score: number; // Automated checks on code examples (0-1)
  community_upvotes: number; // Net upvotes on content (upvotes - downvotes)
  react_docs_alignment: number; // Alignment with official React docs (0-1)
  accuracy_report_ratio: number; // Accuracy reports / total content (lower is better)

  // Learning Outcomes (LO) signals
  completion_rate: number; // Average course/series completion rate (0-1)
  avg_time_spent_minutes: number; // Average time learners spend with content
  student_feedback_score: number; // Average student rating (0-1, normalized from 1-5 stars)
  student_ris_contributions: number; // Students who went on to contribute (via RIS tracking)
  student_career_growth: number; // LinkedIn opt-in career advancement indicator (0-1)

  // Community Teaching Impact (CTI) signals
  free_content_ratio: number; // Free content / total content (0-1)
  accessibility_score: number; // Captions, translations, beginner-friendliness (0-1)
  mentorship_hours: number; // Office hours, Q&A participation (monthly avg)
  beginner_content_ratio: number; // Beginner-focused content / total (0-1)

  // Consistency & Longevity (CL) signals
  publishing_frequency_days: number; // Median days between content releases
  content_freshness_score: number; // % of content updated for latest React (0-1)
  years_teaching: number; // Years actively teaching React
  update_velocity: number; // Updates per piece of content per year
}

/**
 * Normalized metrics after winsorizing and min-max normalization
 */
export interface EducatorNormalizedMetrics {
  educatorId: string;

  // ER - normalized
  logn_video_views: number;
  logn_unique_learners: number;
  logn_course_enrollments: number;
  logn_article_reads: number;
  logn_geographic_countries: number;

  // CQC - normalized
  peer_review_score: number; // Already 0-1, used directly
  code_quality_score: number; // Already 0-1, used directly
  logn_community_upvotes: number;
  react_docs_alignment: number; // Already 0-1, used directly
  norm_accuracy_report_ratio: number; // Inverted: 1 - norm(ratio)

  // LO - normalized
  completion_rate: number; // Already 0-1, used directly
  norm_avg_time_spent: number;
  student_feedback_score: number; // Already 0-1, used directly
  logn_student_ris_contributions: number;
  student_career_growth: number; // Already 0-1, used directly

  // CTI - normalized
  free_content_ratio: number; // Already 0-1, used directly
  accessibility_score: number; // Already 0-1, used directly
  logn_mentorship_hours: number;
  beginner_content_ratio: number; // Already 0-1, used directly

  // CL - normalized
  norm_publishing_frequency: number; // Inverted: 1 - norm(days)
  content_freshness_score: number; // Already 0-1, used directly
  logn_years_teaching: number;
  norm_update_velocity: number;
}

/**
 * Component scores (ER, CQC, LO, CTI, CL)
 */
export interface CISComponentScores {
  ER: number; // Educational Reach
  CQC: number; // Content Quality & Correctness
  LO: number; // Learning Outcomes
  CTI: number; // Community Teaching Impact
  CL: number; // Consistency & Longevity
}

/**
 * Complete educator score including CIS and allocation
 */
export interface EducatorScore {
  educatorId: string;
  name: string;
  platforms: string[];

  // Component scores (0-1 each)
  er: number;
  cqc: number;
  lo: number;
  cti: number;
  cl: number;

  // Final CIS (0-1, normalized)
  cis: number;

  // Previous quarter's CIS for smoothing
  cis_previous?: number;

  // Tier & Recognition
  tier: 'platinum' | 'gold' | 'silver' | 'bronze' | 'none';

  // Allocation
  allocation_usd: number;
  floor_applied: boolean;
  cap_applied: boolean;

  // Raw metrics for transparency
  raw: EducatorRawMetrics;

  // Normalized metrics
  normalized: EducatorNormalizedMetrics;
}

/**
 * Quarterly allocation output for CIS pool
 */
export interface QuarterlyCISAllocation {
  period: string; // e.g., "2025-Q4"
  total_pool_usd: number;
  weights: CISComponentWeights;
  educators: EducatorScore[];
}

/**
 * Component weights configuration
 */
export interface CISComponentWeights {
  ER: number; // Educational Reach - Default: 0.25
  CQC: number; // Content Quality & Correctness - Default: 0.30
  LO: number; // Learning Outcomes - Default: 0.25
  CTI: number; // Community Teaching Impact - Default: 0.15
  CL: number; // Consistency & Longevity - Default: 0.05
}

/**
 * Configuration for the CIS calculation
 */
export interface CISConfig {
  // Component weights
  weights: CISComponentWeights;

  // Floors, caps, and guards
  minimum_floor_usd: number; // Default: 2000
  maximum_cap_percent: number; // Default: 0.15 (15%)
  reserve_percent: number; // Default: 0.10 (10%)

  // Smoothing (EMA)
  cis_smoothing_current: number; // Default: 0.7
  cis_smoothing_previous: number; // Default: 0.3

  // Winsorization percentiles
  winsorize_lower: number; // Default: 0.05 (5th percentile)
  winsorize_upper: number; // Default: 0.95 (95th percentile)

  // Tier thresholds (percentile-based)
  tier_thresholds: {
    platinum: number; // Top 5% - Default: 0.95
    gold: number; // Top 15% - Default: 0.85
    silver: number; // Top 30% - Default: 0.70
    bronze: number; // Top 50% - Default: 0.50
  };
}

// ============================================================================
// Default Configuration
// ============================================================================

export const DEFAULT_CIS_CONFIG: CISConfig = {
  weights: {
    ER: 0.25, // Educational Reach
    CQC: 0.30, // Content Quality & Correctness
    LO: 0.25, // Learning Outcomes
    CTI: 0.15, // Community Teaching Impact
    CL: 0.05, // Consistency & Longevity
  },
  minimum_floor_usd: 2000,
  maximum_cap_percent: 0.15,
  reserve_percent: 0.10,
  cis_smoothing_current: 0.7,
  cis_smoothing_previous: 0.3,
  winsorize_lower: 0.05,
  winsorize_upper: 0.95,
  tier_thresholds: {
    platinum: 0.95, // Top 5%
    gold: 0.85, // Top 15%
    silver: 0.70, // Top 30%
    bronze: 0.50, // Top 50%
  },
};

// ============================================================================
// Sub-component weights (within each major component)
// ============================================================================

export const ER_WEIGHTS = {
  video_views: 0.35,
  unique_learners: 0.30,
  course_enrollments: 0.20,
  article_reads: 0.10,
  geographic_countries: 0.05,
};

export const CQC_WEIGHTS = {
  peer_review_score: 0.35,
  code_quality_score: 0.25,
  community_upvotes: 0.20,
  react_docs_alignment: 0.15,
  accuracy_report_ratio: 0.05,
};

export const LO_WEIGHTS = {
  completion_rate: 0.25,
  avg_time_spent: 0.20,
  student_feedback_score: 0.25,
  student_ris_contributions: 0.20,
  student_career_growth: 0.10,
};

export const CTI_WEIGHTS = {
  free_content_ratio: 0.30,
  accessibility_score: 0.30,
  mentorship_hours: 0.25,
  beginner_content_ratio: 0.15,
};

export const CL_WEIGHTS = {
  publishing_frequency: 0.30,
  content_freshness_score: 0.35,
  years_teaching: 0.20,
  update_velocity: 0.15,
};
