/* eslint-disable react/no-unescaped-entities */
import type { Metadata } from "next";

import { Panel } from "@/components/panels/panel";
import { PanelsFooter } from "@/components/panels/panels-footer";

export const metadata: Metadata = {
	title: "Privacy Policy",
	description: "Privacy Policy for React Foundation",
};

export default function PrivacyPage() {
	return (
		<div className="flex min-h-screen flex-col gap-2.5 bg-[#EBECF0] px-4 pb-4 pt-24 sm:px-6 sm:pb-6 md:gap-4 dark:bg-[#16181D]">
			<Panel tone="paper" labelledBy="privacy-title">
				<h1
					id="privacy-title"
					className="text-[clamp(28px,3vw,40px)] font-semibold text-[#16181D]"
				>
					Privacy Policy
				</h1>
				<p className="mt-2 text-[15px] leading-[1.7] text-[#5E687E]">
					Last updated: October 21, 2025
				</p>

				<section className="mt-8">
					<h2 className="text-[17px] font-semibold text-[#16181D]">1. Introduction</h2>
					<p className="mt-4 text-[15px] leading-[1.7] text-[#5E687E]">
						React Foundation ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our services.
					</p>
					<p className="mt-4 text-[15px] leading-[1.7] text-[#5E687E]">
						Please read this Privacy Policy carefully. If you do not agree with the terms of this Privacy Policy, please do not access the site.
					</p>
				</section>

				<section className="mt-8">
					<h2 className="text-[17px] font-semibold text-[#16181D]">2. Information We Collect</h2>

					<h3 className="mt-6 text-[15px] font-semibold text-[#16181D]">2.1 Personal Information</h3>
					<p className="mt-4 text-[15px] leading-[1.7] text-[#5E687E]">
						When you authenticate using GitHub or GitLab OAuth, we collect:
					</p>
					<ul className="mt-4 list-disc space-y-2 pl-6 text-[15px] leading-[1.7] text-[#5E687E]">
						<li>Your name</li>
						<li>Your email address</li>
						<li>Your GitHub or GitLab username</li>
						<li>Your public profile information from the respective platform</li>
					</ul>

					<h3 className="mt-6 text-[15px] font-semibold text-[#16181D]">2.2 Local Storage</h3>
					<p className="mt-4 text-[15px] leading-[1.7] text-[#5E687E]">
						We use browser local storage to save your contributor username preference for convenience. This data is stored only on your device and is not transmitted to our servers.
					</p>

					<h3 className="mt-6 text-[15px] font-semibold text-[#16181D]">2.3 Session Data</h3>
					<p className="mt-4 text-[15px] leading-[1.7] text-[#5E687E]">
						We use session cookies to maintain your authenticated state. These are essential for the functionality of the authentication system.
					</p>
				</section>

				<section className="mt-8">
					<h2 className="text-[17px] font-semibold text-[#16181D]">3. How We Use Your Information</h2>
					<p className="mt-4 text-[15px] leading-[1.7] text-[#5E687E]">
						We use the information we collect in the following ways:
					</p>
					<ul className="mt-4 list-disc space-y-2 pl-6 text-[15px] leading-[1.7] text-[#5E687E]">
						<li>To provide, operate, and maintain our website</li>
						<li>To authenticate and authorize your access to features</li>
						<li>To display your contributor status and progress</li>
						<li>To personalize your experience on our website</li>
						<li>To communicate with you about updates and announcements</li>
					</ul>
				</section>

				<section className="mt-8">
					<h2 className="text-[17px] font-semibold text-[#16181D]">4. Data Sharing and Disclosure</h2>
					<p className="mt-4 text-[15px] leading-[1.7] text-[#5E687E]">
						<strong>We do not share, sell, rent, or trade your personal information with third parties for their commercial purposes.</strong>
					</p>
					<p className="mt-4 text-[15px] leading-[1.7] text-[#5E687E]">
						We may share information only in the following limited circumstances:
					</p>
					<ul className="mt-4 list-disc space-y-2 pl-6 text-[15px] leading-[1.7] text-[#5E687E]">
						<li><strong>Service Providers:</strong> We use third-party services (GitHub, GitLab for authentication; Shopify for e-commerce) that may have access to your information to perform tasks on our behalf.</li>
						<li><strong>Legal Requirements:</strong> We may disclose your information if required to do so by law or in response to valid requests by public authorities.</li>
					</ul>
				</section>

				<section className="mt-8">
					<h2 className="text-[17px] font-semibold text-[#16181D]">5. Third-Party Services</h2>

					<h3 className="mt-6 text-[15px] font-semibold text-[#16181D]">5.1 Authentication</h3>
					<p className="mt-4 text-[15px] leading-[1.7] text-[#5E687E]">
						We use GitHub and GitLab OAuth for authentication. When you authenticate, you are subject to their respective privacy policies:
					</p>
					<ul className="mt-4 list-disc space-y-2 pl-6 text-[15px] leading-[1.7] text-[#5E687E]">
						<li><a href="https://docs.github.com/en/site-policy/privacy-policies/github-privacy-statement" className="text-[#087EA4] underline" target="_blank" rel="noopener noreferrer">GitHub Privacy Statement</a></li>
						<li><a href="https://about.gitlab.com/privacy/" className="text-[#087EA4] underline" target="_blank" rel="noopener noreferrer">GitLab Privacy Policy</a></li>
					</ul>

					<h3 className="mt-6 text-[15px] font-semibold text-[#16181D]">5.2 E-commerce</h3>
					<p className="mt-4 text-[15px] leading-[1.7] text-[#5E687E]">
						Our online store is powered by Shopify. When you make a purchase, Shopify collects and processes your payment and shipping information. Please review <a href="https://www.shopify.com/legal/privacy" className="text-[#087EA4] underline" target="_blank" rel="noopener noreferrer">Shopify's Privacy Policy</a> for more information.
					</p>
				</section>

				<section className="mt-8">
					<h2 className="text-[17px] font-semibold text-[#16181D]">6. Tracking and Analytics</h2>
					<p className="mt-4 text-[15px] leading-[1.7] text-[#5E687E]">
						<strong>We do not use any tracking technologies, analytics tools, or third-party advertising services.</strong> We do not track your browsing behavior across websites or collect data for advertising purposes.
					</p>
				</section>

				<section className="mt-8">
					<h2 className="text-[17px] font-semibold text-[#16181D]">7. Data Security</h2>
					<p className="mt-4 text-[15px] leading-[1.7] text-[#5E687E]">
						We implement appropriate technical and organizational security measures to protect your personal information. However, please note that no method of transmission over the internet or method of electronic storage is 100% secure.
					</p>
					<p className="mt-4 text-[15px] leading-[1.7] text-[#5E687E]">
						Your authentication is handled by NextAuth.js, a secure authentication library, and we rely on GitHub and GitLab's OAuth implementations for secure authentication.
					</p>
				</section>

				<section className="mt-8">
					<h2 className="text-[17px] font-semibold text-[#16181D]">8. Data Retention</h2>
					<p className="mt-4 text-[15px] leading-[1.7] text-[#5E687E]">
						We retain your personal information only for as long as necessary to provide you with our services and as described in this Privacy Policy. Session data is retained only for the duration of your authenticated session.
					</p>
				</section>

				<section className="mt-8">
					<h2 className="text-[17px] font-semibold text-[#16181D]">9. Your Rights</h2>
					<p className="mt-4 text-[15px] leading-[1.7] text-[#5E687E]">
						You have the right to:
					</p>
					<ul className="mt-4 list-disc space-y-2 pl-6 text-[15px] leading-[1.7] text-[#5E687E]">
						<li>Access the personal information we hold about you</li>
						<li>Request correction of inaccurate information</li>
						<li>Request deletion of your personal information</li>
						<li>Revoke OAuth access through your GitHub or GitLab account settings</li>
						<li>Clear local storage data stored in your browser</li>
					</ul>
				</section>

				<section className="mt-8">
					<h2 className="text-[17px] font-semibold text-[#16181D]">10. Children's Privacy</h2>
					<p className="mt-4 text-[15px] leading-[1.7] text-[#5E687E]">
						Our Service does not address anyone under the age of 13. We do not knowingly collect personally identifiable information from children under 13. If you are a parent or guardian and you are aware that your child has provided us with personal information, please contact us.
					</p>
				</section>

				<section className="mt-8">
					<h2 className="text-[17px] font-semibold text-[#16181D]">11. Changes to This Privacy Policy</h2>
					<p className="mt-4 text-[15px] leading-[1.7] text-[#5E687E]">
						We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date at the top of this Privacy Policy.
					</p>
					<p className="mt-4 text-[15px] leading-[1.7] text-[#5E687E]">
						You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective when they are posted on this page.
					</p>
				</section>

				<section className="mt-8">
					<h2 className="text-[17px] font-semibold text-[#16181D]">12. Contact Us</h2>
					<p className="mt-4 text-[15px] leading-[1.7] text-[#5E687E]">
						If you have any questions about this Privacy Policy, please contact us through our GitHub repository or official communication channels.
					</p>
				</section>
			</Panel>

			<PanelsFooter />
		</div>
	);
}
