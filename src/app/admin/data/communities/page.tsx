/**
 * Admin Data Communities Page
 * Shows community data and management
 */

import { getRedisClient } from '@/lib/redis';

export const dynamic = 'force-dynamic';

async function getCommunitiesData() {
  try {
    const client = getRedisClient();
    const communityKeys = await client.keys('communities:*');

    return {
      communityKeys: communityKeys.length,
    };
  } catch (error) {
    console.error('Error fetching communities data:', error);
    return null;
  }
}

export default async function CommunitiesPage() {
  const data = await getCommunitiesData();

  if (!data) {
    return (
      <div className="bg-destructive/10 border border-destructive/50 rounded-xl p-6">
        <h2 className="text-xl font-bold text-destructive mb-2">Connection Error</h2>
        <p className="text-muted-foreground">Unable to connect to Redis. Check your configuration.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Communities Data */}
      {data.communityKeys > 0 && (
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="text-lg font-bold text-foreground mb-4">Communities Data</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <InfoCard
              label="Community Keys"
              value={data.communityKeys.toString()}
              detail="Keys starting with communities:*"
            />
            <InfoCard
              label="Key Patterns"
              value="2"
              detail="communities:all, communities:seeded"
            />
          </div>
        </div>
      )}

      <div className="bg-muted/30 border border-border rounded-xl p-6">
        <h3 className="text-lg font-bold text-foreground mb-4">Community Management</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Community data is managed through the Context ingestion system. Use the Context page to update community information.
        </p>
        <div className="flex gap-4">
          <a
            href="/admin/ingest-full"
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition text-sm font-medium"
          >
            Go to Context Manager
          </a>
        </div>
      </div>
    </div>
  );
}

function InfoCard({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail?: string;
}) {
  return (
    <div className="bg-muted rounded-lg p-4">
      <div className="text-sm text-muted-foreground mb-1">{label}</div>
      <div className="text-2xl font-bold text-primary mb-1">{value}</div>
      {detail && <div className="text-xs text-muted-foreground">{detail}</div>}
    </div>
  );
}
