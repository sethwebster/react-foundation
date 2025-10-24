/**
 * Content Extractor
 * Extracts main content from HTML and chunks it for embedding
 */

import { JSDOM } from 'jsdom';

export interface ContentChunk {
  id: string;
  source: string;
  title: string;
  content: string;
  chunkIndex: number;
}

export interface ExtractionOptions {
  maxChunkSize?: number;
  overlapSize?: number;
  removeSelectors?: string[];
}

export class ContentExtractor {
  private options: Required<ExtractionOptions>;

  constructor(options: ExtractionOptions = {}) {
    this.options = {
      maxChunkSize: options.maxChunkSize ?? 1000,
      overlapSize: options.overlapSize ?? 200,
      removeSelectors: options.removeSelectors ?? [
        'script',
        'style',
        'nav',
        'header',
        'footer',
        '.navigation',
        '#navigation',
        '.menu',
        '#menu',
        '.sidebar',
        '#sidebar',
      ],
    };
  }

  extractContent(html: string, url: string): string {
    const dom = new JSDOM(html);
    const document = dom.window.document;

    // Remove unwanted elements
    for (const selector of this.options.removeSelectors) {
      const elements = document.querySelectorAll(selector);
      elements.forEach((el) => el.remove());
    }

    // Try to find main content
    const mainContent =
      document.querySelector('main') ||
      document.querySelector('article') ||
      document.querySelector('[role="main"]') ||
      document.querySelector('.content') ||
      document.querySelector('#content') ||
      document.body;

    if (!mainContent) {
      return '';
    }

    // Get text content and clean it up
    let text = mainContent.textContent || '';

    // Normalize whitespace
    text = text
      .replace(/\s+/g, ' ')
      .replace(/\n\s*\n/g, '\n')
      .trim();

    return text;
  }

  chunkContent(
    content: string,
    url: string,
    title: string
  ): ContentChunk[] {
    if (!content) return [];

    const chunks: ContentChunk[] = [];
    const sentences = this.splitIntoSentences(content);

    let currentChunk = '';
    let chunkIndex = 0;

    // Extract clean path for source field
    const sourcePath = ContentExtractor.extractPath(url);

    for (const sentence of sentences) {
      // If adding this sentence would exceed max size, save current chunk
      if (
        currentChunk.length + sentence.length > this.options.maxChunkSize &&
        currentChunk.length > 0
      ) {
        chunks.push(this.createChunk(currentChunk, sourcePath, title, chunkIndex));
        chunkIndex++;

        // Start new chunk with overlap from previous
        currentChunk = this.getOverlap(currentChunk) + sentence;
      } else {
        currentChunk += (currentChunk ? ' ' : '') + sentence;
      }
    }

    // Add remaining content
    if (currentChunk.trim()) {
      chunks.push(this.createChunk(currentChunk, sourcePath, title, chunkIndex));
    }

    return chunks;
  }

  private splitIntoSentences(text: string): string[] {
    // Simple sentence splitting (can be improved with NLP library)
    return text
      .split(/[.!?]+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
  }

  private getOverlap(text: string): string {
    if (text.length <= this.options.overlapSize) {
      return text;
    }

    // Get last N characters, then find sentence boundary
    const overlap = text.slice(-this.options.overlapSize);
    const sentenceStart = overlap.search(/[.!?]\s+/);

    if (sentenceStart === -1) {
      return overlap;
    }

    return overlap.slice(sentenceStart + 2);
  }

  private createChunk(
    content: string,
    sourcePath: string,
    title: string,
    chunkIndex: number
  ): ContentChunk {
    // Generate ID from the original URL stored in sourcePath
    // For ID generation, we want to use the path part only
    const id = this.generateChunkId(`http://example.com${sourcePath}`, chunkIndex);

    return {
      id,
      source: sourcePath, // Store just the path, not full URL
      title,
      content: content.trim(),
      chunkIndex,
    };
  }

  private generateChunkId(url: string, chunkIndex: number): string {
    // Create a deterministic ID based on URL and chunk index
    const urlPath = new URL(url).pathname.replace(/\//g, '_') || 'home';
    return `${urlPath}_chunk_${chunkIndex}`.replace(/^_/, ''); // Remove leading underscore
  }

  /**
   * Extract clean path from URL for storage
   * Converts URL to path format expected by chatbot citation filter
   */
  static extractPath(url: string): string {
    try {
      const urlObj = new URL(url);
      // Return just the pathname, or 'home' for root
      return urlObj.pathname === '/' ? '/home' : urlObj.pathname;
    } catch {
      return url;
    }
  }
}
