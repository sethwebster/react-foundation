/**
 * Table of Contents Demo Page
 * Demonstrates the TableOfContents component from RFDS
 */

'use client';

import { RFDS } from '@/components/rfds';

const sections = [
  { id: 'introduction', title: 'Introduction', level: 1 as const },
  { id: 'getting-started', title: 'Getting Started', level: 1 as const },
  { id: 'installation', title: 'Installation', level: 2 as const },
  { id: 'configuration', title: 'Configuration', level: 2 as const },
  { id: 'basic-usage', title: 'Basic Usage', level: 1 as const },
  { id: 'props', title: 'Props', level: 2 as const },
  { id: 'sections-prop', title: 'Sections Prop', level: 3 as const },
  { id: 'title-prop', title: 'Title Prop', level: 3 as const },
  { id: 'advanced-usage', title: 'Advanced Usage', level: 1 as const },
  { id: 'sticky-positioning', title: 'Sticky Positioning', level: 2 as const },
  { id: 'scroll-tracking', title: 'Scroll Tracking', level: 2 as const },
  { id: 'accessibility', title: 'Accessibility', level: 1 as const },
  { id: 'keyboard-navigation', title: 'Keyboard Navigation', level: 2 as const },
  { id: 'screen-readers', title: 'Screen Readers', level: 2 as const },
  { id: 'examples', title: 'Examples', level: 1 as const },
  { id: 'conclusion', title: 'Conclusion', level: 1 as const },
];

