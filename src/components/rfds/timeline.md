# RFDS Timeline Component

A gorgeous, pixel-perfect vertical timeline component for roadmaps, milestones, and progress tracking.

## Features

- 🎨 **Pixel-perfect alignment** - Vertical line perfectly centered with dots
- ✨ **Beautiful variants** - Completed, current, upcoming, and default states
- 🎯 **Icon support** - Add emojis or custom icons to milestones
- 📱 **Fully responsive** - Works beautifully on all screen sizes
- 🌗 **Dark mode ready** - Automatic theme support
- 🎭 **Smooth animations** - Hover effects and pulse animations
- 🔧 **Highly extensible** - Multiple component types for different use cases

## Components

### Timeline (Container)

The main container for timeline items.

```tsx
import { RFDS } from '@/components/rfds';

<RFDS.Timeline>
  {/* Timeline items go here */}
</RFDS.Timeline>
```

### TimelineItem (Full-featured)

Rich timeline item with dates, descriptions, and task lists.

```tsx
<RFDS.TimelineItem
  date="Month 1"
  title="Foundation"
  subtitle="Laying the groundwork"
  description="Establish your community's core identity and begin building your team."
  variant="completed"
  icon="🎯"
  items={[
    'Define your community vision',
    'Recruit co-organizers',
    'Research venues'
  ]}
/>
```

**Props:**
- `title` (required): Main heading
- `subtitle`: Optional subheading
- `date`: Badge text (e.g., "Month 1", "Q1 2024")
- `description`: Paragraph description
- `items`: Array of bullet points
- `variant`: `'completed' | 'current' | 'upcoming' | 'default'`
- `icon`: Emoji or React node
- `children`: Custom content
- `className`: Additional CSS classes

### TimelineStep (Compact)

Simpler timeline item for basic use cases.

```tsx
<RFDS.TimelineStep
  title="Setup complete"
  description="All dependencies installed"
  variant="completed"
  icon="✓"
/>
```

**Props:**
- `title` (required): Main text
- `description`: Optional description
- `variant`: `'completed' | 'current' | 'upcoming' | 'default'`
- `icon`: Emoji or React node
- `className`: Additional CSS classes

### TimelineProgress (Automated)

Auto-calculates progress and shows completion status.

```tsx
<RFDS.TimelineProgress
  steps={[
    { title: 'Setup', completed: true },
    { title: 'Development', completed: true },
    { title: 'Testing', completed: false },
    { title: 'Deploy', completed: false }
  ]}
/>
```

## Variants

### Completed ✅
- Green color scheme
- Success indicators
- Perfect for done tasks

### Current 🔵
- Primary color with pulse animation
- Highlighted state
- Shows active progress

### Upcoming ⭕
- Muted gray colors
- Future milestones
- Not yet started

### Default 🔵
- Standard primary color
- General timeline items

## Examples

### Project Roadmap

```tsx
<RFDS.Timeline>
  <RFDS.TimelineItem
    date="Q1 2024"
    title="Launch MVP"
    variant="completed"
    icon="🚀"
    items={[
      'Core features implemented',
      'Beta testing completed',
      'Production deployment'
    ]}
  />
  <RFDS.TimelineItem
    date="Q2 2024"
    title="Growth Phase"
    variant="current"
    icon="📈"
    items={[
      'User acquisition campaigns',
      'Feature expansion',
      'Performance optimization'
    ]}
  />
  <RFDS.TimelineItem
    date="Q3 2024"
    title="Scale"
    variant="upcoming"
    icon="🌍"
    items={[
      'International expansion',
      'Enterprise features',
      'Advanced analytics'
    ]}
  />
</RFDS.Timeline>
```

### Learning Path

```tsx
<RFDS.Timeline>
  <RFDS.TimelineStep
    title="React Fundamentals"
    description="Components, props, and state"
    variant="completed"
    icon="✓"
  />
  <RFDS.TimelineStep
    title="Hooks & Context"
    description="Modern React patterns"
    variant="current"
    icon="📚"
  />
  <RFDS.TimelineStep
    title="Advanced Patterns"
    description="Performance and architecture"
    variant="upcoming"
  />
</RFDS.Timeline>
```

### Progress Tracker

```tsx
<RFDS.TimelineProgress
  steps={[
    { title: 'Account created', completed: true },
    { title: 'Email verified', completed: true },
    { title: 'Profile completed', completed: true },
    { title: 'First contribution', completed: false },
    { title: 'Community joined', completed: false }
  ]}
/>
```

## Styling

The Timeline component uses semantic colors from your theme:
- `primary` - Main timeline color
- `success` - Completed items
- `muted-foreground` - Upcoming items
- `border` - Card borders
- `foreground` / `muted-foreground` - Text colors

All components support dark mode automatically via your theme provider.

## Accessibility

- Semantic HTML structure
- Proper heading hierarchy
- Color contrast compliant
- Keyboard navigation support (via card hover states)

## Performance

- Client-side only (uses 'use client')
- Minimal re-renders
- Smooth CSS transitions
- Optimized for long lists

## Best Practices

1. **Use appropriate variants** - Match the visual state to actual progress
2. **Keep items concise** - 3-7 bullet points per item works best
3. **Add icons** - Visual markers improve scannability
4. **Consistent dates** - Use the same date format throughout
5. **Progress tracking** - Use TimelineProgress for completion-based flows

## Integration

Works seamlessly with:
- MDX pages
- React Server Components
- Client Components
- All RFDS semantic components
