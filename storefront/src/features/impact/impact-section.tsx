export function ImpactSection() {
  const stats = [
    {
      label: "Open Source Grants",
      value: "$2.4M",
      caption: "funded since 2023",
    },
    {
      label: "Docs Translations",
      value: "18",
      caption: "languages supported",
    },
    {
      label: "Scholarships",
      value: "320",
      caption: "students sponsored",
    },
    {
      label: "Community Events",
      value: "95",
      caption: "meetups underwritten",
    },
  ];

  return (
    <section
      id="impact"
      style={{ scrollMarginTop: "160px" }}
      className="rounded-3xl border border-white/10 bg-slate-900/70 p-10 backdrop-blur"
    >
      <div className="grid gap-10 md:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
          <h2 className="text-3xl font-semibold text-white">
            Every cart funds React ecosystems.
          </h2>
          <p className="text-sm text-white/60">
            100% of proceeds fuel React Foundation grants, documentation,
            education, and community-led innovation. We publish transparent
            impact reports each quarter, so you can see which projects your
            wardrobe supports.
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-white/10 bg-white/5 p-6 text-white"
              >
                <p className="text-xs uppercase tracking-[0.3em] text-white/60">
                  {stat.label}
                </p>
                <p className="mt-3 text-2xl font-semibold text-white">
                  {stat.value}
                </p>
                <p className="text-xs text-white/60">{stat.caption}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-indigo-500/40 via-purple-500/20 to-slate-900 p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-white/70">
            React Foundation Journal
          </p>
          <p className="mt-4 text-lg font-medium text-white">
            &quot;Swag sales helped us fund 12 new documentation maintainers
            this quarter. The community voted, we shipped.&quot;
          </p>
          <p className="mt-8 text-sm text-white/60">
            Read more impact stories →
          </p>
        </div>
      </div>
    </section>
  );
}
