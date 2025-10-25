/**
 * Pages Loader
 * Fetches rendered HTML from live site and extracts text content
 * Leverages Next.js's SSR/RSC - pages are already rendered!
 */

import { parseHTML } from 'linkedom';
import type { ContentLoader, RawRecord } from '../types';
import { logger } from '@/lib/logger';

interface PageConfig {
  url: string;
  title: string;
}

const PAGES: PageConfig[] = [
  { url: '/', title: 'Home' },
  { url: '/about', title: 'About' },
  { url: '/impact', title: 'Impact' },
  { url: '/store', title: 'Store' },
  { url: '/scoring', title: 'How Scoring Works' },
  { url: '/libraries', title: 'Libraries' },
  { url: '/communities', title: 'Communities' },
];

/**
 * Fetch rendered HTML from the site
 */
async function fetchPage(url: string, baseUrl: string): Promise<string> {
  const fullUrl = `${baseUrl}${url}`;

  // Add bypass header if configured (for access control)
  const headers: HeadersInit = {};
  if (process.env.CRAWLER_BYPASS_TOKEN) {
    headers['X-Crawler-Bypass'] = process.env.CRAWLER_BYPASS_TOKEN;
  }

  const response = await fetch(fullUrl, {
    headers,
    // Use a timeout to prevent hanging
    signal: AbortSignal.timeout(15000),
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  return response.text();
}

/**
 * Extract text content from HTML
 */
function extractText(html: string): string {
  const { document } = parseHTML(html);

  // Remove unwanted elements
  const removeSelectors = [
    'script',
    'style',
    'nav',
    'header',
    'footer',
    '[aria-hidden="true"]',
    '.sr-only',
    '#support-chat-panel', // Remove chatbot
  ];

  removeSelectors.forEach(selector => {
    document.querySelectorAll(selector).forEach((el: Element) => el.remove());
  });

  // Get main content
  const main = document.querySelector('main') || document.body;
  let text = main?.textContent || '';

  // Clean whitespace
  text = text.replace(/\s+/g, ' ').trim();

  return text;
}

/**
 * Extract headings for anchors
 */
function extractAnchors(html: string): Array<{ text: string; anchor: string }> {
  const { document } = parseHTML(html);
  const anchors: Array<{ text: string; anchor: string }> = [];

  document.querySelectorAll('h2, h3').forEach((heading: Element) => {
    const text = heading.textContent?.trim();
    const id = heading.getAttribute('id');

    if (text && id) {
      anchors.push({ text, anchor: `#${id}` });
    } else if (text) {
      // Generate anchor from text
      const anchor = text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
      anchors.push({ text, anchor: `#${anchor}` });
    }
  });

  return anchors;
}

export class PagesLoader implements ContentLoader {
  name = 'PagesLoader';

  async load(): Promise<RawRecord[]> {
    const records: RawRecord[] = [];

    // Get base URL - use production site or localhost
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ||
                    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');

    logger.info(`[${this.name}] Fetching ${PAGES.length} pages from ${baseUrl}`);

    for (const page of PAGES) {
      try {
        logger.info(`[${this.name}] Fetching ${page.url}...`);

        // Fetch rendered HTML
        const html = await fetchPage(page.url, baseUrl);
        logger.info(`[${this.name}]   Fetched ${html.length} chars of HTML`);

        // Extract text content
        const body = extractText(html);
        logger.info(`[${this.name}]   Extracted ${body.length} chars of text`);

        if (body.length < 100) {
          logger.warn(`[${this.name}] Skipping ${page.url} - insufficient content (${body.length} chars)`);
          continue;
        }

        // Extract anchors
        const anchors = extractAnchors(html);

        records.push({
          id: `page-${page.url.replace(/\//g, '-') || 'home'}`,
          type: 'page',
          title: page.title,
          url: page.url,
          updatedAt: new Date().toISOString(),
          tags: { source: 'live-site' },
          body,
          anchors: anchors.length > 0 ? anchors : undefined,
        });

        logger.info(`[${this.name}] ✅ ${page.title}: ${body.length} chars, ${anchors.length} anchors`);
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        logger.error(`[${this.name}] Failed ${page.url}: ${errorMsg}`);
        // Continue with other pages
      }
    }

    logger.info(`[${this.name}] Loaded ${records.length} pages successfully`);
    return records;
  }
}
