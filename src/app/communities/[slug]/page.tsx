/**
 * Community Detail Page
 * Individual community profile with details, events, and CoIS score
 */

import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Cake, Calendar, CircleUserRound, MapPin, Users } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { getCommunityHostLabel } from '@/lib/community-host';
import { getCommunityBySlug } from '@/lib/redis-communities';
import { OrbitMarks, Panel, PanelActions, PanelButton, PanelEyebrow, RowList } from '@/components/panels/panel';
import { PanelsFooter } from '@/components/panels/panels-footer';
import type { Metadata } from 'next';

interface CommunityPageProps {
  params: Promise<{ slug: string }>;
}

const FOCUS_RING =
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid focus-visible:outline-[#16181D]';

const INK_BUTTON = `panels-anim inline-flex items-center justify-center rounded-xl border border-[#16181D] bg-[#16181D] px-6 py-3.5 text-[15px] font-semibold leading-[1.2] text-[#F6F7F9]! hover:border-[#07090D] hover:bg-[#07090D] ${FOCUS_RING}`;

const OUTLINE_BUTTON = `panels-anim inline-flex items-center justify-center rounded-xl border border-[#16181D] bg-transparent px-6 py-3.5 text-[15px] font-semibold leading-[1.2] text-[#16181D] hover:bg-[rgba(22,24,29,0.08)] ${FOCUS_RING}`;

export async function generateMetadata({
  params,
}: CommunityPageProps): Promise<Metadata> {
  const { slug } = await params;
  const community = await getCommunityBySlug(slug);

  if (!community) {
    return {
      title: 'Community Not Found',
    };
  }

  return {
    title: `${community.name} | React Foundation`,
    description: community.description,
  };
}

export default async function CommunityPage({ params }: CommunityPageProps) {
  const { slug } = await params;
  const community = await getCommunityBySlug(slug);

  if (!community) {
    notFound();
  }

  const tierInfo = getTierInfo(community.cois_tier);

  return (
    <div className="flex min-h-screen flex-col gap-2.5 bg-[#EBECF0] px-4 pb-4 pt-24 sm:px-6 sm:pb-6 md:gap-4 dark:bg-[#16181D]">
      <Panel tone="cyan" labelledBy="community-hero-title">
        <OrbitMarks className="-right-[170px] -top-[150px] h-[520px] w-[520px]" />
        <div className="relative z-[1]">
          <nav className="mb-6">
            <Link
              href="/communities"
              className={`panels-anim text-sm text-[rgba(22,24,29,0.7)]! hover:text-[#16181D]! ${FOCUS_RING}`}
            >
              ← Back to all communities
            </Link>
          </nav>

          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <h1
                  id="community-hero-title"
                  className="max-w-[16ch] text-[clamp(36px,4vw,56px)] font-semibold leading-[1.05] tracking-[-0.02em] text-[#16181D]"
                >
                  {community.name}
                </h1>
                {community.verified && (
                  <span
                    title="Verified by React Foundation"
                    className="rounded-full border border-[rgba(22,24,29,0.35)] px-3 py-1 text-[13px] font-medium text-[#16181D]"
                  >
                    ✓ Verified
                  </span>
                )}
              </div>

              <p className="mt-4 text-[17px] leading-[1.55] text-[rgba(22,24,29,0.7)]">
                {community.city}
                {community.region && `, ${community.region}`}, {community.country}
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                {community.event_types.map((type) => (
                  <span
                    key={type}
                    className="rounded-full border border-[rgba(22,24,29,0.35)] px-3 py-1 text-[13px] font-medium capitalize text-[#16181D]"
                  >
                    {type}
                  </span>
                ))}
              </div>
            </div>

            {tierInfo && (
              <div className="min-w-[200px] rounded-2xl border border-[rgba(22,24,29,0.2)] p-6 text-center">
                <p className="text-[13px] font-medium tracking-[0.01em] text-[rgba(22,24,29,0.65)]">
                  CoIS Tier
                </p>
                <div className="mt-2 text-xl font-semibold text-[#16181D]">
                  {tierInfo.label}
                </div>
                {community.cois_score && (
                  <div className="font-mono-panels mt-3 text-2xl font-medium text-[#16181D]">
                    {community.cois_score.toFixed(2)}
                  </div>
                )}
              </div>
            )}
          </div>

          <PanelActions>
            {community.meetup_url && (
              <a
                href={community.meetup_url}
                target="_blank"
                rel="noopener noreferrer"
                className={INK_BUTTON}
              >
                Join on {getCommunityHostLabel(community.meetup_url)} →
              </a>
            )}
            {community.website && (
              <a
                href={community.website}
                target="_blank"
                rel="noopener noreferrer"
                className={OUTLINE_BUTTON}
              >
                Visit Website →
              </a>
            )}
            {community.discord_url && (
              <a
                href={community.discord_url}
                target="_blank"
                rel="noopener noreferrer"
                className={OUTLINE_BUTTON}
              >
                Join Discord
              </a>
            )}
          </PanelActions>
        </div>
      </Panel>

      <div className="mx-auto grid w-full max-w-[1200px] grid-cols-1 gap-2.5 md:gap-4 lg:grid-cols-3">
        <div className="flex flex-col gap-2.5 md:gap-4 lg:col-span-2">
          <Panel tone="paper" compact labelledBy="community-about-title">
            <PanelEyebrow id="community-about-title">About this community</PanelEyebrow>
            <p className="mt-4 text-[15px] leading-[1.6] text-[#5E687E]">
              {community.description}
            </p>
          </Panel>

          <Panel tone="paper" compact labelledBy="community-stats-title">
            <PanelEyebrow id="community-stats-title">By the numbers</PanelEyebrow>
            <RowList className="mt-3">
              <StatRow
                icon={Users}
                label="Members"
                value={community.member_count.toLocaleString()}
              />
              <StatRow
                icon={MapPin}
                label="Avg Attendance"
                value={community.typical_attendance.toString()}
              />
              <StatRow
                icon={Calendar}
                label="Frequency"
                value={community.meeting_frequency}
                capitalize
              />
              <StatRow
                icon={Cake}
                label="Founded"
                value={new Date(community.founded_date).getFullYear().toString()}
              />
            </RowList>
          </Panel>

          {community.organizers && community.organizers.length > 0 && (
            <Panel tone="paper" compact labelledBy="community-organizers-title">
              <PanelEyebrow id="community-organizers-title">Organizers</PanelEyebrow>
              <RowList className="mt-3">
                {community.organizers.map((organizer) => (
                  <div key={organizer.id} className="flex items-start gap-4 py-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-[#EBECF0] bg-white text-[#5E687E]">
                      <CircleUserRound size={24} strokeWidth={1.5} aria-hidden="true" />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-[#16181D]">
                        {organizer.name}
                      </div>
                      <div className="text-sm text-[#5E687E]">
                        {organizer.role}
                      </div>
                      {organizer.twitter_handle && (
                        <a
                          href={`https://twitter.com/${organizer.twitter_handle}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`text-sm text-[#087EA4]! hover:underline ${FOCUS_RING}`}
                        >
                          @{organizer.twitter_handle}
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </RowList>
            </Panel>
          )}

          <Panel tone="paper" compact labelledBy="community-languages-title">
            <PanelEyebrow id="community-languages-title">Languages</PanelEyebrow>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="rounded-full bg-[#16181D] px-4 py-1.5 text-sm font-semibold text-[#F6F7F9]">
                {community.primary_language}
              </span>
              {community.secondary_languages?.map((lang) => (
                <span
                  key={lang}
                  className="rounded-full border border-[rgba(22,24,29,0.2)] px-4 py-1.5 text-sm text-[#5E687E]"
                >
                  {lang}
                </span>
              ))}
            </div>
          </Panel>

          {community.last_event_date && (
            <Panel tone="paper" compact labelledBy="community-activity-title">
              <PanelEyebrow id="community-activity-title">Latest activity</PanelEyebrow>
              <p className="mt-4 text-[15px] text-[#5E687E]">
                Last event:{' '}
                <span className="font-medium text-[#16181D]">
                  {new Date(community.last_event_date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              </p>
            </Panel>
          )}
        </div>

        <Panel tone="paper" compact labelledBy="community-sidebar-title" className="self-start">
          <h2 id="community-sidebar-title" className="sr-only">
            Community details
          </h2>

          <section aria-label="Status">
            <h3 className="text-[13px] font-medium tracking-[0.01em] text-[#5E687E]">Status</h3>
            <div className="mt-3">
              <StatusBadge status={community.status} />
            </div>
          </section>

          <section aria-label="Quick Info" className="mt-8">
            <h3 className="text-[13px] font-medium tracking-[0.01em] text-[#5E687E]">
              Quick Info
            </h3>
            <RowList className="mt-2">
              <InfoRow label="Timezone" value={community.timezone} />
              {community.coordinates && (
                <InfoRow
                  label="Location"
                  value={`${community.coordinates.lat.toFixed(4)}, ${community.coordinates.lng.toFixed(4)}`}
                />
              )}
              {community.founded_date && (
                <InfoRow
                  label="Founded"
                  value={new Date(community.founded_date).getFullYear().toString()}
                />
              )}
            </RowList>
          </section>

          {(community.twitter_handle ||
            community.linkedin_url ||
            community.slack_url) && (
            <section aria-label="Connect" className="mt-8">
              <h3 className="text-[13px] font-medium tracking-[0.01em] text-[#5E687E]">
                Connect
              </h3>
              <RowList className="mt-2">
                {community.twitter_handle && (
                  <a
                    href={`https://twitter.com/${community.twitter_handle}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`block py-2.5 text-sm font-semibold text-[#087EA4]! hover:underline ${FOCUS_RING}`}
                  >
                    Twitter →
                  </a>
                )}
                {community.linkedin_url && (
                  <a
                    href={community.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`block py-2.5 text-sm font-semibold text-[#087EA4]! hover:underline ${FOCUS_RING}`}
                  >
                    LinkedIn →
                  </a>
                )}
                {community.slack_url && (
                  <a
                    href={community.slack_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`block py-2.5 text-sm font-semibold text-[#087EA4]! hover:underline ${FOCUS_RING}`}
                  >
                    Slack →
                  </a>
                )}
              </RowList>
            </section>
          )}

          <section aria-label="Want to Organize?" className="mt-8 rounded-2xl border border-[#EBECF0] bg-white p-6 text-center">
            <h3 className="text-[17px] font-semibold text-[#16181D]">
              Want to Organize?
            </h3>
            <p className="mt-2 text-sm leading-[1.55] text-[#5E687E]">
              Start your own React community and earn CoIS rewards
            </p>
            <div className="mt-4 flex justify-center">
              <PanelButton href="/communities/start" variant="ink">
                Learn More
              </PanelButton>
            </div>
          </section>
        </Panel>
      </div>

      <PanelsFooter />
    </div>
  );
}

function StatRow({
  icon: Icon,
  label,
  value,
  capitalize,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  capitalize?: boolean;
}) {
  return (
    <div className="grid grid-cols-[24px_minmax(0,1fr)_auto] items-center gap-x-5 py-[18px] text-[#16181D]">
      <Icon size={24} strokeWidth={1.5} aria-hidden="true" />
      <span className="text-[17px] font-medium">{label}</span>
      <span className={`font-mono-panels justify-self-end text-[15px] font-medium ${capitalize ? 'capitalize' : ''}`}>
        {value}
      </span>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config = {
    active: { bg: 'bg-[#44AC99]', text: 'text-[#16181D]', label: 'Active' },
    new: { bg: 'bg-[#087EA4]', text: 'text-white', label: 'New' },
    paused: { bg: 'bg-[#C76A15]', text: 'text-[#16181D]', label: 'Paused' },
    inactive: { bg: 'bg-[#5E687E]', text: 'text-white', label: 'Inactive' },
  }[status] || { bg: 'border border-[rgba(22,24,29,0.2)]', text: 'text-[#5E687E]', label: status };

  return (
    <div className={`${config.bg} ${config.text} rounded-xl px-4 py-2 text-center text-sm font-semibold capitalize`}>
      {config.label}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2.5 text-sm">
      <span className="text-[#5E687E]">{label}</span>
      <span className="text-right font-medium text-[#16181D]">{value}</span>
    </div>
  );
}

function getTierInfo(tier?: string) {
  switch (tier) {
    case 'platinum':
      return {
        label: 'Platinum',
        description: 'Top 5% - Elite community builder',
      };
    case 'gold':
      return {
        label: 'Gold',
        description: 'Top 15% - Outstanding community',
      };
    case 'silver':
      return {
        label: 'Silver',
        description: 'Top 30% - Excellent community',
      };
    case 'bronze':
      return {
        label: 'Bronze',
        description: 'Top 50% - Valued community',
      };
    default:
      return null;
  }
}
