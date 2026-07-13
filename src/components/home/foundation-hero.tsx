import { ButtonLink } from "@/components/ui/button";
import { ReactAtom } from "@/components/ui/react-atom";

export function FoundationHero() {
  return (
    <section className="flex flex-col items-center pt-10 text-center sm:pt-16">
      <ReactAtom
        className="mb-8 h-14 w-14 text-muted-foreground/40"
        strokeWidth={0.9}
      />
      <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
        Building the future of React, together.
      </h1>
      <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
        The React Foundation is a community-driven initiative dedicated to
        sustaining and advancing the React ecosystem. Join thousands of
        contributors who code, teach, organize, and support the tools millions
        of developers rely on.
      </p>
      <div className="mt-9">
        <ButtonLink href="#contribute" variant="primary" size="lg">
          Get involved
        </ButtonLink>
      </div>
    </section>
  );
}
