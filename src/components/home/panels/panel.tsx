import Link from "next/link";
import type { ReactNode } from "react";

import { cn } from "@/lib/cn";
import type { PanelTone } from "./types";

/*
 * Panel surfaces keep constant colors in both themes; only the page gutter is
 * theme-aware. Tone-specific row/eyebrow colors flow down as CSS variables so
 * the row primitives stay tone-agnostic, mirroring the prototype's CSS.
 */
const TONE_CLASSES: Record<PanelTone, string> = {
	cyan: cn(
		"bg-[#58C4DC]",
		"[--panel-rule:rgba(22,24,29,0.2)]",
		"[--panel-hover:rgba(255,255,255,0.25)]",
		"[--panel-eyebrow:rgba(22,24,29,0.65)]",
		"[--panel-sub:rgba(22,24,29,0.7)]",
	),
	paper: cn(
		"bg-[#F6F7F9]",
		"[--panel-rule:#16181D]",
		"[--panel-hover:#FFFFFF]",
		"[--panel-eyebrow:#5E687E]",
		"[--panel-sub:#5E687E]",
	),
};

const FOCUS_RING = cn(
	"focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid focus-visible:outline-[#16181D]",
);

export function Panel({
	tone,
	id,
	labelledBy,
	compact = false,
	className,
	children,
}: {
	tone: PanelTone;
	id?: string;
	labelledBy: string;
	compact?: boolean;
	className?: string;
	children: ReactNode;
}) {
	return (
		<section
			id={id}
			aria-labelledby={labelledBy}
			className={cn(
				"relative mx-auto w-full max-w-[1200px] overflow-hidden rounded-[28px] text-[#16181D]",
				compact ? "p-[22px] md:p-10" : "p-[22px] md:p-12",
				id !== undefined && "scroll-mt-24",
				TONE_CLASSES[tone],
				className,
			)}
		>
			{children}
		</section>
	);
}

export function PanelEyebrow({
	id,
	as: Tag = "h2",
	children,
}: {
	id?: string;
	as?: "h2" | "p";
	children: ReactNode;
}) {
	return (
		<Tag id={id} className="text-[13px] font-medium tracking-[0.01em] text-[color:var(--panel-eyebrow)]">
			{children}
		</Tag>
	);
}

export function PanelSub({ children }: { children: ReactNode }) {
	return <p className="mt-2 max-w-[44rem] text-[15px] text-[color:var(--panel-sub)]">{children}</p>;
}

export function PanelActions({ children }: { children: ReactNode }) {
	return <div className="mt-6 flex flex-wrap items-center gap-3 md:mt-8 md:gap-4">{children}</div>;
}

export function PanelButton({
	href,
	variant,
	children,
}: {
	href: string;
	variant: "ink" | "outline";
	children: ReactNode;
}) {
	return (
		<Link
			href={href}
			className={cn(
				"panels-anim inline-flex items-center justify-center rounded-xl border px-6 py-3.5 text-[15px] font-semibold leading-[1.2]",
				FOCUS_RING,
				variant === "ink"
					? // The `!` is load-bearing: globals.css has unlayered `a.inline-flex { color: currentColor }`
						// which otherwise beats layered text utilities and makes the label inherit ink-on-ink.
						"border-[#16181D] bg-[#16181D] text-[#F6F7F9]! hover:border-[#07090D] hover:bg-[#07090D]"
					: "border-[#16181D] bg-transparent text-[#16181D] hover:bg-[rgba(22,24,29,0.08)]",
			)}
		>
			{children}
		</Link>
	);
}

export function PanelPlainLink({ href, children }: { href: string; children: ReactNode }) {
	return (
		<Link href={href} className={cn("px-1 py-3.5 text-[15px] font-semibold text-[#16181D]", FOCUS_RING)}>
			{children} <span aria-hidden="true">→</span>
		</Link>
	);
}

export function RowList({ className, children }: { className?: string; children: ReactNode }) {
	return <div className={cn("divide-y divide-[color:var(--panel-rule)]", className)}>{children}</div>;
}

export function Row({
	href,
	external = false,
	bare = false,
	className,
	children,
}: {
	href: string;
	external?: boolean;
	/** Two-column row without the icon column (founding member rows). */
	bare?: boolean;
	className?: string;
	children: ReactNode;
}) {
	const rowClassName = cn(
		// Inset content from the row edges, with a matching negative margin so
		// resting text keeps the panel's alignment and only the hover surface grows.
		"group panels-anim -mx-4 grid items-center gap-x-5 px-4 text-[#16181D] hover:bg-[var(--panel-hover)]",
		FOCUS_RING,
		bare
			? "grid-cols-[minmax(0,1fr)_auto]"
			: "grid-cols-[24px_1fr] gap-y-2 md:grid-cols-[24px_minmax(0,1fr)_auto] md:gap-y-0",
		className,
	);

	if (href.startsWith("http")) {
		return (
			<a
				href={href}
				className={rowClassName}
				{...(external ? { target: "_blank", rel: "noopener noreferrer" } : undefined)}
			>
				{children}
			</a>
		);
	}

	return (
		<Link href={href} className={rowClassName}>
			{children}
		</Link>
	);
}

export function RowRight({
	bare = false,
	className,
	children,
}: {
	bare?: boolean;
	className?: string;
	children: ReactNode;
}) {
	return (
		<span
			className={cn(
				"inline-flex items-center gap-2.5 text-[15px] font-semibold",
				bare
					? "justify-self-end whitespace-nowrap"
					: "col-start-2 justify-self-start whitespace-normal text-left md:col-auto md:justify-self-end md:whitespace-nowrap",
				className,
			)}
		>
			{children}
		</span>
	);
}

export function RowArrow() {
	return (
		<span aria-hidden="true" className="panels-anim-arrow text-base font-normal group-hover:translate-x-0.5">
			→
		</span>
	);
}

const ORBIT_SCALES = [12.7, 20.9, 29.1, 37.2];
const ORBIT_ROTATIONS = [0, 60, 120];

/*
 * Concentric React-orbit line art. vector-effect="non-scaling-stroke" keeps
 * every ring at a true 1px stroke no matter how far the group is scaled up.
 */
export function OrbitMarks({ className }: { className?: string }) {
	return (
		<svg
			aria-hidden="true"
			viewBox="-410 -410 820 820"
			fill="none"
			stroke="currentColor"
			strokeWidth={1}
			className={cn("pointer-events-none absolute z-0 text-[#16181D] opacity-[0.12]", className)}
		>
			{ORBIT_SCALES.map((scale) => (
				<g key={scale} transform={`scale(${scale})`}>
					{ORBIT_ROTATIONS.map((rotation) => (
						<ellipse
							key={rotation}
							rx={11}
							ry={4.2}
							transform={`rotate(${rotation})`}
							vectorEffect="non-scaling-stroke"
						/>
					))}
				</g>
			))}
		</svg>
	);
}
