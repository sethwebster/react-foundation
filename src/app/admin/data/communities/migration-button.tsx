'use client';

import { useState } from 'react';

export function MigrationButton() {
  const [migrating, setMigrating] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleMigrate = async () => {
    setMigrating(true);
    setResult(null);

    try {
      const response = await fetch('/api/admin/migrate-communities', {
        method: 'POST',
      });

      const data = await response.json();

      if (data.success) {
        setResult(`✅ Migration complete! ${data.message}`);
        setTimeout(() => window.location.reload(), 2000);
      } else {
        setResult(`❌ Failed: ${data.error}`);
      }
    } catch (err: any) {
      setResult(`❌ Error: ${err.message}`);
    } finally {
      setMigrating(false);
    }
  };

  return (
    <div className="space-y-2">
      <button
        onClick={handleMigrate}
        disabled={migrating}
        className="px-4 py-2 bg-warning text-warning-foreground rounded-lg hover:bg-warning/90 transition text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {migrating ? 'Migrating...' : 'Trigger Migration Now'}
      </button>
      {result && (
        <p className={`text-sm ${result.includes('✅') ? 'text-success-foreground' : 'text-destructive'}`}>
          {result}
        </p>
      )}
    </div>
  );
}

