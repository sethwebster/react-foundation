'use client';

import React from "react";
import Link from "next/link";

import { Panel, PanelEyebrow, PanelSub } from "@/components/panels/panel";

type Action = { href: string; label: string; external?: boolean };

const contributorData: {
  variant: 'code' | 'donate' | 'sponsor' | 'member';
  title: string;
  description: string;
  icon: React.ReactNode;
  primaryAction: Action;
  secondaryAction: Action | null;
}[] = [
  {
    variant: 'code',
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
    secondaryAction: null,
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
      href: 'https://enrollment.lfx.linuxfoundation.org/?project=react-foundation',
      label: 'Apply Now →',
      external: true,
    },
    secondaryAction: {
      href: 'https://enrollment.lfx.linuxfoundation.org/?project=react-foundation',
      label: 'Learn More',
      external: true,
    },
  },
];

const ACTION_LINK_CLASS =
  "panels-anim text-[15px] font-semibold hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid focus-visible:outline-[#16181D]";

export function BecomeContributor() {
  const handleContactClick = () => {
    const parts = ['hello', 'react', 'foundation'];
    window.location.href = `mailto:${parts[0]}@${parts[1]}.${parts[2]}`;
  };

  return (
    <Panel tone="paper" id="contribute" labelledBy="become-contributor-title">
      <PanelEyebrow id="become-contributor-title">Become a contributor</PanelEyebrow>
      <PanelSub>
        Contribute code, organize communities, create educational content, or support
        financially. Every pathway helps sustain and grow the React ecosystem.
      </PanelSub>

      <div className="mt-4 divide-y divide-[color:var(--panel-rule)]">
        {contributorData.map((item) => (
          <div
            key={item.variant}
            className="grid grid-cols-[24px_minmax(0,1fr)] items-start gap-x-5 py-6"
          >
            <span className="mt-0.5 text-[#16181D] [&_svg]:h-6 [&_svg]:w-6" aria-hidden="true">
              {item.icon}
            </span>
            <div className="min-w-0">
              <h3 className="text-[17px] font-semibold text-[#16181D]">{item.title}</h3>
              <p className="mt-1 max-w-[42rem] text-sm leading-[1.55] text-[#5E687E]">
                {item.description}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2">
                <Link
                  href={item.primaryAction.href}
                  className={`${ACTION_LINK_CLASS} text-[#087EA4]!`}
                  {...(item.primaryAction.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                >
                  {item.primaryAction.label}
                </Link>
                {item.secondaryAction && (
                  <Link
                    href={item.secondaryAction.href}
                    className={`${ACTION_LINK_CLASS} text-[#16181D]!`}
                    {...(item.secondaryAction.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                  >
                    {item.secondaryAction.label}
                  </Link>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-2 border-t border-[color:var(--panel-rule)] pt-6">
        <p className="text-sm text-[#5E687E]">
          Questions about contributing?{" "}
          <button
            onClick={handleContactClick}
            className="panels-anim font-semibold text-[#087EA4] hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid focus-visible:outline-[#16181D]"
          >
            Get in touch
          </button>
        </p>
      </div>
    </Panel>
  );
}
