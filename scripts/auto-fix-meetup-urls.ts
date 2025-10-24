/**
 * Auto-Fix Meetup URLs with Web Search
 * Uses web search to find correct meetup.com URLs
 */

import { REACT_COMMUNITIES } from '../src/data/communities';
import { writeFileSync } from 'fs';

// Known fixes from web search
const KNOWN_FIXES: Record<string, string> = {
  'React Bangalore': 'https://www.meetup.com/reactjs-bangalore/',
  'React Israel': 'https://www.meetup.com/react-il/',
  'React Buenos Aires': 'https://www.meetup.com/react-en-buenos-aires/',
  // Add more as we find them
};

console.log('🔧 Auto-fixing meetup URLs with known corrections...');
console.log('');

let fixed = 0;

const updated = REACT_COMMUNITIES.map(c => {
  const correctUrl = KNOWN_FIXES[c.name];

  if (correctUrl) {
    console.log(`✅ ${c.name}`);
    console.log(`   Old: ${c.meetup_url || 'none'}`);
    console.log(`   New: ${correctUrl}`);
    fixed++;
    return { ...c, meetup_url: correctUrl };
  }

  return c;
});

console.log('');
console.log(`✅ Fixed ${fixed} meetup URLs`);

// Write back
const output = `/**
 * React Communities - Single Source of Truth
 * ${updated.length} communities with corrected meetup URLs
 * Last updated: ${new Date().toISOString()}
 */

import type { Community } from '@/types/community';

export const REACT_COMMUNITIES: Community[] = ${JSON.stringify(updated, null, 2)};

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
console.log('✅ Updated communities.ts');
