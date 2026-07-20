import type { Metadata } from "next";

import { EcosystemLibraries } from "@/components/home/ecosystem-libraries";
import {
  PageIntro,
  PublicPageShell,
  Section,
  Surface,
} from "@/components/public-site/layout";
import { ButtonLink } from "@/components/ui/button";
import { ecosystemLibraries } from "@/lib/maintainer-tiers";

export const metadata: Metadata = {
  title: "Ecosystem Support",
  description:
    "Tracked React ecosystem repositories, library categories, and contribution pathways.",
};

const supportNotes = [
  {
    title: "Library categories",
    body: "The tracked ecosystem is grouped by the role each project plays: core React, state, data, routing, frameworks, forms, testing, UI, animation, tooling, tables, and styling.",
  },
  {
    title: "Contribution tracking",
    body: "Public GitHub activity is used to recognize pull requests, issues, and commits across the tracked repositories.",
  },
  {
    title: "Funding-distribution explanation",
    body: "When funding is available for a reporting period, methodology and eligibility rules determine how support is allocated. Public pages do not show allocation totals until there are approved results to publish.",
  },
];

export default function LibrariesPage() {
  return (
    <PublicPageShell>
      <main>
        <Section className="pt-16 sm:pt-24">
          <PageIntro
            eyebrow="Libraries and tooling"
            title="Ecosystem support"
            description={`The public tracking surface currently includes ${ecosystemLibraries.length} tracked repositories across the React ecosystem.`}
            actions={
              <>
                <ButtonLink href="/scoring" variant="secondary">
                  Read scoring methodology
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
              <p className="text-sm font-semibold text-primary">
                {ecosystemLibraries.length} tracked repositories
              </p>
              <h2 className="mt-3 text-2xl font-semibold text-foreground">
                A curated ecosystem list, not a leaderboard
              </h2>
            </div>
            <p className="text-sm leading-6 text-muted-foreground">
              This page restores the public list of supported React ecosystem
              projects. Repository inclusion supports contribution recognition and
              methodology review; it is not itself a funding announcement.
            </p>
          </Surface>
        </Section>

        <Section className="py-20 sm:py-24" measure="standard">
          <div className="grid gap-10 md:grid-cols-[0.75fr_1.25fr]">
            <div>
              <p className="text-sm font-semibold text-primary">How to read this list</p>
              <h2 className="mt-4 text-3xl font-semibold leading-tight text-foreground">
                The list explains scope before scores.
              </h2>
            </div>
            <div className="divide-y divide-border border-y border-border">
              {supportNotes.map((note) => (
                <article key={note.title} className="py-6">
                  <h3 className="text-lg font-semibold text-foreground">
                    {note.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {note.body}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </Section>

        <Section className="pb-20 sm:pb-24" measure="standard">
          <EcosystemLibraries
            description={`Browse the ${ecosystemLibraries.length} tracked repositories used for contribution tracking and ecosystem support review.`}
            showMissingLibraryIssue
          />
        </Section>
      </main>
    </PublicPageShell>
  );
}
