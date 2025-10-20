#!/usr/bin/env node

/**
 * List all drop collections and their statuses
 *
 * Usage:
 *   node --env-file=.env scripts/shopify-list-drops.mjs
 */

const SHOPIFY_STORE_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN;
const SHOPIFY_ADMIN_TOKEN = process.env.SHOPIFY_ADMIN_TOKEN;
const SHOPIFY_API_VERSION = '2024-10';

if (!SHOPIFY_STORE_DOMAIN || !SHOPIFY_ADMIN_TOKEN) {
  console.error('❌ Missing SHOPIFY_STORE_DOMAIN or SHOPIFY_ADMIN_TOKEN');
  process.exit(1);
}

const ADMIN_ENDPOINT = `https://${SHOPIFY_STORE_DOMAIN}/admin/api/${SHOPIFY_API_VERSION}/graphql.json`;

async function shopifyAdminFetch(query, variables = {}) {
  const response = await fetch(ADMIN_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': SHOPIFY_ADMIN_TOKEN,
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    throw new Error(`Shopify API error: ${response.status}`);
  }

  const result = await response.json();

  if (result.errors) {
    throw new Error(`GraphQL errors: ${JSON.stringify(result.errors, null, 2)}`);
  }

  return result.data;
}

async function listAllDrops() {
  const query = `
    query getCollections($first: Int!) {
      collections(first: $first) {
        edges {
          node {
            id
            handle
            title
            productsCount {
              count
            }
            isDrop: metafield(namespace: "react_foundation", key: "is_drop") { value }
            dropNumber: metafield(namespace: "react_foundation", key: "drop_number") { value }
            dropSeason: metafield(namespace: "react_foundation", key: "drop_season") { value }
            dropYear: metafield(namespace: "react_foundation", key: "drop_year") { value }
            dropTheme: metafield(namespace: "react_foundation", key: "drop_theme") { value }
            dropStartDate: metafield(namespace: "react_foundation", key: "drop_start_date") { value }
            dropEndDate: metafield(namespace: "react_foundation", key: "drop_end_date") { value }
          }
        }
      }
    }
  `;

  const data = await shopifyAdminFetch(query, { first: 50 });

  const drops = data.collections.edges
    .map(({ node }) => {
      const dropStartDate = node.dropStartDate?.value || '';
      const dropEndDate = node.dropEndDate?.value || '';

      // Calculate status from dates
      const now = new Date();
      let dropStatus = 'unknown';

      if (dropStartDate && dropEndDate) {
        const start = new Date(dropStartDate);
        const end = new Date(dropEndDate);

        if (now < start) {
          dropStatus = 'upcoming';
        } else if (now > end) {
          dropStatus = 'past';
        } else {
          dropStatus = 'current';
        }
      } else if (dropStartDate) {
        const start = new Date(dropStartDate);
        dropStatus = now < start ? 'upcoming' : 'current';
      } else {
        dropStatus = 'current'; // No dates = assume current
      }

      return {
        id: node.id,
        handle: node.handle,
        title: node.title,
        productCount: node.productsCount?.count || 0,
        isDrop: node.isDrop?.value === 'true',
        dropNumber: node.dropNumber?.value ? parseInt(node.dropNumber.value, 10) : null,
        dropStatus,
        dropSeason: node.dropSeason?.value || '',
        dropYear: node.dropYear?.value || '',
        dropTheme: node.dropTheme?.value || '',
        dropStartDate,
        dropEndDate,
      };
    })
    .filter((c) => c.isDrop)
    .sort((a, b) => (b.dropNumber || 0) - (a.dropNumber || 0));

  console.log('\n📋 All Drop Collections:\n');

  if (drops.length === 0) {
    console.log('   No drop collections found.');
    console.log('   Use shopify-create-drop.mjs to create your first drop.\n');
    return;
  }

  // Group by status
  const current = drops.filter((d) => d.dropStatus === 'current');
  const upcoming = drops.filter((d) => d.dropStatus === 'upcoming');
  const past = drops.filter((d) => d.dropStatus === 'past');

  if (current.length > 0) {
    console.log('🟢 CURRENT DROPS:');
    current.forEach((drop) => {
      console.log(`   Drop ${drop.dropNumber?.toString().padStart(2, '0')} · ${drop.dropSeason} ${drop.dropYear}`);
      console.log(`   Theme: ${drop.dropTheme}`);
      console.log(`   Handle: ${drop.handle}`);
      console.log(`   Products: ${drop.productCount}`);
      if (drop.dropEndDate) console.log(`   Ends: ${drop.dropEndDate}`);
      console.log('');
    });
  }

  if (upcoming.length > 0) {
    console.log('🟡 UPCOMING DROPS:');
    upcoming.forEach((drop) => {
      console.log(`   Drop ${drop.dropNumber?.toString().padStart(2, '0')} · ${drop.dropSeason} ${drop.dropYear}`);
      console.log(`   Theme: ${drop.dropTheme}`);
      console.log(`   Handle: ${drop.handle}`);
      if (drop.dropStartDate) console.log(`   Starts: ${drop.dropStartDate}`);
      console.log('');
    });
  }

  if (past.length > 0) {
    console.log('⚫ PAST DROPS:');
    past.forEach((drop) => {
      console.log(`   Drop ${drop.dropNumber?.toString().padStart(2, '0')} · ${drop.dropSeason} ${drop.dropYear}`);
      console.log(`   Theme: ${drop.dropTheme}`);
      console.log(`   Handle: ${drop.handle}`);
      console.log(`   Products: ${drop.productCount}`);
      console.log('');
    });
  }

  console.log('---');
  console.log(`Total: ${drops.length} drops (${current.length} current, ${upcoming.length} upcoming, ${past.length} past)\n`);
}

listAllDrops().catch((error) => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});
