/**
 * React Foundation Design System - Components Layer
 *
 * Composed UI elements built from primitives
 * These components use semantic theming and are fully themeable
 */

// Layout Components
export { Header } from "@/components/layout/header";
export { Footer } from "@/components/layout/footer";
export { MobileMenu } from "@/components/layout/mobile-menu";

// Product Components
export { ProductCard } from "@/components/ui/product-card";
export { ProductGallery } from "@/components/ui/product-gallery";

// User Components
export { UserAvatar } from "@/components/ui/user-avatar";

// Library Components
export { LibraryCard } from "@/components/ui/library-card";

// RIS Components
export { RISScoreBreakdown } from "@/components/ris/ris-score-breakdown";
export { RISLibraryRankings } from "@/components/ris/ris-library-rankings";

// Home Components
export { EcosystemLibraries } from "@/components/home/ecosystem-libraries";
export { ByTheNumbers } from "@/components/home/by-the-numbers";
export { LimitedDrops } from "@/components/home/limited-drops";
export { FeaturedLook } from "@/components/home/featured-look";
export { FoundationHero } from "@/components/home/foundation-hero";
export { MissionStatement } from "@/components/home/mission-statement";
export { PastDropsCollections } from "@/components/home/past-drops-collections";
export { ExecutiveMessage } from "@/components/home/executive-message";
export { BecomeContributor } from "@/components/home/become-contributor";
export { FeaturedCollections } from "@/components/home/featured-collections";
export { JoinMovementCTA } from "@/components/home/join-movement-cta";
export { HeroBadges } from "@/components/home/hero-badges";
export { ThreePillars } from "@/components/home/three-pillars";
export { Hero } from "@/components/home/hero";
export { FoundingMembers } from "@/components/home/founding-members";
export { PastDrops } from "@/components/home/past-drops";

// Feature Components
export { UsernameInput } from "@/features/maintainer-progress/username-input";
export { MaintainerProgress } from "@/features/maintainer-progress/maintainer-progress";
export { ImpactSection } from "@/features/impact/impact-section";
export { SignInButton } from "@/features/auth/sign-in-button";

// Error Components
export { ErrorBoundary } from "@/components/error-boundary";

// Table Components
export { Table, type TableColumn, type TableProps, type SortDirection } from "./table";

// Re-export for namespace
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { MobileMenu } from "@/components/layout/mobile-menu";
import { ProductCard } from "@/components/ui/product-card";
import { ProductGallery } from "@/components/ui/product-gallery";
import { UserAvatar } from "@/components/ui/user-avatar";
import { LibraryCard } from "@/components/ui/library-card";
import { RISScoreBreakdown } from "@/components/ris/ris-score-breakdown";
import { RISLibraryRankings } from "@/components/ris/ris-library-rankings";
import { EcosystemLibraries } from "@/components/home/ecosystem-libraries";
import { ByTheNumbers } from "@/components/home/by-the-numbers";
import { LimitedDrops } from "@/components/home/limited-drops";
import { FeaturedLook } from "@/components/home/featured-look";
import { FoundationHero } from "@/components/home/foundation-hero";
import { MissionStatement } from "@/components/home/mission-statement";
import { PastDropsCollections } from "@/components/home/past-drops-collections";
import { ExecutiveMessage } from "@/components/home/executive-message";
import { BecomeContributor } from "@/components/home/become-contributor";
import { FeaturedCollections } from "@/components/home/featured-collections";
import { JoinMovementCTA } from "@/components/home/join-movement-cta";
import { HeroBadges } from "@/components/home/hero-badges";
import { ThreePillars } from "@/components/home/three-pillars";
import { Hero } from "@/components/home/hero";
import { FoundingMembers } from "@/components/home/founding-members";
import { PastDrops } from "@/components/home/past-drops";
import { UsernameInput } from "@/features/maintainer-progress/username-input";
import { MaintainerProgress } from "@/features/maintainer-progress/maintainer-progress";
import { ImpactSection } from "@/features/impact/impact-section";
import { SignInButton } from "@/features/auth/sign-in-button";
import { ErrorBoundary } from "@/components/error-boundary";
import { Table } from "./table";

export const Components = {
  // Layout
  Header,
  Footer,
  MobileMenu,
  
  // Product
  ProductCard,
  ProductGallery,
  
  // User
  UserAvatar,
  
  // Library
  LibraryCard,
  
  // RIS
  RISScoreBreakdown,
  RISLibraryRankings,
  
  // Home
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
  
  // Features
  UsernameInput,
  MaintainerProgress,
  ImpactSection,
  SignInButton,
  
  // Error
  ErrorBoundary,
  
  // Table
  Table,
};