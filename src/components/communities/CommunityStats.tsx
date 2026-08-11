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
    <dl className="grid grid-cols-3 py-3 text-center">
      {stats.map((stat) => (
        <div key={stat.label} className="px-2 sm:px-6">
          <dd className="text-2xl font-semibold tracking-[-0.04em] text-foreground sm:text-3xl">
            {stat.value}
          </dd>
          <dt className="mt-1 text-[0.6875rem] text-muted-foreground sm:text-xs">
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