export default function TOCDemoPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-xl font-bold text-foreground">Table of Contents Demo</h1>
        </div>
      </header>

      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr,250px] gap-8">
          {/* Main Content */}
          <main className="prose prose-slate dark:prose-invert max-w-none">
            <Section id="introduction" title="Introduction" level={1}>
              <p>
                The TableOfContents component provides an interactive navigation sidebar that automatically
                tracks which section the user is currently viewing. It&apos;s perfect for long-form content like
                documentation, blog posts, and guides.
              </p>
              <p>
                This component is part of the React Foundation Design System (RFDS) and follows all semantic
                theming conventions, meaning it automatically adapts to light and dark modes.
              </p>
            </Section>

            <Section id="getting-started" title="Getting Started" level={1}>
              <p>
                To use the TableOfContents component, you&apos;ll need to import it from the RFDS package and
                provide it with an array of sections to track.
              </p>
            </Section>

            <Section id="installation" title="Installation" level={2}>
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
                <code>{`import { RFDS } from '@/components/rfds';

const sections = [
  { id: 'intro', title: 'Introduction', level: 1 },
  { id: 'setup', title: 'Setup', level: 2 },
];`}</code>
              </pre>
            </Section>

            <Section id="configuration" title="Configuration" level={2}>
              <p>
                The component requires minimal configuration. Simply pass in your sections array and
                optionally customize the title.
              </p>
              <ul>
                <li>Define your sections with unique IDs</li>
                <li>Assign appropriate heading levels (1, 2, or 3)</li>
                <li>Ensure corresponding HTML elements have matching IDs</li>
              </ul>
            </Section>

            <Section id="basic-usage" title="Basic Usage" level={1}>
              <p>
                Here&apos;s a complete example of using the TableOfContents component in your page:
              </p>
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
                <code>{`<div className="grid grid-cols-[1fr,250px]">
  <main>{/* Your content */}</main>
  <aside>
    <RFDS.TableOfContents sections={sections} />
  </aside>
</div>`}</code>
              </pre>
            </Section>

            <Section id="props" title="Props" level={2}>
              <p>The TableOfContents component accepts the following props:</p>
            </Section>

            <Section id="sections-prop" title="Sections Prop" level={3}>
              <p>
                <strong>Type:</strong> <code>TOCSection[]</code>
              </p>
              <p>
                An array of section objects, each containing an ID, title, and level. The level determines
                the indentation (1 = least indented, 3 = most indented).
              </p>
            </Section>

            <Section id="title-prop" title="Title Prop" level={3}>
              <p>
                <strong>Type:</strong> <code>string</code>
              </p>
              <p>
                <strong>Default:</strong> <code>&quot;On this page&quot;</code>
              </p>
              <p>
                The heading text displayed above the table of contents.
              </p>
            </Section>

            <Section id="advanced-usage" title="Advanced Usage" level={1}>
              <p>
                The TableOfContents component includes several advanced features that work automatically.
              </p>
            </Section>

            <Section id="sticky-positioning" title="Sticky Positioning" level={2}>
              <p>
                The component uses CSS sticky positioning to remain visible while scrolling. It automatically
                accounts for fixed headers and provides a maximum height with overflow scrolling for very
                long tables of contents.
              </p>
            </Section>

            <Section id="scroll-tracking" title="Scroll Tracking" level={2}>
              <p>
                Using the Intersection Observer API, the component tracks which section is currently visible
                in the viewport. The active section is highlighted automatically, and there&apos;s a visual
                indicator bar that animates smoothly between sections.
              </p>
              <p>
                The tracking algorithm prioritizes sections closest to the top of the viewport, ensuring
                accurate highlighting even when multiple sections are visible simultaneously.
              </p>
            </Section>

            <Section id="accessibility" title="Accessibility" level={1}>
              <p>
                The TableOfContents component is built with accessibility in mind.
              </p>
            </Section>

            <Section id="keyboard-navigation" title="Keyboard Navigation" level={2}>
              <p>
                All TOC links are keyboard accessible. You can navigate using:
              </p>
              <ul>
                <li><kbd>Tab</kbd> - Move between links</li>
                <li><kbd>Enter</kbd> or <kbd>Space</kbd> - Activate link</li>
                <li>Focus indicators are clearly visible</li>
              </ul>
            </Section>

            <Section id="screen-readers" title="Screen Readers" level={2}>
              <p>
                The component includes proper ARIA attributes:
              </p>
              <ul>
                <li><code>aria-label</code> on the nav element</li>
                <li><code>aria-current=&quot;location&quot;</code> on the active link</li>
                <li>Semantic HTML with proper heading hierarchy</li>
              </ul>
            </Section>

            <Section id="examples" title="Examples" level={1}>
              <p>
                This page itself is an example! Notice how the table of contents on the right (or above on
                mobile) highlights the current section as you scroll. Try clicking different sections to see
                the smooth scroll behavior.
              </p>
              <p>
                You can also use your keyboard to navigate: Tab to a TOC link and press Enter to jump to
                that section.
              </p>
            </Section>

            <Section id="conclusion" title="Conclusion" level={1}>
              <p>
                The TableOfContents component is a powerful addition to the RFDS that makes long-form content
                easier to navigate. Its automatic tracking, smooth animations, and accessibility features
                provide an excellent user experience.
              </p>
              <p>
                For more information about the React Foundation Design System, check out the other components
                and utilities available in the RFDS package.
              </p>
            </Section>
          </main>

          {/* Table of Contents Sidebar */}
          <aside className="hidden lg:block">
            <RFDS.TableOfContents sections={sections} title="On this page" />
          </aside>
        </div>
      </div>
    </div>
  );
}

interface SectionProps {
  id: string;
  title: string;
  level: 1 | 2 | 3;
  children: React.ReactNode;
}

function Section({ id, title, level, children }: SectionProps) {
  const className = level === 1
    ? 'text-3xl font-bold mt-12 mb-4 text-foreground'
    : level === 2
    ? 'text-2xl font-bold mt-8 mb-3 text-foreground'
    : 'text-xl font-semibold mt-6 mb-2 text-foreground';

  return (
    <section id={id} className="scroll-mt-24">
      {level === 1 && <h1 className={className}>{title}</h1>}
      {level === 2 && <h2 className={className}>{title}</h2>}
      {level === 3 && <h3 className={className}>{title}</h3>}
      <div className="text-foreground/80">{children}</div>
    </section>
  );
}
