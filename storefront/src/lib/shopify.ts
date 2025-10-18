/**
 * Shopify Storefront API Client
 *
 * This client uses the Shopify Storefront API (not Admin API) to fetch
 * product data for the customer-facing storefront.
 *
 * Note: You'll need to create a Storefront API access token in Shopify admin:
 * Settings → Apps and sales channels → Develop apps → Create app → Storefront API
 */

const SHOPIFY_STORE_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN || '';
const SHOPIFY_STOREFRONT_TOKEN = process.env.SHOPIFY_STOREFRONT_TOKEN || '';
const SHOPIFY_API_VERSION = '2024-10';

if (!SHOPIFY_STORE_DOMAIN || !SHOPIFY_STOREFRONT_TOKEN) {
  console.warn('⚠️  Shopify credentials not configured. Using local product data.');
}

const STOREFRONT_ENDPOINT = `https://${SHOPIFY_STORE_DOMAIN}/api/${SHOPIFY_API_VERSION}/graphql.json`;

interface ShopifyError {
  message: string;
  extensions?: {
    code?: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

interface ShopifyResponse<T> {
  data: T;
  errors?: ShopifyError[];
}

/**
 * Execute a GraphQL query against Shopify Storefront API
 */
async function shopifyFetch<T>(query: string, variables: Record<string, unknown> = {}): Promise<T> {
  if (!SHOPIFY_STORE_DOMAIN || !SHOPIFY_STOREFRONT_TOKEN) {
    throw new Error('Shopify credentials not configured');
  }

  const response = await fetch(STOREFRONT_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': SHOPIFY_STOREFRONT_TOKEN,
    },
    body: JSON.stringify({ query, variables }),
    next: { revalidate: 300 }, // Cache for 5 minutes
  });

  if (!response.ok) {
    throw new Error(`Shopify API error: ${response.status}`);
  }

  const result: ShopifyResponse<T> = await response.json();

  if (result.errors) {
    // Check if errors are just about missing inventory scope - if so, continue with partial data
    const isOnlyInventoryError = result.errors.every(err =>
      err.message?.includes('quantityAvailable') &&
      err.extensions?.code === 'ACCESS_DENIED'
    );

    if (!isOnlyInventoryError) {
      throw new Error(`GraphQL errors: ${JSON.stringify(result.errors)}`);
    }

    // Log warning but continue with partial data
    console.warn('⚠️  Inventory data unavailable - missing unauthenticated_read_product_inventory scope');
  }

  return result.data;
}

/**
 * Product type with React Foundation metafields
 */
export interface ShopifyProduct {
  id: string;
  handle: string;
  title: string;
  description: string;
  descriptionHtml: string;
  priceRange: {
    minVariantPrice: {
      amount: string;
      currencyCode: string;
    };
  };
  images: {
    edges: Array<{
      node: {
        url: string;
        altText: string | null;
        width: number;
        height: number;
      };
    }>;
  };
  variants: {
    edges: Array<{
      node: {
        id: string;
        title: string;
        priceV2: {
          amount: string;
          currencyCode: string;
        };
        availableForSale: boolean;
        quantityAvailable: number;
      };
    }>;
  };
  tags: string[];
  // React Foundation custom metafields
  unlockTier?: string;
  tagline?: string;
  releaseWindow?: string;
  accentGradient?: string;
  rating?: number;
  ratingCount?: number;
  features?: string[];
  highlights?: string[];
  specs?: Array<{ label: string; value: string }>;
}

/**
 * Fetch all products from Shopify
 */
export async function getAllProducts(limit = 50): Promise<ShopifyProduct[]> {
  const query = `
    query getProducts($first: Int!) {
      products(first: $first) {
        edges {
          node {
            id
            handle
            title
            description
            descriptionHtml
            tags
            priceRange {
              minVariantPrice {
                amount
                currencyCode
              }
            }
            images(first: 10) {
              edges {
                node {
                  url
                  altText
                  width
                  height
                }
              }
            }
            variants(first: 5) {
              edges {
                node {
                  id
                  title
                  priceV2 {
                    amount
                    currencyCode
                  }
                  availableForSale
                  quantityAvailable
                }
              }
            }
            unlockTier: metafield(namespace: "react_foundation", key: "unlock_tier") {
              value
            }
            tagline: metafield(namespace: "react_foundation", key: "tagline") {
              value
            }
            releaseWindow: metafield(namespace: "react_foundation", key: "release_window") {
              value
            }
            accentGradient: metafield(namespace: "react_foundation", key: "accent_gradient") {
              value
            }
            rating: metafield(namespace: "react_foundation", key: "rating") {
              value
            }
            ratingCount: metafield(namespace: "react_foundation", key: "rating_count") {
              value
            }
            features: metafield(namespace: "react_foundation", key: "features") {
              value
            }
            highlights: metafield(namespace: "react_foundation", key: "highlights") {
              value
            }
            specs: metafield(namespace: "react_foundation", key: "specs") {
              value
            }
          }
        }
      }
    }
  `;

  const data = await shopifyFetch<{
    products: {
      edges: Array<{
        node: ShopifyProduct & {
          unlockTier?: { value: string };
          tagline?: { value: string };
          releaseWindow?: { value: string };
          accentGradient?: { value: string };
          rating?: { value: string };
          ratingCount?: { value: string };
          features?: { value: string };
          highlights?: { value: string };
          specs?: { value: string };
        };
      }>;
    };
  }>(query, { first: limit });

  // Transform metafield data
  return data.products.edges.map(({ node }) => ({
    ...node,
    unlockTier: node.unlockTier?.value,
    tagline: node.tagline?.value,
    releaseWindow: node.releaseWindow?.value,
    accentGradient: node.accentGradient?.value,
    rating: node.rating?.value ? parseFloat(node.rating.value) : undefined,
    ratingCount: node.ratingCount?.value ? parseInt(node.ratingCount.value, 10) : undefined,
    features: node.features?.value ? JSON.parse(node.features.value) : undefined,
    highlights: node.highlights?.value ? JSON.parse(node.highlights.value) : undefined,
    specs: node.specs?.value ? JSON.parse(node.specs.value) : undefined,
  }));
}

