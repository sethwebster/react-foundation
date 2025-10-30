/**
 * Data Aggregator
 * Combines metrics from all collectors into LibraryRawMetrics format
 */

import type { LibraryRawMetrics } from '../types';
import type { LibraryActivityData } from '../activity-types';
import { GitHubActivityCollector, type GitHubCollectorOptions } from './github-activity-collector';
import { NPMCollector } from './npm-collector';
import { CDNCollector } from './cdn-collector';
import { OSSFCollector } from './ossf-collector';
import { calculateMetricsFromActivity } from '../activity-calculator';
import { mergeActivityData, pruneOldActivity } from '../activity-merge';
import { Octokit } from '@octokit/rest';
import { App } from '@octokit/app';

export interface AggregatorOptions {
  githubToken?: string;
  githubTokens?: string[]; // Array of PATs for rotation
  githubAppId?: string; // GitHub App ID
  githubAppPrivateKey?: string; // GitHub App private key
  githubCollectors?: GitHubActivityCollector[]; // Pre-configured collectors
}

export class MetricsAggregator {
  private githubCollectors: GitHubActivityCollector[];
  private currentCollectorIndex = 0;
  private exhaustedUntil: Map<number, number> = new Map(); // Maps collector index to reset timestamp
  private npmCollector: NPMCollector;
  private cdnCollector: CDNCollector;
  private ossfCollector: OSSFCollector;
  private onSourceStart?: (source: string) => void | ((library: string, source: string) => void);
  private currentLibraryContext?: string; // Track which library is currently being collected

  constructor(options: AggregatorOptions) {
    if (options.githubCollectors) {
      // Use pre-configured collectors (for advanced use cases)
      this.githubCollectors = options.githubCollectors;
      console.log(`🔑 Initialized with ${this.githubCollectors.length} pre-configured GitHub collector(s)`);
    } else if (options.githubTokens) {
      // Use PAT array
      this.githubCollectors = options.githubTokens.map(token =>
        new GitHubActivityCollector({ token })
      );
      console.log(`🔑 Initialized with ${this.githubCollectors.length} GitHub PAT(s)`);
    } else if (options.githubToken) {
      // Use single PAT
      this.githubCollectors = [new GitHubActivityCollector({ token: options.githubToken })];
      console.log(`🔑 Initialized with 1 GitHub PAT`);
    } else {
      throw new Error('GitHub authentication required (token, tokens, appId, or collectors)');
    }

    this.npmCollector = new NPMCollector();
    this.cdnCollector = new CDNCollector();
    this.ossfCollector = new OSSFCollector();
  }

  /**
   * Set callback for source-level progress tracking
   * Callback receives (library: string, source: string) where library is "owner/repo"
   */
  setSourceCallback(callback: (library: string, source: string) => void): void {
    this.onSourceStart = (source: string) => {
      // This old format is deprecated - we need library info
      // For now, just call with empty library - the route will handle it
      callback('', source);
    };
  }
  
  /**
   * Set callback with library context
   */
  setSourceCallbackWithLibrary(callback: (library: string, source: string) => void): void {
    this.onSourceStart = callback as any; // Store the new format
  }

  /**
   * Get number of GitHub collectors (for determining batch size)
   */
  getCollectorCount(): number {
    return this.githubCollectors.length;
  }

