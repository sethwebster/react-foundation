"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { UserAvatar } from "@/components/ui/user-avatar";
import { RFDS } from "@/components/rfds";

export function ProfileLayoutClient({
  children,
  isAdmin,
}: {
  children: React.ReactNode;
  isAdmin: boolean;
}) {
  const { data: session } = useSession();
  const [mobileMenuExpanded, setMobileMenuExpanded] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMobileMenuExpanded(false);
      }
    };

    if (mobileMenuExpanded) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [mobileMenuExpanded]);

  if (!session?.user) {
    return null;
  }

  return (
    <div className="mx-auto max-w-7xl px-6 pb-24 sm:px-8 lg:px-12">
      {/* Mobile Profile Card */}
      <div ref={menuRef} className="relative mb-6 overflow-hidden rounded-2xl border border-border/10 bg-muted/60 lg:hidden">
        {/* Profile Header - Always Visible */}
        <button
          onClick={() => setMobileMenuExpanded(!mobileMenuExpanded)}
          className={`flex w-full items-center gap-4 p-6 text-left transition-all duration-300 hover:bg-muted/40 ${
            mobileMenuExpanded ? 'rounded-t-2xl' : 'rounded-2xl'
          }`}
          aria-expanded={mobileMenuExpanded}
          aria-label={mobileMenuExpanded ? "Collapse profile menu" : "Expand profile menu"}
        >
          <div className="relative">
            <UserAvatar user={session.user} size={60} />
            {isAdmin && (
              <div className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-warning text-sm shadow-lg">
                👑
              </div>
            )}
          </div>
          <div className="flex-1">
            <h2 className="font-semibold text-foreground">{session.user.name}</h2>
            <p className="text-sm text-foreground/60">{session.user.email}</p>
            {isAdmin && (
              <span className="mt-1 inline-block rounded bg-accent/20 px-2 py-0.5 text-xs font-semibold text-purple-300">
                Admin
              </span>
            )}
          </div>
          {/* Expand/Collapse Icon */}
          <svg
            className={`h-5 w-5 text-muted-foreground transition-transform duration-300 ${mobileMenuExpanded ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Mobile Navigation - Slide out drawer */}
        <RFDS.AccordionContent isOpen={mobileMenuExpanded}>
          <nav className="space-y-2 px-6 pb-6 pt-2">
              <Link
                href="/profile"
                onClick={() => setMobileMenuExpanded(false)}
                className="block rounded-xl px-4 py-3 text-sm font-medium text-foreground/70 transition hover:bg-background/5 hover:text-foreground"
              >
                Profile
              </Link>
              <Link
                href="/profile/contributor-status"
                onClick={() => setMobileMenuExpanded(false)}
                className="block rounded-xl px-4 py-3 text-sm font-medium text-foreground/70 transition hover:bg-background/5 hover:text-foreground"
              >
                Contributor Status
              </Link>
              <Link
                href="/profile/repos"
                onClick={() => setMobileMenuExpanded(false)}
                className="block rounded-xl px-4 py-3 text-sm font-medium text-foreground/70 transition hover:bg-background/5 hover:text-foreground"
              >
                Repos
              </Link>
              {isAdmin && (
                <Link
                  href="/admin/users"
                  onClick={() => setMobileMenuExpanded(false)}
                  className="block rounded-xl border-2 border-accent/30 bg-accent/10 px-4 py-3 text-sm font-medium text-purple-300 transition hover:border-accent/50 hover:bg-accent/20"
                >
                  👑 Admin Panel
                </Link>
              )}
              <div className="border-t border-border/10 pt-2">
                <button
                  onClick={() => {
                    setMobileMenuExpanded(false);
                    signOut({ callbackUrl: "/" });
                  }}
                  className="w-full rounded-xl border border-border/10 px-4 py-3 text-left text-sm font-medium text-foreground/70 transition hover:border-red-400/30 hover:bg-destructive/10 hover:text-red-300"
                >
                  Sign Out
                </button>
              </div>
          </nav>
        </RFDS.AccordionContent>
      </div>

      <div className="flex gap-8">
        {/* Left Sidebar - Desktop Only */}
        <aside className="hidden w-64 shrink-0 lg:block">
        <div className="sticky top-24 space-y-6">
          {/* Profile Card */}
          <div className="rounded-2xl border border-border/10 bg-muted/60 p-6">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="relative">
                <UserAvatar user={session.user} size={80} />
                {isAdmin && (
                  <div className="absolute -right-1 -top-1 flex h-8 w-8 items-center justify-center rounded-full bg-warning text-lg shadow-lg">
                    👑
                  </div>
                )}
              </div>
              <div>
                <h2 className="font-semibold text-foreground">{session.user.name}</h2>
                <p className="text-sm text-foreground/60">{session.user.email}</p>
                {isAdmin && (
                  <span className="mt-1 inline-block rounded bg-accent/20 px-2 py-0.5 text-xs font-semibold text-purple-300">
                    Admin
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="space-y-2">
            <Link
              href="/profile"
              className="block rounded-xl px-4 py-3 text-sm font-medium text-foreground/70 transition hover:bg-background/5 hover:text-foreground"
            >
              Profile
            </Link>
            <Link
              href="/profile/contributor-status"
              className="block rounded-xl px-4 py-3 text-sm font-medium text-foreground/70 transition hover:bg-background/5 hover:text-foreground"
            >
              Contributor Status
            </Link>
            <Link
              href="/profile/repos"
              className="block rounded-xl px-4 py-3 text-sm font-medium text-foreground/70 transition hover:bg-background/5 hover:text-foreground"
            >
              Repos
            </Link>
            {isAdmin && (
              <Link
                href="/admin/users"
                className="block rounded-xl border-2 border-accent/30 bg-accent/10 px-4 py-3 text-sm font-medium text-purple-300 transition hover:border-accent/50 hover:bg-accent/20"
              >
                👑 Admin Panel
              </Link>
            )}
          </nav>

          {/* Sign Out */}
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="w-full rounded-xl border border-border/10 px-4 py-3 text-center text-sm font-medium text-foreground/70 transition hover:border-red-400/30 hover:bg-destructive/10 hover:text-red-300"
          >
            Sign Out
          </button>
        </div>
      </aside>

        {/* Main Content */}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
