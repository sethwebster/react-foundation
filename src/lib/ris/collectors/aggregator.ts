/**
 * Data Aggregator
 * Combines metrics from all collectors into LibraryRawMetrics format
 */

import type { LibraryRawMetrics } from '../types';
import type { LibraryActivityData } from '../activity-types';
import { GitHubActivityCollector } from './github-activity-collector';
import { NPMCollector } from './npm-collector';
import { CDNCollector } from './cdn-collector';
import { OSSFCollector } from './ossf-collector';
import { calculateMetricsFromActivity } from '../activity-calculator';
import { mergeActivityData, pruneOldActivity } from '../activity-merge';

export interface AggregatorOptions {
  githubToken: string;
  githubTokens?: string[]; // Optional: array of tokens for rotation
}

export class MetricsAggregator {
  private githubCollectors: GitHubActivityCollector[];
  private currentCollectorIndex = 0;
  private npmCollector: NPMCollector;
  private cdnCollector: CDNCollector;
  private ossfCollector: OSSFCollector;

  constructor(options: AggregatorOptions) {
    // Support multiple tokens for rate limit rotation
    const tokens = options.githubTokens || [options.githubToken];
    this.githubCollectors = tokens.map(token => new GitHubActivityCollector(token));

    console.log(`🔑 Initialized with ${this.githubCollectors.length} GitHub token(s)`);

    this.npmCollector = new NPMCollector();
    this.cdnCollector = new CDNCollector();
    this.ossfCollector = new OSSFCollector();
  }

  /**
   * Get next GitHub collector (round-robin rotation)
   */
  private getNextGitHubCollector(): GitHubActivityCollector {
    const collector = this.githubCollectors[this.currentCollectorIndex];
    this.currentCollectorIndex = (this.currentCollectorIndex + 1) % this.githubCollectors.length;
    return collector;
  }

  /**
   * Collect or update activity data for a library
   * Returns activity data (which can then be converted to metrics)
   */
  async collectLibraryActivity(
    owner: string,
    repo: string,
    libraryName: string,
    cachedActivity?: LibraryActivityData | null
  ): Promise<LibraryActivityData> {
    console.log(`Collecting activity for ${owner}/${repo}...`);

    // Determine NPM package name
    const npmPackageName = NPMCollector.getPackageName(owner, repo);

    // Get next GitHub collector for round-robin rotation
    const githubCollector = this.getNextGitHubCollector();

    let activity: LibraryActivityData;

    // Decide: full collection or incremental update
    if (!cachedActivity) {
      // Cold start: fetch ALL historical activity
      console.log(`  🆕 First collection (fetching all history)...`);

      const [githubActivity, npm, cdn, ossf] = await Promise.allSettled([
        githubCollector.fetchAllActivity(owner, repo, libraryName),
        this.npmCollector.collectMetrics(npmPackageName),
        this.cdnCollector.collectMetrics(npmPackageName),
        this.ossfCollector.collectMetrics(owner, repo),
      ]);

      if (githubActivity.status === 'rejected') {
        throw new Error(`GitHub collection failed: ${githubActivity.reason}`);
      }

      activity = githubActivity.value;

      // Add external metrics
      if (npm.status === 'fulfilled') {
        activity.npm_downloads_12mo = npm.value.downloads_12mo;
        activity.npm_dependents = npm.value.dependents_count;
      }
      if (cdn.status === 'fulfilled') {
        activity.cdn_hits_12mo = cdn.value.jsdelivr_hits_12mo;
      }
      if (ossf.status === 'fulfilled') {
        activity.ossf_score = ossf.value.normalized_score;
      }

    } else {
      // Incremental update: fetch only new activity
      console.log(`  ⚡ Incremental update (since ${cachedActivity.last_updated_at})...`);

      const [delta, npm, cdn, ossf, basicStats] = await Promise.allSettled([
        githubCollector.fetchIncrementalActivity(owner, repo, cachedActivity.last_updated_at),
        this.npmCollector.collectMetrics(npmPackageName),
        this.cdnCollector.collectMetrics(npmPackageName),
        this.ossfCollector.collectMetrics(owner, repo),
        githubCollector.fetchBasicStats(owner, repo),
      ]);

      if (delta.status === 'rejected') {
        throw new Error(`Incremental collection failed: ${delta.reason}`);
      }

      const updatedStats = {
        stars: basicStats.status === 'fulfilled' ? basicStats.value.stars : cachedActivity.stars,
        forks: basicStats.status === 'fulfilled' ? basicStats.value.forks : cachedActivity.forks,
        is_archived: basicStats.status === 'fulfilled' ? basicStats.value.is_archived : cachedActivity.is_archived,
        last_commit_date: basicStats.status === 'fulfilled' ? basicStats.value.last_commit_date : cachedActivity.last_commit_date,
        npm_downloads_12mo: npm.status === 'fulfilled' ? npm.value.downloads_12mo : cachedActivity.npm_downloads_12mo,
        npm_dependents: npm.status === 'fulfilled' ? npm.value.dependents_count : cachedActivity.npm_dependents,
        cdn_hits_12mo: cdn.status === 'fulfilled' ? cdn.value.jsdelivr_hits_12mo : cachedActivity.cdn_hits_12mo,
        ossf_score: ossf.status === 'fulfilled' ? ossf.value.normalized_score : cachedActivity.ossf_score,
      };

      // Merge new activity with cached
      activity = mergeActivityData(cachedActivity, delta.value, updatedStats);

      // Prune old data (keep last 3 years)
      activity = pruneOldActivity(activity);

      console.log(`  ✓ Added ${delta.value.total_new_items} new items`);
    }

    console.log(`✓ Activity data complete for ${owner}/${repo}`);
    return activity;
  }

