import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border py-10 text-xs text-muted-foreground">
      <div className="mx-auto max-w-[48rem] px-[var(--foundation-page-gutter)]">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <p className="max-w-[31rem] leading-5">
            © {new Date().getFullYear()} The Linux Foundation®. React and the React logo are
            trademarks of Meta Platforms, Inc.
          </p>
          <div className="flex shrink-0 gap-6">
            <Link className="transition hover:text-foreground" href="/privacy">Privacy</Link>
            <Link className="transition hover:text-foreground" href="/terms">Terms</Link>
            <Link
              className="transition hover:text-foreground"
              href="https://www.linuxfoundation.org/legal/policies"
            >
              Policies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
