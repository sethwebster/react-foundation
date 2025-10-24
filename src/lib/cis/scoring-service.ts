/**
 * Content Impact Score (CIS) - Scoring Service
 * Calculates component scores (ER, CQC, LO, CTI, CL) and final CIS for educators
 */

import {
  type EducatorRawMetrics,
  type EducatorNormalizedMetrics,
  type EducatorScore,
  type QuarterlyCISAllocation,
  type CISConfig,
  DEFAULT_CIS_CONFIG,
  ER_WEIGHTS,
  CQC_WEIGHTS,
  LO_WEIGHTS,
  CTI_WEIGHTS,
  CL_WEIGHTS,
} from './types';
import {
  normalizeMetric,
  invertNormalized,
  emaSmoothing,
  clamp01,
} from './normalization';

/**
 * CIS Scoring Service
 * Handles all CIS calculations for a cohort of educators
 */
export class CISScoringService {
  private config: CISConfig;

  constructor(config: Partial<CISConfig> = {}) {
    this.config = { ...DEFAULT_CIS_CONFIG, ...config };
  }

  /**
   * Calculate CIS scores for all educators
   *
   * @param rawMetrics - Array of raw metrics for all educators
   * @param previousScores - Optional previous quarter scores for smoothing
   * @returns Normalized metrics and component scores for all educators
   */
  public calculateScores(
    rawMetrics: EducatorRawMetrics[],
    previousScores?: Map<string, number>
  ): EducatorScore[] {
    if (rawMetrics.length === 0) {
      return [];
    }

    // Step 1: Normalize all metrics across the cohort
    const normalizedMetrics = this.normalizeAllMetrics(rawMetrics);

    // Step 2: Calculate component scores for each educator
    const scores: EducatorScore[] = rawMetrics.map((raw, idx) => {
      const normalized = normalizedMetrics[idx];

      // Calculate each component score
      const er = this.calculateER(normalized);
      const cqc = this.calculateCQC(normalized);
      const lo = this.calculateLO(normalized);
      const cti = this.calculateCTI(normalized);
      const cl = this.calculateCL(normalized);

      // Calculate raw CIS
      const cisRaw =
        this.config.weights.ER * er +
        this.config.weights.CQC * cqc +
        this.config.weights.LO * lo +
        this.config.weights.CTI * cti +
        this.config.weights.CL * cl;

      // Apply EMA smoothing if previous score exists
      const cisPrevious = previousScores?.get(raw.educatorId);
      const cis = emaSmoothing(
        cisRaw,
        cisPrevious,
        this.config.cis_smoothing_current
      );

      return {
        educatorId: raw.educatorId,
        name: raw.name,
        platforms: raw.platforms,
        er: clamp01(er),
        cqc: clamp01(cqc),
        lo: clamp01(lo),
        cti: clamp01(cti),
        cl: clamp01(cl),
        cis: clamp01(cis),
        cis_previous: cisPrevious,
        tier: 'none', // Calculated in allocateRevenue()
        allocation_usd: 0, // Calculated in allocateRevenue()
        floor_applied: false,
        cap_applied: false,
        raw,
        normalized,
      };
    });

    return scores;
  }

