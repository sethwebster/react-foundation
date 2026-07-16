import Link from "next/link";

import { ButtonLink } from "@/components/ui/button";
import { Section } from "@/components/public-site/layout";

const pillars = [
  {
    title: "Independent stewardship",
    body: "Keep React open, neutral, and shaped by the needs of the global community.",
  },
  {
    title: "Sustainable support",
    body: "Invest in the maintainers, educators, and organizers who move the ecosystem forward.",
  },
  {
    title: "A connected community",
    body: "Create more ways for people to learn, contribute, gather, and build together.",
  },
];

export function HomeMission() {
  return (
    <Section className="border-t border-border py-20 sm:py-28">
      <p className="text-sm font-semibold text-primary">Our mission</p>
      <h2 className="mt-5 max-w-[39rem] text-[clamp(2rem,5vw,3.15rem)] font-semibold leading-[1.08] text-foreground">
        We exist to ensure the React ecosystem thrives.
      </h2>
      <div className="mt-9 grid gap-7 text-base leading-7 text-muted-foreground sm:grid-cols-2">
        <p>
          We support React through independent stewardship, sustainable funding, and
          transparent governance—so the technology can remain open and accessible to
          everyone.
        </p>
        <p>
          Our work supports the people behind the technology—from core maintainers to
          local organizers—so that the next generation can keep experimenting, teaching,
          and creating.
        </p>
      </div>
    </Section>
  );
}

export function HomePillars() {
  return (
    <Section className="pb-20 sm:pb-28" measure="standard">
      <div className="grid gap-10 md:grid-cols-3 md:gap-8">
        {pillars.map((pillar, index) => (
          <article key={pillar.title} className="border-t border-border pt-5">
            <p className="text-xs font-semibold text-primary">0{index + 1}</p>
            <h3 className="mt-5 text-xl font-semibold text-foreground">
              {pillar.title}
            </h3>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              {pillar.body}
            </p>
          </article>
        ))}
      </div>
    </Section>
  );
}

export function HomeCommunityCTA() {
  return (
    <Section className="pb-10 sm:pb-16" measure="standard">
      <div className="rounded-panel bg-foreground px-7 py-10 text-background sm:flex sm:items-center sm:justify-between sm:px-10 sm:py-12">
        <div className="max-w-[31rem]">
          <p className="text-sm font-semibold text-primary dark:text-primary">
            Build the next chapter with us
          </p>
          <h2 className="mt-4 text-3xl font-semibold leading-tight !text-background sm:text-4xl">
            A stronger React ecosystem starts with participation.
          </h2>
          <p className="mt-4 text-sm leading-6 text-background/70">
            Join a community, become a member, or contribute your time and expertise.
          </p>
        </div>
        <div className="mt-8 flex shrink-0 flex-wrap gap-3 sm:mt-0 sm:pl-8">
          <ButtonLink href="/communities" variant="secondary">
            Find a community
          </ButtonLink>
          <Link
            href="/about"
            className="inline-flex min-h-11 items-center px-3 text-sm font-semibold text-background hover:text-primary"
          >
            Learn more <span className="ml-2" aria-hidden>→</span>
          </Link>
        </div>
      </div>
    </Section>
  );
}
