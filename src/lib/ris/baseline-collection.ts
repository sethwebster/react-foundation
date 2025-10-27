/**
 * Baseline Collection Service
 * Handles initial data collection when libraries are approved
 * and periodic refresh to keep data current
 *
 * Features:
 * - Resumable collection (survives API failures)
 * - Granular state tracking per data source
 * - Exponential backoff retry logic
 * - Partial success handling
 */

import { MetricsAggregator } from './collectors/aggregator';
import { GitHubActivityCollector } from './collectors/github-activity-collector';
import { NPMCollector } from './collectors/npm-collector';
import { CDNCollector } from './collectors/cdn-collector';
import { OSSFCollector } from './collectors/ossf-collector';
import { calculateMetricsFromActivity } from './activity-calculator';
import { cacheLibraryActivity, cacheLibraryMetrics, getCachedLibraryActivity } from '../redis';
import {
  initializeCollectionState,
  getCollectionState,
  markSourceInProgress,
  markSourceCompleted,
  markSourceFailed,
  getSourcesNeedingCollection,
  type CollectionState,
} from './collection-state';

// Type for collection source keys
type CollectionSourceKey = 'github_basic' | 'github_prs' | 'github_issues' | 'github_commits' | 'github_releases' | 'npm_metrics' | 'cdn_metrics' | 'ossf_metrics';
import { logger } from '../logger';
import type { LibraryActivityData } from './activity-types';

export interface BaselineCollectionOptions {
  githubToken?: string;
  force?: boolean; // Force re-collection even if data exists
  resume?: boolean; // Resume from existing state (default: true)
}

export interface BaselineCollectionResult {
  success: boolean;
  owner: string;
  repo: string;
  error?: string;
  dataAge?: number; // ms since last collection
  metricsCalculated?: boolean;
  isPartial?: boolean; // Some sources succeeded, others failed
  failedSources?: string[]; // Which sources failed
  collectionState?: CollectionState;
}

/**
 * Collect baseline data for a newly approved library
 * This runs a full historical collection (12 months)
 * RESUMABLE: Can recover from failures and retry only failed sources
 */
