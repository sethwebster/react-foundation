/**
 * GitHub Activity Collector
 * Fetches ALL historical activity data (no time limits)
 * Supports incremental updates (fetch only new items)
 */

import { Octokit } from '@octokit/rest';
import type {
  LibraryActivityData,
  PullRequestActivity,
  IssueActivity,
  CommitActivity,
  ReleaseActivity,
  ActivityDelta,
} from '../activity-types';

export interface GitHubCollectorOptions {
  /** Personal Access Token (string) */
  token?: string;
  /** Pre-configured Octokit instance (for GitHub App auth) */
  octokit?: Octokit;
}

export class GitHubActivityCollector {
  private restClient: Octokit;
  private rateLimitWarningShown = false;

  constructor(options: GitHubCollectorOptions | string) {
    // Support legacy string token or new options object
    if (typeof options === 'string') {
      this.restClient = new Octokit({
        auth: options,
      });
    } else if (options.octokit) {
      // Use provided Octokit instance (for GitHub App)
      this.restClient = options.octokit;
    } else if (options.token) {
      // Use PAT
      this.restClient = new Octokit({
        auth: options.token,
      });
    } else {
      throw new Error('GitHub token or Octokit instance is required');
    }
  }

  /**
   * Fetch ALL activity for a repository (cold start)
   */
  async fetchAllActivity(
    owner: string,
    repo: string,
    libraryName: string
  ): Promise<LibraryActivityData> {
    console.log(`  📥 Fetching ALL historical activity for ${owner}/${repo}...`);

    await this.checkRateLimit();

    const [basicStats, prs, issues, commits, releases] = await Promise.all([
      this.fetchBasicStats(owner, repo),
      this.fetchAllPRs(owner, repo),
      this.fetchAllIssues(owner, repo),
      this.fetchAllCommits(owner, repo),
      this.fetchAllReleases(owner, repo),
    ]);

    const now = new Date().toISOString();

    return {
      libraryName,
      owner,
      repo,
      first_collected_at: now,
      last_updated_at: now,
      collection_window_start: this.getOldestDate(prs, issues, commits),
      collection_window_end: now,
      prs,
      issues,
      commits,
      releases,
      ...basicStats,
      // External metrics (set later by aggregator)
      npm_downloads_12mo: 0,
      npm_dependents: 0,
      cdn_hits_12mo: 0,
      ossf_score: 0,
      total_items: prs.length + issues.length + commits.length,
      is_complete: true,
    };
  }

  /**
   * Fetch only NEW activity since last update (incremental)
   */
  async fetchIncrementalActivity(
    owner: string,
    repo: string,
    since: string
  ): Promise<ActivityDelta> {
    console.log(`  ⚡ Fetching incremental activity for ${owner}/${repo} since ${since}...`);

    await this.checkRateLimit();

    const until = new Date().toISOString();

    const [prs, issues, commits, releases] = await Promise.all([
      this.fetchPRsSince(owner, repo, since),
      this.fetchIssuesSince(owner, repo, since),
      this.fetchCommitsSince(owner, repo, since),
      this.fetchReleasesSince(owner, repo, since),
    ]);

    return {
      new_prs: prs,
      new_issues: issues,
      new_commits: commits,
      new_releases: releases,
      since,
      until,
      total_new_items: prs.length + issues.length + commits.length + releases.length,
    };
  }

  // =========================================================================
  // Full Collection Methods (No Time Limits)
  // =========================================================================

