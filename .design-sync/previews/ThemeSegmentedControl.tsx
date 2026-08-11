// ThemeSegmentedControl is an alias for ThemeToggle
// (src/components/ui/theme-toggle.tsx). It calls useTheme(), which THROWS
// "useTheme must be used within a ThemeProvider" when no provider is above it.
// ThemeProvider is not exported from the bundle and cfg.provider is unset, so
// this preview can only render if the harness wraps previews in ThemeProvider.
import { ThemeSegmentedControl } from 'storefront';

export const InHeaderBar = () => (
  <div className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-2">
    <span className="text-sm font-medium text-foreground">React Foundation</span>
    <ThemeSegmentedControl />
  </div>
);

export const Standalone = () => (
  <div className="flex items-center justify-center py-6">
    <ThemeSegmentedControl />
  </div>
);
