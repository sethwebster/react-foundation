import { ButtonLink } from "@/components/ui/button";

export function JoinMovementCTA() {
  return (
    <section className="flex flex-col items-center gap-6 py-8 text-center">
      <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
        Join the Movement
      </h2>
      <p className="max-w-2xl text-base leading-relaxed text-muted-foreground">
        Whether you contribute code, organize meetups, create educational
        content, or support financially, there are many ways to participate in
        building a sustainable future for the React ecosystem.
      </p>
      <ButtonLink href="#contribute" variant="primary" size="lg">
        Get involved
      </ButtonLink>
    </section>
  );
}
