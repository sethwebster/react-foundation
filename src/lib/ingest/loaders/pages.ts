/**
 * Pages Loader
 * Parses TSX files and extracts text content without rendering
 * Avoids client component issues while getting actual page text
 */

import { readFile } from 'fs/promises';
import { join } from 'path';
import type { ContentLoader, RawRecord } from '../types';
import { logger } from '@/lib/logger';

/**
 * Page configuration
 */
interface PageConfig {
  url: string;
  title: string;
  filePath: string; // Path to page.tsx file
}

const PAGES_TO_PARSE: PageConfig[] = [
  { url: '/', title: 'Home', filePath: 'src/app/page.tsx' },
  { url: '/about', title: 'About', filePath: 'src/app/about/page.tsx' },
  { url: '/impact', title: 'Impact', filePath: 'src/app/impact/page.tsx' },
  { url: '/store', title: 'Store', filePath: 'src/app/store/page.tsx' },
  { url: '/scoring', title: 'How Scoring Works', filePath: 'src/app/scoring/page.tsx' },
  { url: '/libraries', title: 'Libraries', filePath: 'src/app/libraries/page.tsx' },
  { url: '/communities', title: 'Communities', filePath: 'src/app/communities/page.tsx' },
];

/**
 * Extract text content from TSX source code
 * Finds string literals in JSX and component text content
 */
function extractTextFromTSX(source: string): string {
  const textPieces: string[] = [];

  // 1. Extract string literals (single and double quotes)
  // Match strings like "text" or 'text' but not imports/code
  const stringRegex = /(?:>|=\s*)["`']([^"`']{10,})["`']/g;
  let match;
  while ((match = stringRegex.exec(source)) !== null) {
    const text = match[1].trim();
    if (text && !text.includes('import') && !text.includes('className')) {
      textPieces.push(text);
    }
  }

  // 2. Extract JSX text content (text between tags)
  // Match: >Text content here<
  const jsxTextRegex = />\s*([A-Z][^<>{}\n]{10,})\s*</g;
  while ((match = jsxTextRegex.exec(source)) !== null) {
    const text = match[1].trim();
    if (text && !text.startsWith('import') && !text.includes('className')) {
      textPieces.push(text);
    }
  }

  // 3. Extract template literals (backticks)
  const templateRegex = /`([^`]{20,})`/g;
  while ((match = templateRegex.exec(source)) !== null) {
    const text = match[1].trim();
    if (text && !text.includes('import') && !text.includes('${')) {
      textPieces.push(text);
    }
  }

  // 4. Extract metadata strings (title, description)
  const metadataRegex = /(?:title|description):\s*["`']([^"`']+)["`']/g;
  while ((match = metadataRegex.exec(source)) !== null) {
    textPieces.push(match[1].trim());
  }

  // Join and deduplicate
  return [...new Set(textPieces)].join('\n\n');
}

/**
 * Recursively read imported component files
 */
async function extractFromComponentFile(filePath: string, basePath: string): Promise<string[]> {
  const texts: string[] = [];

  try {
    const fullPath = join(basePath, filePath);
    const source = await readFile(fullPath, 'utf-8');

    // Extract text from this file
    const text = extractTextFromTSX(source);
    if (text) {
      texts.push(text);
    }

    // Find component imports (local components, not libraries)
    const importRegex = /from\s+["']@\/components\/([^"']+)["']/g;
    let match;
    while ((match = importRegex.exec(source)) !== null) {
      const componentPath = `src/components/${match[1]}.tsx`;
      try {
        const componentTexts = await extractFromComponentFile(componentPath, basePath);
        texts.push(...componentTexts);
      } catch (err) {
        // Component file might not exist or already processed
      }
    }
  } catch (error) {
    // File not found or error reading - skip
  }

  return texts;
}

export class PagesLoader implements ContentLoader {
  name = 'PagesLoader';

  async load(): Promise<RawRecord[]> {
    logger.info(`[${this.name}] Parsing ${PAGES_TO_PARSE.length} TSX page files`);

    const records: RawRecord[] = [];
    const basePath = process.cwd();

    for (const pageConfig of PAGES_TO_PARSE) {
      try {
        logger.info(`[${this.name}] Parsing ${pageConfig.filePath}...`);

        // Read and extract from page file and its components
        const texts = await extractFromComponentFile(pageConfig.filePath, basePath);
        const body = texts.join('\n\n');

        logger.info(`[${this.name}]   Extracted ${body.length} chars from ${texts.length} sources`);

        if (!body || body.length < 100) {
          logger.warn(`[${this.name}] Little content extracted from ${pageConfig.url} (${body.length} chars)`);
          continue;
        }

        // Create record
        const record: RawRecord = {
          id: `page${pageConfig.url.replace(/\//g, '-') || '-home'}`,
          type: 'page',
          title: pageConfig.title,
          url: pageConfig.url,
          updatedAt: new Date().toISOString(),
          tags: {
            source: 'tsx-parsed',
            file: pageConfig.filePath,
          },
          body,
        };

        records.push(record);

        logger.info(`[${this.name}] ✅ ${pageConfig.title}: ${body.length} chars`);
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        logger.error(`[${this.name}] Failed to parse ${pageConfig.url}: ${errorMsg}`);
      }
    }

    logger.info(`[${this.name}] Loaded ${records.length} parsed pages successfully`);
    return records;
  }
}
