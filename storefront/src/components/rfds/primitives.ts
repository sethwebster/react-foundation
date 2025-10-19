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

// Re-export for namespace
import { Button, ButtonLink } from "@/components/ui/button";
import { Pill } from "@/components/ui/pill";
import { Rating } from "@/components/ui/rating";
import { Collapsible } from "@/components/ui/collapsible";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

export const Primitives = {
  Button,
  ButtonLink,
  Pill,
  Rating,
  Collapsible,
  ScrollReveal,
};
