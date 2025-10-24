/**
 * Final Merge with Real URLs
 * Uses the "website" field from normalized-meetups-data.json as meetup_url
 */

import { REACT_COMMUNITIES } from '../src/data/communities';
import { readFileSync, writeFileSync, unlinkSync } from 'fs';
import { join } from 'path';
import type { Community } from '../src/types/community';

console.log('🔄 Final merge with real meetup URLs...');

// Read the JSON with real URLs
const jsonPath = join(process.cwd(), 'data', 'normalized-meetups-data.json');
const jsonData = JSON.parse(readFileSync(jsonPath, 'utf-8'));

// Create URL map from JSON (website field has the REAL meetup URLs!)
const urlMap = new Map<string, string>();
jsonData.forEach((item: any) => {
  // The "website" field in JSON contains actual meetup.com URLs
  if (item.website) {
    const normalizedName = item.name.toLowerCase().replace(/[^a-z0-9]/g, '');
    urlMap.set(normalizedName, item.website);
    console.log(`  📌 ${item.name} → ${item.website}`);
  }
});

console.log(`Found ${urlMap.size} real meetup URLs in JSON`);

// Update communities with real URLs
let updated = 0;
let fixed = 0;

const finalCommunities = REACT_COMMUNITIES.map(c => {
  const normalizedName = c.name.toLowerCase().replace(/[^a-z0-9]/g, '');
  const realUrl = urlMap.get(normalizedName);

  if (realUrl) {
    if (c.meetup_url !== realUrl) {
      console.log(`🔧 Fixing: ${c.name}`);
      console.log(`   Old: ${c.meetup_url || 'none'}`);
      console.log(`   New: ${realUrl}`);
      fixed++;
    } else {
      updated++;
    }
    return { ...c, meetup_url: realUrl };
  }

  return c;
});

console.log('');
console.log(`✅ ${updated} URLs already correct`);
console.log(`🔧 ${fixed} URLs fixed with real data`);
console.log('');

// Write final source
const output = `/**
 * React Communities - SINGLE SOURCE OF TRUTH
 * ${finalCommunities.length} communities with verified meetup URLs from react.dev
 * Last updated: ${new Date().toISOString()}
 */

import type { Community } from '@/types/community';

export const REACT_COMMUNITIES: Community[] = ${JSON.stringify(finalCommunities, null, 2)};

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

writeFileSync('src/data/communities.ts', output);

console.log('✅ Updated src/data/communities.ts with real URLs');
console.log('');

// Clean up old files
try {
  unlinkSync('src/data/communities-generated.json');
  console.log('🗑️  Deleted communities-generated.json');
} catch {}

console.log('');
console.log('Next: Visit /admin/reset to re-seed Redis');
