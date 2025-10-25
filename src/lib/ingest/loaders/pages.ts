/**
 * Pages Loader
 * Renders Next.js Server Components and extracts content
 * Leverages RSC to get actual rendered content with dynamic data
 */

import React from 'react';
import { parseHTML } from 'linkedom';
import type { ContentLoader, RawRecord } from '../types';
import { logger } from '@/lib/logger';

// Import page components (they're Server Components)
import HomePage from '@/app/page';
import AboutPage from '@/app/about/page';
import ImpactPage from '@/app/impact/page';
import StorePage from '@/app/store/page';
import ScoringPage from '@/app/scoring/page';

/**
 * Page configuration - maps routes to components
 */
interface PageConfig {
  url: string;
  title: string;
  component: () => Promise<React.ReactElement> | React.ReactElement;
  type?: string;
}

const PAGES_TO_CRAWL: PageConfig[] = [
  { url: '/', title: 'Home', component: HomePage },
  { url: '/about', title: 'About', component: AboutPage },
  { url: '/impact', title: 'Impact', component: ImpactPage },
  { url: '/store', title: 'Store', component: StorePage },
  { url: '/scoring', title: 'How Scoring Works', component: ScoringPage },
];

/**
 * Render a React Server Component to HTML string
 */
async function renderComponentToHTML(
  Component: () => Promise<React.ReactElement> | React.ReactElement
): Promise<string> {
  try {
    // For async server components
    const element = await Promise.resolve(Component());

    // Use React's renderToStaticMarkup for server rendering
    const { renderToStaticMarkup } = await import('react-dom/server');
    const html = renderToStaticMarkup(element);

    return html;
  } catch (error) {
    logger.error('[PagesLoader] Failed to render component:', error);
    throw error;
  }
}

/**
 * Extract text content from rendered HTML
 * Removes scripts, styles, nav, footer - keeps main content
 */
function extractTextContent(html: string): string {
  const { document } = parseHTML(html);

  // Remove unwanted elements
  const removeSelectors = [
    'script',
    'style',
    'nav',
    'header',
    'footer',
    '[role="navigation"]',
    '[aria-hidden="true"]',
    '.sr-only',
  ];

  for (const selector of removeSelectors) {
    const elements = document.querySelectorAll(selector);
    elements.forEach((el: Element) => el.remove());
  }

  // Get main content
  const mainContent =
    document.querySelector('main') ||
    document.querySelector('[role="main"]') ||
    document.body;

  if (!mainContent) {
    return '';
  }

  // Extract text
  let text = mainContent.textContent || '';

  // Clean up whitespace
  text = text
    .replace(/\s+/g, ' ')
    .replace(/\n\s*\n/g, '\n')
    .trim();

  return text;
}

/**
 * Extract headings from HTML for anchor generation
 */
function extractAnchors(html: string): Array<{ text: string; anchor: string }> {
  const { document } = parseHTML(html);
  const anchors: Array<{ text: string; anchor: string }> = [];

  // Find all h2-h6 headings (skip h1 which is usually page title)
  const headings = document.querySelectorAll('h2, h3, h4, h5, h6');

  for (const heading of Array.from(headings) as HTMLElement[]) {
    const text = heading.textContent?.trim();
    if (!text) continue;

    // Generate anchor (lowercase, spaces to hyphens, remove special chars)
    const anchor = text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-');

    anchors.push({ text, anchor: `#${anchor}` });
  }

  return anchors;
}

export class PagesLoader implements ContentLoader {
  name = 'PagesLoader';

  async load(): Promise<RawRecord[]> {
    logger.info(`[${this.name}] Rendering and extracting ${PAGES_TO_CRAWL.length} pages`);

    const records: RawRecord[] = [];

    for (const pageConfig of PAGES_TO_CRAWL) {
      try {
        logger.info(`[${this.name}] Rendering ${pageConfig.url}...`);

        // Render the server component to HTML
        const html = await renderComponentToHTML(pageConfig.component);

        // Extract text content
        const body = extractTextContent(html);

        if (!body || body.length < 100) {
          logger.warn(`[${this.name}] Little content extracted from ${pageConfig.url}`);
          continue;
        }

        // Extract anchors from headings
        const anchors = extractAnchors(html);

        // Create record
        const record: RawRecord = {
          id: `page${pageConfig.url.replace(/\//g, '-') || '-home'}`,
          type: pageConfig.type || 'page',
          title: pageConfig.title,
          url: pageConfig.url,
          updatedAt: new Date().toISOString(),
          tags: {
            source: 'tsx-rendered',
            route: pageConfig.url,
          },
          body,
          anchors: anchors.length > 0 ? anchors : undefined,
        };

        records.push(record);

        logger.info(`[${this.name}] ✅ ${pageConfig.title}: ${body.length} chars, ${anchors.length} anchors`);
      } catch (error) {
        logger.error(`[${this.name}] Failed to render ${pageConfig.url}:`, error);
        // Continue with other pages even if one fails
      }
    }

    logger.info(`[${this.name}] Loaded ${records.length} rendered pages successfully`);
    return records;
  }
}
