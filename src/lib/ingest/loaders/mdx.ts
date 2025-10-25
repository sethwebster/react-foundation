/**
 * MDX/Markdown Files Loader
 * Loads markdown files from public-context directory
 * Based on AUTO_INGESTION_SETUP.md specification
 */

import { readdir, readFile, stat } from 'fs/promises';
import { join } from 'path';
import matter from 'gray-matter';
import type { ContentLoader, RawRecord } from '../types';
import { logger } from '@/lib/logger';

/**
 * Recursively find all markdown files in a directory
 */
async function findMarkdownFiles(dir: string): Promise<string[]> {
  const files: string[] = [];

  try {
    const entries = await readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = join(dir, entry.name);

      if (entry.isDirectory()) {
        // Recurse into subdirectories
        const subFiles = await findMarkdownFiles(fullPath);
        files.push(...subFiles);
      } else if (entry.isFile() && /\.mdx?$/.test(entry.name)) {
        // Add markdown/mdx files
        files.push(fullPath);
      }
    }
  } catch (error) {
    logger.error(`Error reading directory ${dir}:`, error);
  }

  return files;
}

/**
 * Convert file path to URL path
 * Example: public-context/foundation/ris-system.md → /docs/foundation/ris-system
 */
function filePathToUrl(filePath: string, baseDir: string): string {
  // Remove baseDir prefix and .md extension
  let url = filePath.replace(baseDir, '').replace(/\.mdx?$/, '');

  // Convert to URL path
  url = `/docs${url}`;

  // Handle README files
  if (url.endsWith('/README')) {
    url = url.replace('/README', '');
  }

  // Ensure leading slash
  if (!url.startsWith('/')) {
    url = '/' + url;
  }

  return url;
}

/**
 * Generate unique ID from file path
 */
function generateId(filePath: string, baseDir: string): string {
  const relativePath = filePath.replace(baseDir, '').replace(/^\//, '');
  return relativePath.replace(/[\/\.]/g, '-').replace(/\.mdx?$/, '');
}

/**
 * Extract anchors from markdown content
 * Finds all ## headings and creates anchor links
 */
function extractAnchors(content: string): Array<{ text: string; anchor: string }> {
  const anchors: Array<{ text: string; anchor: string }> = [];
  const lines = content.split('\n');

  for (const line of lines) {
    // Match markdown headings: ## Heading Text
    const match = line.match(/^#{2,6}\s+(.+)$/);
    if (match) {
      const text = match[1].trim();
      // Generate anchor (lowercase, spaces to hyphens, remove special chars)
      const anchor = text
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-');

      anchors.push({ text, anchor: `#${anchor}` });
    }
  }

  return anchors;
}

export class MDXLoader implements ContentLoader {
  name = 'MDXLoader';

  constructor(private baseDir: string = '') {
    // Default to public-context directory
    if (!baseDir) {
      this.baseDir = join(process.cwd(), 'public-context');
    }
  }

  async load(): Promise<RawRecord[]> {
    logger.info(`[${this.name}] Loading markdown files from ${this.baseDir}`);

    const files = await findMarkdownFiles(this.baseDir);
    logger.info(`[${this.name}] Found ${files.length} markdown files`);

    const records: RawRecord[] = [];

    for (const filePath of files) {
      try {
        // Read file
        const fileContents = await readFile(filePath, 'utf8');
        const stats = await stat(filePath);

        // Parse frontmatter
        const { data: frontmatter, content } = matter(fileContents);

        // Generate ID and URL
        const id = generateId(filePath, this.baseDir);
        const url = filePathToUrl(filePath, this.baseDir);

        // Extract title (from frontmatter or first heading)
        let title = frontmatter.title || '';
        if (!title) {
          const titleMatch = content.match(/^#\s+(.+)$/m);
          title = titleMatch ? titleMatch[1].trim() : filePath.split('/').pop()?.replace(/\.mdx?$/, '') || id;
        }

        // Extract anchors
        const anchors = extractAnchors(content);

        // Create record
        const record: RawRecord = {
          id,
          type: frontmatter.type || 'page',
          title,
          url,
          updatedAt: stats.mtime.toISOString(),
          tags: {
            ...frontmatter,
            file_path: filePath,
          },
          body: content,
          anchors: anchors.length > 0 ? anchors : undefined,
        };

        records.push(record);
      } catch (error) {
        logger.error(`[${this.name}] Failed to load ${filePath}:`, error);
      }
    }

    logger.info(`[${this.name}] Loaded ${records.length} markdown files successfully`);
    return records;
  }
}
