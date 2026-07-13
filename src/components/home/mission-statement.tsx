import { ButtonLink } from "@/components/ui/button";

export function MissionStatement() {
  return (
    <section id="mission" className="scroll-mt-32">
      <p className="text-base font-semibold tracking-tight text-primary">
        Our Mission
      </p>
      <p className="mt-6 max-w-3xl text-2xl font-semibold leading-snug tracking-tight text-foreground sm:text-[28px]">
        We exist to ensure the React ecosystem thrives for generations to come.
        Through code contributions, community organizing, educational content
        creation, and sustainable funding, we support maintainers, educators,
        and community organizers who build the tools millions of developers rely
        on.
      </p>
      <div className="mt-8">
        <ButtonLink href="/about" variant="tertiary" size="md">
          Learn more →
        </ButtonLink>
      </div>
    </section>
  );
}
