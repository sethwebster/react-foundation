// SegmentedControl is a controlled toggle group: `options`, `value` and
// `onValueChange` are all required. The `compact` variant renders ONLY the
// option icon (labels are dropped), so the compact story must supply icons or
// the buttons come up empty — icons here are inline SVG so the preview carries
// no extra dependency.
import { useState } from 'react';
import { SegmentedControl } from 'storefront';

const GridIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-full w-full">
    <rect x="3" y="3" width="7" height="7" rx="1.5" />
    <rect x="14" y="3" width="7" height="7" rx="1.5" />
    <rect x="3" y="14" width="7" height="7" rx="1.5" />
    <rect x="14" y="14" width="7" height="7" rx="1.5" />
  </svg>
);

const ListIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-full w-full">
    <path strokeLinecap="round" d="M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01" />
  </svg>
);

const ChartIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-full w-full">
    <path strokeLinecap="round" d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
  </svg>
);

const VIEW_OPTIONS = [
  { value: 'grid', label: 'Grid', icon: <GridIcon />, title: 'Grid view' },
  { value: 'list', label: 'List', icon: <ListIcon />, title: 'List view' },
  { value: 'ranking', label: 'Ranking', icon: <ChartIcon />, title: 'RIS ranking' },
];

export const LibraryViews = () => {
  const [view, setView] = useState('grid');
  return (
    <div className="flex items-center justify-center py-6">
      <SegmentedControl options={VIEW_OPTIONS} value={view} onValueChange={setView} size="md" />
    </div>
  );
};

export const Sizes = () => {
  const [scope, setScope] = useState('core');
  const options = [
    { value: 'core', label: 'Core' },
    { value: 'ecosystem', label: 'Ecosystem' },
    { value: 'community', label: 'Community' },
  ];
  return (
    <div className="flex flex-col items-start gap-5 py-4">
      {(['sm', 'md', 'lg'] as const).map((size) => (
        <div key={size} className="flex flex-col gap-2">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {size}
          </span>
          <SegmentedControl
            options={options}
            value={scope}
            onValueChange={setScope}
            size={size}
          />
        </div>
      ))}
    </div>
  );
};

export const CompactIconsOnly = () => {
  const [view, setView] = useState('list');
  return (
    <div className="flex flex-col items-center gap-3 py-6">
      <SegmentedControl
        options={VIEW_OPTIONS}
        value={view}
        onValueChange={setView}
        size="md"
        variant="compact"
      />
      <span className="text-xs text-muted-foreground">
        Compact drops labels — each option needs an icon
      </span>
    </div>
  );
};
