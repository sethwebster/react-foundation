import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('public product reads without Shopify', () => {
  const originalEnv = {
    SHOPIFY_STORE_DOMAIN: process.env.SHOPIFY_STORE_DOMAIN,
    SHOPIFY_STOREFRONT_TOKEN: process.env.SHOPIFY_STOREFRONT_TOKEN,
  };

  beforeEach(() => {
    vi.resetModules();
    delete process.env.SHOPIFY_STORE_DOMAIN;
    delete process.env.SHOPIFY_STOREFRONT_TOKEN;
  });

  afterEach(() => {
    process.env.SHOPIFY_STORE_DOMAIN = originalEnv.SHOPIFY_STORE_DOMAIN;
    process.env.SHOPIFY_STOREFRONT_TOKEN = originalEnv.SHOPIFY_STOREFRONT_TOKEN;
  });

  it('uses the local catalog for product detail pages', async () => {
    const { getProductBySlug } = await import('./products-shopify');

    await expect(getProductBySlug('fiber-shell')).resolves.toMatchObject({
      slug: 'fiber-shell',
      collections: ['current-drop'],
      primaryImage: {
        src: '/placeholders/drop-fiber.png',
      },
    });
  });

  it('uses the local catalog for collection detail pages', async () => {
    const { getProductsByCollection } = await import('./products-shopify');

    const products = await getProductsByCollection('current-drop');

    expect(products.map((product) => product.slug)).toContain('fiber-shell');
  });
});
