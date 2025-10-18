#!/usr/bin/env node

/**
 * Shopify Product Seeding Script
 *
 * Pushes products from src/lib/products.json to Shopify using the GraphQL Admin API.
 * Handles product creation, image uploads, metafields, and collections.
 *
 * Usage:
 *   node scripts/seed-shopify.mjs
 *
 * Requirements:
 *   - SHOPIFY_STORE_DOMAIN must be set in .env
 *   - SHOPIFY_ADMIN_TOKEN must be set in .env
 */

import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env file
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

if (!SHOPIFY_STORE_DOMAIN) {
  console.error('❌ SHOPIFY_STORE_DOMAIN is not set in .env');
  process.exit(1);
}

if (!SHOPIFY_ADMIN_TOKEN) {
  console.error('❌ SHOPIFY_ADMIN_TOKEN is not set in .env');
  process.exit(1);
}

const SHOPIFY_API_VERSION = '2024-10';
const SHOPIFY_GRAPHQL_ENDPOINT = `https://${SHOPIFY_STORE_DOMAIN}/admin/api/${SHOPIFY_API_VERSION}/graphql.json`;

// GraphQL client
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

// Parse price string like "$248" to numeric value
function parsePrice(priceStr) {
  return parseFloat(priceStr.replace('$', ''));
}

// Map availability to Shopify status
function mapAvailability(availability) {
  switch (availability) {
    case 'available':
      return 'ACTIVE';
    case 'backordered':
      return 'ACTIVE'; // Still active, just low inventory
    case 'discontinued':
      return 'DRAFT'; // Or could be ARCHIVED
    default:
      return 'ACTIVE';
  }
}

