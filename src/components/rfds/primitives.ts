/**
 * RFDS Primitives
 *
 * Base-layer design system components
 * Small, reusable, composable building blocks
 */

// Core UI Primitives
export { Button, ButtonLink } from "@/components/ui/button";
export { Pill } from "@/components/ui/pill";
export { Rating } from "@/components/ui/rating";
export { Collapsible } from "@/components/ui/collapsible";
export { ScrollReveal } from "@/components/ui/scroll-reveal";
export { SegmentedControl } from "@/components/ui/segmented-control";
export { ThemeToggle as ThemeSegmentedControl } from "@/components/ui/theme-toggle";

// Re-export for namespace
import { Button, ButtonLink } from "@/components/ui/button";
import { Pill } from "@/components/ui/pill";
import { Rating } from "@/components/ui/rating";
import { Collapsible } from "@/components/ui/collapsible";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { ThemeToggle } from "@/components/ui/theme-toggle";
const ThemeSegmentedControl = ThemeToggle; // Alias for compatibility

export const Primitives = {
  Button,
  ButtonLink,
  Pill,
  Rating,
  Collapsible,
  ScrollReveal,
  SegmentedControl,
  ThemeSegmentedControl,
};
