/**
 * Community Impact Score (CoIS) - Scoring Service
 * Calculates component scores (ERF, CH, CQ, EG, S) and final CoIS for community organizers
 */

import {
  type OrganizerRawMetrics,
  type OrganizerNormalizedMetrics,
  type OrganizerScore,
  type QuarterlyCoISAllocation,
  type CoISConfig,
  DEFAULT_COIS_CONFIG,
  ERF_WEIGHTS,
  CH_WEIGHTS,
  CQ_WEIGHTS,
  EG_WEIGHTS,
  S_WEIGHTS,
} from './types';
import {
  normalizeMetric,
  invertNormalized,
  emaSmoothing,
  clamp01,
} from './normalization';

/**
 * CoIS Scoring Service
 * Handles all CoIS calculations for a cohort of community organizers
 */
export class CoISScoringService {
  private config: CoISConfig;

  constructor(config: Partial<CoISConfig> = {}) {
    this.config = { ...DEFAULT_COIS_CONFIG, ...config };
  }

  /**
   * Calculate CoIS scores for all organizers
   */
  public calculateScores(
    rawMetrics: OrganizerRawMetrics[],
    previousScores?: Map<string, number>
  ): OrganizerScore[] {
    if (rawMetrics.length === 0) {
      return [];
    }

    const normalizedMetrics = this.normalizeAllMetrics(rawMetrics);

    const scores: OrganizerScore[] = rawMetrics.map((raw, idx) => {
      const normalized = normalizedMetrics[idx];

      const erf = this.calculateERF(normalized);
      const ch = this.calculateCH(normalized);
      const cq = this.calculateCQ(normalized);
      const eg = this.calculateEG(normalized);
      const s = this.calculateS(normalized);

      const coisRaw =
        this.config.weights.ERF * erf +
        this.config.weights.CH * ch +
        this.config.weights.CQ * cq +
        this.config.weights.EG * eg +
        this.config.weights.S * s;

      const coisPrevious = previousScores?.get(raw.organizerId);
      const cois = emaSmoothing(
        coisRaw,
        coisPrevious,
        this.config.cois_smoothing_current
      );

      return {
        organizerId: raw.organizerId,
        name: raw.name,
        location: raw.location,
        eventTypes: raw.eventTypes,
        erf: clamp01(erf),
        ch: clamp01(ch),
        cq: clamp01(cq),
        eg: clamp01(eg),
        s: clamp01(s),
        cois: clamp01(cois),
        cois_previous: coisPrevious,
        tier: 'none',
        allocation_usd: 0,
        floor_applied: false,
        cap_applied: false,
        raw,
        normalized,
      };
    });

    return scores;
  }

