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
    } | null;
  }>(query, { handle: collectionHandle, first: limit });

  if (!data.collection) {
    return [];
  }

  return data.collection.products.edges.map(({ node }) => ({
    ...node,
    unlockTier: node.unlockTier?.value,
    tagline: node.tagline?.value,
  }));
}

/**
 * Collection type from Shopify with React Foundation metafields
 */
export interface ShopifyCollection {
  id: string;
  handle: string;
  title: string;
  description: string;
  descriptionHtml: string;
  image: {
    url: string;
    altText: string | null;
    width: number;
    height: number;
  } | null;
  products: {
    edges: Array<{
      node: {
        id: string;
      };
    }>;
  };
  // React Foundation metafields
  // Drop-specific
  isDrop?: boolean;
  dropNumber?: number;
  dropStartDate?: string;
  dropEndDate?: string;
  dropSeason?: string;
  dropYear?: number;
  dropTheme?: string;
  limitedEditionSize?: number;
  // Perennial-specific
  isPerennial?: boolean;
  collectionType?: string;
  // Display control
  homeFeatured?: boolean;
  homeFeaturedOrder?: number;
  accentGradient?: string;
  // Time-limited (for non-drop curated collections)
  timeLimited?: boolean;
}

/**
 * Calculate drop status from dates
 */
export function getDropStatus(collection: ShopifyCollection): "current" | "upcoming" | "past" | null {
  if (!collection.isDrop) return null;

  const now = new Date();
  const startDate = collection.dropStartDate ? new Date(collection.dropStartDate) : null;
  const endDate = collection.dropEndDate ? new Date(collection.dropEndDate) : null;

  // If no dates set, assume it's current
  if (!startDate && !endDate) return 'current';

  // If we have a start date and we haven't reached it yet
  if (startDate && now < startDate) return 'upcoming';

  // If we have an end date and we've passed it
  if (endDate && now > endDate) return 'past';

  // Otherwise it's current
  return 'current';
}

/**
 * Fetch all collections from Shopify with full metafields
 */
