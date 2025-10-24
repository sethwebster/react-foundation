/**
 * Community Impact Score (CoIS) - Type Definitions
 * For measuring impact of React community organizers and event groups
 */

// ============================================================================
// Core Types
// ============================================================================

/**
 * Raw metrics collected for a community organization before any normalization
 */
export interface OrganizerRawMetrics {
  organizerId: string;
  name: string;
  location: string; // City, Country
  eventTypes: string[]; // ['meetup', 'conference', 'workshop', 'hackathon']

  // Metadata
  collected_at: string; // ISO timestamp when data was collected

  // Event Reach & Frequency (ERF) signals
  total_attendees_12mo: number; // Sum of all event attendees (12 months)
  unique_attendees_12mo: number; // Deduplicated attendees
  events_held_12mo: number; // Number of events held
  virtual_attendee_ratio: number; // Virtual attendees / total (0-1)
  average_event_size: number; // Average attendees per event

  // Community Health (CH) signals
  repeat_attendee_rate: number; // Attendees who came to 2+ events (0-1)
  code_of_conduct_score: number; // CoC enforcement quality (0-1)
  diversity_index: number; // Gender/ethnic diversity measure (0-1)
  first_timer_welcome_score: number; // First-time attendee experience (0-1)
  attendee_satisfaction: number; // Survey-based satisfaction (0-1)

  // Content Quality (CQ) signals
  speaker_diversity_score: number; // Speaker background diversity (0-1)
  talk_quality_rating: number; // Average talk quality from surveys (0-1)
  react_relevance_score: number; // % talks relevant to React ecosystem (0-1)
  post_event_resources: number; // Count of slides/videos/repos shared
  speaker_seniority_score: number; // Mix of junior/senior speakers (0-1)

  // Ecosystem Growth (EG) signals
  new_contributors_generated: number; // Attendees who made first OSS contribution
  job_placements: number; // Known job placements from networking
  cross_community_collaborations: number; // Collaborations with other groups
  sponsor_diversity: number; // Number of different sponsors
  attendee_ris_contributions: number; // Attendees who contribute to React (via RIS)

  // Sustainability (S) signals
  years_active: number; // Years the community has been running
  organizer_count: number; // Number of active organizers
  organizer_turnover_rate: number; // Organizer churn (0-1, lower is better)
  financial_health_score: number; // Funding stability (0-1)
  succession_plan_score: number; // Bus factor / succession planning (0-1)
}

/**
 * Normalized metrics after winsorizing and min-max normalization
 */
export interface OrganizerNormalizedMetrics {
  organizerId: string;

  // ERF - normalized
  logn_total_attendees: number;
  logn_unique_attendees: number;
  logn_events_held: number;
  virtual_attendee_ratio: number; // Already 0-1, used directly
  norm_average_event_size: number;

  // CH - normalized
  repeat_attendee_rate: number; // Already 0-1, used directly
  code_of_conduct_score: number; // Already 0-1, used directly
  diversity_index: number; // Already 0-1, used directly
  first_timer_welcome_score: number; // Already 0-1, used directly
  attendee_satisfaction: number; // Already 0-1, used directly

  // CQ - normalized
  speaker_diversity_score: number; // Already 0-1, used directly
  talk_quality_rating: number; // Already 0-1, used directly
  react_relevance_score: number; // Already 0-1, used directly
  logn_post_event_resources: number;
  speaker_seniority_score: number; // Already 0-1, used directly

  // EG - normalized
  logn_new_contributors_generated: number;
  logn_job_placements: number;
  logn_cross_community_collaborations: number;
  logn_sponsor_diversity: number;
  logn_attendee_ris_contributions: number;

  // S - normalized
  logn_years_active: number;
  logn_organizer_count: number;
  norm_organizer_turnover_rate: number; // Inverted: 1 - norm(rate)
  financial_health_score: number; // Already 0-1, used directly
  succession_plan_score: number; // Already 0-1, used directly
}