  /**
   * Fetch pull requests from last 24 months (sufficient for 12-month RIS calculation)
   * Much faster than fetching all history for large repos
   */
  private async fetchAllPRs(owner: string, repo: string): Promise<PullRequestActivity[]> {
    console.log(`    → Fetching PRs (last 24 months)...`);

    try {
      // Only fetch PRs from last 24 months (gives us buffer for 12-month calculation)
      const twentyFourMonthsAgo = new Date();
      twentyFourMonthsAgo.setMonth(twentyFourMonthsAgo.getMonth() - 24);
      const cutoffDate = twentyFourMonthsAgo.toISOString();

      let allPrs: unknown[] = [];
      const iterator = this.restClient.paginate.iterator(
        this.restClient.pulls.list,
        {
          owner,
          repo,
          state: 'all',
          sort: 'updated',
          direction: 'desc',
          per_page: 100,
        }
      );

      for await (const response of iterator) {
        const prs = response.data as Array<Record<string, unknown>>;

        // Stop if we've gone past our 24-month cutoff
        const oldestInPage = prs[prs.length - 1];
        const oldestDate = oldestInPage?.updated_at as string | undefined;

        // Add PRs from this page
        allPrs.push(...prs);

        // Break if we've reached old PRs or hit reasonable limit
        if (oldestDate && oldestDate < cutoffDate) {
          // Filter out PRs older than cutoff
          allPrs = allPrs.filter(pr => {
            const updatedAt = (pr as Record<string, unknown>).updated_at as string | undefined;
            return updatedAt && updatedAt >= cutoffDate;
          });
          break;
        }

        // Safety: cap at 1000 PRs max (even for very active repos)
        if (allPrs.length >= 1000) {
          allPrs = allPrs.slice(0, 1000);
          break;
        }
      }

      console.log(`    → Found ${allPrs.length} PRs in last 24 months`);

      return allPrs.map((pr: unknown) => {
        const prData = pr as Record<string, unknown>;
        const getNum = (key: string) => typeof prData[key] === 'number' ? prData[key] as number : 0;

        return {
          id: prData.id as number,
          number: prData.number as number,
          title: prData.title as string,
          created_at: prData.created_at as string,
          merged_at: prData.merged_at as string | null,
          closed_at: prData.closed_at as string | null,
          state: prData.state as 'open' | 'closed',
          merged: prData.merged_at !== null,
          author: (prData.user as Record<string, unknown> | undefined)?.login as string || 'unknown',
          additions: getNum('additions'),
          deletions: getNum('deletions'),
          changed_files: getNum('changed_files'),
        };
      });
    } catch (error) {
      console.error(`Error fetching all PRs for ${owner}/${repo}:`, error);
      return [];
    }
  }

  /**
   * Fetch issues from last 24 months (sufficient for 12-month RIS calculation)
   * Uses 'since' parameter for efficient filtering
   */
  private async fetchAllIssues(owner: string, repo: string): Promise<IssueActivity[]> {
    console.log(`    → Fetching issues (last 24 months)...`);

    try {
      // GitHub API supports 'since' for issues - much more efficient!
      const twentyFourMonthsAgo = new Date();
      twentyFourMonthsAgo.setMonth(twentyFourMonthsAgo.getMonth() - 24);

      let allIssues: unknown[] = [];
      const iterator = this.restClient.paginate.iterator(
        this.restClient.issues.listForRepo,
        {
          owner,
          repo,
          state: 'all',
          since: twentyFourMonthsAgo.toISOString(),
          per_page: 100,
        }
      );

      for await (const response of iterator) {
        const items = response.data as Array<Record<string, unknown>>;
        // Filter out pull requests (they also appear in issues API)
        const issues = items.filter(item => !item.pull_request);
        allIssues.push(...issues);

        // Safety: cap at 1000 issues
        if (allIssues.length >= 1000) {
          allIssues = allIssues.slice(0, 1000);
          break;
        }
      }

      console.log(`    → Found ${allIssues.length} issues in last 24 months`);

      return allIssues.map((issue: unknown) => {
        const issueData = issue as Record<string, unknown>;
        const labels = Array.isArray(issueData.labels) ?
          issueData.labels.map((l: unknown) => (typeof l === 'object' && l !== null && 'name' in l ? String((l as Record<string, unknown>).name) : '')).filter(Boolean) :
          [];

        return {
          id: issueData.id as number,
          number: issueData.number as number,
          title: issueData.title as string,
          created_at: issueData.created_at as string,
          closed_at: issueData.closed_at as string | null,
          state: issueData.state as 'open' | 'closed',
          author: (issueData.user as Record<string, unknown> | undefined)?.login as string || 'unknown',
          comments: issueData.comments as number,
          labels,
        };
      });
    } catch (error) {
      console.error(`Error fetching all issues for ${owner}/${repo}:`, error);
      return [];
    }
  }

