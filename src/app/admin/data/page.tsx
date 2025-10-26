/**
 * Admin Data Inspection Page
 * Real-time Redis data and statistics
 */

import { getRedisClient } from '@/lib/redis';
import { UserManagementService, type User } from '@/lib/admin/user-management-service';
import { AccessRequestsService, type AccessRequest } from '@/lib/admin/access-requests-service';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

interface RedisInspectionData {
  totalKeys: number;
  userKeys: number;
  requestKeys: number;
  communityKeys: number;
  dbSize: number;
  memoryUsed: string;
  users: User[];
  requests: AccessRequest[];
  keysByNamespace: Record<string, number>;
}

async function getRedisInspection(): Promise<RedisInspectionData | null> {
  try {
    const client = getRedisClient();

    // Helper function to scan keys with a pattern (non-blocking)
    const scanKeys = async (pattern: string): Promise<string[]> => {
      const keys: string[] = [];
      let cursor = '0';

      do {
        const result = await client.scan(cursor, {
          MATCH: pattern,
          COUNT: 100,
        });
        cursor = result[0];
        keys.push(...result[1]);
      } while (cursor !== '0');

      return keys;
    };

    // Get all keys with different patterns using SCAN (non-blocking)
    const [
      userKeys,
      requestKeys,
      communityKeys,
      allKeys,
    ] = await Promise.all([
      scanKeys('admin:user:*'),
      scanKeys('admin:request:*'),
      scanKeys('communities:*'),
      scanKeys('*'),
    ]);

    // Get specific data
    const [users, requests] = await Promise.all([
      UserManagementService.getAllUsers(),
      AccessRequestsService.getAllRequests(),
    ]);

    // Get Redis info
    let dbSize = 0;
    let memoryUsed = 'N/A';
    try {
      dbSize = await client.dbsize();
      const info = await client.info('memory');
      const match = info.match(/used_memory_human:(\S+)/);
      if (match) memoryUsed = match[1];
    } catch (error) {
      logger.warn('Unable to fetch Redis memory stats:', error);
    }

    return {
      totalKeys: allKeys.length,
      userKeys: userKeys.length,
      requestKeys: requestKeys.length,
      communityKeys: communityKeys.length,
      dbSize,
      memoryUsed,
      users,
      requests,
      keysByNamespace: {
        'admin:user': userKeys.length,
        'admin:request': requestKeys.length,
        'admin:users': allKeys.filter(k => k.startsWith('admin:users:')).length,
        'admin:requests': allKeys.filter(k => k.startsWith('admin:requests:')).length,
        'communities': communityKeys.length,
      },
    };
  } catch (error) {
    logger.error('Error inspecting Redis:', error);
    return null;
  }
}

