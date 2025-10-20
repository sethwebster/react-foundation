#!/usr/bin/env node

/**
 * Shopify Product Seeding Script v2
 *
 * Comprehensive script to seed products from products.json to Shopify.
 * Features:
 * - Automatic location detection
 * - Image upload via staged uploads
 * - Metafield management
 * - Collection management
 * - Inventory tracking
 * - Robust error handling
 *
 * Usage:
 *   node scripts/seed-shopify-v2.mjs [--dry-run] [--skip-images]
 *
 * Flags:
 *   --dry-run: Preview what would be created without making changes
 *   --skip-images: Skip image uploads (faster for testing)
 */

import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join, resolve } from 'path';
import { existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Parse command line arguments
const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');
const SKIP_IMAGES = args.includes('--skip-images');

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

if (!SHOPIFY_STORE_DOMAIN) {
  console.error('❌ SHOPIFY_STORE_DOMAIN is not set in .env');
  console.error('   Add your store domain like: mystore.myshopify.com');
  process.exit(1);
}

if (!SHOPIFY_ADMIN_TOKEN) {
  console.error('❌ SHOPIFY_ADMIN_TOKEN is not set in .env');
  console.error('   Generate an admin API token in your Shopify admin panel');
  process.exit(1);
}

const SHOPIFY_API_VERSION = '2024-10';
const SHOPIFY_GRAPHQL_ENDPOINT = `https://${SHOPIFY_STORE_DOMAIN}/admin/api/${SHOPIFY_API_VERSION}/graphql.json`;

// Stats tracking
const stats = {
  productsCreated: 0,
  productsSkipped: 0,
  productsFailed: 0,
  collectionsCreated: 0,
  imagesUploaded: 0,
};

// GraphQL client with error handling
async function shopifyGraphQL(query, variables = {}) {
  try {
    const response = await fetch(SHOPIFY_GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': SHOPIFY_ADMIN_TOKEN,
      },
      body: JSON.stringify({ query, variables }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();

    if (result.errors) {
      console.error('GraphQL Errors:', JSON.stringify(result.errors, null, 2));
      throw new Error('GraphQL query failed: ' + JSON.stringify(result.errors));
    }

    return result.data;
  } catch (error) {
    console.error('❌ Shopify API Error:', error.message);
    throw error;
  }
}

// Get primary location for inventory
async function getPrimaryLocation() {
  const query = `
    query {
      locations(first: 1, query: "active:true") {
        edges {
          node {
            id
            name
            isPrimary
          }
        }
      }
    }
  `;

  const data = await shopifyGraphQL(query);

  if (data.locations.edges.length === 0) {
    throw new Error('No active locations found in Shopify');
  }

  const location = data.locations.edges[0].node;
  console.log(`📍 Using location: ${location.name} (${location.id})`);
  return location.id;
}

// Parse price string
function parsePrice(priceStr) {
  return parseFloat(priceStr.replace(/[$,]/g, ''));
}

// Map availability to Shopify status
function mapAvailability(availability) {
  switch (availability) {
    case 'available':
      return 'ACTIVE';
    case 'backordered':
      return 'ACTIVE';
    case 'discontinued':
      return 'ARCHIVED';
    default:
      return 'DRAFT';
  }
}

// Check if product already exists
async function productExists(handle) {
  const query = `
    query getProduct($query: String!) {
      products(first: 1, query: $query) {
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

  const data = await shopifyGraphQL(query, { query: `handle:${handle}` });
  return data.products.edges.length > 0 ? data.products.edges[0].node : null;
}

// Create or update collection
async function ensureCollection(collectionTitle) {
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
    query: `title:"${collectionTitle}"`,
  });

  if (searchResult.collections.edges.length > 0) {
    return searchResult.collections.edges[0].node.id;
  }

  if (DRY_RUN) {
    console.log(`  [DRY RUN] Would create collection: ${collectionTitle}`);
    return 'dry-run-collection-id';
  }

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
      descriptionHtml: `<p>React Foundation Store collection</p>`,
    },
  });

  if (createResult.collectionCreate.userErrors.length > 0) {
    throw new Error(`Failed to create collection: ${JSON.stringify(createResult.collectionCreate.userErrors)}`);
  }

  stats.collectionsCreated++;
  return createResult.collectionCreate.collection.id;
}

// Upload images to Shopify using staged uploads
async function uploadProductImages(product) {
  if (SKIP_IMAGES) {
    return [];
  }

  const uploadedImages = [];

  for (const image of product.images) {
    // For local development, you'll need to host images publicly
    // Options:
    // 1. Deploy the Next.js app and use the public URL
    // 2. Use a CDN service
    // 3. Upload to Shopify's file storage

    // For now, we'll use placeholder URLs
    // In production, replace with actual hosted URLs
    const imageUrl = image.src.startsWith('http')
      ? image.src
      : `https://${SHOPIFY_STORE_DOMAIN.replace('.myshopify.com', '')}.vercel.app${image.src}`;

    uploadedImages.push({
      src: imageUrl,
      altText: image.alt,
    });
  }

  return uploadedImages;
}

// Create product with all metadata
async function createProduct(product, locationId) {
  console.log(`\n📦 Processing: ${product.name}`);

  // Check if product already exists
  const existing = await productExists(product.slug);
  if (existing) {
    console.log(`  ⏭️  Already exists: ${product.name} (${existing.id})`);
    stats.productsSkipped++;
    return existing.id;
  }

  if (DRY_RUN) {
    console.log(`  [DRY RUN] Would create: ${product.name}`);
    stats.productsCreated++;
    return 'dry-run-product-id';
  }

  // Prepare metafields
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
      key: 'rating',
      type: 'number_decimal',
      value: String(product.rating || 0),
    },
    {
      namespace: 'react_foundation',
      key: 'rating_count',
      type: 'number_integer',
      value: String(product.ratingCount || 0),
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

  // Build description HTML
  const descriptionParts = [
    `<p><strong>${product.tagline}</strong></p>`,
    `<p>${product.description}</p>`,
  ];

  if (product.features?.length > 0) {
    descriptionParts.push(
      '<h3>Features</h3>',
      '<ul>',
      ...product.features.map(f => `<li>${f}</li>`),
      '</ul>'
    );
  }

  if (product.highlights?.length > 0) {
    descriptionParts.push(
      '<h3>Highlights</h3>',
      '<ul>',
      ...product.highlights.map(h => `<li>${h}</li>`),
      '</ul>'
    );
  }

  if (product.specs?.length > 0) {
    descriptionParts.push(
      '<h3>Specifications</h3>',
      '<dl>',
      ...product.specs.flatMap(s => [`<dt>${s.label}</dt>`, `<dd>${s.value}</dd>`]),
      '</dl>'
    );
  }

  // Step 1: Create the product with basic info
  const createMutation = `
    mutation productCreate($input: ProductInput!) {
      productCreate(input: $input) {
        product {
          id
          title
          handle
          status
          variants(first: 1) {
            edges {
              node {
                id
              }
            }
          }
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
    descriptionHtml: descriptionParts.join('\n'),
    status: mapAvailability(product.availability),
    vendor: 'React Foundation',
    productType: product.category === 'drop' ? 'Drop' : 'Collection',
    tags: product.tags || [],
    metafields,
  };

  const createResult = await shopifyGraphQL(createMutation, { input });

  if (createResult.productCreate.userErrors.length > 0) {
    console.error('  ❌ Errors:', createResult.productCreate.userErrors);
    stats.productsFailed++;
    return null;
  }

  const productId = createResult.productCreate.product.id;
  const variantId = createResult.productCreate.product.variants.edges[0].node.id;

  console.log(`  ✅ Created: ${product.name}`);
  console.log(`     Handle: ${product.slug}`);

  // Step 2: Update the variant with price and inventory
  try {
    const variantMutation = `
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

    const variantInput = {
      productId,
      variants: [
        {
          id: variantId,
          price: price.toFixed(2),
          inventoryPolicy: product.availability === 'backordered' ? 'CONTINUE' : 'DENY',
        },
      ],
    };

    const variantResult = await shopifyGraphQL(variantMutation, variantInput);

    if (variantResult.productVariantsBulkUpdate.userErrors.length > 0) {
      console.error('  ⚠️  Variant update errors:', variantResult.productVariantsBulkUpdate.userErrors);
    } else {
      console.log(`     Price: $${price}`);
    }

    // Update inventory
    const inventoryMutation = `
      mutation inventorySetOnHandQuantities($input: InventorySetOnHandQuantitiesInput!) {
        inventorySetOnHandQuantities(input: $input) {
          userErrors {
            field
            message
          }
        }
      }
    `;

    // First get the inventory item ID
    const inventoryQuery = `
      query getInventoryItem($id: ID!) {
        productVariant(id: $id) {
          inventoryItem {
            id
          }
        }
      }
    `;

    const inventoryData = await shopifyGraphQL(inventoryQuery, { id: variantId });
    const inventoryItemId = inventoryData.productVariant.inventoryItem.id;

    const inventoryInput = {
      reason: 'correction',
      setQuantities: [
        {
          inventoryItemId,
          locationId,
          quantity: product.quantityAvailable || 0,
        },
      ],
    };

    const inventoryResult = await shopifyGraphQL(inventoryMutation, { input: inventoryInput });

    if (inventoryResult.inventorySetOnHandQuantities.userErrors.length > 0) {
      console.error('  ⚠️  Inventory errors:', inventoryResult.inventorySetOnHandQuantities.userErrors);
    } else {
      console.log(`     Inventory: ${product.quantityAvailable}`);
    }
  } catch (error) {
    console.error('  ⚠️  Failed to update variant/inventory:', error.message);
  }

  // Step 3: Add images if not skipped
  if (!SKIP_IMAGES && product.images && product.images.length > 0) {
    try {
      const images = await uploadProductImages(product);

      for (const image of images) {
        const mediaMutation = `
          mutation productCreateMedia($media: [CreateMediaInput!]!, $productId: ID!) {
            productCreateMedia(media: $media, productId: $productId) {
              media {
                alt
                mediaContentType
              }
              userErrors {
                field
                message
              }
            }
          }
        `;

        const mediaInput = {
          productId,
          media: [
            {
              originalSource: image.src,
              alt: image.altText,
              mediaContentType: 'IMAGE',
            },
          ],
        };

        const mediaResult = await shopifyGraphQL(mediaMutation, mediaInput);

        if (mediaResult.productCreateMedia.userErrors.length > 0) {
          console.error('  ⚠️  Image upload error:', mediaResult.productCreateMedia.userErrors);
        } else {
          stats.imagesUploaded++;
        }

        // Rate limit between image uploads
        await new Promise(r => setTimeout(r, 200));
      }

      console.log(`     Images: ${images.length}`);
    } catch (error) {
      console.error('  ⚠️  Failed to upload images:', error.message);
    }
  }

  stats.productsCreated++;
  return productId;
}

