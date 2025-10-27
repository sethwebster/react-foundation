/**
 * PR Quality Analysis
 * Filters and classifies PRs by impact to prevent gaming
 */

import type { PullRequestActivity } from './activity-types';

export type PRImpact = 'high' | 'medium' | 'low' | 'trivial';

export interface PRQualityAnalysis {
  impact: PRImpact;
  isTrivial: boolean;
  isRenameOnly: boolean;
  locChanged: number;
  filesChanged: number;
  weight: number; // Multiplier for PR points (0 for trivial, 0.1 for low, 0.6 for medium, 1.0 for high)
}

/**
 * Analyze PR quality and impact
 */
export function analyzePRQuality(pr: PullRequestActivity): PRQualityAnalysis {
  const locChanged = pr.additions + pr.deletions;
  const filesChanged = pr.changed_files;

  // Check for trivial PRs (< 6 lines changed)
  const isTrivial = locChanged < 6;

  // Check for rename-only PRs (many files changed but few lines)
  // Heuristic: If more than 5 files changed but less than 2 lines per file on average
  const avgLinesPerFile = filesChanged > 0 ? locChanged / filesChanged : 0;
  const isRenameOnly = filesChanged > 5 && avgLinesPerFile < 2;

  // Determine impact level
  let impact: PRImpact;
  let weight: number;

  if (isTrivial || isRenameOnly) {
    impact = 'trivial';
    weight = 0; // Zero weight for trivial PRs
  } else if (locChanged < 50) {
    impact = 'low';
    weight = 0.1; // 10% weight for small changes
  } else if (locChanged < 500) {
    impact = 'medium';
    weight = 0.6; // 60% weight for medium changes
  } else {
    impact = 'high';
    weight = 1.0; // Full weight for substantial changes
  }

  return {
    impact,
    isTrivial,
    isRenameOnly,
    locChanged,
    filesChanged,
    weight,
  };
}

/**
 * Filter PRs by quality, removing trivial ones
 */
export function filterQualityPRs(prs: PullRequestActivity[]): PullRequestActivity[] {
  return prs.filter(pr => {
    const analysis = analyzePRQuality(pr);
    return !analysis.isTrivial;
  });
}

/**
 * Calculate weighted PR points with quality filtering
 * Applies impact weighting: High 1.0, Medium 0.6, Low 0.1, Trivial 0.0
 */
export function calculateWeightedPRPoints(prs: PullRequestActivity[]): number {
  return prs.reduce((sum, pr) => {
    if (!pr.merged) return sum;

    const analysis = analyzePRQuality(pr);

    // Skip trivial PRs entirely
    if (analysis.isTrivial) return sum;

    // Calculate base points (log scale based on size)
    const basePoints = Math.log10(1 + analysis.locChanged);

    // Apply impact weighting
    const weightedPoints = basePoints * analysis.weight;

    return sum + weightedPoints;
  }, 0);
}

/**
 * Get PR statistics with quality breakdown
 */
export interface PRQualityStats {
  total: number;
  merged: number;
  trivial: number;
  low: number;
  medium: number;
  high: number;
  totalPoints: number;
  weightedPoints: number;
}

export function getPRQualityStats(prs: PullRequestActivity[]): PRQualityStats {
  const stats: PRQualityStats = {
    total: prs.length,
    merged: 0,
    trivial: 0,
    low: 0,
    medium: 0,
    high: 0,
    totalPoints: 0,
    weightedPoints: 0,
  };

  prs.forEach(pr => {
    if (pr.merged) {
      stats.merged++;

      const analysis = analyzePRQuality(pr);
      const basePoints = Math.log10(1 + analysis.locChanged);

      stats.totalPoints += basePoints;
      stats.weightedPoints += basePoints * analysis.weight;

      // Count by impact
      switch (analysis.impact) {
        case 'trivial':
          stats.trivial++;
          break;
        case 'low':
          stats.low++;
          break;
        case 'medium':
          stats.medium++;
          break;
        case 'high':
          stats.high++;
          break;
      }
    }
  });

  return stats;
}
