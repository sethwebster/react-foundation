import Link from "next/link";
import type { ReactNode } from "react";

type Contributor = {
  title: string;
  description: string;
  action: { href: string; label: string; external?: boolean };
  iconAccent: string;
  icon: ReactNode;
  highlighted?: boolean;
};

const iconPaths = {
  code: "M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4",
  support:
    "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z",
  heart:
    "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z",
  member:
    "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14c-3.866 0-7 2.239-7 5v1h14v-1c0-2.761-3.134-5-7-5z",
};

function Icon({ path, className }: { path: string; className: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.75}
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d={path} />
    </svg>
  );
}

const CONTRIBUTORS: Contributor[] = [
  {
    title: "Contribute to Repos",
    description:
      "Submit code, RFCs, proposals, documentation, or bug reports to React and 54+ ecosystem libraries. Your contributions directly improve the tools millions of developers use.",
    action: { href: "https://github.com/facebook/react", label: "Browse repos →", external: true },
    iconAccent: "text-success",
    icon: <Icon path={iconPaths.code} className="h-6 w-6" />,
  },
  {
    title: "Support Financially",
    description:
      "Financial support is one way to help fund maintainers, educational resources, and accessibility initiatives. This includes store purchases, direct donations, and sponsorships.",
    action: { href: "/store", label: "Learn more →" },
    iconAccent: "text-primary",
    icon: <Icon path={iconPaths.support} className="h-6 w-6" />,
  },
  {
    title: "Sponsor a Library",
    description:
      "Directly sponsor your favorite React ecosystem library. Choose from 54 libraries including Redux, TanStack Query, React Router, and more.",
    action: { href: "/impact#libraries", label: "Browse libraries →" },
    iconAccent: "text-destructive",
    icon: <Icon path={iconPaths.heart} className="h-6 w-6" />,
  },
  {
    title: "Become a Member",
    description:
      "Join the React Foundation as an official member. Get voting rights on funding decisions, exclusive updates, and recognition in our community.",
    action: {
      href: "https://enrollment.lfx.linuxfoundation.org/?project=react-foundation",
      label: "Apply →",
      external: true,
    },
    iconAccent: "text-primary-foreground",
    icon: <Icon path={iconPaths.member} className="h-6 w-6" />,
    highlighted: true,
  },
];

export function BecomeContributor() {
  return (
    <section id="contribute" className="scroll-mt-32">
      <div className="text-center">
        <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Become a Contributor
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
          Contribute code, organize communities, create educational content, or
          support financially — every pathway helps build a stronger ecosystem.
        </p>
      </div>

      <div className="mt-12 grid gap-6 sm:grid-cols-2">
        {CONTRIBUTORS.map((item) => (
          <div
            key={item.title}
            className={`flex flex-col rounded-3xl p-8 ${
              item.highlighted
                ? "bg-primary text-primary-foreground"
                : "border border-border/60 bg-muted/50"
            }`}
          >
            <span className={item.iconAccent}>{item.icon}</span>
            <h3
              className={`mt-5 text-lg font-semibold ${
                item.highlighted ? "text-primary-foreground" : "text-foreground"
              }`}
            >
              {item.title}
            </h3>
            <p
              className={`mt-3 flex-1 text-sm leading-relaxed ${
                item.highlighted ? "text-primary-foreground/80" : "text-muted-foreground"
              }`}
            >
              {item.description}
            </p>
            <Link
              href={item.action.href}
              className={`mt-6 text-sm font-medium transition-colors ${
                item.highlighted
                  ? "text-primary-foreground hover:text-primary-foreground/80"
                  : "text-primary hover:text-primary/80"
              }`}
              {...(item.action.external
                ? { target: "_blank", rel: "noopener noreferrer" }
                : {})}
            >
              {item.action.label}
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}
