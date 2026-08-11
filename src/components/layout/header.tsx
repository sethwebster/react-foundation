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
import { cn } from "@/lib/cn";

const NAV_ITEMS = [
  { href: "/updates", label: "News" },
  { href: "/about", label: "About" },
  { href: "/impact", label: "Impact" },
  { href: "/communities", label: "Communities" },
] as const;

export function Header() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [isAdmin, setIsAdmin] = useState(false);
  const isComingSoonPage = pathname === "/coming-soon";

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

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
      <div className="mx-auto flex h-full w-full foundation-measure-standard items-center justify-between px-[var(--foundation-page-gutter)]">
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
          <span className="whitespace-nowrap text-sm font-semibold tracking-[-0.01em] text-foreground">
            The React Foundation
          </span>
        </Link>

        {/* Desktop Navigation (hidden on mobile) */}
        <div className={`hidden items-center gap-1.5 md:flex transition ${isComingSoonPage ? 'blur-sm pointer-events-none' : ''}`}>
          <nav className="flex items-center gap-0.5">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive(item.href) ? "page" : undefined}
                className={cn(
                  "rounded-full px-3 py-1.5 text-[0.8125rem] transition hover:bg-muted",
                  isActive(item.href)
                    ? "font-medium text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {item.label}
              </Link>
            ))}
            {isAdmin && (
              <Link
                className="rounded-full px-2.5 py-1.5 text-[0.8125rem] font-medium text-destructive transition hover:bg-muted"
                href="/admin"
                title="Admin Panel"
              >
                ⚙️
              </Link>
            )}
          </nav>

          {/* Theme Toggle */}
          <span className="mx-1 h-5 w-px bg-border" aria-hidden />
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
