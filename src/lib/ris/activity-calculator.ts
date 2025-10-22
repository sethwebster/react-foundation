/**
 * Activity Calculator
 * Converts raw activity data to RIS metrics with time-window filtering
 */

import type { LibraryActivityData, TimeWindow } from './activity-types';
import type { LibraryRawMetrics } from './types';
import { get12MonthWindow, filterByWindow } from './activity-types';

/**
 * Calculate RIS metrics from activity data
 * Applies 12-month rolling window at calculation time
 */
export function calculateMetricsFromActivity(
  activity: LibraryActivityData,
  window?: TimeWindow
): LibraryRawMetrics {
  // Use 12-month window by default
  const timeWindow = window || get12MonthWindow();

  // Filter activity to time window
  const recentPRs = filterByWindow(activity.prs, timeWindow);
  const recentIssues = filterByWindow(activity.issues, timeWindow);
  const recentCommits = filterByWindow(activity.commits, timeWindow);
  const recentReleases = filterByWindow(activity.releases, timeWindow);

  // Calculate Contribution Quality (CQ) metrics
  const pr_count = recentPRs.length;
  const pr_merged = recentPRs.filter(pr => pr.merged).length;
  const issues_opened = recentIssues.filter(issue =>
    new Date(issue.created_at) >= timeWindow.start
  ).length;
  const issues_closed = recentIssues.filter(issue =>
    issue.closed_at && new Date(issue.closed_at) >= timeWindow.start
  ).length;

  const issue_resolution_rate = issues_opened > 0 ? issues_closed / issues_opened : 0;

  // Calculate PR points (simplified - based on size and merge status)
  const pr_points = recentPRs.reduce((sum, pr) => {
    if (!pr.merged) return sum;
    const loc_changed = pr.additions + pr.deletions;
    return sum + Math.log10(1 + loc_changed);
  }, 0);

  // Calculate median response times
  const prResponseTimes = recentPRs
    .filter(pr => pr.first_response_at)
    .map(pr =>
      new Date(pr.first_response_at!).getTime() - new Date(pr.created_at).getTime()
    );

  const issueResponseTimes = recentIssues
    .filter(issue => issue.first_response_at)
    .map(issue =>
      new Date(issue.first_response_at!).getTime() - new Date(issue.created_at).getTime()
    );

  const allResponseTimes = [...prResponseTimes, ...issueResponseTimes];
  const median_first_response_hours = allResponseTimes.length > 0
    ? calculateMedian(allResponseTimes) / (1000 * 60 * 60)
    : 0;

  // Calculate unique contributors
  const uniqueContributors = new Set([
    ...recentPRs.map(pr => pr.author),
    ...recentIssues.map(issue => issue.author),
    ...recentCommits.map(commit => commit.author),
  ]);
  const unique_contribs = uniqueContributors.size;

  // Calculate Maintainer Health (MH) metrics
  const commitCounts = new Map<string, number>();
  recentCommits.forEach(commit => {
    commitCounts.set(commit.author, (commitCounts.get(commit.author) || 0) + 1);
  });

  const active_maintainers = Array.from(commitCounts.entries()).filter(
    ([_, count]) => count >= 12
  ).length;

  const sortedCounts = Array.from(commitCounts.values()).sort((a, b) => b - a);
  const totalCommits = recentCommits.length;
  const top_author_share = totalCommits > 0 && sortedCounts.length > 0
    ? sortedCounts[0] / totalCommits
    : 0;

  // Calculate release cadence
  const nonPrereleases = recentReleases.filter(r => !r.prerelease && !r.draft);
  const release_cadence_days = calculateReleaseCadence(nonPrereleases);

  // Estimate triage latency (use issue response time as proxy)
  const triage_latency_hours = median_first_response_hours;

  // Estimate docs completeness (heuristic based on repo characteristics)
  const docs_completeness = estimateDocsCompleteness(activity);

  // Estimate tutorial refs and helpful events
  const tutorials_refs = Math.floor(activity.stars / 10);
  const helpful_events = issues_closed;

  // Estimate user satisfaction
  const user_satisfaction = estimateUserSatisfaction(issue_resolution_rate, median_first_response_hours);

  // Estimate maintainer health survey score
  const maintainer_survey = estimateMaintainerHealth(
    activity.is_archived,
    activity.last_commit_date,
    active_maintainers,
    nonPrereleases.length
  );

  return {
    libraryName: activity.libraryName,
    owner: activity.owner,
    repo: activity.repo,
    collected_at: activity.last_updated_at,

    // Ecosystem Footprint (EF)
    npm_downloads: activity.npm_downloads_12mo,
    gh_dependents: activity.npm_dependents,
    import_mentions: Math.floor(activity.stars / 100), // Heuristic
    cdn_hits: activity.cdn_hits_12mo,

    // Contribution Quality (CQ)
    pr_points,
    issue_resolution_rate,
    median_first_response_hours,
    unique_contribs,

    // Maintainer Health (MH)
    active_maintainers,
    release_cadence_days,
    top_author_share,
    triage_latency_hours,
    maintainer_survey,

    // Community Benefit (CB)
    docs_completeness,
    tutorials_refs,
    helpful_events,
    user_satisfaction,

    // Mission Alignment (MA) - would need manual curation
    a11y_advances: 0,
    perf_concurrency_support: 0,
    typescript_strictness: 0, // Set from NPM data
    rsc_compat_progress: 0,
    security_practices: activity.ossf_score,
  };
}

