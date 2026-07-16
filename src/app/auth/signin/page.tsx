"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";

import {
  PageIntro,
  PublicPageShell,
  Section,
  Surface,
} from "@/components/public-site/layout";

export default function SignInPage() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams?.get("callbackUrl") || "/";

  return (
    <PublicPageShell>
      <main>
        <Section className="py-16 sm:py-24">
          <PageIntro
            eyebrow="Contributor access"
            title="Sign in to the React Foundation"
            description="Use GitHub to manage your profile and access contributor tools."
          />

          <Surface className="mx-auto mt-10 max-w-[28rem] p-6 sm:p-8">
            <button
              type="button"
              onClick={() => signIn("github", { callbackUrl })}
              className="flex min-h-12 w-full items-center justify-center gap-3 rounded-control bg-[#24292f] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#32383f] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              <GitHubMark />
              Continue with GitHub
            </button>
            <p className="mt-5 text-center text-sm leading-6 text-muted-foreground">
              Authentication is used only for account and contributor features.
            </p>
          </Surface>

          <p className="mt-8 text-center text-sm">
            <Link
              href="/"
              className="text-muted-foreground underline-offset-4 transition hover:text-foreground hover:underline"
            >
              Back to the foundation
            </Link>
          </p>
        </Section>
      </main>
    </PublicPageShell>
  );
}

function GitHubMark() {
  return (
    <svg
      aria-hidden
      className="h-5 w-5"
      fill="currentColor"
      viewBox="0 0 24 24"
    >
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.44 9.8 8.21 11.39.6.11.79-.26.79-.58v-2.23c-3.34.72-4.03-1.42-4.03-1.42-.55-1.39-1.33-1.76-1.33-1.76-1.09-.74.08-.73.08-.73 1.21.09 1.84 1.24 1.84 1.24 1.07 1.83 2.81 1.3 3.49 1 .11-.78.42-1.31.76-1.61-2.66-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.52.12-3.18 0 0 1.01-.32 3.3 1.23A11.5 11.5 0 0 1 12 6.8c1.02 0 2.05.14 3.01.4 2.29-1.55 3.3-1.23 3.3-1.23.65 1.66.24 2.88.12 3.18.77.84 1.24 1.91 1.24 3.22 0 4.61-2.81 5.62-5.48 5.92.43.37.82 1.1.82 2.22v3.3c0 .32.19.69.8.58A12 12 0 0 0 12 0Z" />
    </svg>
  );
}