/**
 * Component scores (ERF, CH, CQ, EG, S)
 */
export interface CoISComponentScores {
  ERF: number; // Event Reach & Frequency
  CH: number; // Community Health
  CQ: number; // Content Quality
  EG: number; // Ecosystem Growth
  S: number; // Sustainability
}

/**
 * Complete organizer score including CoIS and allocation
 */
export interface OrganizerScore {
  organizerId: string;
  name: string;
  location: string;
  eventTypes: string[];

  // Component scores (0-1 each)
  erf: number;
  ch: number;
  cq: number;
  eg: number;
  s: number;

  // Final CoIS (0-1, normalized)
  cois: number;

  // Previous quarter's CoIS for smoothing
  cois_previous?: number;

  // Tier & Recognition
  tier: 'platinum' | 'gold' | 'silver' | 'bronze' | 'none';

  // Allocation
  allocation_usd: number;
  floor_applied: boolean;
  cap_applied: boolean;

  // Raw metrics for transparency
  raw: OrganizerRawMetrics;

  // Normalized metrics
  normalized: OrganizerNormalizedMetrics;
}

/**
 * Quarterly allocation output for CoIS pool
 */
export interface QuarterlyCoISAllocation {
  period: string; // e.g., "2025-Q4"
  total_pool_usd: number;
  weights: CoISComponentWeights;
  organizers: OrganizerScore[];
}

/**
 * Component weights configuration
 */
export interface CoISComponentWeights {
  ERF: number; // Event Reach & Frequency - Default: 0.25
  CH: number; // Community Health - Default: 0.25
  CQ: number; // Content Quality - Default: 0.20
  EG: number; // Ecosystem Growth - Default: 0.20
  S: number; // Sustainability - Default: 0.10
}

/**
 * Configuration for the CoIS calculation
 */
export interface CoISConfig {
  // Component weights
  weights: CoISComponentWeights;

  // Floors, caps, and guards
  minimum_floor_usd: number; // Default: 1500
  maximum_cap_percent: number; // Default: 0.15 (15%)
  reserve_percent: number; // Default: 0.10 (10%)

  // Smoothing (EMA)
  cois_smoothing_current: number; // Default: 0.7
  cois_smoothing_previous: number; // Default: 0.3

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

export const DEFAULT_COIS_CONFIG: CoISConfig = {
  weights: {
    ERF: 0.25, // Event Reach & Frequency
    CH: 0.25, // Community Health
    CQ: 0.20, // Content Quality
    EG: 0.20, // Ecosystem Growth
    S: 0.10, // Sustainability
  },
  minimum_floor_usd: 1500,
  maximum_cap_percent: 0.15,
  reserve_percent: 0.10,
  cois_smoothing_current: 0.7,
  cois_smoothing_previous: 0.3,
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

export const ERF_WEIGHTS = {
  total_attendees: 0.35,
  unique_attendees: 0.30,
  events_held: 0.20,
  virtual_attendee_ratio: 0.05,
  average_event_size: 0.10,
};

export const CH_WEIGHTS = {
  repeat_attendee_rate: 0.25,
  code_of_conduct_score: 0.20,
  diversity_index: 0.25,
  first_timer_welcome_score: 0.15,
  attendee_satisfaction: 0.15,
};

export const CQ_WEIGHTS = {
  speaker_diversity_score: 0.25,
  talk_quality_rating: 0.30,
  react_relevance_score: 0.20,
  post_event_resources: 0.15,
  speaker_seniority_score: 0.10,
};

export const EG_WEIGHTS = {
  new_contributors_generated: 0.30,
  job_placements: 0.20,
  cross_community_collaborations: 0.15,
  sponsor_diversity: 0.15,
  attendee_ris_contributions: 0.20,
};

export const S_WEIGHTS = {
  years_active: 0.25,
  organizer_count: 0.20,
  organizer_turnover_rate: 0.20,
  financial_health_score: 0.20,
  succession_plan_score: 0.15,
};
