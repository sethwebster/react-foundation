/**
 * Admin Home Page
 * Real-time dashboard with actionable insights
 */

import Link from 'next/link';
import { UserManagementService } from '@/lib/admin/user-management-service';
import { AccessRequestsService } from '@/lib/admin/access-requests-service';
import { getRedisClient } from '@/lib/redis';
import type { User } from '@/lib/admin/types';
import type { AccessRequest } from '@/lib/admin/access-requests-service';

export const dynamic = 'force-dynamic';

interface SystemStats {
  totalUsers: number;
  totalAdmins: number;
  pendingRequests: number;
  totalRequests: number;
  approvedRequests: number;
  bucketedRequests: number;
  deniedRequests: number;
  redisConnected: boolean;
  recentUsers: User[];
  recentRequests: AccessRequest[];
}

async function getSystemStats(): Promise<SystemStats | null> {
  try {
    const [users, admins, pendingRequests, allRequests] = await Promise.all([
      UserManagementService.getAllUsers(),
      UserManagementService.getAdmins(),
      AccessRequestsService.getPendingRequests(),
      AccessRequestsService.getAllRequests(),
    ]);
    const processedRequests = allRequests.filter(r => r.status !== 'pending');

    // Test Redis connection
    const client = getRedisClient();
    let redisConnected = false;
    try {
      await client.ping();
      redisConnected = true;
    } catch {
      redisConnected = false;
    }

    return {
      totalUsers: users.length,
      totalAdmins: admins.length,
      pendingRequests: pendingRequests.length,
      totalRequests: allRequests.length,
      approvedRequests: processedRequests.filter(r => r.status === 'approved').length,
      bucketedRequests: processedRequests.filter(r => r.status === 'bucketed').length,
      deniedRequests: processedRequests.filter(r => r.status === 'denied').length,
      redisConnected,
      recentUsers: users.slice(-5).reverse(),
      recentRequests: pendingRequests.slice(0, 3),
    };
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return null;
  }
}

