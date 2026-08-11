"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

import type { Community, EventType } from "@/types/community";

export function CommunityList({
  communities,
}: {
  communities: Community[];
}) {
  const searchParams = useSearchParams();
  const search = searchParams.get("search")?.trim().toLowerCase();
  const country = searchParams.get("country");
  const status = searchParams.get("status");
  const tier = searchParams.get("tier");
  const eventTypes = searchParams
    .get("types")
    ?.split(",")
    .filter(Boolean) as EventType[] | undefined;
  const sort = searchParams.get("sort") ?? "members";

  const visibleCommunities = communities
    .filter((community) => {
      if (
        search &&
        ![
          community.name,
          community.city,
          community.region,
          community.country,
        ]
          .filter(Boolean)
          .some((value) => value?.toLowerCase().includes(search))
      ) {
        return false;
      }
      if (country && community.country !== country) return false;
      if (status && status !== "all" && community.status !== status) return false;
      if (tier && community.cois_tier !== tier) return false;
      if (
        eventTypes?.length &&
        !eventTypes.some((type) => community.event_types.includes(type))
      ) {
        return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (sort === "name") return a.name.localeCompare(b.name);
      if (sort === "recent") {
        return (
          new Date(b.last_event_date ?? 0).getTime() -
          new Date(a.last_event_date ?? 0).getTime()
        );
      }
      if (sort === "cois") return (b.cois_score ?? 0) - (a.cois_score ?? 0);
      if (sort === "activity") {
        return (b.typical_attendance ?? 0) - (a.typical_attendance ?? 0);
      }
      return b.member_count - a.member_count;
    });

  return (
    <div>
      <p className="mb-4 text-xs text-muted-foreground">
        Showing {visibleCommunities.length}{" "}
        {visibleCommunities.length === 1 ? "community" : "communities"}
      </p>

      {visibleCommunities.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {visibleCommunities.map((community) => (
            <CommunityCard key={community.id} community={community} />
          ))}
        </div>
      ) : (
        <div className="rounded-card border border-border bg-card py-14 text-center shadow-card">
          <p className="text-sm text-muted-foreground">
            No communities match those filters.
          </p>
        </div>
      )}
    </div>
  );
}

function CommunityCard({ community }: { community: Community }) {
  return (
    <Link
      href={`/communities/${community.slug}`}
      className="group flex h-full flex-col rounded-card border border-border bg-card p-5 shadow-card transition duration-200 hover:-translate-y-0.5 hover:shadow-raised focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-lg font-semibold tracking-[-0.01em] text-foreground group-hover:text-primary">
          {community.name}
        </h3>
        {community.verified ? (
          <span
            className="inline-flex shrink-0 items-center gap-1 rounded-full bg-brand-soft px-2 py-0.5 text-[0.6875rem] font-medium text-accent-foreground"
            title="Verified community"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-3 w-3" aria-hidden>
              <path d="M12 2 4 5v6c0 5 3.4 9.4 8 11 4.6-1.6 8-6 8-11V5l-8-3Zm-1.2 13.4-3.2-3.2 1.4-1.4 1.8 1.8 4.2-4.2 1.4 1.4-5.6 5.6Z" />
            </svg>
            Verified
          </span>
        ) : null}
      </div>

      <p className="mt-1 text-xs text-muted-foreground">
        {community.city}
        {community.region ? `, ${community.region}` : ""}, {community.country}
      </p>

      <p className="mt-3 line-clamp-2 text-sm leading-6 text-muted-foreground">
        {community.description}
      </p>

      <div className="mt-auto space-y-3 pt-5">
        {community.cois_tier ? (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border px-2 py-0.5 text-[0.6875rem] font-medium capitalize text-muted-foreground">
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: `var(--map-tier-${community.cois_tier})` }}
              aria-hidden
            />
            {community.cois_tier}
          </span>
        ) : null}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <span>{community.member_count.toLocaleString()} members</span>
          <span aria-hidden>·</span>
          <span className="capitalize">{community.meeting_frequency}</span>
          {community.event_types.length > 0 ? (
            <>
              <span aria-hidden>·</span>
              <span>{community.event_types.slice(0, 2).join(" · ")}</span>
            </>
          ) : null}
        </div>
      </div>
    </Link>
  );
}