/**
 * Fetch a single product by handle
 */
export async function getProductByHandle(handle: string): Promise<ShopifyProduct | null> {
  const query = `
    query getProduct($handle: String!) {
      product(handle: $handle) {
        id
        handle
        title
        description
        descriptionHtml
        tags
        priceRange {
          minVariantPrice {
            amount
            currencyCode
          }
        }
        images(first: 10) {
          edges {
            node {
              url
              altText
              width
              height
            }
          }
        }
        variants(first: 5) {
          edges {
            node {
              id
              title
              priceV2 {
                amount
                currencyCode
              }
              availableForSale
              quantityAvailable
            }
          }
        }
        unlockTier: metafield(namespace: "react_foundation", key: "unlock_tier") {
          value
        }
        tagline: metafield(namespace: "react_foundation", key: "tagline") {
          value
        }
        releaseWindow: metafield(namespace: "react_foundation", key: "release_window") {
          value
        }
        accentGradient: metafield(namespace: "react_foundation", key: "accent_gradient") {
          value
        }
        rating: metafield(namespace: "react_foundation", key: "rating") {
          value
        }
        ratingCount: metafield(namespace: "react_foundation", key: "rating_count") {
          value
        }
        features: metafield(namespace: "react_foundation", key: "features") {
          value
        }
        highlights: metafield(namespace: "react_foundation", key: "highlights") {
          value
        }
        specs: metafield(namespace: "react_foundation", key: "specs") {
          value
        }
      }
    }
  `;

  const data = await shopifyFetch<{
    product: ShopifyProduct & {
      unlockTier?: { value: string };
      tagline?: { value: string };
      releaseWindow?: { value: string };
      accentGradient?: { value: string };
      rating?: { value: string };
      ratingCount?: { value: string };
      features?: { value: string };
      highlights?: { value: string };
      specs?: { value: string };
    } | null;
  }>(query, { handle });

  if (!data.product) {
    return null;
  }

  const node = data.product;

  return {
    ...node,
    unlockTier: node.unlockTier?.value,
    tagline: node.tagline?.value,
    releaseWindow: node.releaseWindow?.value,
    accentGradient: node.accentGradient?.value,
    rating: node.rating?.value ? parseFloat(node.rating.value) : undefined,
    ratingCount: node.ratingCount?.value ? parseInt(node.ratingCount.value, 10) : undefined,
    features: node.features?.value ? JSON.parse(node.features.value) : undefined,
    highlights: node.highlights?.value ? JSON.parse(node.highlights.value) : undefined,
    specs: node.specs?.value ? JSON.parse(node.specs.value) : undefined,
  };
}

/**
 * Fetch products from a specific collection
 */
export async function getProductsByCollection(
  collectionHandle: string,
  limit = 50
): Promise<ShopifyProduct[]> {
  const query = `
    query getCollection($handle: String!, $first: Int!) {
      collection(handle: $handle) {
        products(first: $first) {
          edges {
            node {
              id
              handle
              title
              description
              descriptionHtml
              tags
              priceRange {
                minVariantPrice {
                  amount
                  currencyCode
                }
              }
              images(first: 5) {
                edges {
                  node {
                    url
                    altText
                    width
                    height
                  }
                }
              }
              variants(first: 1) {
                edges {
                  node {
                    id
                    priceV2 {
                      amount
                      currencyCode
                    }
                    availableForSale
                    quantityAvailable
                  }
                }
              }
              unlockTier: metafield(namespace: "react_foundation", key: "unlock_tier") {
                value
              }
              tagline: metafield(namespace: "react_foundation", key: "tagline") {
                value
              }
            }
          }
        }
      }
    }
  `;

  const data = await shopifyFetch<{
    collection: {
      products: {
        edges: Array<{
          node: ShopifyProduct & {
            unlockTier?: { value: string };
            tagline?: { value: string };
          };
        }>;
      };
    };
  }>(query, { handle: collectionHandle, first: limit });

  return data.collection.products.edges.map(({ node }) => ({
    ...node,
    unlockTier: node.unlockTier?.value,
    tagline: node.tagline?.value,
  }));
}

/**
 * Check if Shopify integration is enabled
 */
export function isShopifyEnabled(): boolean {
  return Boolean(SHOPIFY_STORE_DOMAIN && SHOPIFY_STOREFRONT_TOKEN);
}
