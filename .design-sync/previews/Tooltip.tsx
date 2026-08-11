// Tooltip has NO `open` prop — its visibility lives in internal state driven by
// onMouseEnter/onFocus, so a static capture of the plain component shows only
// the trigger. `Hovered` dispatches a genuine `mouseover` on the trigger after
// mount, so React's own onMouseEnter runs and the tooltip renders through its
// real code path (nothing about the component is stubbed or re-implemented).
// Interactive viewers still get ordinary hover behaviour.
import { useEffect, useRef, type ReactNode } from 'react';
import { Tooltip, Button, SemanticBadge } from 'storefront';

function Hovered({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const trigger = ref.current?.firstElementChild as HTMLElement | null;
    trigger?.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
  }, []);
  return (
    <span ref={ref} style={{ display: 'contents' }}>
      {children}
    </span>
  );
}

const InfoIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-4 w-4">
    <circle cx="12" cy="12" r="9" />
    <path strokeLinecap="round" d="M12 11v5M12 8h.01" />
  </svg>
);

export const OnIconButton = () => (
  <div className="flex items-center justify-center py-12">
    <Hovered>
      {/* The bubble is absolutely positioned inside the trigger, so without a
          width class it shrink-wraps to the trigger's width and wraps every
          word. `w-max` (or a fixed w-*) belongs on any single-line tooltip. */}
      <Tooltip className="w-max" content="How the React Impact Score is calculated">
        <Button variant="ghost" size="sm" aria-label="About the React Impact Score">
          <InfoIcon />
        </Button>
      </Tooltip>
    </Hovered>
  </div>
);

export const Sides = () => (
  <div className="grid grid-cols-2 gap-12 px-10 py-12">
    {(['top', 'bottom', 'left', 'right'] as const).map((side) => (
      <div key={side} className="flex items-center justify-center">
        <Hovered>
          <Tooltip className="w-max" side={side} content={`Ecosystem footprint · ${side}`}>
            <Button variant="secondary" size="sm">
              {side}
            </Button>
          </Tooltip>
        </Hovered>
      </div>
    ))}
  </div>
);

export const RichContent = () => (
  <div className="flex items-center justify-center px-10 py-12">
    <Hovered>
      <Tooltip
        side="bottom"
        className="w-64"
        content={
          <span className="flex flex-col gap-1 text-left">
            <span className="font-medium">Maintainer health · 84</span>
            <span className="text-muted-foreground">
              Bus factor 4 · median review turnaround 19h · 6 active maintainers
            </span>
          </span>
        }
      >
        <SemanticBadge variant="success">RIS 92</SemanticBadge>
      </Tooltip>
    </Hovered>
  </div>
);
