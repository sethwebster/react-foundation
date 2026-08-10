import { describe, expect, it, vi } from 'vitest';

vi.mock('@/data/communities', () => ({
  REACT_COMMUNITIES: [
    {
      slug: 'react-miami',
      updated_at: '2026-05-01T00:00:00.000Z',
    },
  ],
}));

vi.mock('@/lib/authors', () => ({
  getAllAuthors: () => [
    {
      slug: 'seth-webster',
    },
  ],
}));

vi.mock('@/lib/updates', () => ({
  getAllUpdates: () => [
    {
      slug: 'spring-update',
      metadata: {
        date: '2026-04-20T00:00:00.000Z',
      },
    },
  ],
}));

describe('sitemap', () => {
  it('excludes hidden routes and includes public static and dynamic routes', async () => {
    const { default: sitemap } = await import('./sitemap');

    const entries = await sitemap();
    const urls = entries.map((entry) => new URL(entry.url).pathname);
    expect(urls).not.toContain('/educators');
    expect(urls).not.toContain('/educators/apply');
    expect(urls.some((url) => url.startsWith('/store'))).toBe(false);

    expect(urls).toEqual(
      expect.arrayContaining([
        '/',
        '/about',
        '/about/board-of-directors',
        '/about/technical-steering-committee',
        '/authors',
        '/authors/seth-webster',
        '/communities',
        '/communities/add',
        '/communities/react-miami',
        '/communities/start',
        '/impact',
        '/libraries',
        '/privacy',
        '/scoring',
        '/terms',
        '/updates',
        '/updates/spring-update',
      ]),
    );

  });
});
