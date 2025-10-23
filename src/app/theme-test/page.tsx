"use client";

import { useTheme } from "@/components/providers/theme-provider";
import { ThemeToggle, ThemeToggleWithLabel } from "@/components/ui/theme-toggle";
import { Button } from "@/components/ui/button";

export default function ThemeTestPage() {
  const { theme, setTheme, effectiveTheme } = useTheme();

  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Theme Testing Page</h1>
          <p className="text-muted-foreground mb-8">
            Test the theme switching functionality across different components
          </p>
        </div>

        {/* Theme Status */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">Current Theme Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">Selected Theme</p>
              <p className="text-lg font-semibold capitalize">{theme}</p>
            </div>
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">Effective Theme</p>
              <p className="text-lg font-semibold capitalize">{effectiveTheme}</p>
            </div>
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">System Preference</p>
              <p className="text-lg font-semibold capitalize">
                {typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'}
              </p>
            </div>
          </div>
        </div>

        {/* Theme Controls */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">Theme Controls</h2>
          <div className="flex flex-wrap gap-4 items-center">
            <ThemeToggle />
            <ThemeToggleWithLabel />
            <div className="flex gap-2">
              <Button
                variant={theme === 'light' ? 'primary' : 'ghost'}
                onClick={() => setTheme('light')}
                size="sm"
              >
                Light
              </Button>
              <Button
                variant={theme === 'dark' ? 'primary' : 'ghost'}
                onClick={() => setTheme('dark')}
                size="sm"
              >
                Dark
              </Button>
              <Button
                variant={theme === 'system' ? 'primary' : 'ghost'}
                onClick={() => setTheme('system')}
                size="sm"
              >
                System
              </Button>
            </div>
          </div>
        </div>

        {/* Color Palette */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">Color Palette</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <div className="h-16 bg-background border border-border rounded-lg"></div>
              <p className="text-sm text-center">Background</p>
            </div>
            <div className="space-y-2">
              <div className="h-16 bg-foreground rounded-lg"></div>
              <p className="text-sm text-center">Foreground</p>
            </div>
            <div className="space-y-2">
              <div className="h-16 bg-muted rounded-lg"></div>
              <p className="text-sm text-center">Muted</p>
            </div>
            <div className="space-y-2">
              <div className="h-16 bg-primary rounded-lg"></div>
              <p className="text-sm text-center">Primary</p>
            </div>
            <div className="space-y-2">
              <div className="h-16 bg-secondary rounded-lg"></div>
              <p className="text-sm text-center">Secondary</p>
            </div>
            <div className="space-y-2">
              <div className="h-16 bg-accent rounded-lg"></div>
              <p className="text-sm text-center">Accent</p>
            </div>
            <div className="space-y-2">
              <div className="h-16 bg-destructive rounded-lg"></div>
              <p className="text-sm text-center">Destructive</p>
            </div>
            <div className="space-y-2">
              <div className="h-16 bg-border rounded-lg"></div>
              <p className="text-sm text-center">Border</p>
            </div>
          </div>
        </div>

        {/* Component Examples */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">Component Examples</h2>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-4">
              <Button variant="primary">Default</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="ghost">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="ghost">Destructive</Button>
            </div>
            
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-muted-foreground">
                This is a muted background with muted foreground text.
              </p>
            </div>
            
            <div className="p-4 border border-border rounded-lg">
              <p className="text-foreground">
                This is a bordered container with foreground text.
              </p>
            </div>
          </div>
        </div>

        {/* Typography */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">Typography</h2>
          <div className="space-y-4">
            <h1 className="text-4xl font-bold text-foreground">Heading 1</h1>
            <h2 className="text-3xl font-semibold text-foreground">Heading 2</h2>
            <h3 className="text-2xl font-medium text-foreground">Heading 3</h3>
            <p className="text-base text-foreground">
              This is a paragraph with regular text color.
            </p>
            <p className="text-sm text-muted-foreground">
              This is smaller text with muted foreground color.
            </p>
            <p className="text-xs text-muted-foreground">
              This is extra small text with muted foreground color.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

