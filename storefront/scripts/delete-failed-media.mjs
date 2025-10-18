#!/usr/bin/env node

/**
 * Delete Failed Media from Shopify Products
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

async function getFailedMedia() {
  const query = `
    query {
      products(first: 20) {
        edges {
          node {
            id
            title
            media(first: 20) {
              edges {
                node {
                  ... on MediaImage {
                    id
                    status
                  }
                }
              }
            }
          }
        }
      }
    }
  `;

  const data = await shopifyGraphQL(query);
  const failedMedia = [];

  data.products.edges.forEach(({ node }) => {
    node.media.edges.forEach(({ node: media }) => {
      if (media.status === 'FAILED') {
        failedMedia.push({
          productId: node.id,
          productTitle: node.title,
          mediaId: media.id,
        });
      }
    });
  });

  return failedMedia;
}

async function deleteMedia(productId, mediaIds) {
  const mutation = `
    mutation productDeleteMedia($productId: ID!, $mediaIds: [ID!]!) {
      productDeleteMedia(productId: $productId, mediaIds: $mediaIds) {
        deletedMediaIds
        userErrors {
          field
          message
        }
      }
    }
  `;

  const result = await shopifyGraphQL(mutation, { productId, mediaIds });

  if (result.productDeleteMedia.userErrors.length > 0) {
    throw new Error(JSON.stringify(result.productDeleteMedia.userErrors));
  }

  return result.productDeleteMedia.deletedMediaIds;
}

async function main() {
  console.log('\n🗑️  Deleting Failed Media\n');
  console.log('━'.repeat(60));

  const failedMedia = await getFailedMedia();

  console.log(`\nFound ${failedMedia.length} failed media items\n`);

  if (failedMedia.length === 0) {
    console.log('✅ No failed media to delete!');
    return;
  }

  // Group by product
  const byProduct = {};
  failedMedia.forEach(item => {
    if (!byProduct[item.productId]) {
      byProduct[item.productId] = {
        title: item.productTitle,
        mediaIds: [],
      };
    }
    byProduct[item.productId].mediaIds.push(item.mediaId);
  });

  let deleted = 0;

  for (const [productId, { title, mediaIds }] of Object.entries(byProduct)) {
    try {
      console.log(`📦 ${title}`);
      console.log(`   Deleting ${mediaIds.length} failed media items...`);

      const deletedIds = await deleteMedia(productId, mediaIds);

      console.log(`   ✅ Deleted ${deletedIds.length} items`);
      deleted += deletedIds.length;

      await new Promise(r => setTimeout(r, 500));
    } catch (error) {
      console.error(`   ❌ Error: ${error.message}`);
    }
  }

  console.log('\n' + '━'.repeat(60));
  console.log(`✨ Deleted ${deleted} failed media items`);
  console.log('━'.repeat(60));
  console.log();
}

main().catch(console.error);
