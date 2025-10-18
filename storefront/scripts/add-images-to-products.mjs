#!/usr/bin/env node

/**
 * Add Images to Existing Shopify Products
 *
 * This script adds images to products that are already in Shopify.
 * Useful for updating products after they've been created.
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

const stats = {
  productsProcessed: 0,
  imagesAdded: 0,
  errors: 0,
};

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

async function getProductId(handle) {
  const query = `
    query getProduct($query: String!) {
      products(first: 1, query: $query) {
        edges {
          node {
            id
            title
            images(first: 10) {
              edges {
                node {
                  id
                  url
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

  const product = data.products.edges[0].node;
  return {
    id: product.id,
    title: product.title,
    existingImages: product.images.edges.length,
  };
}

async function addImagesToProduct(productId, productName, images) {
  console.log(`\n📷 Adding images to: ${productName}`);

  for (const image of images) {
    try {
      // Construct the image URL
      const imageUrl = image.src.startsWith('http')
        ? image.src
        : `https://${SHOPIFY_STORE_DOMAIN.replace('.myshopify.com', '')}.vercel.app${image.src}`;

      const mutation = `
        mutation productCreateMedia($media: [CreateMediaInput!]!, $productId: ID!) {
          productCreateMedia(media: $media, productId: $productId) {
            media {
              alt
              mediaContentType
              ... on MediaImage {
                image {
                  url
                }
              }
            }
            mediaUserErrors {
              field
              message
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
            originalSource: imageUrl,
            alt: image.alt,
            mediaContentType: 'IMAGE',
          },
        ],
      };

      const result = await shopifyGraphQL(mutation, mediaInput);

      if (result.productCreateMedia.userErrors.length > 0 || result.productCreateMedia.mediaUserErrors.length > 0) {
        console.error(`  ❌ Failed to add image: ${image.src}`);
        console.error(`     Errors:`, result.productCreateMedia.userErrors || result.productCreateMedia.mediaUserErrors);
        stats.errors++;
      } else {
        console.log(`  ✅ Added: ${image.src}`);
        stats.imagesAdded++;
      }

      // Rate limit
      await new Promise(r => setTimeout(r, 500));
    } catch (error) {
      console.error(`  ❌ Error adding image ${image.src}:`, error.message);
      stats.errors++;
    }
  }
}

async function main() {
  console.log('\n🖼️  Adding Images to Shopify Products\n');
  console.log('━'.repeat(60));
  console.log(`Store: ${SHOPIFY_STORE_DOMAIN}`);
  console.log('━'.repeat(60));
  console.log();

  // Load products from JSON
  const productsPath = join(__dirname, '..', 'src', 'lib', 'products.json');
  const productsData = JSON.parse(await readFile(productsPath, 'utf-8'));
  const products = productsData.products;

  console.log(`📊 Found ${products.length} products\n`);

  for (const product of products) {
    try {
      // Get product from Shopify
      const shopifyProduct = await getProductId(product.slug);

      if (!shopifyProduct) {
        console.log(`⏭️  Product not found in Shopify: ${product.name}`);
        continue;
      }

      console.log(`\n📦 ${shopifyProduct.title}`);
      console.log(`   Existing images: ${shopifyProduct.existingImages}`);
      console.log(`   Images to add: ${product.images.length}`);

      if (shopifyProduct.existingImages >= product.images.length) {
        console.log(`   ⏭️  Product already has images, skipping`);
        stats.productsProcessed++;
        continue;
      }

      // Add images
      await addImagesToProduct(shopifyProduct.id, shopifyProduct.title, product.images);
      stats.productsProcessed++;

      // Rate limit between products
      await new Promise(r => setTimeout(r, 1000));
    } catch (error) {
      console.error(`\n❌ Error processing ${product.name}:`, error.message);
      stats.errors++;
    }
  }

  // Summary
  console.log('\n━'.repeat(60));
  console.log('✨ Image Upload Complete!\n');
  console.log(`Products Processed: ${stats.productsProcessed}`);
  console.log(`Images Added:       ${stats.imagesAdded}`);
  console.log(`Errors:             ${stats.errors}`);
  console.log('━'.repeat(60));
  console.log();
}

main().catch(error => {
  console.error('\n❌ Fatal Error:', error.message);
  process.exit(1);
});
