import type { Metadata } from "next";
import Image from "next/image";

import { ButtonLink } from "@/components/ui/button";
import { BecomeContributor } from "@/components/home/become-contributor";
import { FoundingMembers } from "@/components/home/founding-members";
import { MemberPhotoRail } from "@/components/home/member-photo-rail";
import {
  HomeCommunityCTA,
  HomeMission,
  HomePillars,
} from "@/components/home/home-sections";
import { Eyebrow, PublicPageShell, Section } from "@/components/public-site/layout";

export const metadata: Metadata = {
  title: "React Foundation",
  description: "Supporting the React ecosystem through community funding and governance.",
};

export default function FoundationHome() {
  return (
    <PublicPageShell className="overflow-x-clip">
      <main>
        <Section className="relative pt-16 text-center sm:pt-24" measure="standard">
          <div className="foundation-hero-glow animate-page-appear">
            <Image
              src="/react-logo.svg"
              alt=""
              aria-hidden
              width={76}
              height={68}
              priority
              className="mx-auto h-auto w-[3.25rem] opacity-70 brightness-0 dark:opacity-80 dark:invert sm:w-[3.75rem]"
            />
            <Eyebrow className="mt-7">Independent · Community-driven · Open</Eyebrow>
            <h1 className="mx-auto mt-6 max-w-[38rem] text-[clamp(2.25rem,5.4vw,3.25rem)] font-semibold leading-[1.03] tracking-[-0.03em] text-foreground">
              Building the future of React, together.
            </h1>
            <p className="mx-auto mt-6 max-w-[34rem] text-lead leading-8 text-muted-foreground">
              The React Foundation is a community-driven initiative dedicated to
              sustaining and advancing the React ecosystem. Join thousands of
              contributors who code, teach, organize, and support the tools millions of
              developers rely on.
            </p>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
              <ButtonLink href="/become-a-member" size="lg">
                Get involved
              </ButtonLink>
              <ButtonLink href="/about" variant="tertiary" size="lg">
                Learn more
              </ButtonLink>
            </div>
          </div>
        </Section>

        <MemberPhotoRail />

        <Section className="pb-8 sm:pb-24" measure="standard">
          <FoundingMembers />
        </Section>

        <HomePillars />
        <HomeMission />
        <Section className="pb-20 sm:pb-28" measure="standard">
          <BecomeContributor />
        </Section>
        <HomeCommunityCTA />
      </main>
    </PublicPageShell>
  );
}
