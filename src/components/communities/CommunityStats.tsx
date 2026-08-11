export function CommunityStats({
  communities,
  countries,
  members,
}: {
  communities: number;
  countries: number;
  members: number;
}) {
  const stats = [
    { value: communities.toString(), label: "Communities" },
    { value: countries.toString(), label: "Countries" },
    { value: formatMembers(members), label: "Members" },
  ];

  return (
    <dl className="mx-auto grid max-w-xl grid-cols-3 divide-x divide-border">
      {stats.map((stat) => (
        <div key={stat.label} className="px-2 text-center sm:px-6">
          <dd className="text-3xl font-semibold tracking-[-0.03em] text-foreground sm:text-4xl">
            {stat.value}
          </dd>
          <dt className="foundation-eyebrow mt-2.5 text-muted-foreground">
            {stat.label}
          </dt>
        </div>
      ))}
    </dl>
  );
}

function formatMembers(value: number) {
  if (value < 1000) return value.toString();
  return `${Math.floor(value / 1000)}k+`;
}