/**
 * Calculate median from array
 */
function calculateMedian(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
}

/**
 * Calculate release cadence in days
 */
function calculateReleaseCadence(releases: Array<{ published_at: string }>): number {
  if (releases.length < 2) return 0;

  const dates = releases
    .map(r => new Date(r.published_at).getTime())
    .sort((a, b) => a - b);

  const intervals: number[] = [];
  for (let i = 1; i < dates.length; i++) {
    const days = (dates[i] - dates[i - 1]) / (1000 * 60 * 60 * 24);
    intervals.push(days);
  }

  return calculateMedian(intervals);
}

/**
 * Estimate docs completeness (0-1)
 */
function estimateDocsCompleteness(activity: LibraryActivityData): number {
  let score = 0;

  if (activity.stars > 10000) score += 0.3;
  else if (activity.stars > 1000) score += 0.2;
  else if (activity.stars > 100) score += 0.1;

  if (!activity.is_archived) score += 0.2;

  const daysSinceCommit = (Date.now() - new Date(activity.last_commit_date).getTime()) / (1000 * 60 * 60 * 24);
  if (daysSinceCommit < 30) score += 0.3;
  else if (daysSinceCommit < 90) score += 0.15;

  const hasReleases = activity.releases.length > 0;
  if (hasReleases) score += 0.2;

  return Math.min(1, score);
}

/**
 * Estimate user satisfaction (0-1)
 */
function estimateUserSatisfaction(
  issueResolutionRate: number,
  medianResponseHours: number
): number {
  let score = 0.5;

  score += issueResolutionRate * 0.3;

  if (medianResponseHours > 0 && medianResponseHours < 24) score += 0.2;
  else if (medianResponseHours > 0 && medianResponseHours < 72) score += 0.1;

  return Math.min(1, Math.max(0, score));
}

/**
 * Estimate maintainer health (0-1)
 */
function estimateMaintainerHealth(
  isArchived: boolean,
  lastCommitDate: string,
  activeMaintainers: number,
  releaseCount: number
): number {
  let score = 0;

  if (!isArchived) score += 0.3;

  const daysSinceCommit = (Date.now() - new Date(lastCommitDate).getTime()) / (1000 * 60 * 60 * 24);
  if (daysSinceCommit < 30) score += 0.3;
  else if (daysSinceCommit < 90) score += 0.15;

  if (activeMaintainers >= 3) score += 0.2;
  else if (activeMaintainers >= 1) score += 0.1;

  if (releaseCount >= 4) score += 0.2;
  else if (releaseCount >= 1) score += 0.1;

  return Math.min(1, score);
}
