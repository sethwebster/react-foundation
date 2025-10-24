/**
 * Admin Data Page
 * View system data, stats, and sources
 */

export default function AdminDataPage() {
  return (
    <div className="space-y-6 p-6 md:p-8">
      {/* System Info */}
      <div className="bg-card border border-border rounded-xl p-4 md:p-6">
        <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4">
          System Info
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 text-sm">
          <InfoRow label="Data Source" value="src/data/communities.ts" />
          <InfoRow label="Storage" value="Redis (permanent)" />
          <InfoRow label="Expiry" value="Never" />
          <InfoRow label="Seed Flag" value="communities:seeded" />
          <InfoRow label="Data Key" value="communities:all" />
          <InfoRow label="Format" value="JSON Array" />
        </div>
      </div>

      {/* Data Stats */}
      <div className="bg-card border border-border rounded-xl p-4 md:p-6">
        <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4">
          Data Statistics
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Total" value="65" />
          <StatCard label="Active" value="52" />
          <StatCard label="Inactive" value="13" />
          <StatCard label="Countries" value="28" />
          <StatCard label="Members" value="168K" />
          <StatCard label="Platinum" value="4" />
          <StatCard label="Gold" value="11" />
          <StatCard label="Silver" value="17" />
        </div>
      </div>

      {/* Source Files */}
      <div className="bg-card border border-border rounded-xl p-4 md:p-6">
        <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4">
          Source Files
        </h2>
        <div className="space-y-3">
          <FileInfo
            path="src/data/communities.ts"
            description="Single source of truth - 65 merged communities"
            lines="~15,000 lines"
            primary
          />
          <FileInfo
            path="data/normalized-meetups-data.json"
            description="Original JSON from react.dev (43 communities)"
            lines="905 lines"
            secondary
          />
          <FileInfo
            path="scripts/merge-all-communities.ts"
            description="Merge script to regenerate communities.ts"
            lines="~230 lines"
          />
          <FileInfo
            path="scripts/seed-communities.ts"
            description="Manual seed script for Redis"
            lines="~50 lines"
          />
        </div>
      </div>

      {/* Redis Keys */}
      <div className="bg-card border border-border rounded-xl p-4 md:p-6">
        <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4">
          Redis Keys
        </h2>
        <div className="space-y-2">
          <KeyInfo
            redisKey="communities:all"
            description="JSON array of all communities (permanent)"
          />
          <KeyInfo
            redisKey="communities:seeded"
            description='"true" flag indicating data is seeded (permanent)'
          />
        </div>
      </div>

      {/* API Endpoints */}
      <div className="bg-card border border-border rounded-xl p-4 md:p-6">
        <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4">
          API Endpoints
        </h2>
        <div className="space-y-2">
          <APIEndpoint method="GET" path="/api/communities" description="Fetch all communities (with filters)" />
          <APIEndpoint method="GET" path="/api/communities/stats" description="Get aggregate statistics" />
          <APIEndpoint method="GET" path="/api/communities/[slug]" description="Get single community" />
          <APIEndpoint method="POST" path="/api/admin/reset-communities" description="Clear and re-seed Redis" danger />
          <APIEndpoint method="POST" path="/api/admin/merge-communities" description="Merge all sources and seed" danger />
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground text-sm break-all">
        {value}
      </span>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-muted/30 border border-border rounded-lg p-3 md:p-4 text-center">
      <div className="text-xl md:text-2xl font-bold text-primary mb-1">
        {value}
      </div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}

function FileInfo({
  path,
  description,
  lines,
  primary,
  secondary,
}: {
  path: string;
  description: string;
  lines?: string;
  primary?: boolean;
  secondary?: boolean;
}) {
  return (
    <div className={`p-3 md:p-4 rounded-lg border ${
      primary ? 'bg-primary/5 border-primary/20' :
      secondary ? 'bg-muted/30 border-border' :
      'bg-card border-border'
    }`}>
      <div className="flex items-start gap-3">
        <span className="text-xl">📄</span>
        <div className="flex-1 min-w-0">
          <code className="text-xs md:text-sm font-mono text-foreground block mb-1 break-all">
            {path}
          </code>
          <p className="text-xs text-muted-foreground">{description}</p>
          {lines && (
            <p className="text-xs text-muted-foreground mt-1 opacity-60">{lines}</p>
          )}
        </div>
        {primary && (
          <span className="flex-shrink-0 text-xs bg-primary/20 text-primary px-2 py-1 rounded font-medium">
            ACTIVE
          </span>
        )}
      </div>
    </div>
  );
}

function KeyInfo({ redisKey, description }: { redisKey: string; description: string }) {
  return (
    <div className="bg-muted/30 p-3 rounded-lg">
      <code className="text-sm font-mono text-primary block mb-1">{redisKey}</code>
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
  );
}

function APIEndpoint({
  method,
  path,
  description,
  danger,
}: {
  method: string;
  path: string;
  description: string;
  danger?: boolean;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-2 p-3 bg-muted/30 rounded-lg">
      <span className={`text-xs font-mono px-2 py-1 rounded font-bold ${
        danger ? 'bg-destructive/20 text-destructive' :
        method === 'GET' ? 'bg-green-500/20 text-green-600 dark:text-green-400' :
        'bg-blue-500/20 text-blue-600 dark:text-blue-400'
      }`}>
        {method}
      </span>
      <code className="text-sm font-mono text-foreground flex-1">{path}</code>
      <span className="text-xs text-muted-foreground">{description}</span>
    </div>
  );
}
