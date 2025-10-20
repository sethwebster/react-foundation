"use client";

import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Footer } from "@/components/layout/footer";

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <p className="text-white/60">Loading...</p>
      </div>
    );
  }

  if (!session?.user) {
    redirect("/api/auth/signin");
  }

  return (
    <>
      <div className="min-h-screen bg-slate-950 pt-24 text-slate-100">
        <div className="absolute inset-x-0 top-[-6rem] -z-10 flex justify-center blur-3xl">
          <div className="h-[24rem] w-full max-w-[60rem] bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 opacity-30" />
        </div>

        <div className="mx-auto flex max-w-7xl gap-8 px-6 pb-24 sm:px-8 lg:px-12">
        {/* Left Sidebar */}
        <aside className="hidden w-64 shrink-0 lg:block">
          <div className="sticky top-24 space-y-6">
            {/* Profile Card */}
            <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-6">
              <div className="flex flex-col items-center gap-4 text-center">
                <div className="relative h-20 w-20 overflow-hidden rounded-full border-4 border-white/20">
                  {session.user.image ? (
                    <Image
                      src={session.user.image}
                      alt={session.user.name || "User"}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-cyan-400 to-indigo-500 text-2xl font-bold text-white">
                      {session.user.name?.charAt(0) || "U"}
                    </div>
                  )}
                </div>
                <div>
                  <h2 className="font-semibold text-white">{session.user.name}</h2>
                  <p className="text-sm text-white/60">{session.user.email}</p>
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
      </div>

      <Footer />
    </>
  );
}
