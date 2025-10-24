/**
 * Proxy - Access Control
 * Blocks all routes except Coming Soon page unless user is allowlisted
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { logger } from '@/lib/logger';

// Public routes that don't require allowlist
const PUBLIC_ROUTES = [
  '/coming-soon',
  '/api/auth',
  '/auth',
  '/api/request-access',
  '/api/check-access', // Prevent infinite loop
  '/privacy',
  '/terms',
  '/_next',
  '/favicon.ico',
  '/favicon.svg',
  '/favicon-16.png',
  '/favicon-32.png',
  '/favicon-96x96.png',
  '/favicon-192.png',
  '/favicon-256.png',
  '/apple-touch-icon.png',
  '/apple-touch-icon-precomposed.png',
  '/site.webmanifest',
  '/web-app-manifest-192x192.png',
  '/web-app-manifest-512x512.png',
  '/icon.svg',
  '/opengraph-image',
  '/twitter-image',
  '/apple-icon',
  '/models',
  '/react-logo.svg',
];

// API routes that should work for allowlisted users (future use)
// const PROTECTED_API_ROUTES = [
//   '/api/ris',
//   '/api/maintainer',
// ];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check for crawler bypass token (for internal content ingestion)
  const crawlerBypassToken = request.headers.get('X-Crawler-Bypass');
  if (crawlerBypassToken && process.env.CRAWLER_BYPASS_TOKEN) {
    if (crawlerBypassToken === process.env.CRAWLER_BYPASS_TOKEN) {
      logger.debug(`  Crawler bypass granted for ${pathname}`);
      return NextResponse.next();
    }
  }

  // TEMPORARILY DISABLE PROXY FOR FAVICON TESTING
  // Allow all favicon and static asset requests first
  if (pathname.includes('favicon') ||
      pathname.includes('apple-touch-icon') ||
      pathname.includes('site.webmanifest') ||
      pathname.includes('web-app-manifest') ||
      pathname.match(/\.(ico|png|jpg|jpeg|gif|webp|svg)$/)) {
    return NextResponse.next();
  }

  // Allow public routes
  if (PUBLIC_ROUTES.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Check if user is authenticated
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
    secureCookie: process.env.NODE_ENV === 'production',
  });

  logger.debug(`Proxy check for ${pathname}`);
  logger.debug(`  Token exists: ${!!token}, Email: ${token?.email || 'none'}`);

  // If not authenticated, redirect to coming soon
  if (!token || !token.email) {
    logger.debug(`  Not authenticated, redirecting to /coming-soon`);
    const url = request.nextUrl.clone();
    url.pathname = '/coming-soon';
    return NextResponse.redirect(url);
  }

  const userEmail = (token.email as string).toLowerCase();

  // Super admin check - environment variable failsafe
  const SUPER_ADMIN = process.env.SUPER_ADMIN_EMAIL?.toLowerCase();
  if (SUPER_ADMIN && userEmail === SUPER_ADMIN) {
    logger.debug(`  Super admin access granted: ${userEmail}`);
    return NextResponse.next();
  }

  // Call our API route to check access (runs in Node.js runtime)
  try {
    const baseUrl = request.nextUrl.origin;
    const checkResponse = await fetch(`${baseUrl}/api/check-access`, {
      headers: {
        cookie: request.headers.get('cookie') || '',
      },
    });

    if (!checkResponse.ok) {
      logger.warn(`Access check API failed for ${userEmail}: ${checkResponse.status}`);
      const url = request.nextUrl.clone();
      url.pathname = '/coming-soon';
      return NextResponse.redirect(url);
    }

    const checkData = await checkResponse.json();

    if (!checkData.isAllowed) {
      logger.debug(`  User not on allowlist: ${userEmail}`);
      const url = request.nextUrl.clone();
      url.pathname = '/coming-soon';
      return NextResponse.redirect(url);
    }

    logger.debug(`  Access granted: ${userEmail}`);
    return NextResponse.next();
  } catch (error) {
    logger.error('Error checking access:', error);
    // On error, redirect to coming soon for safety
    const url = request.nextUrl.clone();
    url.pathname = '/coming-soon';
    return NextResponse.redirect(url);
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon files and static assets
     * - public folder
     */
    '/((?!_next/static|_next/image|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
