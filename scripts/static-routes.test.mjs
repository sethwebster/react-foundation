import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const manifestPath = new URL('../.next/prerender-manifest.json', import.meta.url);
const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));

test('public content routes are prerendered', () => {
  const publicRoutes = ['/', '/about', '/communities', '/libraries', '/updates'];

  for (const route of publicRoutes) {
    assert.ok(manifest.routes[route], `${route} should be present in the prerender manifest`);
  }
});

test('authenticated routes remain dynamic', () => {
  const authenticatedRoutes = ['/admin', '/profile'];

  for (const route of authenticatedRoutes) {
    assert.equal(manifest.routes[route], undefined, `${route} should not be prerendered`);
  }
});
