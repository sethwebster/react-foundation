import Image from "next/image";
import {
  ArrowDown,
  CalendarDays,
  MapPin,
  UsersRound,
} from "lucide-react";

import { RFDS } from "@/components/rfds";
import { SummitCalendarMenu } from "./summit-calendar-menu";
import styles from "./summit.module.css";

const navigation = [
  { href: "#why", label: "Purpose" },
  { href: "#programme", label: "Programme" },
  { href: "#joining", label: "Joining" },
  { href: "#plan", label: "Plan" },
  { href: "#faq", label: "FAQ" },
] as const;

export function SummitHero() {
  return (
    <>
      <section className="relative flex min-h-[calc(100svh-5rem)] items-center pt-28">
        <div className="mx-auto grid w-full max-w-7xl gap-14 px-6 py-16 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:px-12 lg:py-24">
          <div>
            <RFDS.Pill tone="sky" className="border-primary/30 bg-primary/5 text-foreground">
              November 2026 · London
            </RFDS.Pill>
            <h1 className="mt-8 text-5xl font-semibold leading-[0.95] tracking-[-0.055em] text-foreground sm:text-7xl lg:text-[5.6rem]">
              Contributors
              <span className="block text-primary">
                Summit 2026
              </span>
            </h1>
            <p className="mt-8 max-w-xl text-lg leading-8 text-muted-foreground sm:text-xl">
              Three days in London to build the roadmap of what comes next for React.
            </p>

            <div className="mt-9 flex flex-wrap gap-3">
              <RFDS.ButtonLink href="#programme" size="lg">
                Explore the programme
                <ArrowDown className="h-4 w-4" aria-hidden="true" />
              </RFDS.ButtonLink>
              <SummitCalendarMenu variant="tertiary" />
            </div>

            <dl className="mt-12 grid max-w-2xl gap-6 border-t border-border/70 pt-7 sm:grid-cols-3">
              <div>
                <dt className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
                  <CalendarDays className="h-4 w-4 text-primary" aria-hidden="true" /> Dates
                </dt>
                <dd className="mt-2 font-semibold text-foreground">10–12 Nov 2026</dd>
              </div>
              <div>
                <dt className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
                  <MapPin className="h-4 w-4 text-primary" aria-hidden="true" /> Location
                </dt>
                <dd className="mt-2 font-semibold text-foreground">London, UK</dd>
              </div>
              <div>
                <dt className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
                  <UsersRound className="h-4 w-4 text-primary" aria-hidden="true" /> Attendance
                </dt>
                <dd className="mt-2 font-semibold text-foreground">Invite only</dd>
              </div>
            </dl>
          </div>

          <div className={`${styles.orbital} relative mx-auto hidden aspect-square w-full max-w-[34rem] lg:block`} aria-hidden="true">
            <div className={styles.orbitOne} />
            <div className={styles.orbitTwo} />
            <div className={styles.orbitThree} />
            <div className="absolute inset-1/2 flex h-36 w-36 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-primary/25 bg-card/75 backdrop-blur-xl">
              <Image
                src="/react-logo.svg"
                alt=""
                width={96}
                height={96}
              />
            </div>
            <span className="absolute left-[10%] top-[22%] rounded-full border border-border bg-card/80 px-3 py-1.5 font-mono text-xs text-muted-foreground shadow-lg backdrop-blur">align</span>
            <span className="absolute right-[10%] top-[18%] rounded-full border border-border bg-card/80 px-3 py-1.5 font-mono text-xs text-muted-foreground shadow-lg backdrop-blur">share</span>
            <span className="absolute bottom-[18%] right-[6%] rounded-full border border-border bg-card/80 px-3 py-1.5 font-mono text-xs text-muted-foreground shadow-lg backdrop-blur">build</span>
            <span className="absolute bottom-[12%] left-[12%] rounded-full border border-border bg-card/80 px-3 py-1.5 font-mono text-xs text-muted-foreground shadow-lg backdrop-blur">connect</span>
          </div>
        </div>
      </section>

      <nav aria-label="Summit sections" className="sticky top-[4.5rem] z-40 border-y border-border/70 bg-background/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center gap-1 overflow-x-auto px-4 py-2 sm:justify-center sm:px-8">
          {navigation.map((item) => (
            <a key={item.href} href={item.href} className="shrink-0 rounded-full px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground">
              {item.label}
            </a>
          ))}
        </div>
      </nav>
    </>
  );
}