// Create or get a collection by title
async function ensureCollection(collectionTitle) {
  // First, try to find existing collection
  const searchQuery = `
    query getCollection($query: String!) {
      collections(first: 1, query: $query) {
        edges {
          node {
            id
            title
          }
        }
      }
    }
  `;

  const searchResult = await shopifyGraphQL(searchQuery, {
    query: `title:${collectionTitle}`,
  });

  if (searchResult.collections.edges.length > 0) {
    return searchResult.collections.edges[0].node.id;
  }

  // Collection doesn't exist, create it
  const createMutation = `
    mutation createCollection($input: CollectionInput!) {
      collectionCreate(input: $input) {
        collection {
          id
          title
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  const createResult = await shopifyGraphQL(createMutation, {
    input: {
      title: collectionTitle,
      descriptionHtml: `<p>React Foundation Store: ${collectionTitle}</p>`,
    },
  });

  if (createResult.collectionCreate.userErrors.length > 0) {
    console.error('Collection creation errors:', createResult.collectionCreate.userErrors);
    throw new Error(`Failed to create collection: ${collectionTitle}`);
  }

  return createResult.collectionCreate.collection.id;
}

// Upload product images and create product with metafields
async function createProduct(product) {
  console.log(`\n📦 Creating product: ${product.name}`);

  // Prepare image URLs (convert local paths to absolute URLs)
  // Note: For now, we'll need to host these images somewhere accessible
  // In production, you'd upload to a CDN or use Shopify's image hosting
  const imageUrls = product.images.map(img => {
    // For demo purposes, assuming images will be hosted at the storefront URL
    // You'll need to replace this with actual hosted image URLs
    return {
      src: `https://YOUR_STOREFRONT_URL${img.src}`,
      altText: img.alt,
    };
  });

  // Prepare metafields for custom data
  const metafields = [
    {
      namespace: 'react_foundation',
      key: 'unlock_tier',
      type: 'single_line_text_field',
      value: product.unlockTier || '',
    },
    {
      namespace: 'react_foundation',
      key: 'tagline',
      type: 'single_line_text_field',
      value: product.tagline || '',
    },
    {
      namespace: 'react_foundation',
      key: 'release_window',
      type: 'single_line_text_field',
      value: product.releaseWindow || '',
    },
    {
      namespace: 'react_foundation',
      key: 'accent_gradient',
      type: 'single_line_text_field',
      value: product.accent || '',
    },
    {
      namespace: 'react_foundation',
      key: 'features',
      type: 'json',
      value: JSON.stringify(product.features || []),
    },
    {
      namespace: 'react_foundation',
      key: 'highlights',
      type: 'json',
      value: JSON.stringify(product.highlights || []),
    },
    {
      namespace: 'react_foundation',
      key: 'specs',
      type: 'json',
      value: JSON.stringify(product.specs || []),
    },
  ];

  // Build product description HTML
  const descriptionParts = [
    `<p>${product.description}</p>`,
    product.features?.length > 0 ? `<h3>Features</h3><ul>${product.features.map(f => `<li>${f}</li>`).join('')}</ul>` : '',
    product.highlights?.length > 0 ? `<h3>Highlights</h3><ul>${product.highlights.map(h => `<li>${h}</li>`).join('')}</ul>` : '',
    product.specs?.length > 0 ? `<h3>Specifications</h3><dl>${product.specs.map(s => `<dt>${s.label}</dt><dd>${s.value}</dd>`).join('')}</dl>` : '',
  ].filter(Boolean).join('\n');

  const mutation = `
    mutation createProduct($input: ProductInput!) {
      productCreate(input: $input) {
        product {
          id
          title
          handle
          status
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  const price = parsePrice(product.price);

  const input = {
    title: product.name,
    handle: product.slug,
    descriptionHtml: descriptionParts,
    status: mapAvailability(product.availability),
    vendor: 'React Foundation Store',
    productType: product.category || 'Merchandise',
    tags: product.tags || [],
    metafields,
    variants: [
      {
        price: price.toFixed(2),
        inventoryQuantities: {
          availableQuantity: product.quantityAvailable || 0,
          locationId: 'gid://shopify/Location/YOUR_LOCATION_ID', // You'll need to query this
        },
      },
    ],
  };

  const result = await shopifyGraphQL(mutation, { input });

  if (result.productCreate.userErrors.length > 0) {
    console.error('❌ Product creation errors:', result.productCreate.userErrors);
    return null;
  }

  const productId = result.productCreate.product.id;
  console.log(`✅ Created: ${product.name} (${productId})`);

  return productId;
}

// Main seeding function
async function seedProducts() {
  console.log('🚀 Starting Shopify product seeding...\n');
  console.log(`📍 Store: ${SHOPIFY_STORE_DOMAIN}`);
  console.log(`🔑 Using Admin API version: ${SHOPIFY_API_VERSION}\n`);

  // Load products from JSON
  const productsPath = join(__dirname, '..', 'src', 'lib', 'products.json');
  const productsData = JSON.parse(await readFile(productsPath, 'utf-8'));
  const products = productsData.products;

  console.log(`📊 Found ${products.length} products to seed\n`);

  // Track collections to create
  const collectionsToCreate = new Set();
  products.forEach(product => {
    if (product.collections) {
      product.collections.forEach(c => collectionsToCreate.add(c));
    }
  });

  // Create collections first
  console.log('📂 Creating collections...');
  const collectionMap = {};
  for (const collectionName of collectionsToCreate) {
    const collectionId = await ensureCollection(collectionName);
    collectionMap[collectionName] = collectionId;
    console.log(`  ✅ Collection: ${collectionName}`);
  }

  // Create products
  console.log('\n📦 Creating products...');
  const createdProducts = [];

  for (const product of products) {
    try {
      const productId = await createProduct(product);
      if (productId) {
        createdProducts.push({
          id: productId,
          name: product.name,
          collections: product.collections,
        });
      }

      // Rate limiting: wait 500ms between requests
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error(`❌ Failed to create product ${product.name}:`, error.message);
    }
  }

  // Add products to collections
  console.log('\n🗂️  Adding products to collections...');
  for (const product of createdProducts) {
    if (!product.collections) continue;

    for (const collectionName of product.collections) {
      const collectionId = collectionMap[collectionName];
      if (!collectionId) continue;

      try {
        const mutation = `
          mutation addProductToCollection($id: ID!, $productIds: [ID!]!) {
            collectionAddProducts(id: $id, productIds: $productIds) {
              collection {
                id
                title
              }
              userErrors {
                field
                message
              }
            }
          }
        `;

        const result = await shopifyGraphQL(mutation, {
          id: collectionId,
          productIds: [product.id],
        });

        if (result.collectionAddProducts.userErrors.length === 0) {
          console.log(`  ✅ Added "${product.name}" to "${collectionName}"`);
        } else {
          console.error(`  ❌ Failed to add to collection:`, result.collectionAddProducts.userErrors);
        }

        await new Promise(resolve => setTimeout(resolve, 300));
      } catch (error) {
        console.error(`  ❌ Error adding to collection:`, error.message);
      }
    }
  }

  console.log('\n✨ Seeding complete!');
  console.log(`📊 Summary: ${createdProducts.length}/${products.length} products created`);
}

// Run the seeding
seedProducts().catch(error => {
  console.error('\n❌ Seeding failed:', error);
  process.exit(1);
});
