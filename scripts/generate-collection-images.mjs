#!/usr/bin/env node

/**
 * Auto-generate collection images using OpenAI DALL-E
 *
 * For collections without images, this script:
 * 1. Fetches collection metadata (theme, description, products)
 * 2. Analyzes product images with GPT-5 Vision (cached per collection)
 * 3. Builds an enhanced prompt from vision analysis
 * 4. Generates collection image via gpt-image-1
 * 5. Uploads to Shopify via staged upload
 *
 * Usage:
 *   npm run collections:generate-images
 *   npm run collections:generate-images -- drop-08-fall-2025
 *   npm run collections:generate-images -- drop-08-fall-2025 --skip-cache
 *   npm run collections:generate-images -- drop-08-fall-2025 --force (replace existing)
 *   npm run collections:generate-images -- drop-08-fall-2025 --desc="Dark moody lighting, products on concrete"
 *   npm run collections:generate-images -- --force --skip-cache (replace all, fresh generation)
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const CACHE_DIR = join(__dirname, '../.cache');

// Ensure cache directory exists
if (!existsSync(CACHE_DIR)) {
  mkdirSync(CACHE_DIR, { recursive: true });
}

const SHOPIFY_STORE_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN;
const SHOPIFY_ADMIN_TOKEN = process.env.SHOPIFY_ADMIN_TOKEN;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const SHOPIFY_API_VERSION = '2024-10';

if (!SHOPIFY_STORE_DOMAIN || !SHOPIFY_ADMIN_TOKEN) {
  console.error('❌ Missing SHOPIFY_STORE_DOMAIN or SHOPIFY_ADMIN_TOKEN');
  process.exit(1);
}

if (!OPENAI_API_KEY) {
  console.error('❌ Missing OPENAI_API_KEY');
  console.error('   Add to .env: OPENAI_API_KEY=sk-...');
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

async function getCollectionDetails(handle) {
  const query = `
    query getCollection($handle: String!) {
      collectionByHandle(handle: $handle) {
        id
        title
        description
        handle
        image {
          url
        }
        products(first: 10) {
          edges {
            node {
              title
              images(first: 1) {
                edges {
                  node {
                    url
                  }
                }
              }
            }
          }
        }
        isDrop: metafield(namespace: "react_foundation", key: "is_drop") { value }
        dropTheme: metafield(namespace: "react_foundation", key: "drop_theme") { value }
        dropSeason: metafield(namespace: "react_foundation", key: "drop_season") { value }
        dropYear: metafield(namespace: "react_foundation", key: "drop_year") { value }
        isPerennial: metafield(namespace: "react_foundation", key: "is_perennial") { value }
        collectionType: metafield(namespace: "react_foundation", key: "collection_type") { value }
      }
    }
  `;

  const data = await shopifyAdminFetch(query, { handle });

  if (!data.collectionByHandle) {
    throw new Error(`Collection not found: ${handle}`);
  }

  return data.collectionByHandle;
}

async function analyzeProductImagesWithVision(collectionHandle, products, skipCache = false) {
  // Check cache first
  const cacheFile = join(CACHE_DIR, `vision-${collectionHandle}.json`);

  if (!skipCache && existsSync(cacheFile)) {
    console.log(`\n💾 Using cached vision analysis for ${collectionHandle}`);
    const cached = JSON.parse(readFileSync(cacheFile, 'utf-8'));
    console.log(cached.analysis);
    return cached.analysis;
  }

  // Use GPT-5 Vision to analyze ALL product images in collection
  const productImages = products
    .filter(p => p.imageUrl)
    .map(p => ({
      type: 'image_url',
      image_url: {
        url: p.imageUrl,
        detail: 'high', // High detail for accurate analysis
      },
    }));

  console.log(`  Found ${productImages.length} product images to analyze`);
  console.log('  Image URLs:', productImages.map(img => img.image_url.url));

  if (productImages.length === 0) {
    console.warn('  ⚠️  No product images found in collection');
    return 'No product images available for reference.';
  }

  const visionPrompt = `You are analyzing product images for a fashion collection banner. For EACH product image, describe in detail:

1. EXACT product type (hoodie, t-shirt, mug, jacket, etc.)
2. EXACT colors (be specific: "teal hoodie with black sleeves", "midnight blue t-shirt", etc.)
3. EXACT design elements (logos, text, graphics, patterns)
4. EXACT materials and textures visible
5. Product positioning and angle

Be extremely specific about what each product looks like so an image generator can recreate it accurately. Include:
- Product colors (hex codes if visible)
- Fabric/material appearance
- Graphic designs or text on the products
- Product silhouettes and shapes

Output format: For each product, write "Product: [name] - [detailed visual description with exact colors, materials, and design elements]"`;

  console.log(`\n🔍 Analyzing ${productImages.length} product images with GPT-5 Vision...`);
  console.log('  (This may take 60-90 seconds as OpenAI downloads high-res images)');

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-5',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: visionPrompt },
            ...productImages,
          ],
        },
      ],
      max_completion_tokens: 4000, // Large limit for analyzing multiple products with reasoning
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    console.error('[ERROR] Vision analysis API call failed:');
    console.error('  Status:', response.status);
    console.error('  Error:', error.error?.message || JSON.stringify(error));

    // Check if it's a timeout downloading images
    if (error.error?.message?.includes('Timeout while downloading')) {
      console.error('\n  💡 The product images from Shopify CDN are not publicly accessible.');
      console.error('  💡 Proceeding with text-only generation (no vision analysis).');
      console.error('  💡 To fix: Make product images public or use different image URLs.\n');
    } else {
      console.error('  Proceeding without image analysis\n');
    }

    return '';
  }

  const result = await response.json();
  console.log('[DEBUG] Vision API response:', JSON.stringify(result, null, 2));

  const analysis = result.choices?.[0]?.message?.content;

  if (!analysis) {
    console.error('[ERROR] No content in vision response:', result);
    return '';
  }

  // Cache the result
  writeFileSync(
    cacheFile,
    JSON.stringify(
      {
        collectionHandle,
        timestamp: new Date().toISOString(),
        analysis,
      },
      null,
      2
    )
  );

  console.log('✅ Product image analysis complete (cached)');
  console.log(analysis);

  return analysis;
}

async function generateCollectionImage(collection, skipCache = false) {
  // Check for cached generated image
  const imageCacheFile = join(CACHE_DIR, `generated-image-${collection.handle}.json`);

  if (!skipCache && existsSync(imageCacheFile)) {
    console.log(`\n💾 Using cached generated image for ${collection.handle}`);
    const cached = JSON.parse(readFileSync(imageCacheFile, 'utf-8'));
    console.log(`   Generated: ${cached.timestamp}`);
    return cached.imageData;
  }

  const isDrop = collection.isDrop?.value?.toLowerCase() === 'true';
  const dropTheme = collection.dropTheme?.value || '';
  const dropSeason = collection.dropSeason?.value || '';
  const dropYear = collection.dropYear?.value || '';
  const collectionType = collection.collectionType?.value || 'apparel';

  // Get product titles and image URLs
  const products = collection.products.edges.map(({ node }) => ({
    title: node.title,
    imageUrl: node.images.edges[0]?.node.url || null,
  }));

  // Analyze product images with GPT-5 Vision (cached per collection)
  const imageAnalysis = await analyzeProductImagesWithVision(
    collection.handle,
    products,
    skipCache
  );

  // Parse custom description from command line (--desc="...")
  const descArg = process.argv.find(arg => arg.startsWith('--desc='));
  const customDescription = descArg ? descArg.split('=')[1].replace(/['"]/g, '') : null;

  console.log('\n📋 Using Product Analysis:');
  console.log(imageAnalysis || 'No analysis available');
  if (customDescription) {
    console.log('\n🎨 Custom Description:', customDescription);
  }
  console.log();

  // Build enhanced prompt
  let prompt = '';

  if (isDrop) {
    prompt = `PRODUCT PHOTOGRAPHY: Create a premium collection banner for React Foundation tech apparel.

=== PRODUCTS TO FEATURE ===
${products.map(p => `• ${p.title}`).join('\n')}

${imageAnalysis ? `=== PRODUCT DETAILS ===\n${imageAnalysis}\n\n` : ''}

${customDescription ? `=== STYLING REQUIREMENTS ===\n${customDescription}\n\n` : ''}

=== PHOTOGRAPHY REQUIREMENTS ===
• Dark minimalist background (charcoal, black, or dark slate)
• Subtle cyan/teal accent lighting (RGB: 97, 219, 251)
• High-end tech fashion aesthetic
• Clean, modern composition
• Premium product photography
• DO NOT add seasonal decorations or thematic elements
• Focus on the actual products listed above

Photography Style: E-commerce collection banner, professional product photography, minimalist dark aesthetic

Collection: "${dropTheme || collection.title}"`;
  } else {
    prompt = `Create a collection hero banner featuring the ACTUAL products from "${collection.title}".

${imageAnalysis ? `IMPORTANT - Base the image on these ACTUAL products:\n${imageAnalysis}\n` : ''}

Products that MUST appear in the banner:
${products.map(p => `- ${p.title}`).join('\n')}

CRITICAL REQUIREMENTS:
- Show the ACTUAL products described above
- DO NOT create new/different products
- Arrange in premium flat lay or lifestyle composition
- Dark background with cyan/teal accent lighting (#61dafb)
- Product photography style (not illustrations)
- Clean, minimal, premium aesthetic

${collection.description || ''}

Style: Premium e-commerce collection banner, photorealistic product photography`;
  }

  console.log('\n🎨 Full Prompt Being Sent to gpt-image-1:');
  console.log('='.repeat(80));
  console.log(prompt);
  console.log('='.repeat(80));
  console.log('\n⏳ Calling OpenAI gpt-image-1...');

  const response = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-image-1',
      prompt,
      size: '1024x1024', // Shopify recommended square size
      quality: 'medium', // Balances quality and file size
      output_format: 'png', // Explicit PNG format
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`OpenAI API error: ${JSON.stringify(error)}`);
  }

  const result = await response.json();

  // gpt-image-1 returns base64 in b64_json field
  const base64Data = result.data?.[0]?.b64_json;
  const urlData = result.data?.[0]?.url;

  let imageData;
  if (base64Data) {
    console.log('✅ Received base64 image data');
    imageData = { type: 'base64', data: base64Data };
  } else if (urlData) {
    console.log('✅ Received image URL');
    imageData = { type: 'url', data: urlData };
  } else {
    throw new Error(`No image data in response: ${JSON.stringify(result)}`);
  }

  // Cache the generated image (reuse the same cache file path)
  writeFileSync(
    imageCacheFile,
    JSON.stringify(
      {
        collectionHandle: collection.handle,
        timestamp: new Date().toISOString(),
        imageData,
      },
      null,
      2
    )
  );
  console.log(`💾 Cached generated image for ${collection.handle}`);

  return imageData;
}

async function uploadImageToCollection(collectionId, imageData) {
  if (imageData.type === 'url') {
    // Simple case: external URL
    console.log('\n📤 Uploading via external URL...');

    const mutation = `
      mutation updateCollection($input: CollectionInput!) {
        collectionUpdate(input: $input) {
          collection {
            id
            image {
              url
            }
          }
          userErrors {
            field
            message
          }
        }
      }
    `;

    const input = {
      id: collectionId,
      image: {
        src: imageData.data,
      },
    };

    const data = await shopifyAdminFetch(mutation, { input });

    if (data.collectionUpdate.userErrors.length > 0) {
      throw new Error(
        `Upload errors: ${JSON.stringify(data.collectionUpdate.userErrors, null, 2)}`
      );
    }

    return data.collectionUpdate.collection.image.url;
  }

  // Complex case: base64 data - use staged upload
  console.log('\n📤 Uploading base64 image via Shopify staged upload...');

  // Step 1: Create staged upload target
  console.log('  Step 1/5: Creating staged upload target...');
  const stagedMutation = `
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

  const stagedInput = [
    {
      resource: 'COLLECTION_IMAGE',
      filename: 'collection-image.png',
      mimeType: 'image/png',
      httpMethod: 'POST',
    },
  ];

  const stagedData = await shopifyAdminFetch(stagedMutation, { input: stagedInput });

  if (stagedData.stagedUploadsCreate.userErrors.length > 0) {
    console.error('[ERROR] Staged upload creation failed:', stagedData.stagedUploadsCreate.userErrors);
    throw new Error(
      `Staged upload error: ${JSON.stringify(stagedData.stagedUploadsCreate.userErrors)}`
    );
  }

  const stagedTarget = stagedData.stagedUploadsCreate.stagedTargets[0];

  // The resourceUrl is incomplete - we need to build the full path
  const keyParam = stagedTarget.parameters.find(p => p.name === 'key');
  const fullResourceUrl = keyParam
    ? `${stagedTarget.url}${keyParam.value}`
    : stagedTarget.resourceUrl;

  console.log('  ✅ Staged target created');
  console.log('  Full resource URL:', fullResourceUrl);

  // Step 2: Upload base64 image to staged target
  console.log('  Step 2/5: Uploading image data...');

  const imageBuffer = Buffer.from(imageData.data, 'base64');

  // Create form data for Google Cloud Storage upload
  const formData = new globalThis.FormData();

  // Add all Shopify parameters in order
  stagedTarget.parameters.forEach((param) => {
    formData.append(param.name, param.value);
  });

  // Add the file (must be last)
  formData.append('file', new Blob([imageBuffer], { type: 'image/png' }), 'collection-image.png');

  const uploadResponse = await fetch(stagedTarget.url, {
    method: 'POST',
    body: formData,
  });

  console.log('  Upload response status:', uploadResponse.status);

  if (!uploadResponse.ok) {
    const errorText = await uploadResponse.text();
    console.error('  Upload error response:', errorText);
    throw new Error(`Upload to staged target failed: ${uploadResponse.status}`);
  }

  console.log('  ✅ Upload to staged target successful');

  console.log('  Step 3/5: Creating file in Shopify...');
  console.log('  Using resource URL:', fullResourceUrl);

  // Step 3: Create file from staged upload with extended info
  const fileCreateMutation = `
    mutation fileCreate($files: [FileCreateInput!]!) {
      fileCreate(files: $files) {
        files {
          ... on MediaImage {
            id
            alt
            status
            image {
              url
              width
              height
            }
            fileErrors {
              code
              details
              message
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

  const fileData = await shopifyAdminFetch(fileCreateMutation, {
    files: [
      {
        originalSource: fullResourceUrl,
        contentType: 'IMAGE',
      },
    ],
  });

  console.log('[DEBUG] Full fileCreate response:', JSON.stringify(fileData, null, 2));

  if (fileData.fileCreate.userErrors.length > 0) {
    console.error('[ERROR] fileCreate userErrors:', fileData.fileCreate.userErrors);
    throw new Error(`File create error: ${JSON.stringify(fileData.fileCreate.userErrors)}`);
  }

  const mediaFile = fileData.fileCreate.files[0];

  if (!mediaFile) {
    console.error('[ERROR] No file in response:', fileData);
    throw new Error(`No file created. Response: ${JSON.stringify(fileData)}`);
  }

  console.log('  ℹ️  File created with ID:', mediaFile.id);
  console.log('  ℹ️  File status:', mediaFile.status);

  if (mediaFile.fileErrors && mediaFile.fileErrors.length > 0) {
    console.error('[ERROR] File errors from Shopify:', mediaFile.fileErrors);
    throw new Error(`File has errors: ${JSON.stringify(mediaFile.fileErrors)}`);
  }

  console.log('  Step 4/4: Waiting 5 seconds for Shopify processing...');

  // Give Shopify a moment to process the file
  await new Promise(resolve => setTimeout(resolve, 5000));

  // Query the media file to get its URL
  const fileQuery = `
    query getFile($id: ID!) {
      node(id: $id) {
        ... on MediaImage {
          id
          image {
            url
          }
        }
      }
    }
  `;

  const fileQueryData = await shopifyAdminFetch(fileQuery, { id: mediaFile.id });

  console.log('[DEBUG] File query after 5s:', JSON.stringify(fileQueryData, null, 2));

  if (!fileQueryData.node?.image?.url) {
    console.log('  ⚠️  Image still processing after 5 seconds');
    console.log('  ℹ️  Media file ID: ' + mediaFile.id);
    console.log('  ℹ️  Resource URL: ' + stagedTarget.resourceUrl);
    console.log('  ℹ️  File status: ' + (fileQueryData.node?.status || 'unknown'));
    console.log('\n  💡 Next steps:');
    console.log('     1. Go to Shopify Admin → Content → Files');
    console.log('     2. Look for collection-image.png from today');
    console.log('     3. Check if there are any processing errors');
    console.log('     4. If successful, manually add to your collection');

    return 'Image uploaded - check Shopify admin';
  }

  // Step 5: Update collection with the image URL
  console.log('  Step 5/5: Updating collection...');

  const updateMutation = `
    mutation collectionUpdate($input: CollectionInput!) {
      collectionUpdate(input: $input) {
        collection {
          id
          image {
            url
          }
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  const updateData = await shopifyAdminFetch(updateMutation, {
    input: {
      id: collectionId,
      image: {
        src: fileQueryData.node.image.url,
      },
    },
  });

  if (updateData.collectionUpdate.userErrors.length > 0) {
    throw new Error(
      `Collection update error: ${JSON.stringify(updateData.collectionUpdate.userErrors)}`
    );
  }

  console.log('  ✅ Collection updated with image!');

  return updateData.collectionUpdate.collection.image.url;
}

async function generateMissingCollectionImages(specificHandle = null) {
  console.log('\n🖼️  Auto-generating collection images...\n');

  // Get all collections or specific one
  const query = specificHandle
    ? `query { collectionByHandle(handle: "${specificHandle}") { id handle title description image { url } } }`
    : `query { collections(first: 50) { edges { node { id handle title description image { url } } } } }`;

  const data = await shopifyAdminFetch(query.replace(/\s+/g, ' '));

  const collections = specificHandle
    ? [data.collectionByHandle].filter(Boolean)
    : data.collections.edges.map(({ node }) => node);

  // Check for --force flag to replace existing images
  const force = process.argv.includes('--force');

  console.log('[DEBUG] process.argv:', process.argv);
  console.log('[DEBUG] force flag:', force);

  const collectionsNeedingImages = force
    ? collections.filter(c => c) // All valid collections if --force
    : collections.filter((c) => c && (!c.image || !c.image?.url)); // Only missing images

  console.log(`Found ${collections.length} collection(s)`);
  if (force) {
    console.log(`--force flag detected: Regenerating images for all ${collectionsNeedingImages.length} collection(s)\n`);
  } else {
    console.log(`${collectionsNeedingImages.length} missing images\n`);
  }

  for (const collection of collectionsNeedingImages) {
    console.log(`\n📸 Generating image for: ${collection.title}`);
    console.log(`   Handle: ${collection.handle}\n`);

    try {
      // Get full details
      const fullDetails = await getCollectionDetails(collection.handle);

      // Check for --skip-cache flag
      const skipCache = process.argv.includes('--skip-cache');

      // Generate image (uses cache unless --skip-cache)
      const generatedImageData = await generateCollectionImage(fullDetails, skipCache);
      console.log(`✅ Image data ready`);

      // Upload to Shopify
      const shopifyImageUrl = await uploadImageToCollection(collection.id, generatedImageData);
      console.log(`✅ Uploaded to Shopify: ${shopifyImageUrl}`);
      console.log(`\n🎉 Success! Collection image set for ${collection.handle}\n`);
    } catch (error) {
      console.error(`❌ Failed to generate image for ${collection.handle}:`, error.message);
    }
  }

  console.log('\n✅ Done!\n');
}

// Parse arguments
const specificHandle = process.argv[2];

generateMissingCollectionImages(specificHandle).catch((error) => {
  console.error('\n❌ Error:', error.message);
  process.exit(1);
});
