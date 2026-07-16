"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";

import { ButtonLink } from "@/components/ui/button";
import { MobileMenu } from "@/components/layout/mobile-menu";
import { UserAvatar } from "@/components/ui/user-avatar";
import { ThemeToggleWrapper } from "@/components/ui/theme-toggle-wrapper";

export function Header() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [isAdmin, setIsAdmin] = useState(false);
  const isStorePage = pathname?.startsWith("/store");
  const isComingSoonPage = pathname === "/coming-soon";

  // Check admin status when user session changes
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!session?.user?.email) {
        setIsAdmin(false);
        return;
      }

      try {
        const response = await fetch('/api/admin/check');
        if (response.ok) {
          const data = await response.json();
          setIsAdmin(data.isAdmin);
        } else {
          setIsAdmin(false);
        }
      } catch (error) {
        console.error('Failed to check admin status:', error);
        setIsAdmin(false);
      }
    };

    checkAdminStatus();
  }, [session?.user?.email]);

  return (
    <header className="fixed inset-x-0 top-0 z-[1000] h-[var(--foundation-header-height)] border-b border-border/70 bg-background/92 backdrop-blur-xl supports-[backdrop-filter]:bg-background/82">
      <div
        className={`mx-auto flex h-full w-full items-center justify-between px-5 sm:px-6 ${
          isStorePage ? "max-w-6xl" : "max-w-[48rem]"
        }`}
      >
        {/* Logo */}
        <Link href="/" className="flex min-h-11 items-center gap-2.5">
          <span className="relative h-6 w-6 shrink-0">
              <Image
                src="/react-logo.svg"
                alt="React Foundation logo"
                fill
                sizes="24px"
                className="object-contain brightness-0 dark:invert"
                priority
              />
          </span>
          <span className="whitespace-nowrap text-[0.8125rem] font-semibold tracking-[-0.01em] text-foreground sm:text-sm">
            {isStorePage ? "React Foundation Store" : "The React Foundation"}
          </span>
        </Link>

        {/* Desktop Navigation (hidden on mobile) */}
        <div className={`hidden items-center gap-2.5 text-[0.8125rem] text-muted-foreground md:flex transition ${isComingSoonPage ? 'blur-sm pointer-events-none' : ''}`}>
          <nav className="flex items-center gap-5">
            {isStorePage ? (
              // Store navigation
              <>
                <Link className="transition hover:text-foreground" href="/store/collections">
                  Collections
                </Link>
                <Link className="transition hover:text-foreground" href="/about">
                  About
                </Link>
                <Link className="transition hover:text-foreground" href="/impact">
                  Impact
                </Link>
              </>
            ) : (
              // Foundation navigation
              <>
                <Link className="transition hover:text-foreground" href="/updates">
                  News
                </Link>
                <Link className="transition hover:text-foreground" href="/about">
                  About
                </Link>
                <Link className="transition hover:text-foreground" href="/impact">
                  Impact
                </Link>
                <Link className="transition hover:text-foreground" href="/communities">
                  Communities
                </Link>
                {isAdmin && (
                  <Link
                    className="transition hover:text-foreground text-destructive font-medium"
                    href="/admin"
                    title="Admin Panel"
                  >
                    ⚙️
                  </Link>
                )}
              </>
            )}
          </nav>

          {/* Theme Toggle */}
          <ThemeToggleWrapper />

          {/* Profile Icon or Sign In */}
          {session?.user ? (
            <UserAvatar
              user={session.user}
              size={34}
              href="/profile"
              className="transition hover:border-primary/50"
            />
          ) : (
            <ButtonLink
              href="/auth/signin"
              variant="tertiary"
              size="xs"
              className="border px-3.5 font-medium"
            >
              Sign in
            </ButtonLink>
          )}
        </div>

        {/* Mobile Menu (shows on mobile only) */}
        <div className="flex items-center gap-1 md:hidden">
          <ThemeToggleWrapper />
          {!session?.user ? (
            <ButtonLink
              href="/auth/signin"
              variant="tertiary"
              size="xs"
              className="border px-3 font-medium"
            >
              Sign in
            </ButtonLink>
          ) : null}
          <MobileMenu session={session} />
        </div>
      </div>
    </header>
  );
}
