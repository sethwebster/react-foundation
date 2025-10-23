"use client";

import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

export default function SignInPage() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams?.get("callbackUrl") || "/";

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      {/* Background gradient */}
      <div className="absolute inset-x-0 top-[-6rem] -z-10 flex justify-center blur-3xl">
        <div className="h-[24rem] w-full max-w-[60rem] bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 opacity-30" />
      </div>

      <div className="w-full max-w-md space-y-8">
        {/* Logo and Title */}
        <div className="text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-background/10 ring-1 ring-white/15">
            <Image
              src="/react-logo.svg"
              alt="React Foundation"
              width={50}
              height={50}
              className="object-contain"
            />
          </div>
          <h1 className="text-3xl font-bold text-foreground">Welcome Back</h1>
          <p className="mt-2 text-base text-foreground/70">
            Sign in to access your React Foundation account
          </p>
        </div>

        {/* Sign In Options */}
        <div className="space-y-4 rounded-3xl border border-border/10 bg-muted/60 p-8">
          {/* GitHub */}
          <button
            onClick={() => signIn("github", { callbackUrl })}
            className="group relative w-full overflow-hidden rounded-2xl border border-border/10 bg-gradient-to-r from-slate-800 to-slate-900 p-6 transition hover:border-border/20 hover:from-slate-700 hover:to-slate-800"
          >
            <div className="flex items-center justify-center gap-4">
              <svg
                className="h-6 w-6 text-foreground"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              <span className="text-lg font-semibold text-foreground">
                Continue with GitHub
              </span>
            </div>
          </button>

          {/* GitLab */}
          <button
            onClick={() => signIn("gitlab", { callbackUrl })}
            className="group relative w-full overflow-hidden rounded-2xl border border-border/10 bg-gradient-to-r from-slate-800 to-slate-900 p-6 opacity-50 transition hover:border-border/20 hover:from-slate-700 hover:to-slate-800 hover:opacity-100"
            disabled
          >
            <div className="flex items-center justify-center gap-4">
              <svg
                className="h-6 w-6 text-foreground"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M23.955 13.587l-1.342-4.135-2.664-8.189a.455.455 0 0 0-.867 0L16.418 9.45H7.582L4.919 1.263C4.783.84 4.185.84 4.05 1.263L1.386 9.452.044 13.587a.924.924 0 0 0 .331 1.03L12 23.054l11.625-8.436a.92.92 0 0 0 .33-1.031" />
              </svg>
              <span className="text-lg font-semibold text-foreground">
                Continue with GitLab
              </span>
              <span className="absolute right-3 top-3 rounded-full bg-warning/20 px-2 py-1 text-xs font-semibold text-amber-300">
                Coming Soon
              </span>
            </div>
          </button>

          <p className="mt-6 text-center text-sm text-foreground/60">
            We verify your contributions to the React ecosystem
          </p>
        </div>

        {/* Back Link */}
        <div className="text-center">
          <Link
            href="/"
            className="text-sm text-cyan-400 transition hover:text-cyan-300"
          >
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
