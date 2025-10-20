import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { ecosystemLibraries } from "@/lib/maintainer-tiers";
import { LibraryCard } from "@/components/ui/library-card";
import { libraryDisplayNames } from "@/lib/library-icons";

interface EcosystemLibrariesProps {
  id?: string;
  title?: string;
  description?: string;
}

export function EcosystemLibraries({
  id = "libraries",
  title = "Supported Ecosystem",
  description = "We track contributions across all 54 critical React ecosystem libraries:",
}: EcosystemLibrariesProps) {
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
        className="scroll-mt-32 space-y-8 rounded-3xl border border-white/10 bg-slate-900/60 p-12"
      >
        <h2 className="text-3xl font-semibold text-white sm:text-4xl">{title}</h2>
        <p className="max-w-3xl text-lg text-white/70">{description}</p>

        <div className="space-y-8 pt-6">
          {categorizedLibraries.map((cat) => {
            const libs = ecosystemLibraries.filter((l) => l.category === cat.category);
            if (libs.length === 0) return null;

            return (
              <div key={cat.category}>
                <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-white/60">
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
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="pt-6 text-center">
          <p className="text-sm text-white/60">
            Total: {ecosystemLibraries.length} libraries tracked · All contributions
            verified via GitHub
          </p>
        </div>
      </section>
    </ScrollReveal>
  );
}