  /**
   * Legacy method: Collect metrics directly (uses activity-based approach internally)
   */
  async collectLibraryMetrics(
    owner: string,
    repo: string,
    libraryName?: string,
    cachedActivity?: LibraryActivityData | null
  ): Promise<LibraryRawMetrics> {
    // Collect activity data
    const activity = await this.collectLibraryActivity(
      owner,
      repo,
      libraryName || repo,
      cachedActivity
    );

    // Convert activity to metrics
    const metrics = calculateMetricsFromActivity(activity);

    return metrics;
  }

  /**
   * Map collected data to LibraryRawMetrics format
   */
  private mapToRawMetrics(
    libraryName: string,
    owner: string,
    repo: string,
    github: Record<string, unknown> | null,
    npm: Record<string, unknown> | null,
    cdn: Record<string, unknown> | null,
    ossf: Record<string, unknown> | null
  ): LibraryRawMetrics {
    // Helper to safely extract number
    const getNum = (obj: Record<string, unknown> | null, key: string): number => {
      if (!obj) return 0;
      const val = obj[key];
      return typeof val === 'number' ? val : 0;
    };

    // Helper to safely extract boolean
    const getBool = (obj: Record<string, unknown> | null, key: string): boolean => {
      if (!obj) return false;
      return obj[key] === true;
    };

    // Ecosystem Footprint (EF)
    const npm_downloads = getNum(npm, 'downloads_12mo');
    const gh_dependents = getNum(npm, 'dependents_count');
    const import_mentions = this.estimateImportMentions(getNum(github, 'stars'));
    const cdn_hits = getNum(cdn, 'jsdelivr_hits_12mo');

    // Contribution Quality (CQ)
    const pr_points = this.calculatePRPoints(github);
    const issue_resolution_rate = this.calculateIssueResolutionRate(github);
    const median_first_response_hours = this.calculateMedianResponseTime(github);
    const unique_contribs = getNum(github, 'unique_contribs_12mo');

    // Maintainer Health (MH)
    const active_maintainers = getNum(github, 'active_maintainers');
    const release_cadence_days = getNum(github, 'median_release_days');
    const top_author_share = getNum(github, 'top_contributor_share');
    const triage_latency_hours = median_first_response_hours;
    const maintainer_survey = this.estimateMaintainerHealth(github);

    // Community Benefit (CB)
    const docs_completeness = this.estimateDocsCompleteness(github, npm);
    const tutorials_refs = this.estimateTutorialRefs(getNum(github, 'stars'));
    const helpful_events = this.estimateHelpfulEvents(github);
    const user_satisfaction = this.estimateUserSatisfaction(github, npm);

    // Mission Alignment (MA)
    const a11y_advances = 0;
    const perf_concurrency_support = 0;
    const typescript_strictness = getBool(npm, 'typescript_support') ? 1 : 0;
    const rsc_compat_progress = 0;
    const security_practices = getNum(ossf, 'normalized_score');

    return {
      libraryName,
      owner,
      repo,
      // Metadata
      collected_at: new Date().toISOString(),
      // EF
      npm_downloads,
      gh_dependents,
      import_mentions,
      cdn_hits,
      // CQ
      pr_points,
      issue_resolution_rate,
      median_first_response_hours,
      unique_contribs,
      // MH
      active_maintainers,
      release_cadence_days,
      top_author_share,
      triage_latency_hours,
      maintainer_survey,
      // CB
      docs_completeness,
      tutorials_refs,
      helpful_events,
      user_satisfaction,
      // MA
      a11y_advances,
      perf_concurrency_support,
      typescript_strictness,
      rsc_compat_progress,
      security_practices,
    };
  }

