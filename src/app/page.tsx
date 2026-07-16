import type { Metadata } from "next";
import Image from "next/image";

import { ButtonLink } from "@/components/ui/button";
import { FoundingMembers } from "@/components/home/founding-members";
import { MemberPhotoRail } from "@/components/home/member-photo-rail";
import {
  HomeCommunityCTA,
  HomeMission,
  HomePillars,
} from "@/components/home/home-sections";
import { PublicPageShell, Section } from "@/components/public-site/layout";

export const metadata: Metadata = {
  title: "React Foundation",
  description: "Supporting the React ecosystem through community funding and governance.",
};

export default function FoundationHome() {
  return (
    <PublicPageShell className="overflow-x-clip">
      <main>
        <Section className="pt-10 text-center sm:pt-20">
          <div className="animate-page-appear">
            <Image
              src="/react-logo.svg"
              alt=""
              aria-hidden
              width={76}
              height={68}
              priority
              className="mx-auto h-auto w-[3.75rem] grayscale opacity-[0.18] dark:invert sm:w-[4.75rem]"
            />
            <h1 className="mx-auto mt-7 max-w-[36rem] text-[clamp(2.05rem,5vw,2.75rem)] font-semibold leading-[1.04] text-foreground">
              Building the future of React, together.
            </h1>
            <p className="mx-auto mt-6 max-w-[32rem] text-[0.9375rem] leading-6 text-muted-foreground">
              The React Foundation is a community-driven initiative dedicated to
              sustaining and advancing the React ecosystem. Join thousands of
              contributors who code, teach, organize, and support the tools millions of
              developers rely on.
            </p>
            <div className="mt-8">
              <ButtonLink href="/become-a-member" size="md">
                Get involved
              </ButtonLink>
            </div>
          </div>
        </Section>

        <MemberPhotoRail />

        <Section className="pb-8 sm:pb-24" measure="standard">
          <FoundingMembers />
        </Section>

        <HomeMission />
        <HomePillars />
        <HomeCommunityCTA />
      </main>
    </PublicPageShell>
  );
}
