// Text-heavy component — deliberately part of the solo calibration set, since
// typography and font problems hide from button-only previews.
// Composition follows src/components/rfds/timeline.md.
import { Timeline, TimelineItem } from 'storefront';

export const Roadmap = () => (
  <Timeline>
    <TimelineItem
      variant="completed"
      date="Q1 2026"
      title="Foundation established"
      subtitle="Governance and charter ratified"
      description="The React Foundation was formed under the Linux Foundation umbrella, with founding members committing multi-year support for the ecosystem."
      items={['Charter ratified', 'Founding members announced', 'Technical steering committee seated']}
    />
    <TimelineItem
      variant="current"
      date="Q2 2026"
      title="Impact scoring goes live"
      subtitle="React Impact Score enters public beta"
      description="Library maintainers can see how ecosystem footprint, contribution quality, and maintainer health combine into a single transparent score."
      items={['Scoring methodology published', 'First 54 libraries indexed']}
    />
    <TimelineItem
      variant="upcoming"
      date="Q3 2026"
      title="Direct maintainer funding"
      description="Sponsorship flows routed to maintainers based on published impact scores rather than popularity alone."
      isLast
    />
  </Timeline>
);

export const Variants = () => (
  <Timeline>
    <TimelineItem variant="completed" title="Completed" description="Work that has shipped." />
    <TimelineItem variant="current" title="Current" description="Actively in progress right now." />
    <TimelineItem variant="upcoming" title="Upcoming" description="Planned, not yet started." />
    <TimelineItem variant="default" title="Default" description="No explicit state." isLast />
  </Timeline>
);
