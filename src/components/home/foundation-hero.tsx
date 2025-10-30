import { ButtonLink } from "@/components/ui/button";
import { Pill } from "@/components/ui/pill";
import { HeroBadges } from "@/components/home/hero-badges";

export function FoundationHero() {
  return (
    <section className="space-y-8 pt-12">
      <Pill>Community-Driven · Transparent · Impactful</Pill>
      <div>
        <h1 className="text-5xl font-semibold leading-tight text-foreground sm:text-6xl lg:text-7xl">
          Building the future of React, together.
        </h1>
        <p className="mt-8 max-w-2xl text-lg text-foreground/70">
          The React Foundation is a community-driven initiative dedicated to sustaining
          and advancing the React ecosystem. Join thousands of contributors who code,
          teach, organize, and support the tools millions of developers rely on.
        </p>
      </div>
      <div className="flex flex-wrap gap-4">
        <ButtonLink href="#contribute" variant="primary" size="lg">
          Get Involved
        </ButtonLink>
        <ButtonLink href="/about" variant="secondary" size="lg">
          Learn Our Story
        </ButtonLink>
        <ButtonLink href="/store" variant="tertiary" size="lg">
          Shop to Support
        </ButtonLink>
      </div>
      <HeroBadges />
    </section>
  );
}
