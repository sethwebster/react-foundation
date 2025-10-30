/**
 * Admin Data Communities Page
 * Shows community data and management
 */

import { getRedisClient } from '@/lib/redis';
import { getCommunities, migrateFromOldFormat } from '@/lib/redis-communities';
import { RFDS } from '@/components/rfds';
import { MigrationButton } from './migration-button';
import { CommunitiesTable } from '@/components/admin/CommunitiesTable';

export const dynamic = 'force-dynamic';

async function getCommunitiesData() {
  try {
    const client = getRedisClient();
    const communityKeys = await client.keys('communities:*');
    
    // Check storage format
    const oldFormatExists = await client.exists('communities:all');
    const indexExists = await client.exists('communities:index');
    const storageFormat = indexExists ? 'individual-keys' : oldFormatExists ? 'legacy-single-key' : 'none';
    
    // Try to migrate if old format exists but index doesn't
    if (oldFormatExists && !indexExists) {
      console.log('🔄 Old format detected, attempting migration...');
      try {
        await migrateFromOldFormat();
        console.log('✅ Migration completed');
      } catch (error) {
        console.error('❌ Migration failed:', error);
      }
    }
    
    // Get actual communities from Redis
    const communities = await getCommunities();
    
    // Calculate stats
    const activeCommunities = communities.filter(c => c.status === 'active').length;
    const countries = new Set(communities.map(c => c.country)).size;
    const totalMembers = communities.reduce((sum, c) => sum + (c.member_count || 0), 0);

    return {
      communityKeys: communityKeys.length,
      totalCommunities: communities.length,
      activeCommunities,
      countries,
      totalMembers,
      communities, // Include for display
      storageFormat,
      needsMigration: oldFormatExists && !indexExists,
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
      <div className="bg-card border border-border rounded-xl p-6">
        <h3 className="text-lg font-bold text-foreground mb-4">Communities Data</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
          <InfoCard
            label="Total Communities"
            value={data.totalCommunities.toString()}
            detail={`${data.activeCommunities} active`}
          />
          <InfoCard
            label="Active Communities"
            value={data.activeCommunities.toString()}
            detail={`${data.totalCommunities - data.activeCommunities} inactive`}
          />
          <InfoCard
            label="Countries"
            value={data.countries.toString()}
            detail="Unique countries"
          />
          <InfoCard
            label="Total Members"
            value={data.totalMembers.toLocaleString()}
            detail="Across all communities"
          />
        </div>
        
        {/* Redis Keys Info */}
        <div className="pt-4 border-t border-border">
          <p className="text-sm text-muted-foreground mb-2">Redis Storage:</p>
          <div className="grid gap-4 md:grid-cols-2">
            <InfoCard
              label="Redis Keys"
              value={data.communityKeys.toString()}
              detail="Keys matching communities:*"
            />
            <InfoCard
              label="Storage Format"
              value={data.storageFormat === 'individual-keys' ? 'Individual Keys' : data.storageFormat === 'legacy-single-key' ? 'Legacy (Single Key)' : 'None'}
              detail={data.storageFormat === 'individual-keys' ? 'Each community in communities:{id}' : data.storageFormat === 'legacy-single-key' ? 'All in communities:all (needs migration)' : 'No data found'}
            />
          </div>
        </div>
      </div>
      
      {/* Communities Table */}
      {data.communities && data.communities.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="text-lg font-bold text-foreground mb-4">All Communities ({data.communities.length})</h3>
          <CommunitiesTable communities={data.communities} />
        </div>
      )}

      {data.needsMigration && (
        <div className="bg-warning/10 border border-warning/50 rounded-xl p-6">
          <h3 className="text-lg font-bold text-warning-foreground mb-2">⚠️ Migration Needed</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Communities are stored in the old single-key format. Migration should happen automatically, but if you see this message, you may need to trigger it manually.
          </p>
          <MigrationButton />
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
    <RFDS.StatCard
      label={label}
      value={value}
      detail={detail}
      color="primary"
      variant="default"
      className="bg-muted"
    />
  );
}

