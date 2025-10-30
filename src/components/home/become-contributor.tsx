'use client';

import { RFDS } from "@/components/rfds";
import Link from "next/link";

const contributorData = [
  {
    variant: 'code' as const,
    title: 'Contribute to Repos',
    description:
      'Submit code, RFCs, proposals, documentation, or bug reports to React and 54+ ecosystem libraries. Your contributions directly improve the tools millions of developers use.',
    icon: (
      <svg
        className="h-7 w-7"
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
    ),
    primaryAction: {
      href: 'https://github.com/facebook/react',
      label: 'Browse React Repos →',
    },
    secondaryAction: {
      href: 'https://github.com/reactjs/rfcs',
      label: 'View RFCs',
    },
  },
  {
    variant: 'donate' as const,
    title: 'Support Financially',
    description:
      'Financial support is one way to help fund maintainers, educational resources, and accessibility initiatives. This includes store purchases, direct donations, and sponsorships.',
    icon: (
      <svg
        className="h-7 w-7"
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
    ),
    primaryAction: {
      href: '/store',
      label: 'Learn More →',
    },
    secondaryAction: {
      href: '#',
      label: 'Direct Donation',
    },
  },
  {
    variant: 'sponsor' as const,
    title: 'Sponsor a Library',
    description:
      'Directly sponsor your favorite React ecosystem library. Choose from 54 libraries including Redux, TanStack Query, React Router, and more.',
    icon: (
      <svg
        className="h-7 w-7"
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
    ),
    primaryAction: {
      href: '/impact#libraries',
      label: 'Browse Libraries →',
    },
    secondaryAction: {
      href: '#',
      label: 'GitHub Sponsors',
    },
  },
  {
    variant: 'member' as const,
    title: 'Become a Member',
    description:
      'Join the React Foundation as an official member. Get voting rights on funding decisions, exclusive updates, and recognition in our community.',
    icon: (
      <svg
        className="h-7 w-7"
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
    ),
    primaryAction: {
      href: '/about',
      label: 'Learn About Membership →',
    },
    secondaryAction: {
      href: '#',
      label: 'Apply Now',
    },
  },
];

export function BecomeContributor() {
  const handleContactClick = () => {
    const parts = ['hello', 'react', 'foundation'];
    window.location.href = `mailto:${parts[0]}@${parts[1]}.${parts[2]}`;
  };

  return (
    <section
      id="contribute"
      className="relative isolate scroll-mt-32 rounded-3xl border border-border/10 p-12"
    >
      <div className="absolute inset-0 -z-10 overflow-hidden rounded-3xl bg-gradient-vibrant" />
      <div className="text-center">
        <h2 className="text-3xl font-semibold text-foreground sm:text-4xl">
          Become a Contributor
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-base text-foreground/70">
          Join the movement to sustain and grow the React ecosystem. Contribute code,
          organize communities, create educational content, or support financially —
          every pathway helps build a stronger ecosystem.
        </p>
      </div>

      <div className="mt-12 grid gap-6 lg:grid-cols-2">
        {contributorData.map((item) => (
          <RFDS.ContributorCard
            key={item.variant}
            icon={<RFDS.ContributorIcon variant={item.variant}>{item.icon}</RFDS.ContributorIcon>}
            title={item.title}
            description={item.description}
            actions={
              <>
                <Link
                  href={item.primaryAction.href}
                  className="inline-flex items-center justify-center gap-2 rounded-md border border-border bg-secondary px-3 py-2 text-sm font-medium text-secondary-foreground transition-colors hover:bg-secondary/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                >
                  {item.primaryAction.label}
                </Link>
                <Link
                  href={item.secondaryAction.href}
                  className="inline-flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                >
                  {item.secondaryAction.label}
                </Link>
              </>
            }
          />
        ))}
      </div>

      <div className="mt-8 border-t border-border/10 pt-8 text-center">
        <p className="text-sm text-foreground/60">
          Questions about contributing?{" "}
          <button
            onClick={handleContactClick}
            className="font-medium text-primary transition-colors hover:text-primary/80 hover:underline"
          >
            Get in touch
          </button>
        </p>
      </div>
    </section>
  );
}
