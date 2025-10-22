import { ButtonLink } from "@/components/ui/button";

export function BecomeContributor() {
  return (
    <section
      id="contribute"
      className="scroll-mt-32 space-y-12 rounded-3xl border border-border/10 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 p-12"
    >
      <div className="text-center">
        <h2 className="text-3xl font-semibold text-foreground sm:text-4xl">
          Become a Contributor
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-base text-foreground/70">
          Join the movement to sustain and grow the React ecosystem. Whether you code,
          donate, sponsor, or become a member, your contribution makes a real difference.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Contribute Code */}
        <div className="group space-y-6 rounded-2xl border border-border/10 bg-muted/60 p-8 transition-all hover:border-border/20 hover:bg-muted/80">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500 transition-transform group-hover:scale-110">
              <svg
                className="h-7 w-7 text-foreground"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-foreground">
                Contribute to Repos
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-foreground/70">
                Submit code, RFCs, proposals, documentation, or bug reports to React
                and 54+ ecosystem libraries. Your contributions directly improve the
                tools millions of developers use.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3 pt-2">
            <ButtonLink
              href="https://github.com/facebook/react"
              variant="secondary"
              size="sm"
              className="group-hover:border-emerald-400/30"
            >
              Browse React Repos →
            </ButtonLink>
            <ButtonLink
              href="https://github.com/reactjs/rfcs"
              variant="ghost"
              size="sm"
            >
              View RFCs
            </ButtonLink>
          </div>
        </div>

        {/* Donate */}
        <div className="group space-y-6 rounded-2xl border border-border/10 bg-muted/60 p-8 transition-all hover:border-border/20 hover:bg-muted/80">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-sky-400 to-indigo-500 transition-transform group-hover:scale-110">
              <svg
                className="h-7 w-7 text-foreground"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-foreground">
                Make a Donation
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-foreground/70">
                One-time or recurring donations directly fund maintainers, educational
                resources, and accessibility initiatives. 100% of funds go to the
                ecosystem.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3 pt-2">
            <ButtonLink
              href="/store"
              variant="secondary"
              size="sm"
              className="group-hover:border-sky-400/30"
            >
              Shop to Donate →
            </ButtonLink>
            <ButtonLink href="#" variant="ghost" size="sm">
              Direct Donation
            </ButtonLink>
          </div>
        </div>

        {/* Sponsor a Library */}
        <div className="group space-y-6 rounded-2xl border border-border/10 bg-muted/60 p-8 transition-all hover:border-border/20 hover:bg-muted/80">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-purple-400 to-pink-500 transition-transform group-hover:scale-110">
              <svg
                className="h-7 w-7 text-foreground"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-foreground">
                Sponsor a Library
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-foreground/70">
                Directly sponsor your favorite React ecosystem library. Choose from 54
                libraries including Redux, TanStack Query, React Router, and more.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3 pt-2">
            <ButtonLink
              href="/impact#libraries"
              variant="secondary"
              size="sm"
              className="group-hover:border-purple-400/30"
            >
              Browse Libraries →
            </ButtonLink>
            <ButtonLink href="#" variant="ghost" size="sm">
              GitHub Sponsors
            </ButtonLink>
          </div>
        </div>

        {/* Become a Member */}
        <div className="group space-y-6 rounded-2xl border border-border/10 bg-muted/60 p-8 transition-all hover:border-border/20 hover:bg-muted/80">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-orange-400 to-red-500 transition-transform group-hover:scale-110">
              <svg
                className="h-7 w-7 text-foreground"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-foreground">
                Become a Member
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-foreground/70">
                Join the React Foundation as an official member. Get voting rights on
                funding decisions, exclusive updates, and recognition in our community.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3 pt-2">
            <ButtonLink
              href="/about"
              variant="secondary"
              size="sm"
              className="group-hover:border-orange-400/30"
            >
              Learn About Membership →
            </ButtonLink>
            <ButtonLink href="#" variant="ghost" size="sm">
              Apply Now
            </ButtonLink>
          </div>
        </div>
      </div>

      <div className="border-t border-border/10 pt-8 text-center">
        <p className="text-sm text-foreground/60">
          Questions about contributing?{" "}
          <a
            href="mailto:hello@react.foundation"
            className="font-medium text-cyan-400 transition hover:text-cyan-300"
          >
            Get in touch
          </a>
        </p>
      </div>
    </section>
  );
}
