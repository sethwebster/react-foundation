"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import type { Session } from "next-auth";

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
        className="flex h-10 w-10 items-center justify-center rounded-full transition hover:bg-white/5"
        aria-label="Menu"
      >
        {session?.user ? (
          // Profile icon
          <div className="relative h-8 w-8 overflow-hidden rounded-full border-2 border-white/20">
            {session.user.image ? (
              <Image
                src={session.user.image}
                alt={session.user.name || "User"}
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-cyan-400 to-indigo-500 text-xs font-bold text-white">
                {session.user.name?.charAt(0) || session.user.email?.charAt(0) || "U"}
              </div>
            )}
          </div>
        ) : (
          // Hamburger icon
          <svg
            className="h-6 w-6 text-white"
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
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          onClick={closeMenu}
        />
      )}

      {/* Menu Panel - Only render on mobile, slide from right */}
      {isOpen && (
        <div
          className="fixed right-0 top-0 z-50 min-h-screen w-80 max-w-[90vw] animate-in slide-in-from-right border-l border-white/10 shadow-2xl md:hidden"
          style={{ backgroundColor: '#0f172a' }}
        >
        <div className="flex flex-col" style={{ backgroundColor: '#0f172a' }}>
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 p-6" style={{ backgroundColor: '#0f172a' }}>
            <div className="flex items-center gap-3">
              <div className="relative h-8 w-8 overflow-hidden rounded-full bg-white/10 ring-1 ring-white/15">
                <Image
                  src="/react-logo.svg"
                  alt="React Foundation"
                  fill
                  className="object-contain p-1"
                />
              </div>
              <span className="text-sm font-semibold text-white">Menu</span>
            </div>
            <button
              onClick={closeMenu}
              className="flex h-10 w-10 items-center justify-center rounded-full transition hover:bg-white/5"
              aria-label="Close menu"
            >
              <svg
                className="h-6 w-6 text-white/70"
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
              className="block border-b border-white/10 p-6 transition hover:bg-white/5"
              style={{ backgroundColor: '#0f172a' }}
            >
              <div className="flex items-center gap-3">
                <div className="relative h-12 w-12 overflow-hidden rounded-full border-2 border-white/20">
                  {session.user.image ? (
                    <Image
                      src={session.user.image}
                      alt={session.user.name || "User"}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-cyan-400 to-indigo-500 text-lg font-bold text-white">
                      {session.user.name?.charAt(0) || "U"}
                    </div>
                  )}
                </div>
                <div>
                  <p className="font-semibold text-white">{session.user.name}</p>
                  <p className="text-xs text-white/60">{session.user.email}</p>
                  <p className="mt-1 text-xs text-cyan-400">View Profile →</p>
                </div>
              </div>
            </Link>
          )}

          {/* Navigation Links */}
          <nav className="p-6" style={{ backgroundColor: '#0f172a' }}>
            <div className="space-y-2">
              {navigationLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={closeMenu}
                  className="block rounded-xl px-4 py-3 text-base font-medium text-white/80 transition hover:bg-white/5 hover:text-white"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Divider */}
            <div className="my-6 border-t border-white/10" />

            {/* Additional Links */}
            <div className="space-y-2">
              {session?.user && (
                <Link
                  href="/api/auth/signout"
                  onClick={closeMenu}
                  className="block rounded-xl px-4 py-3 text-base font-medium text-white/60 transition hover:bg-white/5 hover:text-white"
                >
                  Sign Out
                </Link>
              )}
              {!session?.user && (
                <Link
                  href="/api/auth/signin"
                  onClick={closeMenu}
                  className="block rounded-xl bg-sky-500/80 px-4 py-3 text-center text-base font-semibold text-white transition hover:bg-sky-400"
                >
                  Sign in with GitHub
                </Link>
              )}
            </div>
          </nav>

          {/* Footer */}
          <div className="border-t border-white/10 p-6" style={{ backgroundColor: '#0f172a' }}>
            <p className="text-xs text-white/50">
              © {new Date().getFullYear()} React Foundation
            </p>
          </div>
        </div>
        </div>
      )}
    </>
  );
}
