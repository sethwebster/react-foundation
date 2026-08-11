// Emits one .md stub per component carrying only `category:` frontmatter.
// Two jobs:
//   1. Grouping. Directory-derived groups put all 23 ui/ primitives in
//      "general" (the converter treats `ui` as a generic container) and split
//      the rest across src-layout dirs that mean nothing to a designer.
//   2. Isolating docsDir. Pointed at the repo's own docs/ tree, discovery
//      bound developer docs (e.g. ecosystem-libraries.md) as component
//      prompts. Pointing docsDir here instead keeps that from happening.
// The converter appends the synthesized ## Props / ## Examples to each stub,
// so these carry grouping without displacing generated API docs.
import { mkdirSync, writeFileSync, rmSync, readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';

const GROUPS = {
  Primitives: ['Button', 'ButtonLink', 'Pill', 'Rating', 'Collapsible', 'ScrollReveal',
    'SegmentedControl', 'ThemeSegmentedControl', 'AccordionContent', 'Separator', 'Dialog', 'Tooltip'],
  Forms: ['Input', 'Textarea', 'Select', 'Label', 'Checkbox', 'Radio', 'Switch',
    'FormInput', 'SearchInput', 'UsernameInput'],
  Semantic: ['SemanticButton', 'SemanticCard', 'SemanticBadge', 'SemanticInput',
    'SemanticAlert', 'SemanticAvatar', 'SemanticSeparator', 'ContributorIcon', 'ContributorCard'],
  'Data Display': ['Table', 'StatCard', 'Timeline', 'TimelineItem', 'TimelineStep',
    'TimelineProgress', 'TableOfContents', 'LibraryCard', 'RISScoreBreakdown',
    'RISLibraryRankings', 'ByTheNumbers', 'MaintainerProgress'],
  Commerce: ['ProductCard', 'ProductGallery', 'LimitedDrops', 'PastDrops',
    'PastDropsCollections', 'FeaturedLook', 'FeaturedCollections'],
  Layout: ['Header', 'Footer', 'MobileMenu', 'ErrorBoundary'],
  'Page Sections': ['FoundationHero', 'Hero', 'HeroBadges', 'MissionStatement', 'ThreePillars',
    'ExecutiveMessage', 'JoinMovementCTA', 'BecomeContributor', 'FoundingMembers',
    'EcosystemLibraries', 'ImpactSection'],
  Identity: ['UserAvatar', 'SignInButton'],
};

const ROOT = resolve(import.meta.dirname, '..');
const OUT = resolve(ROOT, '.design-sync/docs');
const rosterMap = JSON.parse(readFileSync(resolve(ROOT, '.design-sync/roster.json'), 'utf8'));
const roster = Object.keys(rosterMap);

const of = {};
for (const [group, names] of Object.entries(GROUPS)) for (const n of names) of[n] = group;

const missing = roster.filter((n) => !of[n]);
const unknown = Object.keys(of).filter((n) => !roster.includes(n));
if (missing.length) console.error(`! ungrouped (will fall back to dir-derived): ${missing.join(', ')}`);
if (unknown.length) console.error(`! grouped but not in roster: ${unknown.join(', ')}`);

// A real doc sitting next to the component source (e.g.
// src/components/rfds/timeline.md) outranks docsDir discovery, which would
// take the doc but lose the category with it. Inline such a doc's body under
// our frontmatter so the component keeps both its real prose and its group.
const slugOf = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '');
function siblingDoc(src, name) {
  const dir = resolve(ROOT, src, '..');
  let names = [];
  try { names = readdirSync(dir); } catch { return null; }
  const hit = names.find((f) => /\.mdx?$/.test(f) && slugOf(f.replace(/\.mdx?$/, '')) === slugOf(name));
  return hit ? readFileSync(resolve(dir, hit), 'utf8') : null;
}

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });
let inlined = 0;
const pinned = [];
for (const name of roster) {
  if (!of[name]) continue;
  const body = siblingDoc(rosterMap[name], name);
  // Drop any frontmatter the source doc carried — ours replaces it.
  const prose = body ? body.replace(/^---\n[\s\S]*?\n---\n/, '').trim() : '';
  if (prose) { inlined++; pinned.push(name); }
  writeFileSync(
    resolve(OUT, `${name}.md`),
    `---\ncategory: ${of[name]}\n---\n${prose ? `\n${prose}\n` : ''}`,
  );
}
// A sibling doc outranks docsDir discovery, so for those components the stub
// we just wrote would never be consulted and the category would be lost. Pin
// them explicitly — the documented use for sparse docsMap entries. Written
// straight into the config (docsMap only) so a newly-added sibling doc keeps
// its group without anyone remembering this rule.
const cfgPath = resolve(ROOT, '.design-sync/config.json');
const cfg = JSON.parse(readFileSync(cfgPath, 'utf8'));
const pins = Object.fromEntries(pinned.sort().map((n) => [n, `.design-sync/docs/${n}.md`]));
if (JSON.stringify(cfg.docsMap ?? {}) !== JSON.stringify(pins)) {
  if (Object.keys(pins).length) cfg.docsMap = pins; else delete cfg.docsMap;
  writeFileSync(cfgPath, JSON.stringify(cfg, null, 2) + '\n');
  console.error(`docsMap pins updated: ${Object.keys(pins).join(', ') || '(none)'}`);
}

const counts = {};
for (const n of roster) if (of[n]) counts[of[n]] = (counts[of[n]] ?? 0) + 1;
console.error(`docs stubs: ${roster.filter((n) => of[n]).length} (${inlined} with inlined sibling prose)`);
for (const [g, c] of Object.entries(counts).sort()) console.error(`  ${g}: ${c}`);
