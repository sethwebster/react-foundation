/**
 * Dynamic Sitemap Generator
 * Automatically generates sitemap.xml from Next.js routes and dynamic content
 */

import { MetadataRoute } from 'next';
import { getAllCollections } from '@/lib/shopify';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://react.foundation';

  // Static routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/impact`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    // Store
    {
      url: `${baseUrl}/store`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    // Communities
    {
      url: `${baseUrl}/communities`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/communities/start`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/communities/add`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    // Educators
    {
      url: `${baseUrl}/educators`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/educators/apply`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
  ];

  // Dynamic collection pages
  let collectionRoutes: MetadataRoute.Sitemap = [];
  try {
    const collections = await getAllCollections();
    collectionRoutes = collections.map((collection: { handle: string; updatedAt?: string }) => ({
      url: `${baseUrl}/store/collections/${collection.handle}`,
      lastModified: new Date(collection.updatedAt || Date.now()),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));
  } catch (error) {
    console.error('Error fetching collections for sitemap:', error);
  }

  // Dynamic product pages would go here if we had a getProducts function
  // For now, products are discovered via collections

  return [...staticRoutes, ...collectionRoutes];
}