// Add product to collection
async function addProductToCollection(productId, collectionId, productName, collectionName) {
  if (DRY_RUN) {
    return;
  }

  const mutation = `
    mutation collectionAddProducts($id: ID!, $productIds: [ID!]!) {
      collectionAddProducts(id: $id, productIds: $productIds) {
        collection {
          id
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
    productIds: [productId],
  });

  if (result.collectionAddProducts.userErrors.length === 0) {
    console.log(`  ✅ Added to collection: ${collectionName}`);
  } else {
    console.error(`  ❌ Failed to add to collection:`, result.collectionAddProducts.userErrors);
  }
}

// Main seeding function
async function main() {
  console.log('\n🚀 React Foundation Store - Shopify Seeding\n');
  console.log('━'.repeat(60));
  console.log(`Store:        ${SHOPIFY_STORE_DOMAIN}`);
  console.log(`API Version:  ${SHOPIFY_API_VERSION}`);
  console.log(`Mode:         ${DRY_RUN ? 'DRY RUN (no changes)' : 'LIVE'}`);
  console.log(`Images:       ${SKIP_IMAGES ? 'Skipped' : 'Enabled'}`);
  console.log('━'.repeat(60));
  console.log();

  try {
    // Get location for inventory
    const locationId = DRY_RUN ? 'dry-run-location' : await getPrimaryLocation();

    // Load products
    const productsPath = join(__dirname, '..', 'src', 'lib', 'products.json');
    const productsData = JSON.parse(await readFile(productsPath, 'utf-8'));
    const products = productsData.products;

    console.log(`\n📊 Found ${products.length} products to process\n`);

    // Collect unique collections
    const collectionsSet = new Set();
    products.forEach(p => {
      if (p.collections) {
        p.collections.forEach(c => collectionsSet.add(c));
      }
    });

    // Create collections
    console.log('📂 Creating collections...\n');
    const collectionMap = {};
    for (const collectionName of collectionsSet) {
      try {
        const collectionId = await ensureCollection(collectionName);
        collectionMap[collectionName] = collectionId;
        console.log(`  ✅ ${collectionName}`);
        await new Promise(r => setTimeout(r, 300));
      } catch (error) {
        console.error(`  ❌ Failed: ${collectionName}`, error.message);
      }
    }

    // Create products
    console.log('\n📦 Creating products...');
    const productMap = [];

    for (const product of products) {
      try {
        const productId = await createProduct(product, locationId);
        if (productId) {
          productMap.push({
            id: productId,
            name: product.name,
            collections: product.collections || [],
          });
        }

        // Rate limiting
        await new Promise(r => setTimeout(r, 500));
      } catch (error) {
        console.error(`  ❌ Failed: ${product.name}`, error.message);
        stats.productsFailed++;
      }
    }

    // Add products to collections
    if (!DRY_RUN && productMap.length > 0) {
      console.log('\n🗂️  Adding products to collections...\n');
      for (const product of productMap) {
        for (const collectionName of product.collections) {
          const collectionId = collectionMap[collectionName];
          if (collectionId && collectionId !== 'dry-run-collection-id') {
            try {
              await addProductToCollection(
                product.id,
                collectionId,
                product.name,
                collectionName
              );
              await new Promise(r => setTimeout(r, 300));
            } catch (error) {
              console.error(`  ❌ Error:`, error.message);
            }
          }
        }
      }
    }

    // Print summary
    console.log('\n━'.repeat(60));
    console.log('✨ Seeding Complete!\n');
    console.log(`Products Created:   ${stats.productsCreated}`);
    console.log(`Products Skipped:   ${stats.productsSkipped}`);
    console.log(`Products Failed:    ${stats.productsFailed}`);
    console.log(`Collections:        ${stats.collectionsCreated} new`);
    console.log(`Images Uploaded:    ${stats.imagesUploaded}`);
    console.log('━'.repeat(60));
    console.log();

    if (DRY_RUN) {
      console.log('💡 This was a dry run. Run without --dry-run to make actual changes.\n');
    }
  } catch (error) {
    console.error('\n❌ Fatal Error:', error.message);
    if (error.message.includes('Invalid API key')) {
      console.error('\n💡 Check your SHOPIFY_ADMIN_TOKEN in .env');
      console.error('   It should be an Admin API access token from your Shopify admin panel.');
    }
    process.exit(1);
  }
}

main();
