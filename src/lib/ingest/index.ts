/**
 * Ingestion System
 * Push-based content ingestion with loaders, chunking, and embeddings
 * Based on AUTO_INGESTION_SETUP.md specification
 */

export * from './types';
export * from './chunk';
export * from './embed';
export * from './upsert';
export * from './content-map';
export * from './redis-index';

// Loaders
export { MDXLoader } from './loaders/mdx';
export { CommunitiesLoader } from './loaders/communities';
export { LibrariesLoader } from './loaders/libraries';
export { PagesLoader } from './loaders/pages';
