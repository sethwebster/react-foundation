/**
 * RFDS Components
 *
 * Composed components built from primitives
 * Reusable across the application
 */

export { ProductCard } from "@/components/ui/product-card";
export { ProductGallery } from "@/components/ui/product-gallery";

// Re-export for namespace
import { ProductCard } from "@/components/ui/product-card";
import { ProductGallery } from "@/components/ui/product-gallery";

export const Components = {
  ProductCard,
  ProductGallery,
};
