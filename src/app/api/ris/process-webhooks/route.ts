/**
 * Webhook Processing Cron Job
 * Processes queued webhook events in the background
 *
 * Trigger this endpoint periodically (every 1-5 minutes) using:
 * - Vercel Cron (recommended for Vercel deployments)
 * - GitHub Actions (for self-hosted)
 * - Manual cron job (crontab)
 *
 * Security: Use CRON_SECRET to prevent unauthorized access
 */

import { NextRequest, NextResponse } from 'next/server';
import { processAllWebhookEvents } from '@/lib/ris/webhook-processor';
import { getQueueLength } from '@/lib/ris/webhook-queue';
import { logger } from '@/lib/logger';

export const maxDuration = 60; // 1 minute max execution time

export async function POST(request: NextRequest) {
  try {
    // Verify cron secret (prevent unauthorized access)
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      logger.warn('Unauthorized webhook processing attempt');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check queue length before processing
    const queueLength = await getQueueLength();

    if (queueLength === 0) {
      return NextResponse.json({
        success: true,
        message: 'Queue is empty',
        processed: 0,
        queueLength: 0,
      });
    }

    logger.info(`Processing webhook queue (${queueLength} events pending)`);

    // Process up to 100 events (or until queue is empty)
    const startTime = Date.now();
    const processed = await processAllWebhookEvents(100);
    const duration = Date.now() - startTime;

    // Get remaining queue length
    const remainingQueue = await getQueueLength();

    logger.info(`Processed ${processed} webhook event(s) in ${duration}ms (${remainingQueue} remaining)`);

    return NextResponse.json({
      success: true,
      processed,
      queueLength: remainingQueue,
      duration,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    logger.error('Webhook processing cron error:', error);

    return NextResponse.json(
      {
        error: 'Processing failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint for manual triggering or status check
 */
export async function GET() {
  try {
    const queueLength = await getQueueLength();

    return NextResponse.json({
      queueLength,
      message: queueLength > 0
        ? `${queueLength} events in queue (use POST to process)`
        : 'Queue is empty',
    });
  } catch (error) {
    logger.error('Failed to get queue status:', error);

    return NextResponse.json(
      {
        error: 'Failed to get queue status',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
