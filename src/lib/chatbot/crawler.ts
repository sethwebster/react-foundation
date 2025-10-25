/**
 * Site Crawler
 * Discovers all pages on the site by following internal links
 */

// Dynamic import for jsdom to avoid bundling issues in serverless environments
async function getJSDOM() {
  const { JSDOM } = await import('jsdom');
  return JSDOM;
}

export interface CrawlResult {
  url: string;
  title: string;
  html: string;
  links: string[];
}

export interface CrawlerOptions {
  maxPages?: number;
  allowedPaths?: string[];
  excludePaths?: string[];
  onProgress?: (current: number, total: number, url: string) => void;
}

export class SiteCrawler {
  private visited = new Set<string>();
  private queue: string[] = [];
  private baseUrl: string;
  private results: CrawlResult[] = [];

  constructor(private startUrl: string, private options: CrawlerOptions = {}) {
    this.baseUrl = new URL(startUrl).origin;
    this.queue.push(startUrl);
  }

  async crawl(): Promise<CrawlResult[]> {
    const maxPages = this.options.maxPages ?? 100;

    while (this.queue.length > 0 && this.visited.size < maxPages) {
      const url = this.queue.shift()!;

      if (this.visited.has(url)) continue;
      if (!this.shouldCrawl(url)) continue;

      this.visited.add(url);

      try {
        this.options.onProgress?.(this.visited.size, maxPages, url);

        const result = await this.crawlPage(url);
        this.results.push(result);

        // Add discovered links to queue
        for (const link of result.links) {
          if (!this.visited.has(link) && !this.queue.includes(link)) {
            this.queue.push(link);
          }
        }
      } catch (error) {
        console.error(`Failed to crawl ${url}:`, error);
      }
    }

    return this.results;
  }

  private async crawlPage(url: string): Promise<CrawlResult> {
    // Add bypass header for internal crawling if configured
    const headers: Record<string, string> = {};
    if (process.env.CRAWLER_BYPASS_TOKEN) {
      headers['X-Crawler-Bypass'] = process.env.CRAWLER_BYPASS_TOKEN;
    }

    const response = await fetch(url, { headers });
    const html = await response.text();
    const JSDOM = await getJSDOM();
    const dom = new JSDOM(html);
    const document = dom.window.document;

    // Extract title
    const title =
      document.querySelector('h1')?.textContent?.trim() ||
      document.querySelector('title')?.textContent?.trim() ||
      url;

    // Extract internal links
    const links: string[] = [];
    const anchorElements = document.querySelectorAll('a[href]');

    for (const anchor of Array.from(anchorElements) as HTMLAnchorElement[]) {
      const href = anchor.getAttribute('href');
      if (!href) continue;

      const absoluteUrl = this.toAbsoluteUrl(href, url);
      if (absoluteUrl && this.isInternalLink(absoluteUrl)) {
        links.push(absoluteUrl);
      }
    }

    return {
      url,
      title,
      html,
      links: [...new Set(links)], // Deduplicate
    };
  }

  private toAbsoluteUrl(href: string, baseUrl: string): string | null {
    try {
      // Skip non-http(s) links
      if (
        href.startsWith('mailto:') ||
        href.startsWith('tel:') ||
        href.startsWith('javascript:') ||
        href.startsWith('#')
      ) {
        return null;
      }

      return new URL(href, baseUrl).href;
    } catch {
      return null;
    }
  }

  private isInternalLink(url: string): boolean {
    try {
      const urlObj = new URL(url);
      return urlObj.origin === this.baseUrl;
    } catch {
      return false;
    }
  }

  private shouldCrawl(url: string): boolean {
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;

      // Check excluded paths
      if (this.options.excludePaths?.some((p) => pathname.startsWith(p))) {
        return false;
      }

      // Check allowed paths
      if (
        this.options.allowedPaths &&
        !this.options.allowedPaths.some((p) => pathname.startsWith(p))
      ) {
        return false;
      }

      // Skip common non-content paths
      const skipExtensions = ['.pdf', '.zip', '.jpg', '.png', '.gif', '.svg', '.ico'];
      if (skipExtensions.some((ext) => pathname.endsWith(ext))) {
        return false;
      }

      return true;
    } catch {
      return false;
    }
  }

  getVisitedUrls(): string[] {
    return Array.from(this.visited);
  }

  getQueuedUrls(): string[] {
    return [...this.queue];
  }
}
