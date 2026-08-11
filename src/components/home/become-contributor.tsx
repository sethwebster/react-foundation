import Link from "next/link";

import { ButtonLink } from "@/components/ui/button";
import { RfcPopover } from "@/components/home/rfc-popover";
import { ecosystemLibraries } from "@/lib/maintainer-tiers";

type Action = { href: string; label: string; external?: boolean };

const contributorData: {
  variant: 'code' | 'sponsor' | 'member';
  title: string;
  description: string;
  primaryAction: Action;
  secondaryAction: Action | null;
}[] = [
  {
    variant: 'code',
    title: 'Contribute to Repos',
    description:
      'Submit code, RFCs, proposals, documentation, or bug reports to React and the tracked ecosystem repositories. Your contributions directly improve the tools millions of developers use.',
    primaryAction: {
      href: '/libraries',
      label: 'Browse tracked repositories',
    },
    secondaryAction: null,
  },
  {
    variant: 'sponsor' as const,
    title: 'Sponsor a Library',
    description:
      `Review the ${ecosystemLibraries.length} tracked repositories and support the projects you depend on through their own published sponsorship paths where available.`,
    primaryAction: {
      href: '/libraries',
      label: 'Sponsor a library',
    },
    secondaryAction: {
      href: '/scoring',
      label: 'Review methodology',
    },
  },
  {
    variant: 'member' as const,
    title: 'Become a Member',
    description:
      'Organizations can join the React Foundation through Linux Foundation enrollment and support independent stewardship, shared infrastructure, and community programs.',
    primaryAction: {
      href: 'https://enrollment.lfx.linuxfoundation.org/?project=react-foundation',
      label: 'Open membership enrollment',
      external: true,
    },
    secondaryAction: {
      href: '/become-a-member',
      label: 'Membership benefits',
    },
  },
];

export function BecomeContributor() {
  return (
    <section
      id="contribute"
      className="scroll-mt-32"
    >
      <div className="grid gap-10 md:grid-cols-[0.75fr_1.25fr]">
        <div>
          <h2 className="text-3xl font-semibold leading-tight text-foreground sm:text-4xl">
            Become a contributor
          </h2>
          <p className="mt-4 text-sm leading-6 text-muted-foreground">
            Contribute code, organize communities, create educational content, or
            support financially. Every pathway helps build a stronger ecosystem.
          </p>
        </div>

        <div className="divide-y divide-border border-y border-border">
          {contributorData.map((item, index) => (
            <article key={item.variant} className="grid gap-5 py-6 sm:grid-cols-[4rem_1fr]">
              <p className="text-xs font-semibold text-primary">
                0{index + 1}
              </p>
              <div>
                <h3 className="text-lg font-semibold text-foreground">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {item.description}
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <ButtonLink
                    href={item.primaryAction.href}
                    variant={index === 0 ? "primary" : "secondary"}
                    size="sm"
                    {...(item.primaryAction.external
                      ? { target: '_blank', rel: 'noopener noreferrer' }
                      : {})}
                  >
                    {item.primaryAction.label}
                  </ButtonLink>
                  {item.variant === 'code' ? (
                    <RfcPopover />
                  ) : item.secondaryAction ? (
                    <ButtonLink
                      href={item.secondaryAction.href}
                      variant="ghost"
                      size="sm"
                      {...(item.secondaryAction.external
                        ? { target: '_blank', rel: 'noopener noreferrer' }
                        : {})}
                    >
                      {item.secondaryAction.label}
                    </ButtonLink>
                  ) : null}
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>

      <div className="mt-8 border-t border-border pt-6 text-sm text-muted-foreground">
        <p>
          Questions about contributing?{" "}
          <Link
            href="mailto:info@react.foundation"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Get in touch
          </Link>
        </p>
      </div>
    </section>
  );
}