  /**
   * Allocate revenue based on CIS scores and assign tiers
   *
   * @param scores - Educator scores from calculateScores()
   * @param totalPoolUsd - Total pool available for allocation
   * @returns Updated scores with allocation amounts and tiers
   */
  public allocateRevenue(
    scores: EducatorScore[],
    totalPoolUsd: number
  ): EducatorScore[] {
    if (scores.length === 0) return [];

    // Sort by CIS descending to calculate percentiles
    const sortedScores = [...scores].sort((a, b) => b.cis - a.cis);

    // Assign tiers based on percentiles
    const scoresWithTiers = sortedScores.map((score, idx) => {
      const percentile = 1 - idx / sortedScores.length; // Higher percentile = better
      let tier: EducatorScore['tier'] = 'none';

      if (percentile >= this.config.tier_thresholds.platinum) {
        tier = 'platinum';
      } else if (percentile >= this.config.tier_thresholds.gold) {
        tier = 'gold';
      } else if (percentile >= this.config.tier_thresholds.silver) {
        tier = 'silver';
      } else if (percentile >= this.config.tier_thresholds.bronze) {
        tier = 'bronze';
      }

      return { ...score, tier };
    });

    // Calculate pool after reserve
    const availablePool = totalPoolUsd * (1 - this.config.reserve_percent);

    // Tier-based distribution (Platinum 40%, Gold 35%, Silver 20%, Bronze 5%)
    const tierPools = {
      platinum: availablePool * 0.40,
      gold: availablePool * 0.35,
      silver: availablePool * 0.20,
      bronze: availablePool * 0.05,
    };

    // Count educators in each tier
    const tierCounts = scoresWithTiers.reduce(
      (counts, s) => {
        counts[s.tier] = (counts[s.tier] || 0) + 1;
        return counts;
      },
      {} as Record<string, number>
    );

    // Calculate allocation per tier (proportional to CIS within tier)
    const allocatedScores = scoresWithTiers.map((score) => {
      if (score.tier === 'none') {
        return { ...score, allocation_usd: 0 };
      }

      // Get all scores in this tier
      const tierScores = scoresWithTiers.filter((s) => s.tier === score.tier);
      const tierTotalCIS = tierScores.reduce((sum, s) => sum + s.cis, 0);

      // Calculate proportional allocation within tier
      const tierPool = tierPools[score.tier];
      const allocation =
        tierTotalCIS > 0 ? (score.cis / tierTotalCIS) * tierPool : 0;

      return {
        ...score,
        allocation_usd: allocation,
        floor_applied: false,
        cap_applied: false,
      };
    });

    // Apply floor
    const floor = this.config.minimum_floor_usd;
    let updatedScores = allocatedScores.map((s) => ({
      ...s,
      allocation_usd: s.tier !== 'none' ? Math.max(s.allocation_usd, floor) : 0,
      floor_applied: s.allocation_usd > 0 && s.allocation_usd < floor,
    }));

    // Apply cap
    const cap = totalPoolUsd * this.config.maximum_cap_percent;
    updatedScores = updatedScores.map((s) => ({
      ...s,
      allocation_usd: Math.min(s.allocation_usd, cap),
      cap_applied: s.allocation_usd > cap,
    }));

    // Re-normalize to ensure total equals available pool
    const allocatedSum = updatedScores.reduce(
      (sum, s) => sum + s.allocation_usd,
      0
    );

    if (allocatedSum > 0 && Math.abs(allocatedSum - availablePool) > 1) {
      // Apply proportional adjustment
      const adjustmentFactor = availablePool / allocatedSum;
      updatedScores = updatedScores.map((s) => ({
        ...s,
        allocation_usd: s.allocation_usd * adjustmentFactor,
      }));
    }

    return updatedScores;
  }

  /**
   * Generate complete quarterly allocation output
   */
  public generateQuarterlyAllocation(
    rawMetrics: EducatorRawMetrics[],
    totalPoolUsd: number,
    period: string,
    previousScores?: Map<string, number>
  ): QuarterlyCISAllocation {
    const scores = this.calculateScores(rawMetrics, previousScores);
    const educators = this.allocateRevenue(scores, totalPoolUsd);

    return {
      period,
      total_pool_usd: totalPoolUsd,
      weights: this.config.weights,
      educators: educators.sort((a, b) => b.cis - a.cis), // Sort by CIS descending
    };
  }

  // =========================================================================
  // Component Calculations
  // =========================================================================

  /**
   * Calculate Educational Reach (ER) score
   */
  private calculateER(normalized: EducatorNormalizedMetrics): number {
    return (
      ER_WEIGHTS.video_views * normalized.logn_video_views +
      ER_WEIGHTS.unique_learners * normalized.logn_unique_learners +
      ER_WEIGHTS.course_enrollments * normalized.logn_course_enrollments +
      ER_WEIGHTS.article_reads * normalized.logn_article_reads +
      ER_WEIGHTS.geographic_countries * normalized.logn_geographic_countries
    );
  }

  /**
   * Calculate Content Quality & Correctness (CQC) score
   */
  private calculateCQC(normalized: EducatorNormalizedMetrics): number {
    return (
      CQC_WEIGHTS.peer_review_score * normalized.peer_review_score +
      CQC_WEIGHTS.code_quality_score * normalized.code_quality_score +
      CQC_WEIGHTS.community_upvotes * normalized.logn_community_upvotes +
      CQC_WEIGHTS.react_docs_alignment * normalized.react_docs_alignment +
      CQC_WEIGHTS.accuracy_report_ratio *
        normalized.norm_accuracy_report_ratio
    );
  }