export async function getAllCollections(limit = 50): Promise<ShopifyCollection[]> {
  const query = `
    query getCollections($first: Int!) {
      collections(first: $first) {
        edges {
          node {
            id
            handle
            title
            description
            descriptionHtml
            image {
              url
              altText
              width
              height
            }
            products(first: 1) {
              edges {
                node {
                  id
                }
              }
            }
            isDrop: metafield(namespace: "react_foundation", key: "is_drop") { value }
            dropNumber: metafield(namespace: "react_foundation", key: "drop_number") { value }
            dropStartDate: metafield(namespace: "react_foundation", key: "drop_start_date") { value }
            dropEndDate: metafield(namespace: "react_foundation", key: "drop_end_date") { value }
            dropSeason: metafield(namespace: "react_foundation", key: "drop_season") { value }
            dropYear: metafield(namespace: "react_foundation", key: "drop_year") { value }
            dropTheme: metafield(namespace: "react_foundation", key: "drop_theme") { value }
            limitedEditionSize: metafield(namespace: "react_foundation", key: "limited_edition_size") { value }
            isPerennial: metafield(namespace: "react_foundation", key: "is_perennial") { value }
            collectionType: metafield(namespace: "react_foundation", key: "collection_type") { value }
            homeFeatured: metafield(namespace: "react_foundation", key: "home_featured") { value }
            homeFeaturedOrder: metafield(namespace: "react_foundation", key: "home_featured_order") { value }
            accentGradient: metafield(namespace: "react_foundation", key: "accent_gradient") { value }
            timeLimited: metafield(namespace: "react_foundation", key: "time_limited") { value }
          }
        }
      }
    }
  `;

  type MetafieldValue = { value: string } | null | undefined;

  const data = await shopifyFetch<{
    collections: {
      edges: Array<{
        node: Omit<ShopifyCollection, 'isDrop' | 'dropNumber' | 'dropStartDate' | 'dropEndDate' | 'dropSeason' | 'dropYear' | 'dropTheme' | 'limitedEditionSize' | 'isPerennial' | 'collectionType' | 'homeFeatured' | 'homeFeaturedOrder' | 'accentGradient' | 'timeLimited'> & {
          isDrop?: MetafieldValue;
          dropNumber?: MetafieldValue;
          dropStartDate?: MetafieldValue;
          dropEndDate?: MetafieldValue;
          dropSeason?: MetafieldValue;
          dropYear?: MetafieldValue;
          dropTheme?: MetafieldValue;
          limitedEditionSize?: MetafieldValue;
          isPerennial?: MetafieldValue;
          collectionType?: MetafieldValue;
          homeFeatured?: MetafieldValue;
          homeFeaturedOrder?: MetafieldValue;
          accentGradient?: MetafieldValue;
          timeLimited?: MetafieldValue;
        };
      }>;
    };
  }>(query, { first: limit });

  return data.collections.edges.map(({ node }) => ({
    ...node,
    isDrop: node.isDrop?.value === 'true',
    dropNumber: node.dropNumber?.value ? parseInt(node.dropNumber.value, 10) : undefined,
    dropStartDate: node.dropStartDate?.value,
    dropEndDate: node.dropEndDate?.value,
    dropSeason: node.dropSeason?.value,
    dropYear: node.dropYear?.value ? parseInt(node.dropYear.value, 10) : undefined,
    dropTheme: node.dropTheme?.value,
    limitedEditionSize: node.limitedEditionSize?.value ? parseInt(node.limitedEditionSize.value, 10) : undefined,
    isPerennial: node.isPerennial?.value === 'true',
    collectionType: node.collectionType?.value,
    homeFeatured: node.homeFeatured?.value === 'true',
    homeFeaturedOrder: node.homeFeaturedOrder?.value ? parseInt(node.homeFeaturedOrder.value, 10) : undefined,
    accentGradient: node.accentGradient?.value,
    timeLimited: node.timeLimited?.value === 'true',
  }));
}

/**
 * Get current drop collections (calculated from dates)
 */
export function getCurrentDrops(collections: ShopifyCollection[]): ShopifyCollection[] {
  return collections
    .filter(c => c.isDrop && getDropStatus(c) === 'current')
    .sort((a, b) => (b.dropNumber || 0) - (a.dropNumber || 0));
}

/**
 * Get past drop collections (calculated from dates)
 */
export function getPastDrops(collections: ShopifyCollection[]): ShopifyCollection[] {
  return collections
    .filter(c => c.isDrop && getDropStatus(c) === 'past')
    .sort((a, b) => (b.dropNumber || 0) - (a.dropNumber || 0));
}

/**
 * Get upcoming drop collections (calculated from dates)
 */
export function getUpcomingDrops(collections: ShopifyCollection[]): ShopifyCollection[] {
  return collections
    .filter(c => c.isDrop && getDropStatus(c) === 'upcoming')
    .sort((a, b) => (a.dropNumber || 0) - (b.dropNumber || 0));
}

/**
 * Get perennial collections
 */
export function getPerennialCollections(collections: ShopifyCollection[]): ShopifyCollection[] {
  return collections.filter(c => c.isPerennial);
}

/**
 * Get featured collections for home page
 */
export function getFeaturedCollections(collections: ShopifyCollection[]): ShopifyCollection[] {
  return collections
    .filter(c => c.homeFeatured)
    .sort((a, b) => (a.homeFeaturedOrder || 999) - (b.homeFeaturedOrder || 999))
    .slice(0, 3);
}

/**
 * Check if Shopify integration is enabled
 */
export function isShopifyEnabled(): boolean {
  return Boolean(SHOPIFY_STORE_DOMAIN && SHOPIFY_STOREFRONT_TOKEN);
}
