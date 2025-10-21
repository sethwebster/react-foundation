/**
 * React Foundation Design System (RFDS)
 *
 * A layered design system for the React Foundation.
 *
 * Architecture:
 * - Primitives: Base building blocks (Button, Typography, etc.)
 * - Components: Composed from primitives (ProductCard, etc.)
 * - Layouts: Page structure (Header, Footer)
 * - Features: Complex feature components (MaintainerProgress, etc.)
 *
 * Usage:
 * ```tsx
 * import { RFDS } from "@/components/rfds"
 *
 * <RFDS.Button variant="primary" size="lg">Click me</RFDS.Button>
 * <RFDS.ProductCard product={product} />
 * ```
 *
 * @version 1.0.0
 */

import { Primitives } from "./primitives";
import { Components } from "./components";
import { Layouts } from "./layouts";

// Import individual components for direct access
import { Button, ButtonLink, Pill, Rating, Collapsible, ScrollReveal } from "./primitives";
import { ProductCard, ProductGallery } from "./components";
import { Header, Footer } from "./layouts";

/**
 * React Foundation Design System namespace
 *
 * Organized by layer for clarity and maintainability
 */
export const RFDS = {
  // Primitives - Base building blocks
  Button,
  ButtonLink,
  Pill,
  Rating,
  Collapsible,
  ScrollReveal,

  // Components - Composed UI elements
  ProductCard,
  ProductGallery,

  // Layouts - Page structure
  Header,
  Footer,

  // Layers - For advanced usage
  Primitives,
  Components,
  Layouts,
};

// Named exports for direct imports (backwards compatibility)
export {
  // Primitives
  Button,
  ButtonLink,
  Pill,
  Rating,
  Collapsible,
  ScrollReveal,
  // Components
  ProductCard,
  ProductGallery,
  // Layouts
  Header,
  Footer,
  // Layers
  Primitives,
  Components,
  Layouts,
};

// Default export
export default RFDS;