export async function collectBaselineForLibrary(
  owner: string,
  repo: string,
  libraryName: string,
  options: BaselineCollectionOptions = {}
): Promise<BaselineCollectionResult> {
  const resume = options.resume !== false; // Default to true

  try {
    logger.info(`📊 Starting baseline collection for ${owner}/${repo}...`);

    // Check existing state
    let state = await getCollectionState(owner, repo);
    const existing = await getCachedLibraryActivity(owner, repo);

    // If complete and not forcing, return existing data
    if (state?.is_complete && existing && !options.force) {
      const dataAge = Date.now() - new Date(existing.last_updated_at).getTime();
      logger.info(`  ✅ Data already complete (age: ${Math.round(dataAge / 1000 / 60)} minutes)`);

      return {
        success: true,
        owner,
        repo,
        dataAge,
        metricsCalculated: true,
        collectionState: state,
      };
    }

    // Initialize state if new or forcing
    if (!state || options.force) {
      state = await initializeCollectionState(owner, repo);
    }

    // Use provided token or fall back to environment
    const githubToken = options.githubToken || process.env.GITHUB_TOKEN;
    if (!githubToken) {
      throw new Error('GitHub token required for baseline collection');
    }

    // Initialize collectors
    const githubCollector = new GitHubActivityCollector({ token: githubToken });
    const npmCollector = new NPMCollector();
    const cdnCollector = new CDNCollector();
    const ossfCollector = new OSSFCollector();

    // Get or initialize activity data
    // IMPORTANT: Preserve eligibility fields from existing data if available
    const eligibilityFields = existing ? {
      eligibility_status: existing.eligibility_status,
      sponsorship_level: existing.sponsorship_level,
      sponsorship_adjustment: existing.sponsorship_adjustment,
      eligibility_notes: existing.eligibility_notes,
      eligibility_last_reviewed: existing.eligibility_last_reviewed,
    } : {};

    let activity: LibraryActivityData = existing || {
      libraryName,
      owner,
      repo,
      first_collected_at: new Date().toISOString(),
      last_updated_at: new Date().toISOString(),
      collection_window_start: new Date().toISOString(),
      collection_window_end: new Date().toISOString(),
      prs: [],
      issues: [],
      commits: [],
      releases: [],
      stars: 0,
      forks: 0,
      is_archived: false,
      last_commit_date: new Date().toISOString(),
      gh_dependents: 0,
      npm_downloads_12mo: 0,
      npm_dependents: 0,
      cdn_hits_12mo: 0,
      ossf_score: 0,
      typescript_support: false,
      import_mentions: 0,
      tutorial_references: 0,
      total_items: 0,
      is_complete: false,
      // Preserve eligibility fields if they existed
      ...eligibilityFields,
    };

    // Determine what sources need collection
    const sourcesToCollect = resume ? getSourcesNeedingCollection(state) : [
      'github_basic', 'github_prs', 'github_issues', 'github_commits', 'github_releases',
      'npm_metrics', 'cdn_metrics', 'ossf_metrics'
    ];

    if (sourcesToCollect.length === 0) {
      logger.info(`  ✅ All sources already collected`);
      return {
        success: true,
        owner,
        repo,
        metricsCalculated: true,
        collectionState: state,
      };
    }

    logger.info(`  🔍 Collecting ${sourcesToCollect.length} data sources: ${sourcesToCollect.join(', ')}`);

    const failedSources: string[] = [];

    // Collect each source independently with error handling
    for (const source of sourcesToCollect) {
      try {
        await markSourceInProgress(owner, repo, source as CollectionSourceKey);

        switch (source) {
          case 'github_basic': {
            logger.info(`    → Fetching basic stats...`);
            const stats = await githubCollector.fetchBasicStats(owner, repo);
            activity.stars = stats.stars;
            activity.forks = stats.forks;
            activity.is_archived = stats.is_archived;
            activity.last_commit_date = stats.last_commit_date;
            await markSourceCompleted(owner, repo, 'github_basic');
            break;
          }

          case 'github_prs': {
            logger.info(`    → Fetching PRs...`);
            const prs = await githubCollector['fetchAllPRs'](owner, repo);
            activity.prs = prs;
            await markSourceCompleted(owner, repo, 'github_prs', prs.length);
            break;
          }

          case 'github_issues': {
            logger.info(`    → Fetching issues...`);
            const issues = await githubCollector['fetchAllIssues'](owner, repo);
            activity.issues = issues;
            await markSourceCompleted(owner, repo, 'github_issues', issues.length);
            break;
          }

          case 'github_commits': {
            logger.info(`    → Fetching commits...`);
            const commits = await githubCollector['fetchAllCommits'](owner, repo);
            activity.commits = commits;
            await markSourceCompleted(owner, repo, 'github_commits', commits.length);
            break;
          }

          case 'github_releases': {
            logger.info(`    → Fetching releases...`);
            const releases = await githubCollector['fetchAllReleases'](owner, repo);
            activity.releases = releases;
            await markSourceCompleted(owner, repo, 'github_releases', releases.length);
            break;
          }

          case 'npm_metrics': {
            logger.info(`    → Fetching NPM metrics...`);
            const packageName = NPMCollector.getPackageName(owner, repo);
            if (!packageName) {
              throw new Error('No NPM package name found for this repository');
            }
            const npm = await npmCollector.collectMetrics(packageName);
            activity.npm_downloads_12mo = npm.downloads_12mo;
            activity.npm_dependents = npm.dependents_count;
            activity.typescript_support = npm.typescript_support;
            await markSourceCompleted(owner, repo, 'npm_metrics');
            break;
          }

          case 'cdn_metrics': {
            logger.info(`    → Fetching CDN metrics...`);
            const packageName = NPMCollector.getPackageName(owner, repo);
            if (!packageName) {
              throw new Error('No NPM package name found for this repository');
            }
            const cdn = await cdnCollector.collectMetrics(packageName);
            activity.cdn_hits_12mo = cdn.jsdelivr_hits_12mo;
            await markSourceCompleted(owner, repo, 'cdn_metrics');
            break;
          }

          case 'ossf_metrics': {
            logger.info(`    → Fetching OSSF metrics...`);
            const ossf = await ossfCollector.collectMetrics(owner, repo);
            activity.ossf_score = ossf.normalized_score;
            await markSourceCompleted(owner, repo, 'ossf_metrics');
            break;
          }
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        logger.error(`    ✗ Failed to collect ${source}: ${errorMsg}`);
        await markSourceFailed(owner, repo, source as CollectionSourceKey, errorMsg);
        failedSources.push(source);
      }
    }

    // Update activity metadata
    activity.last_updated_at = new Date().toISOString();
    activity.total_items = activity.prs.length + activity.issues.length + activity.commits.length;

    // Cache activity data
    logger.info(`  💾 Caching activity data...`);
    await cacheLibraryActivity(owner, repo, activity);

    // Calculate and cache metrics (even with partial data)
    logger.info(`  🧮 Calculating RIS metrics...`);
    const metrics = calculateMetricsFromActivity(activity);
    await cacheLibraryMetrics(owner, repo, metrics);

    // Get final state
    const finalState = await getCollectionState(owner, repo);
    const isComplete = finalState?.is_complete || false;
    const isPartial = failedSources.length > 0 && failedSources.length < sourcesToCollect.length;

    if (isComplete) {
      logger.info(`  ✅ Baseline collection complete for ${owner}/${repo}`);
    } else if (isPartial) {
      logger.warn(`  ⚠️  Baseline collection partial for ${owner}/${repo} (${failedSources.length} sources failed)`);
    } else {
      logger.error(`  ❌ Baseline collection failed for ${owner}/${repo} (all sources failed)`);
    }

    return {
      success: isComplete || isPartial,
      owner,
      repo,
      metricsCalculated: true,
      dataAge: 0,
      isPartial,
      failedSources: failedSources.length > 0 ? failedSources : undefined,
      collectionState: finalState || undefined,
    };

  } catch (error) {
    logger.error(`❌ Baseline collection crashed for ${owner}/${repo}:`, error);

    const state = await getCollectionState(owner, repo);

    return {
      success: false,
      owner,
      repo,
      error: error instanceof Error ? error.message : String(error),
      isPartial: state?.is_partial,
      collectionState: state || undefined,
    };
  }
}

/**
 * Refresh data for multiple libraries (batch operation)
 * Used for scheduled periodic refresh
 */
export async function refreshLibraries(
  libraries: Array<{ owner: string; repo: string; libraryName: string }>,
  options: BaselineCollectionOptions = {}
): Promise<BaselineCollectionResult[]> {
  logger.info(`🔄 Starting refresh for ${libraries.length} libraries...`);

  const results: BaselineCollectionResult[] = [];

  for (const library of libraries) {
    // Get cached activity for incremental update
    const cached = await getCachedLibraryActivity(library.owner, library.repo);

    const result = await refreshLibrary(
      library.owner,
      library.repo,
      library.libraryName,
      cached,
      options
    );

    results.push(result);

    // Add small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  const successCount = results.filter(r => r.success).length;
  logger.info(`✅ Refresh complete: ${successCount}/${libraries.length} succeeded`);

  return results;
}

/**
 * Refresh a single library (incremental update if possible)
 */
async function refreshLibrary(
  owner: string,
  repo: string,
  libraryName: string,
  cachedActivity: LibraryActivityData | null,
  options: BaselineCollectionOptions
): Promise<BaselineCollectionResult> {
  try {
    logger.info(`  🔄 Refreshing ${owner}/${repo}...`);

    // Use provided token or fall back to environment
    const githubToken = options.githubToken || process.env.GITHUB_TOKEN;
    if (!githubToken) {
      throw new Error('GitHub token required');
    }

    // Initialize aggregator
    const aggregator = new MetricsAggregator({
      githubToken,
    });

    // Collect activity (incremental if cached data exists)
    const activity = await aggregator.collectLibraryActivity(
      owner,
      repo,
      libraryName,
      cachedActivity,
      true
    );

    // Cache updated activity
    await cacheLibraryActivity(owner, repo, activity);

    // Recalculate and cache metrics
    const metrics = calculateMetricsFromActivity(activity);
    await cacheLibraryMetrics(owner, repo, metrics);

    const dataAge = cachedActivity
      ? Date.now() - new Date(cachedActivity.last_updated_at).getTime()
      : 0;

    logger.info(`    ✓ Refreshed ${owner}/${repo}`);

    return {
      success: true,
      owner,
      repo,
      dataAge,
      metricsCalculated: true,
    };

  } catch (error) {
    logger.error(`    ✗ Failed to refresh ${owner}/${repo}:`, error);

    return {
      success: false,
      owner,
      repo,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Get data freshness for a library
 * Returns age in milliseconds, or null if no data exists
 */
export async function getLibraryDataAge(
  owner: string,
  repo: string
): Promise<number | null> {
  try {
    const activity = await getCachedLibraryActivity(owner, repo);
    if (!activity) {
      return null;
    }

    return Date.now() - new Date(activity.last_updated_at).getTime();
  } catch {
    return null;
  }
}
