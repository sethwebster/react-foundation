import type { Metadata } from "next";
import { MaintainerProgress } from "@/features/maintainer-progress/maintainer-progress";
import { MaintainerProgressProvider } from "@/features/maintainer-progress/context";

export const metadata: Metadata = {
  title: "Contributor Status",
  description: "View your contributor status and ecosystem contributions.",
};

export default function ContributorStatusPage() {
  return (
    <div className="space-y-8 pt-12">
      <div>
        <h1 className="text-4xl font-bold text-white">Contributor Status</h1>
        <p className="mt-2 text-base text-white/70">
          Your contributions across 54 React ecosystem libraries.
        </p>
      </div>

      <MaintainerProgressProvider>
        <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-8">
          <MaintainerProgress />
        </div>
      </MaintainerProgressProvider>
    </div>
  );
}
