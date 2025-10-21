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
          <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-6">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="relative">
                <UserAvatar user={session.user} size={80} />
                {isAdmin && (
                  <div className="absolute -right-1 -top-1 flex h-8 w-8 items-center justify-center rounded-full bg-yellow-500 text-lg shadow-lg">
                    👑
                  </div>
                )}
              </div>
              <div>
                <h2 className="font-semibold text-white">{session.user.name}</h2>
                <p className="text-sm text-white/60">{session.user.email}</p>
                {isAdmin && (
                  <span className="mt-1 inline-block rounded bg-purple-500/20 px-2 py-0.5 text-xs font-semibold text-purple-300">
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
              className="block rounded-xl px-4 py-3 text-sm font-medium text-white/70 transition hover:bg-white/5 hover:text-white"
            >
              Profile
            </Link>
            <Link
              href="/profile/contributor-status"
              className="block rounded-xl px-4 py-3 text-sm font-medium text-white/70 transition hover:bg-white/5 hover:text-white"
            >
              Contributor Status
            </Link>
            <Link
              href="/profile/repos"
              className="block rounded-xl px-4 py-3 text-sm font-medium text-white/70 transition hover:bg-white/5 hover:text-white"
            >
              Repos
            </Link>
            {isAdmin && (
              <Link
                href="/admin/users"
                className="block rounded-xl border-2 border-purple-500/30 bg-purple-500/10 px-4 py-3 text-sm font-medium text-purple-300 transition hover:border-purple-500/50 hover:bg-purple-500/20"
              >
                👑 Admin Panel
              </Link>
            )}
          </nav>

          {/* Sign Out */}
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="w-full rounded-xl border border-white/10 px-4 py-3 text-center text-sm font-medium text-white/70 transition hover:border-red-400/30 hover:bg-red-500/10 hover:text-red-300"
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
