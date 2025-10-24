/**
 * Enhanced Site Crawler with JavaScript Rendering
 * Uses Puppeteer to capture dynamically-rendered content
 */

import puppeteer, { type Browser, type Page } from 'puppeteer';
import { JSDOM } from 'jsdom';

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
  waitForSelector?: string;
  waitTime?: number;
  onProgress?: (current: number, total: number, url: string) => void;
}

export class EnhancedSiteCrawler {
  private visited = new Set<string>();
  private queue: string[] = [];
  private baseUrl: string;
  private results: CrawlResult[] = [];
  private browser: Browser | null = null;

  constructor(private startUrl: string, private options: CrawlerOptions = {}) {
    this.baseUrl = new URL(startUrl).origin;
    this.queue.push(startUrl);
  }

  async crawl(): Promise<CrawlResult[]> {
    const maxPages = this.options.maxPages ?? 100;

    try {
      // Launch browser once for all pages
      this.browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
        ],
      });

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
    } finally {
      if (this.browser) {
        await this.browser.close();
      }
    }
  }

  private async crawlPage(url: string): Promise<CrawlResult> {
    if (!this.browser) {
      throw new Error('Browser not initialized');
    }

    const page = await this.browser.newPage();

    try {
      // Set headers for crawler bypass
      const headers: Record<string, string> = {};
      if (process.env.CRAWLER_BYPASS_TOKEN) {
        headers['X-Crawler-Bypass'] = process.env.CRAWLER_BYPASS_TOKEN;
      }
      await page.setExtraHTTPHeaders(headers);

      // Set viewport
      await page.setViewport({ width: 1920, height: 1080 });

      // Navigate to page
      await page.goto(url, {
        waitUntil: 'networkidle2', // Wait for network to be idle
        timeout: 30000,
      });

      // Wait for specific selector if configured
      if (this.options.waitForSelector) {
        await page.waitForSelector(this.options.waitForSelector, {
          timeout: 10000,
        }).catch(() => {
          // Selector not found, continue anyway
        });
      }

      // Wait additional time for dynamic content
      if (this.options.waitTime) {
        await new Promise((resolve) => setTimeout(resolve, this.options.waitTime));
      } else {
        // Default wait for dynamic content to render
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }

      // Get the fully rendered HTML
      const html = await page.content();

      // Extract title and links using JSDOM (faster than Puppeteer for this)
      const dom = new JSDOM(html);
      const document = dom.window.document;

      const title =
        document.querySelector('h1')?.textContent?.trim() ||
        document.querySelector('title')?.textContent?.trim() ||
        url;

      const links: string[] = [];
      const anchorElements = document.querySelectorAll('a[href]');

      for (const anchor of Array.from(anchorElements)) {
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
    } finally {
      await page.close();
    }
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
