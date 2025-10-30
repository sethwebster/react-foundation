import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { ecosystemLibraries } from "@/lib/maintainer-tiers";
import { LibraryCard } from "@/components/ui/library-card";
import { libraryDisplayNames } from "@/lib/library-icons";
import { type LibraryScore } from "@/lib/ris";

interface EcosystemLibrariesProps {
  id?: string;
  title?: string;
  description?: string;
  risScores?: LibraryScore[]; // Optional RIS scores
  showRIS?: boolean; // Whether to display RIS scores
}

export function EcosystemLibraries({
  id = "libraries",
  title = "Supported Ecosystem",
  description,
  risScores,
  showRIS = false,
}: EcosystemLibrariesProps) {
  // Create a map of library names to RIS scores for quick lookup
  const risScoreMap = risScores
    ? new Map(risScores.map((score) => [score.repo, score.ris]))
    : new Map();
  
  // Use dynamic count from ecosystemLibraries if description not provided
  const libraryCount = ecosystemLibraries.length;
  const defaultDescription = `We track contributions across all ${libraryCount} critical React ecosystem libraries:`;
  const displayDescription = description || defaultDescription;
  // Group libraries by category
  const categorizedLibraries = [
    {
      name: "Core React",
      category: "core" as const,
    },
    {
      name: "State Management",
      category: "state" as const,
    },
    {
      name: "Data Fetching",
      category: "data" as const,
    },
    {
      name: "Routing",
      category: "routing" as const,
    },
    {
      name: "Meta-Frameworks",
      category: "framework" as const,
    },
    {
      name: "Forms & Validation",
      category: "forms" as const,
    },
    {
      name: "Testing",
      category: "testing" as const,
    },
    {
      name: "UI Components",
      category: "ui" as const,
    },
    {
      name: "Animation",
      category: "animation" as const,
    },
    {
      name: "Dev Tools & Bundling",
      category: "tooling" as const,
    },
    {
      name: "Data Tables",
      category: "tables" as const,
    },
    {
      name: "Styling",
      category: "styling" as const,
    },
  ];

  return (
    <ScrollReveal animation="scale">
      <section
        id={id}
        className="scroll-mt-32 space-y-8 rounded-3xl border border-border/10 bg-muted/60 p-12"
      >
        <h2 className="text-3xl font-semibold text-foreground sm:text-4xl">{title}</h2>
        <p className="max-w-3xl text-lg text-foreground/70">{displayDescription}</p>

        <div className="space-y-8 pt-6">
          {categorizedLibraries.map((cat) => {
            const libs = ecosystemLibraries.filter((l) => l.category === cat.category);
            if (libs.length === 0) return null;

            return (
              <div key={cat.category}>
                <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-foreground/60">
                  {cat.name} · {libs.length} {libs.length === 1 ? "library" : "libraries"}
                </h3>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {libs.map((lib, idx) => (
                    <LibraryCard
                      key={lib.name}
                      owner={lib.owner}
                      name={lib.name}
                      displayName={libraryDisplayNames[lib.name] || lib.name}
                      delay={idx * 0.05}
                      risScore={risScoreMap.get(lib.name)}
                      showRIS={showRIS}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="pt-6 text-center">
          <p className="text-sm text-foreground/60">
            Total: {ecosystemLibraries.length} libraries tracked · All contributions
            verified via GitHub
          </p>
        </div>
      </section>
    </ScrollReveal>
  );
}
