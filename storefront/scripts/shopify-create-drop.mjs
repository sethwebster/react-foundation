#!/usr/bin/env node

/**
 * Create a new drop collection in Shopify with all required metafields
 *
 * Usage:
 *   node --env-file=.env scripts/shopify-create-drop.mjs 7 Summer 2025 "Neon Pulse"
 */

const SHOPIFY_STORE_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN;
const SHOPIFY_ADMIN_TOKEN = process.env.SHOPIFY_ADMIN_TOKEN;
const SHOPIFY_API_VERSION = '2024-10';

if (!SHOPIFY_STORE_DOMAIN || !SHOPIFY_ADMIN_TOKEN) {
  console.error('❌ Missing SHOPIFY_STORE_DOMAIN or SHOPIFY_ADMIN_TOKEN');
  console.error('   Add these to your .env file');
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

async function createDropCollection(dropNumber, season, year, theme) {
  const handle = `drop-${dropNumber.toString().padStart(2, '0')}-${season.toLowerCase()}-${year}`;
  const title = `Drop ${dropNumber.toString().padStart(2, '0')} · ${season} ${year}`;
  const description = `${theme} - Limited edition ${season} ${year} drop from React Foundation.`;

  console.log(`\n🚀 Creating drop collection: ${title}`);
  console.log(`   Handle: ${handle}`);
  console.log(`   Theme: ${theme}\n`);

  const mutation = `
    mutation createCollection($input: CollectionInput!) {
      collectionCreate(input: $input) {
        collection {
          id
          handle
          title
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  const input = {
    title,
    handle,
    descriptionHtml: `<p>${description}</p>`,
    metafields: [
      {
        namespace: 'react_foundation',
        key: 'is_drop',
        value: 'true',
        type: 'boolean',
      },
      {
        namespace: 'react_foundation',
        key: 'drop_number',
        value: dropNumber.toString(),
        type: 'number_integer',
      },
      {
        namespace: 'react_foundation',
        key: 'drop_season',
        value: season,
        type: 'single_line_text_field',
      },
      {
        namespace: 'react_foundation',
        key: 'drop_year',
        value: year.toString(),
        type: 'number_integer',
      },
      {
        namespace: 'react_foundation',
        key: 'drop_theme',
        value: theme,
        type: 'single_line_text_field',
      },
    ],
  };

  const data = await shopifyAdminFetch(mutation, { input });

  if (data.collectionCreate.userErrors.length > 0) {
    console.error('❌ Errors creating collection:');
    data.collectionCreate.userErrors.forEach((error) => {
      console.error(`   ${error.field}: ${error.message}`);
    });
    process.exit(1);
  }

  const collection = data.collectionCreate.collection;
  console.log('✅ Collection created successfully!');
  console.log(`   ID: ${collection.id}`);
  console.log(`   Handle: ${collection.handle}`);
  console.log(`   Title: ${collection.title}`);
  console.log('\n📝 Next steps:');
  console.log('   1. In Shopify admin, edit this collection');
  console.log('   2. Add products to the collection');
  console.log('   3. Upload a collection image');
  console.log('   4. Set drop_start_date and drop_end_date metafields');
  console.log('   5. Status will automatically transition based on dates!');
  console.log('\n💡 Tip: Set drop_start_date to today to make it "current" immediately\n');
}

// Parse command line arguments
const [dropNumber, season, year, theme] = process.argv.slice(2);

if (!dropNumber || !season || !year || !theme) {
  console.error('Usage: node scripts/shopify-create-drop.mjs <number> <season> <year> <theme>');
  console.error('Example: node scripts/shopify-create-drop.mjs 7 Summer 2025 "Neon Pulse"');
  process.exit(1);
}

createDropCollection(
  parseInt(dropNumber, 10),
  season,
  parseInt(year, 10),
  theme
).catch((error) => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});
