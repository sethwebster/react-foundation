/**
 * Middleware - Access Control
 * Blocks all routes except Coming Soon page unless user is allowlisted
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

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
  '/icon.svg',
  '/opengraph-image',
  '/twitter-image',
  '/apple-icon',
  '/models',
  '/react-logo.svg',
];

// API routes that should work for allowlisted users
const PROTECTED_API_ROUTES = [
  '/api/ris',
  '/api/maintainer',
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

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

  console.log(`🔐 Middleware check for ${pathname}`);
  console.log(`   Has NEXTAUTH_SECRET: ${!!process.env.NEXTAUTH_SECRET}`);
  console.log(`   Token exists: ${!!token}`);
  console.log(`   Authenticated: ${!!token}`);
  console.log(`   Email: ${token?.email || 'none'}`);

  // If not authenticated, redirect to coming soon
  if (!token || !token.email) {
    console.log(`   ❌ Not authenticated, redirecting to /coming-soon`);
    const url = request.nextUrl.clone();
    url.pathname = '/coming-soon';
    return NextResponse.redirect(url);
  }

  const userEmail = (token.email as string).toLowerCase();

  console.log(`   User email: ${userEmail}`);

  // Super admin check - environment variable failsafe
  const SUPER_ADMIN = process.env.SUPER_ADMIN_EMAIL?.toLowerCase();
  if (SUPER_ADMIN && userEmail === SUPER_ADMIN) {
    console.log(`   👑 Super admin detected - access granted`);
    return NextResponse.next();
  }

  // Call our API route to check access (works in Edge runtime)
  try {
    const baseUrl = request.nextUrl.origin;
    const checkResponse = await fetch(`${baseUrl}/api/check-access`, {
      headers: {
        cookie: request.headers.get('cookie') || '',
      },
    });

    if (!checkResponse.ok) {
      console.log(`   ❌ Access check API failed: ${checkResponse.status}`);
      const url = request.nextUrl.clone();
      url.pathname = '/coming-soon';
      return NextResponse.redirect(url);
    }

    const checkData = await checkResponse.json();

    console.log(`   Has access (Redis): ${checkData.isAllowed}`);

    if (!checkData.isAllowed) {
      console.log(`   ❌ Not in user list, redirecting to /coming-soon`);
      const url = request.nextUrl.clone();
      url.pathname = '/coming-soon';
      return NextResponse.redirect(url);
    }

    // User has access, proceed
    console.log(`   ✅ Access granted`);
    return NextResponse.next();
  } catch (error) {
    console.error('   ❌ Error checking access:', error);
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
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
