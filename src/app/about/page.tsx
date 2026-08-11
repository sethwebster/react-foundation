import type { Metadata } from "next";
import Link from "next/link";

import { BecomeContributor } from "@/components/home/become-contributor";
import { ExecutiveMessage } from "@/components/home/executive-message";
import { FoundingMembers } from "@/components/home/founding-members";
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
  title: "About",
  description:
    "Learn about the React Foundation's mission, stewardship, and community.",
};

const commitments = [
  {
    title: "Independent stewardship",
    body: "Protect React as an open project with durable, neutral governance.",
  },
  {
    title: "Ecosystem investment",
    body: "Support maintainers, educators, organizers, and the work that benefits everyone.",
  },
  {
    title: "Global participation",
    body: "Make it easier for more people and communities to shape what comes next.",
  },
];

const governanceDetails = [
  {
    title: "Open financials",
    body: "Funding decisions and program reporting should be published for community review when reportable funding activity exists.",
  },
  {
    title: "Community input",
    body: "Major decisions should be informed by maintainer feedback and the needs of the people building with React.",
  },
  {
    title: "Quarterly reports",
    body: "The foundation intends to publish periodic reports once funded work and distributions create public records.",
  },
  {
    title: "Open source values",
    body: "The foundation is grounded in transparency, durable stewardship, and participation across companies and communities.",
  },
];

export default function AboutPage() {
  return (
    <PublicPageShell>
      <main>
        <Section className="pt-16 sm:pt-24">
          <PageIntro
            eyebrow="Who we are"
            title="About The React Foundation"
            description="We're building a sustainable future for the React ecosystem through community funding, transparent governance, and unwavering support for the maintainers who make it all possible."
          />
        </Section>

        <Section className="pt-10 sm:pt-14">
          <ExecutiveMessage />
        </Section>

        <Section className="py-20 sm:py-28" measure="standard">
          <div className="grid gap-12 md:grid-cols-[0.8fr_1.2fr] md:gap-20">
            <div>
              <Eyebrow className="mb-4">What we are here to do</Eyebrow>
              <h2 className="text-3xl font-semibold leading-tight tracking-[-0.02em] text-foreground sm:text-4xl">
                Keep React open, supported, and ready for what comes next.
              </h2>
            </div>
            <div className="divide-y divide-border border-y border-border">
              {commitments.map((commitment) => (
                <article key={commitment.title} className="py-6">
                  <h3 className="text-lg font-semibold text-foreground">
                    {commitment.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {commitment.body}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </Section>

        <Section className="border-t border-border py-20 sm:py-24" measure="standard">
          <FoundingMembers />
        </Section>

        <Section className="pb-20 sm:pb-24" measure="standard">
          <Surface className="grid gap-8 p-7 sm:p-10 md:grid-cols-[0.8fr_1.2fr]">
            <div>
              <Eyebrow className="mb-3">Supported ecosystem</Eyebrow>
              <h2 className="text-2xl font-semibold tracking-[-0.02em] text-foreground">
                {ecosystemLibraries.length} tracked repositories across React.
              </h2>
            </div>
            <div>
              <p className="text-sm leading-6 text-muted-foreground">
                The foundation tracks React infrastructure, libraries, frameworks,
                testing tools, UI systems, and styling projects to make contribution
                recognition and support methodology easier to inspect.
              </p>
              <ButtonLink href="/libraries" variant="secondary" className="mt-5">
                Explore supported libraries
              </ButtonLink>
            </div>
          </Surface>
        </Section>

        <Section className="pb-20 sm:pb-24" measure="standard">
          <div className="grid gap-10 md:grid-cols-[0.8fr_1.2fr] md:gap-16">
            <div>
              <Eyebrow className="mb-4">Governance</Eyebrow>
              <h2 className="text-3xl font-semibold leading-tight tracking-[-0.02em] text-foreground sm:text-4xl">
                Transparent governance
              </h2>
              <p className="mt-4 text-sm leading-6 text-muted-foreground">
                Governance work combines formal leadership, technical direction, and
                public accountability without claiming reports that have not yet
                been published.
              </p>
            </div>
            <div className="divide-y divide-border border-y border-border">
              {governanceDetails.map((detail) => (
                <article key={detail.title} className="py-6">
                  <h3 className="text-lg font-semibold text-foreground">
                    {detail.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {detail.body}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </Section>

        <Section className="pb-20 sm:pb-24" measure="standard">
          <div className="grid gap-px overflow-hidden rounded-panel border border-border bg-border sm:grid-cols-2">
            <GovernanceLink
              href="/about/board-of-directors"
              title="Board of Directors"
              body="Strategic leadership, fiduciary oversight, and long-term stewardship."
            />
            <GovernanceLink
              href="/about/technical-steering-committee"
              title="Technical Steering Committee"
              body="Technical direction grounded in the needs of React and its ecosystem."
            />
          </div>
        </Section>

        <Section className="pb-8 sm:pb-14" measure="standard">
          <BecomeContributor />
        </Section>
      </main>
    </PublicPageShell>
  );
}

function GovernanceLink({
  href,
  title,
  body,
}: {
  href: string;
  title: string;
  body: string;
}) {
  return (
    <Link
      href={href}
      className="group block bg-background p-7 hover:bg-muted sm:p-9"
    >
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-xl font-semibold text-foreground">{title}</h2>
        <span className="text-muted-foreground transition group-hover:translate-x-1 group-hover:text-primary">
          →
        </span>
      </div>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">{body}</p>
    </Link>
  );
}
