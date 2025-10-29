/**
 * Vercel Deploy Webhook Handler
 *
 * Automatically triggers chatbot ingestion after successful deployments.
 *
 * Setup in Vercel:
 * 1. Go to Project Settings → Git → Deploy Hooks
 * 2. Create a new Deploy Hook with name "Post-Deploy Ingestion"
 * 3. Set the URL to: https://react.foundation/api/webhooks/vercel-deploy
 * 4. Add secret: VERCEL_DEPLOY_WEBHOOK_SECRET
 * 5. Enable "Deployment Completed" event
 */

import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';

export const runtime = 'edge'; // Use edge runtime for fast webhook responses

interface VercelDeploymentPayload {
  id: string;
  deployment: {
    id: string;
    url: string;
    name: string;
    meta?: {
      githubCommitRef?: string;
      githubCommitSha?: string;
      githubCommitMessage?: string;
    };
  };
  type: 'deployment.succeeded' | 'deployment.error' | 'deployment.created';
  createdAt: number;
  region: string;
  payload: {
    deploymentUrl: string;
    projectId: string;
    teamId?: string;
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const secret = process.env.VERCEL_DEPLOY_WEBHOOK_SECRET;

    // Check for authorization header (simple token auth)
    const authHeader = request.headers.get('authorization');
    const providedToken = authHeader?.replace('Bearer ', '');

    // Check for x-vercel-signature (HMAC auth)
    const signature = request.headers.get('x-vercel-signature');

    // Check for query parameter (URL-based auth)
    const url = new URL(request.url);
    const querySecret = url.searchParams.get('secret');

    logger.info('Vercel webhook received:', {
      hasAuthHeader: !!authHeader,
      hasSignature: !!signature,
      hasQuerySecret: !!querySecret,
      hasSecret: !!secret,
      bodyLength: body.length,
    });

    if (!secret) {
      logger.error('VERCEL_DEPLOY_WEBHOOK_SECRET not configured');
      return NextResponse.json(
        { error: 'Webhook not configured' },
        { status: 500 }
      );
    }

    // Support multiple authentication methods:
    // 1. Bearer token in Authorization header (recommended)
    // 2. Query parameter ?secret=xxx (Deploy Hooks style)
    // 3. HMAC signature (Integration style)
    let authenticated = false;

    // Method 1: Bearer token
    if (providedToken === secret) {
      authenticated = true;
      logger.info('Authenticated via Bearer token');
    }

    // Method 2: Query parameter
    if (querySecret === secret) {
      authenticated = true;
      logger.info('Authenticated via query parameter');
    }

    // Method 3: HMAC signature (if provided)
    if (signature && !authenticated) {
      try {
        const encoder = new TextEncoder();
        const keyData = encoder.encode(secret);
        const messageData = encoder.encode(body);

        const cryptoKey = await crypto.subtle.importKey(
          'raw',
          keyData,
          { name: 'HMAC', hash: 'SHA-1' },
          false,
          ['sign']
        );

        const signatureBuffer = await crypto.subtle.sign('HMAC', cryptoKey, messageData);
        const expectedSignature = Array.from(new Uint8Array(signatureBuffer))
          .map(b => b.toString(16).padStart(2, '0'))
          .join('');

        const providedSignature = signature.startsWith('sha1=')
          ? signature.substring(5)
          : signature;

        if (providedSignature === expectedSignature) {
          authenticated = true;
          logger.info('Authenticated via HMAC signature');
        }
      } catch (error) {
        logger.error('Error verifying HMAC signature:', error);
      }
    }

    if (!authenticated) {
      logger.warn('Webhook authentication failed - no valid auth method');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse body as JSON
    const payload: VercelDeploymentPayload = JSON.parse(body);

    logger.info('Vercel deployment webhook received:', {
      type: payload.type,
      deploymentUrl: payload.deployment.url,
      commitRef: payload.deployment.meta?.githubCommitRef,
    });

    // Only trigger ingestion on successful production deployments
    if (payload.type !== 'deployment.succeeded') {
      logger.info('Skipping ingestion - deployment not succeeded');
      return NextResponse.json({
        message: 'Deployment not succeeded, skipping ingestion',
      });
    }

    // Check if this is a production deployment
    const isProduction =
      payload.deployment.url === process.env.NEXT_PUBLIC_SITE_URL?.replace(
        /^https?:\/\//,
        ''
      );

    if (!isProduction) {
      logger.info('Skipping ingestion - not a production deployment');
      return NextResponse.json({
        message: 'Not a production deployment, skipping ingestion',
      });
    }

    // Trigger ingestion asynchronously (don't block webhook response)
    const ingestionToken = process.env.INGESTION_API_TOKEN;
    if (!ingestionToken) {
      logger.error('INGESTION_API_TOKEN not configured');
      return NextResponse.json(
        { error: 'Ingestion not configured' },
        { status: 500 }
      );
    }

    logger.info('Triggering post-deployment ingestion...');

    // Trigger ingestion in background (don't await)
    fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/admin/ingest`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ingestionToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        maxPages: 100,
        useSitemap: true,
        clearExisting: false,
      }),
    })
      .then(async (response) => {
        if (response.ok) {
          const data = await response.json();
          logger.info('Ingestion triggered successfully:', data);
        } else {
          logger.error('Ingestion trigger failed:', await response.text());
        }
      })
      .catch((error) => {
        logger.error('Error triggering ingestion:', error);
      });

    // Return success immediately (ingestion runs in background)
    return NextResponse.json({
      message: 'Ingestion triggered',
      deployment: {
        url: payload.deployment.url,
        commit: payload.deployment.meta?.githubCommitSha,
      },
    });
  } catch (error) {
    logger.error('Error processing Vercel deploy webhook:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}

// Health check
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    webhook: 'vercel-deploy',
    message: 'POST to this endpoint with Vercel deployment payload',
  });
}
