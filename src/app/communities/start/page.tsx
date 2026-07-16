import type { Metadata } from "next";

import {
  PageIntro,
  PublicPageShell,
  Section,
} from "@/components/public-site/layout";
import { ButtonLink } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Start a React Community",
  description: "A practical starting point for local React organizers.",
};

const steps = [
  {
    title: "Define the audience",
    body: "Choose who the first event is for and what they should be able to learn, share, or do together.",
  },
  {
    title: "Find one co-organizer",
    body: "Share logistics, communication, and code-of-conduct responsibility from the beginning.",
  },
  {
    title: "Plan a small first event",
    body: "A focused meetup or study session is easier to run, evaluate, and repeat than a large launch.",
  },
  {
    title: "Set participation expectations",
    body: "Publish a code of conduct, an accessible venue or online format, and a clear way to contact organizers.",
  },
  {
    title: "Listen and iterate",
    body: "Ask attendees what was useful, what was missing, and whether another event would serve the local community.",
  },
];

export default function StartCommunityPage() {
  return (
    <PublicPageShell>
      <main>
        <Section className="pt-16 sm:pt-24">
          <PageIntro
            eyebrow="Organizer guide"
            title="Start a React community"
            description="Begin with a useful first event, a small organizing team, and clear expectations for a safe and welcoming space."
            actions={
              <>
                <ButtonLink href="/communities/add">
                  Submit a community
                </ButtonLink>
                <ButtonLink href="/communities" variant="secondary">
                  Browse communities
                </ButtonLink>
              </>
            }
          />
        </Section>

        <Section className="py-20 sm:py-24" measure="standard">
          <ol className="divide-y divide-border border-y border-border">
            {steps.map((step, index) => (
              <li
                key={step.title}
                className="grid gap-4 py-7 sm:grid-cols-[3rem_minmax(0,1fr)]"
              >
                <span className="text-sm font-semibold text-primary">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div>
                  <h2 className="text-xl font-semibold text-foreground">
                    {step.title}
                  </h2>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                    {step.body}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </Section>
      </main>
    </PublicPageShell>
  );
}
