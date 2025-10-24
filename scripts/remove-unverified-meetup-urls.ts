/**
 * Remove Unverified Meetup URLs
 * Removes auto-generated meetup URLs that are likely broken
 * Only keeps manually verified ones
 */

import { REACT_COMMUNITIES } from '../src/data/communities';
import { writeFileSync } from 'fs';

console.log('🔗 Removing unverified meetup URLs...');
console.log('');

// Only keep these manually verified URLs
const VERIFIED_MEETUP_SLUGS = [
  'react-to-react-athens-meetup', // Manually fixed
  // Add more as we verify them
];

let removed = 0;
let kept = 0;

const updated = REACT_COMMUNITIES.map(c => {
  if (!c.meetup_url) return c;

  // Check if verified
  const isVerified = VERIFIED_MEETUP_SLUGS.some(slug => c.meetup_url?.includes(slug));

  if (isVerified) {
    console.log('✓ Keeping:', c.name);
    kept++;
    return c;
  }

  // Remove unverified URL
  console.log('✗ Removing:', c.name, '(auto-generated, likely broken)');
  removed++;
  return { ...c, meetup_url: undefined };
});

console.log('');
console.log(`✅ Removed ${removed} unverified URLs`);
console.log(`✅ Kept ${kept} verified URLs`);
console.log('');
console.log('💡 Tip: Users can submit correct URLs via "Add Community" form');
console.log('💡 Or we can manually add them as we verify');

// Write back
const output = `/**
 * React Communities - Single Source of Truth
 * ${updated.length} communities merged from all sources
 * Last updated: ${new Date().toISOString()}
 * Unverified meetup URLs removed - will be added as verified
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

console.log('✅ Updated src/data/communities.ts');
console.log('');
console.log('Next: Visit /admin/reset to re-seed Redis');
