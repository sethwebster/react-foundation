import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border py-10 text-xs text-muted-foreground">
      <div className="mx-auto max-w-[48rem] px-[var(--foundation-page-gutter)]">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <p className="max-w-[31rem] leading-5">
            Copyright © React a Series of LF Projects, LLC and its contributors. For web site
            terms of use, trademark policy and other project policies please see{" "}
            <Link className="underline transition hover:text-foreground" href="https://lfprojects.org">
              lfprojects.org
            </Link>
            .
          </p>
          <div className="flex shrink-0 gap-6">
            <Link className="transition hover:text-foreground" href="https://lfprojects.org/policies/privacy-policy/">Privacy</Link>
            <Link className="transition hover:text-foreground" href="https://lfprojects.org/policies/terms-of-use/">Terms</Link>
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
