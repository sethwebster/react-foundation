import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readdirSync, readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

const dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.join(dirname, '..', '..', '..');
const appRoot = path.join(repoRoot, 'src', 'app');
const scheduledWorkflow = readFileSync(
  path.join(repoRoot, '.github', 'workflows', 'trigger-ingestion.yml'),
  'utf8'
);

function collectRouteFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(dir, entry.name);
    if (entry.isDirectory()) return collectRouteFiles(entryPath);
    return entry.name === 'route.ts' ? [entryPath] : [];
  });
}

function toRoutePath(routeFile: string): string {
  const segments = path.relative(appRoot, path.dirname(routeFile)).split(path.sep);
  return `/${segments.join('/')}`;
}

const contentMapRoutes = collectRouteFiles(path.join(appRoot, 'api'))
  .filter((file) => readFileSync(file, 'utf8').includes('storeContentMap('))
  .map(toRoutePath);

describe('scheduled content map refresh', () => {
  it('keeps a single route as the place that stores the content map', () => {
    expect(contentMapRoutes).toEqual(['/api/ingest/full']);
  });

  it('schedules ingestion against the route that stores the content map', () => {
    expect(scheduledWorkflow).toContain(contentMapRoutes[0]);
  });

  it('fails the run when the ingestion does not reach completion', () => {
    expect(scheduledWorkflow).toContain('ingestionId=');
    expect(scheduledWorkflow).toContain('"completed"');
  });
});
