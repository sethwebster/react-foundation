/**
 * Content Impact Score (CIS) - Custom Hooks
 * Provides hooks for using CIS calculations in React components
 */

'use client';

import { useMemo } from 'react';
import { CISScoringService } from './scoring-service';
import type {
  EducatorRawMetrics,
  EducatorScore,
  QuarterlyCISAllocation,
  CISConfig,
} from './types';

/**
 * Hook to calculate CIS scores from raw metrics
 *
 * @param rawMetrics - Array of raw educator metrics
 * @param previousScores - Optional map of previous quarter scores for smoothing
 * @param config - Optional CIS configuration overrides
 * @returns Calculated educator scores
 */
export function useCISScores(
  rawMetrics: EducatorRawMetrics[],
  previousScores?: Map<string, number>,
  config?: Partial<CISConfig>
): EducatorScore[] {
  return useMemo(() => {
    const service = new CISScoringService(config);
    return service.calculateScores(rawMetrics, previousScores);
  }, [rawMetrics, previousScores, config]);
}

/**
 * Hook to calculate CIS allocation with revenue distribution and tiers
 *
 * @param rawMetrics - Array of raw educator metrics
 * @param totalPoolUsd - Total funding pool in USD
 * @param period - Quarter period (e.g., "2025-Q1")
 * @param previousScores - Optional previous quarter scores
 * @param config - Optional CIS configuration
 * @returns Complete quarterly CIS allocation
 */
export function useCISAllocation(
  rawMetrics: EducatorRawMetrics[],
  totalPoolUsd: number,
  period: string,
  previousScores?: Map<string, number>,
  config?: Partial<CISConfig>
): QuarterlyCISAllocation {
  return useMemo(() => {
    const service = new CISScoringService(config);
    return service.generateQuarterlyAllocation(
      rawMetrics,
      totalPoolUsd,
      period,
      previousScores
    );
  }, [rawMetrics, totalPoolUsd, period, previousScores, config]);
}

/**
 * Hook to get a single educator's score from the cohort
 *
 * @param educatorId - ID of the educator to find
 * @param scores - Array of all educator scores
 * @returns Single educator score or undefined
 */
export function useEducatorScore(
  educatorId: string,
  scores: EducatorScore[]
): EducatorScore | undefined {
  return useMemo(() => {
    return scores.find((s) => s.educatorId === educatorId);
  }, [educatorId, scores]);
}

/**
 * Hook to get educator tier badge info
 *
 * @param tier - Educator's tier
 * @returns Tier badge configuration
 */
export function useEducatorTier(tier: EducatorScore['tier']): {
  label: string;
  color: string;
  icon: string;
  description: string;
} {
  return useMemo(() => {
    switch (tier) {
      case 'platinum':
        return {
          label: 'Platinum Educator',
          color: 'bg-gradient-to-r from-cyan-400 to-blue-400',
          icon: '💎',
          description: 'Top 5% - Elite React educator with exceptional impact',
        };
      case 'gold':
        return {
          label: 'Gold Educator',
          color: 'bg-gradient-to-r from-yellow-400 to-orange-400',
          icon: '🏆',
          description: 'Top 15% - Outstanding React educator',
        };
      case 'silver':
        return {
          label: 'Silver Educator',
          color: 'bg-gradient-to-r from-gray-300 to-gray-400',
          icon: '🥈',
          description: 'Top 30% - Excellent React educator',
        };
      case 'bronze':
        return {
          label: 'Bronze Educator',
          color: 'bg-gradient-to-r from-orange-300 to-orange-400',
          icon: '🥉',
          description: 'Top 50% - Valued React educator',
        };
      case 'none':
      default:
        return {
          label: 'Emerging Educator',
          color: 'bg-muted',
          icon: '📚',
          description: 'Growing impact in the React community',
        };
    }
  }, [tier]);
}

/**
 * Hook to sort and rank educators by CIS score
 *
 * @param scores - Array of educator scores
 * @param descending - Sort descending (default: true)
 * @returns Sorted scores with rankings
 */
