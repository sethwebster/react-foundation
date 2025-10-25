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
 * Examples:
 *   public-context/foundation/ris-system.md → /docs/foundation/ris-system
 *   content/updates/welcome.mdx → /updates/welcome
 *   src/app/communities/start/page.mdx → /communities/start
 */
function filePathToUrl(filePath: string, baseDir: string): string {
  // Remove baseDir prefix and .md/.mdx extension
  let url = filePath.replace(baseDir, '').replace(/\.mdx?$/, '');

  // Determine URL prefix based on base directory
  if (baseDir.includes('public-context')) {
    // public-context files go to /docs
    url = `/docs${url}`;
  } else if (baseDir.includes('src/app')) {
    // src/app files map to their route
    // Remove /page suffix if present
    url = url.replace(/\/page$/, '');

    // Ensure leading slash
    if (!url.startsWith('/')) {
      url = '/' + url;
    }
  } else if (baseDir.includes('content')) {
    // content directory maps directly (e.g., content/updates → /updates)
    if (!url.startsWith('/')) {
      url = '/' + url;
    }
  } else {
    // Default behavior for other directories
    url = `/docs${url}`;
  }

  // Handle README files
  if (url.endsWith('/README')) {
    url = url.replace('/README', '');
  }

  // Handle root readme
  if (url === '/docs/') {
    url = '/docs';
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

  constructor(private baseDirs: string[] = []) {
    // Default to repo-wide search
    if (!baseDirs || baseDirs.length === 0) {
      const cwd = process.cwd();
      this.baseDirs = [
        join(cwd, 'public-context'),  // Original directory
        join(cwd, 'content'),          // Content directory (updates, etc.)
        join(cwd, 'src/app'),          // App routes (MDX pages)
      ];
    }
  }

  async load(): Promise<RawRecord[]> {
    logger.info(`[${this.name}] Loading markdown files from ${this.baseDirs.length} directories`);

    const allFiles: string[] = [];
    for (const baseDir of this.baseDirs) {
      logger.info(`[${this.name}] Scanning ${baseDir}...`);
      const files = await findMarkdownFiles(baseDir);
      logger.info(`[${this.name}] Found ${files.length} files in ${baseDir}`);
      allFiles.push(...files);
    }

    logger.info(`[${this.name}] Found ${allFiles.length} total markdown files`);

    const records: RawRecord[] = [];

    for (const filePath of allFiles) {
      try {
        // Read file
        const fileContents = await readFile(filePath, 'utf8');
        const stats = await stat(filePath);

        // Parse frontmatter (supports both YAML and Next.js export const metadata)
        let frontmatter: Record<string, unknown> = {};
        let content = fileContents;

        // Try parsing YAML frontmatter first
        const matterResult = matter(fileContents);
        if (Object.keys(matterResult.data).length > 0) {
          frontmatter = matterResult.data;
          content = matterResult.content;
        } else {
          // Check for Next.js style metadata export
          const metadataMatch = fileContents.match(/export\s+const\s+metadata\s+=\s+\{([^\}]+)\}/);
          if (metadataMatch) {
            try {
              // Simple parser for key-value pairs
              const metadataContent = metadataMatch[1];
              const lines = metadataContent.split(',');

              for (const line of lines) {
                const match = line.trim().match(/^(\w+):\s*['"](.+?)['"]$/);
                if (match) {
                  const [, key, value] = match;
                  frontmatter[key] = value;
                }
              }


              // Remove the metadata export from content for cleaner indexing
              content = fileContents.replace(/export\s+const\s+metadata\s+=\s+\{[\s\S]*?\n\};?\n*/m, '');
            } catch (e) {
              logger.warn(`[${this.name}] Failed to parse metadata from ${filePath}:`, e);
            }
          }

          // Remove import statements from MDX files for cleaner content
          content = content.replace(/^import\s+.+?from\s+['"ޅ].+?['"];?\n*/gm, '');
        }

        // Determine which base directory this file belongs to
        const baseDir = this.baseDirs.find(dir => filePath.startsWith(dir)) || this.baseDirs[0];

        // Generate ID and URL
        const id = generateId(filePath, baseDir);
        const url = filePathToUrl(filePath, baseDir);

        // Extract title (from frontmatter/metadata or first heading)
        let title = (frontmatter.title as string) || '';
        if (!title) {
          const titleMatch = content.match(/^#\s+(.+)$/m);
          title = titleMatch ? titleMatch[1].trim() : filePath.split('/').pop()?.replace(/\.mdx?$/, '') || id;
        }

        // Extract anchors
        const anchors = extractAnchors(content);

        // Create record
        const record: RawRecord = {
          id,
          type: (typeof frontmatter.type === 'string' ? frontmatter.type : null) || 'page',
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
