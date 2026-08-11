import { describe, expect, it } from 'vitest';

describe('robots metadata route', () => {
  it('returns a crawl policy plus sitemap for the public site', async () => {
    const { default: robots } = await import('./robots');

    expect(robots()).toEqual({
      rules: {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/api', '/auth', '/profile', '/sticky-test', '/theme-test'],
      },
      sitemap: 'https://react.foundation/sitemap.xml',
      host: 'https://react.foundation',
    });
  });
});
