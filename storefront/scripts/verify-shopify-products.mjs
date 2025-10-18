#!/usr/bin/env node

/**
 * Verify Shopify Products
 *
 * Quick script to list all products in your Shopify store
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
    console.error('GraphQL Errors:', result.errors);
    throw new Error('GraphQL query failed');
  }

  return result.data;
}

async function listProducts() {
  console.log('🔍 Fetching products from Shopify...\n');

  const query = `
    query {
      products(first: 50) {
        edges {
          node {
            id
            title
            handle
            status
            totalInventory
            variants(first: 1) {
              edges {
                node {
                  price
                }
              }
            }
            unlockTier: metafield(namespace: "react_foundation", key: "unlock_tier") {
              value
            }
          }
        }
      }
      collections(first: 10) {
        edges {
          node {
            id
            title
            productsCount {
              count
            }
          }
        }
      }
    }
  `;

  const data = await shopifyGraphQL(query);

  console.log('📦 Products:\n');
  data.products.edges.forEach(({ node }, index) => {
    const price = node.variants.edges[0]?.node.price || 'N/A';
    const unlockTier = node.unlockTier?.value || 'N/A';
    console.log(`${index + 1}. ${node.title}`);
    console.log(`   Handle: ${node.handle}`);
    console.log(`   Status: ${node.status}`);
    console.log(`   Price: $${price}`);
    console.log(`   Inventory: ${node.totalInventory}`);
    console.log(`   Unlock Tier: ${unlockTier}`);
    console.log(`   ID: ${node.id}`);
    console.log('');
  });

  console.log('\n📂 Collections:\n');
  data.collections.edges.forEach(({ node }, index) => {
    console.log(`${index + 1}. ${node.title} (${node.productsCount} products)`);
    console.log(`   ID: ${node.id}`);
    console.log('');
  });

  console.log(`\n✨ Total: ${data.products.edges.length} products, ${data.collections.edges.length} collections`);
}

listProducts().catch(error => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});
