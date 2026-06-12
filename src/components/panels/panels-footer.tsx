import Link from "next/link";

import { cn } from "@/lib/cn";

// The `!` marks are load-bearing: globals.css has unlayered `a:not(.inline-flex) { color: inherit }`
// which otherwise beats layered text utilities on links.
const FOOTER_LINK_CLASS = cn(
	"text-[13px] text-[#087EA4]! dark:text-[#58C4DC]!",
	"focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid",
	"focus-visible:outline-[#087EA4] dark:focus-visible:outline-[#58C4DC]",
);

export function PanelsFooter() {
	return (
		// pt-8 plus the page's panel gap adds up to the prototype's 48px footer offset.
		<footer className="mx-auto w-full max-w-[1200px] px-1 pb-4 pt-8 text-[#5E687E] dark:text-[#99A1B3]">
			<svg
				viewBox="-11.5 -10.23174 23 20.46348"
				width={22}
				height={20}
				aria-hidden="true"
				className="block"
			>
				<circle cx="0" cy="0" r="2.05" fill="currentColor" />
				<g stroke="currentColor" strokeWidth={1} fill="none">
					<ellipse rx="11" ry="4.2" />
					<ellipse rx="11" ry="4.2" transform="rotate(60)" />
					<ellipse rx="11" ry="4.2" transform="rotate(120)" />
				</g>
			</svg>
			<p className="mt-4 max-w-[60rem] text-[13px] leading-[1.6]">
				Copyright © The Linux Foundation®. All rights reserved. The Linux Foundation has
				registered trademarks and uses trademarks. For more information, including terms
				of use, privacy policy, and trademark usage, please see our{" "}
				<a
					className="underline!"
					href="https://www.linuxfoundation.org/legal/policies?__hstc=262006610.e1a66f67cd0c0baa5c7b042e4f9911ce.1768952497248.1771462813100.1771610134177.3&__hssc=262006610.1.1771610134177&__hsfp=360811d5cbd407fc58d506f8b0aa3133"
				>
					Policies page
				</a>
				.
			</p>
			<nav aria-label="Legal" className="mt-3 flex gap-6">
				<Link className={FOOTER_LINK_CLASS} href="/privacy">
					Privacy
				</Link>
				<Link className={FOOTER_LINK_CLASS} href="/terms">
					Terms
				</Link>
			</nav>
		</footer>
	);
}
