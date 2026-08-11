import Link from "next/link";

import { ButtonLink } from "@/components/ui/button";
import { Eyebrow, Section } from "@/components/public-site/layout";

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
    <Section className="border-t border-border py-20 sm:py-28" measure="standard">
      <Eyebrow className="mb-5">Our mission</Eyebrow>
      <h2 className="max-w-[42rem] text-[clamp(2rem,4.6vw,2.9rem)] font-semibold leading-[1.08] tracking-[-0.03em] text-foreground">
        We exist to ensure the React ecosystem thrives.
      </h2>
      <div className="mt-9 grid gap-8 text-base leading-7 text-muted-foreground sm:grid-cols-2 sm:gap-12">
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
      <Eyebrow className="mb-8">What we stand for</Eyebrow>
      <div className="grid gap-10 md:grid-cols-3 md:gap-8">
        {pillars.map((pillar, index) => (
          <article key={pillar.title} className="border-t border-border pt-5">
            <p className="foundation-eyebrow text-primary">
              {String(index + 1).padStart(2, "0")}
            </p>
            <h3 className="mt-5 text-xl font-semibold tracking-[-0.01em] text-foreground">
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
    <Section className="pb-16 sm:pb-24" measure="standard">
      <div className="overflow-hidden rounded-panel bg-foreground px-7 py-11 text-background shadow-soft sm:flex sm:items-center sm:justify-between sm:px-12 sm:py-14">
        <div className="max-w-[34rem]">
          <p className="foundation-eyebrow text-primary">Get involved</p>
          <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-[-0.02em] !text-background sm:text-[2.4rem]">
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
            className="inline-flex min-h-11 items-center px-3 text-sm font-semibold text-background transition hover:text-primary"
          >
            Learn more <span className="ml-2" aria-hidden>→</span>
          </Link>
        </div>
      </div>
    </Section>
  );
}