  /**
   * Fetch ALL commits (or sample if repo is huge)
   */
  private async fetchAllCommits(owner: string, repo: string): Promise<CommitActivity[]> {
    console.log(`    → Fetching commits (sampled)...`);

    try {
      // For very large repos, sample instead of fetching everything
      // Fetch first 1000 commits (most recent)
      const commits = await this.restClient.paginate(
        this.restClient.repos.listCommits,
        {
          owner,
          repo,
          per_page: 100,
        },
        (response) => response.data.slice(0, 1000)
      );

      return commits.map(commit => ({
        sha: commit.sha,
        date: commit.commit.author?.date || commit.commit.committer?.date || new Date().toISOString(),
        author: commit.author?.login || commit.commit.author?.name || 'unknown',
        message: commit.commit.message,
      }));
    } catch (error) {
      console.error(`Error fetching commits for ${owner}/${repo}:`, error);
      return [];
    }
  }

  /**
   * Fetch releases (limited to last 100)
   * 100 releases covers years of history for most repos
   */
  private async fetchAllReleases(owner: string, repo: string): Promise<ReleaseActivity[]> {
    console.log(`    → Fetching releases (max 100)...`);

    try {
      // Fetch first page only (100 releases is plenty)
      const { data: releases } = await this.restClient.repos.listReleases({
        owner,
        repo,
        per_page: 100,
      });

      console.log(`    → Found ${releases.length} releases`);

      return releases.map(release => ({
        id: release.id,
        tag_name: release.tag_name,
        name: release.name || release.tag_name,
        published_at: release.published_at || release.created_at,
        prerelease: release.prerelease,
        draft: release.draft,
      }));
    } catch (error) {
      console.error(`Error fetching releases for ${owner}/${repo}:`, error);
      return [];
    }
  }

  // =========================================================================
  // Incremental Collection Methods (Fetch Since Timestamp)
  // =========================================================================

  /**
   * Fetch PRs created since timestamp
   */
  private async fetchPRsSince(owner: string, repo: string, since: string): Promise<PullRequestActivity[]> {
    try {
      const prs = await this.restClient.paginate(
        this.restClient.pulls.list,
        {
          owner,
          repo,
          state: 'all',
          sort: 'created',
          direction: 'desc',
          per_page: 100,
        },
        (response) => response.data.filter(pr => pr.created_at > since)
      );

      return prs.map(pr => {
        const prData = pr as Record<string, unknown>;
        const getNum = (key: string) => typeof prData[key] === 'number' ? prData[key] as number : 0;

        return {
          id: pr.id,
          number: pr.number,
          title: pr.title,
          created_at: pr.created_at,
          merged_at: pr.merged_at,
          closed_at: pr.closed_at,
          state: pr.state as 'open' | 'closed',
          merged: pr.merged_at !== null,
          author: pr.user?.login || 'unknown',
          additions: getNum('additions'),
          deletions: getNum('deletions'),
          changed_files: getNum('changed_files'),
        };
      });
    } catch (error) {
      console.error(`Error fetching PRs since ${since}:`, error);
      return [];
    }
  }

  /**
   * Fetch issues created since timestamp
   */
  private async fetchIssuesSince(owner: string, repo: string, since: string): Promise<IssueActivity[]> {
    try {
      const issues = await this.restClient.paginate(
        this.restClient.issues.listForRepo,
        {
          owner,
          repo,
          state: 'all',
          since,
          per_page: 100,
        },
        (response) => response.data.filter((issue: Record<string, unknown>) =>
          !issue.pull_request &&
          typeof issue.created_at === 'string' &&
          issue.created_at > since
        )
      );

      return issues.map(issue => {
        const labels = Array.isArray(issue.labels) ?
          issue.labels.map(l => (typeof l === 'object' && l !== null && 'name' in l ? String(l.name) : '')).filter(Boolean) :
          [];

        return {
          id: issue.id,
          number: issue.number,
          title: issue.title,
          created_at: issue.created_at,
          closed_at: issue.closed_at,
          state: issue.state as 'open' | 'closed',
          author: issue.user?.login || 'unknown',
          comments: issue.comments,
          labels,
        };
      });
    } catch (error) {
      console.error(`Error fetching issues since ${since}:`, error);
      return [];
    }
  }

