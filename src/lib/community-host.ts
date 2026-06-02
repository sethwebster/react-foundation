const COMMUNITY_HOST_LABELS: Record<string, string> = {
  'eventbrite.com': 'Eventbrite',
  'lu.ma': 'Lu.ma',
  'meetup.com': 'Meetup',
};

export function getCommunityHostLabel(url: string): string {
  const hostname = new URL(url).hostname.replace(/^www\./, '');
  return COMMUNITY_HOST_LABELS[hostname] ?? hostname;
}
