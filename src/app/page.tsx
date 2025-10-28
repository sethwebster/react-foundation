import type { Metadata } from "next";
import { Footer } from "@/components/layout/footer";
import { FoundationHero } from "@/components/home/foundation-hero";
import { MissionStatement } from "@/components/home/mission-statement";
import { ThreePillars } from "@/components/home/three-pillars";
import { ByTheNumbers } from "@/components/home/by-the-numbers";
import { BecomeContributor } from "@/components/home/become-contributor";
import { JoinMovementCTA } from "@/components/home/join-movement-cta";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

export const metadata: Metadata = {
  title: "React Foundation",
  description: "Supporting the React ecosystem through community funding and governance.",
};

export default function FoundationHome() {
  return (
    <div className="bg-background pt-24 text-muted-foreground">
      {/* Background gradient */}
      <div className="absolute inset-x-0 top-[-6rem] -z-10 flex justify-center overflow-hidden blur-3xl">
        <div className="h-[24rem] w-full max-w-[60rem] bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 opacity-30" />
      </div>

      <div className="mx-auto flex max-w-6xl flex-col px-6 pb-24 sm:px-8 lg:px-12">
        <main className="flex flex-col gap-20">
          <FoundationHero />
          <MissionStatement />
          <ThreePillars />
          <ByTheNumbers />
          <BecomeContributor />
          <JoinMovementCTA />
        </main>
      </div>

      <Footer />
    </div>
  );
}
