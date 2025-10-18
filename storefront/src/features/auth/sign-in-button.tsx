"use client";

import { signIn, signOut, useSession } from "next-auth/react";

export function SignInButton() {
  const { data: session, status } = useSession();

  const isLoading = status === "loading";
  const isAuthenticated = status === "authenticated" && Boolean(session?.user);

  if (isLoading) {
    return (
      <button
        className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white/40"
        type="button"
        disabled
      >
        Loading…
      </button>
    );
  }

  if (isAuthenticated) {
    return (
      <button
        type="button"
        onClick={() => signOut()}
        className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white transition hover:border-white/30 hover:bg-white/20"
      >
        Sign out
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => signIn("github")}
      className="rounded-full border border-white/10 bg-sky-500/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white transition hover:bg-sky-400"
    >
      Sign in with GitHub
    </button>
  );
}
