/**
 * Create Single Source File
 * Merges all data into src/data/communities.ts
 */

import { REACT_COMMUNITIES } from '../src/data/communities';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

function normalizeName(name: string): string {
  return name.toLowerCase().trim().replace(/[^a-z0-9]/g, '');
}

const communityMap = new Map();

// Add existing manual communities
REACT_COMMUNITIES.forEach(comm => {
  communityMap.set(normalizeName(comm.name), comm);
});

console.log(`📝 Starting with ${REACT_COMMUNITIES.length} manual communities`);

// Add from JSON if not duplicate
try {
  const jsonPath = join(process.cwd(), 'data', 'normalized-meetups-data.json');
  const jsonData = JSON.parse(readFileSync(jsonPath, 'utf-8'));

  let added = 0;
  jsonData.forEach((item: any) => {
    const key = normalizeName(item.name);
    if (!communityMap.has(key)) {
      added++;
      console.log(`  + Adding: ${item.name}`);
    } else {
      console.log(`  = Already have: ${item.name}`);
    }
  });

  console.log(`\n✅ Total unique: ${communityMap.size} (added ${added} from JSON)`);
} catch (err) {
  console.log('⚠️ No JSON file');
}

const merged = Array.from(communityMap.values());
console.log(`\n📊 Final count: ${merged.length} communities`);
console.log(`   Countries: ${new Set(merged.map((c: any) => c.country)).size}`);
console.log(`   Members: ${merged.reduce((s: number, c: any) => s + c.member_count, 0).toLocaleString()}`);

// Write to communities.ts
const output = `/**
 * React Communities - Single Source of Truth
 * Auto-generated merged data - DO NOT EDIT MANUALLY
 * Regenerate with: npx tsx scripts/create-single-source.ts
 */

import type { Community } from '@/types/community';

export const REACT_COMMUNITIES: Community[] = ${JSON.stringify(merged, null, 2)};

export function getCommunityBySlug(slug: string): Community | undefined {
  return REACT_COMMUNITIES.find((c) => c.slug === slug);
}

export function getCommunitiesByCountry(country: string): Community[] {
  return REACT_COMMUNITIES.filter((c) => c.country === country);
}

export function getActiveCommunities(): Community[] {
  return REACT_COMMUNITIES.filter((c) => c.status === 'active');
}

export function getCommunitiesByTier(tier: Community['cois_tier']): Community[] {
  return REACT_COMMUNITIES.filter((c) => c.cois_tier === tier);
}
`;

const outputPath = join(process.cwd(), 'src', 'data', 'communities.ts');
writeFileSync(outputPath, output);

console.log(`\n✅ Wrote to ${outputPath}`);
console.log('   This is now the SINGLE source of truth');
console.log('   Redis will seed from this file');
