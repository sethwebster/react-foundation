import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  PageIntro,
  PublicPageShell,
  Section,
  Surface,
} from "@/components/public-site/layout";
import { ButtonLink } from "@/components/ui/button";
import { getCommunityHostLabel } from "@/lib/community-host";
import { getCommunityBySlug } from "@/lib/redis-communities";

type CommunityPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: CommunityPageProps): Promise<Metadata> {
  const community = await getCommunityBySlug((await params).slug);
  return community
    ? { title: community.name, description: community.description }
    : { title: "Community not found" };
}

export default async function CommunityPage({ params }: CommunityPageProps) {
  const community = await getCommunityBySlug((await params).slug);
  if (!community) notFound();

  const location = [community.city, community.region, community.country]
    .filter(Boolean)
    .join(", ");
  const languages = [
    community.primary_language,
    ...(community.secondary_languages ?? []),
  ];
  const details = [
    ["Members", community.member_count.toLocaleString()],
    ["Typical attendance", community.typical_attendance.toLocaleString()],
    ["Meets", community.meeting_frequency],
    ["Founded", new Date(community.founded_date).getFullYear().toString()],
    ["Languages", languages.join(", ")],
    ["Timezone", community.timezone],
    ["Status", community.status],
    ["Community tier", community.cois_tier || "Not assigned"],
  ];
  const actions = [
    community.meetup_url
      ? {
          href: community.meetup_url,
          label: `Open ${getCommunityHostLabel(community.meetup_url)}`,
        }
      : null,
    community.website
      ? { href: community.website, label: "Visit website" }
      : null,
    community.discord_url
      ? { href: community.discord_url, label: "Join Discord" }
      : null,
  ].filter((action): action is { href: string; label: string } => Boolean(action));

  return (
    <PublicPageShell>
      <main>
        <Section className="pt-12 sm:pt-16" measure="standard">
          <Link
            href="/communities"
            className="text-sm text-muted-foreground transition hover:text-foreground"
          >
            <span aria-hidden>←</span> Back to all communities
          </Link>
        </Section>

        <Section className="pt-10" measure="standard">
          <PageIntro
            align="left"
            eyebrow={community.verified ? "Verified community" : "Community profile"}
            title={community.name}
            description={location}
            actions={
              actions.length
                ? actions.map((action, index) => (
                    <ButtonLink
                      key={action.href}
                      href={action.href}
                      target="_blank"
                      rel="noreferrer"
                      variant={index === 0 ? "primary" : "secondary"}
                    >
                      {action.label} <span aria-hidden>↗</span>
                    </ButtonLink>
                  ))
                : undefined
            }
          />
        </Section>

        <Section className="py-16 sm:py-20" measure="standard">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
            <div className="space-y-8">
              <Surface className="p-7 sm:p-9">
                <h2 className="text-2xl font-semibold text-foreground">
                  About this community
                </h2>
                <p className="mt-4 text-base leading-7 text-muted-foreground">
                  {community.description}
                </p>
                <div className="mt-6 flex flex-wrap gap-2">
                  {community.event_types.map((type) => (
                    <span
                      key={type}
                      className="rounded-control border border-border px-3 py-1 text-xs capitalize text-muted-foreground"
                    >
                      {type}
                    </span>
                  ))}
                </div>
              </Surface>

              {community.organizers.length ? (
                <section>
                  <h2 className="text-2xl font-semibold text-foreground">
                    Organizers
                  </h2>
                  <div className="mt-5 divide-y divide-border border-y border-border">
                    {community.organizers.map((organizer) => (
                      <div
                        key={organizer.id}
                        className="flex items-start justify-between gap-5 py-5"
                      >
                        <div>
                          <h3 className="font-semibold text-foreground">
                            {organizer.name}
                          </h3>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {organizer.role}
                          </p>
                        </div>
                        {organizer.twitter_handle ? (
                          <a
                            href={`https://x.com/${organizer.twitter_handle}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-sm font-semibold text-primary"
                          >
                            @{organizer.twitter_handle}
                          </a>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </section>
              ) : null}
            </div>

            <aside>
              <h2 className="text-sm font-semibold text-primary">
                Community details
              </h2>
              <dl className="mt-4 divide-y divide-border border-y border-border">
                {details.map(([label, value]) => (
                  <div key={label} className="py-4">
                    <dt className="text-xs text-muted-foreground">{label}</dt>
                    <dd className="mt-1 text-sm capitalize text-foreground">
                      {value}
                    </dd>
                  </div>
                ))}
              </dl>
              <ButtonLink
                href="/communities/start"
                variant="secondary"
                className="mt-7 w-full"
              >
                Start a community
              </ButtonLink>
            </aside>
          </div>
        </Section>
      </main>
    </PublicPageShell>
  );
}
