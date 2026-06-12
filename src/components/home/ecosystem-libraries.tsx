import { Panel, PanelEyebrow, PanelSub } from "@/components/panels/panel";
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
  title = "Supported ecosystem",
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
  const defaultDescription = `We track contributions across all ${libraryCount} critical React ecosystem libraries:`;
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
    <Panel tone="paper" id={id} labelledBy="ecosystem-libraries-title">
      <PanelEyebrow id="ecosystem-libraries-title">{title}</PanelEyebrow>
      <PanelSub>{displayDescription}</PanelSub>

      <div className="mt-8 space-y-10">
        {categorizedLibraries.map((cat) => {
          const libs = ecosystemLibraries.filter((l) => l.category === cat.category);
          if (libs.length === 0) return null;

          return (
            <div key={cat.category}>
              <h3 className="mb-3 text-[13px] font-medium tracking-[0.01em] text-[#5E687E]">
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

      <p className="mt-8 text-[13px] text-[#5E687E]">
        Total: {ecosystemLibraries.length} libraries tracked · All contributions
        verified via GitHub
      </p>

      {showMissingLibraryIssue ? (
        <div className="mt-6 flex flex-col flex-wrap items-start justify-between gap-6 rounded-2xl border border-[#EBECF0] bg-white px-7 py-6 md:flex-row md:items-center">
          <p className="text-[17px] font-semibold text-[#16181D]">
            Don&apos;t see a library?
          </p>
          <a
            href={issueUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="panels-anim inline-flex items-center justify-center rounded-xl border border-[#16181D] bg-transparent px-6 py-3.5 text-[15px] font-semibold leading-[1.2] text-[#16181D] hover:bg-[rgba(22,24,29,0.08)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid focus-visible:outline-[#16181D]"
          >
            Add a missing library
          </a>
        </div>
      ) : null}
    </Panel>
  );
}
