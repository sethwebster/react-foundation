/**
 * Activity Merge Logic
 * Combines cached historical activity with new incremental data
 */

import type {
  LibraryActivityData,
  ActivityDelta,
  PullRequestActivity,
  IssueActivity,
  CommitActivity,
  ReleaseActivity,
} from './activity-types';

/**
 * Merge incremental activity delta with cached activity data
 */
export function mergeActivityData(
  cached: LibraryActivityData,
  delta: ActivityDelta,
  updatedStats: {
    stars: number;
    forks: number;
    is_archived: boolean;
    last_commit_date: string;
    gh_dependents: number;
    npm_downloads_12mo: number;
    npm_dependents: number;
    cdn_hits_12mo: number;
    ossf_score: number;
  }
): LibraryActivityData {
  // Merge PRs (deduplicate by ID)
  const prs = mergeArrays(cached.prs, delta.new_prs, 'id');

  // Merge issues (deduplicate by ID)
  const issues = mergeArrays(cached.issues, delta.new_issues, 'id');

  // Merge commits (deduplicate by SHA)
  const commits = mergeArrays(cached.commits, delta.new_commits, 'sha');

  // Merge releases (deduplicate by ID)
  const releases = mergeArrays(cached.releases, delta.new_releases, 'id');

  // Update timestamps
  const now = new Date().toISOString();

  return {
    ...cached,
    last_updated_at: now,
    collection_window_end: delta.until,
    prs,
    issues,
    commits,
    releases,
    // Update always-current stats
    ...updatedStats,
    total_items: prs.length + issues.length + commits.length,
  };
}

/**
 * Merge two arrays, deduplicating by a key field
 */
function mergeArrays<T>(
  existingItems: T[],
  newItems: T[],
  keyField: keyof T
): T[] {
  // Create a map of existing items
  const existingMap = new Map<unknown, T>();
  existingItems.forEach(item => {
    existingMap.set(item[keyField], item);
  });

  // Add new items (overwrites if duplicate - in case of updates)
  newItems.forEach(item => {
    existingMap.set(item[keyField], item);
  });

  // Convert back to array and sort by creation date
  const merged = Array.from(existingMap.values());

  // Sort by creation date (most recent first)
  return merged.sort((a, b) => {
    const dateA = getItemDate(a as Record<string, unknown>);
    const dateB = getItemDate(b as Record<string, unknown>);
    return dateB.getTime() - dateA.getTime();
  });
}

/**
 * Get date from activity item
 */
function getItemDate(item: Record<string, unknown>): Date {
  const dateStr = (item.created_at || item.date || item.published_at || new Date().toISOString()) as string;
  return new Date(dateStr);
}

/**
 * Prune old activity data to keep cache size reasonable
 * Keeps last 3 years of data (plenty for 12-month rolling window)
 */
export function pruneOldActivity(activity: LibraryActivityData): LibraryActivityData {
  const threeYearsAgo = new Date();
  threeYearsAgo.setFullYear(threeYearsAgo.getFullYear() - 3);
  const cutoffTime = threeYearsAgo.getTime();

  const prs = activity.prs.filter(pr =>
    new Date(pr.created_at).getTime() > cutoffTime
  );

  const issues = activity.issues.filter(issue =>
    new Date(issue.created_at).getTime() > cutoffTime
  );

  const commits = activity.commits.filter(commit =>
    new Date(commit.date).getTime() > cutoffTime
  );

  const releases = activity.releases.filter(release =>
    new Date(release.published_at).getTime() > cutoffTime
  );

  return {
    ...activity,
    prs,
    issues,
    commits,
    releases,
    collection_window_start: threeYearsAgo.toISOString(),
    total_items: prs.length + issues.length + commits.length,
  };
}
