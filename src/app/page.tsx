import type { Metadata } from "next";
import { Footer } from "@/components/layout/footer";
import { FoundationHero } from "@/components/home/foundation-hero";
import { CommunityGallery } from "@/components/home/community-gallery";
import { MembersStrip } from "@/components/home/members-strip";
import { MissionStatement } from "@/components/home/mission-statement";
import { ThreePillars } from "@/components/home/three-pillars";
import { BecomeContributor } from "@/components/home/become-contributor";
import { JoinMovementCTA } from "@/components/home/join-movement-cta";

export const metadata: Metadata = {
  title: "React Foundation",
  description:
    "Supporting the React ecosystem through community funding and governance.",
};

export default function FoundationHome() {
  return (
    <div className="relative bg-background pt-24">
      {/* Subtle neutral backdrop behind the header + hero */}
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[600px] bg-gradient-to-b from-muted/70 to-background" />

      <div className="animate-page-appear mx-auto max-w-6xl px-6 pb-24 sm:px-8 lg:px-12">
        <main>
          <FoundationHero />

          <div className="mt-14 sm:mt-16">
            <CommunityGallery />
          </div>

          <div className="mt-16">
            <MembersStrip />
          </div>

          <div className="mt-16 border-t border-border/60" />

          <div className="mt-20 flex flex-col gap-24">
            <MissionStatement />
            <ThreePillars />
            <BecomeContributor />
            <JoinMovementCTA />
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}
