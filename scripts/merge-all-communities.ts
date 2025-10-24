/**
 * Merge All Community Data Sources
 * Combines JSON + manual TypeScript data, deduplicates, keeps best of each
 */

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { REACT_COMMUNITIES } from '../src/data/communities';
import type { Community } from '../src/types/community';

// Comprehensive city coordinates - covers all missing locations
const CITY_COORDINATES: Record<string, any> = {
  // Add all the missing cities
  'Chicago': { lat: 41.8781, lng: -87.6298, timezone: 'America/Chicago', region: 'Illinois', country: 'United States' },
  'Medellín': { lat: 6.2476, lng: -75.5658, timezone: 'America/Bogota', country: 'Colombia' },
  'Oslo': { lat: 59.9139, lng: 10.7522, timezone: 'Europe/Oslo', country: 'Norway' },
  'Washington': { lat: 38.9072, lng: -77.0369, timezone: 'America/New_York', region: 'District of Columbia', country: 'United States' },
  'Manila': { lat: 14.5995, lng: 120.9842, timezone: 'Asia/Manila', country: 'Philippines' },
  'Los Angeles': { lat: 34.0522, lng: -118.2437, timezone: 'America/Los_Angeles', region: 'California', country: 'United States' },
  'Helsinki': { lat: 60.1699, lng: 24.9384, timezone: 'Europe/Helsinki', country: 'Finland' },
  'Kansas City': { lat: 39.0997, lng: -94.5786, timezone: 'America/Chicago', region: 'Missouri', country: 'United States' },
  'Mexico City': { lat: 19.4326, lng: -99.1332, timezone: 'America/Mexico_City', country: 'Mexico' },
  'Indianapolis': { lat: 39.7684, lng: -86.1581, timezone: 'America/Indiana/Indianapolis', region: 'Indiana', country: 'United States' },
  'Dallas': { lat: 32.7767, lng: -96.7970, timezone: 'America/Chicago', region: 'Texas', country: 'United States' },
  'Las Vegas': { lat: 36.1699, lng: -115.1398, timezone: 'America/Los_Angeles', region: 'Nevada', country: 'United States' },
  'Irvine': { lat: 33.6846, lng: -117.8265, timezone: 'America/Los_Angeles', region: 'California', country: 'United States' },
  'Charlotte': { lat: 35.2271, lng: -80.8431, timezone: 'America/New_York', region: 'North Carolina', country: 'United States' },
  'Johannesburg': { lat: -26.2041, lng: 28.0473, timezone: 'Africa/Johannesburg', country: 'South Africa' },
  'Columbus': { lat: 39.9612, lng: -82.9988, timezone: 'America/New_York', region: 'Ohio', country: 'United States' },
  'Osaka': { lat: 34.6937, lng: 135.5023, timezone: 'Asia/Tokyo', country: 'Japan' },

  // Existing ones
  'Tirana, Albania': { lat: 41.3275, lng: 19.8187, timezone: 'Europe/Tirane', country: 'Albania' },
  'Buenos Aires, Argentina': { lat: -34.6037, lng: -58.3816, timezone: 'America/Argentina/Buenos_Aires', country: 'Argentina' },
  'Brisbane, Australia': { lat: -27.4698, lng: 153.0251, timezone: 'Australia/Brisbane', region: 'Queensland', country: 'Australia' },
  'Melbourne, Australia': { lat: -37.8136, lng: 144.9631, timezone: 'Australia/Melbourne', region: 'Victoria', country: 'Australia' },
  'Sydney, Australia': { lat: -33.8688, lng: 151.2093, timezone: 'Australia/Sydney', region: 'New South Wales', country: 'Australia' },
  'Vienna, Austria': { lat: 48.2082, lng: 16.3738, timezone: 'Europe/Vienna', country: 'Austria' },
  'Brussels, Belgium': { lat: 50.8503, lng: 4.3517, timezone: 'Europe/Brussels', country: 'Belgium' },
  'Paris, France': { lat: 48.8566, lng: 2.3522, timezone: 'Europe/Paris', country: 'France' },
  'München, Germany': { lat: 48.1351, lng: 11.5820, timezone: 'Europe/Berlin', region: 'Bavaria', country: 'Germany' },
  'Berlin, Germany': { lat: 52.52, lng: 13.405, timezone: 'Europe/Berlin', country: 'Germany' },
  'Zurich, Switzerland': { lat: 47.3769, lng: 8.5417, timezone: 'Europe/Zurich', country: 'Switzerland' },
  'Barcelona, Spain': { lat: 41.3851, lng: 2.1734, timezone: 'Europe/Madrid', region: 'Catalonia', country: 'Spain' },
  'Madrid, Spain': { lat: 40.4168, lng: -3.7038, timezone: 'Europe/Madrid', country: 'Spain' },
  'Warsaw, Poland': { lat: 52.2297, lng: 21.0122, timezone: 'Europe/Warsaw', country: 'Poland' },
  'Wroclaw, Poland': { lat: 51.1079, lng: 17.0385, timezone: 'Europe/Warsaw', country: 'Poland' },
  'Seattle, WA, USA': { lat: 47.6062, lng: -122.3321, timezone: 'America/Los_Angeles', region: 'Washington', country: 'United States' },
  'Denver, CO, USA': { lat: 39.7392, lng: -104.9903, timezone: 'America/Denver', region: 'Colorado', country: 'United States' },
  'Atlanta, GA, USA': { lat: 33.7490, lng: -84.3880, timezone: 'America/New_York', region: 'Georgia', country: 'United States' },
  'Austin, TX, USA': { lat: 30.2672, lng: -97.7431, timezone: 'America/Chicago', region: 'Texas', country: 'United States' },
  'New York, NY, USA': { lat: 40.7128, lng: -74.0060, timezone: 'America/New_York', region: 'New York', country: 'United States' },
  'Boston, MA, USA': { lat: 42.3601, lng: -71.0589, timezone: 'America/New_York', region: 'Massachusetts', country: 'United States' },
  'San Francisco, CA, USA': { lat: 37.7749, lng: -122.4194, timezone: 'America/Los_Angeles', region: 'California', country: 'United States' },
  'Vancouver, BC, Canada': { lat: 49.2827, lng: -123.1207, timezone: 'America/Vancouver', region: 'British Columbia', country: 'Canada' },
  'Halifax, NS, Canada': { lat: 44.6488, lng: -63.5752, timezone: 'America/Halifax', region: 'Nova Scotia', country: 'Canada' },
  'Ottawa, ON, Canada': { lat: 45.4215, lng: -75.6972, timezone: 'America/Toronto', region: 'Ontario', country: 'Canada' },
  'Toronto, ON, Canada': { lat: 43.6532, lng: -79.3832, timezone: 'America/Toronto', region: 'Ontario', country: 'Canada' },
  'Montreal, QC, Canada': { lat: 45.5017, lng: -73.5673, timezone: 'America/Toronto', region: 'Quebec', country: 'Canada' },
  'London, UK': { lat: 51.5074, lng: -0.1278, timezone: 'Europe/London', country: 'United Kingdom' },
  'Amsterdam, Netherlands': { lat: 52.3676, lng: 4.9041, timezone: 'Europe/Amsterdam', country: 'Netherlands' },
  'Tel Aviv, Israel': { lat: 32.0853, lng: 34.7818, timezone: 'Asia/Jerusalem', country: 'Israel' },
  'Bangalore, India': { lat: 12.9716, lng: 77.5946, timezone: 'Asia/Kolkata', region: 'Karnataka', country: 'India' },
  'Pune, India': { lat: 18.5204, lng: 73.8567, timezone: 'Asia/Kolkata', region: 'Maharashtra', country: 'India' },
  'New Delhi, India': { lat: 28.6139, lng: 77.2090, timezone: 'Asia/Kolkata', region: 'Delhi', country: 'India' },
  'Jaipur, India': { lat: 26.9124, lng: 75.7873, timezone: 'Asia/Kolkata', region: 'Rajasthan', country: 'India' },
  'Kuala Lumpur, Malaysia': { lat: 3.1390, lng: 101.6869, timezone: 'Asia/Kuala_Lumpur', country: 'Malaysia' },
  'Lagos, Nigeria': { lat: 6.5244, lng: 3.3792, timezone: 'Africa/Lagos', country: 'Nigeria' },
  'Nairobi, Kenya': { lat: -1.2921, lng: 36.8219, timezone: 'Africa/Nairobi', country: 'Kenya' },
};

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function normalizeName(name: string): string {
  return name.toLowerCase().trim().replace(/[^a-z0-9]/g, '');
}

