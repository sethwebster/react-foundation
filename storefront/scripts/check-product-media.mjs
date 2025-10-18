#!/usr/bin/env node

/**
 * Check Product Media Status
 *
 * Shows the actual media/images for each product
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

async function checkMedia() {
  const query = `
    query {
      products(first: 20) {
        edges {
          node {
            id
            title
            handle
            media(first: 20) {
              edges {
                node {
                  ... on MediaImage {
                    id
                    alt
                    status
                    image {
                      url
                      width
                      height
                    }
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

  console.log('\n📸 Product Media Status\n');
  console.log('━'.repeat(80));

  data.products.edges.forEach(({ node }) => {
    console.log(`\n📦 ${node.title} (${node.handle})`);
    console.log(`   Media count: ${node.media.edges.length}`);

    node.media.edges.forEach(({ node: media }, idx) => {
      console.log(`\n   ${idx + 1}. Status: ${media.status || 'UNKNOWN'}`);
      console.log(`      Alt: ${media.alt || 'N/A'}`);
      if (media.image) {
        console.log(`      Size: ${media.image.width}x${media.image.height}`);
        console.log(`      URL: ${media.image.url.substring(0, 80)}...`);
      } else {
        console.log(`      ⚠️  No image data`);
      }
    });
  });

  console.log('\n' + '━'.repeat(80));
}

checkMedia().catch(console.error);
