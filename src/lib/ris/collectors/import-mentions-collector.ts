/**
 * Import Mentions Collector
 * Checks probe repositories to see which libraries are actually being used
 */

import { PROBE_REPOS, getProbeRepoKey } from '../data/probe-repos';
import { logger } from '@/lib/logger';

export interface ImportMentionsResult {
  library_name: string;
  package_name: string;
  mention_count: number; // Number of probe repos that depend on this library
  probe_repos: string[]; // List of probe repos that use it
  collected_at: string;
}

export class ImportMentionsCollector {
  private readonly GITHUB_RAW_URL = 'https://raw.githubusercontent.com';
  private readonly CACHE_DURATION_DAYS = 90; // Cache for 90 days

  /**
   * Check if a library is mentioned in probe repositories
   * @param packageName - NPM package name to search for
   */
  async checkImportMentions(packageName: string): Promise<ImportMentionsResult> {
    logger.info(`🔍 Checking import mentions for ${packageName}...`);

    const mentionedIn: string[] = [];
    let checkedCount = 0;
    let errorCount = 0;

    // Check each probe repo
    for (const probeRepo of PROBE_REPOS) {
      try {
        const hasDependency = await this.checkPackageJson(
          probeRepo.owner,
          probeRepo.repo,
          packageName
        );

        if (hasDependency) {
          mentionedIn.push(getProbeRepoKey(probeRepo.owner, probeRepo.repo));
          logger.info(`  ✓ Found in ${probeRepo.owner}/${probeRepo.repo}`);
        }

        checkedCount++;

        // Rate limiting: small delay between requests
        await this.sleep(100);
      } catch (error) {
        errorCount++;
        logger.error(
          `  ✗ Error checking ${probeRepo.owner}/${probeRepo.repo}:`,
          error instanceof Error ? error.message : String(error)
        );

        // Continue on errors - some repos might be private or have issues
        if (errorCount > PROBE_REPOS.length * 0.3) {
          // If more than 30% fail, something is wrong
          logger.error('Too many errors, stopping import mentions check');
          break;
        }
      }
    }

    logger.info(
      `  Checked ${checkedCount}/${PROBE_REPOS.length} probe repos, found ${mentionedIn.length} mentions`
    );

    return {
      library_name: packageName,
      package_name: packageName,
      mention_count: mentionedIn.length,
      probe_repos: mentionedIn,
      collected_at: new Date().toISOString(),
    };
  }

  /**
   * Check if a package.json contains a specific dependency
   * Checks dependencies, devDependencies, and peerDependencies
   */
  private async checkPackageJson(
    owner: string,
    repo: string,
    packageName: string
  ): Promise<boolean> {
    try {
      // Try to fetch package.json from main branch
      const url = `${this.GITHUB_RAW_URL}/${owner}/${repo}/main/package.json`;
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'React-Foundation-RIS-Collector',
        },
      });

      if (!response.ok) {
        // Try master branch if main doesn't exist
        const masterUrl = `${this.GITHUB_RAW_URL}/${owner}/${repo}/master/package.json`;
        const masterResponse = await fetch(masterUrl, {
          headers: {
            'User-Agent': 'React-Foundation-RIS-Collector',
          },
        });

        if (!masterResponse.ok) {
          return false; // No package.json found
        }

        const data = await masterResponse.json();
        return this.hasPackageDependency(data, packageName);
      }

      const data = await response.json();
      return this.hasPackageDependency(data, packageName);
    } catch (error) {
      // Errors are expected for repos without package.json or private repos
      return false;
    }
  }

  /**
   * Check if package data contains a dependency
   */
  private hasPackageDependency(packageData: unknown, packageName: string): boolean {
    if (!packageData || typeof packageData !== 'object') {
      return false;
    }

    const pkg = packageData as Record<string, unknown>;

    // Check dependencies
    if (pkg.dependencies && typeof pkg.dependencies === 'object') {
      if (packageName in pkg.dependencies) return true;
    }

    // Check devDependencies
    if (pkg.devDependencies && typeof pkg.devDependencies === 'object') {
      if (packageName in pkg.devDependencies) return true;
    }

    // Check peerDependencies
    if (pkg.peerDependencies && typeof pkg.peerDependencies === 'object') {
      if (packageName in pkg.peerDependencies) return true;
    }

    // Check optionalDependencies
    if (pkg.optionalDependencies && typeof pkg.optionalDependencies === 'object') {
      if (packageName in pkg.optionalDependencies) return true;
    }

    return false;
  }

  /**
   * Sleep for specified milliseconds
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Batch check multiple libraries (for efficient collection)
   * This is useful when running initial collection for all libraries
   */
  async checkMultipleLibraries(packageNames: string[]): Promise<Map<string, ImportMentionsResult>> {
    logger.info(`🔍 Batch checking import mentions for ${packageNames.length} libraries...`);

    const results = new Map<string, ImportMentionsResult>();

    // Build a map of probe repo -> dependencies
    const probeRepoDeps = new Map<string, Set<string>>();

    for (const probeRepo of PROBE_REPOS) {
      try {
        const deps = await this.getProbeRepoDependencies(probeRepo.owner, probeRepo.repo);
        probeRepoDeps.set(getProbeRepoKey(probeRepo.owner, probeRepo.repo), deps);

        // Rate limiting
        await this.sleep(100);
      } catch (error) {
        logger.error(
          `Error fetching dependencies for ${probeRepo.owner}/${probeRepo.repo}:`,
          error instanceof Error ? error.message : String(error)
        );
      }
    }

    // Now check each package against all probe repos
    for (const packageName of packageNames) {
      const mentionedIn: string[] = [];

      for (const [probeRepoKey, deps] of probeRepoDeps.entries()) {
        if (deps.has(packageName)) {
          mentionedIn.push(probeRepoKey);
        }
      }

      results.set(packageName, {
        library_name: packageName,
        package_name: packageName,
        mention_count: mentionedIn.length,
        probe_repos: mentionedIn,
        collected_at: new Date().toISOString(),
      });

      logger.info(`  ${packageName}: ${mentionedIn.length} mentions`);
    }

    return results;
  }

  /**
   * Get all dependencies from a probe repo's package.json
   */
  private async getProbeRepoDependencies(owner: string, repo: string): Promise<Set<string>> {
    const deps = new Set<string>();

    try {
      const url = `${this.GITHUB_RAW_URL}/${owner}/${repo}/main/package.json`;
      let response = await fetch(url, {
        headers: {
          'User-Agent': 'React-Foundation-RIS-Collector',
        },
      });

      if (!response.ok) {
        // Try master branch
        const masterUrl = `${this.GITHUB_RAW_URL}/${owner}/${repo}/master/package.json`;
        response = await fetch(masterUrl, {
          headers: {
            'User-Agent': 'React-Foundation-RIS-Collector',
          },
        });

        if (!response.ok) {
          return deps;
        }
      }

      const data = await response.json();
      if (data && typeof data === 'object') {
        const pkg = data as Record<string, unknown>;

        // Collect all dependency types
        for (const depType of ['dependencies', 'devDependencies', 'peerDependencies', 'optionalDependencies']) {
          if (pkg[depType] && typeof pkg[depType] === 'object') {
            Object.keys(pkg[depType] as object).forEach(dep => deps.add(dep));
          }
        }
      }
    } catch (error) {
      // Silently fail - expected for some repos
    }

    return deps;
  }
}
