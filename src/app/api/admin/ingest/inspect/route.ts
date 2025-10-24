/**
 * Vector Store Inspection API
 * Debug endpoint to inspect what's stored in the vector database
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { UserManagementService } from '@/lib/admin/user-management-service';
import { getRedisClient } from '@/lib/redis';
import { getChatbotEnv } from '@/lib/chatbot/env';
import {
  getCurrentIndexName,
  listAllIndices,
  type IndexMetadata,
} from '@/lib/chatbot/vector-store';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    // Check authentication and admin status
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const isAdmin = await UserManagementService.isAdmin(session.user.email);
    if (!isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const redis = getRedisClient();
    const env = getChatbotEnv();

    // Get current active index
    const currentIndexName = await getCurrentIndexName(redis);

    // List all indices
    const allIndices = await listAllIndices(redis);

    // Get chunk keys from current index
    let keys: string[] = [];
    let currentIndexMetadata: IndexMetadata | null = null;

    if (currentIndexName) {
      currentIndexMetadata = allIndices.find((idx) => idx.indexName === currentIndexName) || null;
      const prefix = currentIndexMetadata?.prefix || env.redisPrefix;
      const pattern = `${prefix}*`;
      keys = await redis.keys(pattern);
    }

    logger.info(`Found ${keys.length} vector chunks in current index`);

    // Sample first 10 chunks
    const samples = [];
    for (let i = 0; i < Math.min(10, keys.length); i++) {
      const key = keys[i];
      const data = await redis.hgetall(key);

      samples.push({
        key,
        id: data.id,
        source: data.source,
        contentPreview: data.content?.substring(0, 200) + '...',
        hasEmbedding: !!data.embedding,
        embeddingSize: data.embedding ? Buffer.from(data.embedding, 'binary').length : 0,
      });
    }

    // Try to check if index exists
    let indexExists = false;
    let indexInfo: unknown = null;
    try {
      indexInfo = await redis.call('FT.INFO', env.redisIndex);
      indexExists = true;
    } catch (error) {
      logger.warn('Vector index does not exist or error checking:', error);
    }

    return NextResponse.json({
      currentIndex: currentIndexName,
      totalChunks: keys.length,
      samples,
      allIndices,
      config: {
        defaultPrefix: env.redisPrefix,
        defaultIndex: env.redisIndex,
        embeddingModel: env.embeddingModel,
      },
      index: {
        exists: indexExists,
        info: indexInfo,
      },
    });
  } catch (error) {
    logger.error('Error inspecting vector store:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Failed to inspect vector store',
      },
      { status: 500 }
    );
  }
}