export default async function AdminDataPage() {
  const data = await getRedisInspection();

  if (!data) {
    return (
      <div className="space-y-6 p-6 md:p-8">
        <div className="bg-destructive/10 border border-destructive/50 rounded-xl p-6">
          <h2 className="text-xl font-bold text-destructive mb-2">Connection Error</h2>
          <p className="text-muted-foreground">Unable to connect to Redis. Check your configuration.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 md:p-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
          Data Inspection
        </h1>
        <p className="text-muted-foreground">
          Real-time Redis database statistics and contents
        </p>
      </div>

      {/* Redis Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Total Keys"
          value={data.totalKeys.toString()}
          icon="🔑"
        />
        <StatCard
          label="Database Size"
          value={data.dbSize.toString()}
          icon="💾"
        />
        <StatCard
          label="Memory Used"
          value={data.memoryUsed}
          icon="📊"
        />
        <StatCard
          label="Namespaces"
          value={Object.keys(data.keysByNamespace).length.toString()}
          icon="📂"
        />
      </div>

      {/* Key Distribution by Namespace */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h3 className="text-lg font-bold text-foreground mb-4">Key Distribution</h3>
        <div className="space-y-2">
          {Object.entries(data.keysByNamespace).map(([namespace, count]) => (
            <div
              key={namespace}
              className="flex items-center justify-between p-3 bg-muted rounded-lg"
            >
              <code className="text-sm font-mono text-foreground">{namespace}:*</code>
              <span className="text-sm font-semibold text-primary">{count} keys</span>
            </div>
          ))}
        </div>
      </div>

      {/* User Data */}
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-foreground">User Data</h3>
          <span className="text-sm text-muted-foreground">
            {data.users.length} users in Redis
          </span>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <InfoCard
            label="Total Users"
            value={data.users.length.toString()}
            detail={(() => {
              const adminCount = data.users.filter((u: User) => u.role === 'admin').length;
              const userCount = data.users.filter((u: User) => u.role === 'user').length;
              return `${adminCount} admins, ${userCount} users`;
            })()}
          />
          <InfoCard
            label="Redis Keys"
            value={data.userKeys.toString()}
            detail={`admin:user:* + admin:users:*`}
          />
        </div>

        {data.users.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-semibold text-muted-foreground mb-2">
              Sample User Objects
            </h4>
            <div className="space-y-2">
              {data.users.slice(0, 3).map((user) => (
                <details key={user.email} className="bg-muted rounded-lg p-3">
                  <summary className="cursor-pointer font-mono text-sm text-foreground">
                    admin:user:{user.email}
                  </summary>
                  <pre className="mt-2 text-xs overflow-auto text-muted-foreground">
                    {JSON.stringify(user, null, 2)}
                  </pre>
                </details>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Access Request Data */}
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-foreground">Access Requests</h3>
          <span className="text-sm text-muted-foreground">
            {data.requests.length} total requests
          </span>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <InfoCard
            label="Pending"
            value={data.requests.filter(r => r.status === 'pending').length.toString()}
            color="primary"
          />
          <InfoCard
            label="Approved"
            value={data.requests.filter(r => r.status === 'approved').length.toString()}
            color="success"
          />
          <InfoCard
            label="Denied"
            value={data.requests.filter(r => r.status === 'denied').length.toString()}
            color="destructive"
          />
        </div>

        {data.requests.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-semibold text-muted-foreground mb-2">
              Sample Request Objects
            </h4>
            <div className="space-y-2">
              {data.requests.slice(0, 2).map((request) => (
                <details key={request.id} className="bg-muted rounded-lg p-3">
                  <summary className="cursor-pointer font-mono text-sm text-foreground">
                    admin:request:{request.id}
                  </summary>
                  <pre className="mt-2 text-xs overflow-auto text-muted-foreground">
                    {JSON.stringify(request, null, 2)}
                  </pre>
                </details>
              ))}
            </div>
          </div>
        )}
      </div>

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

      {/* Redis Configuration */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h3 className="text-lg font-bold text-foreground mb-4">Redis Configuration</h3>
        <div className="space-y-3">
          <ConfigRow
            label="Connection URL"
            value={process.env.REDIS_URL ? '✓ Configured' : '✗ Not Set'}
            status={process.env.REDIS_URL ? 'success' : 'error'}
          />
          <ConfigRow
            label="Environment"
            value={process.env.NODE_ENV || 'development'}
            status="info"
          />
          <ConfigRow
            label="Total Keys in DB"
            value={data.totalKeys.toString()}
            status="info"
          />
        </div>
      </div>

      {/* Key Namespace Reference */}
      <div className="bg-muted/30 border border-border rounded-xl p-6">
        <h3 className="text-lg font-bold text-foreground mb-4">Redis Key Reference</h3>
        <div className="space-y-2 text-sm">
          <KeyReference
            pattern="admin:user:[email]"
            description="Individual user data (email, role, timestamps)"
          />
          <KeyReference
            pattern="admin:users:all"
            description="Set of all user emails"
          />
          <KeyReference
            pattern="admin:users:admins"
            description="Set of admin user emails"
          />
          <KeyReference
            pattern="admin:request:[id]"
            description="Individual access request data"
          />
          <KeyReference
            pattern="admin:requests:pending"
            description="Set of pending request IDs"
          />
          <KeyReference
            pattern="admin:requests:all"
            description="Set of all request IDs"
          />
          <KeyReference
            pattern="communities:all"
            description="JSON array of all community data"
          />
          <KeyReference
            pattern="communities:seeded"
            description="Flag indicating communities are seeded"
          />
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: string;
}) {
  return (
    <div className="bg-card border border-border rounded-lg p-4 text-center">
      <div className="text-2xl mb-2">{icon}</div>
      <div className="text-2xl md:text-3xl font-bold text-primary mb-1">{value}</div>
      <div className="text-xs md:text-sm text-muted-foreground">{label}</div>
    </div>
  );
}

function InfoCard({
  label,
  value,
  detail,
  color = 'primary',
}: {
  label: string;
  value: string;
  detail?: string;
  color?: 'primary' | 'success' | 'destructive';
}) {
  const colorClass = {
    primary: 'text-primary',
    success: 'text-success-foreground',
    destructive: 'text-destructive-foreground',
  }[color];

  return (
    <div className="bg-muted rounded-lg p-4">
      <div className="text-sm text-muted-foreground mb-1">{label}</div>
      <div className={`text-2xl font-bold ${colorClass} mb-1`}>{value}</div>
      {detail && <div className="text-xs text-muted-foreground">{detail}</div>}
    </div>
  );
}

function ConfigRow({
  label,
  value,
  status,
}: {
  label: string;
  value: string;
  status: 'success' | 'error' | 'info';
}) {
  const statusColor = {
    success: 'text-success-foreground',
    error: 'text-destructive-foreground',
    info: 'text-primary',
  }[status];

  return (
    <div className="flex items-center justify-between py-2 border-b border-border last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <code className={`text-sm font-mono ${statusColor}`}>{value}</code>
    </div>
  );
}

function KeyReference({
  pattern,
  description,
}: {
  pattern: string;
  description: string;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-2 p-2 hover:bg-muted/50 rounded">
      <code className="text-xs font-mono text-primary flex-shrink-0">{pattern}</code>
      <span className="text-xs text-muted-foreground">{description}</span>
    </div>
  );
}
