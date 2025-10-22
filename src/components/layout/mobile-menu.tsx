"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import type { Session } from "next-auth";
import { ThemeToggleWrapper } from "@/components/ui/theme-toggle-wrapper";

interface MobileMenuProps {
  session: Session | null;
}

export function MobileMenu({ session }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  const isStorePage = pathname?.startsWith("/store");

  const navigationLinks = isStorePage
    ? [
        { href: "/store#featured", label: "Collections" },
        { href: "/store#drops", label: "Limited Drops" },
        { href: "/impact", label: "Impact" },
      ]
    : [
        { href: "/about", label: "About" },
        { href: "/updates", label: "Updates" },
        { href: "/impact", label: "Impact" },
        { href: "/store", label: "Store" },
      ];

  return (
    <>
      {/* Menu Button */}
      <button
        onClick={toggleMenu}
        className="flex h-10 w-10 items-center justify-center rounded-full transition hover:bg-muted"
        aria-label={isOpen ? "Close menu" : "Open menu"}
        aria-expanded={isOpen}
      >
        {session?.user ? (
          // Profile icon
          <div className="relative h-8 w-8 overflow-hidden rounded-full border-2 border-border">
            {session.user.image ? (
              <Image
                src={session.user.image}
                alt={session.user.name || "User"}
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary to-primary/80 text-xs font-bold text-primary-foreground">
                {session.user.name?.charAt(0) || session.user.email?.charAt(0) || "U"}
              </div>
            )}
          </div>
        ) : (
          // Hamburger icon
          <svg
            className="h-6 w-6 text-foreground"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
            />
          </svg>
        )}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/50 backdrop-blur-sm"
          onClick={closeMenu}
        />
      )}

      {/* Menu Panel - Only render on mobile, slide from right */}
      {isOpen && (
        <div
          className="fixed right-0 top-0 z-50 min-h-screen w-80 max-w-[90vw] animate-in slide-in-from-right border-l border-border bg-background shadow-2xl md:hidden"
        >
        <div className="flex flex-col bg-background">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border p-6 bg-background">
            <div className="flex items-center gap-3">
              <div className="relative h-8 w-8 overflow-hidden rounded-full bg-muted ring-1 ring-border">
                <Image
                  src="/react-logo.svg"
                  alt="React Foundation"
                  fill
                  className="object-contain p-1"
                />
              </div>
              <span className="text-sm font-semibold text-foreground">Menu</span>
            </div>
            <button
              onClick={closeMenu}
              className="flex h-10 w-10 items-center justify-center rounded-full transition hover:bg-muted"
              aria-label="Close menu"
            >
              <svg
                className="h-6 w-6 text-muted-foreground"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* User Info (if logged in) */}
          {session?.user && (
            <Link
              href="/profile"
              onClick={closeMenu}
              className="block border-b border-border p-6 transition hover:bg-muted"
            >
              <div className="flex items-center gap-3">
                <div className="relative h-12 w-12 overflow-hidden rounded-full border-2 border-border">
                  {session.user.image ? (
                    <Image
                      src={session.user.image}
                      alt={session.user.name || "User"}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary to-primary/80 text-lg font-bold text-primary-foreground">
                      {session.user.name?.charAt(0) || "U"}
                    </div>
                  )}
                </div>
                <div>
                  <p className="font-semibold text-foreground">{session.user.name}</p>
                  <p className="text-xs text-muted-foreground">{session.user.email}</p>
                  <p className="mt-1 text-xs text-primary">View Profile →</p>
                </div>
              </div>
            </Link>
          )}

          {/* Navigation Links */}
          <nav className="p-6">
            <div className="space-y-2">
              {navigationLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={closeMenu}
                  className="block rounded-xl px-4 py-3 text-base font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Divider */}
            <div className="my-6 border-t border-border" />

            {/* Theme Toggle */}
            <div className="mb-4">
              <ThemeToggleWrapper withLabel />
            </div>

            {/* Additional Links */}
            <div className="space-y-2">
              {session?.user && (
                <button
                  onClick={() => {
                    closeMenu();
                    signOut({ callbackUrl: "/" });
                  }}
                  className="w-full rounded-xl px-4 py-3 text-left text-base font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
                >
                  Sign Out
                </button>
              )}
              {!session?.user && (
                <Link
                  href="/api/auth/signin"
                  onClick={closeMenu}
                  className="block rounded-xl bg-primary px-4 py-3 text-center text-base font-semibold text-primary-foreground transition hover:bg-primary/90"
                >
                  Sign in with GitHub
                </Link>
              )}
            </div>
          </nav>

          {/* Footer */}
          <div className="border-t border-border p-6">
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} React Foundation
            </p>
          </div>
        </div>
        </div>
      )}
    </>
  );
}
