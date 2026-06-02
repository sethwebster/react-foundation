const COMMUNITY_HOST_LABELS: Record<string, string> = {
  'eventbrite.com': 'Eventbrite',
  'lu.ma': 'Lu.ma',
  'meetup.com': 'Meetup',
};

export function getCommunityHostLabel(url: string): string {
  const hostname = url
    .replace(/^[a-z]+:\/\//i, '')
    .replace(/^www\./, '')
    .split('/')[0]
    .toLowerCase();

  return COMMUNITY_HOST_LABELS[hostname] ?? hostname;
}
