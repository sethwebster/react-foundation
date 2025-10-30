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
export { AccordionContent } from "./accordion";

// Form Primitives
export { Input, type InputProps } from "@/components/ui/input";
export { Textarea, type TextareaProps } from "@/components/ui/textarea";
export { Select, type SelectProps } from "@/components/ui/select";
export { Label, type LabelProps } from "@/components/ui/label";
export { Checkbox, type CheckboxProps } from "@/components/ui/checkbox";
export { Radio, type RadioProps } from "@/components/ui/radio";
export { Switch, type SwitchProps } from "@/components/ui/switch";

// Layout Primitives
export { Separator, type SeparatorProps } from "@/components/ui/separator";
export { Dialog, type DialogProps } from "@/components/ui/dialog";
export { Tooltip, type TooltipProps } from "@/components/ui/tooltip";

// Re-export for namespace
import { Button, ButtonLink } from "@/components/ui/button";
import { Pill } from "@/components/ui/pill";
import { Rating } from "@/components/ui/rating";
import { Collapsible } from "@/components/ui/collapsible";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { AccordionContent } from "./accordion";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Radio } from "@/components/ui/radio";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Dialog } from "@/components/ui/dialog";
import { Tooltip } from "@/components/ui/tooltip";

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
};
