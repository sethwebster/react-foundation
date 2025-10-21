/**
 * Activity Data Types
 * Stores raw historical activity data (immutable after creation)
 */

// ============================================================================
// Raw Activity Items
// ============================================================================

export interface PullRequestActivity {
  id: number;
  number: number;
  title: string;
  created_at: string;
  merged_at: string | null;
  closed_at: string | null;
  state: 'open' | 'closed';
  merged: boolean;
  author: string;
  additions: number;
  deletions: number;
  changed_files: number;
  first_response_at?: string; // First comment/review by someone else
}

export interface IssueActivity {
  id: number;
  number: number;
  title: string;
  created_at: string;
  closed_at: string | null;
  state: 'open' | 'closed';
  author: string;
  comments: number;
  first_response_at?: string; // First comment by someone else
  labels: string[];
}

export interface CommitActivity {
  sha: string;
  date: string;
  author: string;
  message: string;
}

export interface ReleaseActivity {
  id: number;
  tag_name: string;
  name: string;
  published_at: string;
  prerelease: boolean;
  draft: boolean;
}

// ============================================================================
// Complete Activity Data for a Library
// ============================================================================

export interface LibraryActivityData {
  libraryName: string;
  owner: string;
  repo: string;

  // Timestamps
  first_collected_at: string; // When we first fetched this library
  last_updated_at: string; // Last time we added new activity
  collection_window_start: string; // Oldest data we have
  collection_window_end: string; // Newest data we have

  // Raw activity data (all time, immutable once created)
  prs: PullRequestActivity[];
  issues: IssueActivity[];
  commits: CommitActivity[]; // May be sampled if too many
  releases: ReleaseActivity[];

  // Always-current metrics (updated each run)
  stars: number;
  forks: number;
  is_archived: boolean;
  last_commit_date: string;

  // External metrics (updated each run)
  npm_downloads_12mo: number;
  npm_dependents: number;
  cdn_hits_12mo: number;
  ossf_score: number;

  // Metadata
  total_items: number; // Total PRs + issues + commits
  is_complete: boolean; // True if we fetched all history
}

// ============================================================================
// Incremental Update Delta
// ============================================================================

export interface ActivityDelta {
  new_prs: PullRequestActivity[];
  new_issues: IssueActivity[];
  new_commits: CommitActivity[];
  new_releases: ReleaseActivity[];
  since: string; // Timestamp we fetched from
  until: string; // Timestamp we fetched to
  total_new_items: number;
}

// ============================================================================
// Helper Types
// ============================================================================

export interface TimeWindow {
  start: Date;
  end: Date;
}

/**
 * Get 12-month rolling window from now
 */
export function get12MonthWindow(): TimeWindow {
  const end = new Date();
  const start = new Date();
  start.setFullYear(start.getFullYear() - 1);

  return { start, end };
}

/**
 * Filter activity items by time window
 */
export function filterByWindow<T extends { created_at?: string; date?: string; published_at?: string }>(
  items: T[],
  window: TimeWindow
): T[] {
  const startTime = window.start.getTime();
  const endTime = window.end.getTime();

  return items.filter(item => {
    const dateStr = item.created_at || item.date || item.published_at;
    if (!dateStr) return false;

    const time = new Date(dateStr).getTime();
    return time >= startTime && time <= endTime;
  });
}
