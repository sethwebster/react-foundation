#!/usr/bin/env node

/**
 * Create all React Foundation metafield definitions in Shopify
 *
 * This script creates all the custom metafields needed for the React Foundation Store
 * taxonomy system. Run this once when setting up a new Shopify store.
 *
 * Usage:
 *   npm run shopify:setup-metafields
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

// Product metafield definitions
const PRODUCT_METAFIELDS = [
  {
    name: 'Is Hero',
    key: 'is_hero',
    description: 'Mark this product as the hero/featured product on the home page',
    type: 'boolean',
  },
  {
    name: 'Featured Look Order',
    key: 'featured_look_order',
    description: 'Order in the Featured Look showcase (1, 2, or 3)',
    type: 'number_integer',
    validations: [{ name: 'min', value: '1' }, { name: 'max', value: '3' }],
  },
  {
    name: 'Unlock Tier',
    key: 'unlock_tier',
    description: 'Tier required to purchase: contributor, sustainer, or core',
    type: 'single_line_text_field',
    validations: [
      {
        name: 'choices',
        value: JSON.stringify(['contributor', 'sustainer', 'core']),
      },
    ],
  },
  {
    name: 'Tagline',
    key: 'tagline',
    description: 'Short tagline for product cards',
    type: 'single_line_text_field',
  },
  {
    name: 'Release Window',
    key: 'release_window',
    description: 'When the product releases (e.g., "Drop 05 · Winter 2025")',
    type: 'single_line_text_field',
  },
  {
    name: 'Accent Gradient',
    key: 'accent_gradient',
    description: 'Tailwind gradient classes for theming (e.g., "from-sky-400 via-indigo-500 to-purple-500")',
    type: 'single_line_text_field',
  },
  {
    name: 'Rating',
    key: 'rating',
    description: 'Product rating (0-5)',
    type: 'number_decimal',
    validations: [{ name: 'min', value: '0' }, { name: 'max', value: '5' }],
  },
  {
    name: 'Rating Count',
    key: 'rating_count',
    description: 'Number of reviews',
    type: 'number_integer',
    validations: [{ name: 'min', value: '0' }],
  },
  {
    name: 'Features',
    key: 'features',
    description: 'JSON array of product features',
    type: 'json',
  },
  {
    name: 'Highlights',
    key: 'highlights',
    description: 'JSON array of impact highlights',
    type: 'json',
  },
  {
    name: 'Specs',
    key: 'specs',
    description: 'JSON array of spec objects: [{"label": "Fit", "value": "Unisex"}]',
    type: 'json',
  },
  {
    name: 'Is Perennial',
    key: 'is_perennial',
    description: 'Mark this product as always available (not time-limited)',
    type: 'boolean',
  },
];

// Collection metafield definitions
const COLLECTION_METAFIELDS = [
  {
    name: 'Is Drop',
    key: 'is_drop',
    description: 'Mark this collection as a time-limited drop',
    type: 'boolean',
  },
  {
    name: 'Drop Number',
    key: 'drop_number',
    description: 'Sequential drop number (5, 6, 7, etc.)',
    type: 'number_integer',
    validations: [{ name: 'min', value: '1' }],
  },
  {
    name: 'Drop Start Date',
    key: 'drop_start_date',
    description: 'When the drop goes live (YYYY-MM-DD)',
    type: 'date',
  },
  {
    name: 'Drop End Date',
    key: 'drop_end_date',
    description: 'When the drop ends (YYYY-MM-DD)',
    type: 'date',
  },
  {
    name: 'Drop Season',
    key: 'drop_season',
    description: 'Season identifier',
    type: 'single_line_text_field',
    validations: [
      {
        name: 'choices',
        value: JSON.stringify(['Winter', 'Spring', 'Summer', 'Fall']),
      },
    ],
  },
  {
    name: 'Drop Year',
    key: 'drop_year',
    description: 'Year of the drop',
    type: 'number_integer',
    validations: [{ name: 'min', value: '2025' }],
  },
  {
    name: 'Drop Theme',
    key: 'drop_theme',
    description: 'Short theme name for the drop (e.g., "Ocean Breeze")',
    type: 'single_line_text_field',
  },
  {
    name: 'Limited Edition Size',
    key: 'limited_edition_size',
    description: 'Total number of units in this drop',
    type: 'number_integer',
    validations: [{ name: 'min', value: '1' }],
  },
  {
    name: 'Is Perennial',
    key: 'is_perennial',
    description: 'Mark this collection as always-available (not time-limited)',
    type: 'boolean',
  },
  {
    name: 'Collection Type',
    key: 'collection_type',
    description: 'Category of perennial collection',
    type: 'single_line_text_field',
    validations: [
      {
        name: 'choices',
        value: JSON.stringify(['essentials', 'apparel', 'accessories', 'drinkware']),
      },
    ],
  },
  {
    name: 'Home Featured',
    key: 'home_featured',
    description: 'Show this collection in Signature Collections on home page',
    type: 'boolean',
  },
  {
    name: 'Home Featured Order',
    key: 'home_featured_order',
    description: 'Order in Signature Collections (1, 2, or 3)',
    type: 'number_integer',
    validations: [{ name: 'min', value: '1' }, { name: 'max', value: '3' }],
  },
  {
    name: 'Accent Gradient',
    key: 'accent_gradient',
    description: 'Tailwind gradient classes for theming',
    type: 'single_line_text_field',
  },
  {
    name: 'Time Limited',
    key: 'time_limited',
    description: 'Mark non-drop collections as time-limited (uses drop_start_date/drop_end_date)',
    type: 'boolean',
  },
];

async function createMetafieldDefinition(ownerType, definition) {
  const mutation = `
    mutation createMetafieldDefinition($definition: MetafieldDefinitionInput!) {
      metafieldDefinitionCreate(definition: $definition) {
        createdDefinition {
          id
          name
          namespace
          key
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  const input = {
    name: definition.name,
    namespace: 'react_foundation',
    key: definition.key,
    description: definition.description,
    type: definition.type,
    ownerType,
  };

  if (definition.validations) {
    input.validations = definition.validations;
  }

  try {
    const data = await shopifyAdminFetch(mutation, { definition: input });

    if (data.metafieldDefinitionCreate.userErrors.length > 0) {
      const errors = data.metafieldDefinitionCreate.userErrors;

      // Check if error is "already exists"
      if (errors.some(e => e.message.includes('taken') || e.message.includes('already exists'))) {
        console.log(`   ⚠️  ${definition.name} - already exists, skipping`);
        return { skipped: true };
      }

      throw new Error(`User errors: ${JSON.stringify(errors, null, 2)}`);
    }

    console.log(`   ✅ ${definition.name}`);
    return data.metafieldDefinitionCreate.createdDefinition;
  } catch (error) {
    console.error(`   ❌ ${definition.name} - ${error.message}`);
    return { error: error.message };
  }
}

async function setupAllMetafields() {
  console.log('\n🔧 Setting up React Foundation metafield definitions...\n');

  // Create product metafields
  console.log('📦 Creating PRODUCT metafield definitions:');
  for (const def of PRODUCT_METAFIELDS) {
    await createMetafieldDefinition('PRODUCT', def);
  }

  console.log('\n📁 Creating COLLECTION metafield definitions:');
  for (const def of COLLECTION_METAFIELDS) {
    await createMetafieldDefinition('COLLECTION', def);
  }

  console.log('\n✅ Setup complete!');
  console.log('\n📝 Next steps:');
  console.log('   1. Go to Shopify Admin → Settings → Custom data');
  console.log('   2. Verify all metafields were created');
  console.log('   3. Start creating drop collections: npm run drops:create');
  console.log('   4. Add products and fill in metafields\n');
}

setupAllMetafields().catch((error) => {
  console.error('\n❌ Error:', error.message);
  process.exit(1);
});
