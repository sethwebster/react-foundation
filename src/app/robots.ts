import { MetadataRoute } from 'next';

const siteUrl = 'https://react.foundation';

const disallowRules = ['/admin', '/api', '/auth', '/profile', '/sticky-test', '/theme-test'];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: disallowRules,
    },
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
