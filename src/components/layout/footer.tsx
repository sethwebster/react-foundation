import Link from "next/link";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-20 border-t border-white/10 pt-8 text-sm text-white/50">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-12">
        <p>© {currentYear} React Foundation. All rights reserved.</p>
        <div className="flex flex-wrap gap-6">
          <Link className="transition hover:text-white" href="/privacy">
            Privacy
          </Link>
          <Link className="transition hover:text-white" href="/terms">
            Terms
          </Link>
          <a className="transition hover:text-white" href="#accessibility">
            Accessibility
          </a>
        </div>
      </div>
    </footer>
  );
}
