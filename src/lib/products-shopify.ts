/**
 * Shopify-powered Products Library
 *
 * Same interface as products.ts but fetches from Shopify
 */

import { getAllProducts, getProductByHandle, getProductsByCollection as shopifyGetProductsByCollection, isShopifyEnabled } from './shopify';
import * as localProducts from './products';

export type { Product, ProductImage, ProductCategory, ProductCollection, ProductAvailability } from './products';

// Map Shopify product to our Product type
function mapShopifyToProduct(shopifyProduct: Awaited<ReturnType<typeof getAllProducts>>[0]): localProducts.Product {
  const images: localProducts.ProductImage[] = shopifyProduct.images.edges.map((edge, idx) => ({
    id: `image-${idx + 1}`,
    src: edge.node.url,
    alt: edge.node.altText || shopifyProduct.title,
    centerOffset: { x: '50%', y: '50%' },
  }));

  const price = `$${parseFloat(shopifyProduct.priceRange.minVariantPrice.amount)}`;
  const quantityAvailable = shopifyProduct.variants.edges[0]?.node.quantityAvailable ?? 0;

  // Map status to availability
  let availability: localProducts.ProductAvailability = 'available';
  if (!shopifyProduct.variants.edges[0]?.node.availableForSale) {
    availability = 'discontinued';
  } else if (quantityAvailable === 0) {
    availability = 'backordered';
  }

  // Map collections
  const collections: localProducts.ProductCollection[] = [];
  if (shopifyProduct.tags.includes('current-drop')) {
    collections.push('current-drop');
  }
  if (shopifyProduct.tags.includes('past-drop')) {
    collections.push('past-drop');
  }

  const primaryImage = images[0] || {
    id: 'placeholder',
    src: '/placeholders/product.png',
    alt: shopifyProduct.title,
    centerOffset: { x: '50%', y: '50%' },
  };

  return {
    slug: shopifyProduct.handle,
    name: shopifyProduct.title,
    tagline: shopifyProduct.tagline || '',
    description: shopifyProduct.description,
    price,
    status: `${availability} · ${quantityAvailable} available`,
    quantityAvailable,
    availability,
    releaseWindow: shopifyProduct.releaseWindow || 'Available Now',
    category: shopifyProduct.tags.includes('drop') ? 'drop' : 'collection',
    collections,
    accent: shopifyProduct.accentGradient || 'from-sky-400 via-indigo-500 to-purple-500',
    rating: shopifyProduct.rating || 4.5,
    ratingCount: shopifyProduct.ratingCount || 0,
    unlockTier: shopifyProduct.unlockTier || 'core',
    features: shopifyProduct.features || [],
    highlights: shopifyProduct.highlights || [],
    specs: shopifyProduct.specs || [],
    tags: shopifyProduct.tags,
    primaryImageId: primaryImage.id,
    images,
    primaryImage,
  };
}

/**
 * Get all products from Shopify
 */
export async function getProducts(): Promise<localProducts.Product[]> {
  if (!isShopifyEnabled()) {
    throw new Error('Shopify is not configured. Please set SHOPIFY_STORE_DOMAIN and SHOPIFY_STOREFRONT_TOKEN in .env');
  }

  const shopifyProducts = await getAllProducts(50);
  return shopifyProducts.map(mapShopifyToProduct);
}

/**
 * Get product by slug/handle
 */
export async function getProductBySlug(slug: string): Promise<localProducts.Product | null> {
  if (!isShopifyEnabled()) {
    throw new Error('Shopify is not configured. Please set SHOPIFY_STORE_DOMAIN and SHOPIFY_STOREFRONT_TOKEN in .env');
  }

  const shopifyProduct = await getProductByHandle(slug);
  if (!shopifyProduct) return null;
  return mapShopifyToProduct(shopifyProduct);
}

/**
 * Get products by collection
 */
export async function getProductsByCollection(collection: localProducts.ProductCollection): Promise<localProducts.Product[]> {
  if (!isShopifyEnabled()) {
    throw new Error('Shopify is not configured. Please set SHOPIFY_STORE_DOMAIN and SHOPIFY_STOREFRONT_TOKEN in .env');
  }

  const shopifyProducts = await shopifyGetProductsByCollection(collection, 50);
  return shopifyProducts.map(mapShopifyToProduct);
}

/**
 * Get drop products
 */
export async function getDropProducts(): Promise<localProducts.Product[]> {
  const products = await getProducts();
  return products.filter((product) => product.category === 'drop');
}

/**
 * Get related products
 */
export async function getRelatedProducts(slug: string, limit = 3): Promise<localProducts.Product[]> {
  const originProduct = await getProductBySlug(slug);

  const pool = originProduct
    ? await getProductsByCollection(
        originProduct.collections[0] ?? ('current-drop' as localProducts.ProductCollection),
      )
    : await getDropProducts();

  return pool
    .filter((product) => product.slug !== slug)
    .slice(0, limit);
}

// Re-export utility functions
export { formatAvailability, getInventorySummary } from './products';
