import type { Metadata } from "next";

import {
  PageIntro,
  PublicPageShell,
  Section,
  Surface,
} from "@/components/public-site/layout";
import { ButtonLink } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Board of Directors",
  description:
    "Learn about the responsibilities and formation of the React Foundation Board of Directors.",
};

const responsibilities = [
  {
    title: "Steward the mission",
    body: "Keep the foundation focused on durable, independent support for React and its ecosystem.",
  },
  {
    title: "Provide oversight",
    body: "Review strategy, finances, risk, and the foundation's obligations as a public-interest organization.",
  },
  {
    title: "Protect accountability",
    body: "Set expectations for transparent decisions, reporting, and responsible use of foundation resources.",
  },
];

export default function BoardOfDirectorsPage() {
  return (
    <PublicPageShell>
      <main>
        <Section className="pt-16 sm:pt-24">
          <PageIntro
            eyebrow="Governance"
            title="Board of Directors"
            description="The board provides strategic and fiduciary oversight for the React Foundation."
          />
        </Section>

        <Section className="pt-12 sm:pt-16" measure="standard">
          <Surface className="grid gap-8 p-7 sm:p-10 md:grid-cols-[0.7fr_1.3fr]">
            <div>
              <p className="text-sm font-semibold text-primary">Current status</p>
              <h2 className="mt-3 text-2xl font-semibold text-foreground">
                Appointments are in progress
              </h2>
            </div>
            <div className="space-y-4 text-sm leading-6 text-muted-foreground">
              <p>
                Named directors will be published only after appointments are
                complete. Placeholder profiles are intentionally not presented as
                members of the board.
              </p>
              <p>
                This page will be updated with confirmed directors, terms, and
                governance documents as they become public.
              </p>
            </div>
          </Surface>
        </Section>

        <Section className="py-20 sm:py-24" measure="standard">
          <div className="grid gap-10 md:grid-cols-[0.75fr_1.25fr]">
            <div>
              <p className="text-sm font-semibold text-primary">Board remit</p>
              <h2 className="mt-4 text-3xl font-semibold leading-tight text-foreground">
                Oversight with a clear public purpose.
              </h2>
            </div>
            <div className="divide-y divide-border border-y border-border">
              {responsibilities.map((item) => (
                <article key={item.title} className="py-6">
                  <h3 className="text-lg font-semibold text-foreground">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {item.body}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </Section>

        <Section className="pb-8 text-center" measure="standard">
          <ButtonLink href="/about" variant="secondary">
            Back to about
          </ButtonLink>
        </Section>
      </main>
    </PublicPageShell>
  );
}