async function main() {
  console.log('🔄 Merging all community data sources...');
  console.log('');

  // Source 1: Manual TypeScript data (26-60 communities with good structure)
  const manualCommunities = REACT_COMMUNITIES;
  console.log(`📝 Manual data: ${manualCommunities.length} communities`);

  // Source 2: JSON data (43 communities from react.dev)
  const jsonPath = join(process.cwd(), 'data', 'normalized-meetups-data.json');
  const jsonData = JSON.parse(readFileSync(jsonPath, 'utf-8'));
  console.log(`📥 JSON data: ${jsonData.length} communities`);
  console.log('');

  // Create a map for deduplication (key = normalized name)
  const communityMap = new Map<string, Community>();

  // Add manual communities first (fixing bad coordinates)
  let fixed = 0;
  manualCommunities.forEach(comm => {
    const key = normalizeName(comm.name);

    // Fix coordinates if missing
    if (comm.coordinates.lat === 0 || comm.coordinates.lng === 0) {
      const cityCoords = CITY_COORDINATES[comm.city] || CITY_COORDINATES[`${comm.city}, ${comm.country}`];
      if (cityCoords) {
        comm.coordinates = { lat: cityCoords.lat, lng: cityCoords.lng };
        comm.timezone = cityCoords.timezone;
        if (cityCoords.region) comm.region = cityCoords.region;
        fixed++;
        console.log(`  🔧 Fixed: ${comm.name} → (${cityCoords.lat}, ${cityCoords.lng})`);
      }
    }

    communityMap.set(key, comm);
  });

  console.log(`✅ Added manual communities (fixed ${fixed} coordinates)`);

  // Add JSON communities, only if not already present
  let added = 0;
  let skipped = 0;

  jsonData.forEach((item: any) => {
    const key = normalizeName(item.name);

    if (communityMap.has(key)) {
      skipped++;
      // Update member count if JSON has more recent data
      const existing = communityMap.get(key)!;
      if (item.members > existing.member_count) {
        console.log(`  📊 Updating ${item.name}: ${existing.member_count} → ${item.members} members`);
        existing.member_count = item.members;
      }
      return;
    }

    // Transform and add new community
    const cityParts = item.location.split(',');
    const city = cityParts[0].trim();
    const country = cityParts[cityParts.length - 1].trim();

    // Try: full location, then just city name
    let locationData = CITY_COORDINATES[item.location] || CITY_COORDINATES[city];

    if (!locationData) {
      console.warn(`⚠️  Missing coordinates: "${item.name}" | city="${city}" | location="${item.location}"`);
      locationData = { lat: 0, lng: 0, timezone: 'UTC', country };
    } else {
      // Use country from data
      locationData = { ...locationData, country: locationData.country || country };
    }

    const newCommunity: Community = {
      id: slugify(item.name),
      name: item.name,
      slug: slugify(item.name),
      city,
      region: locationData.region,
      country: locationData.country,
      timezone: locationData.timezone,
      coordinates: { lat: locationData.lat, lng: locationData.lng },
      organizers: item.organizers.filter((o: string) => o && !o.includes('no organizer')).map((name: string, idx: number) => ({
        id: slugify(name),
        name: name.replace(/,.*$/, ''),
        role: idx === 0 ? 'Lead Organizer' : 'Co-Organizer',
      })),
      founded_date: item.dateFounded ? `${item.dateFounded}-01-01` : '2015-01-01',
      event_types: item.hasHackathons ? ['meetup', 'hackathon'] : ['meetup'],
      description: item.description,
      member_count: item.members,
      typical_attendance: Math.max(Math.floor(item.members * 0.03), 10),
      meeting_frequency: item.meetupFrequency.toLowerCase().includes('monthly') ? 'monthly' :
                        item.meetupFrequency.toLowerCase().includes('quarterly') ? 'quarterly' : 'irregular',
      primary_language: 'English',
      status: item.status === 'active' ? 'active' : 'inactive',
      invite_only: false,
      verified: true,
      cois_tier: item.members >= 8000 ? 'platinum' :
                 item.members >= 4000 ? 'gold' :
                 item.members >= 1500 ? 'silver' :
                 item.members >= 500 ? 'bronze' : undefined,
      cois_score: item.members >= 500 ? 0.5 + (Math.log10(item.members) / 10) : undefined,
      meetup_url: `https://www.meetup.com/${slugify(item.name)}/`,
      website: item.website || undefined,
      last_event_date: item.lastEventYear ? `${item.lastEventYear}-12-31` : undefined,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    communityMap.set(key, newCommunity);
    added++;
  });

  console.log(`✅ Added ${added} new communities from JSON`);
  console.log(`⏭️  Skipped ${skipped} duplicates`);
  console.log('');

  // Convert map to array
  const merged = Array.from(communityMap.values());

  // Sort by member count descending
  merged.sort((a, b) => b.member_count - a.member_count);

  console.log('📊 Final merged list:');
  console.log(`   Total: ${merged.length} communities`);
  console.log(`   Active: ${merged.filter(c => c.status === 'active').length}`);
  console.log(`   Countries: ${new Set(merged.map(c => c.country)).size}`);
  console.log(`   Total Members: ${merged.reduce((sum, c) => sum + c.member_count, 0).toLocaleString()}`);
  console.log('');

  // Tier distribution
  const tiers = merged.reduce((acc, c) => {
    const tier = c.cois_tier || 'none';
    acc[tier] = (acc[tier] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  console.log('Tier Distribution:');
  Object.entries(tiers).sort((a, b) => b[1] - a[1]).forEach(([tier, count]) => {
    console.log(`   ${tier}: ${count}`);
  });
  console.log('');

  console.log('Top 10 by members:');
  merged.slice(0, 10).forEach((c, i) => {
    console.log(`   ${i + 1}. ${c.name} (${c.city}, ${c.country}) - ${c.member_count.toLocaleString()} members`);
  });
  console.log('');

  // Write to communities.ts
  console.log('📝 Writing to src/data/communities.ts...');

  const output = `/**
 * React Communities - Single Source of Truth
 * ${merged.length} communities merged from all sources
 * Last updated: ${new Date().toISOString()}
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

  writeFileSync('src/data/communities.ts', output);

  console.log('✅ Wrote to src/data/communities.ts');
  console.log('');
  console.log('Next: Visit /admin and click Reset to re-seed Redis');
  console.log(`✅ ${merged.length} communities ready!`);
}

main().catch(console.error);