  /**
   * Calculate Learning Outcomes (LO) score
   */
  private calculateLO(normalized: EducatorNormalizedMetrics): number {
    return (
      LO_WEIGHTS.completion_rate * normalized.completion_rate +
      LO_WEIGHTS.avg_time_spent * normalized.norm_avg_time_spent +
      LO_WEIGHTS.student_feedback_score * normalized.student_feedback_score +
      LO_WEIGHTS.student_ris_contributions *
        normalized.logn_student_ris_contributions +
      LO_WEIGHTS.student_career_growth * normalized.student_career_growth
    );
  }

  /**
   * Calculate Community Teaching Impact (CTI) score
   */
  private calculateCTI(normalized: EducatorNormalizedMetrics): number {
    return (
      CTI_WEIGHTS.free_content_ratio * normalized.free_content_ratio +
      CTI_WEIGHTS.accessibility_score * normalized.accessibility_score +
      CTI_WEIGHTS.mentorship_hours * normalized.logn_mentorship_hours +
      CTI_WEIGHTS.beginner_content_ratio * normalized.beginner_content_ratio
    );
  }

  /**
   * Calculate Consistency & Longevity (CL) score
   */
  private calculateCL(normalized: EducatorNormalizedMetrics): number {
    return (
      CL_WEIGHTS.publishing_frequency *
        normalized.norm_publishing_frequency +
      CL_WEIGHTS.content_freshness_score *
        normalized.content_freshness_score +
      CL_WEIGHTS.years_teaching * normalized.logn_years_teaching +
      CL_WEIGHTS.update_velocity * normalized.norm_update_velocity
    );
  }

  // =========================================================================
  // Normalization
  // =========================================================================

