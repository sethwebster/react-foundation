import type Redis from 'ioredis';
import { getChatbotEnv, getEmbeddingDimensions } from './env';

export interface VectorSearchResult {
  id: string;
  score: number;
  content: string;
  source: string;
}

export interface VectorSearchOptions {
  k?: number;
  minScore?: number;
}

function getEnv() {
  return getChatbotEnv();
}

export function ensureVectorIndex(redis: Redis, dimensions: number): Promise<unknown> {
  const env = getEnv();
  const algorithmParams: (string | number)[] = [
    'TYPE',
    'FLOAT32',
    'DIM',
    dimensions,
    'DISTANCE_METRIC',
    'COSINE',
    'INITIAL_CAP',
    2000,
    'M',
    16,
    'EF_CONSTRUCTION',
    200,
    'EF_RUNTIME',
    10,
  ];

  return redis.call(
    'FT.CREATE',
    env.redisIndex,
    'ON',
    'HASH',
    'PREFIX',
    '1',
    env.redisPrefix,
    'SCHEMA',
    'id',
    'TEXT',
    'source',
    'TEXT',
    'content',
    'TEXT',
    'embedding',
    'VECTOR',
    'HNSW',
    algorithmParams.length.toString(),
    ...algorithmParams.map((value) => value.toString())
  );
}

export async function ensureVectorIndexIfMissing(redis: Redis): Promise<void> {
  const env = getEnv();
  const dimensions = getEmbeddingDimensions(env.embeddingModel);

  try {
    await redis.call('FT.INFO', env.redisIndex);
  } catch (error) {
    const message = error instanceof Error ? error.message : '';
    const missing =
      message.includes('Unknown Index name') ||
      message.includes('no such index') ||
      message.includes('Unknown index');

    if (!missing) {
      throw error;
    }

    await ensureVectorIndex(redis, dimensions);
  }
}

export function embeddingToBuffer(embedding: number[]): Buffer {
  const array = new Float32Array(embedding);
  return Buffer.from(array.buffer, array.byteOffset, array.byteLength);
}

export function bufferToEmbedding(buffer: Buffer): number[] {
  const floatArray = new Float32Array(buffer.buffer, buffer.byteOffset, buffer.byteLength / Float32Array.BYTES_PER_ELEMENT);
  return Array.from(floatArray);
}

export async function upsertChunk(redis: Redis, id: string, payload: { content: string; source: string; embedding: number[] }): Promise<void> {
  const env = getEnv();
  const key = `${env.redisPrefix}${id}`;

  await redis.hset(
    key,
    'id',
    id,
    'content',
    payload.content,
    'source',
    payload.source,
    'embedding',
    embeddingToBuffer(payload.embedding)
  );
}

export async function deleteChunks(redis: Redis, ids: string[]): Promise<void> {
  const env = getEnv();
  if (!ids.length) return;
  const keys = ids.map((id) => `${env.redisPrefix}${id}`);
  await redis.del(keys);
}

export async function searchSimilar(redis: Redis, embedding: number[], options: VectorSearchOptions = {}): Promise<VectorSearchResult[]> {
  const env = getEnv();
  const k = options.k ?? 5;
  const minScore = options.minScore ?? 0;
  const vectorBuffer = embeddingToBuffer(embedding);
  const query = `*=>[KNN ${k} @embedding $vector AS score]`;

  const args: (string | number | Buffer)[] = [
    env.redisIndex,
    query,
    'PARAMS',
    '2',
    'vector',
    vectorBuffer,
    'SORTBY',
    'score',
    'RETURN',
    '4',
    'score',
    'content',
    'source',
    'id',
    'DIALECT',
    '2',
  ];

  const raw = (await redis.call('FT.SEARCH', ...args)) as unknown;

  if (!Array.isArray(raw)) {
    return [];
  }

  return parseSearchResults(raw, minScore);
}

function parseSearchResults(data: unknown[], minScore: number): VectorSearchResult[] {
  if (!Array.isArray(data)) return [];
  const [, ...rest] = data;
  const results: VectorSearchResult[] = [];

  for (let i = 0; i < rest.length; i += 2) {
    const key = rest[i];
    const fields = rest[i + 1];
    if (typeof key !== 'string' || !Array.isArray(fields)) continue;

    let id = key;
    let score = 0;
    let content = '';
    let source = '';

    for (let j = 0; j < fields.length; j += 2) {
      const field = fields[j];
      const value = fields[j + 1];
      if (field === 'score' && typeof value === 'string') {
        score = Number.parseFloat(value);
      } else if (field === 'content' && typeof value === 'string') {
        content = value;
      } else if (field === 'source' && typeof value === 'string') {
        source = value;
      } else if (field === 'id' && typeof value === 'string') {
        id = value;
      }
    }

    if (score >= minScore) {
      results.push({ id, score, content, source });
    }
  }

  return results;
}
