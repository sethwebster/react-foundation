#!/usr/bin/env node

/**
 * Upload Product Images to Shopify
 *
 * Uses Shopify's staged upload API to upload local image files directly.
 * This works without needing to deploy your site first.
 */

import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync } from 'fs';
import { createReadStream } from 'fs';
import { stat } from 'fs/promises';

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
  imagesUploaded: 0,
  imagesFailed: 0,
  productsSkipped: 0,
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

async function getProductInfo(handle) {
  const query = `
    query getProduct($query: String!) {
      products(first: 1, query: $query) {
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
                    image {
                      url
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

  const data = await shopifyGraphQL(query, { query: `handle:${handle}` });

  if (data.products.edges.length === 0) {
    return null;
  }

  return data.products.edges[0].node;
}

async function createStagedUpload() {
  const mutation = `
    mutation stagedUploadsCreate($input: [StagedUploadInput!]!) {
      stagedUploadsCreate(input: $input) {
        stagedTargets {
          url
          resourceUrl
          parameters {
            name
            value
          }
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  const input = [
    {
      resource: 'PRODUCT_IMAGE',
      filename: 'image.png',
      mimeType: 'image/png',
      httpMethod: 'POST',
    },
  ];

  const result = await shopifyGraphQL(mutation, { input });

  if (result.stagedUploadsCreate.userErrors.length > 0) {
    throw new Error(`Staged upload error: ${JSON.stringify(result.stagedUploadsCreate.userErrors)}`);
  }

  return result.stagedUploadsCreate.stagedTargets[0];
}

async function uploadFileToStaged(filePath, stagedTarget) {
  const fileBuffer = await readFile(filePath);
  const formData = new FormData();

  // Add parameters from staged upload
  stagedTarget.parameters.forEach(param => {
    formData.append(param.name, param.value);
  });

  // Add the file
  const blob = new Blob([fileBuffer], { type: 'image/png' });
  formData.append('file', blob);

  const response = await fetch(stagedTarget.url, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
  }

  return stagedTarget.resourceUrl;
}

async function addImageToProduct(productId, imageUrl, altText) {
  const mutation = `
    mutation productCreateMedia($media: [CreateMediaInput!]!, $productId: ID!) {
      productCreateMedia(media: $media, productId: $productId) {
        media {
          alt
          mediaContentType
        }
        mediaUserErrors {
          field
          message
        }
      }
    }
  `;

  const input = {
    productId,
    media: [
      {
        originalSource: imageUrl,
        alt: altText,
        mediaContentType: 'IMAGE',
      },
    ],
  };

  const result = await shopifyGraphQL(mutation, input);

  if (result.productCreateMedia.mediaUserErrors.length > 0) {
    throw new Error(`Media create error: ${JSON.stringify(result.productCreateMedia.mediaUserErrors)}`);
  }
}

async function uploadImagesForProduct(product, shopifyProduct) {
  console.log(`\n📦 ${shopifyProduct.title}`);
  console.log(`   Handle: ${product.slug}`);
  console.log(`   Existing media: ${shopifyProduct.media.edges.length}`);
  console.log(`   Images to upload: ${product.images.length}`);

  if (shopifyProduct.media.edges.length >= product.images.length) {
    console.log(`   ⏭️  Already has images, skipping`);
    stats.productsSkipped++;
    return;
  }

  let uploadedCount = 0;

  for (const image of product.images) {
    try {
      // Construct local file path
      const imagePath = join(__dirname, '..', 'public', image.src);

      if (!existsSync(imagePath)) {
        console.log(`   ⚠️  File not found: ${image.src}`);
        stats.imagesFailed++;
        continue;
      }

      console.log(`   📤 Uploading: ${image.src}`);

      // Step 1: Create staged upload
      const stagedTarget = await createStagedUpload();

      // Step 2: Upload file to staged location
      const resourceUrl = await uploadFileToStaged(imagePath, stagedTarget);

      // Step 3: Attach image to product
      await addImageToProduct(shopifyProduct.id, resourceUrl, image.alt);

      console.log(`   ✅ Uploaded successfully`);
      uploadedCount++;
      stats.imagesUploaded++;

      // Rate limit
      await new Promise(r => setTimeout(r, 1000));
    } catch (error) {
      console.log(`   ❌ Failed: ${error.message}`);
      stats.imagesFailed++;
    }
  }

  if (uploadedCount > 0) {
    stats.productsProcessed++;
  }
}

async function main() {
  console.log('\n🖼️  Upload Product Images to Shopify\n');
  console.log('━'.repeat(60));
  console.log(`Store: ${SHOPIFY_STORE_DOMAIN}`);
  console.log('━'.repeat(60));
  console.log();

  // Load products
  const productsPath = join(__dirname, '..', 'src', 'lib', 'products.json');
  const productsData = JSON.parse(await readFile(productsPath, 'utf-8'));
  const products = productsData.products;

  console.log(`📊 Found ${products.length} products to process\n`);

  for (const product of products) {
    try {
      // Get product from Shopify
      const shopifyProduct = await getProductInfo(product.slug);

      if (!shopifyProduct) {
        console.log(`\n⏭️  Product not found: ${product.name}`);
        continue;
      }

      await uploadImagesForProduct(product, shopifyProduct);

      // Rate limit between products
      await new Promise(r => setTimeout(r, 500));
    } catch (error) {
      console.error(`\n❌ Error processing ${product.name}:`, error.message);
      stats.imagesFailed++;
    }
  }

  // Summary
  console.log('\n━'.repeat(60));
  console.log('✨ Upload Complete!\n');
  console.log(`Products Processed: ${stats.productsProcessed}`);
  console.log(`Products Skipped:   ${stats.productsSkipped}`);
  console.log(`Images Uploaded:    ${stats.imagesUploaded}`);
  console.log(`Images Failed:      ${stats.imagesFailed}`);
  console.log('━'.repeat(60));
  console.log();
}

main().catch(error => {
  console.error('\n❌ Fatal Error:', error.message);
  process.exit(1);
});
