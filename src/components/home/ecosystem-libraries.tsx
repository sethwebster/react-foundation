import { ButtonLink } from "@/components/ui/button";
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
  showMissingLibraryIssue?: boolean; // Show CTA for missing ecosystem libraries
}

export function EcosystemLibraries({
  id = "libraries",
  title = "Supported Ecosystem",
  description,
  risScores,
  showRIS = false,
  showMissingLibraryIssue = false,
}: EcosystemLibrariesProps) {
  // Create a map of library names to RIS scores for quick lookup
  const risScoreMap = risScores
    ? new Map(risScores.map((score) => [score.repo, score.ris]))
    : new Map();
  
  // Use dynamic count from ecosystemLibraries if description not provided
  const libraryCount = ecosystemLibraries.length;
  const defaultDescription = `We track contributions across ${libraryCount} React ecosystem repositories spanning core React, frameworks, routing, state, data, UI, testing, tooling, and styling.`;
  const displayDescription = description || defaultDescription;
  const issueTitle = encodeURIComponent("Missing library in Supported Ecosystem");
  const issueBody = encodeURIComponent(
    `### Library name

Library:

### Repository (if known)
owner/repo:

### Why should this library be included?

`
  );
  const issueUrl =
    `https://github.com/sethwebster/react-foundation/issues/new?title=${issueTitle}&body=${issueBody}`;
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
    <ScrollReveal animation="fade-up">
      <section
        id={id}
        className="scroll-mt-32 space-y-10"
      >
        <div className="grid gap-6 md:grid-cols-[0.75fr_1.25fr]">
          <div>
            <p className="text-sm font-semibold text-primary">
              {libraryCount} tracked repositories
            </p>
            <h2 className="mt-4 text-3xl font-semibold leading-tight text-foreground sm:text-4xl">
              {title}
            </h2>
          </div>
          <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
            {displayDescription}
          </p>
        </div>

        <div className="space-y-10">
          {categorizedLibraries.map((cat) => {
            const libs = ecosystemLibraries.filter((l) => l.category === cat.category);
            if (libs.length === 0) return null;

            return (
              <div key={cat.category}>
                <h3 className="text-sm font-semibold text-foreground">
                  {cat.name} · {libs.length} {libs.length === 1 ? "library" : "libraries"}
                </h3>
                <div className="mt-3 grid gap-x-8 sm:grid-cols-2 lg:grid-cols-3">
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

        <div className="border-y border-border py-5">
          <p className="text-sm text-muted-foreground">
            Total: {ecosystemLibraries.length} libraries tracked. Contribution
            tracking uses GitHub repository activity for supported projects.
          </p>
        </div>

        {showMissingLibraryIssue ? (
          <div className="border-t border-border pt-6">
            <p className="text-sm text-muted-foreground">
              Don&apos;t see a library?
            </p>
            <ButtonLink
              href={issueUrl}
              variant="secondary"
              size="md"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3"
            >
              Add a missing library
            </ButtonLink>
          </div>
        ) : null}
      </section>
    </ScrollReveal>
  );
}
