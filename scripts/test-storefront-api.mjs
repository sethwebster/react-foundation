#!/usr/bin/env node

/**
 * Test Shopify Storefront API Token
 *
 * Verifies that your SHOPIFY_STOREFRONT_TOKEN is working correctly
 */

import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const envPath = join(__dirname, '..', '.env');
const envContent = await readFile(envPath, 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=:#]+)=(.*)$/);
  if (match) {
    env[match[1].trim()] = match[2].trim();
  }
});

const SHOPIFY_STORE_DOMAIN = env.SHOPIFY_STORE_DOMAIN;
const SHOPIFY_STOREFRONT_TOKEN = env.SHOPIFY_STOREFRONT_TOKEN;
const SHOPIFY_API_VERSION = '2024-10';

console.log('\n🔍 Testing Shopify Storefront API Token\n');
console.log('━'.repeat(60));
console.log(`Store Domain: ${SHOPIFY_STORE_DOMAIN}`);
console.log(`Token: ${SHOPIFY_STOREFRONT_TOKEN?.substring(0, 10)}...`);
console.log(`API Version: ${SHOPIFY_API_VERSION}`);
console.log('━'.repeat(60));
console.log();

if (!SHOPIFY_STOREFRONT_TOKEN) {
  console.error('❌ SHOPIFY_STOREFRONT_TOKEN not set in .env');
  console.log('\n📖 To fix this:');
  console.log('1. Go to Shopify admin → Settings → Apps and sales channels');
  console.log('2. Click "Develop apps"');
  console.log('3. Create or select your app');
  console.log('4. Click "Configure" under Storefront API');
  console.log('5. Enable these scopes:');
  console.log('   - unauthenticated_read_product_listings');
  console.log('   - unauthenticated_read_product_inventory');
  console.log('   - unauthenticated_read_product_tags');
  console.log('6. Save → Install app');
  console.log('7. Copy the Storefront API access token');
  console.log('8. Add to .env: SHOPIFY_STOREFRONT_TOKEN=your_token_here\n');
  process.exit(1);
}

const ENDPOINT = `https://${SHOPIFY_STORE_DOMAIN}/api/${SHOPIFY_API_VERSION}/graphql.json`;

const testQuery = `
  query {
    products(first: 1) {
      edges {
        node {
          id
          title
          handle
        }
      }
    }
  }
`;

console.log('📡 Sending test query...\n');

try {
  const response = await fetch(ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': SHOPIFY_STOREFRONT_TOKEN,
    },
    body: JSON.stringify({ query: testQuery }),
  });

  console.log(`Response Status: ${response.status} ${response.statusText}`);

  if (!response.ok) {
    console.log('\n❌ API Request Failed\n');

    if (response.status === 401) {
      console.log('🔑 Authentication Error (401 Unauthorized)');
      console.log('\nThis means your token is invalid or missing required scopes.\n');
      console.log('📖 To fix this:');
      console.log('1. Go to: https://admin.shopify.com/store/' + SHOPIFY_STORE_DOMAIN.replace('.myshopify.com', '') + '/settings/apps');
      console.log('2. Click "Develop apps"');
      console.log('3. Click your app → "API credentials"');
      console.log('4. Under "Storefront API", click "Configure"');
      console.log('5. Enable these scopes:');
      console.log('   ✓ unauthenticated_read_product_listings');
      console.log('   ✓ unauthenticated_read_product_inventory');
      console.log('   ✓ unauthenticated_read_product_tags');
      console.log('6. Save → "Install app"');
      console.log('7. Go to "API credentials" → Reveal the Storefront API access token');
      console.log('8. Update .env: SHOPIFY_STOREFRONT_TOKEN=your_new_token');
      console.log('9. Restart your dev server\n');
    } else if (response.status === 403) {
      console.log('🚫 Permission Error (403 Forbidden)');
      console.log('\nYour token is valid but lacks required scopes.');
      console.log('Update the scopes as described above.\n');
    }

    process.exit(1);
  }

  const result = await response.json();

  if (result.errors) {
    console.log('\n❌ GraphQL Errors:\n');
    console.log(JSON.stringify(result.errors, null, 2));
    process.exit(1);
  }

  console.log('\n✅ Success! API is working correctly.\n');

  if (result.data?.products?.edges?.length > 0) {
    const product = result.data.products.edges[0].node;
    console.log('Sample Product:');
    console.log(`  Title: ${product.title}`);
    console.log(`  Handle: ${product.handle}`);
    console.log(`  ID: ${product.id}`);
  }

  console.log('\n✨ Your Storefront API token is configured correctly!');
  console.log('   The website will now fetch products from Shopify.\n');

} catch (error) {
  console.log('\n❌ Error:', error.message);
  console.log('\nCheck your network connection and try again.\n');
  process.exit(1);
}
