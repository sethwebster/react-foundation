/**
 * File-based Content Ingestion
 * Ingests markdown/text files from public-context directory
 */

import { readdir, readFile } from 'fs/promises';
import { join } from 'path';
import { ContentExtractor, type ContentChunk } from './content-extractor';
import { logger } from '../logger';

export interface FileIngestionResult {
  filePath: string;
  title: string;
  content: string;
  chunks: ContentChunk[];
}

export class FileIngester {
  private extractor: ContentExtractor;

  constructor() {
    this.extractor = new ContentExtractor({
      maxChunkSize: 1000,
      overlapSize: 200,
    });
  }

  /**
   * Ingest all files from public-context directory
   */
  async ingestPublicContext(): Promise<FileIngestionResult[]> {
    const contextDir = join(process.cwd(), 'public-context');
    const results: FileIngestionResult[] = [];

    try {
      const files = await this.discoverFiles(contextDir);
      logger.info(`Found ${files.length} files in public-context`);

      for (const filePath of files) {
        try {
          const result = await this.ingestFile(filePath);
          results.push(result);
        } catch (error) {
          logger.error(`Failed to ingest ${filePath}:`, error);
        }
      }

      return results;
    } catch (error) {
      logger.error('Failed to ingest public-context:', error);
      return results;
    }
  }

  /**
   * Discover all markdown and text files recursively
   */
  private async discoverFiles(dir: string): Promise<string[]> {
    const files: string[] = [];

    try {
      const entries = await readdir(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = join(dir, entry.name);

        if (entry.isDirectory()) {
          // Recurse into subdirectories
          const subFiles = await this.discoverFiles(fullPath);
          files.push(...subFiles);
        } else if (entry.isFile()) {
          // Include markdown and text files
          if (
            entry.name.endsWith('.md') ||
            entry.name.endsWith('.txt') ||
            entry.name.endsWith('.mdx')
          ) {
            files.push(fullPath);
          }
        }
      }
    } catch (error) {
      // Directory might not exist, that's okay
      logger.warn(`Could not read directory ${dir}:`, error);
    }

    return files;
  }

  /**
   * Ingest a single file
   */
  private async ingestFile(filePath: string): Promise<FileIngestionResult> {
    const content = await readFile(filePath, 'utf-8');

    // Extract title from first heading or filename
    const title = this.extractTitle(content, filePath);

    // Convert file path to URL-like source path
    const sourcePath = this.filePathToSource(filePath);

    // Chunk the content
    const chunks = this.extractor.chunkContent(content, sourcePath, title);

    logger.info(`Ingested ${filePath}: ${chunks.length} chunks`);

    return {
      filePath,
      title,
      content,
      chunks,
    };
  }

  /**
   * Extract title from markdown content or filename
   */
  private extractTitle(content: string, filePath: string): string {
    // Try to find first # heading
    const match = content.match(/^#\s+(.+)$/m);
    if (match) {
      return match[1].trim();
    }

    // Fallback to filename
    const basename = filePath.split('/').pop() || filePath;
    return basename.replace(/\.(md|txt|mdx)$/, '');
  }

  /**
   * Convert file path to source path for citations
   * Example: /path/to/public-context/faq.md -> /context/faq
   */
  private filePathToSource(filePath: string): string {
    // Get relative path from public-context directory
    const contextDir = join(process.cwd(), 'public-context');
    const relativePath = filePath.replace(contextDir, '');

    // Remove leading slash and extension
    const cleaned = relativePath
      .replace(/^\//, '')
      .replace(/\.(md|txt|mdx)$/, '');

    return `/context/${cleaned}`;
  }
}
