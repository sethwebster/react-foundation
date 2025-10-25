/**
 * Embedding Utility
 * Generates vector embeddings using OpenAI API
 * Based on AUTO_INGESTION_SETUP.md specification
 */

import { getChatbotEnv } from '../chatbot/env';
import { logger } from '../logger';

/**
 * Generate embeddings for multiple texts in batch
 *
 * @param texts - Array of text strings to embed
 * @returns Array of Float32Array embeddings
 */
export async function generateEmbeddings(texts: string[]): Promise<Float32Array[]> {
  if (texts.length === 0) {
    return [];
  }

  const env = getChatbotEnv();

  try {
    // Dynamic import OpenAI to avoid bundling in client
    const { default: OpenAI } = await import('openai');
    const openai = new OpenAI({ apiKey: env.openaiApiKey });

    // OpenAI allows up to 2048 inputs per request
    const batchSize = 2048;
    const allEmbeddings: Float32Array[] = [];

    for (let i = 0; i < texts.length; i += batchSize) {
      const batch = texts.slice(i, i + batchSize);

      logger.info(`Generating embeddings for ${batch.length} texts (batch ${Math.floor(i / batchSize) + 1})`);

      const response = await openai.embeddings.create({
        model: env.embeddingModel,
        input: batch,
      });

      // Convert to Float32Array
      const embeddings = response.data.map(item => new Float32Array(item.embedding));
      allEmbeddings.push(...embeddings);

      // Small delay between batches to avoid rate limits
      if (i + batchSize < texts.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    return allEmbeddings;
  } catch (error) {
    logger.error('Failed to generate embeddings:', error);
    throw error;
  }
}

/**
 * Generate single embedding (convenience wrapper)
 *
 * @param text - Text to embed
 * @returns Float32Array embedding
 */
export async function generateEmbedding(text: string): Promise<Float32Array> {
  const embeddings = await generateEmbeddings([text]);
  return embeddings[0];
}

/**
 * Convert Float32Array to Buffer for Redis storage
 *
 * @param embedding - Float32Array embedding
 * @returns Buffer
 */
export function embeddingToBuffer(embedding: Float32Array): Buffer {
  return Buffer.from(embedding.buffer);
}

/**
 * Convert Buffer back to Float32Array
 *
 * @param buffer - Buffer from Redis
 * @returns Float32Array embedding
 */
export function bufferToEmbedding(buffer: Buffer): Float32Array {
  return new Float32Array(buffer.buffer, buffer.byteOffset, buffer.byteLength / 4);
}
