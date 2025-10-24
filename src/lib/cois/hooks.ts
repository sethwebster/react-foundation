/**
 * Community Impact Score (CoIS) - Custom Hooks
 */

'use client';

import { useMemo } from 'react';
import { CoISScoringService } from './scoring-service';
import type {
  OrganizerRawMetrics,
  OrganizerScore,
  QuarterlyCoISAllocation,
  CoISConfig,
} from './types';

export function useCoISScores(
  rawMetrics: OrganizerRawMetrics[],
  previousScores?: Map<string, number>,
  config?: Partial<CoISConfig>
): OrganizerScore[] {
  return useMemo(() => {
    const service = new CoISScoringService(config);
    return service.calculateScores(rawMetrics, previousScores);
  }, [rawMetrics, previousScores, config]);
}

export function useCoISAllocation(
  rawMetrics: OrganizerRawMetrics[],
  totalPoolUsd: number,
  period: string,
  previousScores?: Map<string, number>,
  config?: Partial<CoISConfig>
): QuarterlyCoISAllocation {
  return useMemo(() => {
    const service = new CoISScoringService(config);
    return service.generateQuarterlyAllocation(
      rawMetrics,
      totalPoolUsd,
      period,
      previousScores
    );
  }, [rawMetrics, totalPoolUsd, period, previousScores, config]);
}

export function useOrganizerScore(
  organizerId: string,
  scores: OrganizerScore[]
): OrganizerScore | undefined {
  return useMemo(() => {
    return scores.find((s) => s.organizerId === organizerId);
  }, [organizerId, scores]);
}

export function useOrganizerTier(tier: OrganizerScore['tier']): {
  label: string;
  color: string;
  icon: string;
  description: string;
} {
  return useMemo(() => {
    switch (tier) {
      case 'platinum':
        return {
          label: 'Platinum Organizer',
          color: 'bg-gradient-to-r from-cyan-400 to-blue-400',
          icon: '💎',
          description: 'Top 5% - Elite React community builder',
        };
      case 'gold':
        return {
          label: 'Gold Organizer',
          color: 'bg-gradient-to-r from-yellow-400 to-orange-400',
          icon: '🏆',
          description: 'Top 15% - Outstanding React community',
        };
      case 'silver':
        return {
          label: 'Silver Organizer',
          color: 'bg-gradient-to-r from-gray-300 to-gray-400',
          icon: '🥈',
          description: 'Top 30% - Excellent React community',
        };
      case 'bronze':
        return {
          label: 'Bronze Organizer',
          color: 'bg-gradient-to-r from-orange-300 to-orange-400',
          icon: '🥉',
          description: 'Top 50% - Valued React community',
        };
      case 'none':
      default:
        return {
          label: 'Emerging Community',
          color: 'bg-muted',
          icon: '🌱',
          description: 'Growing impact in the React ecosystem',
        };
    }
  }, [tier]);
}
