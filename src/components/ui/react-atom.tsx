import type { SVGProps } from "react";

type ReactAtomProps = SVGProps<SVGSVGElement> & {
  /** Stroke width in viewBox units (24-unit box). Lower values read thinner. */
  strokeWidth?: number;
};

/**
 * The React atom mark, drawn as a monochrome outline that inherits `currentColor`.
 * Keeping it as an inline SVG (rather than the filled brand asset) lets it adapt to
 * light/dark themes and sit quietly in the neutral, Expo-aligned layout.
 */
export function ReactAtom({ strokeWidth = 1, ...props }: ReactAtomProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      <circle cx="12" cy="12" r="1.75" fill="currentColor" stroke="none" />
      <g strokeWidth={strokeWidth}>
        <ellipse cx="12" cy="12" rx="11" ry="4.2" />
        <ellipse cx="12" cy="12" rx="11" ry="4.2" transform="rotate(60 12 12)" />
        <ellipse cx="12" cy="12" rx="11" ry="4.2" transform="rotate(120 12 12)" />
      </g>
    </svg>
  );
}
