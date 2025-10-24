#!/usr/bin/env tsx
import { readFile, readdir, access } from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import matter from 'gray-matter';
import OpenAI from 'openai';
import { closeRedisClient, getRedisClient } from '../src/lib/redis';
import { ensureVectorIndexIfMissing, upsertChunk } from '../src/lib/chatbot/vector-store';
import { getChatbotEnv } from '../src/lib/chatbot/env';
import { getEmbeddingModel } from '../src/lib/chatbot/openai';
import { logger } from '../src/lib/logger';

interface SourceDocument {
  path: string;
  text: string;
}

interface ChunkPayload {
  id: string;
  content: string;
  source: string;
}

const CONTENT_ROOTS = ['content', 'data', 'public-context'];
const SINGLE_FILES = ['README.md'];
const SUPPORTED_EXTENSIONS = new Set(['.md', '.mdx', '.mdoc', '.txt']);
const MAX_CHARS_PER_CHUNK = 1200;
const CHUNK_OVERLAP = 150;
const BATCH_SIZE = 16;

async function collectDocuments(rootDir: string): Promise<SourceDocument[]> {
  const entries = await readdir(rootDir, { withFileTypes: true });
  const results: SourceDocument[] = [];

  for (const entry of entries) {
    const fullPath = path.join(rootDir, entry.name);

    if (entry.isDirectory()) {
      const child = await collectDocuments(fullPath);
      results.push(...child);
      continue;
    }

    if (!SUPPORTED_EXTENSIONS.has(path.extname(entry.name))) {
      continue;
    }

    const raw = await readFile(fullPath, 'utf-8');
    const parsed = matter(raw);
    const clean = stripMarkdown(parsed.content);
    if (!clean.trim()) {
      continue;
    }

    results.push({
      path: fullPath,
      text: clean,
    });
  }

  return results;
}

function stripMarkdown(input: string): string {
  return input
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`[^`]*`/g, ' ')
    .replace(/!\[[^\]]*]\([^)]*\)/g, ' ')
    .replace(/\[[^\]]*]\([^)]*\)/g, ' ')
    .replace(/[*_~>#-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function chunkDocument(doc: SourceDocument): ChunkPayload[] {
  const chunks: ChunkPayload[] = [];
  const text = doc.text;
  let index = 0;

  while (index < text.length) {
    const chunk = text.slice(index, index + MAX_CHARS_PER_CHUNK);
    const content = chunk.trim();
    if (content) {
      const id = createHash('sha256').update(`${doc.path}-${index}`).digest('hex').slice(0, 32);
      chunks.push({
        id,
        content,
        source: path.relative(process.cwd(), doc.path),
      });
    }

    if (index + MAX_CHARS_PER_CHUNK >= text.length) {
      break;
    }

    index += MAX_CHARS_PER_CHUNK - CHUNK_OVERLAP;
  }

  return chunks;
}

async function collectAppRouteDocuments(): Promise<SourceDocument[]> {
  const appDir = path.join(process.cwd(), 'src', 'app');
  if (!(await pathExists(appDir))) {
    return [];
  }

  const excludedSegments = new Set(['admin']);
  const documents: SourceDocument[] = [];

  async function traverse(currentDir: string) {
    const entries = await readdir(currentDir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      if (entry.isDirectory()) {
        const relativeSegments = path.relative(appDir, fullPath).split(path.sep);
        if (relativeSegments.some((segment) => excludedSegments.has(segment))) {
          continue;
        }
        await traverse(fullPath);
        continue;
      }

      if (entry.name === 'page.tsx' || entry.name === 'page.ts') {
        const raw = await readFile(fullPath, 'utf-8');
        const clean = stripMarkdown(raw);
        if (!clean.trim()) continue;
        documents.push({
          path: path.relative(process.cwd(), fullPath),
          text: clean,
        });
      }
    }
  }

  await traverse(appDir);
  return documents;
}

async function embedChunks(chunks: ChunkPayload[], openai: OpenAI) {
  const model = getEmbeddingModel();
  const embeddings: number[][] = [];

  for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
    const batch = chunks.slice(i, i + BATCH_SIZE);
    const response = await openai.embeddings.create({
      model,
      input: batch.map((item) => item.content),
    });

    embeddings.push(...response.data.map((entry) => entry.embedding));
  }

  if (embeddings.length !== chunks.length) {
    throw new Error('Embedding count mismatch');
  }

  return embeddings;
}

async function pathExists(target: string): Promise<boolean> {
  try {
    await access(target);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  const env = getChatbotEnv();
  logger.info('Starting chatbot content indexing');

  const documents: SourceDocument[] = [];

  for (const root of CONTENT_ROOTS) {
    const dirPath = path.join(process.cwd(), root);
    if (await pathExists(dirPath)) {
      const dirDocs = await collectDocuments(dirPath);
      documents.push(...dirDocs);
    }
  }

  for (const file of SINGLE_FILES) {
    const filePath = path.join(process.cwd(), file);
    if (!(await pathExists(filePath))) continue;
    const ext = path.extname(filePath);
    if (!SUPPORTED_EXTENSIONS.has(ext)) continue;
    const raw = await readFile(filePath, 'utf-8');
    const parsed = matter(raw);
    documents.push({
      path: filePath,
      text: stripMarkdown(parsed.content),
    });
  }

  const routeDocs = await collectAppRouteDocuments();
  if (routeDocs.length) {
    logger.info(`Collected ${routeDocs.length} app route documents`);
    documents.push(...routeDocs);
  }

  if (!documents.length) {
    logger.warn('No documents found for indexing');
    return;
  }

  const chunks = documents.flatMap(chunkDocument);
  logger.info(`Prepared ${chunks.length} chunks from ${documents.length} documents`);

  const redis = getRedisClient();

  try {
    await ensureVectorIndexIfMissing(redis);

    const openai = new OpenAI({ apiKey: env.openaiApiKey });
    const embeddings = await embedChunks(chunks, openai);

    for (let i = 0; i < chunks.length; i += 1) {
      const chunk = chunks[i];
      const embedding = embeddings[i];
      await upsertChunk(redis, chunk.id, {
        content: chunk.content,
        source: chunk.source,
        embedding,
      });
    }
  } finally {
    await closeRedisClient();
  }

  logger.info('Chatbot content indexing complete', {
    documents: documents.length,
    chunks: chunks.length,
  });
}

main().catch(async (error) => {
  logger.error('Chatbot indexing failed', error);
  await closeRedisClient();
  process.exit(1);
});
