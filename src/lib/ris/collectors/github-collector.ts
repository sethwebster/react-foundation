/**
 * GitHub Metrics Collector
 * Fetches repository metrics from GitHub API for RIS scoring
 */

import { graphql } from '@octokit/graphql';
import { Octokit } from '@octokit/rest';

export interface GitHubMetrics {
  // Repository basics
  stars: number;
  forks: number;

  // Contribution metrics
  unique_contribs_12mo: number;
  pr_count_12mo: number;
  issue_count_12mo: number;
  pr_merged_12mo: number;
  issues_opened_12mo: number;
  issues_closed_12mo: number;

  // Quality metrics
  median_pr_response_hours: number;
  median_issue_response_hours: number;

  // Maintainer health
  active_maintainers: number;
  release_count_12mo: number;
  median_release_days: number;
  top_contributor_share: number;

  // Additional
  last_commit_date: string;
  is_archived: boolean;
}

export class GitHubCollector {
  private graphqlClient: typeof graphql;
  private restClient: Octokit;
  private rateLimitWarningShown = false;

  constructor(githubToken: string) {
    if (!githubToken) {
      throw new Error('GitHub PAT is required');
    }

    this.graphqlClient = graphql.defaults({
      headers: {
        authorization: `token ${githubToken}`,
      },
    });

    this.restClient = new Octokit({
      auth: githubToken,
    });
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

      if (remaining < 100 && !this.rateLimitWarningShown) {
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
      // If rate limit check fails, continue anyway
      if (error instanceof Error && error.message.includes('rate limit exceeded')) {
        throw error;
      }
    }
  }

  /**
   * Collect all metrics for a repository
   */
  async collectMetrics(
    owner: string,
    repo: string
  ): Promise<GitHubMetrics> {
    console.log(`  → Fetching GitHub metrics for ${owner}/${repo}...`);

    // Check rate limit before proceeding
    await this.checkRateLimit();

    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    const since = oneYearAgo.toISOString();

    // Fetch data in parallel with progress logging
    console.log(`  → Fetching basic stats...`);
    const basicStats = await this.fetchBasicStats(owner, repo);

    console.log(`  → Fetching contributors...`);
    const contributors = await this.fetchContributors(owner, repo, since);

    console.log(`  → Fetching PRs...`);
    const prs = await this.fetchPullRequests(owner, repo, since);

    console.log(`  → Fetching issues...`);
    const issues = await this.fetchIssues(owner, repo, since);

    console.log(`  → Fetching releases...`);
    const releases = await this.fetchReleases(owner, repo);

    console.log(`  → Calculating derived metrics...`);

    // Calculate derived metrics
    const issue_resolution_rate =
      issues.opened > 0 ? issues.closed / issues.opened : 0;

    const median_first_response_hours =
      this.calculateMedian([...prs.response_times, ...issues.response_times]) / (1000 * 60 * 60);

    return {
      ...basicStats,
      unique_contribs_12mo: contributors.unique_count,
      pr_count_12mo: prs.total,
      issue_count_12mo: issues.total,
      pr_merged_12mo: prs.merged,
      issues_opened_12mo: issues.opened,
      issues_closed_12mo: issues.closed,
      median_pr_response_hours: prs.median_response_hours,
      median_issue_response_hours: issues.median_response_hours,
      active_maintainers: contributors.active_maintainers,
      release_count_12mo: releases.count,
      median_release_days: releases.median_days_between,
      top_contributor_share: contributors.top_contributor_share,
      last_commit_date: basicStats.last_commit_date,
      is_archived: basicStats.is_archived,
    };
  }

  /**
   * Fetch basic repository statistics
   */
  private async fetchBasicStats(owner: string, repo: string) {
    const query = `
      query($owner: String!, $repo: String!) {
        repository(owner: $owner, name: $repo) {
          stargazerCount
          forkCount
          isArchived
          defaultBranchRef {
            target {
              ... on Commit {
                committedDate
              }
            }
          }
        }
      }
    `;

    const result: Record<string, unknown> = await this.graphqlClient(query, { owner, repo });
    const repository = result.repository as Record<string, unknown>;

    const getNum = (key: string) => typeof repository[key] === 'number' ? repository[key] as number : 0;
    const getBool = (key: string) => repository[key] === true;
    const getDefaultBranch = () => {
      const branch = repository.defaultBranchRef as Record<string, unknown> | undefined;
      const target = branch?.target as Record<string, unknown> | undefined;
      return target?.committedDate as string | undefined;
    };

    return {
      stars: getNum('stargazerCount'),
      forks: getNum('forkCount'),
      is_archived: getBool('isArchived'),
      last_commit_date: getDefaultBranch() || new Date().toISOString(),
    };
  }

