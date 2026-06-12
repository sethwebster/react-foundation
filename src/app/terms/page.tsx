/* eslint-disable react/no-unescaped-entities */
import type { Metadata } from "next";

import { Panel } from "@/components/panels/panel";
import { PanelsFooter } from "@/components/panels/panels-footer";

export const metadata: Metadata = {
	title: "Terms of Service",
	description: "Terms of Service for React Foundation",
};

export default function TermsPage() {
	return (
		<div className="flex min-h-screen flex-col gap-2.5 bg-[#EBECF0] px-4 pb-4 pt-24 sm:px-6 sm:pb-6 md:gap-4 dark:bg-[#16181D]">
			<Panel tone="paper" labelledBy="terms-title">
				<h1
					id="terms-title"
					className="text-[clamp(28px,3vw,40px)] font-semibold text-[#16181D]"
				>
					Terms of Service
				</h1>
				<p className="mt-2 text-[15px] leading-[1.7] text-[#5E687E]">
					Last updated: October 21, 2025
				</p>

				<section className="mt-8">
					<h2 className="text-[17px] font-semibold text-[#16181D]">1. Acceptance of Terms</h2>
					<p className="mt-4 text-[15px] leading-[1.7] text-[#5E687E]">
						By accessing and using the React Foundation website (the "Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to these Terms of Service, please do not use the Service.
					</p>
				</section>

				<section className="mt-8">
					<h2 className="text-[17px] font-semibold text-[#16181D]">2. Description of Service</h2>
					<p className="mt-4 text-[15px] leading-[1.7] text-[#5E687E]">
						React Foundation provides a platform to support the React ecosystem through community funding, transparent governance, and official merchandise. The Service includes:
					</p>
					<ul className="mt-4 list-disc space-y-2 pl-6 text-[15px] leading-[1.7] text-[#5E687E]">
						<li>Information about React Foundation and its mission</li>
						<li>An online store for official React Foundation merchandise</li>
						<li>User authentication via GitHub and GitLab</li>
						<li>Contributor progress tracking and status information</li>
						<li>Community updates and announcements</li>
					</ul>
				</section>

				<section className="mt-8">
					<h2 className="text-[17px] font-semibold text-[#16181D]">3. User Accounts</h2>
					<p className="mt-4 text-[15px] leading-[1.7] text-[#5E687E]">
						To access certain features of the Service, you may be required to authenticate using your GitHub or GitLab account. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.
					</p>
				</section>

				<section className="mt-8">
					<h2 className="text-[17px] font-semibold text-[#16181D]">4. Acceptable Use</h2>
					<p className="mt-4 text-[15px] leading-[1.7] text-[#5E687E]">
						You agree to use the Service only for lawful purposes and in a way that does not infringe the rights of, restrict, or inhibit anyone else's use and enjoyment of the Service. Prohibited behavior includes:
					</p>
					<ul className="mt-4 list-disc space-y-2 pl-6 text-[15px] leading-[1.7] text-[#5E687E]">
						<li>Harassing or causing distress or inconvenience to any other user</li>
						<li>Transmitting obscene or offensive content</li>
						<li>Disrupting the normal flow of dialogue within the Service</li>
						<li>Attempting to gain unauthorized access to the Service or its systems</li>
					</ul>
				</section>

				<section className="mt-8">
					<h2 className="text-[17px] font-semibold text-[#16181D]">5. Intellectual Property</h2>
					<p className="mt-4 text-[15px] leading-[1.7] text-[#5E687E]">
						The Service and its original content, features, and functionality are owned by React Foundation and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws. The React logo and other marks are trademarks of Meta Platforms, Inc., and are used with permission.
					</p>
				</section>

				<section className="mt-8">
					<h2 className="text-[17px] font-semibold text-[#16181D]">6. Purchases and Payment</h2>
					<p className="mt-4 text-[15px] leading-[1.7] text-[#5E687E]">
						If you wish to purchase any product or service made available through the Service, you may be asked to supply certain information relevant to your purchase. Payment processing is handled by third-party payment processors. We are not responsible for the security of payment information submitted to these third parties.
					</p>
				</section>

				<section className="mt-8">
					<h2 className="text-[17px] font-semibold text-[#16181D]">7. Limitation of Liability</h2>
					<p className="mt-4 text-[15px] leading-[1.7] text-[#5E687E]">
						In no event shall React Foundation, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.
					</p>
				</section>

				<section className="mt-8">
					<h2 className="text-[17px] font-semibold text-[#16181D]">8. Disclaimer</h2>
					<p className="mt-4 text-[15px] leading-[1.7] text-[#5E687E]">
						Your use of the Service is at your sole risk. The Service is provided on an "AS IS" and "AS AVAILABLE" basis. The Service is provided without warranties of any kind, whether express or implied, including, but not limited to, implied warranties of merchantability, fitness for a particular purpose, non-infringement, or course of performance.
					</p>
				</section>

				<section className="mt-8">
					<h2 className="text-[17px] font-semibold text-[#16181D]">9. Changes to Terms</h2>
					<p className="mt-4 text-[15px] leading-[1.7] text-[#5E687E]">
						We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.
					</p>
				</section>

				<section className="mt-8">
					<h2 className="text-[17px] font-semibold text-[#16181D]">10. Contact Information</h2>
					<p className="mt-4 text-[15px] leading-[1.7] text-[#5E687E]">
						If you have any questions about these Terms of Service, please contact us through our GitHub repository or official communication channels.
					</p>
				</section>
			</Panel>

			<PanelsFooter />
		</div>
	);
}
