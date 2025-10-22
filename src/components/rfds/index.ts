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
import { Button, ButtonLink, Pill, Rating, Collapsible, ScrollReveal, SegmentedControl, ThemeSegmentedControl } from "./primitives";
import { ProductCard, ProductGallery, UserAvatar, LibraryCard, RISScoreBreakdown, RISLibraryRankings, EcosystemLibraries, ByTheNumbers, LimitedDrops, FeaturedLook, FoundationHero, MissionStatement, PastDropsCollections, ExecutiveMessage, BecomeContributor, FeaturedCollections, JoinMovementCTA, HeroBadges, ThreePillars, Hero, FoundingMembers, PastDrops, UsernameInput, MaintainerProgress, ImpactSection, SignInButton, ErrorBoundary } from "./components";
import { Header, Footer } from "./layouts";
import { SemanticButton, SemanticCard, SemanticBadge, SemanticInput, SemanticAlert, SemanticAvatar, SemanticSeparator } from "./semantic-components";

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
  SegmentedControl,
  ThemeSegmentedControl,

  // Components - Composed UI elements
  ProductCard,
  ProductGallery,
  UserAvatar,
  LibraryCard,
  RISScoreBreakdown,
  RISLibraryRankings,
  EcosystemLibraries,
  ByTheNumbers,
  LimitedDrops,
  FeaturedLook,
  FoundationHero,
  MissionStatement,
  PastDropsCollections,
  ExecutiveMessage,
  BecomeContributor,
  FeaturedCollections,
  JoinMovementCTA,
  HeroBadges,
  ThreePillars,
  Hero,
  FoundingMembers,
  PastDrops,
  UsernameInput,
  MaintainerProgress,
  ImpactSection,
  SignInButton,
  ErrorBoundary,

  // Layouts - Page structure
  Header,
  Footer,

  // Semantic Components - Themeable components
  SemanticButton,
  SemanticCard,
  SemanticBadge,
  SemanticInput,
  SemanticAlert,
  SemanticAvatar,
  SemanticSeparator,

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
  SegmentedControl,
  ThemeSegmentedControl,
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