  /**
   * Normalize all metrics across the cohort
   */
  private normalizeAllMetrics(
    rawMetrics: EducatorRawMetrics[]
  ): EducatorNormalizedMetrics[] {
    // Extract all values for each metric
    const metrics = {
      // ER metrics (use log normalization for skewed distributions)
      video_views: rawMetrics.map((m) => m.video_views_12mo),
      unique_learners: rawMetrics.map((m) => m.unique_learners),
      course_enrollments: rawMetrics.map((m) => m.course_enrollments),
      article_reads: rawMetrics.map((m) => m.article_reads_12mo),
      geographic_countries: rawMetrics.map((m) => m.geographic_countries),

      // CQC metrics
      peer_review_score: rawMetrics.map((m) => m.peer_review_score),
      code_quality_score: rawMetrics.map((m) => m.code_quality_score),
      community_upvotes: rawMetrics.map((m) => m.community_upvotes),
      react_docs_alignment: rawMetrics.map((m) => m.react_docs_alignment),
      accuracy_report_ratio: rawMetrics.map((m) => m.accuracy_report_ratio),

      // LO metrics
      completion_rate: rawMetrics.map((m) => m.completion_rate),
      avg_time_spent: rawMetrics.map((m) => m.avg_time_spent_minutes),
      student_feedback_score: rawMetrics.map((m) => m.student_feedback_score),
      student_ris_contributions: rawMetrics.map(
        (m) => m.student_ris_contributions
      ),
      student_career_growth: rawMetrics.map((m) => m.student_career_growth),

      // CTI metrics
      free_content_ratio: rawMetrics.map((m) => m.free_content_ratio),
      accessibility_score: rawMetrics.map((m) => m.accessibility_score),
      mentorship_hours: rawMetrics.map((m) => m.mentorship_hours),
      beginner_content_ratio: rawMetrics.map((m) => m.beginner_content_ratio),

      // CL metrics
      publishing_frequency: rawMetrics.map(
        (m) => m.publishing_frequency_days
      ),
      content_freshness_score: rawMetrics.map(
        (m) => m.content_freshness_score
      ),
      years_teaching: rawMetrics.map((m) => m.years_teaching),
      update_velocity: rawMetrics.map((m) => m.update_velocity),
    };

    // Normalize each metric
    const normalized = {
      // ER - log normalization for skewed distributions
      logn_video_views: normalizeMetric(
        metrics.video_views,
        'log',
        this.config.winsorize_lower,
        this.config.winsorize_upper
      ).normalized,
      logn_unique_learners: normalizeMetric(
        metrics.unique_learners,
        'log',
        this.config.winsorize_lower,
        this.config.winsorize_upper
      ).normalized,
      logn_course_enrollments: normalizeMetric(
        metrics.course_enrollments,
        'log',
        this.config.winsorize_lower,
        this.config.winsorize_upper
      ).normalized,
      logn_article_reads: normalizeMetric(
        metrics.article_reads,
        'log',
        this.config.winsorize_lower,
        this.config.winsorize_upper
      ).normalized,
      logn_geographic_countries: normalizeMetric(
        metrics.geographic_countries,
        'log',
        this.config.winsorize_lower,
        this.config.winsorize_upper
      ).normalized,

      // CQC metrics
      peer_review_score: metrics.peer_review_score.map((v) => clamp01(v)),
      code_quality_score: metrics.code_quality_score.map((v) => clamp01(v)),
      logn_community_upvotes: normalizeMetric(
        metrics.community_upvotes,
        'log',
        this.config.winsorize_lower,
        this.config.winsorize_upper
      ).normalized,
      react_docs_alignment: metrics.react_docs_alignment.map((v) =>
        clamp01(v)
      ),
      norm_accuracy_report_ratio: invertNormalized(
        normalizeMetric(
          metrics.accuracy_report_ratio,
          'linear',
          this.config.winsorize_lower,
          this.config.winsorize_upper
        ).normalized
      ),

      // LO metrics
      completion_rate: metrics.completion_rate.map((v) => clamp01(v)),
      norm_avg_time_spent: normalizeMetric(
        metrics.avg_time_spent,
        'linear',
        this.config.winsorize_lower,
        this.config.winsorize_upper
      ).normalized,
      student_feedback_score: metrics.student_feedback_score.map((v) =>
        clamp01(v)
      ),
      logn_student_ris_contributions: normalizeMetric(
        metrics.student_ris_contributions,
        'log',
        this.config.winsorize_lower,
        this.config.winsorize_upper
      ).normalized,
      student_career_growth: metrics.student_career_growth.map((v) =>
        clamp01(v)
      ),

      // CTI metrics
      free_content_ratio: metrics.free_content_ratio.map((v) => clamp01(v)),
      accessibility_score: metrics.accessibility_score.map((v) => clamp01(v)),
      logn_mentorship_hours: normalizeMetric(
        metrics.mentorship_hours,
        'log',
        this.config.winsorize_lower,
        this.config.winsorize_upper
      ).normalized,
      beginner_content_ratio: metrics.beginner_content_ratio.map((v) =>
        clamp01(v)
      ),

      // CL metrics
      norm_publishing_frequency: invertNormalized(
        normalizeMetric(
          metrics.publishing_frequency,
          'linear',
          this.config.winsorize_lower,
          this.config.winsorize_upper
        ).normalized
      ),
      content_freshness_score: metrics.content_freshness_score.map((v) =>
        clamp01(v)
      ),
      logn_years_teaching: normalizeMetric(
        metrics.years_teaching,
        'log',
        this.config.winsorize_lower,
        this.config.winsorize_upper
      ).normalized,
      norm_update_velocity: normalizeMetric(
        metrics.update_velocity,
        'linear',
        this.config.winsorize_lower,
        this.config.winsorize_upper
      ).normalized,
    };

    // Map normalized values back to each educator
    return rawMetrics.map((raw, idx) => ({
      educatorId: raw.educatorId,
      logn_video_views: normalized.logn_video_views[idx],
      logn_unique_learners: normalized.logn_unique_learners[idx],
      logn_course_enrollments: normalized.logn_course_enrollments[idx],
      logn_article_reads: normalized.logn_article_reads[idx],
      logn_geographic_countries: normalized.logn_geographic_countries[idx],
      peer_review_score: normalized.peer_review_score[idx],
      code_quality_score: normalized.code_quality_score[idx],
      logn_community_upvotes: normalized.logn_community_upvotes[idx],
      react_docs_alignment: normalized.react_docs_alignment[idx],
      norm_accuracy_report_ratio: normalized.norm_accuracy_report_ratio[idx],
      completion_rate: normalized.completion_rate[idx],
      norm_avg_time_spent: normalized.norm_avg_time_spent[idx],
      student_feedback_score: normalized.student_feedback_score[idx],
      logn_student_ris_contributions:
        normalized.logn_student_ris_contributions[idx],
      student_career_growth: normalized.student_career_growth[idx],
      free_content_ratio: normalized.free_content_ratio[idx],
      accessibility_score: normalized.accessibility_score[idx],
      logn_mentorship_hours: normalized.logn_mentorship_hours[idx],
      beginner_content_ratio: normalized.beginner_content_ratio[idx],
      norm_publishing_frequency: normalized.norm_publishing_frequency[idx],
      content_freshness_score: normalized.content_freshness_score[idx],
      logn_years_teaching: normalized.logn_years_teaching[idx],
      norm_update_velocity: normalized.norm_update_velocity[idx],
    }));
  }
}
