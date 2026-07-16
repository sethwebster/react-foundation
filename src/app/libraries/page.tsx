import type { Metadata } from "next";

import {
  PageIntro,
  PublicPageShell,
  Section,
  Surface,
} from "@/components/public-site/layout";
import { ButtonLink } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Ecosystem Support",
  description:
    "The React Foundation's approach to supporting libraries and shared ecosystem infrastructure.",
};

const supportAreas = [
  {
    title: "Maintenance capacity",
    body: "Support for work that keeps widely used projects healthy, secure, documented, and responsive.",
  },
  {
    title: "Shared infrastructure",
    body: "Investment in tooling and services that benefit multiple projects or reduce repeated maintenance burden.",
  },
  {
    title: "Ecosystem resilience",
    body: "Attention to project health, contributor continuity, and risks that simple popularity rankings miss.",
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
            description="Foundation support will be based on documented needs and review, not a public leaderboard filled with sample allocations."
          />
        </Section>

        <Section className="pt-12 sm:pt-16" measure="standard">
          <Surface className="p-7 sm:p-10">
            <p className="text-sm font-semibold text-primary">Program status</p>
            <h2 className="mt-3 text-2xl font-semibold text-foreground">
              Public reporting is being prepared
            </h2>
            <p className="mt-4 max-w-3xl text-sm leading-6 text-muted-foreground">
              Library rankings and allocation totals will appear only when they are
              backed by an approved program and published source data. Operational
              setup instructions belong in internal documentation, not on this page.
            </p>
          </Surface>
        </Section>

        <Section className="py-20 sm:py-24" measure="standard">
          <div className="grid gap-10 md:grid-cols-[0.75fr_1.25fr]">
            <div>
              <p className="text-sm font-semibold text-primary">Support lens</p>
              <h2 className="mt-4 text-3xl font-semibold leading-tight text-foreground">
                Look beyond download counts.
              </h2>
            </div>
            <div className="divide-y divide-border border-y border-border">
              {supportAreas.map((area) => (
                <article key={area.title} className="py-6">
                  <h3 className="text-lg font-semibold text-foreground">
                    {area.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {area.body}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </Section>

        <Section className="pb-8 text-center" measure="standard">
          <ButtonLink href="/scoring" variant="secondary">
            Read the assessment principles
          </ButtonLink>
        </Section>
      </main>
    </PublicPageShell>
  );
}
