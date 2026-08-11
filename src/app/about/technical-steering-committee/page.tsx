import type { Metadata } from "next";

import {
  PageIntro,
  PublicPageShell,
  Section,
  Surface,
} from "@/components/public-site/layout";
import { ButtonLink } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Technical Steering Committee",
  description:
    "Learn about the purpose and formation of the React Foundation Technical Steering Committee.",
};

const responsibilities = [
  {
    title: "Technical perspective",
    body: "Bring ecosystem-wide technical context to foundation programs and support decisions.",
  },
  {
    title: "Maintainer consultation",
    body: "Create a practical path for maintainers and technical communities to surface shared needs.",
  },
  {
    title: "Open recommendations",
    body: "Document recommendations and avoid presenting one company's roadmap as ecosystem consensus.",
  },
];

export default function TechnicalSteeringCommitteePage() {
  return (
    <PublicPageShell>
      <main>
        <Section className="pt-16 sm:pt-24">
          <PageIntro
            eyebrow="Technical governance"
            title="Technical Steering Committee"
            description="The committee will connect foundation programs with the technical needs of React and its wider ecosystem."
          />
        </Section>

        <Section className="pt-12 sm:pt-16" measure="standard">
          <Surface className="grid gap-8 p-7 sm:p-10 md:grid-cols-[0.7fr_1.3fr]">
            <div>
              <p className="text-sm font-semibold text-primary">Current status</p>
              <h2 className="mt-3 text-2xl font-semibold text-foreground">
                Committee formation is in progress
              </h2>
            </div>
            <div className="space-y-4 text-sm leading-6 text-muted-foreground">
              <p>
                Membership, terms, and decision-making practices will be published
                after they are confirmed. The site does not use fictional profiles
                to fill open committee roles.
              </p>
              <p>
                Future updates will identify confirmed participants and explain how
                maintainers can bring work to the committee.
              </p>
            </div>
          </Surface>
        </Section>

        <Section className="py-20 sm:py-24" measure="standard">
          <div className="grid gap-10 md:grid-cols-[0.75fr_1.25fr]">
            <div>
              <p className="text-sm font-semibold text-primary">Committee remit</p>
              <h2 className="mt-4 text-3xl font-semibold leading-tight text-foreground">
                Technical guidance without invented authority.
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
