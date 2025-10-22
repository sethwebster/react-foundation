import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Repos",
  description: "View your repository contributions.",
};

export default function ReposPage() {
  return (
    <div className="space-y-8 pt-12">
      <div>
        <h1 className="text-4xl font-bold text-foreground">Repos</h1>
        <p className="mt-2 text-base text-foreground/70">
          Your repository contributions across the React ecosystem.
        </p>
      </div>

      <div className="rounded-3xl border border-border/10 bg-muted/60 p-12 text-center">
        <div className="mx-auto max-w-md space-y-4">
          <svg
            className="mx-auto h-16 w-16 text-foreground/20"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h2 className="text-xl font-semibold text-foreground">Coming Soon</h2>
          <p className="text-sm text-foreground/60">
            Detailed repository contribution tracking and analytics will be available soon.
          </p>
        </div>
      </div>
    </div>
  );
}
