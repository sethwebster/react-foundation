import { ButtonLink } from "@/components/ui/button";

export function JoinMovementCTA() {
  return (
    <section className="flex flex-col items-center gap-8 py-12 text-center">
      <h2 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
        Join the Movement
      </h2>
      <p className="max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
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
