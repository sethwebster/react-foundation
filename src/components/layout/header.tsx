"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";

import { Button } from "@/components/ui/button";
import { MobileMenu } from "@/components/layout/mobile-menu";
import { UserAvatar } from "@/components/ui/user-avatar";
import { ThemeToggleWrapper } from "@/components/ui/theme-toggle-wrapper";

export function Header() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const isStorePage = pathname?.startsWith("/store");
  const isComingSoonPage = pathname === "/coming-soon";

  return (
    <header className="fixed left-0 right-0 top-0 z-50 bg-background/95 shadow-lg shadow-black/5 backdrop-blur-xl supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4 sm:px-8 lg:px-12">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="relative h-10 w-10 overflow-hidden">
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
              <p className="text-sm uppercase tracking-[0.25em] text-muted-foreground">
                React Foundation
              </p>
              <p className="text-base font-medium text-foreground">
                {isStorePage ? "Official Store" : "Supporting the Ecosystem"}
              </p>
            </Link>
          </div>
        </div>

        {/* Desktop Navigation (hidden on mobile) */}
        <div className={`hidden items-center gap-4 text-sm text-muted-foreground md:flex transition ${isComingSoonPage ? 'blur-sm pointer-events-none' : ''}`}>
          <nav className="flex items-center gap-6">
            {isStorePage ? (
              // Store navigation
              <>
                <Link className="transition hover:text-foreground" href="/store#featured">
                  Collections
                </Link>
                <Link className="transition hover:text-foreground" href="/store#drops">
                  Limited Drops
                </Link>
                <Link className="transition hover:text-foreground" href="/impact">
                  Impact
                </Link>
              </>
            ) : (
              // Foundation navigation
              <>
                <Link className="transition hover:text-foreground" href="/about">
                  About
                </Link>
                <Link className="transition hover:text-foreground" href="/updates">
                  Updates
                </Link>
                <Link className="transition hover:text-foreground" href="/impact">
                  Impact
                </Link>
                <Link className="transition hover:text-foreground" href="/store">
                  Store
                </Link>
              </>
            )}
          </nav>

          {/* Cart (store pages only) */}
          {isStorePage && (
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
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                0
              </span>
            </Button>
          )}

          {/* Theme Toggle */}
          <ThemeToggleWrapper />

          {/* Profile Icon or Sign In */}
          {session?.user ? (
            <UserAvatar
              user={session.user}
              size={40}
              href="/profile"
              className="transition hover:border-primary/50 hover:shadow-lg hover:shadow-primary/20"
            />
          ) : (
            <Link
              href="/api/auth/signin"
              className="rounded-full border border-border bg-primary px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary-foreground transition hover:bg-primary/90"
            >
              Sign in
            </Link>
          )}
        </div>

        {/* Mobile Menu (shows on mobile only) */}
        <div className="flex items-center gap-2 md:hidden">
          {isStorePage && (
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
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                0
              </span>
            </Button>
          )}
          <MobileMenu session={session} />
        </div>
      </div>
    </header>
  );
}
