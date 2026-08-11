import type { Metadata } from "next";

import {
  PageIntro,
  PublicPageShell,
  Section,
  Surface,
} from "@/components/public-site/layout";
import { ButtonLink } from "@/components/ui/button";
import { ecosystemLibraries, tierWeights } from "@/lib/maintainer-tiers";

export const metadata: Metadata = {
  title: "Ecosystem Support Assessment",
  description:
    "How contribution activity and support methodology are assessed for the React ecosystem.",
};

const methods = [
  {
    title: "Contribution score",
    body: `PRs × ${tierWeights.pullRequests} + Issues × ${tierWeights.issues} + Commits × ${tierWeights.commits}. This formula recognizes public GitHub activity while acknowledging that reviews, triage, discussions, and maintainer context require additional judgment.`,
  },
  {
    title: "Library impact",
    body: "Funding review can consider ecosystem footprint, maintenance load, security posture, documentation, community benefit, and the role a project plays across React workflows.",
  },
  {
    title: "Funding distribution",
    body: "When an approved pool exists, distribution can be proportional to contribution scores and impact metrics after eligibility review. Public pages should identify the reporting period, inputs, limits, and any material human judgment.",
  },
  {
    title: "Human review",
    body: "Metrics structure the process but do not replace maintainer feedback, community input, or governance review.",
  },
];

export default function ScoringPage() {
  return (
    <PublicPageShell>
      <main>
        <Section className="pt-16 sm:pt-24">
          <PageIntro
            eyebrow="Assessment methodology"
            title="How ecosystem support is assessed"
            description={`The current public model tracks contribution activity across ${ecosystemLibraries.length} repositories and pairs metrics with review before support decisions are published.`}
            actions={
              <>
                <ButtonLink href="/libraries" variant="secondary">
                  View tracked libraries
                </ButtonLink>
                <ButtonLink href="/impact" variant="ghost">
                  View impact methodology
                </ButtonLink>
              </>
            }
          />
        </Section>

        <Section className="pt-12 sm:pt-16" measure="standard">
          <Surface className="grid gap-8 p-7 sm:p-10 md:grid-cols-[0.8fr_1.2fr]">
            <div>
              <p className="text-sm font-semibold text-primary">Method status</p>
              <h2 className="mt-3 text-2xl font-semibold text-foreground">
                Published inputs before rankings
              </h2>
            </div>
            <p className="text-sm leading-6 text-muted-foreground">
              Scores and allocations should not appear as public rankings until
              their data sources, time window, eligibility policy, and review limits
              are documented for the relevant reporting period.
            </p>
          </Surface>
        </Section>

        <Section className="py-20 sm:py-24" measure="standard">
          <div className="grid gap-10 md:grid-cols-[0.75fr_1.25fr]">
            <div>
              <p className="text-sm font-semibold text-primary">Scoring model</p>
              <h2 className="mt-4 text-3xl font-semibold leading-tight text-foreground">
                Evidence is useful only when its limits are visible.
              </h2>
            </div>
            <div className="divide-y divide-border border-y border-border">
              {methods.map((method, index) => (
                <article key={method.title} className="grid gap-4 py-6 sm:grid-cols-[4rem_1fr]">
                  <p className="text-xs font-semibold text-primary">
                    0{index + 1}
                  </p>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">
                      {method.title}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      {method.body}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </Section>
      </main>
    </PublicPageShell>
  );
}
