import { describe, expect, it } from 'vitest';

import { generateContentMap } from './content-map';
import type { ContentMap, ContentSection, RawRecord } from './types';

function makeRecord(partial: Partial<RawRecord>): RawRecord {
  return {
    id: 'id',
    type: 'page',
    title: 'Title',
    url: '/',
    updatedAt: '2026-01-01T00:00:00.000Z',
    body: 'body',
    ...partial,
  };
}

function collectUrls(map: ContentMap): string[] {
  const urls: string[] = [];
  const walk = (sections: ContentSection[]) => {
    for (const section of sections) {
      if (section.url) {
        urls.push(section.url);
      }
      if (section.children) {
        walk(section.children);
      }
    }
  };
  walk(map.sections);
  return urls;
}

describe('generateContentMap', () => {
  it('does not emit /docs urls for public-context knowledge-base entries', () => {
    const map = generateContentMap([
      makeRecord({ id: 'ris', type: 'page', title: 'RIS System', url: '/docs/foundation/ris-system' }),
      makeRecord({ id: 'faq', type: 'page', title: 'FAQ', url: '/docs/faq' }),
      makeRecord({ id: 'about', type: 'page', title: 'About', url: '/about' }),
      makeRecord({ id: 'lib', type: 'library', title: 'React', url: '/libraries' }),
    ]);

    const docsUrls = collectUrls(map).filter((url) => url.startsWith('/docs'));
    expect(docsUrls).toEqual([]);
  });

  it('keeps real pages that were grouped alongside knowledge-base docs', () => {
    const map = generateContentMap([
      makeRecord({ id: 'ris', type: 'page', title: 'RIS System', url: '/docs/foundation/ris-system' }),
      makeRecord({ id: 'about', type: 'page', title: 'About', url: '/about' }),
    ]);

    expect(collectUrls(map)).toContain('/about');
  });

  it('does not give the page section a base url that is not a real route', () => {
    const map = generateContentMap([
      makeRecord({ id: 'about', type: 'page', title: 'About', url: '/about' }),
    ]);

    const documentation = map.sections.find((section) => section.title === 'Documentation');
    expect(documentation).toBeDefined();
    expect(documentation?.url).toBeUndefined();
  });

  it('drops a section entirely when all of its entries were knowledge-base docs', () => {
    const map = generateContentMap([
      makeRecord({ id: 'ris', type: 'page', title: 'RIS System', url: '/docs/foundation/ris-system' }),
      makeRecord({ id: 'lib', type: 'library', title: 'React', url: '/libraries' }),
    ]);

    expect(map.sections.find((section) => section.title === 'Documentation')).toBeUndefined();
    expect(map.sections.find((section) => section.title === 'Tracked Libraries')).toBeDefined();
  });
});
