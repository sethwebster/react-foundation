"use client";

import { signIn, signOut, useSession } from "next-auth/react";

export function SignInButton() {
  const { data: session, status } = useSession();

  const isLoading = status === "loading";
  const isAuthenticated = status === "authenticated" && Boolean(session?.user);

  if (isLoading) {
    return (
      <button
        className="rounded-full border border-border/10 bg-background/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-foreground/40"
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
        className="rounded-full border border-border/10 bg-background/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-foreground transition hover:border-border/30 hover:bg-background/20"
      >
        Sign out
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => signIn("github")}
      className="rounded-full border border-border/10 bg-primary/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-foreground transition hover:bg-primary/50"
    >
      Sign in with GitHub
    </button>
  );
}
