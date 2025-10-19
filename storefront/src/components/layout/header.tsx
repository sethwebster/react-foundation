import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { SignInButton } from "@/features/auth/sign-in-button";

export function Header() {
  return (
    <header className="fixed left-0 right-0 top-0 z-50 border-b border-white/10 bg-slate-950/95 shadow-lg shadow-black/20 backdrop-blur-xl supports-[backdrop-filter]:bg-slate-950/80">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-12">
        <div className="flex items-center gap-3">
          <div className="relative h-10 w-10 overflow-hidden rounded-full bg-white/10 ring-1 ring-white/15">
            <Link href="/">
              <Image
                src="/react-logo.svg"
                alt="React Foundation logo"
                fill
                sizes="40px"
                className="object-contain p-1.5"
                priority
              />
            </Link>
          </div>
          <div>
            <Link href="/">
              <p className="text-sm uppercase tracking-[0.25em] text-white/60">
                React Foundation
              </p>
              <p className="text-base font-medium text-white">Official Storefront</p>
            </Link>
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm text-white/70">
          <nav className="flex items-center gap-6">
            <Link className="transition hover:text-white" href="/#featured">
              Collections
            </Link>
            <Link className="transition hover:text-white" href="/#drops">
              Limited Drops
            </Link>
            <Link className="transition hover:text-white" href="/#impact">
              Impact
            </Link>
          </nav>
          <SignInButton />
          <Button variant="glass" size="sm" className="relative px-3" type="button">
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-sky-500 text-[10px] font-bold text-white">
              0
            </span>
          </Button>
        </div>
      </div>
    </header>
  );
}
