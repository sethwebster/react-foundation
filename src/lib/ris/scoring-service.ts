/**
 * React Impact Score (RIS) - Scoring Service
 * Calculates component scores (EF, CQ, MH, CB, MA) and final RIS
 */

import {
  type LibraryRawMetrics,
  type LibraryNormalizedMetrics,
  type LibraryScore,
  type QuarterlyAllocation,
  type RISConfig,
  DEFAULT_RIS_CONFIG,
  EF_WEIGHTS,
  CQ_WEIGHTS,
  MH_WEIGHTS,
  CB_WEIGHTS,
  MA_WEIGHTS,
} from './types';
import {
  normalizeMetric,
  invertNormalized,
  emaSmoothing,
  clamp01,
  getMedianForImputation,
} from './normalization';

/**
 * RIS Scoring Service
 * Handles all RIS calculations for a cohort of libraries
 */
export class RISScoringService {
  private config: RISConfig;

  constructor(config: Partial<RISConfig> = {}) {
    this.config = { ...DEFAULT_RIS_CONFIG, ...config };
  }

  /**
   * Calculate RIS scores for all libraries
   *
   * @param rawMetrics - Array of raw metrics for all libraries
   * @param previousScores - Optional previous quarter scores for smoothing
   * @returns Normalized metrics and component scores for all libraries
   */
  public calculateScores(
    rawMetrics: LibraryRawMetrics[],
    previousScores?: Map<string, number>
  ): LibraryScore[] {
    if (rawMetrics.length === 0) {
      return [];
    }

    // Step 1: Normalize all metrics across the cohort
    const normalizedMetrics = this.normalizeAllMetrics(rawMetrics);

    // Step 2: Calculate component scores for each library
    const scores: LibraryScore[] = rawMetrics.map((raw, idx) => {
      const normalized = normalizedMetrics[idx];

      // Calculate each component score
      const ef = this.calculateEF(normalized);
      const cq = this.calculateCQ(normalized);
      const mh = this.calculateMH(normalized);
      const cb = this.calculateCB(normalized);
      const ma = this.calculateMA(normalized);

      // Calculate raw RIS
      const risRaw =
        this.config.weights.EF * ef +
        this.config.weights.CQ * cq +
        this.config.weights.MH * mh +
        this.config.weights.CB * cb +
        this.config.weights.MA * ma;

      // Apply EMA smoothing if previous score exists
      const risPrevious = previousScores?.get(raw.libraryName);
      const ris = emaSmoothing(
        risRaw,
        risPrevious,
        this.config.ris_smoothing_current
      );

      return {
        libraryName: raw.libraryName,
        owner: raw.owner,
        repo: raw.repo,
        ef: clamp01(ef),
        cq: clamp01(cq),
        mh: clamp01(mh),
        cb: clamp01(cb),
        ma: clamp01(ma),
        ris: clamp01(ris),
        ris_previous: risPrevious,
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
   * Allocate revenue based on RIS scores
   *
   * @param scores - Library scores from calculateScores()
   * @param totalPoolUsd - Total pool available for allocation
   * @returns Updated scores with allocation amounts
   */
  public allocateRevenue(
    scores: LibraryScore[],
    totalPoolUsd: number
  ): LibraryScore[] {
    if (scores.length === 0) return [];

    // Calculate pool after reserve
    const availablePool = totalPoolUsd * (1 - this.config.reserve_percent);

    // Filter to only eligible libraries (above threshold)
    const eligibleScores = scores.filter(s => s.ris >= this.config.eligibility_threshold);
    const ineligibleScores = scores.filter(s => s.ris < this.config.eligibility_threshold);

    // Set ineligible libraries to $0 allocation
    const ineligibleWithZero = ineligibleScores.map(s => ({
      ...s,
      allocation_usd: 0,
      floor_applied: false,
      cap_applied: false,
    }));

    if (eligibleScores.length === 0) {
      // No libraries meet threshold - return all with $0
      return [...ineligibleWithZero];
    }

    // Calculate total RIS sum for proportional allocation (only eligible libraries)
    const totalRIS = eligibleScores.reduce((sum, s) => sum + s.ris, 0);

    if (totalRIS === 0) {
      // If no scores, distribute equally among eligible
      const equalShare = availablePool / eligibleScores.length;
      return [
        ...eligibleScores.map((s) => ({
          ...s,
          allocation_usd: equalShare,
          floor_applied: false,
          cap_applied: false,
        })),
        ...ineligibleWithZero,
      ];
    }

    // Calculate proportional allocations (only for eligible libraries)
    let updatedScores = eligibleScores.map((s) => ({
      ...s,
      allocation_usd: (s.ris / totalRIS) * availablePool,
      floor_applied: false,
      cap_applied: false,
    }));

    // Apply floor (if configured, though default is 0)
    const floor = this.config.minimum_floor_usd;
    if (floor > 0) {
      updatedScores = updatedScores.map((s) => ({
        ...s,
        allocation_usd: Math.max(s.allocation_usd, floor),
        floor_applied: s.allocation_usd < floor,
      }));
    }

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

    // Combine eligible and ineligible libraries
    return [...updatedScores, ...ineligibleWithZero];
  }

  /**
   * Generate complete quarterly allocation output
   */
  public generateQuarterlyAllocation(
    rawMetrics: LibraryRawMetrics[],
    totalPoolUsd: number,
    period: string,
    previousScores?: Map<string, number>
  ): QuarterlyAllocation {
    const scores = this.calculateScores(rawMetrics, previousScores);
    const libraries = this.allocateRevenue(scores, totalPoolUsd);

    return {
      period,
      total_pool_usd: totalPoolUsd,
      weights: this.config.weights,
      libraries: libraries.sort((a, b) => b.ris - a.ris), // Sort by RIS descending
    };
  }

  // =========================================================================
  // Component Calculations
  // =========================================================================

  /**
   * Calculate Ecosystem Footprint (EF) score
   */
  private calculateEF(normalized: LibraryNormalizedMetrics): number {
    return (
      EF_WEIGHTS.npm_downloads * normalized.logn_npm_downloads +
      EF_WEIGHTS.gh_dependents * normalized.logn_gh_dependents +
      EF_WEIGHTS.import_mentions * normalized.logn_import_mentions +
      EF_WEIGHTS.cdn_hits * normalized.logn_cdn_hits
    );
  }

  /**
   * Calculate Contribution Quality (CQ) score
   */
  private calculateCQ(normalized: LibraryNormalizedMetrics): number {
    return (
      CQ_WEIGHTS.pr_points * normalized.norm_pr_points +
      CQ_WEIGHTS.issue_resolution_rate * normalized.issue_resolution_rate +
      CQ_WEIGHTS.median_first_response_hours *
        normalized.norm_log_first_response +
      CQ_WEIGHTS.unique_contribs * normalized.logn_unique_contribs
    );
  }

  /**
   * Calculate Maintainer Health (MH) score
   */
  private calculateMH(normalized: LibraryNormalizedMetrics): number {
    return (
      MH_WEIGHTS.active_maintainers * normalized.logn_active_maintainers +
      MH_WEIGHTS.release_cadence_days * normalized.norm_release_cadence +
      MH_WEIGHTS.top_author_share * normalized.norm_top_author_share +
      MH_WEIGHTS.triage_latency_hours * normalized.norm_log_triage_latency +
      MH_WEIGHTS.maintainer_survey * normalized.maintainer_survey
    );
  }

  /**
   * Calculate Community Benefit (CB) score
   */
  private calculateCB(normalized: LibraryNormalizedMetrics): number {
    return (
      CB_WEIGHTS.docs_completeness * normalized.docs_completeness +
      CB_WEIGHTS.tutorials_refs * normalized.logn_tutorials_refs +
      CB_WEIGHTS.helpful_events * normalized.logn_helpful_events +
      CB_WEIGHTS.user_satisfaction * normalized.user_satisfaction
    );
  }

  /**
   * Calculate Mission Alignment (MA) score
   */
  private calculateMA(normalized: LibraryNormalizedMetrics): number {
    return (
      MA_WEIGHTS.a11y_advances * normalized.a11y_advances +
      MA_WEIGHTS.perf_concurrency_support *
        normalized.perf_concurrency_support +
      MA_WEIGHTS.typescript_strictness * normalized.typescript_strictness +
      MA_WEIGHTS.rsc_compat_progress * normalized.rsc_compat_progress +
      MA_WEIGHTS.security_practices * normalized.security_practices
    );
  }

  // =========================================================================
  // Normalization
  // =========================================================================

  /**
   * Normalize all metrics across the cohort
   */
  private normalizeAllMetrics(
    rawMetrics: LibraryRawMetrics[]
  ): LibraryNormalizedMetrics[] {
    // Extract all values for each metric
    const metrics = {
      // EF metrics (use log normalization)
      npm_downloads: rawMetrics.map((m) => m.npm_downloads),
      gh_dependents: rawMetrics.map((m) => m.gh_dependents),
      import_mentions: rawMetrics.map((m) => m.import_mentions),
      cdn_hits: rawMetrics.map((m) => m.cdn_hits),

      // CQ metrics
      pr_points: rawMetrics.map((m) => m.pr_points),
      issue_resolution_rate: rawMetrics.map((m) => m.issue_resolution_rate),
      median_first_response_hours: rawMetrics.map(
        (m) => m.median_first_response_hours
      ),
      unique_contribs: rawMetrics.map((m) => m.unique_contribs),

      // MH metrics
      active_maintainers: rawMetrics.map((m) => m.active_maintainers),
      release_cadence_days: rawMetrics.map((m) => m.release_cadence_days),
      top_author_share: rawMetrics.map((m) => m.top_author_share),
      triage_latency_hours: rawMetrics.map((m) => m.triage_latency_hours),
      maintainer_survey: rawMetrics.map((m) => m.maintainer_survey),

      // CB metrics
      docs_completeness: rawMetrics.map((m) => m.docs_completeness),
      tutorials_refs: rawMetrics.map((m) => m.tutorials_refs),
      helpful_events: rawMetrics.map((m) => m.helpful_events),
      user_satisfaction: rawMetrics.map((m) => m.user_satisfaction),

      // MA metrics (already 0-1, no normalization needed)
      a11y_advances: rawMetrics.map((m) => m.a11y_advances),
      perf_concurrency_support: rawMetrics.map(
        (m) => m.perf_concurrency_support
      ),
      typescript_strictness: rawMetrics.map((m) => m.typescript_strictness),
      rsc_compat_progress: rawMetrics.map((m) => m.rsc_compat_progress),
      security_practices: rawMetrics.map((m) => m.security_practices),
    };

    // Normalize each metric
    const normalized = {
      // EF - log normalization for skewed distributions
      logn_npm_downloads: normalizeMetric(
        metrics.npm_downloads,
        'log',
        this.config.winsorize_lower,
        this.config.winsorize_upper
      ).normalized,
      logn_gh_dependents: normalizeMetric(
        metrics.gh_dependents,
        'log',
        this.config.winsorize_lower,
        this.config.winsorize_upper
      ).normalized,
      logn_import_mentions: normalizeMetric(
        metrics.import_mentions,
        'log',
        this.config.winsorize_lower,
        this.config.winsorize_upper
      ).normalized,
      logn_cdn_hits: normalizeMetric(
        metrics.cdn_hits,
        'log',
        this.config.winsorize_lower,
        this.config.winsorize_upper
      ).normalized,

      // CQ metrics
      norm_pr_points: normalizeMetric(
        metrics.pr_points,
        'linear',
        this.config.winsorize_lower,
        this.config.winsorize_upper
      ).normalized,
      issue_resolution_rate: metrics.issue_resolution_rate.map((v) =>
        clamp01(v)
      ),
      norm_log_first_response: invertNormalized(
        normalizeMetric(
          metrics.median_first_response_hours,
          'log',
          this.config.winsorize_lower,
          this.config.winsorize_upper
        ).normalized
      ),
      logn_unique_contribs: normalizeMetric(
        metrics.unique_contribs,
        'log',
        this.config.winsorize_lower,
        this.config.winsorize_upper
      ).normalized,

      // MH metrics
      logn_active_maintainers: normalizeMetric(
        metrics.active_maintainers,
        'log',
        this.config.winsorize_lower,
        this.config.winsorize_upper
      ).normalized,
      norm_release_cadence: invertNormalized(
        normalizeMetric(
          metrics.release_cadence_days,
          'linear',
          this.config.winsorize_lower,
          this.config.winsorize_upper
        ).normalized
      ),
      norm_top_author_share: invertNormalized(
        normalizeMetric(
          metrics.top_author_share,
          'linear',
          this.config.winsorize_lower,
          this.config.winsorize_upper
        ).normalized
      ),
      norm_log_triage_latency: invertNormalized(
        normalizeMetric(
          metrics.triage_latency_hours,
          'log',
          this.config.winsorize_lower,
          this.config.winsorize_upper
        ).normalized
      ),
      maintainer_survey: metrics.maintainer_survey.map((v) => clamp01(v)),

      // CB metrics
      docs_completeness: metrics.docs_completeness.map((v) => clamp01(v)),
      logn_tutorials_refs: normalizeMetric(
        metrics.tutorials_refs,
        'log',
        this.config.winsorize_lower,
        this.config.winsorize_upper
      ).normalized,
      logn_helpful_events: normalizeMetric(
        metrics.helpful_events,
        'log',
        this.config.winsorize_lower,
        this.config.winsorize_upper
      ).normalized,
      user_satisfaction: metrics.user_satisfaction.map((v) => clamp01(v)),

      // MA metrics (already 0-1)
      a11y_advances: metrics.a11y_advances.map((v) => clamp01(v)),
      perf_concurrency_support: metrics.perf_concurrency_support.map((v) =>
        clamp01(v)
      ),
      typescript_strictness: metrics.typescript_strictness.map((v) =>
        clamp01(v)
      ),
      rsc_compat_progress: metrics.rsc_compat_progress.map((v) => clamp01(v)),
      security_practices: metrics.security_practices.map((v) => clamp01(v)),
    };

    // Map normalized values back to each library
    return rawMetrics.map((raw, idx) => ({
      libraryName: raw.libraryName,
      logn_npm_downloads: normalized.logn_npm_downloads[idx],
      logn_gh_dependents: normalized.logn_gh_dependents[idx],
      logn_import_mentions: normalized.logn_import_mentions[idx],
      logn_cdn_hits: normalized.logn_cdn_hits[idx],
      norm_pr_points: normalized.norm_pr_points[idx],
      issue_resolution_rate: normalized.issue_resolution_rate[idx],
      norm_log_first_response: normalized.norm_log_first_response[idx],
      logn_unique_contribs: normalized.logn_unique_contribs[idx],
      logn_active_maintainers: normalized.logn_active_maintainers[idx],
      norm_release_cadence: normalized.norm_release_cadence[idx],
      norm_top_author_share: normalized.norm_top_author_share[idx],
      norm_log_triage_latency: normalized.norm_log_triage_latency[idx],
      maintainer_survey: normalized.maintainer_survey[idx],
      docs_completeness: normalized.docs_completeness[idx],
      logn_tutorials_refs: normalized.logn_tutorials_refs[idx],
      logn_helpful_events: normalized.logn_helpful_events[idx],
      user_satisfaction: normalized.user_satisfaction[idx],
      a11y_advances: normalized.a11y_advances[idx],
      perf_concurrency_support: normalized.perf_concurrency_support[idx],
      typescript_strictness: normalized.typescript_strictness[idx],
      rsc_compat_progress: normalized.rsc_compat_progress[idx],
      security_practices: normalized.security_practices[idx],
    }));
  }
}
