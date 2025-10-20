import type { Metadata } from "next";
import { getServerAuthSession } from "@/lib/auth";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Profile",
  description: "Your React Foundation profile.",
};

export default async function ProfilePage() {
  const session = await getServerAuthSession();

  return (
    <div className="space-y-8 pt-12">
      <div>
        <h1 className="text-4xl font-bold text-white">Profile</h1>
        <p className="mt-2 text-base text-white/70">
          Manage your React Foundation account and preferences.
        </p>
      </div>

      <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-8">
        <h2 className="text-2xl font-semibold text-white">Account Information</h2>
        <div className="mt-6 space-y-4">
          <div>
            <p className="text-sm text-white/60">Name</p>
            <p className="text-base text-white">
              {session?.user?.name || "Not set"}
              {session?.user?.githubLogin && (
                <>
                  {" "}(
                  <a
                    href={`https://github.com/${session.user.githubLogin}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-cyan-400 hover:text-cyan-300 hover:underline"
                  >
                    @{session.user.githubLogin}
                  </a>
                  )
                </>
              )}
            </p>
          </div>
          <div>
            <p className="text-sm text-white/60">Email</p>
            <p className="text-base text-white">{session?.user?.email || "Not set"}</p>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="grid gap-4 sm:grid-cols-2 lg:hidden">
        <Link
          href="/profile/contributor-status"
          className="rounded-2xl border border-white/10 bg-slate-900/60 p-6 transition hover:border-white/20 hover:bg-slate-900/80"
        >
          <h3 className="font-semibold text-white">Contributor Status</h3>
          <p className="mt-2 text-sm text-white/60">View your contributions and tier</p>
        </Link>
        <Link
          href="/profile/repos"
          className="rounded-2xl border border-white/10 bg-slate-900/60 p-6 transition hover:border-white/20 hover:bg-slate-900/80"
        >
          <h3 className="font-semibold text-white">Repos</h3>
          <p className="mt-2 text-sm text-white/60">See your repository activity</p>
        </Link>
      </div>

      {/* Mobile Sign Out */}
      <div className="lg:hidden">
        <Link
          href="/api/auth/signout"
          className="block rounded-xl border border-white/10 px-4 py-3 text-center text-base font-medium text-white/70 transition hover:border-red-400/30 hover:bg-red-500/10 hover:text-red-300"
        >
          Sign Out
        </Link>
      </div>
    </div>
  );
}
