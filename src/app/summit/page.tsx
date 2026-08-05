import type { Metadata } from "next";
import {
  Check,
  Clock3,
  Download,
  MapPin,
  Plus,
  Sparkles,
} from "lucide-react";

import { RFDS } from "@/components/rfds";
import {
  faqItems,
  participationPrinciples,
  summitDays,
  summitGoals,
  workingGroups,
  type AgendaItem,
} from "./summit-data";
import { SummitHero } from "./summit-hero";
import styles from "./summit.module.css";

export const metadata: Metadata = {
  title: "React Foundation Summit 2026",
  description:
    "Participant guide for the first React Foundation Summit, taking place in London from 10–12 November 2026.",
  openGraph: {
    title: "React Foundation Summit 2026",
    description: "Three days in London to align, collaborate, and shape what comes next for React.",
    type: "website",
  },
};

function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="max-w-3xl">
      <p className="mb-4 font-mono text-xs font-semibold uppercase tracking-[0.24em] text-primary">
        {eyebrow}
      </p>
      <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-5xl">
        {title}
      </h2>
      <p className="mt-5 text-base leading-7 text-muted-foreground sm:text-lg">
        {description}
      </p>
    </div>
  );
}

function Agenda({ items }: { items: readonly AgendaItem[] }) {
  return (
    <ol className="relative space-y-1">
      <span
        aria-hidden="true"
        className={`${styles.agendaLine} absolute bottom-7 left-[0.7rem] top-7 w-px`}
      />
      {items.map((item) => (
        <li key={`${item.time}-${item.title}`} className="relative grid gap-3 py-4 pl-10 sm:grid-cols-[8rem_1fr] sm:gap-6">
          <span className="absolute left-1.5 top-6 h-3 w-3 rounded-full border-2 border-primary bg-card shadow-[0_0_12px_hsl(var(--primary)/0.65)]" />
          <p className="font-mono text-xs font-medium uppercase tracking-wider text-primary">
            {item.time}
          </p>
          <div>
            <h4 className="font-semibold text-foreground">{item.title}</h4>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">{item.description}</p>
          </div>
        </li>
      ))}
    </ol>
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
              eyebrow="Why we’re gathering"
              title="A Foundation becomes real when its people meet."
              description="Since its inception, the React Foundation has worked entirely at a distance. This summit is our first chance to share a room, build the connective tissue between groups, and decide how we move forward together."
            />
          </RFDS.ScrollReveal>

          <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {summitGoals.map((goal, index) => {
              const Icon = goal.icon;
              return (
                <RFDS.ScrollReveal key={goal.title} animation="fade-up" delay={index * 90}>
                  <RFDS.SemanticCard variant="outlined" hover className="group h-full overflow-hidden p-6">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary shadow-[0_0_24px_hsl(var(--primary)/0.08)] transition-transform group-hover:-translate-y-1">
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
              eyebrow="Three-day programme"
              title="One summit. Three distinct modes."
              description="We start by creating shared context, move into working sessions, and close with the Foundation’s first in-person board meeting. Session times are proposed and will be finalized with the venue."
            />
          </RFDS.ScrollReveal>

          <div className="mt-14 space-y-6">
            {summitDays.map((summitDay, index) => (
              <RFDS.ScrollReveal key={summitDay.day} animation="fade-up" delay={index * 80}>
                <RFDS.SemanticCard variant="outlined" className="overflow-hidden">
                  <div className="grid lg:grid-cols-[20rem_1fr]">
                    <div className="relative overflow-hidden border-b border-border bg-card p-7 lg:border-b-0 lg:border-r lg:p-9">
                      <div aria-hidden="true" className="absolute -right-14 -top-14 h-44 w-44 rounded-full bg-primary/10 blur-3xl" />
                      <p className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-primary">{summitDay.day}</p>
                      <p className={`${styles.dateNumber} mt-7 text-6xl font-semibold tracking-[-0.06em]`}>{10 + index}</p>
                      <p className="mt-1 text-sm font-medium text-muted-foreground">{summitDay.date}</p>
                      <h3 className="mt-8 text-2xl font-semibold text-foreground">{summitDay.label}</h3>
                      <p className="mt-3 text-sm leading-6 text-muted-foreground">{summitDay.focus}</p>
                      <RFDS.SemanticBadge variant={index === 2 ? "outline" : "default"} className="mt-6">
                        {summitDay.audience}
                      </RFDS.SemanticBadge>
                    </div>
                    <div className="bg-card p-7 lg:p-9">
                      <Agenda items={summitDay.agenda} />
                    </div>
                  </div>
                </RFDS.SemanticCard>
              </RFDS.ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <section id="workshops" className="scroll-mt-36 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
          <div className="grid gap-16 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
            <RFDS.ScrollReveal animation="slide-right">
              <SectionHeading
                eyebrow="Wednesday workshops"
                title="The room is the working surface."
                description="Day 2 belongs to the working groups. Use it for the discussions and collaboration that are hardest to do across time zones and video calls."
              />
              <RFDS.SemanticAlert variant="default" title="Designed around overlaps" className="mt-8 border-primary/20 bg-primary/5">
                Some members contribute to multiple groups. The detailed schedule will account for known conflicts, and groups can combine or split sessions around shared topics.
              </RFDS.SemanticAlert>
            </RFDS.ScrollReveal>

            <RFDS.ScrollReveal animation="slide-left" delay={100}>
              <div className="grid gap-3 sm:grid-cols-2">
                {workingGroups.map((group) => (
                  <RFDS.SemanticCard key={group.name} variant="outlined" hover className="group flex items-start gap-4 p-5">
                    <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-primary shadow-[0_0_14px_hsl(var(--primary)/0.7)]" />
                    <div>
                      <h3 className="font-semibold text-foreground group-hover:text-primary">{group.name}</h3>
                      <p className="mt-1 text-xs leading-5 text-muted-foreground">{group.family}</p>
                    </div>
                  </RFDS.SemanticCard>
                ))}
              </div>
            </RFDS.ScrollReveal>
          </div>

          <div className="mt-20 grid gap-px overflow-hidden rounded-3xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
            {participationPrinciples.map((principle) => {
              const Icon = principle.icon;
              return (
                <div key={principle.title} className="bg-card p-7">
                  <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
                  <h3 className="mt-5 font-semibold text-foreground">{principle.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{principle.text}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section id="plan" className="scroll-mt-36 border-y border-border/60 bg-muted/35 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
          <RFDS.ScrollReveal animation="fade-up">
            <SectionHeading
              eyebrow="Plan your summit"
              title="What participants need to know now."
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
              <h3 className="mt-7 text-2xl font-semibold text-foreground">London, United Kingdom</h3>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
                London offers direct international connections and a strong local React community. The final venue is being coordinated; capacity, accessibility, and workshop space are part of that decision.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <span className="rounded-full border border-border bg-muted px-3 py-1.5 text-xs text-muted-foreground">International hub</span>
                <span className="rounded-full border border-border bg-muted px-3 py-1.5 text-xs text-muted-foreground">GMT in November</span>
                <span className="rounded-full border border-border bg-muted px-3 py-1.5 text-xs text-muted-foreground">Cool, wet weather likely</span>
              </div>
            </RFDS.SemanticCard>

            <RFDS.SemanticCard variant="outlined" className="p-7">
              <Clock3 className="h-6 w-6 text-primary" aria-hidden="true" />
              <h3 className="mt-6 text-xl font-semibold text-foreground">Before you book</h3>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                Hold 10–12 November in your calendar. Wait for the logistics update before booking non-refundable travel or accommodation.
              </p>
              <RFDS.ButtonLink href="/summit-2026.ics" variant="secondary" size="sm" className="mt-6" download>
                <Download className="h-4 w-4" aria-hidden="true" /> Add dates
              </RFDS.ButtonLink>
            </RFDS.SemanticCard>
          </div>

          <RFDS.SemanticCard variant="glass" className="mt-5 p-7 sm:p-9">
            <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
              <div>
                <p className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-primary">Participant checklist</p>
                <h3 className="mt-3 text-2xl font-semibold text-foreground">Come ready to contribute.</h3>
              </div>
              <ul className="grid gap-4 sm:grid-cols-2">
                {[
                  "Hold all three dates; confirm whether Day 3 applies to you",
                  "Coordinate your working group’s Tuesday update",
                  "Prioritize decisions and hands-on work for Wednesday",
                  "Flag cross-group scheduling conflicts early",
                  "Share accessibility and dietary needs when requested",
                  "Check this page before making travel arrangements",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm leading-6 text-muted-foreground">
                    <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-success/10 text-success">
                      <Check className="h-3 w-3" aria-hidden="true" />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </RFDS.SemanticCard>
        </div>
      </section>

      <section id="faq" className="scroll-mt-36 py-24 sm:py-32">
        <div className="mx-auto grid max-w-7xl gap-14 px-6 sm:px-8 lg:grid-cols-[0.75fr_1.25fr] lg:px-12">
          <div className="lg:sticky lg:top-40 lg:self-start">
            <RFDS.ScrollReveal animation="fade-up">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary shadow-[0_0_30px_hsl(var(--primary)/0.12)]">
                <Sparkles className="h-5 w-5" aria-hidden="true" />
              </div>
              <SectionHeading
                eyebrow="Participant FAQ"
                title="The details, in one place."
                description="This is the source of truth for summit participants. Confirmed information is stated plainly; open logistics are marked as such."
              />
              <p className="mt-6 text-xs text-muted-foreground">Last updated 22 July 2026 · Author: Nicola Corti</p>
            </RFDS.ScrollReveal>
          </div>

          <div className="divide-y divide-border border-y border-border">
            {faqItems.map((item) => (
              <details key={item.question} className={`${styles.faq} group`}>
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-6 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring">
                  <h3 className="font-semibold text-foreground sm:text-lg">{item.question}</h3>
                  <span className={`${styles.faqIcon} flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border bg-muted text-muted-foreground transition-transform duration-300`}>
                    <Plus className="h-4 w-4" aria-hidden="true" />
                  </span>
                </summary>
                <p className="max-w-3xl pb-7 pr-12 text-sm leading-7 text-muted-foreground sm:text-base">{item.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden border-t border-border/60 py-24">
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/10 via-background to-success/10" />
        <RFDS.ScrollReveal animation="scale" className="mx-auto max-w-4xl px-6 text-center sm:px-8">
          <RFDS.SemanticBadge variant="outline" className="border-primary/30 bg-background/50">10–12 November · London</RFDS.SemanticBadge>
          <h2 className="mt-7 text-4xl font-semibold tracking-tight text-foreground sm:text-6xl">Let’s shape what comes next.</h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
            Bring your context, your hardest questions, and the work that deserves to happen together.
          </p>
          <RFDS.ButtonLink href="#programme" size="lg" className="mt-9">Review the programme</RFDS.ButtonLink>
        </RFDS.ScrollReveal>
      </section>

      <RFDS.Footer />
    </main>
  );
}
