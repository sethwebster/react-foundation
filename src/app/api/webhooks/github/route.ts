/**
 * GitHub App Webhook Handler
 * Receives webhook events from GitHub App installations
 *
 * Supported events:
 * - installation (app installed/uninstalled)
 * - push (new commits)
 * - pull_request (PRs opened/closed/merged)
 * - issues (issues opened/closed)
 * - release (releases published)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createHmac, timingSafeEqual } from 'crypto';
import { queueWebhookEvent, trackInstallation, removeInstallation } from '@/lib/ris/webhook-queue';
import { logger } from '@/lib/logger';

/**
 * Verify GitHub webhook signature
 * https://docs.github.com/en/webhooks/using-webhooks/validating-webhook-deliveries
 */
function verifySignature(payload: string, signature: string, secret: string): boolean {
  if (!signature) {
    return false;
  }

  const [algorithm, hash] = signature.split('=');

  if (algorithm !== 'sha256') {
    return false;
  }

  const expectedHash = createHmac('sha256', secret)
    .update(payload)
    .digest('hex');

  try {
    return timingSafeEqual(
      Buffer.from(hash, 'hex'),
      Buffer.from(expectedHash, 'hex')
    );
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get raw body for signature verification
    const payload = await request.text();
    const signature = request.headers.get('x-hub-signature-256') || '';
    const eventType = request.headers.get('x-github-event') || '';
    const deliveryId = request.headers.get('x-github-delivery') || '';

    // Verify webhook secret is configured
    const webhookSecret = process.env.GITHUB_WEBHOOK_SECRET;
    if (!webhookSecret) {
      logger.error('GITHUB_WEBHOOK_SECRET not configured');
      return NextResponse.json(
        { error: 'Webhook secret not configured' },
        { status: 500 }
      );
    }

    // Verify signature
    const isValid = verifySignature(payload, signature, webhookSecret);
    if (!isValid) {
      logger.warn(`Invalid webhook signature: ${deliveryId}`);
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    // Parse payload
    let data: Record<string, unknown>;
    try {
      data = JSON.parse(payload);
    } catch {
      logger.error(`Invalid JSON payload: ${deliveryId}`);
      return NextResponse.json(
        { error: 'Invalid JSON' },
        { status: 400 }
      );
    }

    logger.info(`Webhook received: ${eventType} (${deliveryId})`);

    // Handle different event types
    switch (eventType) {
      case 'installation': {
        // App installed or uninstalled
        const action = data.action as string;
        const installation = data.installation as Record<string, unknown>;
        const installationId = installation?.id as number;

        if (action === 'created' || action === 'added') {
          // Track newly installed repos
          const repositories = data.repositories as Array<Record<string, unknown>> | undefined;
          if (repositories) {
            for (const repo of repositories) {
              const owner = (repo.owner as Record<string, unknown>)?.login as string;
              const name = repo.name as string;
              await trackInstallation(owner, name, installationId);
              logger.info(`✅ App installed: ${owner}/${name}`);
            }
          }
        } else if (action === 'deleted' || action === 'removed') {
          // Remove installation tracking
          const repositories = data.repositories as Array<Record<string, unknown>> | undefined;
          if (repositories) {
            for (const repo of repositories) {
              const owner = (repo.owner as Record<string, unknown>)?.login as string;
              const name = repo.name as string;
              await removeInstallation(owner, name);
              logger.info(`❌ App uninstalled: ${owner}/${name}`);
            }
          }
        }
        break;
      }

      case 'push':
      case 'pull_request':
      case 'issues':
      case 'release': {
        // Queue event for processing
        const repository = data.repository as Record<string, unknown>;
        const owner = (repository?.owner as Record<string, unknown>)?.login as string;
        const name = repository?.name as string;

        if (owner && name) {
          await queueWebhookEvent({
            eventId: deliveryId,
            type: eventType,
            owner,
            repo: name,
            payload: data,
            receivedAt: new Date().toISOString(),
          });

          logger.info(`📥 Queued ${eventType} event for ${owner}/${name}`);
        }
        break;
      }

      case 'ping': {
        // GitHub sends ping on webhook creation
        logger.info('Webhook ping received');
        break;
      }

      default: {
        logger.debug(`Unhandled event type: ${eventType}`);
      }
    }

    // Return success quickly (GitHub expects response within 10 seconds)
    return NextResponse.json({
      success: true,
      eventType,
      deliveryId,
      received: new Date().toISOString(),
    });

  } catch (error) {
    logger.error('Webhook processing error:', error);

    // Still return 200 to prevent GitHub from retrying
    // (we logged the error for investigation)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
