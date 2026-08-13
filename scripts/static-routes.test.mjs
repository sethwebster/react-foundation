import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const manifestPath = new URL('../.next/prerender-manifest.json', import.meta.url);
const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));

test('routes with a personalized header are server-rendered', () => {
  const publicRoutes = ['/', '/about', '/communities', '/libraries', '/updates'];

  for (const route of publicRoutes) {
    assert.equal(
      manifest.routes[route],
      undefined,
      `${route} should resolve the header session at request time`,
    );
  }
});

test('authenticated routes remain dynamic', () => {
  const authenticatedRoutes = ['/admin', '/profile'];

  for (const route of authenticatedRoutes) {
    assert.equal(manifest.routes[route], undefined, `${route} should not be prerendered`);
  }
});

test('disabled store routes remain dynamic', () => {
  assert.equal(
    manifest.routes['/store/collections'],
    undefined,
    '/store/collections should not be prerendered',
  );
});