  /**
   * Calculate PR points (weighted by impact)
   * Simplified version - in reality would need PR size and impact analysis
   */
  private calculatePRPoints(github: Record<string, unknown> | null): number {
    if (!github) return 0;

    const prs = typeof github.pr_merged_12mo === 'number' ? github.pr_merged_12mo : 0;
    const contribs = typeof github.unique_contribs_12mo === 'number' ? github.unique_contribs_12mo : 1;

    return prs * Math.log10(1 + contribs);
  }

  /**
   * Calculate issue resolution rate
   */
  private calculateIssueResolutionRate(github: Record<string, unknown> | null): number {
    if (!github) return 0;

    const opened = typeof github.issues_opened_12mo === 'number' ? github.issues_opened_12mo : 0;
    const closed = typeof github.issues_closed_12mo === 'number' ? github.issues_closed_12mo : 0;

    return opened > 0 ? Math.min(1, closed / opened) : 0;
  }

  /**
   * Calculate median response time
   */
  private calculateMedianResponseTime(github: Record<string, unknown> | null): number {
    if (!github) return 0;

    const prResponse = typeof github.median_pr_response_hours === 'number' ? github.median_pr_response_hours : 0;
    const issueResponse = typeof github.median_issue_response_hours === 'number' ? github.median_issue_response_hours : 0;

    if (prResponse > 0 && issueResponse > 0) {
      return (prResponse + issueResponse) / 2;
    }

    return prResponse || issueResponse || 0;
  }

  /**
   * Estimate maintainer health (0-1)
   */
  private estimateMaintainerHealth(github: Record<string, unknown> | null): number {
    if (!github) return 0;

    let score = 0;

    // Not archived
    if (github.is_archived !== true) score += 0.3;

    // Recent commits
    const lastCommitDate = typeof github.last_commit_date === 'string' ? github.last_commit_date : new Date().toISOString();
    const daysSinceCommit = this.daysSince(lastCommitDate);
    if (daysSinceCommit < 30) score += 0.3;
    else if (daysSinceCommit < 90) score += 0.15;

    // Multiple maintainers
    const maintainers = typeof github.active_maintainers === 'number' ? github.active_maintainers : 0;
    if (maintainers >= 3) score += 0.2;
    else if (maintainers >= 1) score += 0.1;

    // Regular releases
    const releases = typeof github.release_count_12mo === 'number' ? github.release_count_12mo : 0;
    if (releases >= 4) score += 0.2;
    else if (releases >= 1) score += 0.1;

    return Math.min(1, score);
  }

  /**
   * Estimate docs completeness (0-1)
   */
  private estimateDocsCompleteness(github: Record<string, unknown> | null, npm: Record<string, unknown> | null): number {
    let score = 0;

    // Has types
    if (npm && npm.typescript_support === true) score += 0.3;

    // Has releases
    const releases = github && typeof github.release_count_12mo === 'number' ? github.release_count_12mo : 0;
    if (releases > 0) score += 0.2;

    // Popular
    const stars = github && typeof github.stars === 'number' ? github.stars : 0;
    if (stars > 10000) score += 0.3;
    else if (stars > 1000) score += 0.2;
    else if (stars > 100) score += 0.1;

    // Not archived
    if (github && github.is_archived !== true) score += 0.2;

    return Math.min(1, score);
  }

  /**
   * Estimate tutorial references
   */
  private estimateTutorialRefs(stars: number): number {
    // Rough heuristic: popular libraries have more tutorials
    return Math.floor(stars / 10);
  }

  /**
   * Estimate helpful events (discussions, answers)
   */
  private estimateHelpfulEvents(github: Record<string, unknown> | null): number {
    if (!github) return 0;

    const issues = typeof github.issues_closed_12mo === 'number' ? github.issues_closed_12mo : 0;
    const prs = typeof github.pr_merged_12mo === 'number' ? github.pr_merged_12mo : 0;

    return issues + prs;
  }

  /**
   * Estimate user satisfaction (0-1)
   */
  private estimateUserSatisfaction(github: Record<string, unknown> | null, npm: Record<string, unknown> | null): number {
    if (!github) return 0.5;

    let score = 0.5;

    const resolutionRate = this.calculateIssueResolutionRate(github);
    score += resolutionRate * 0.2;

    const responseHours = this.calculateMedianResponseTime(github);
    if (responseHours > 0 && responseHours < 24) score += 0.2;
    else if (responseHours > 0 && responseHours < 72) score += 0.1;

    const releases = typeof github.release_count_12mo === 'number' ? github.release_count_12mo : 0;
    if (releases >= 4) score += 0.1;

    return Math.min(1, Math.max(0, score));
  }

  /**
   * Estimate import mentions (rough heuristic)
   */
  private estimateImportMentions(stars: number): number {
    // Very rough estimate based on popularity
    return Math.floor(stars / 100);
  }

  /**
   * Calculate days since a date
   */
  private daysSince(dateString: string): number {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  }
}
