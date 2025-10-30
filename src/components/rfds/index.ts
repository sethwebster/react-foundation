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
import { Button, ButtonLink, Pill, Rating, Collapsible, ScrollReveal, SegmentedControl, ThemeSegmentedControl, AccordionContent, Input, Textarea, Select, Label, Checkbox, Radio, Switch, Separator, Dialog, Tooltip } from "./primitives";
import { ProductCard, ProductGallery, UserAvatar, LibraryCard, RISScoreBreakdown, RISLibraryRankings, EcosystemLibraries, ByTheNumbers, LimitedDrops, FeaturedLook, FoundationHero, MissionStatement, PastDropsCollections, ExecutiveMessage, BecomeContributor, FeaturedCollections, JoinMovementCTA, HeroBadges, ThreePillars, Hero, FoundingMembers, PastDrops, UsernameInput, MaintainerProgress, ImpactSection, SignInButton, ErrorBoundary, Table, StatCard, FormInput, SearchInput, type TableColumn, type TableProps, type SortDirection } from "./components";
import { Header, Footer } from "./layouts";
import { SemanticButton, SemanticCard, SemanticBadge, SemanticInput, SemanticAlert, SemanticAvatar, SemanticSeparator, ContributorIcon, ContributorCard } from "./semantic-components";
import { Timeline, TimelineItem, TimelineStep, TimelineProgress } from "./timeline";
import { TableOfContents } from "./TableOfContents";

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
  AccordionContent,
  // Form Primitives
  Input,
  Textarea,
  Select,
  Label,
  Checkbox,
  Radio,
  Switch,
  // Layout Primitives
  Separator,
  Dialog,
  Tooltip,

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
  ContributorIcon,
  ContributorCard,

  // Timeline Components - For roadmaps and progress tracking
  Timeline,
  TimelineItem,
  TimelineStep,
  TimelineProgress,

  // Navigation Components
  TableOfContents,

  // Table Components
  Table,

  // Composition Components
  StatCard,
  FormInput,
  SearchInput,

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
  Input,
  Textarea,
  Select,
  Label,
  Checkbox,
  Radio,
  Switch,
  Separator,
  Dialog,
  Tooltip,
  // Components
  ProductCard,
  ProductGallery,
  Table,
  StatCard,
  FormInput,
  SearchInput,
  // Table Types
  type TableColumn,
  type TableProps,
  type SortDirection,
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
