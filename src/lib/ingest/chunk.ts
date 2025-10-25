/**
 * Chunking Utility
 * Breaks text into overlapping chunks for embedding
 * Based on AUTO_INGESTION_SETUP.md specification
 */

export interface ChunkOptions {
  targetTokens?: number; // Target size in words (approximates tokens)
  overlapTokens?: number; // Overlap size in words
}

/**
 * Chunk text into overlapping segments
 *
 * @param text - Text to chunk
 * @param options - Chunking options
 * @returns Array of text chunks
 *
 * Algorithm:
 * - Split into words
 * - Take chunks of target size
 * - Overlap by overlap size to maintain context
 */
export function chunkText(
  text: string,
  options: ChunkOptions = {}
): string[] {
  const targetTokens = options.targetTokens ?? 950; // ~950 tokens default
  const overlapTokens = options.overlapTokens ?? 100; // ~100 token overlap

  const words = text.split(/\s+/).filter(w => w.length > 0);

  if (words.length === 0) {
    return [];
  }

  // If text is smaller than target, return as single chunk
  if (words.length <= targetTokens) {
    return [words.join(' ')];
  }

  const chunks: string[] = [];

  for (let i = 0; i < words.length; ) {
    // Take slice of target size
    const slice = words.slice(i, i + targetTokens);
    chunks.push(slice.join(' '));

    // Move forward by (target - overlap) to create overlap
    i += targetTokens - overlapTokens;

    // Prevent infinite loop if overlap >= target
    if (targetTokens <= overlapTokens) {
      i = words.length; // Force exit
    }
  }

  return chunks;
}

/**
 * Estimate token count (rough approximation)
 * Real tokens would require a tokenizer, but words are close enough
 *
 * @param text - Text to estimate
 * @returns Approximate token count
 */
export function estimateTokens(text: string): number {
  // Rough estimate: 1 token ≈ 0.75 words (or 4 characters)
  const words = text.split(/\s+/).filter(w => w.length > 0);
  return Math.ceil(words.length * 1.33); // Convert words to approx tokens
}

/**
 * Validate chunk size
 *
 * @param chunk - Text chunk
 * @param maxTokens - Maximum allowed tokens
 * @returns True if chunk is within limits
 */
export function isValidChunkSize(chunk: string, maxTokens: number = 2000): boolean {
  const estimatedTokens = estimateTokens(chunk);
  return estimatedTokens <= maxTokens;
}
