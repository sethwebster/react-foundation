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

describe('React Foundation theme contract', () => {
  it('scopes Tailwind source detection to application code', () => {
    expect(globalsCss).toContain('@import "tailwindcss" source(none);');
    expect(globalsCss).toContain('@source "../**/*.{js,ts,jsx,tsx,mdx}";');
    expect(globalsCss).toContain('@source "../../content/**/*.{md,mdx}";');
  });

  it('defines the core visual-language tokens used by every public page', () => {
    expect(globalsCss).toContain('--foundation-content-wide: 72rem;');
    expect(globalsCss).toContain('--foundation-content-reading: 40.5rem;');
    expect(globalsCss).toContain('--foundation-page-gutter: clamp(1.25rem, 4vw, 3rem);');
    expect(globalsCss).toContain('--foundation-section-space: clamp(4.5rem, 9vw, 8rem);');
    expect(globalsCss).toContain('--foundation-radius-panel: 1.75rem;');
    expect(globalsCss).toContain('--foundation-shadow-soft:');
  });

  it('maps the Figma-derived surface and text roles into Tailwind theme tokens', () => {
    expect(globalsCss).toContain('--color-surface-subtle: hsl(var(--surface-subtle));');
    expect(globalsCss).toContain('--color-text-subtle: hsl(var(--text-subtle));');
    expect(globalsCss).toContain('--color-border-strong: hsl(var(--border-strong));');
    expect(globalsCss).toContain('--color-brand-soft: hsl(var(--brand-soft));');
    expect(globalsCss).toContain('--color-map-water: hsl(var(--map-water));');
  });

  it('uses a calm flat page canvas instead of the previous animated background gradient', () => {
    expect(globalsCss).toMatch(
      /body\s*\{[\s\S]*?background-color:\s*hsl\(var\(--background\)\);/,
    );
    expect(globalsCss).not.toMatch(
      /body\s*\{[\s\S]*?animation:\s*subtleGradientShift/,
    );
  });
});
