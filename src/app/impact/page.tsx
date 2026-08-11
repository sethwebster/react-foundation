import type { Metadata } from "next";

import { EcosystemLibraries } from "@/components/home/ecosystem-libraries";
import {
  Eyebrow,
  PageIntro,
  PublicPageShell,
  Section,
  Surface,
} from "@/components/public-site/layout";
import { ButtonLink } from "@/components/ui/button";
import { ecosystemLibraries } from "@/lib/maintainer-tiers";

export const metadata: Metadata = {
  title: "Impact and Accountability",
  description:
    "How the React Foundation tracks contribution activity, assesses ecosystem support, and reports funded work.",
};

const methodology = [
  {
    title: "Contribution tracking",
    body: `The foundation tracks repository activity across ${ecosystemLibraries.length} supported React ecosystem repositories. GitHub activity is used for pull requests, issues, and commits where the API exposes reliable public signals.`,
  },
  {
    title: "Score calculation",
    body: "The current contribution formula is PRs × 8 + Issues × 3 + Commits × 1. The scoring page explains the limits of this model and where maintainer review remains necessary.",
  },
  {
    title: "Distribution methodology",
    body: "When funding is approved for a reporting period, available funds can be allocated against contribution scores, library impact, eligibility review, and published program constraints.",
  },
];

const reportingAreas = [
  "Revenue and approved funding sources",
  "Maintainer and project support",
  "Education initiatives",
  "Accessibility and global participation work",
  "Impact metrics and known limitations",
  "Community feedback and follow-up actions",
];

export default function ImpactPage() {
  return (
    <PublicPageShell>
      <main>
        <Section className="pt-16 sm:pt-24">
          <PageIntro
            eyebrow="Public accountability"
            title="Impact and accountability"
            description="The React Foundation publishes how support is measured, how decisions are reviewed, and what will be reported once funded work is underway."
            actions={
              <>
                <ButtonLink href="/libraries" variant="secondary">
                  Browse tracked libraries
                </ButtonLink>
                <ButtonLink href="/scoring" variant="ghost">
                  Read scoring methodology
                </ButtonLink>
              </>
            }
          />
        </Section>

        <Section className="pt-12 sm:pt-16" measure="standard">
          <Surface className="grid gap-8 p-7 sm:p-10 md:grid-cols-[0.8fr_1.2fr]">
            <div>
              <Eyebrow className="mb-3">Reporting status</Eyebrow>
              <h2 className="text-2xl font-semibold tracking-[-0.02em] text-foreground">
                First public report coming after funded work
              </h2>
            </div>
            <p className="text-sm leading-6 text-muted-foreground">
              The foundation has not published quarterly distribution reports yet.
              Until funded programs produce reportable outcomes, this page separates
              existing methodology from future reports and avoids sample allocation
              totals.
            </p>
          </Surface>
        </Section>

        <Section className="py-20 sm:py-28" measure="standard">
          <div className="grid gap-10 md:grid-cols-[0.8fr_1.2fr] md:gap-16">
            <div>
              <Eyebrow className="mb-4">Existing methodology</Eyebrow>
              <h2 className="text-3xl font-semibold leading-tight tracking-[-0.02em] text-foreground sm:text-4xl">
                Measurement starts with transparent inputs.
              </h2>
            </div>
            <div className="divide-y divide-border border-y border-border">
              {methodology.map((item, index) => (
                <article key={item.title} className="grid gap-4 py-7 sm:grid-cols-[4rem_1fr]">
                  <p className="foundation-eyebrow pt-1 text-primary">
                    {String(index + 1).padStart(2, "0")}
                  </p>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      {item.body}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </Section>

        <Section className="pb-20 sm:pb-24" measure="standard">
          <div className="grid gap-10 md:grid-cols-[0.8fr_1.2fr] md:gap-16">
            <div>
              <Eyebrow className="mb-4">Intended report categories</Eyebrow>
              <h2 className="text-3xl font-semibold leading-tight tracking-[-0.02em] text-foreground sm:text-4xl">
                Reports should be checkable records, not projections.
              </h2>
            </div>
            <ul className="divide-y divide-border border-y border-border">
              {reportingAreas.map((area) => (
                <li
                  key={area}
                  className="flex items-center gap-3 py-5 text-sm font-medium text-foreground"
                >
                  <span
                    className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary"
                    aria-hidden
                  />
                  {area}
                </li>
              ))}
            </ul>
          </div>
        </Section>

        <Section className="pb-20 sm:pb-24" measure="standard">
          <EcosystemLibraries
            description={`These ${ecosystemLibraries.length} tracked repositories define the current public ecosystem surface for contribution tracking. The list includes libraries, tooling, documentation, and React infrastructure repositories.`}
            showMissingLibraryIssue
          />
        </Section>
      </main>
    </PublicPageShell>
  );
}
