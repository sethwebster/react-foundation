/**
 * Per-Author Contribution Caps
 * Prevents gaming by capping individual contributions at 90th percentile
 */

import type { PullRequestActivity, CommitActivity } from './activity-types';

export interface AuthorContribution {
  author: string;
  prCount: number;
  commitCount: number;
  prPoints: number; // Weighted PR points
  cappedPRCount: number;
  cappedCommitCount: number;
  cappedPRPoints: number;
  wasCapped: boolean;
}

/**
 * Calculate 90th percentile of an array
 */
function calculatePercentile(values: number[], percentile: number): number {
  if (values.length === 0) return 0;

  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.ceil((percentile / 100) * sorted.length) - 1;

  return sorted[Math.max(0, index)];
}

/**
 * Apply per-author caps at 90th percentile
 * Returns capped lists of PRs and commits
 */
export function applyAuthorCaps(
  prs: PullRequestActivity[],
  commits: CommitActivity[],
  calculatePRPoints: (pr: PullRequestActivity) => number
): {
  cappedPRs: PullRequestActivity[];
  cappedCommits: CommitActivity[];
  authorStats: AuthorContribution[];
  prCap: number;
  commitCap: number;
} {
  // Group PRs by author
  const prsByAuthor = new Map<string, PullRequestActivity[]>();
  prs.forEach(pr => {
    const existing = prsByAuthor.get(pr.author) || [];
    prsByAuthor.set(pr.author, [...existing, pr]);
  });

  // Group commits by author
  const commitsByAuthor = new Map<string, CommitActivity[]>();
  commits.forEach(commit => {
    const existing = commitsByAuthor.get(commit.author) || [];
    commitsByAuthor.set(commit.author, [...existing, commit]);
  });

  // Calculate 90th percentile caps
  const prCounts = Array.from(prsByAuthor.values()).map(prs => prs.length);
  const commitCounts = Array.from(commitsByAuthor.values()).map(commits => commits.length);

  const prCap = calculatePercentile(prCounts, 90);
  const commitCap = calculatePercentile(commitCounts, 90);

  // Apply caps and build author stats
  const allAuthors = new Set([
    ...prsByAuthor.keys(),
    ...commitsByAuthor.keys(),
  ]);

  const cappedPRs: PullRequestActivity[] = [];
  const cappedCommits: CommitActivity[] = [];
  const authorStats: AuthorContribution[] = [];

  for (const author of allAuthors) {
    const authorPRs = prsByAuthor.get(author) || [];
    const authorCommits = commitsByAuthor.get(author) || [];

    // Calculate original PR points
    const prPoints = authorPRs.reduce((sum, pr) => sum + calculatePRPoints(pr), 0);

    // Cap PRs (take most recent if over cap)
    const prWasCapped = authorPRs.length > prCap;
    const selectedPRs = prWasCapped
      ? authorPRs
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, Math.ceil(prCap))
      : authorPRs;

    cappedPRs.push(...selectedPRs);

    // Cap commits (take most recent if over cap)
    const commitWasCapped = authorCommits.length > commitCap;
    const selectedCommits = commitWasCapped
      ? authorCommits
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .slice(0, Math.ceil(commitCap))
      : authorCommits;

    cappedCommits.push(...selectedCommits);

    // Calculate capped PR points
    const cappedPRPoints = selectedPRs.reduce((sum, pr) => sum + calculatePRPoints(pr), 0);

    // Record stats
    authorStats.push({
      author,
      prCount: authorPRs.length,
      commitCount: authorCommits.length,
      prPoints,
      cappedPRCount: selectedPRs.length,
      cappedCommitCount: selectedCommits.length,
      cappedPRPoints,
      wasCapped: prWasCapped || commitWasCapped,
    });
  }

  return {
    cappedPRs,
    cappedCommits,
    authorStats,
    prCap,
    commitCap,
  };
}

/**
 * Get summary statistics about capping
 */
export interface CapSummary {
  totalAuthors: number;
  cappedAuthors: number;
  prCap: number;
  commitCap: number;
  originalPRCount: number;
  cappedPRCount: number;
  originalCommitCount: number;
  cappedCommitCount: number;
  percentPRsRetained: number;
  percentCommitsRetained: number;
}

export function getCapSummary(
  originalPRCount: number,
  originalCommitCount: number,
  cappedPRCount: number,
  cappedCommitCount: number,
  authorStats: AuthorContribution[],
  prCap: number,
  commitCap: number
): CapSummary {
  const cappedAuthors = authorStats.filter(a => a.wasCapped).length;

  return {
    totalAuthors: authorStats.length,
    cappedAuthors,
    prCap,
    commitCap,
    originalPRCount,
    cappedPRCount,
    originalCommitCount,
    cappedCommitCount,
    percentPRsRetained: originalPRCount > 0 ? (cappedPRCount / originalPRCount) * 100 : 100,
    percentCommitsRetained: originalCommitCount > 0 ? (cappedCommitCount / originalCommitCount) * 100 : 100,
  };
}
