import { Globe, Layers, ShieldCheck, Users } from "lucide-react";

import { Panel, PanelEyebrow, Row, RowArrow, RowList, RowRight } from "@/components/panels/panel";
import type { MetricRow } from "@/components/panels/types";

const METRICS: MetricRow[] = [
	{ icon: Layers, label: "Ecosystem libraries", value: "54+", href: "/libraries" },
	{ icon: Users, label: "Founding members", value: "8", href: "#members" },
	{ icon: Globe, label: "Developers served", value: "Millions", href: "/impact" },
	{ icon: ShieldCheck, label: "Transparent funding", value: "100%", href: "/impact" },
];

export function PanelMetrics() {
	return (
		<Panel tone="paper" compact labelledBy="metrics-title">
			<PanelEyebrow id="metrics-title">By the numbers</PanelEyebrow>
			<RowList className="mt-3">
				{METRICS.map((metric) => (
					<Row key={metric.label} href={metric.href} className="py-[18px]">
						<metric.icon size={24} strokeWidth={1.5} aria-hidden="true" />
						<span className="text-[17px] font-medium">{metric.label}</span>
						<RowRight>
							<span className="font-mono-panels text-[15px] font-medium">{metric.value}</span>
							<RowArrow />
						</RowRight>
					</Row>
				))}
			</RowList>
		</Panel>
	);
}
