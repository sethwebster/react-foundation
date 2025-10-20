#!/usr/bin/env node

/**
 * Fix Product Prices in Shopify
 *
 * Updates variant prices for products that have $0.00
 */

import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
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
const SHOPIFY_ADMIN_TOKEN = env.SHOPIFY_ADMIN_TOKEN;
const SHOPIFY_API_VERSION = '2024-10';
const SHOPIFY_GRAPHQL_ENDPOINT = `https://${SHOPIFY_STORE_DOMAIN}/admin/api/${SHOPIFY_API_VERSION}/graphql.json`;

function parsePrice(priceStr) {
  return parseFloat(priceStr.replace(/[$,]/g, ''));
}

async function shopifyGraphQL(query, variables = {}) {
  const response = await fetch(SHOPIFY_GRAPHQL_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': SHOPIFY_ADMIN_TOKEN,
    },
    body: JSON.stringify({ query, variables }),
  });

  const result = await response.json();

  if (result.errors) {
    console.error('GraphQL Errors:', JSON.stringify(result.errors, null, 2));
    throw new Error('GraphQL query failed');
  }

  return result.data;
}

async function getProduct(handle) {
  const query = `
    query getProduct($query: String!) {
      products(first: 1, query: $query) {
        edges {
          node {
            id
            title
            variants(first: 1) {
              edges {
                node {
                  id
                  price
                }
              }
            }
          }
        }
      }
    }
  `;

  const data = await shopifyGraphQL(query, { query: `handle:${handle}` });

  if (data.products.edges.length === 0) {
    return null;
  }

  return data.products.edges[0].node;
}

async function updateVariantPrice(productId, variantId, price) {
  const mutation = `
    mutation productVariantsBulkUpdate($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
      productVariantsBulkUpdate(productId: $productId, variants: $variants) {
        productVariants {
          id
          price
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  const input = {
    productId,
    variants: [
      {
        id: variantId,
        price: price.toFixed(2),
      },
    ],
  };

  const result = await shopifyGraphQL(mutation, input);

  if (result.productVariantsBulkUpdate.userErrors.length > 0) {
    throw new Error(JSON.stringify(result.productVariantsBulkUpdate.userErrors));
  }

  return result.productVariantsBulkUpdate.productVariants[0];
}

async function main() {
  console.log('\n💰 Fixing Product Prices in Shopify\n');
  console.log('━'.repeat(60));

  // Load products from JSON
  const productsPath = join(__dirname, '..', 'src', 'lib', 'products.json');
  const productsData = JSON.parse(await readFile(productsPath, 'utf-8'));
  const products = productsData.products;

  let fixed = 0;
  let skipped = 0;

  for (const product of products) {
    try {
      const shopifyProduct = await getProduct(product.slug);

      if (!shopifyProduct) {
        console.log(`⏭️  Not found: ${product.name}`);
        continue;
      }

      const variant = shopifyProduct.variants.edges[0].node;
      const currentPrice = parseFloat(variant.price);
      const expectedPrice = parsePrice(product.price);

      console.log(`\n📦 ${shopifyProduct.title}`);
      console.log(`   Current price: $${currentPrice.toFixed(2)}`);
      console.log(`   Expected price: $${expectedPrice.toFixed(2)}`);

      if (Math.abs(currentPrice - expectedPrice) < 0.01) {
        console.log(`   ✅ Price is correct`);
        skipped++;
      } else {
        const updated = await updateVariantPrice(
          shopifyProduct.id,
          variant.id,
          expectedPrice
        );
        console.log(`   ✅ Updated to $${updated.price}`);
        fixed++;
      }

      await new Promise(r => setTimeout(r, 500));
    } catch (error) {
      console.error(`\n❌ Error: ${product.name}`, error.message);
    }
  }

  console.log('\n━'.repeat(60));
  console.log(`✨ Complete! Fixed ${fixed} products, ${skipped} already correct`);
  console.log('━'.repeat(60));
  console.log();
}

main().catch(error => {
  console.error('\n❌ Fatal Error:', error.message);
  process.exit(1);
});