  /**
   * Allocate revenue based on CoIS scores and assign tiers
   */
  public allocateRevenue(
    scores: OrganizerScore[],
    totalPoolUsd: number
  ): OrganizerScore[] {
    if (scores.length === 0) return [];

    const sortedScores = [...scores].sort((a, b) => b.cois - a.cois);

    const scoresWithTiers = sortedScores.map((score, idx) => {
      const percentile = 1 - idx / sortedScores.length;
      let tier: OrganizerScore['tier'] = 'none';

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

    const availablePool = totalPoolUsd * (1 - this.config.reserve_percent);

    const tierPools = {
      platinum: availablePool * 0.40,
      gold: availablePool * 0.35,
      silver: availablePool * 0.20,
      bronze: availablePool * 0.05,
    };

    const allocatedScores = scoresWithTiers.map((score) => {
      if (score.tier === 'none') {
        return { ...score, allocation_usd: 0 };
      }

      const tierScores = scoresWithTiers.filter((s) => s.tier === score.tier);
      const tierTotalCoIS = tierScores.reduce((sum, s) => sum + s.cois, 0);

      const tierPool = tierPools[score.tier];
      const allocation =
        tierTotalCoIS > 0 ? (score.cois / tierTotalCoIS) * tierPool : 0;

      return {
        ...score,
        allocation_usd: allocation,
        floor_applied: false,
        cap_applied: false,
      };
    });

    const floor = this.config.minimum_floor_usd;
    let updatedScores = allocatedScores.map((s) => ({
      ...s,
      allocation_usd: s.tier !== 'none' ? Math.max(s.allocation_usd, floor) : 0,
      floor_applied: s.allocation_usd > 0 && s.allocation_usd < floor,
    }));

    const cap = totalPoolUsd * this.config.maximum_cap_percent;
    updatedScores = updatedScores.map((s) => ({
      ...s,
      allocation_usd: Math.min(s.allocation_usd, cap),
      cap_applied: s.allocation_usd > cap,
    }));

    const allocatedSum = updatedScores.reduce(
      (sum, s) => sum + s.allocation_usd,
      0
    );

    if (allocatedSum > 0 && Math.abs(allocatedSum - availablePool) > 1) {
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
    rawMetrics: OrganizerRawMetrics[],
    totalPoolUsd: number,
    period: string,
    previousScores?: Map<string, number>
  ): QuarterlyCoISAllocation {
    const scores = this.calculateScores(rawMetrics, previousScores);
    const organizers = this.allocateRevenue(scores, totalPoolUsd);

    return {
      period,
      total_pool_usd: totalPoolUsd,
      weights: this.config.weights,
      organizers: organizers.sort((a, b) => b.cois - a.cois),
    };
  }

  // Component Calculations
  private calculateERF(normalized: OrganizerNormalizedMetrics): number {
    return (
      ERF_WEIGHTS.total_attendees * normalized.logn_total_attendees +
      ERF_WEIGHTS.unique_attendees * normalized.logn_unique_attendees +
      ERF_WEIGHTS.events_held * normalized.logn_events_held +
      ERF_WEIGHTS.virtual_attendee_ratio *
        normalized.virtual_attendee_ratio +
      ERF_WEIGHTS.average_event_size * normalized.norm_average_event_size
    );
  }

  private calculateCH(normalized: OrganizerNormalizedMetrics): number {
    return (
      CH_WEIGHTS.repeat_attendee_rate * normalized.repeat_attendee_rate +
      CH_WEIGHTS.code_of_conduct_score * normalized.code_of_conduct_score +
      CH_WEIGHTS.diversity_index * normalized.diversity_index +
      CH_WEIGHTS.first_timer_welcome_score *
        normalized.first_timer_welcome_score +
      CH_WEIGHTS.attendee_satisfaction * normalized.attendee_satisfaction
    );
  }

  private calculateCQ(normalized: OrganizerNormalizedMetrics): number {
    return (
      CQ_WEIGHTS.speaker_diversity_score *
        normalized.speaker_diversity_score +
      CQ_WEIGHTS.talk_quality_rating * normalized.talk_quality_rating +
      CQ_WEIGHTS.react_relevance_score * normalized.react_relevance_score +
      CQ_WEIGHTS.post_event_resources * normalized.logn_post_event_resources +
      CQ_WEIGHTS.speaker_seniority_score * normalized.speaker_seniority_score
    );
  }

  private calculateEG(normalized: OrganizerNormalizedMetrics): number {
    return (
      EG_WEIGHTS.new_contributors_generated *
        normalized.logn_new_contributors_generated +
      EG_WEIGHTS.job_placements * normalized.logn_job_placements +
      EG_WEIGHTS.cross_community_collaborations *
        normalized.logn_cross_community_collaborations +
      EG_WEIGHTS.sponsor_diversity * normalized.logn_sponsor_diversity +
      EG_WEIGHTS.attendee_ris_contributions *
        normalized.logn_attendee_ris_contributions
    );
  }

  private calculateS(normalized: OrganizerNormalizedMetrics): number {
    return (
      S_WEIGHTS.years_active * normalized.logn_years_active +
      S_WEIGHTS.organizer_count * normalized.logn_organizer_count +
      S_WEIGHTS.organizer_turnover_rate *
        normalized.norm_organizer_turnover_rate +
      S_WEIGHTS.financial_health_score * normalized.financial_health_score +
      S_WEIGHTS.succession_plan_score * normalized.succession_plan_score
    );
  }

  // Normalization
  private normalizeAllMetrics(
    rawMetrics: OrganizerRawMetrics[]
  ): OrganizerNormalizedMetrics[] {
    const metrics = {
      total_attendees: rawMetrics.map((m) => m.total_attendees_12mo),
      unique_attendees: rawMetrics.map((m) => m.unique_attendees_12mo),
      events_held: rawMetrics.map((m) => m.events_held_12mo),
      virtual_attendee_ratio: rawMetrics.map((m) => m.virtual_attendee_ratio),
      average_event_size: rawMetrics.map((m) => m.average_event_size),
      repeat_attendee_rate: rawMetrics.map((m) => m.repeat_attendee_rate),
      code_of_conduct_score: rawMetrics.map((m) => m.code_of_conduct_score),
      diversity_index: rawMetrics.map((m) => m.diversity_index),
      first_timer_welcome_score: rawMetrics.map(
        (m) => m.first_timer_welcome_score
      ),
      attendee_satisfaction: rawMetrics.map((m) => m.attendee_satisfaction),
      speaker_diversity_score: rawMetrics.map(
        (m) => m.speaker_diversity_score
      ),
      talk_quality_rating: rawMetrics.map((m) => m.talk_quality_rating),
      react_relevance_score: rawMetrics.map((m) => m.react_relevance_score),
      post_event_resources: rawMetrics.map((m) => m.post_event_resources),
      speaker_seniority_score: rawMetrics.map(
        (m) => m.speaker_seniority_score
      ),
      new_contributors_generated: rawMetrics.map(
        (m) => m.new_contributors_generated
      ),
      job_placements: rawMetrics.map((m) => m.job_placements),
      cross_community_collaborations: rawMetrics.map(
        (m) => m.cross_community_collaborations
      ),
      sponsor_diversity: rawMetrics.map((m) => m.sponsor_diversity),
      attendee_ris_contributions: rawMetrics.map(
        (m) => m.attendee_ris_contributions
      ),
      years_active: rawMetrics.map((m) => m.years_active),
      organizer_count: rawMetrics.map((m) => m.organizer_count),
      organizer_turnover_rate: rawMetrics.map(
        (m) => m.organizer_turnover_rate
      ),
      financial_health_score: rawMetrics.map((m) => m.financial_health_score),
      succession_plan_score: rawMetrics.map((m) => m.succession_plan_score),
    };

    const normalized = {
      logn_total_attendees: normalizeMetric(
        metrics.total_attendees,
        'log',
        this.config.winsorize_lower,
        this.config.winsorize_upper
      ).normalized,
      logn_unique_attendees: normalizeMetric(
        metrics.unique_attendees,
        'log',
        this.config.winsorize_lower,
        this.config.winsorize_upper
      ).normalized,
      logn_events_held: normalizeMetric(
        metrics.events_held,
        'log',
        this.config.winsorize_lower,
        this.config.winsorize_upper
      ).normalized,
      virtual_attendee_ratio: metrics.virtual_attendee_ratio.map((v) =>
        clamp01(v)
      ),
      norm_average_event_size: normalizeMetric(
        metrics.average_event_size,
        'linear',
        this.config.winsorize_lower,
        this.config.winsorize_upper
      ).normalized,
      repeat_attendee_rate: metrics.repeat_attendee_rate.map((v) =>
        clamp01(v)
      ),
      code_of_conduct_score: metrics.code_of_conduct_score.map((v) =>
        clamp01(v)
      ),
      diversity_index: metrics.diversity_index.map((v) => clamp01(v)),
      first_timer_welcome_score: metrics.first_timer_welcome_score.map((v) =>
        clamp01(v)
      ),
      attendee_satisfaction: metrics.attendee_satisfaction.map((v) =>
        clamp01(v)
      ),
      speaker_diversity_score: metrics.speaker_diversity_score.map((v) =>
        clamp01(v)
      ),
      talk_quality_rating: metrics.talk_quality_rating.map((v) => clamp01(v)),
      react_relevance_score: metrics.react_relevance_score.map((v) =>
        clamp01(v)
      ),
      logn_post_event_resources: normalizeMetric(
        metrics.post_event_resources,
        'log',
        this.config.winsorize_lower,
        this.config.winsorize_upper
      ).normalized,
      speaker_seniority_score: metrics.speaker_seniority_score.map((v) =>
        clamp01(v)
      ),
      logn_new_contributors_generated: normalizeMetric(
        metrics.new_contributors_generated,
        'log',
        this.config.winsorize_lower,
        this.config.winsorize_upper
      ).normalized,
      logn_job_placements: normalizeMetric(
        metrics.job_placements,
        'log',
        this.config.winsorize_lower,
        this.config.winsorize_upper
      ).normalized,
      logn_cross_community_collaborations: normalizeMetric(
        metrics.cross_community_collaborations,
        'log',
        this.config.winsorize_lower,
        this.config.winsorize_upper
      ).normalized,
      logn_sponsor_diversity: normalizeMetric(
        metrics.sponsor_diversity,
        'log',
        this.config.winsorize_lower,
        this.config.winsorize_upper
      ).normalized,
      logn_attendee_ris_contributions: normalizeMetric(
        metrics.attendee_ris_contributions,
        'log',
        this.config.winsorize_lower,
        this.config.winsorize_upper
      ).normalized,
      logn_years_active: normalizeMetric(
        metrics.years_active,
        'log',
        this.config.winsorize_lower,
        this.config.winsorize_upper
      ).normalized,
      logn_organizer_count: normalizeMetric(
        metrics.organizer_count,
        'log',
        this.config.winsorize_lower,
        this.config.winsorize_upper
      ).normalized,
      norm_organizer_turnover_rate: invertNormalized(
        normalizeMetric(
          metrics.organizer_turnover_rate,
          'linear',
          this.config.winsorize_lower,
          this.config.winsorize_upper
        ).normalized
      ),
      financial_health_score: metrics.financial_health_score.map((v) =>
        clamp01(v)
      ),
      succession_plan_score: metrics.succession_plan_score.map((v) =>
        clamp01(v)
      ),
    };

    return rawMetrics.map((raw, idx) => ({
      organizerId: raw.organizerId,
      logn_total_attendees: normalized.logn_total_attendees[idx],
      logn_unique_attendees: normalized.logn_unique_attendees[idx],
      logn_events_held: normalized.logn_events_held[idx],
      virtual_attendee_ratio: normalized.virtual_attendee_ratio[idx],
      norm_average_event_size: normalized.norm_average_event_size[idx],
      repeat_attendee_rate: normalized.repeat_attendee_rate[idx],
      code_of_conduct_score: normalized.code_of_conduct_score[idx],
      diversity_index: normalized.diversity_index[idx],
      first_timer_welcome_score: normalized.first_timer_welcome_score[idx],
      attendee_satisfaction: normalized.attendee_satisfaction[idx],
      speaker_diversity_score: normalized.speaker_diversity_score[idx],
      talk_quality_rating: normalized.talk_quality_rating[idx],
      react_relevance_score: normalized.react_relevance_score[idx],
      logn_post_event_resources: normalized.logn_post_event_resources[idx],
      speaker_seniority_score: normalized.speaker_seniority_score[idx],
      logn_new_contributors_generated:
        normalized.logn_new_contributors_generated[idx],
      logn_job_placements: normalized.logn_job_placements[idx],
      logn_cross_community_collaborations:
        normalized.logn_cross_community_collaborations[idx],
      logn_sponsor_diversity: normalized.logn_sponsor_diversity[idx],
      logn_attendee_ris_contributions:
        normalized.logn_attendee_ris_contributions[idx],
      logn_years_active: normalized.logn_years_active[idx],
      logn_organizer_count: normalized.logn_organizer_count[idx],
      norm_organizer_turnover_rate: normalized.norm_organizer_turnover_rate[idx],
      financial_health_score: normalized.financial_health_score[idx],
      succession_plan_score: normalized.succession_plan_score[idx],
    }));
  }
}
