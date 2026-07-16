import type { Metadata } from "next";

import {
  PageIntro,
  PublicPageShell,
  Section,
  Surface,
} from "@/components/public-site/layout";
import { ButtonLink } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Ecosystem Support Assessment",
  description:
    "Principles for assessing React ecosystem support without presenting provisional scores as fact.",
};

const principles = [
  {
    title: "Use multiple signals",
    body: "Project reach, maintenance load, security, contributor health, and ecosystem role each reveal different needs.",
  },
  {
    title: "Keep human review",
    body: "Metrics can structure a review, but they cannot replace context from maintainers and affected communities.",
  },
  {
    title: "Publish the basis",
    body: "When decisions are public, explain the inputs, reporting period, limitations, and any material judgment.",
  },
  {
    title: "Revisit decisions",
    body: "Ecosystem needs change. Assessment should be periodic and able to correct stale or misleading signals.",
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
            description="A useful process combines evidence, maintainer context, and transparent judgment. A single decorative score cannot carry that responsibility."
          />
        </Section>

        <Section className="pt-12 sm:pt-16" measure="standard">
          <Surface className="p-7 sm:p-10">
            <p className="text-sm font-semibold text-primary">Method status</p>
            <h2 className="mt-3 text-2xl font-semibold text-foreground">
              Principles before rankings
            </h2>
            <p className="mt-4 max-w-3xl text-sm leading-6 text-muted-foreground">
              Any future scoring model will be published with its data sources,
              weighting, limitations, and review process before results are shown
              as an allocation or ranking.
            </p>
          </Surface>
        </Section>

        <Section className="py-20 sm:py-24" measure="standard">
          <div className="grid gap-px overflow-hidden rounded-panel border border-border bg-border sm:grid-cols-2">
            {principles.map((principle) => (
              <article key={principle.title} className="bg-background p-7 sm:p-9">
                <h2 className="text-xl font-semibold text-foreground">
                  {principle.title}
                </h2>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  {principle.body}
                </p>
              </article>
            ))}
          </div>
        </Section>

        <Section className="pb-8 text-center" measure="standard">
          <ButtonLink href="/libraries" variant="secondary">
            View ecosystem support
          </ButtonLink>
        </Section>
      </main>
    </PublicPageShell>
  );
}
