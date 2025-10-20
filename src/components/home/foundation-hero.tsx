import { ButtonLink } from "@/components/ui/button";
import { Pill } from "@/components/ui/pill";
import { HeroBadges } from "@/components/home/hero-badges";

export function FoundationHero() {
  return (
    <section className="space-y-8 pt-12">
      <Pill>Community-Driven · Transparent · Impactful</Pill>
      <div>
        <h1 className="text-5xl font-semibold leading-tight text-white sm:text-6xl lg:text-7xl">
          Building the future of React, together.
        </h1>
        <p className="mt-8 max-w-2xl text-lg text-white/70">
          The React Foundation is a community-driven initiative dedicated to sustaining
          and advancing the React ecosystem by funding maintainers, supporting education,
          and ensuring accessibility for all developers.
        </p>
      </div>
      <div className="flex flex-wrap gap-4">
        <ButtonLink href="/store" variant="primary" size="lg">
          Shop to Support
        </ButtonLink>
        <ButtonLink href="#contribute" variant="tertiary" size="lg">
          Contribute
        </ButtonLink>
        <ButtonLink href="/about" variant="secondary" size="lg">
          Learn Our Story
        </ButtonLink>
      </div>
      <HeroBadges />
    </section>
  );
}