  /**
   * Fetch contributor data
   */
  private async fetchContributors(owner: string, repo: string, since: string) {
    try {
      // Fetch contributors from REST API (paginated)
      const contributors = await this.restClient.paginate(
        this.restClient.repos.listContributors,
        {
          owner,
          repo,
          per_page: 100,
        }
      );

      // Get recent commit activity to determine active maintainers
      // Sample 200 commits (enough for statistics, not too slow)
      const commits = await this.restClient.paginate(
        this.restClient.repos.listCommits,
        {
          owner,
          repo,
          since,
          per_page: 100,
        },
        (response) => response.data.slice(0, 200) // Sample 200 commits
      );

      // Count unique contributors in last 12 months
      const recentContributors = new Set(
        commits.map((c: Record<string, unknown>) => {
          const author = c.author as Record<string, unknown> | undefined;
          const commit = c.commit as Record<string, unknown> | undefined;
          const commitAuthor = commit?.author as Record<string, unknown> | undefined;
          return author?.login || commitAuthor?.name || '';
        }).filter(Boolean)
      );

      // Determine active maintainers (contributors with 12+ commits in last year)
      const commitCounts = new Map<string, number>();
      commits.forEach((c: Record<string, unknown>) => {
        const author = c.author as Record<string, unknown> | undefined;
        const commit = c.commit as Record<string, unknown> | undefined;
        const commitAuthor = commit?.author as Record<string, unknown> | undefined;
        const authorName = author?.login || commitAuthor?.name;
        if (typeof authorName === 'string') {
          commitCounts.set(authorName, (commitCounts.get(authorName) || 0) + 1);
        }
      });

      const activeMaintainers = Array.from(commitCounts.entries()).filter(
        ([_, count]) => count >= 12
      ).length;

      // Calculate top contributor share
      const sortedCounts = Array.from(commitCounts.values()).sort((a, b) => b - a);
      const totalCommits = commits.length;
      const topContributorShare =
        totalCommits > 0 && sortedCounts.length > 0
          ? sortedCounts[0] / totalCommits
          : 0;

      return {
        unique_count: recentContributors.size,
        active_maintainers: activeMaintainers,
        top_contributor_share: topContributorShare,
      };
    } catch (error) {
      console.error(`Error fetching contributors for ${owner}/${repo}:`, error);
      return {
        unique_count: 0,
        active_maintainers: 0,
        top_contributor_share: 0,
      };
    }
  }

  /**
   * Fetch pull request metrics
   */
  private async fetchPullRequests(owner: string, repo: string, since: string) {
    try {
      // Sample 100 PRs (enough for statistics)
      const prs = await this.restClient.paginate(
        this.restClient.pulls.list,
        {
          owner,
          repo,
          state: 'all',
          sort: 'updated',
          direction: 'desc',
          per_page: 100,
        },
        (response) => response.data.filter((pr: Record<string, unknown>) => new Date(pr.created_at) >= new Date(since)).slice(0, 100)
      );

      const merged = prs.filter((pr: Record<string, unknown>) => pr.merged_at).length;

      // Calculate response times - sample 20 PRs (much faster)
      const responseTimes: number[] = [];
      for (const pr of prs.slice(0, 20)) {
        try {
          const timeline = await this.restClient.issues.listEventsForTimeline({
            owner,
            repo,
            issue_number: pr.number,
            per_page: 10,
          });

          const firstResponse = timeline.data.find(
            (event: Record<string, unknown>) => event.event === 'commented' && event.actor?.login !== pr.user?.login
          );

          if (firstResponse && firstResponse.created_at) {
            const responseTime =
              new Date(firstResponse.created_at).getTime() -
              new Date(pr.created_at).getTime();
            responseTimes.push(responseTime);
          }
        } catch {
          // Skip if timeline fetch fails
        }
      }

      const medianResponseHours = responseTimes.length > 0
        ? this.calculateMedian(responseTimes) / (1000 * 60 * 60)
        : 0;

      return {
        total: prs.length,
        merged,
        response_times: responseTimes,
        median_response_hours: medianResponseHours,
      };
    } catch (error) {
      console.error(`Error fetching PRs for ${owner}/${repo}:`, error);
      return {
        total: 0,
        merged: 0,
        response_times: [],
        median_response_hours: 0,
      };
    }
  }