export function useCISRankings(
  scores: EducatorScore[],
  descending: boolean = true
): Array<EducatorScore & { rank: number; percentile: number }> {
  return useMemo(() => {
    const sorted = [...scores].sort((a, b) =>
      descending ? b.cis - a.cis : a.cis - b.cis
    );

    return sorted.map((score, idx) => ({
      ...score,
      rank: idx + 1,
      percentile: 1 - idx / sorted.length, // Top = 1.0, bottom = ~0.0
    }));
  }, [scores, descending]);
}

/**
 * Hook to filter educators by tier
 *
 * @param scores - Array of educator scores
 * @param tier - Tier to filter by
 * @returns Educators in the specified tier
 */
export function useEducatorsByTier(
  scores: EducatorScore[],
  tier: EducatorScore['tier']
): EducatorScore[] {
  return useMemo(() => {
    return scores.filter((s) => s.tier === tier);
  }, [scores, tier]);
}

/**
 * Hook to calculate CIS statistics across the cohort
 *
 * @param scores - Array of educator scores
 * @returns Statistical summary
 */
export function useCISStatistics(scores: EducatorScore[]): {
  mean: number;
  median: number;
  min: number;
  max: number;
  stdDev: number;
  totalAllocation: number;
  tierCounts: Record<EducatorScore['tier'], number>;
} {
  return useMemo(() => {
    if (scores.length === 0) {
      return {
        mean: 0,
        median: 0,
        min: 0,
        max: 0,
        stdDev: 0,
        totalAllocation: 0,
        tierCounts: { platinum: 0, gold: 0, silver: 0, bronze: 0, none: 0 },
      };
    }

    const cisValues = scores.map((s) => s.cis);
    const sorted = [...cisValues].sort((a, b) => a - b);

    // Mean
    const mean = cisValues.reduce((sum, v) => sum + v, 0) / cisValues.length;

    // Median
    const mid = Math.floor(sorted.length / 2);
    const median =
      sorted.length % 2 === 0
        ? (sorted[mid - 1] + sorted[mid]) / 2
        : sorted[mid];

    // Min/Max
    const min = sorted[0];
    const max = sorted[sorted.length - 1];

    // Standard Deviation
    const variance =
      cisValues.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) /
      cisValues.length;
    const stdDev = Math.sqrt(variance);

    // Total Allocation
    const totalAllocation = scores.reduce(
      (sum, s) => sum + s.allocation_usd,
      0
    );

    // Tier Counts
    const tierCounts = scores.reduce(
      (counts, s) => {
        counts[s.tier] = (counts[s.tier] || 0) + 1;
        return counts;
      },
      { platinum: 0, gold: 0, silver: 0, bronze: 0, none: 0 } as Record<
        EducatorScore['tier'],
        number
      >
    );

    return {
      mean,
      median,
      min,
      max,
      stdDev,
      totalAllocation,
      tierCounts,
    };
  }, [scores]);
}

/**
 * Hook to compare two educators
 *
 * @param educatorId1 - First educator ID
 * @param educatorId2 - Second educator ID
 * @param scores - Array of all educator scores
 * @returns Comparison data
 */
export function useEducatorComparison(
  educatorId1: string,
  educatorId2: string,
  scores: EducatorScore[]
): {
  educator1: EducatorScore | undefined;
  educator2: EducatorScore | undefined;
  cisDiff: number;
  rankDiff: number;
} {
  return useMemo(() => {
    const educator1 = scores.find((s) => s.educatorId === educatorId1);
    const educator2 = scores.find((s) => s.educatorId === educatorId2);

    if (!educator1 || !educator2) {
      return {
        educator1,
        educator2,
        cisDiff: 0,
        rankDiff: 0,
      };
    }

    const ranked = useCISRankings(scores);
    const rank1 = ranked.find((r) => r.educatorId === educatorId1)?.rank || 0;
    const rank2 = ranked.find((r) => r.educatorId === educatorId2)?.rank || 0;

    return {
      educator1,
      educator2,
      cisDiff: educator1.cis - educator2.cis,
      rankDiff: rank1 - rank2,
    };
  }, [educatorId1, educatorId2, scores]);
}
