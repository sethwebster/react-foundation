import type { Meta, StoryObj } from '@storybook/react';
import { RFDS } from '@/components/rfds';

const meta = {
  title: 'RFDS/Complete Showcase',
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const AllComponents: Story = {
  render: () => (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-16">

        {/* Header */}
        <header className="text-center space-y-4 pb-8 border-b border-border">
          <h1 className="text-5xl font-bold text-foreground">
            React Foundation Design System
          </h1>
          <p className="text-xl text-muted-foreground">
            Complete component library with semantic theming
          </p>
        </header>

        {/* Primitives */}
        <section className="space-y-6">
          <h2 className="text-3xl font-bold text-foreground">Primitives</h2>

          <div className="space-y-8">
            <div>
              <h3 className="text-xl font-semibold mb-4 text-foreground">Buttons</h3>
              <div className="flex flex-wrap gap-4">
                <RFDS.Button variant="primary">Primary</RFDS.Button>
                <RFDS.Button variant="secondary">Secondary</RFDS.Button>
                <RFDS.Button variant="tertiary">Tertiary</RFDS.Button>
                <RFDS.Button variant="ghost">Ghost</RFDS.Button>
              </div>
              <div className="flex flex-wrap gap-4 mt-4">
                <RFDS.Button size="sm">Small</RFDS.Button>
                <RFDS.Button size="md">Medium</RFDS.Button>
                <RFDS.Button size="lg">Large</RFDS.Button>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-4 text-foreground">Pills</h3>
              <div className="flex flex-wrap gap-4">
                <RFDS.Pill>Limited Edition</RFDS.Pill>
                <RFDS.Pill>New Release</RFDS.Pill>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-4 text-foreground">Rating</h3>
              <RFDS.Rating value={4.5} />
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-4 text-foreground">Theme Toggle</h3>
              <RFDS.ThemeSegmentedControl />
            </div>
          </div>
        </section>

        {/* Semantic Components */}
        <section className="space-y-6">
          <h2 className="text-3xl font-bold text-foreground">Semantic Components</h2>

          <div className="space-y-8">
            <div>
              <h3 className="text-xl font-semibold mb-4 text-foreground">Buttons</h3>
              <div className="flex flex-wrap gap-4">
                <RFDS.SemanticButton variant="primary">Primary</RFDS.SemanticButton>
                <RFDS.SemanticButton variant="secondary">Secondary</RFDS.SemanticButton>
                <RFDS.SemanticButton variant="destructive">Destructive</RFDS.SemanticButton>
                <RFDS.SemanticButton variant="ghost">Ghost</RFDS.SemanticButton>
                <RFDS.SemanticButton variant="link">Link</RFDS.SemanticButton>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-4 text-foreground">Badges</h3>
              <div className="flex flex-wrap gap-4">
                <RFDS.SemanticBadge variant="default">Default</RFDS.SemanticBadge>
                <RFDS.SemanticBadge variant="success">Success</RFDS.SemanticBadge>
                <RFDS.SemanticBadge variant="warning">Warning</RFDS.SemanticBadge>
                <RFDS.SemanticBadge variant="destructive">Destructive</RFDS.SemanticBadge>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-4 text-foreground">Cards</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl">
                <RFDS.SemanticCard>
                  <h4 className="font-semibold mb-2">Default Card</h4>
                  <p className="text-sm text-muted-foreground">Card with semantic theming</p>
                </RFDS.SemanticCard>
                <RFDS.SemanticCard variant="elevated">
                  <h4 className="font-semibold mb-2">Elevated Card</h4>
                  <p className="text-sm text-muted-foreground">With shadow for depth</p>
                </RFDS.SemanticCard>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-4 text-foreground">Alerts</h3>
              <div className="space-y-4 max-w-2xl">
                <RFDS.SemanticAlert variant="default">Default alert message</RFDS.SemanticAlert>
                <RFDS.SemanticAlert variant="success">Success message</RFDS.SemanticAlert>
                <RFDS.SemanticAlert variant="warning">Warning message</RFDS.SemanticAlert>
                <RFDS.SemanticAlert variant="destructive">Error message</RFDS.SemanticAlert>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-4 text-foreground">Inputs</h3>
              <div className="max-w-md space-y-4">
                <RFDS.SemanticInput placeholder="Enter text..." />
                <RFDS.SemanticInput label="With Label" placeholder="Your name" />
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-4 text-foreground">Avatars</h3>
              <div className="flex gap-4 items-center">
                <RFDS.SemanticAvatar>
                  <span>JD</span>
                </RFDS.SemanticAvatar>
                <RFDS.SemanticAvatar size="lg">
                  <span>AB</span>
                </RFDS.SemanticAvatar>
                <RFDS.SemanticAvatar size="sm">
                  <span>XY</span>
                </RFDS.SemanticAvatar>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-4 text-foreground">Separator</h3>
              <div className="max-w-md">
                <p className="text-muted-foreground">Content above</p>
                <RFDS.SemanticSeparator />
                <p className="text-muted-foreground">Content below</p>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-4 text-foreground">Contributor Icons</h3>
              <div className="flex gap-4 items-center">
                <div className="group">
                  <RFDS.ContributorIcon variant="code">
                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </RFDS.ContributorIcon>
                </div>
                <div className="group">
                  <RFDS.ContributorIcon variant="donate">
                    💰
                  </RFDS.ContributorIcon>
                </div>
                <div className="group">
                  <RFDS.ContributorIcon variant="sponsor">
                    ⭐
                  </RFDS.ContributorIcon>
                </div>
                <div className="group">
                  <RFDS.ContributorIcon variant="member">
                    👥
                  </RFDS.ContributorIcon>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Timeline */}
        <section className="space-y-6">
          <h2 className="text-3xl font-bold text-foreground">Timeline Components</h2>
          <div className="max-w-2xl">
            <RFDS.Timeline>
              <RFDS.TimelineItem
                title="Phase 1"
                description="Initial setup and planning"
                variant="completed"
              />
              <RFDS.TimelineItem
                title="Phase 2"
                description="Development in progress"
                variant="current"
              />
              <RFDS.TimelineItem
                title="Phase 3"
                description="Testing and deployment"
                variant="upcoming"
              />
            </RFDS.Timeline>
          </div>
        </section>

        {/* Navigation */}
        <section className="space-y-6">
          <h2 className="text-3xl font-bold text-foreground">Navigation</h2>
          <div className="max-w-md border border-border rounded-lg p-4">
            <RFDS.TableOfContents
              sections={[
                { id: 'section-1', title: 'Introduction', level: 1 },
                { id: 'section-2', title: 'Getting Started', level: 2 },
                { id: 'section-3', title: 'Configuration', level: 2 },
                { id: 'section-4', title: 'Advanced Usage', level: 1 },
              ]}
              title="Table of Contents"
            />
          </div>
        </section>

      </div>
    </div>
  ),
};
