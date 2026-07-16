"use client";

import { useEffect } from "react";

import {
  PageIntro,
  PublicPageShell,
  Section,
} from "@/components/public-site/layout";
import { Button, ButtonLink } from "@/components/ui/button";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global error:", error);
  }, [error]);

  return (
    <PublicPageShell>
      <main>
        <Section className="py-20 sm:py-28">
          <PageIntro
            eyebrow="Something went wrong"
            title="We could not load this page"
            description="Try the request again. If the problem continues, return to the foundation home page."
            actions={
              <>
                <Button type="button" onClick={reset}>
                  Try again
                </Button>
                <ButtonLink href="/" variant="secondary">
                  Go home
                </ButtonLink>
              </>
            }
          />
          {process.env.NODE_ENV === "development" ? (
            <details className="mx-auto mt-10 max-w-2xl rounded-card border border-border bg-muted p-5 text-sm">
              <summary className="cursor-pointer font-semibold text-foreground">
                Development error details
              </summary>
              <pre className="mt-4 overflow-auto whitespace-pre-wrap text-xs text-muted-foreground">
                {error.message}
                {error.digest ? `\nDigest: ${error.digest}` : ""}
              </pre>
            </details>
          ) : null}
        </Section>
      </main>
    </PublicPageShell>
  );
}
