/**
 * Dynamic Sitemap Generator
 * Automatically generates sitemap.xml from Next.js routes and dynamic content
 */

import { MetadataRoute } from 'next';

import { REACT_COMMUNITIES } from '@/data/communities';
import { getAllAuthors } from '@/lib/authors';
import { getAllCollections, getAllProducts } from '@/lib/shopify';
import { getAllUpdates } from '@/lib/updates';

const buildEntry = (
  baseUrl: string,
  path: string,
  changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'],
  priority: number,
  lastModified: Date = new Date(),
): MetadataRoute.Sitemap[number] => ({
  url: path ? `${baseUrl}${path}` : baseUrl,
  lastModified,
  changeFrequency,
  priority,
});

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://react.foundation';

  const staticRoutes: MetadataRoute.Sitemap = [
    buildEntry(baseUrl, '', 'daily', 1.0),
    buildEntry(baseUrl, '/about', 'monthly', 0.8),
    buildEntry(baseUrl, '/about/board-of-directors', 'monthly', 0.7),
    buildEntry(baseUrl, '/about/technical-steering-committee', 'monthly', 0.7),
    buildEntry(baseUrl, '/impact', 'weekly', 0.9),
    buildEntry(baseUrl, '/summit', 'monthly', 0.9),
    buildEntry(baseUrl, '/authors', 'weekly', 0.8),
    buildEntry(baseUrl, '/updates', 'weekly', 0.8),
    buildEntry(baseUrl, '/libraries', 'weekly', 0.8),
    buildEntry(baseUrl, '/scoring', 'weekly', 0.8),
    buildEntry(baseUrl, '/privacy', 'yearly', 0.4),
    buildEntry(baseUrl, '/terms', 'yearly', 0.4),
    buildEntry(baseUrl, '/store', 'daily', 0.9),
    buildEntry(baseUrl, '/store/collections', 'weekly', 0.8),
    buildEntry(baseUrl, '/communities', 'weekly', 0.9),
    buildEntry(baseUrl, '/communities/start', 'monthly', 0.9),
    buildEntry(baseUrl, '/communities/add', 'monthly', 0.7),
  ];

  const communityRoutes: MetadataRoute.Sitemap = REACT_COMMUNITIES.map((community) =>
    buildEntry(
      baseUrl,
      `/communities/${community.slug}`,
      'weekly',
      0.7,
      community.updated_at ? new Date(community.updated_at) : new Date(),
    ),
  );

  const authorRoutes: MetadataRoute.Sitemap = getAllAuthors().map((author) =>
    buildEntry(baseUrl, `/authors/${author.slug}`, 'monthly', 0.6),
  );

  const updateRoutes: MetadataRoute.Sitemap = getAllUpdates().map((update) =>
    buildEntry(baseUrl, `/updates/${update.slug}`, 'monthly', 0.7, new Date(update.metadata.date)),
  );

  let collectionRoutes: MetadataRoute.Sitemap = [];
  let productRoutes: MetadataRoute.Sitemap = [];

  try {
    const collections = await getAllCollections();
    collectionRoutes = collections.map((collection: { handle: string; updatedAt?: string }) =>
      buildEntry(
        baseUrl,
        `/store/collections/${collection.handle}`,
        'weekly',
        0.8,
        collection.updatedAt ? new Date(collection.updatedAt) : new Date(),
      ),
    );
  } catch (error) {
    console.error('Error fetching collections for sitemap:', error);
  }

  try {
    const products = await getAllProducts();
    productRoutes = products.map((product) =>
      buildEntry(baseUrl, `/store/products/${product.handle}`, 'weekly', 0.7),
    );
  } catch (error) {
    console.error('Error fetching products for sitemap:', error);
  }

  return [
    ...staticRoutes,
    ...communityRoutes,
    ...authorRoutes,
    ...updateRoutes,
    ...collectionRoutes,
    ...productRoutes,
  ];
}
