import type { ReactNode } from "react";

import { PanelsFooter } from "@/components/panels/panels-footer";

export default function UpdatesLayout({
	children,
}: {
	children: ReactNode;
}) {
	return (
		<div className="flex min-h-screen flex-col gap-2.5 bg-[#EBECF0] px-4 pb-4 pt-24 sm:px-6 sm:pb-6 md:gap-4 dark:bg-[#16181D]">
			{children}
			<PanelsFooter />
		</div>
	);
}
