import type { Metadata } from "next";

import {
  PageIntro,
  PublicPageShell,
  Section,
  Surface,
} from "@/components/public-site/layout";
import { ButtonLink } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Impact and Accountability",
  description:
    "How the React Foundation plans to report funded work and ecosystem outcomes.",
};

const reportingAreas = [
  {
    title: "Funding",
    body: "Amounts committed and paid, the programs they support, and the reporting period they belong to.",
  },
  {
    title: "Recipients",
    body: "Projects or initiatives receiving support, subject to appropriate privacy and contractual limits.",
  },
  {
    title: "Outcomes",
    body: "Concrete work completed, lessons learned, and follow-up actions rather than ungrounded reach estimates.",
  },
];

export default function ImpactPage() {
  return (
    <PublicPageShell>
      <main>
        <Section className="pt-16 sm:pt-24">
          <PageIntro
            eyebrow="Public accountability"
            title="Impact and accountability"
            description="Impact reporting should describe real funded work, not sample dashboards or projected totals."
          />
        </Section>

        <Section className="pt-12 sm:pt-16" measure="standard">
          <Surface className="p-7 sm:p-10">
            <p className="text-sm font-semibold text-primary">Reporting status</p>
            <h2 className="mt-3 text-2xl font-semibold text-foreground">
              Reporting begins with funded work
            </h2>
            <p className="mt-4 max-w-3xl text-sm leading-6 text-muted-foreground">
              The foundation will publish impact reports after programs have
              approved funding and reportable outcomes. Until then, this page
              documents what readers should expect from that reporting.
            </p>
          </Surface>
        </Section>

        <Section className="py-20 sm:py-24" measure="standard">
          <div className="grid gap-10 md:grid-cols-[0.75fr_1.25fr]">
            <div>
              <p className="text-sm font-semibold text-primary">What we will publish</p>
              <h2 className="mt-4 text-3xl font-semibold leading-tight text-foreground">
                A record that can be checked.
              </h2>
            </div>
            <div className="divide-y divide-border border-y border-border">
              {reportingAreas.map((area) => (
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
          <ButtonLink href="/about" variant="secondary">
            Learn about the foundation
          </ButtonLink>
        </Section>
      </main>
    </PublicPageShell>
  );
}