  /**
   * Create aggregator from GitHub App
   * Each installation gets its own rate limit (5,000/hour per installation)
   */
  static async fromGitHubApp(
    appId: string,
    privateKey: string
  ): Promise<MetricsAggregator> {
    console.log(`🤖 Initializing GitHub App authentication (App ID: ${appId})...`);

    const app = new App({
      appId,
      privateKey,
    });

    // Get all installations
    const { data: installations } = await app.octokit.request('GET /app/installations');

    console.log(`   Found ${installations.length} installation(s)`);

    // IMPORTANT: Each installation must be on a DIFFERENT organization/account
    // Installing on multiple repos under the same org doesn't increase rate limits
    const installationAccounts = new Set<string>();
    installations.forEach(inst => {
      const account = inst.account?.login || 'unknown';
      installationAccounts.add(account);
      console.log(`   - Installation ${inst.id}: ${account} (${inst.target_type})`);
    });

    if (installationAccounts.size < installations.length) {
      console.warn(`   ⚠️  WARNING: Some installations are on the same account. Rate limits are per ACCOUNT/ORG, not per repository.`);
      console.warn(`   ⚠️  To increase rate limits, install the app on DIFFERENT organizations or user accounts.`);
    }

    // Create a collector for each installation
    // Use the appOctokit directly so tokens refresh automatically
    const collectors = await Promise.all(
      installations.map(async (installation, index) => {
        // Get installation-specific Octokit (automatically refreshes tokens)
        const appOctokit = await app.getInstallationOctokit(installation.id);

        // Use appOctokit directly - it handles token refresh automatically
        // Convert to standard Octokit by using auth function that refreshes
        const octokit = new Octokit({
          auth: async () => {
            // This will be called for each request and refreshes token if needed
            const auth = await appOctokit.auth();
            // Type assertion: auth() returns { token: string }
            return (auth as { token: string }).token;
          },
        });

        const accountName = installation.account?.login || 'unknown';
        console.log(`   ✓ Collector ${index + 1}: ${accountName} (installation ${installation.id})`);

        return new GitHubActivityCollector({ octokit });
      })
    );

    const uniqueAccounts = installationAccounts.size;
    console.log(`✅ GitHub App ready with ${collectors.length} installation(s) across ${uniqueAccounts} unique account(s)`);
    if (uniqueAccounts > 1) {
      console.log(`   📊 Effective rate limit: ${uniqueAccounts * 5000}/hour (${uniqueAccounts} accounts × 5,000/hour each)`);
    } else {
      console.log(`   📊 Effective rate limit: 5,000/hour (single account - install on different orgs/accounts to increase)`);
    }

    return new MetricsAggregator({
      githubCollectors: collectors,
    });
  }

  /**
   * Get next available GitHub collector (skips exhausted tokens)
   * Returns the collector and its index
   */
  private getNextGitHubCollector(): { collector: GitHubActivityCollector; index: number } {
    const now = Date.now();
    const totalCollectors = this.githubCollectors.length;

    if (totalCollectors === 0) {
      throw new Error('No GitHub collectors available');
    }

    // Try each collector starting from current index
    for (let i = 0; i < totalCollectors; i++) {
      const index = (this.currentCollectorIndex + i) % totalCollectors;
      const resetTime = this.exhaustedUntil.get(index);

      // Check if this token is available (not exhausted or reset time passed)
      if (!resetTime || now >= resetTime) {
        // Clear the exhaustion flag if reset time passed
        if (resetTime && now >= resetTime) {
          this.exhaustedUntil.delete(index);
          console.log(`✅ Collector ${index + 1}/${totalCollectors} rate limit reset, back in rotation`);
        }

        // Update index for next call
        this.currentCollectorIndex = (index + 1) % totalCollectors;
        console.log(`🔄 Using collector ${index + 1}/${totalCollectors} (${this.exhaustedUntil.size} exhausted)`);
        return { collector: this.githubCollectors[index], index };
      }
    }

    // All tokens exhausted - return the one that resets soonest
    let soonestIndex = 0;
    let soonestReset = Infinity;

    this.exhaustedUntil.forEach((resetTime, index) => {
      if (resetTime < soonestReset) {
        soonestReset = resetTime;
        soonestIndex = index;
      }
    });

    const waitMinutes = Math.ceil((soonestReset - now) / 60000);
    console.warn(`⚠️  All ${totalCollectors} collectors exhausted. Soonest reset: ${waitMinutes} min`);

    this.currentCollectorIndex = (soonestIndex + 1) % totalCollectors;
    return { collector: this.githubCollectors[soonestIndex], index: soonestIndex };
  }

  /**
   * Mark a collector as exhausted until the specified reset time
   */
  private markCollectorExhausted(index: number, resetTimestamp: number): void {
    this.exhaustedUntil.set(index, resetTimestamp);
    const waitMinutes = Math.ceil((resetTimestamp - Date.now()) / 60000);
    const remaining = this.githubCollectors.length - this.exhaustedUntil.size;
    console.warn(`⚠️  Collector ${index + 1}/${this.githubCollectors.length} exhausted. Resets in ${waitMinutes} min. ${remaining} collector(s) still available.`);
  }

