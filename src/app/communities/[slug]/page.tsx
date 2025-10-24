/**
 * Community Detail Page
 * Individual community profile with details, events, and CoIS score
 */

import { notFound } from 'next/navigation';
import { getCommunityBySlug } from '@/data/communities';
import { RFDS } from '@/components/rfds';
import type { Metadata } from 'next';

interface CommunityPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: CommunityPageProps): Promise<Metadata> {
  const { slug } = await params;
  const community = getCommunityBySlug(slug);

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
  const community = getCommunityBySlug(slug);

  if (!community) {
    notFound();
  }

  const tierInfo = getTierInfo(community.cois_tier);

  return (
    <div className="min-h-screen bg-background pt-16">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary/10 to-background py-16 border-b border-border">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            {/* Breadcrumb */}
            <nav className="mb-6">
              <a
                href="/communities"
                className="text-sm text-muted-foreground hover:text-primary transition"
              >
                ← Back to all communities
              </a>
            </nav>

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-8">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <h1 className="text-4xl md:text-5xl font-bold text-foreground">
                    {community.name}
                  </h1>
                  {community.verified && (
                    <span
                      className="text-primary text-2xl"
                      title="Verified by React Foundation"
                    >
                      ✓
                    </span>
                  )}
                </div>

                <p className="text-xl text-muted-foreground mb-4">
                  {community.city}
                  {community.region && `, ${community.region}`}, {community.country}
                </p>

                {/* Event Types */}
                <div className="flex flex-wrap gap-2">
                  {community.event_types.map((type) => (
                    <span
                      key={type}
                      className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium capitalize"
                    >
                      {type}
                    </span>
                  ))}
                </div>
              </div>

              {/* CoIS Tier Badge */}
              {tierInfo && (
                <div className="bg-card border border-border rounded-xl p-6 text-center min-w-[200px]">
                  <div className="text-5xl mb-2">{tierInfo.icon}</div>
                  <div className={`text-lg font-bold mb-1 ${tierInfo.textColor}`}>
                    {tierInfo.label}
                  </div>
                  <div className="text-sm text-muted-foreground mb-3">
                    CoIS Tier
                  </div>
                  {community.cois_score && (
                    <div className="text-2xl font-bold text-primary">
                      {community.cois_score.toFixed(2)}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-3">
              {community.meetup_url && (
                <a
                  href={community.meetup_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition"
                >
                  Join on Meetup.com →
                </a>
              )}
              {community.website && (
                <a
                  href={community.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block bg-secondary text-secondary-foreground px-6 py-3 rounded-lg font-semibold hover:bg-secondary/90 transition"
                >
                  Visit Website →
                </a>
              )}
              {community.discord_url && (
                <a
                  href={community.discord_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block bg-secondary text-secondary-foreground px-6 py-3 rounded-lg font-semibold hover:bg-secondary/90 transition"
                >
                  Join Discord
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Column */}
            <div className="lg:col-span-2 space-y-8">
              {/* About */}
              <div className="bg-card border border-border rounded-xl p-6">
                <h2 className="text-2xl font-bold text-foreground mb-4">
                  About This Community
                </h2>
                <p className="text-foreground leading-relaxed">
                  {community.description}
                </p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatBox
                  label="Members"
                  value={community.member_count.toLocaleString()}
                  icon="👥"
                />
                <StatBox
                  label="Avg Attendance"
                  value={community.typical_attendance.toString()}
                  icon="📍"
                />
                <StatBox
                  label="Frequency"
                  value={community.meeting_frequency}
                  icon="📅"
                  capitalize
                />
                <StatBox
                  label="Founded"
                  value={new Date(community.founded_date).getFullYear().toString()}
                  icon="🎂"
                />
              </div>

              {/* Organizers */}
              {community.organizers && community.organizers.length > 0 && (
                <div className="bg-card border border-border rounded-xl p-6">
                  <h2 className="text-2xl font-bold text-foreground mb-4">
                    Organizers
                  </h2>
                  <div className="space-y-4">
                    {community.organizers.map((organizer) => (
                      <div
                        key={organizer.id}
                        className="flex items-start gap-4 p-4 bg-muted/30 rounded-lg"
                      >
                        <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center text-2xl">
                          👤
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-foreground">
                            {organizer.name}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {organizer.role}
                          </div>
                          {organizer.twitter_handle && (
                            <a
                              href={`https://twitter.com/${organizer.twitter_handle}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-primary hover:underline"
                            >
                              @{organizer.twitter_handle}
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Languages */}
              <div className="bg-card border border-border rounded-xl p-6">
                <h2 className="text-2xl font-bold text-foreground mb-4">
                  Languages
                </h2>
                <div className="flex flex-wrap gap-2">
                  <span className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium">
                    {community.primary_language}
                  </span>
                  {community.secondary_languages?.map((lang) => (
                    <span
                      key={lang}
                      className="px-4 py-2 bg-muted text-foreground rounded-lg"
                    >
                      {lang}
                    </span>
                  ))}
                </div>
              </div>

              {/* Last Event */}
              {community.last_event_date && (
                <div className="bg-card border border-border rounded-xl p-6">
                  <h2 className="text-2xl font-bold text-foreground mb-2">
                    Latest Activity
                  </h2>
                  <p className="text-muted-foreground">
                    Last event:{' '}
                    <span className="text-foreground font-medium">
                      {new Date(community.last_event_date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </span>
                  </p>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <aside className="space-y-6">
              {/* Status */}
              <div className="bg-card border border-border rounded-xl p-6">
                <h3 className="font-semibold text-foreground mb-3">Status</h3>
                <StatusBadge status={community.status} />
              </div>

              {/* Quick Info */}
              <div className="bg-card border border-border rounded-xl p-6">
                <h3 className="font-semibold text-foreground mb-4">
                  Quick Info
                </h3>
                <div className="space-y-3 text-sm">
                  <InfoRow label="Timezone" value={community.timezone} />
                  <InfoRow
                    label="Location"
                    value={`${community.coordinates.lat.toFixed(4)}, ${community.coordinates.lng.toFixed(4)}`}
                  />
                  {community.founded_date && (
                    <InfoRow
                      label="Founded"
                      value={new Date(community.founded_date).getFullYear().toString()}
                    />
                  )}
                </div>
              </div>

              {/* Social Links */}
              {(community.twitter_handle ||
                community.linkedin_url ||
                community.slack_url) && (
                <div className="bg-card border border-border rounded-xl p-6">
                  <h3 className="font-semibold text-foreground mb-4">
                    Connect
                  </h3>
                  <div className="space-y-2">
                    {community.twitter_handle && (
                      <a
                        href={`https://twitter.com/${community.twitter_handle}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-primary hover:underline text-sm"
                      >
                        Twitter →
                      </a>
                    )}
                    {community.linkedin_url && (
                      <a
                        href={community.linkedin_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-primary hover:underline text-sm"
                      >
                        LinkedIn →
                      </a>
                    )}
                    {community.slack_url && (
                      <a
                        href={community.slack_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-primary hover:underline text-sm"
                      >
                        Slack →
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* CTA */}
              <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-xl p-6 text-center">
                <div className="text-3xl mb-3">🚀</div>
                <h3 className="font-bold text-foreground mb-2">
                  Want to Organize?
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Start your own React community and earn CoIS rewards
                </p>
                <a
                  href="/communities/start"
                  className="block bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition"
                >
                  Learn More
                </a>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </div>
  );
}

function StatBox({
  label,
  value,
  icon,
  capitalize,
}: {
  label: string;
  value: string;
  icon: string;
  capitalize?: boolean;
}) {
  return (
    <div className="bg-card border border-border rounded-xl p-4 text-center">
      <div className="text-3xl mb-2">{icon}</div>
      <div
        className={`text-2xl font-bold text-primary mb-1 ${capitalize ? 'capitalize' : ''}`}
      >
        {value}
      </div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config = {
    active: { bg: 'bg-green-500/10', text: 'text-green-600 dark:text-green-400', label: 'Active' },
    new: { bg: 'bg-blue-500/10', text: 'text-blue-600 dark:text-blue-400', label: 'New' },
    paused: { bg: 'bg-yellow-500/10', text: 'text-yellow-600 dark:text-yellow-400', label: 'Paused' },
    inactive: { bg: 'bg-gray-500/10', text: 'text-gray-600 dark:text-gray-400', label: 'Inactive' },
  }[status] || { bg: 'bg-muted', text: 'text-muted-foreground', label: status };

  return (
    <div className={`${config.bg} ${config.text} px-4 py-2 rounded-lg font-medium text-center capitalize`}>
      {config.label}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}:</span>
      <span className="text-foreground font-medium">{value}</span>
    </div>
  );
}

function getTierInfo(tier?: string) {
  switch (tier) {
    case 'platinum':
      return {
        icon: '💎',
        label: 'Platinum',
        textColor: 'text-cyan-400',
        description: 'Top 5% - Elite community builder',
      };
    case 'gold':
      return {
        icon: '🏆',
        label: 'Gold',
        textColor: 'text-yellow-400',
        description: 'Top 15% - Outstanding community',
      };
    case 'silver':
      return {
        icon: '🥈',
        label: 'Silver',
        textColor: 'text-gray-400',
        description: 'Top 30% - Excellent community',
      };
    case 'bronze':
      return {
        icon: '🥉',
        label: 'Bronze',
        textColor: 'text-orange-400',
        description: 'Top 50% - Valued community',
      };
    default:
      return null;
  }
}
