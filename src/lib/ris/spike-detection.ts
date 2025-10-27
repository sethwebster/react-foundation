/**
 * Spike Detection for Coordination Attacks
 * Detects unusual bursts of activity that may indicate gaming
 */

import type { PullRequestActivity, CommitActivity } from './activity-types';

export interface SpikeDetectionResult {
  hasSuspiciousActivity: boolean;
  spikes: ActivitySpike[];
  coordinationScore: number; // 0-1, higher = more suspicious
  penaltyMultiplier: number; // 0.5-1.0, applied to metrics if suspicious
}

export interface ActivitySpike {
  startDate: string;
  endDate: string;
  prCount: number;
  commitCount: number;
  uniqueAuthors: number;
  isSuspicious: boolean;
  reason?: string;
}

/**
 * Detect activity spikes in contribution history
 * A spike is defined as:
 * - More than 3x average activity in a 7-day window
 * - Multiple new contributors (>3) in same week
 * - Sudden burst after long period of inactivity
 */
export function detectActivitySpikes(
  prs: PullRequestActivity[],
  commits: CommitActivity[]
): SpikeDetectionResult {
  // Combine all activity into timeline
  const allActivity = [
    ...prs.map(pr => ({ date: new Date(pr.created_at), author: pr.author, type: 'pr' as const })),
    ...commits.map(c => ({ date: new Date(c.date), author: c.author, type: 'commit' as const })),
  ].sort((a, b) => a.date.getTime() - b.date.getTime());

  if (allActivity.length === 0) {
    return {
      hasSuspiciousActivity: false,
      spikes: [],
      coordinationScore: 0,
      penaltyMultiplier: 1.0,
    };
  }

  // Calculate baseline activity rate (items per day)
  const firstDate = allActivity[0].date;
  const lastDate = allActivity[allActivity.length - 1].date;
  const daySpan = Math.max(1, (lastDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24));
  const baselineRate = allActivity.length / daySpan;

  // Detect spikes in 7-day windows
  const windowDays = 7;
  const windowMs = windowDays * 24 * 60 * 60 * 1000;
  const spikes: ActivitySpike[] = [];

  for (let i = 0; i < allActivity.length; i++) {
    const windowStart = allActivity[i].date;
    const windowEnd = new Date(windowStart.getTime() + windowMs);

    // Count activity in this window
    const windowActivity = allActivity.filter(
      a => a.date >= windowStart && a.date < windowEnd
    );

    if (windowActivity.length === 0) continue;

    const windowPRs = windowActivity.filter(a => a.type === 'pr').length;
    const windowCommits = windowActivity.filter(a => a.type === 'commit').length;
    const uniqueAuthors = new Set(windowActivity.map(a => a.author)).size;

    // Calculate activity rate in this window
    const windowRate = windowActivity.length / windowDays;

    // Detect suspicious patterns
    let isSuspicious = false;
    let reason: string | undefined;

    // Pattern 1: Activity rate > 3x baseline
    if (baselineRate > 0 && windowRate > baselineRate * 3) {
      isSuspicious = true;
      reason = `Activity rate ${windowRate.toFixed(1)}/day is ${(windowRate / baselineRate).toFixed(1)}x above baseline`;
    }

    // Pattern 2: Multiple new contributors in same week (coordination)
    if (uniqueAuthors > 3 && windowActivity.length > 10) {
      const ratio = windowActivity.length / uniqueAuthors;
      if (ratio < 3) {
        // Many authors contributing small amounts
        isSuspicious = true;
        reason = `${uniqueAuthors} authors contributing in coordinated pattern`;
      }
    }

    // Pattern 3: Sudden burst after inactivity
    if (i > 0) {
      const previousDate = allActivity[i - 1].date;
      const gapDays = (windowStart.getTime() - previousDate.getTime()) / (1000 * 60 * 60 * 24);

      if (gapDays > 90 && windowActivity.length > 20) {
        isSuspicious = true;
        reason = `Sudden burst of ${windowActivity.length} contributions after ${gapDays.toFixed(0)} days of inactivity`;
      }
    }

    if (isSuspicious) {
      spikes.push({
        startDate: windowStart.toISOString(),
        endDate: windowEnd.toISOString(),
        prCount: windowPRs,
        commitCount: windowCommits,
        uniqueAuthors,
        isSuspicious: true,
        reason,
      });

      // Skip ahead to avoid overlapping spike windows
      i += Math.floor(windowActivity.length / 2);
    }
  }

  // Calculate coordination score based on spike severity
  const coordinationScore = calculateCoordinationScore(spikes, allActivity.length);

  // Apply penalty if coordination detected
  const penaltyMultiplier = coordinationScore > 0.5 ? 0.7 : coordinationScore > 0.3 ? 0.85 : 1.0;

  return {
    hasSuspiciousActivity: spikes.length > 0,
    spikes,
    coordinationScore,
    penaltyMultiplier,
  };
}

/**
 * Calculate coordination score (0-1) based on spike patterns
 */
function calculateCoordinationScore(spikes: ActivitySpike[], totalActivity: number): number {
  if (spikes.length === 0) return 0;

  // Count activity in spikes
  const spikeActivity = spikes.reduce((sum, spike) => sum + spike.prCount + spike.commitCount, 0);
  const spikeRatio = totalActivity > 0 ? spikeActivity / totalActivity : 0;

  // More spikes = higher score
  const spikeFrequency = Math.min(1, spikes.length / 5);

  // Weight: 60% based on activity concentration, 40% on spike frequency
  return spikeRatio * 0.6 + spikeFrequency * 0.4;
}

/**
 * Apply spike detection penalty to PR points
 * Returns adjusted points if coordination detected
 */
export function applySpikeDetectionPenalty(
  prPoints: number,
  spikeResult: SpikeDetectionResult
): {
  adjustedPoints: number;
  penaltyApplied: boolean;
  penaltyReason?: string;
} {
  if (!spikeResult.hasSuspiciousActivity) {
    return {
      adjustedPoints: prPoints,
      penaltyApplied: false,
    };
  }

  const adjustedPoints = prPoints * spikeResult.penaltyMultiplier;

  let reason = `Coordination detected (score: ${(spikeResult.coordinationScore * 100).toFixed(0)}%)`;
  if (spikeResult.spikes.length > 0) {
    reason += ` - ${spikeResult.spikes.length} suspicious spike(s)`;
  }

  return {
    adjustedPoints,
    penaltyApplied: true,
    penaltyReason: reason,
  };
}
