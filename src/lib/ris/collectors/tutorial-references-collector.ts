/**
 * Tutorial References Collector
 * Checks tutorial sites and resources for library mentions
 *
 * Note: This is a simplified implementation that searches for mentions.
 * A production version might use APIs or more sophisticated scraping.
 */

import { TUTORIAL_SITES } from '../data/tutorial-sites';
import { logger } from '@/lib/logger';

export interface TutorialReferencesResult {
  library_name: string;
  package_name: string;
  reference_count: number; // Number of tutorial sites that mention this library
  tutorial_sites: string[]; // List of sites that reference it
  collected_at: string;
}

export class TutorialReferencesCollector {
  /**
   * Check if a library is referenced in tutorial sites
   * @param packageName - NPM package name to search for
   * @param libraryName - Common name of the library (e.g., "React Router" for "react-router")
   */
  async checkTutorialReferences(
    packageName: string,
    libraryName?: string
  ): Promise<TutorialReferencesResult> {
    logger.info(`🔍 Checking tutorial references for ${packageName}...`);

    const searchTerms = this.buildSearchTerms(packageName, libraryName);
    const referencedIn: string[] = [];
    let checkedCount = 0;

    // For now, we'll use a heuristic approach
    // In production, this would involve actual web scraping or API calls
    for (const site of TUTORIAL_SITES) {
      try {
        // Check if site has content about this library
        const hasReference = await this.checkSiteForReferences(
          site.url,
          searchTerms,
          site.type
        );

        if (hasReference) {
          referencedIn.push(site.name);
          logger.info(`  ✓ Found reference in ${site.name}`);
        }

        checkedCount++;

        // Rate limiting
        await this.sleep(200);
      } catch (error) {
        logger.error(
          `  ✗ Error checking ${site.name}:`,
          error instanceof Error ? error.message : String(error)
        );
      }
    }

    logger.info(
      `  Checked ${checkedCount}/${TUTORIAL_SITES.length} tutorial sites, found ${referencedIn.length} references`
    );

    return {
      library_name: libraryName || packageName,
      package_name: packageName,
      reference_count: referencedIn.length,
      tutorial_sites: referencedIn,
      collected_at: new Date().toISOString(),
    };
  }

  /**
   * Build search terms for a library
   */
  private buildSearchTerms(packageName: string, libraryName?: string): string[] {
    const terms = [packageName];

    if (libraryName) {
      terms.push(libraryName);
      // Add variations
      terms.push(libraryName.toLowerCase());
      terms.push(libraryName.replace(/\s+/g, '-'));
    }

    // Add package name variations
    if (packageName.startsWith('@')) {
      // For scoped packages like @tanstack/react-query
      const parts = packageName.split('/');
      if (parts.length === 2) {
        terms.push(parts[1]); // "react-query"
        terms.push(parts[1].replace(/-/g, ' ')); // "react query"
      }
    } else {
      // For regular packages like "react-router"
      terms.push(packageName.replace(/-/g, ' ')); // "react router"
    }

    return [...new Set(terms)]; // Remove duplicates
  }

  /**
   * Check if a site has references to the library
   *
   * SIMPLIFIED IMPLEMENTATION: Uses HEAD request to check if page exists
   *
   * Production TODO:
   * - Use Google Custom Search API
   * - Use site-specific search APIs (e.g., Algolia for many doc sites)
   * - Implement actual HTML scraping with cheerio/jsdom
   * - Cache results in Redis with 90-day TTL
   */
  private async checkSiteForReferences(
    siteUrl: string,
    searchTerms: string[],
    siteType: string
  ): Promise<boolean> {
    try {
      // For GitHub repos, check if mentioned in README
      if (siteType === 'github-repo') {
        return await this.checkGitHubRepo(siteUrl, searchTerms);
      }

      // For documentation sites, check if has a page for the library
      if (siteType === 'documentation') {
        return await this.checkDocumentation(siteUrl, searchTerms);
      }

      // For other sites, we need a more sophisticated approach
      // For MVP, return false (manual curation needed)
      return false;
    } catch (error) {
      return false;
    }
  }

  /**
   * Check GitHub repository README for mentions
   */
  private async checkGitHubRepo(repoUrl: string, searchTerms: string[]): Promise<boolean> {
    try {
      // Extract owner/repo from URL
      const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
      if (!match) return false;

      const [, owner, repo] = match;

      // Fetch README
      const readmeUrl = `https://raw.githubusercontent.com/${owner}/${repo}/main/README.md`;
      const response = await fetch(readmeUrl, {
        headers: {
          'User-Agent': 'React-Foundation-RIS-Collector',
        },
      });

      if (!response.ok) {
        // Try master branch
        const masterUrl = `https://raw.githubusercontent.com/${owner}/${repo}/master/README.md`;
        const masterResponse = await fetch(masterUrl, {
          headers: {
            'User-Agent': 'React-Foundation-RIS-Collector',
          },
        });

        if (!masterResponse.ok) return false;

        const content = await masterResponse.text();
        return this.containsSearchTerms(content.toLowerCase(), searchTerms);
      }

      const content = await response.text();
      return this.containsSearchTerms(content.toLowerCase(), searchTerms);
    } catch (error) {
      return false;
    }
  }

  /**
   * Check documentation site for library pages
   */
  private async checkDocumentation(docUrl: string, searchTerms: string[]): Promise<boolean> {
    try {
      // Try common documentation patterns
      const urlsToCheck = searchTerms.flatMap(term => [
        `${docUrl}/${term}`,
        `${docUrl}/docs/${term}`,
        `${docUrl}/guides/${term}`,
        `${docUrl}/packages/${term}`,
      ]);

      // Check if any of these URLs exist (HEAD request)
      for (const url of urlsToCheck) {
        try {
          const response = await fetch(url, {
            method: 'HEAD',
            headers: {
              'User-Agent': 'React-Foundation-RIS-Collector',
            },
          });

          if (response.ok) {
            return true;
          }
        } catch {
          // Continue checking other URLs
        }

        // Rate limiting between checks
        await this.sleep(100);
      }

      return false;
    } catch (error) {
      return false;
    }
  }

  /**
   * Check if content contains any of the search terms
   */
  private containsSearchTerms(content: string, searchTerms: string[]): boolean {
    const lowerContent = content.toLowerCase();
    return searchTerms.some(term => lowerContent.includes(term.toLowerCase()));
  }

  /**
   * Sleep for specified milliseconds
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Estimate tutorial references from GitHub stars (fallback heuristic)
   * This is the current implementation that will be used until we build
   * the full scraping infrastructure
   */
  static estimateFromStars(stars: number): number {
    // Current heuristic: stars / 10
    // This is what's currently used in activity-calculator.ts
    return Math.floor(stars / 10);
  }
}
