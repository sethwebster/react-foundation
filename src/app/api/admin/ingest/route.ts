/**
 * Content Ingestion API
 * Crawls the site and generates vector embeddings for chatbot
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { UserManagementService } from '@/lib/admin/user-management-service';
import { getRedisClient } from '@/lib/redis';
import { IngestionService, type IngestionProgress } from '@/lib/chatbot/ingest';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 minutes max for ingestion

// Store ingestion progress in memory
const ingestionProgress = new Map<string, IngestionProgress>();
const runningIngestions = new Map<string, Promise<void>>();

export async function POST(request: Request) {
  try {
    // Check for API token (for CI/CD workflows) or session auth (for admin UI)
    const authHeader = request.headers.get('Authorization');
    const apiToken = authHeader?.replace('Bearer ', '');

    // API token authentication (for GitHub Actions)
    if (apiToken && process.env.INGESTION_API_TOKEN) {
      if (apiToken !== process.env.INGESTION_API_TOKEN) {
        logger.warn('Invalid ingestion API token provided');
        return NextResponse.json({ error: 'Invalid API token' }, { status: 401 });
      }
      logger.info('Ingestion authenticated via API token');
    } else {
      // Session-based authentication (for admin UI)
      const session = await getServerSession(authOptions);
      if (!session?.user?.email) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const isAdmin = await UserManagementService.isAdmin(session.user.email);
      if (!isAdmin) {
        return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
      }
    }

    const body = await request.json();
    const {
      clearExisting = false,
      maxPages = 100,
      allowedPaths,
      excludePaths,
    } = body;

    // Get base URL from environment or request
    const baseUrl =
      process.env.NEXT_PUBLIC_SITE_URL ||
      process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : 'http://localhost:3000';

    // Generate ingestion ID
    const ingestionId = `ingest-${Date.now()}`;

    // Check if ingestion is already running
    if (runningIngestions.size > 0) {
      return NextResponse.json(
        { error: 'An ingestion is already in progress' },
        { status: 409 }
      );
    }

    // Start ingestion in background
    const redis = getRedisClient();
    const service = new IngestionService(redis);

    const ingestionPromise = service
      .ingest({
        baseUrl,
        clearExisting,
        maxPages,
        allowedPaths,
        excludePaths,
      })
      .then(() => {
        runningIngestions.delete(ingestionId);
      })
      .catch((error) => {
        logger.error('Ingestion failed:', error);
        runningIngestions.delete(ingestionId);
      });

    runningIngestions.set(ingestionId, ingestionPromise);

    // Poll for progress updates
    const pollProgress = setInterval(() => {
      const progress = service.getProgress();
      ingestionProgress.set(ingestionId, progress);

      if (progress.status === 'completed' || progress.status === 'failed') {
        clearInterval(pollProgress);
      }
    }, 500);

    return NextResponse.json({
      ingestionId,
      message: 'Ingestion started',
      baseUrl,
    });
  } catch (error) {
    logger.error('Error starting ingestion:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Failed to start ingestion',
      },
      { status: 500 }
    );
  }
}

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

    const { searchParams } = new URL(request.url);
    const ingestionId = searchParams.get('ingestionId');

    if (!ingestionId) {
      return NextResponse.json(
        { error: 'ingestionId is required' },
        { status: 400 }
      );
    }

    const progress = ingestionProgress.get(ingestionId);
    if (!progress) {
      return NextResponse.json(
        { error: 'Ingestion not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(progress);
  } catch (error) {
    logger.error('Error getting ingestion status:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Failed to get ingestion status',
      },
      { status: 500 }
    );
  }
}
