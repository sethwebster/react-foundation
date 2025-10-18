#!/usr/bin/env node

/**
 * Get Shopify Location ID
 *
 * Helper script to retrieve your Shopify location ID needed for inventory management.
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

async function getLocations() {
  const query = `
    query {
      locations(first: 10) {
        edges {
          node {
            id
            name
            isActive
            isPrimary
          }
        }
      }
    }
  `;

  const response = await fetch(SHOPIFY_GRAPHQL_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': SHOPIFY_ADMIN_TOKEN,
    },
    body: JSON.stringify({ query }),
  });

  const result = await response.json();

  if (result.errors) {
    console.error('GraphQL Errors:', result.errors);
    process.exit(1);
  }

  console.log('📍 Shopify Locations:\n');
  result.data.locations.edges.forEach(({ node }) => {
    console.log(`  ID: ${node.id}`);
    console.log(`  Name: ${node.name}`);
    console.log(`  Active: ${node.isActive}`);
    console.log(`  Primary: ${node.isPrimary}`);
    console.log('');
  });

  // Find primary location
  const primary = result.data.locations.edges.find(({ node }) => node.isPrimary);
  if (primary) {
    console.log(`✅ Primary Location ID: ${primary.node.id}`);
    console.log('\nCopy this ID to use in the seeding script.');
  }
}

getLocations().catch(console.error);
