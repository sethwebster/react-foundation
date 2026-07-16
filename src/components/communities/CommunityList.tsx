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

      <div className="divide-y divide-border border-y border-border">
        {visibleCommunities.map((community) => (
          <CommunityRow key={community.id} community={community} />
        ))}
      </div>

      {visibleCommunities.length === 0 ? (
        <div className="py-14 text-center">
          <p className="text-sm text-muted-foreground">
            No communities match those filters.
          </p>
        </div>
      ) : null}
    </div>
  );
}

function CommunityRow({ community }: { community: Community }) {
  return (
    <article className="group py-6 sm:py-7">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-semibold text-foreground">
              {community.name}
            </h3>
            {community.verified ? (
              <span className="rounded-full bg-brand-soft px-2 py-0.5 text-[0.625rem] font-semibold text-accent-foreground">
                Verified
              </span>
            ) : null}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {community.city}
            {community.region ? `, ${community.region}` : ""},{" "}
            {community.country}
          </p>
          <p className="mt-3 line-clamp-2 max-w-[37rem] text-sm leading-6 text-muted-foreground">
            {community.description}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
            <span>{community.member_count.toLocaleString()} members</span>
            <span className="capitalize">{community.meeting_frequency}</span>
            <span>{community.event_types.slice(0, 3).join(" · ")}</span>
          </div>
        </div>

        <Link
          href={`/communities/${community.slug}`}
          className="inline-flex min-h-10 shrink-0 items-center text-sm font-semibold text-foreground hover:text-primary"
        >
          View community <span className="ml-2 transition group-hover:translate-x-1">→</span>
        </Link>
      </div>
    </article>
  );
}
