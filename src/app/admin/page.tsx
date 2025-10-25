/**
 * Admin Home Page
 * Overview and quick actions
 */

export default function AdminHomePage() {
  return (
    <div className="space-y-6 p-6 md:p-8">
      {/* Welcome */}
      <div className="bg-card border border-border rounded-xl p-6 md:p-8">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
          Welcome to Admin
        </h2>
        <p className="text-foreground mb-6">
          Manage React Foundation data, communities, and system settings.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <QuickAction
            href="/admin/data"
            icon="📊"
            title="Data Overview"
            description="View system stats and data sources"
          />
          <QuickAction
            href="/admin/migrate-redis"
            icon="🔄"
            title="Migrate Redis"
            description="Move data from old to new Redis"
          />
          <QuickAction
            href="/admin/ingest-full"
            icon="🤖"
            title="Ingest Content"
            description="Load content via loaders (MDX, Communities, Libraries)"
          />
          <QuickAction
            href="/admin/reset"
            icon="⚠️"
            title="Reset Data"
            description="Clear and re-seed Redis"
            dangerous
          />
          <QuickAction
            href="/communities"
            icon="🗺️"
            title="View Communities"
            description="See the community map"
          />
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Communities" value="65" />
        <StatCard label="Countries" value="28" />
        <StatCard label="Total Members" value="168K" />
        <StatCard label="Active" value="52" />
      </div>

      {/* Status */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h3 className="text-lg font-bold text-foreground mb-4">
          System Status
        </h3>
        <div className="space-y-3">
          <StatusRow label="Redis Connection" status="connected" />
          <StatusRow label="Communities Seeded" status="yes" />
          <StatusRow label="Data Source" value="communities.ts" />
        </div>
      </div>
    </div>
  );
}

function QuickAction({
  href,
  icon,
  title,
  description,
  dangerous,
}: {
  href: string;
  icon: string;
  title: string;
  description: string;
  dangerous?: boolean;
}) {
  return (
    <a
      href={href}
      className={`block p-4 rounded-lg border transition ${
        dangerous
          ? 'border-destructive/30 bg-destructive/5 hover:bg-destructive/10'
          : 'border-border bg-card hover:bg-muted'
      }`}
    >
      <div className="text-3xl mb-2">{icon}</div>
      <h3 className={`font-semibold mb-1 ${dangerous ? 'text-destructive' : 'text-foreground'}`}>
        {title}
      </h3>
      <p className="text-xs text-muted-foreground">{description}</p>
    </a>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-card border border-border rounded-lg p-4 text-center">
      <div className="text-2xl md:text-3xl font-bold text-primary mb-1">
        {value}
      </div>
      <div className="text-xs md:text-sm text-muted-foreground">{label}</div>
    </div>
  );
}

function StatusRow({
  label,
  status,
  value,
}: {
  label: string;
  status?: 'connected' | 'yes' | 'no';
  value?: string;
}) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-border last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      {status && (
        <span
          className={`text-xs px-2 py-1 rounded-full font-medium ${
            status === 'connected' || status === 'yes'
              ? 'bg-green-500/10 text-green-600 dark:text-green-400'
              : 'bg-red-500/10 text-red-600 dark:text-red-400'
          }`}
        >
          {status === 'connected' ? '✓ Connected' : status === 'yes' ? '✓ Yes' : '✗ No'}
        </span>
      )}
      {value && <span className="text-sm font-medium text-foreground">{value}</span>}
    </div>
  );
}