export default async function AdminHomePage() {
  const stats = await getSystemStats();

  if (!stats) {
    return (
      <div className="space-y-6 p-6 md:p-8">
        <div className="bg-destructive/10 border border-destructive/50 rounded-xl p-6">
          <h2 className="text-xl font-bold text-destructive mb-2">System Error</h2>
          <p className="text-muted-foreground">Unable to load admin statistics. Check Redis connection.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 md:p-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
          Admin Dashboard
        </h1>
        <p className="text-muted-foreground">
          System overview and pending actions
        </p>
      </div>

      {/* Attention Required */}
      {stats.pendingRequests > 0 && (
        <div className="bg-primary/10 border-2 border-primary rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="text-3xl">⚠️</div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-foreground mb-2">
                Action Required
              </h3>
              <p className="text-muted-foreground mb-4">
                {stats.pendingRequests} access {stats.pendingRequests === 1 ? 'request' : 'requests'} waiting for review
              </p>
              <Link
                href="/admin/users/requests"
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg font-semibold hover:bg-primary/90 transition"
              >
                Review Requests →
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          label="Total Users"
          value={stats.totalUsers.toString()}
          icon="👥"
          href="/admin/users"
        />
        <MetricCard
          label="Admins"
          value={stats.totalAdmins.toString()}
          icon="👑"
          href="/admin/users"
        />
        <MetricCard
          label="Pending Requests"
          value={stats.pendingRequests.toString()}
          icon="📧"
          href="/admin/users/requests"
          highlight={stats.pendingRequests > 0}
        />
        <MetricCard
          label="Total Requests"
          value={stats.totalRequests.toString()}
          icon="📊"
          href="/admin/users/requests"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* System Status */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="text-lg font-bold text-foreground mb-4">System Status</h3>
          <div className="space-y-3">
            <StatusRow
              label="Redis Connection"
              status={stats.redisConnected ? 'connected' : 'error'}
            />
            <StatusRow
              label="User Management"
              status="operational"
            />
            <StatusRow
              label="Access Requests"
              status="operational"
            />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="text-lg font-bold text-foreground mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            <QuickActionButton
              href="/admin/users"
              icon="👥"
              label="Manage Users"
            />
            <QuickActionButton
              href="/admin/users/requests"
              icon="📧"
              label="View Requests"
            />
            <QuickActionButton
              href="/admin/data"
              icon="🔍"
              label="Inspect Data"
            />
            <QuickActionButton
              href="/admin/reset"
              icon="⚠️"
              label="Reset System"
              dangerous
            />
          </div>
        </div>
      </div>

      {/* Recent Pending Requests */}
      {stats.recentRequests.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-foreground">Recent Pending Requests</h3>
            <Link
              href="/admin/users/requests"
              className="text-sm text-primary hover:text-primary/80 transition"
            >
              View All →
            </Link>
          </div>
          <div className="space-y-3">
            {stats.recentRequests.map((req) => (
              <div
                key={req.id}
                className="flex items-center justify-between p-3 bg-muted rounded-lg"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">{req.email}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(req.requestedAt).toLocaleDateString()}
                  </p>
                </div>
                <Link
                  href={`/admin/users/requests?id=${req.id}`}
                  className="ml-4 text-sm bg-primary text-primary-foreground px-3 py-1 rounded hover:bg-primary/90 transition"
                >
                  Review
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Request Stats */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h3 className="text-lg font-bold text-foreground mb-4">Request Statistics</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatItem
            label="Approved"
            value={stats.approvedRequests}
            color="success"
          />
          <StatItem
            label="Bucketed"
            value={stats.bucketedRequests}
            color="accent"
          />
          <StatItem
            label="Denied"
            value={stats.deniedRequests}
            color="destructive"
          />
          <StatItem
            label="Pending"
            value={stats.pendingRequests}
            color="primary"
          />
        </div>
      </div>

      {/* Recent Users */}
      {stats.recentUsers.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-foreground">Recently Added Users</h3>
            <Link
              href="/admin/users"
              className="text-sm text-primary hover:text-primary/80 transition"
            >
              Manage Users →
            </Link>
          </div>
          <div className="space-y-2">
            {stats.recentUsers.map((user) => (
              <div
                key={user.email}
                className="flex items-center justify-between p-3 bg-muted rounded-lg"
              >
                <div className="flex-1">
                  <p className="font-medium text-foreground">{user.email}</p>
                  <p className="text-sm text-muted-foreground">
                    Added {new Date(user.addedAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex flex-wrap gap-1 justify-end">
                  {(user.roles || []).filter(role => role !== 'user').length === 0 ? (
                    <span className="text-xs text-muted-foreground italic">Basic User</span>
                  ) : (
                    (user.roles || []).filter(role => role !== 'user').map(role => (
                      <span
                        key={role}
                        className={`px-2 py-1 rounded text-xs font-semibold ${
                          role === 'admin'
                            ? 'bg-accent/20 text-accent-foreground'
                            : role === 'community_manager'
                            ? 'bg-primary/20 text-primary-foreground'
                            : role === 'library_manager'
                            ? 'bg-success/20 text-success-foreground'
                            : 'bg-muted/60 text-muted-foreground'
                        }`}
                      >
                        {role}
                      </span>
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function MetricCard({
  label,
  value,
  icon,
  href,
  highlight = false,
}: {
  label: string;
  value: string;
  icon: string;
  href?: string;
  highlight?: boolean;
}) {
  const content = (
    <div
      className={`bg-card border rounded-lg p-4 text-center transition ${
        highlight
          ? 'border-primary bg-primary/5'
          : 'border-border hover:bg-muted'
      } ${href ? 'cursor-pointer' : ''}`}
    >
      <div className="text-2xl mb-2">{icon}</div>
      <div className="text-2xl md:text-3xl font-bold text-foreground mb-1">
        {value}
      </div>
      <div className="text-xs md:text-sm text-muted-foreground">{label}</div>
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}

function StatusRow({
  label,
  status,
}: {
  label: string;
  status: 'connected' | 'operational' | 'error';
}) {
  const statusConfig = {
    connected: { icon: '✓', text: 'Connected', color: 'text-success-foreground bg-success/20' },
    operational: { icon: '✓', text: 'Operational', color: 'text-success-foreground bg-success/20' },
    error: { icon: '✗', text: 'Error', color: 'text-destructive-foreground bg-destructive/20' },
  };

  const config = statusConfig[status];

  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span
        className={`text-xs px-2 py-1 rounded-full font-medium ${config.color}`}
      >
        {config.icon} {config.text}
      </span>
    </div>
  );
}

function QuickActionButton({
  href,
  icon,
  label,
  dangerous = false,
}: {
  href: string;
  icon: string;
  label: string;
  dangerous?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`block p-3 rounded-lg border text-center transition ${
        dangerous
          ? 'border-destructive/30 bg-destructive/5 hover:bg-destructive/10'
          : 'border-border hover:bg-muted'
      }`}
    >
      <div className="text-2xl mb-1">{icon}</div>
      <div className={`text-sm font-medium ${dangerous ? 'text-destructive' : 'text-foreground'}`}>
        {label}
      </div>
    </Link>
  );
}

function StatItem({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: 'success' | 'destructive' | 'primary' | 'accent';
}) {
  const colorClass = {
    success: 'text-success-foreground',
    destructive: 'text-destructive-foreground',
    primary: 'text-primary-foreground',
    accent: 'text-accent-foreground',
  }[color];

  return (
    <div className="text-center">
      <div className={`text-3xl font-bold ${colorClass} mb-1`}>{value}</div>
      <div className="text-sm text-muted-foreground">{label}</div>
    </div>
  );
}
