/**
 * Determine the canonical base URL for links inside emails and server tasks.
 *
 * Preference order:
 * 1. Explicit NEXT_PUBLIC_SITE_URL env override (custom domains, staging, etc.)
 * 2. Vercel-provided deployment URLs (branch, preview, production)
 * 3. NEXTAUTH_URL (commonly set in Next.js apps)
 * 4. Localhost fallback
 */
export function getSiteUrl(): string {
  const explicitSiteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL;

  if (explicitSiteUrl) {
    return stripTrailingSlash(explicitSiteUrl);
  }

  const vercelUrl =
    process.env.VERCEL_BRANCH_URL ||
    process.env.VERCEL_URL ||
    process.env.VERCEL_PROJECT_PRODUCTION_URL;

  if (vercelUrl) {
    const normalized = vercelUrl.startsWith('http')
      ? vercelUrl
      : `https://${vercelUrl}`;
    return stripTrailingSlash(normalized);
  }

  if (process.env.NEXTAUTH_URL) {
    return stripTrailingSlash(process.env.NEXTAUTH_URL);
  }

  return 'http://localhost:3000';
}

function stripTrailingSlash(url: string): string {
  return url.endsWith('/') ? url.slice(0, -1) : url;
}
