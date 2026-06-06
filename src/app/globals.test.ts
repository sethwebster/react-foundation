import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

const dirname = path.dirname(fileURLToPath(import.meta.url));
const globalsCss = readFileSync(path.join(dirname, 'globals.css'), 'utf8');

describe('global dark-mode variant configuration', () => {
  it('defines a class-based dark variant so dark:* utilities respond to the app theme toggle', () => {
    expect(globalsCss).toMatch(/@custom-variant\s+dark\s+\(&:\s*where\(\.dark,\s*\.dark\s*\*\)\);/);
  });
});
