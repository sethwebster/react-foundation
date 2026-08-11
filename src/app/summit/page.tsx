import type { Metadata } from "next";
import {
  Clock3,
  MapPin,
} from "lucide-react";

import { RFDS } from "@/components/rfds";
import {
  faqItems,
  summitDays,
  summitGoals,
} from "./summit-data";
import { LondonMap } from "./london-map";
import { SummitCalendarMenu } from "./summit-calendar-menu";
import { SummitFaq } from "./summit-faq";
import { SummitHero } from "./summit-hero";
import styles from "./summit.module.css";
import "./leaflet.css";

export const metadata: Metadata = {
  title: "React Foundation Contributors Summit 2026",
  description:
    "Participant guide for the first React Foundation Contributors Summit, taking place in London from 10–12 November 2026.",
  openGraph: {
    title: "React Foundation Contributors Summit 2026",
    description: "Three days in London to align, collaborate, and shape what comes next for React.",
    type: "website",
  },
};

function SectionHeading({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="max-w-3xl">
      <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-5xl">
        {title}
      </h2>
      <p className="mt-5 text-base leading-7 text-muted-foreground sm:text-lg">
        {description}
      </p>
    </div>
  );
}

export default function SummitPage() {
  return (
    <main className={`${styles.microsite} min-h-screen overflow-hidden bg-background text-foreground`}>
      <SummitHero />

      <section id="why" className="scroll-mt-36 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
          <RFDS.ScrollReveal animation="fade-up">
            <SectionHeading
              title="A Foundation becomes real when its people meet."
              description="This is our first chance to meet in person, connect across groups, and decide what comes next."
            />
          </RFDS.ScrollReveal>

          <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {summitGoals.map((goal, index) => {
              const Icon = goal.icon;
              return (
                <RFDS.ScrollReveal key={goal.title} animation="fade-up" delay={index * 90}>
                  <RFDS.SemanticCard variant="outlined" hover className="group h-full overflow-hidden p-6">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary transition-transform group-hover:-translate-y-1">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <p className="mt-7 font-mono text-xs text-muted-foreground">0{index + 1}</p>
                    <h3 className="mt-2 text-lg font-semibold text-foreground">{goal.title}</h3>
                    <p className="mt-3 text-sm leading-6 text-muted-foreground">{goal.description}</p>
                  </RFDS.SemanticCard>
                </RFDS.ScrollReveal>
              );
            })}
          </div>
        </div>
      </section>

      <section id="programme" className="scroll-mt-36 border-y border-border/60 bg-muted/35 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
          <RFDS.ScrollReveal animation="fade-up">
            <SectionHeading
              title="Programme"
              description="Travel days bookend three days together in London: one plenary day followed by two days dedicated to working groups."
            />
          </RFDS.ScrollReveal>

          <div className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            {summitDays.map((summitDay, index) => (
              <RFDS.ScrollReveal key={summitDay.day} animation="fade-up" delay={index * 80}>
                <RFDS.SemanticCard
                  variant="outlined"
                  className={`h-full p-6 ${summitDay.isTravel ? "border-dashed border-border/70 bg-transparent" : "bg-card"}`}
                >
                  <p className={`font-mono text-xs font-semibold uppercase tracking-[0.18em] ${summitDay.isTravel ? "text-muted-foreground" : "text-primary"}`}>
                    {summitDay.day}
                  </p>
                  <p className={`mt-7 font-semibold tracking-[-0.06em] ${summitDay.isTravel ? "text-3xl text-muted-foreground" : "text-5xl text-foreground"}`}>
                    {summitDay.dateNumber}
                  </p>
                  <p className="mt-1 text-sm font-medium text-muted-foreground">{summitDay.date}</p>
                  <h3 className={`mt-8 font-semibold ${summitDay.isTravel ? "text-base text-muted-foreground" : "text-xl text-foreground"}`}>
                    {summitDay.label}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">{summitDay.focus}</p>
                  {summitDay.audience ? (
                    <p className="mt-6 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      {summitDay.audience}
                    </p>
                  ) : null}
                </RFDS.SemanticCard>
              </RFDS.ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <section id="joining" className="scroll-mt-36 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
          <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-start lg:gap-20">
            <RFDS.ScrollReveal animation="slide-right">
              <SectionHeading
                title="An invite-only working summit."
                description="Attendance is invite only for members of the React Foundation working groups."
              />
              <RFDS.SemanticBadge variant="outline" className="mt-7 border-primary/30">
                Invite only
              </RFDS.SemanticBadge>
            </RFDS.ScrollReveal>

            <RFDS.ScrollReveal animation="slide-left" delay={100}>
              <RFDS.SemanticCard variant="outlined" className="p-7 sm:p-9">
                <h3 className="text-2xl font-semibold text-foreground">
                  Interested in taking part?
                </h3>
                <p className="mt-4 text-base leading-7 text-muted-foreground">
                  Folks can self-nominate using the form below.
                </p>
                <RFDS.ButtonLink
                  href="https://example.com"
                  target="_blank"
                  rel="noreferrer"
                  variant="tertiary"
                  className="mt-7 border-primary/30 bg-primary/5 hover:bg-primary/10"
                >
                  Self-nomination form
                </RFDS.ButtonLink>
              </RFDS.SemanticCard>
            </RFDS.ScrollReveal>
          </div>
        </div>
      </section>

      <section id="plan" className="scroll-mt-36 border-y border-border/60 bg-muted/35 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
          <RFDS.ScrollReveal animation="fade-up">
            <SectionHeading
              title="Logistics"
              description="London and the dates are set. Venue, travel, accommodation, and catering details are still being coordinated and will be published here as they are confirmed."
            />
          </RFDS.ScrollReveal>

          <div className="mt-14 grid gap-5 lg:grid-cols-3">
            <RFDS.SemanticCard variant="outlined" className="p-7 lg:col-span-2">
              <div className="flex items-center justify-between gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <MapPin className="h-6 w-6" aria-hidden="true" />
                </div>
                <RFDS.SemanticBadge variant="warning">Venue to be confirmed</RFDS.SemanticBadge>
              </div>
              <div className="mt-7 grid gap-8 md:grid-cols-[minmax(0,1fr)_18rem] md:items-start">
                <div>
                  <h3 className="text-2xl font-semibold text-foreground">London, United Kingdom</h3>
                  <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
                    London offers direct international connections and a strong local React community. The final venue is being coordinated; capacity, accessibility, and breakout space are part of that decision.
                  </p>
                </div>
                <LondonMap />
              </div>
            </RFDS.SemanticCard>

            <RFDS.SemanticCard variant="outlined" className="p-7">
              <Clock3 className="h-6 w-6 text-primary" aria-hidden="true" />
              <h3 className="mt-6 text-xl font-semibold text-foreground">Before you book</h3>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                Plan to arrive on Monday 9 November and depart on Friday 13 November. Wait for the logistics update before booking non-refundable travel or accommodation.
              </p>
              <SummitCalendarMenu variant="secondary" size="sm" className="mt-6" />
            </RFDS.SemanticCard>
          </div>

        </div>
      </section>

      <section id="faq" className="scroll-mt-36 py-24 sm:py-32">
        <div className="mx-auto grid max-w-7xl gap-14 px-6 sm:px-8 lg:grid-cols-[0.75fr_1.25fr] lg:px-12">
          <div className="lg:sticky lg:top-40 lg:self-start">
            <RFDS.ScrollReveal animation="fade-up">
              <SectionHeading
                title="The details, in one place."
                description="This is the source of truth for summit participants. Confirmed information is stated plainly; open logistics are marked as such."
              />
              <p className="mt-6 text-xs text-muted-foreground">Last updated 22 July 2026</p>
            </RFDS.ScrollReveal>
          </div>

          <SummitFaq items={faqItems} />
        </div>
      </section>

      <section className="border-t border-border/60 bg-muted/35 py-24">
        <RFDS.ScrollReveal animation="scale" className="mx-auto max-w-4xl px-6 text-center sm:px-8">
          <h2 className="text-4xl font-semibold tracking-tight text-foreground sm:text-6xl">Let’s shape what comes next.</h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
            Bring your context and expertise to help build the future of React.
          </p>
          <RFDS.ButtonLink href="#programme" size="lg" className="mt-9">Review the programme</RFDS.ButtonLink>
        </RFDS.ScrollReveal>
      </section>

      <RFDS.Footer />
    </main>
  );
}
