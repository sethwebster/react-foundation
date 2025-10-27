/**
 * Enrichment Collection Service
 *
 * Collects expensive "enrichment" metrics that don't need to be updated frequently:
 * - Import mentions (probe repos scan)
 * - Tutorial references (tutorial sites scan)
 *
 * These should be run quarterly or on-demand, not with every RIS collection.
 */

import { ImportMentionsCollector } from './collectors/import-mentions-collector';
import { TutorialReferencesCollector } from './collectors/tutorial-references-collector';
import { NPMCollector } from './collectors/npm-collector';
import { getCachedLibraryActivity, cacheLibraryActivity } from '../redis';
import { logger } from '../logger';

export interface EnrichmentCollectionResult {
  success: boolean;
  owner: string;
  repo: string;
  import_mentions?: number;
  tutorial_references?: number;
  error?: string;
}

/**
 * Collect enrichment metrics for a single library
 */
export async function collectEnrichmentForLibrary(
  owner: string,
  repo: string
): Promise<EnrichmentCollectionResult> {
  try {
    logger.info(`📊 Collecting enrichment metrics for ${owner}/${repo}...`);

    // Get existing activity data
    const activity = await getCachedLibraryActivity(owner, repo);
    if (!activity) {
      throw new Error('No activity data found - run baseline collection first');
    }

    // Get package name
    const packageName = NPMCollector.getPackageName(owner, repo);
    if (!packageName) {
      logger.warn(`  No NPM package found for ${owner}/${repo}, skipping enrichment`);
      return {
        success: true,
        owner,
        repo,
        import_mentions: 0,
        tutorial_references: 0,
      };
    }

    // Collect import mentions
    logger.info(`  🔍 Checking import mentions...`);
    const importCollector = new ImportMentionsCollector();
    const importResult = await importCollector.checkImportMentions(packageName);

    // Collect tutorial references
    logger.info(`  📚 Checking tutorial references...`);
    const tutorialCollector = new TutorialReferencesCollector();
    const tutorialResult = await tutorialCollector.checkTutorialReferences(
      packageName,
      activity.libraryName
    );

    // Update activity data with enrichment metrics
    activity.import_mentions = importResult.mention_count;
    activity.tutorial_references = tutorialResult.reference_count;
    activity.last_updated_at = new Date().toISOString();

    // Cache updated activity
    await cacheLibraryActivity(owner, repo, activity);

    logger.info(`  ✅ Enrichment complete: ${importResult.mention_count} imports, ${tutorialResult.reference_count} tutorials`);

    return {
      success: true,
      owner,
      repo,
      import_mentions: importResult.mention_count,
      tutorial_references: tutorialResult.reference_count,
    };
  } catch (error) {
    logger.error(`❌ Enrichment collection failed for ${owner}/${repo}:`, error);
    return {
      success: false,
      owner,
      repo,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Collect enrichment metrics for multiple libraries (batch)
 * This is more efficient as it can reuse probe repo scans
 */
export async function collectEnrichmentForMultipleLibraries(
  libraries: Array<{ owner: string; repo: string }>
): Promise<EnrichmentCollectionResult[]> {
  logger.info(`📊 Batch enrichment collection for ${libraries.length} libraries...`);

  const results: EnrichmentCollectionResult[] = [];

  // Get all package names first
  const libraryPackages = libraries.map(lib => ({
    ...lib,
    packageName: NPMCollector.getPackageName(lib.owner, lib.repo),
  })).filter(lib => lib.packageName !== null);

  if (libraryPackages.length === 0) {
    logger.warn('No libraries with NPM packages found');
    return [];
  }

  // Batch check import mentions (most expensive operation)
  logger.info(`🔍 Batch checking import mentions for ${libraryPackages.length} libraries...`);
  const importCollector = new ImportMentionsCollector();
  const importResults = await importCollector.checkMultipleLibraries(
    libraryPackages.map(lib => lib.packageName!)
  );

  // Check tutorial references for each library
  logger.info(`📚 Checking tutorial references...`);
  const tutorialCollector = new TutorialReferencesCollector();

  for (const lib of libraryPackages) {
    try {
      // Get activity data
      const activity = await getCachedLibraryActivity(lib.owner, lib.repo);
      if (!activity) {
        logger.warn(`No activity data for ${lib.owner}/${lib.repo}`);
        continue;
      }

      // Get results
      const importResult = importResults.get(lib.packageName!);
      const tutorialResult = await tutorialCollector.checkTutorialReferences(
        lib.packageName!,
        activity.libraryName
      );

      // Update activity
      activity.import_mentions = importResult?.mention_count || 0;
      activity.tutorial_references = tutorialResult.reference_count;
      activity.last_updated_at = new Date().toISOString();

      // Cache
      await cacheLibraryActivity(lib.owner, lib.repo, activity);

      results.push({
        success: true,
        owner: lib.owner,
        repo: lib.repo,
        import_mentions: activity.import_mentions,
        tutorial_references: activity.tutorial_references,
      });

      logger.info(`  ✓ ${lib.owner}/${lib.repo}: ${activity.import_mentions} imports, ${activity.tutorial_references} tutorials`);

      // Rate limiting between tutorial checks
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      logger.error(`Error enriching ${lib.owner}/${lib.repo}:`, error);
      results.push({
        success: false,
        owner: lib.owner,
        repo: lib.repo,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  logger.info(`✅ Batch enrichment complete: ${results.filter(r => r.success).length}/${results.length} successful`);

  return results;
}

/**
 * Check if enrichment data is stale (older than 90 days)
 */
export async function needsEnrichment(owner: string, repo: string): Promise<boolean> {
  const activity = await getCachedLibraryActivity(owner, repo);
  if (!activity) return true;

  // Check if we have enrichment data
  if (activity.import_mentions === 0 && activity.tutorial_references === 0) {
    return true; // Likely never been enriched
  }

  // Check if data is stale (90 days)
  const lastUpdated = new Date(activity.last_updated_at);
  const daysSinceUpdate = (Date.now() - lastUpdated.getTime()) / (1000 * 60 * 60 * 24);

  return daysSinceUpdate > 90;
}
