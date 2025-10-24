/**
 * Verify and Fix Meetup URLs
 * Checks each meetup URL for 404s and searches for correct ones
 */

import { REACT_COMMUNITIES } from '../src/data/communities';
import { writeFileSync } from 'fs';

async function checkUrl(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, {
      method: 'GET', // Need full GET to check content
      redirect: 'follow',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
      }
    });

    if (!response.ok) return false;

    // Meetup.com returns 200 even for missing groups, check content
    const html = await response.text();

    if (html.includes('Group not found') ||
        html.includes("group you're looking for doesn't exist") ||
        html.includes('Page Not Found')) {
      return false;
    }

    return true;
  } catch (error) {
    return false;
  }
}

async function searchMeetupUrl(communityName: string): Promise<string | null> {
  try {
    // Search Google for the meetup page
    const searchQuery = encodeURIComponent(`${communityName} meetup.com`);
    const searchUrl = `https://www.google.com/search?q=${searchQuery}`;

    console.log(`  🔍 Searching: "${communityName} meetup.com"`);

    // Note: This is a placeholder - actual Google search requires API or scraping
    // For now, we'll construct likely URLs and test them

    const nameParts = communityName.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(' ');
    const possibleSlugs = [
      nameParts.join('-'),
      nameParts.filter(p => p !== 'meetup' && p !== 'group').join('-'),
      communityName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
      // Try without location
      nameParts.filter(p => !['meetup', 'group', 'user'].includes(p)).slice(0, 3).join('-'),
    ];

    for (const slug of possibleSlugs) {
      const testUrl = `https://www.meetup.com/${slug}/`;
      console.log(`    Testing: ${slug}`);

      const isValid = await checkUrl(testUrl);
      if (isValid) {
        console.log(`    ✅ Found: ${testUrl}`);
        return testUrl;
      }
    }

    return null;
  } catch (error) {
    return null;
  }
}

async function main() {
  console.log('🔗 Verifying meetup URLs...');
  console.log('');

  const results = {
    working: 0,
    broken: 0,
    fixed: 0,
    notFound: 0,
  };

  const updated = [];

  for (const community of REACT_COMMUNITIES) {
    if (!community.meetup_url) {
      updated.push(community);
      continue;
    }

    console.log(`Checking: ${community.name}`);
    console.log(`  URL: ${community.meetup_url}`);

    const isWorking = await checkUrl(community.meetup_url);

    if (isWorking) {
      console.log(`  ✅ Working`);
      results.working++;
      updated.push(community);
    } else {
      console.log(`  ❌ Broken (404)`);
      results.broken++;

      // Try to find correct URL
      console.log(`  🔍 Searching for correct URL...`);
      const correctUrl = await searchMeetupUrl(community.name);

      if (correctUrl) {
        console.log(`  ✅ Fixed: ${correctUrl}`);
        results.fixed++;
        updated.push({ ...community, meetup_url: correctUrl });
      } else {
        console.log(`  ⚠️  Could not find - removing URL`);
        results.notFound++;
        updated.push({ ...community, meetup_url: undefined });
      }
    }

    console.log('');

    // Rate limit
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log('📊 Results:');
  console.log(`  ✅ Working: ${results.working}`);
  console.log(`  ❌ Broken: ${results.broken}`);
  console.log(`  🔧 Fixed: ${results.fixed}`);
  console.log(`  ⚠️  Not found: ${results.notFound}`);
  console.log('');

  // Write back
  const output = `/**
 * React Communities - Single Source of Truth
 * ${updated.length} communities with verified meetup URLs
 * Last verified: ${new Date().toISOString()}
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
  console.log('Next: Visit /admin/reset to re-seed Redis with verified URLs');
}

main().catch(console.error);
