"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";

import { Button } from "@/components/ui/button";
import { ReactAtom } from "@/components/ui/react-atom";
import { MobileMenu } from "@/components/layout/mobile-menu";
import { UserAvatar } from "@/components/ui/user-avatar";
import { ThemeToggleWrapper } from "@/components/ui/theme-toggle-wrapper";

type NavLink = { href: string; label: string };

const FOUNDATION_LINKS: NavLink[] = [
  { href: "/updates", label: "News" },
  { href: "/about", label: "About" },
  { href: "/impact", label: "Impact" },
  { href: "/communities", label: "Communities" },
];

const STORE_LINKS: NavLink[] = [
  { href: "/store#featured", label: "Collections" },
  { href: "/store#drops", label: "Limited Drops" },
  { href: "/impact", label: "Impact" },
];

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
        const response = await fetch("/api/admin/check");
        if (response.ok) {
          const data = await response.json();
          setIsAdmin(data.isAdmin);
        } else {
          setIsAdmin(false);
        }
      } catch (error) {
        console.error("Failed to check admin status:", error);
        setIsAdmin(false);
      }
    };

    checkAdminStatus();
  }, [session?.user?.email]);

  const links = isStorePage ? STORE_LINKS : FOUNDATION_LINKS;

  const isActive = (href: string) => {
    const base = href.split("#")[0];
    if (!base || base === "/") return false;
    return pathname === base || pathname?.startsWith(`${base}/`);
  };

  return (
    <header className="fixed left-0 right-0 top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/70">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4 sm:px-8 lg:px-12">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5">
          <ReactAtom className="h-6 w-6 text-foreground" strokeWidth={1.1} />
          <span className="text-base font-semibold tracking-tight text-foreground">
            {isStorePage ? "The React Foundation Store" : "The React Foundation"}
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div
          className={`hidden items-center gap-8 md:flex ${
            isComingSoonPage ? "pointer-events-none blur-sm" : ""
          }`}
        >
          <nav className="flex items-center gap-8 text-sm">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`transition-colors hover:text-foreground ${
                  isActive(link.href)
                    ? "font-medium text-foreground"
                    : "text-muted-foreground"
                }`}
              >
                {link.label}
              </Link>
            ))}
            {isAdmin && (
              <Link
                className="font-medium text-destructive transition-colors hover:text-destructive/80"
                href="/admin"
                title="Admin Panel"
              >
                Admin
              </Link>
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

          <div className="flex items-center gap-3">
            <ThemeToggleWrapper />

            {session?.user ? (
              <UserAvatar
                user={session.user}
                size={36}
                href="/profile"
                className="transition hover:border-primary/50"
              />
            ) : (
              <Link
                href="/api/auth/signin"
                className="rounded-full border border-border bg-background px-4 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                Sign in
              </Link>
            )}
          </div>
        </div>

        {/* Mobile controls */}
        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggleWrapper />
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
