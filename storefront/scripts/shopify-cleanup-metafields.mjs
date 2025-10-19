#!/usr/bin/env node

/**
 * Remove obsolete metafield definitions from Shopify
 *
 * This script removes metafield definitions that are no longer used:
 * - drop_status (now calculated from dates)
 * - available_start (removed in favor of drop_start_date)
 * - available_end (removed in favor of drop_end_date)
 *
 * Usage:
 *   npm run shopify:cleanup-metafields
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

async function listMetafieldDefinitions(ownerType) {
  const query = `
    query getMetafieldDefinitions($ownerType: MetafieldOwnerType!, $first: Int!) {
      metafieldDefinitions(ownerType: $ownerType, first: $first) {
        edges {
          node {
            id
            name
            namespace
            key
            type {
              name
            }
          }
        }
      }
    }
  `;

  const data = await shopifyAdminFetch(query, { ownerType, first: 100 });
  return data.metafieldDefinitions.edges.map(({ node }) => node);
}

async function deleteMetafieldDefinition(id, name) {
  const mutation = `
    mutation deleteMetafieldDefinition($id: ID!) {
      metafieldDefinitionDelete(id: $id) {
        deletedDefinitionId
        userErrors {
          field
          message
        }
      }
    }
  `;

  const data = await shopifyAdminFetch(mutation, { id });

  if (data.metafieldDefinitionDelete.userErrors.length > 0) {
    throw new Error(
      `Delete errors: ${JSON.stringify(data.metafieldDefinitionDelete.userErrors, null, 2)}`
    );
  }

  console.log(`   ✅ Deleted: ${name}`);
}

async function cleanupObsoleteMetafields() {
  console.log('\n🧹 Cleaning up obsolete metafield definitions...\n');

  const OBSOLETE_KEYS = ['drop_status', 'available_start', 'available_end'];

  // Check collection metafields
  console.log('📁 Checking COLLECTION metafields:');
  const collectionDefs = await listMetafieldDefinitions('COLLECTION');
  const obsoleteCollectionDefs = collectionDefs.filter(
    (def) => def.namespace === 'react_foundation' && OBSOLETE_KEYS.includes(def.key)
  );

  if (obsoleteCollectionDefs.length === 0) {
    console.log('   ✨ No obsolete metafields found - all clean!');
  } else {
    for (const def of obsoleteCollectionDefs) {
      await deleteMetafieldDefinition(def.id, `${def.key} (${def.name})`);
    }
  }

  // Check product metafields
  console.log('\n📦 Checking PRODUCT metafields:');
  const productDefs = await listMetafieldDefinitions('PRODUCT');
  const obsoleteProductDefs = productDefs.filter(
    (def) => def.namespace === 'react_foundation' && OBSOLETE_KEYS.includes(def.key)
  );

  if (obsoleteProductDefs.length === 0) {
    console.log('   ✨ No obsolete metafields found - all clean!');
  } else {
    for (const def of obsoleteProductDefs) {
      await deleteMetafieldDefinition(def.id, `${def.key} (${def.name})`);
    }
  }

  console.log('\n✅ Cleanup complete!');
  console.log('\n📝 Summary:');
  console.log(`   - Removed ${obsoleteCollectionDefs.length + obsoleteProductDefs.length} obsolete metafield definitions`);
  console.log('   - Status is now calculated from drop_start_date and drop_end_date');
  console.log('   - System is simplified and fully date-based!\n');
}

cleanupObsoleteMetafields().catch((error) => {
  console.error('\n❌ Error:', error.message);
  process.exit(1);
});