  /**
   * Fetch issue metrics
   */
  private async fetchIssues(owner: string, repo: string, since: string) {
    try {
      // Sample 100 issues (enough for statistics)
      const issues = await this.restClient.paginate(
        this.restClient.issues.listForRepo,
        {
          owner,
          repo,
          state: 'all',
          since,
          per_page: 100,
        },
        (response) => response.data.filter((issue: Record<string, unknown>) => !issue.pull_request).slice(0, 100)
      );

      const opened = issues.filter(
        (issue: Record<string, unknown>) => new Date(issue.created_at) >= new Date(since)
      ).length;

      const closed = issues.filter(
        (issue: Record<string, unknown>) =>
          issue.closed_at && new Date(issue.closed_at) >= new Date(since)
      ).length;

      // Calculate response times - sample 20 issues (much faster)
      const responseTimes: number[] = [];
      for (const issue of issues.slice(0, 20)) {
        if (issue.comments > 0) {
          try {
            const comments = await this.restClient.issues.listComments({
              owner,
              repo,
              issue_number: issue.number,
              per_page: 1,
            });

            if (comments.data.length > 0) {
              const firstComment = comments.data[0];
              if (firstComment.user?.login !== issue.user?.login) {
                const responseTime =
                  new Date(firstComment.created_at).getTime() -
                  new Date(issue.created_at).getTime();
                responseTimes.push(responseTime);
              }
            }
          } catch {
            // Skip if comment fetch fails
          }
        }
      }

      const medianResponseHours = responseTimes.length > 0
        ? this.calculateMedian(responseTimes) / (1000 * 60 * 60)
        : 0;

      return {
        total: issues.length,
        opened,
        closed,
        response_times: responseTimes,
        median_response_hours: medianResponseHours,
      };
    } catch (error) {
      console.error(`Error fetching issues for ${owner}/${repo}:`, error);
      return {
        total: 0,
        opened: 0,
        closed: 0,
        response_times: [],
        median_response_hours: 0,
      };
    }
  }

  /**
   * Fetch release data
   */
  private async fetchReleases(owner: string, repo: string) {
    try {
      const releases = await this.restClient.paginate(
        this.restClient.repos.listReleases,
        {
          owner,
          repo,
          per_page: 100,
        },
        (response) => response.data.slice(0, 100)
      );

      // Filter to non-patch releases (major/minor) and within last year
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

      const significantReleases = releases.filter((r: Record<string, unknown>) => {
        const publishedAt = new Date(r.published_at || r.created_at);
        if (publishedAt < oneYearAgo) return false;

        // Try to detect non-patch releases (not perfect but reasonable heuristic)
        const version = r.tag_name || r.name || '';
        const patchPattern = /\.\d+$/; // ends with .number (like v1.2.3)
        const hasMultipleDots = (version.match(/\./g) || []).length >= 2;

        return !hasMultipleDots || !patchPattern.test(version);
      });

      // Calculate median days between releases
      if (significantReleases.length >= 2) {
        const dates = significantReleases
          .map((r: Record<string, unknown>) => new Date(r.published_at || r.created_at).getTime())
          .sort((a, b) => a - b);

        const daysBetween: number[] = [];
        for (let i = 1; i < dates.length; i++) {
          const days = (dates[i] - dates[i - 1]) / (1000 * 60 * 60 * 24);
          daysBetween.push(days);
        }

        const medianDays = this.calculateMedian(daysBetween);

        return {
          count: significantReleases.length,
          median_days_between: medianDays,
        };
      }

      return {
        count: significantReleases.length,
        median_days_between: 0,
      };
    } catch (error) {
      console.error(`Error fetching releases for ${owner}/${repo}:`, error);
      return {
        count: 0,
        median_days_between: 0,
      };
    }
  }

  /**
   * Calculate median of an array
   */
  private calculateMedian(values: number[]): number {
    if (values.length === 0) return 0;

    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);

    if (sorted.length % 2 === 0) {
      return (sorted[mid - 1] + sorted[mid]) / 2;
    }

    return sorted[mid];
  }
}