  /**
   * Collect or update activity data for a library
   * Returns activity data (which can then be converted to metrics)
   */
  async collectLibraryActivity(
    owner: string,
    repo: string,
    libraryName: string,
    cachedActivity?: LibraryActivityData | null,
    hasNpmPackage: boolean = true
  ): Promise<LibraryActivityData> {
    console.log(`Collecting activity for ${owner}/${repo}...`);

    // Set library context for callbacks
    const libraryKey = `${owner}/${repo}`;
    this.currentLibraryContext = libraryKey;
    
    // Fire callback immediately to signal collection has started for this library
    if (this.onSourceStart) {
      console.log(`  → Firing start callback for ${libraryKey}`);
      (this.onSourceStart as (library: string, source: string) => void)(libraryKey, 'events');
    }

    // Determine NPM package name (null for repos without NPM packages)
    const npmPackageName = hasNpmPackage ? NPMCollector.getPackageName(owner, repo) : null;

    let activity: LibraryActivityData;
    let lastError: Error | null = null;
    let collectorIndex = 0;

    // Retry with different tokens if rate limited (max: number of tokens available)
    const maxRetries = this.githubCollectors.length;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        // Get next available GitHub collector (skips exhausted tokens)
        const collectorInfo = this.getNextGitHubCollector();
        const githubCollector = collectorInfo.collector;
        collectorIndex = collectorInfo.index;
        
        console.log(`  🔑 Collector ${collectorIndex + 1}/${this.githubCollectors.length} for ${owner}/${repo}`);

    // Decide: full collection or incremental update
    if (!cachedActivity) {
      // Cold start: fetch ALL historical activity
      console.log(`  🆕 First collection (fetching all history)...`);

      // IMPORTANT: Try to get cached activity to preserve eligibility fields
      // This handles the case where force refresh is run and cachedActivity is null
      const { getCachedLibraryActivity } = await import('@/lib/redis');
      const existingActivity = await getCachedLibraryActivity(owner, repo);
      const eligibilityFields = existingActivity ? {
        eligibility_status: existingActivity.eligibility_status,
        sponsorship_level: existingActivity.sponsorship_level,
        sponsorship_adjustment: existingActivity.sponsorship_adjustment,
        eligibility_notes: existingActivity.eligibility_notes,
        eligibility_last_reviewed: existingActivity.eligibility_last_reviewed,
      } : {};

      // Collect GitHub and OSSF data (always needed)
      // Pass source callback to GitHub collector for progress tracking
      // Wrap callback to include library context
      const libraryCallback = this.onSourceStart 
        ? (source: string) => {
            // Always pass library context if we have onSourceStart
            if (typeof this.onSourceStart === 'function') {
              console.log(`  → Library callback firing: ${libraryKey} - ${source}`);
              // Call with (library, source) format - setSourceCallbackWithLibrary stores it this way
              (this.onSourceStart as (library: string, source: string) => void)(libraryKey, source);
            } else {
              console.log(`  → WARNING: onSourceStart is not a function for ${libraryKey}`);
            }
          }
        : undefined;
      
      if (!libraryCallback) {
        console.log(`  → WARNING: No library callback set for ${libraryKey}`);
      }
      
      const [githubActivity, ossf, npm, cdn] = await Promise.allSettled([
        githubCollector.fetchAllActivity(owner, repo, libraryName, libraryCallback),
        this.ossfCollector.collectMetrics(owner, repo),
        npmPackageName ? this.npmCollector.collectMetrics(npmPackageName) : Promise.resolve({ downloads_12mo: 0, downloads_last_month: 0, package_name: '', latest_version: '', license: '', dependents_count: 0, typescript_support: false }),
        npmPackageName ? this.cdnCollector.collectMetrics(npmPackageName) : Promise.resolve({ jsdelivr_hits_12mo: 0, jsdelivr_hits_last_month: 0 }),
      ]);

      if (githubActivity.status === 'rejected') {
        throw new Error(`GitHub collection failed: ${githubActivity.reason}`);
      }

      activity = {
        ...githubActivity.value,
        // Preserve eligibility fields if they existed
        ...eligibilityFields,
      };

      // Add external metrics (only if NPM package exists and collection succeeded)
      if (npmPackageName && npm.status === 'fulfilled') {
        activity.npm_downloads_12mo = npm.value.downloads_12mo;
        activity.npm_dependents = npm.value.dependents_count;
      }
      if (npmPackageName && cdn.status === 'fulfilled') {
        activity.cdn_hits_12mo = cdn.value.jsdelivr_hits_12mo;
      }
      if (ossf.status === 'fulfilled') {
        activity.ossf_score = ossf.value.normalized_score;
      }

    } else {
      // Incremental update: fetch only new activity
      console.log(`  ⚡ Incremental update (since ${cachedActivity.last_updated_at})...`);

      // Collect delta and updated stats
      const [delta, ossf, basicStats, npm, cdn] = await Promise.allSettled([
        githubCollector.fetchIncrementalActivity(owner, repo, cachedActivity.last_updated_at),
        this.ossfCollector.collectMetrics(owner, repo),
        githubCollector.fetchBasicStats(owner, repo),
        npmPackageName ? this.npmCollector.collectMetrics(npmPackageName) : Promise.resolve({ downloads_12mo: 0, downloads_last_month: 0, package_name: '', latest_version: '', license: '', dependents_count: 0, typescript_support: false }),
        npmPackageName ? this.cdnCollector.collectMetrics(npmPackageName) : Promise.resolve({ jsdelivr_hits_12mo: 0, jsdelivr_hits_last_month: 0 }),
      ]);

      if (delta.status === 'rejected') {
        throw new Error(`Incremental collection failed: ${delta.reason}`);
      }

      const updatedStats = {
        stars: basicStats.status === 'fulfilled' ? basicStats.value.stars : cachedActivity.stars,
        forks: basicStats.status === 'fulfilled' ? basicStats.value.forks : cachedActivity.forks,
        is_archived: basicStats.status === 'fulfilled' ? basicStats.value.is_archived : cachedActivity.is_archived,
        last_commit_date: basicStats.status === 'fulfilled' ? basicStats.value.last_commit_date : cachedActivity.last_commit_date,
        gh_dependents: basicStats.status === 'fulfilled' ? basicStats.value.gh_dependents : (cachedActivity.gh_dependents ?? 0),
        npm_downloads_12mo: npmPackageName && npm.status === 'fulfilled' ? npm.value.downloads_12mo : cachedActivity.npm_downloads_12mo,
        npm_dependents: npmPackageName && npm.status === 'fulfilled' ? npm.value.dependents_count : cachedActivity.npm_dependents,
        cdn_hits_12mo: npmPackageName && cdn.status === 'fulfilled' ? cdn.value.jsdelivr_hits_12mo : cachedActivity.cdn_hits_12mo,
        ossf_score: ossf.status === 'fulfilled' ? ossf.value.normalized_score : cachedActivity.ossf_score,
      };

      // Merge new activity with cached
      activity = mergeActivityData(cachedActivity, delta.value, updatedStats);

      // Prune old data (keep last 3 years)
      activity = pruneOldActivity(activity);

      console.log(`  ✓ Added ${delta.value.total_new_items} new items`);
    }

        console.log(`✓ Activity data complete for ${owner}/${repo}`);
        return activity; // Success - return the activity

      } catch (error) {
        lastError = error as Error;

        // Check if it's a rate limit error
        const isRateLimitError = error instanceof Error && error.message.includes('rate limit exceeded');

        if (isRateLimitError) {
          // Extract reset timestamp from error message or default to 1 hour from now
          const resetMatch = error.message.match(/Resets in (\d+) minutes?/);
          const resetMinutes = resetMatch ? parseInt(resetMatch[1], 10) : 60;
          const resetTimestamp = Date.now() + (resetMinutes * 60 * 1000);

          // Mark this collector as exhausted
          this.markCollectorExhausted(collectorIndex, resetTimestamp);

          // Try next token if available
          if (attempt < maxRetries - 1) {
            console.log(`  🔄 Retrying with next token (attempt ${attempt + 2}/${maxRetries})...`);
            continue;
          }
        }

        // If not a rate limit error or last attempt, throw
        throw error;
      }
    }

    // All tokens exhausted - throw the last error
    throw lastError || new Error('Collection failed with unknown error');
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
