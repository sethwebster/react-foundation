"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { UserAvatar } from "@/components/ui/user-avatar";

export function ProfileLayoutClient({
  children,
  isAdmin,
}: {
  children: React.ReactNode;
  isAdmin: boolean;
}) {
  const { data: session } = useSession();

  if (!session?.user) {
    return null;
  }

  return (
    <div className="mx-auto flex max-w-7xl gap-8 px-6 pb-24 sm:px-8 lg:px-12">
      {/* Left Sidebar */}
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
  );
}
