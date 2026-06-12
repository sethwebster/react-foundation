import type { LucideIcon } from "lucide-react";

export type PanelTone = "cyan" | "paper";

export type Cta = {
	label: string;
	href: string;
	external?: boolean;
};

export type MetricRow = {
	icon: LucideIcon;
	label: string;
	value: string;
	href: string;
};

export type ContentRow = {
	icon: LucideIcon;
	title: string;
	description: string;
	cta: Cta;
};

export type MemberName = string;
