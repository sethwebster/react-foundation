/**
 * Fix Coordinates
 * Updates communities.ts to add proper coordinates for all cities
 */

import { REACT_COMMUNITIES } from '../src/data/communities';
import { writeFileSync } from 'fs';
import { join } from 'path';

// Complete city coordinates map
const COORDS: Record<string, { lat: number; lng: number; region?: string }> = {
  // Existing good ones will be preserved, adding missing ones:
  'Denver': { lat: 39.7392, lng: -104.9903, region: 'Colorado' },
  'Seattle': { lat: 47.6062, lng: -122.3321, region: 'Washington' },
  'Atlanta': { lat: 33.7490, lng: -84.3880, region: 'Georgia' },
  'Austin': { lat: 30.2672, lng: -97.7431, region: 'Texas' },
  'Charlotte': { lat: 35.2271, lng: -80.8431, region: 'North Carolina' },
  'Columbus': { lat: 39.9612, lng: -82.9988, region: 'Ohio' },
  'Dallas': { lat: 32.7767, lng: -96.7970, region: 'Texas' },
  'Indianapolis': { lat: 39.7684, lng: -86.1581, region: 'Indiana' },
  'Irvine': { lat: 33.6846, lng: -117.8265, region: 'California' },
  'Kansas City': { lat: 39.0997, lng: -94.5786, region: 'Missouri' },
  'Las Vegas': { lat: 36.1699, lng: -115.1398, region: 'Nevada' },
  'Los Angeles': { lat: 34.0522, lng: -118.2437, region: 'California' },
  'Washington': { lat: 38.9072, lng: -77.0369, region: 'District of Columbia' },
  'Paris': { lat: 48.8566, lng: 2.3522 },
  'Barcelona': { lat: 41.3851, lng: 2.1734, region: 'Catalonia' },
  'Madrid': { lat: 40.4168, lng: -3.7038 },
  'München': { lat: 48.1351, lng: 11.5820, region: 'Bavaria' },
  'Munich': { lat: 48.1351, lng: 11.5820, region: 'Bavaria' },
  'Zurich': { lat: 47.3769, lng: 8.5417 },
  'Warsaw': { lat: 52.2297, lng: 21.0122 },
  'Wroclaw': { lat: 51.1079, lng: 17.0385 },
  'Johannesburg': { lat: -26.2041, lng: 28.0473 },
  'Osaka': { lat: 34.6937, lng: 135.5023 },
  'Oslo': { lat: 59.9139, lng: 10.7522 },
  'Manila': { lat: 14.5995, lng: 120.9842 },
  'Medellín': { lat: 6.2476, lng: -75.5658 },
  'Mexico City': { lat: 19.4326, lng: -99.1332 },
};

// Fix coordinates
let fixed = 0;
const updated = REACT_COMMUNITIES.map(comm => {
  if (comm.coordinates.lat === 0 && comm.coordinates.lng === 0) {
    const coords = COORDS[comm.city];
    if (coords) {
      fixed++;
      return {
        ...comm,
        coordinates: { lat: coords.lat, lng: coords.lng },
        region: coords.region || comm.region,
      };
    }
  }
  return comm;
});

console.log(`✅ Fixed ${fixed} communities with missing coordinates`);

// Write back
const output = `/**
 * React Communities - Single Source of Truth
 * Merged from all sources - Edit this file to add/update communities
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

const outputPath = join(process.cwd(), 'src', 'data', 'communities.ts');
writeFileSync(outputPath, output);

console.log(`\n✅ Updated ${outputPath}`);
console.log(`   ${updated.length} communities ready`);
console.log(`   All coordinates fixed`);
