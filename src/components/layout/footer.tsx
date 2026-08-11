import Image from "next/image";
import Link from "next/link";

const footerNav: { heading: string; links: { label: string; href: string }[] }[] = [
  {
    heading: "Explore",
    links: [
      { label: "Home", href: "/" },
      { label: "News", href: "/updates" },
      { label: "About", href: "/about" },
      { label: "Impact", href: "/impact" },
      { label: "Communities", href: "/communities" },
    ],
  },
  {
    heading: "Participate",
    links: [
      { label: "Become a member", href: "/become-a-member" },
      { label: "Find a community", href: "/communities" },
      { label: "Sign in", href: "/auth/signin" },
    ],
  },
];

const socialLinks = [
  {
    label: "React on X",
    href: "https://x.com/reactjs",
    icon: (
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77Z" />
    ),
  },
  {
    label: "React on GitHub",
    href: "https://github.com/reactjs",
    icon: (
      <path d="M12 .5C5.73.5.5 5.73.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56 0-.28-.01-1.02-.02-2-3.2.7-3.88-1.54-3.88-1.54-.53-1.34-1.29-1.7-1.29-1.7-1.05-.72.08-.71.08-.71 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.7 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11.1 11.1 0 0 1 2.9-.39c.98 0 1.97.13 2.9.39 2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.43-2.69 5.41-5.25 5.69.41.36.78 1.06.78 2.14 0 1.55-.01 2.8-.01 3.18 0 .31.21.68.8.56A10.52 10.52 0 0 0 23.5 12C23.5 5.73 18.27.5 12 .5Z" />
    ),
  },
];

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border">
      <div className="mx-auto foundation-measure-standard px-[var(--foundation-page-gutter)] py-14 sm:py-16">
        <div className="grid gap-12 sm:grid-cols-[1.4fr_1fr_1fr]">
          {/* Brand */}
          <div className="max-w-[22rem]">
            <Link href="/" className="flex items-center gap-2.5">
              <span className="relative h-6 w-6 shrink-0">
                <Image
                  src="/react-logo.svg"
                  alt="React Foundation logo"
                  fill
                  sizes="24px"
                  className="object-contain brightness-0 dark:invert"
                />
              </span>
              <span className="text-sm font-semibold tracking-[-0.01em] text-foreground">
                The React Foundation
              </span>
            </Link>
            <p className="mt-4 text-sm leading-6 text-muted-foreground">
              Independent stewardship for React — supporting the maintainers,
              communities, and educators the ecosystem relies on.
            </p>
            <div className="mt-6 flex items-center gap-2">
              {socialLinks.map((social) => (
                <Link
                  key={social.href}
                  href={social.href}
                  aria-label={social.label}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="flex h-9 w-9 items-center justify-center rounded-field border border-border text-muted-foreground transition hover:border-border-strong hover:bg-muted hover:text-foreground"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="h-[1.05rem] w-[1.05rem]" aria-hidden>
                    {social.icon}
                  </svg>
                </Link>
              ))}
            </div>
          </div>

          {/* Nav columns */}
          {footerNav.map((column) => (
            <nav key={column.heading} aria-label={column.heading}>
              <p className="foundation-eyebrow text-muted-foreground">
                {column.heading}
              </p>
              <ul className="mt-4 space-y-3">
                {column.links.map((link) => (
                  <li key={`${column.heading}-${link.href}`}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        {/* Legal */}
        <div className="mt-12 flex flex-col gap-4 border-t border-border pt-8 text-xs text-muted-foreground sm:flex-row sm:items-start sm:justify-between">
          <p className="max-w-[34rem] leading-5">
            Copyright © React a Series of LF Projects, LLC and its contributors. For
            web site terms of use, trademark policy and other project policies please
            see{" "}
            <Link
              className="underline underline-offset-2 transition hover:text-foreground"
              href="https://lfprojects.org"
            >
              lfprojects.org
            </Link>
            .
          </p>
          <div className="flex shrink-0 gap-6">
            <Link
              className="transition hover:text-foreground"
              href="https://lfprojects.org/policies/privacy-policy/"
            >
              Privacy
            </Link>
            <Link
              className="transition hover:text-foreground"
              href="https://lfprojects.org/policies/terms-of-use/"
            >
              Terms
            </Link>
            <Link
              className="transition hover:text-foreground"
              href="https://lfprojects.org/policies/"
            >
              Policies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
