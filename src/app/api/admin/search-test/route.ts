/**
 * Admin Search Test API
 * Test vector search without using the chatbot
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { UserManagementService } from '@/lib/admin/user-management-service';
import { getRedisClient } from '@/lib/redis';
import { searchSimilar } from '@/lib/chatbot/vector-store';
import { createEmbedding } from '@/lib/chatbot/openai';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const isAdmin = await UserManagementService.isAdmin(session.user.email);
    if (!isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const { query, k = 5 } = body;

    if (!query || typeof query !== 'string') {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    logger.info(`Admin search test: "${query}"`);

    // Create embedding
    const embedding = await createEmbedding(query);

    // Search vector store
    const redis = getRedisClient();
    const results = await searchSimilar(redis, embedding, { k });

    logger.info(`Found ${results.length} results for: "${query}"`);

    return NextResponse.json({
      query,
      resultCount: results.length,
      results: results.map((result) => ({
        id: result.id,
        source: result.source,
        score: result.score,
        contentPreview: result.content.substring(0, 200) + '...',
        contentLength: result.content.length,
      })),
    });
  } catch (error) {
    logger.error('Error in search test:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Search test failed',
      },
      { status: 500 }
    );
  }
}
