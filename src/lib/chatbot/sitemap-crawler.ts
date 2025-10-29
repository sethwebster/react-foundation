/**
 * Sitemap-based Crawler
 * Discovers pages from sitemap.xml instead of following links
 * More reliable and faster than link-based crawling
 */

import { parseHTML } from 'linkedom';
import { logger } from '../logger';

export interface SitemapUrl {
  loc: string;
  lastmod?: string;
  changefreq?: string;
  priority?: string;
}

export interface SitemapCrawlResult {
  url: string;
  title: string;
  html: string;
  lastModified?: Date;
  priority?: number;
}

export interface SitemapCrawlerOptions {
  maxPages?: number;
  allowedPaths?: string[];
  excludePaths?: string[];
  minPriority?: number; // Only crawl pages above this priority
  onProgress?: (current: number, total: number, url: string) => void;
  onError?: (url: string, error: Error) => void;
}

export class SitemapCrawler {
  private baseUrl: string;

  constructor(
    private sitemapUrl: string,
    private options: SitemapCrawlerOptions = {}
  ) {
    this.baseUrl = new URL(sitemapUrl).origin;
  }

  /**
   * Fetch and parse sitemap.xml
   */
  async fetchSitemap(): Promise<SitemapUrl[]> {
    logger.info(`Fetching sitemap from ${this.sitemapUrl}`);

    try {
      const response = await fetch(this.sitemapUrl, {
        headers: {
          'User-Agent': 'React Foundation Chatbot Crawler',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch sitemap: ${response.status}`);
      }

      const xml = await response.text();
      return this.parseSitemap(xml);
    } catch (error) {
      logger.error('Error fetching sitemap:', error);
      throw error;
    }
  }

  /**
   * Parse sitemap XML
   */
  private parseSitemap(xml: string): SitemapUrl[] {
    const { document } = parseHTML(xml);
    const urlElements = document.querySelectorAll('url');
    const urls: SitemapUrl[] = [];

    for (const urlElement of urlElements) {
      const loc = urlElement.querySelector('loc')?.textContent;
      if (!loc) continue;

      const lastmod = urlElement.querySelector('lastmod')?.textContent;
      const changefreq = urlElement.querySelector('changefreq')?.textContent;
      const priority = urlElement.querySelector('priority')?.textContent;

      urls.push({
        loc,
        lastmod,
        changefreq,
        priority,
      });
    }

    logger.info(`Parsed ${urls.length} URLs from sitemap`);
    return urls;
  }

  /**
   * Filter URLs based on options
   */
  private shouldCrawl(url: string, priority?: string): boolean {
    const parsedUrl = new URL(url);

    // Check if URL is from same domain
    if (parsedUrl.origin !== this.baseUrl) {
      return false;
    }

    // Check priority threshold
    if (this.options.minPriority && priority) {
      const urlPriority = parseFloat(priority);
      if (urlPriority < this.options.minPriority) {
        return false;
      }
    }

    // Check allowed paths
    if (this.options.allowedPaths && this.options.allowedPaths.length > 0) {
      const matchesAllowed = this.options.allowedPaths.some((pattern) =>
        parsedUrl.pathname.startsWith(pattern)
      );
      if (!matchesAllowed) {
        return false;
      }
    }

    // Check excluded paths
    if (this.options.excludePaths && this.options.excludePaths.length > 0) {
      const matchesExcluded = this.options.excludePaths.some((pattern) =>
        parsedUrl.pathname.startsWith(pattern)
      );
      if (matchesExcluded) {
        return false;
      }
    }

    return true;
  }

  /**
   * Crawl a single page
   */
  private async crawlPage(url: string): Promise<SitemapCrawlResult> {
    logger.info(`Crawling page: ${url}`);

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'React Foundation Chatbot Crawler',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const html = await response.text();
    const { document } = parseHTML(html);

    // Extract title
    const title =
      document.querySelector('title')?.textContent ||
      document.querySelector('h1')?.textContent ||
      'Untitled';

    return {
      url,
      title: title.trim(),
      html,
    };
  }

  /**
   * Crawl all pages from sitemap
   */
  async crawl(): Promise<SitemapCrawlResult[]> {
    // Step 1: Fetch and parse sitemap
    const sitemapUrls = await this.fetchSitemap();

    // Step 2: Filter URLs
    const urlsToCrawl = sitemapUrls
      .filter((item) => this.shouldCrawl(item.loc, item.priority))
      .slice(0, this.options.maxPages ?? 100);

    logger.info(`Crawling ${urlsToCrawl.length} pages from sitemap`);

    // Step 3: Crawl pages
    const results: SitemapCrawlResult[] = [];
    let completed = 0;

    for (const sitemapUrl of urlsToCrawl) {
      try {
        this.options.onProgress?.(
          completed + 1,
          urlsToCrawl.length,
          sitemapUrl.loc
        );

        const result = await this.crawlPage(sitemapUrl.loc);

        // Add sitemap metadata
        if (sitemapUrl.lastmod) {
          result.lastModified = new Date(sitemapUrl.lastmod);
        }
        if (sitemapUrl.priority) {
          result.priority = parseFloat(sitemapUrl.priority);
        }

        results.push(result);
        completed++;

        logger.info(
          `Successfully crawled ${sitemapUrl.loc} (${completed}/${urlsToCrawl.length})`
        );
      } catch (error) {
        const err = error instanceof Error ? error : new Error('Unknown error');
        logger.error(`Failed to crawl ${sitemapUrl.loc}:`, err);
        this.options.onError?.(sitemapUrl.loc, err);
      }
    }

    logger.info(`Crawl complete: ${results.length}/${urlsToCrawl.length} pages`);
    return results;
  }
}

/**
 * Helper: Get sitemap URL for a base URL
 */
export function getSitemapUrl(baseUrl: string): string {
  const url = new URL(baseUrl);
  return `${url.origin}/sitemap.xml`;
}