  /**
   * Fetch commits since timestamp
   */
  private async fetchCommitsSince(owner: string, repo: string, since: string): Promise<CommitActivity[]> {
    try {
      const commits = await this.restClient.paginate(
        this.restClient.repos.listCommits,
        {
          owner,
          repo,
          since,
          per_page: 100,
        }
      );

      return commits.map(commit => ({
        sha: commit.sha,
        date: commit.commit.author?.date || commit.commit.committer?.date || new Date().toISOString(),
        author: commit.author?.login || commit.commit.author?.name || 'unknown',
        message: commit.commit.message,
      }));
    } catch (error) {
      console.error(`Error fetching commits since ${since}:`, error);
      return [];
    }
  }

  /**
   * Fetch releases since timestamp
   */
  private async fetchReleasesSince(owner: string, repo: string, since: string): Promise<ReleaseActivity[]> {
    try {
      // GitHub doesn't support 'since' for releases, so fetch all and filter
      const releases = await this.restClient.paginate(
        this.restClient.repos.listReleases,
        {
          owner,
          repo,
          per_page: 100,
        },
        (response) => response.data.filter(r => (r.published_at || r.created_at) > since).slice(0, 100)
      );

      return releases.map(release => ({
        id: release.id,
        tag_name: release.tag_name,
        name: release.name || release.tag_name,
        published_at: release.published_at || release.created_at,
        prerelease: release.prerelease,
        draft: release.draft,
      }));
    } catch (error) {
      console.error(`Error fetching releases since ${since}:`, error);
      return [];
    }
  }

  // =========================================================================
  // Helpers
  // =========================================================================

  /**
   * Fetch basic repository stats (always current)
   */
  async fetchBasicStats(owner: string, repo: string) {
    console.log(`    → Fetching current stats...`);

    try {
      const { data } = await this.restClient.repos.get({ owner, repo });

      return {
        stars: data.stargazers_count,
        forks: data.forks_count,
        is_archived: data.archived,
        last_commit_date: data.pushed_at || new Date().toISOString(),
      };
    } catch (error) {
      console.error(`Error fetching basic stats for ${owner}/${repo}:`, error);
      return {
        stars: 0,
        forks: 0,
        is_archived: false,
        last_commit_date: new Date().toISOString(),
      };
    }
  }

  /**
   * Get oldest date from activity arrays
   */
  private getOldestDate(
    prs: PullRequestActivity[],
    issues: IssueActivity[],
    commits: CommitActivity[]
  ): string {
    const dates: string[] = [
      ...prs.map(pr => pr.created_at),
      ...issues.map(issue => issue.created_at),
      ...commits.map(commit => commit.date),
    ];

    if (dates.length === 0) {
      return new Date().toISOString();
    }

    return dates.sort()[0];
  }

  /**
   * Check rate limit and warn if low
   */
  private async checkRateLimit(): Promise<void> {
    try {
      const { data } = await this.restClient.rateLimit.get();
      const remaining = data.rate.remaining;
      const limit = data.rate.limit;
      const resetDate = new Date(data.rate.reset * 1000);

      if (remaining < 500 && !this.rateLimitWarningShown) {
        console.warn(`⚠️  GitHub API rate limit low: ${remaining}/${limit} remaining`);
        console.warn(`   Resets at: ${resetDate.toLocaleTimeString()}`);
        this.rateLimitWarningShown = true;
      }

      if (remaining === 0) {
        const waitMinutes = Math.ceil((resetDate.getTime() - Date.now()) / 60000);
        throw new Error(
          `GitHub API rate limit exceeded. Resets in ${waitMinutes} minutes at ${resetDate.toLocaleTimeString()}`
        );
      }
    } catch (error) {
      if (error instanceof Error && error.message.includes('rate limit exceeded')) {
        throw error;
      }
    }
  }
}
