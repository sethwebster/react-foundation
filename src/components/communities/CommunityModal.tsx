/**
 * Community Modal Component
 * Modal overlay showing community details
 */

'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import type { Community } from '@/types/community';

interface CommunityModalProps {
  community: Community;
}

export function CommunityModal({ community }: CommunityModalProps) {
  const router = useRouter();

  // Prevent body scroll when modal is open
  useEffect(() => {
    // Save current scroll position
    const scrollY = window.scrollY;
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = '100%';

    return () => {
      // Restore scroll position
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      window.scrollTo(0, scrollY);
    };
  }, []);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        router.back();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [router]);

  const tierInfo = getTierInfo(community.cois_tier);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={() => router.back()}
    >
      <div
        className="bg-card border-2 border-border rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={() => router.back()}
          className="sticky top-4 right-4 float-right z-10 bg-card/95 backdrop-blur-sm border border-border rounded-full w-10 h-10 flex items-center justify-center hover:bg-destructive hover:text-destructive-foreground transition shadow-lg"
          aria-label="Close"
        >
          ✕
        </button>

        {/* Header */}
        <div className="p-8 border-b border-border">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                  {community.name}
                </h2>
                {community.verified && (
                  <span className="text-primary text-2xl" title="Verified">
                    ✓
                  </span>
                )}
              </div>

              <p className="text-lg text-muted-foreground mb-4">
                {community.city}
                {community.region && `, ${community.region}`}, {community.country}
              </p>

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

            {tierInfo && (
              <div className="bg-muted/30 border border-border rounded-xl p-6 text-center min-w-[180px]">
                <div className="text-5xl mb-2">{tierInfo.icon}</div>
                <div className={`text-lg font-bold mb-1 ${tierInfo.textColor}`}>
                  {tierInfo.label}
                </div>
                {community.cois_score && (
                  <div className="text-2xl font-bold text-primary">
                    {community.cois_score.toFixed(2)}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-8 space-y-6">
          {/* Description */}
          <div>
            <h3 className="text-xl font-bold text-foreground mb-3">About</h3>
            <p className="text-foreground leading-relaxed">{community.description}</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatBox
              label="Members"
              value={community.member_count.toLocaleString()}
              icon="👥"
            />
            <StatBox
              label="Attendance"
              value={community.typical_attendance.toString()}
              icon="📍"
            />
            <StatBox
              label="Frequency"
              value={community.meeting_frequency}
              icon="📅"
              capitalize
            />
            {community.founded_date && (
              <StatBox
                label="Founded"
                value={new Date(community.founded_date).getFullYear().toString()}
                icon="🎂"
              />
            )}
          </div>

          {/* Organizers */}
          {community.organizers && community.organizers.length > 0 && (
            <div>
              <h3 className="text-xl font-bold text-foreground mb-3">Organizers</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {community.organizers.map((organizer) => (
                  <div
                    key={organizer.id}
                    className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg"
                  >
                    <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center text-xl">
                      👤
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-foreground truncate">
                        {organizer.name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {organizer.role}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap gap-3 pt-4 border-t border-border">
            {community.meetup_url && (
              <a
                href={community.meetup_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 min-w-[200px] bg-[#ED1C40] text-white rounded-lg px-6 py-3 font-semibold hover:bg-[#ED1C40]/90 transition text-center flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" viewBox="0 0 512 512" fill="currentColor">
                  <path d="M99 414.3c1.1 5.7-2.3 11.1-8 12.3-5.4 1.1-10.9-2.3-12-8-1.1-5.4 2.3-11 7.7-12 5.4-1.2 11.1 2.3 12.3 7.7zm143.1 71.4c-6.3 4.6-8 13.4-3.7 20 4.6 6.6 13.4 8.3 20 3.7 6.3-4.6 8-13.4 3.4-20-4.2-6.5-13.1-8.2-19.7-3.7zm-86-462.3c6.3-1.4 10.3-7.7 8.9-14-1.1-6.6-7.4-10.6-13.7-9.1-6.3 1.4-10.3 7.7-9.1 14 1.4 6.6 7.6 10.6 13.9 9.1zM34.4 226.3c-10-6.9-23.7-4.3-30.6 6-6.9 10-4.3 24 5.7 30.9 10 7.1 23.7 4.6 30.6-5.7 6.9-10.4 4.3-24.1-5.7-31.2z"/>
                </svg>
                Join on Meetup
              </a>
            )}
            {community.website && (
              <a
                href={community.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 min-w-[200px] bg-secondary text-secondary-foreground rounded-lg px-6 py-3 font-semibold hover:bg-secondary/90 transition text-center"
              >
                Visit Website →
              </a>
            )}
            <a
              href={`/communities/${community.slug}`}
              className="flex-1 min-w-[200px] bg-primary/10 text-primary border border-primary/20 rounded-lg px-6 py-3 font-semibold hover:bg-primary/20 transition text-center"
            >
              View Full Page →
            </a>
          </div>
        </div>
      </div>
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
    <div className="bg-muted/30 border border-border rounded-lg p-4 text-center">
      <div className="text-3xl mb-2">{icon}</div>
      <div
        className={`text-xl font-bold text-primary mb-1 ${capitalize ? 'capitalize' : ''}`}
      >
        {value}
      </div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}

function getTierInfo(tier?: string) {
  switch (tier) {
    case 'platinum':
      return { icon: '💎', label: 'Platinum', textColor: 'text-cyan-400' };
    case 'gold':
      return { icon: '🏆', label: 'Gold', textColor: 'text-yellow-400' };
    case 'silver':
      return { icon: '🥈', label: 'Silver', textColor: 'text-gray-400' };
    case 'bronze':
      return { icon: '🥉', label: 'Bronze', textColor: 'text-orange-400' };
    default:
      return null;
  }
}
