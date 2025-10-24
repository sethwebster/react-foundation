'use client';
import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { CountrySelect } from '@/components/ui/country-select';

interface Props { fullPage?: boolean; onSuccess?: () => void; }

export function AddCommunityForm({ fullPage, onSuccess }: Props = {}) {
  const { data: session } = useSession();
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '', address: '', city: '', country: '', description: '',
    meetup_url: '', website: '', member_count: '', organizer_name: '', organizer_email: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{success: boolean; message: string} | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user) { router.push('/api/auth/signin'); return; }
    setSubmitting(true); setResult(null);
    try {
      const res = await fetch('/api/communities/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, member_count: parseInt(formData.member_count) || 0, submitted_by: session.user.email })
      });
      const data = await res.json();
      if (data.success) {
        setResult({ success: true, message: 'Community submitted!' });
        setTimeout(() => { onSuccess?.() || (fullPage && router.push('/communities')); }, 2000);
      } else {
        setResult({ success: false, message: data.error || 'Failed' });
      }
    } catch (err: any) {
      setResult({ success: false, message: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  if (!session?.user) {
    return (
      <div className="text-center py-12">
        <div className="text-5xl mb-4">🔐</div>
        <h2 className="text-2xl font-bold mb-3">Login Required</h2>
        <p className="text-muted-foreground mb-6">Please sign in</p>
        <button onClick={() => router.push('/api/auth/signin')} className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold">Sign In</button>
      </div>
    );
  }

  // Address placeholder based on country
  const getAddressPlaceholder = () => {
    if (formData.country === 'United States') return '123 Main Street, City, State ZIP';
    if (formData.country === 'United Kingdom') return '123 High Street, City, Postcode';
    if (formData.country === 'Canada') return '123 Main Street, City, Province, Postal Code';
    if (formData.country === 'India') return '123, Street Name, City, State, PIN';
    if (formData.country === 'Germany') return 'Straße 123, PLZ Stadt';
    return 'Full address including venue, street, city';
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div><label className="block text-sm font-medium mb-2">Community Name <span className="text-destructive">*</span></label>
        <input required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="React Amsterdam" className="w-full px-4 py-2 bg-card border border-border rounded-lg focus:ring-2 focus:ring-primary" />
      </div>
      <CountrySelect label="Country" required value={formData.country} onChange={(country) => setFormData({...formData, country})} placeholder="Select your country first" />
      <div><label className="block text-sm font-medium mb-2">Full Address <span className="text-destructive">*</span></label>
        <input required value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} placeholder={getAddressPlaceholder()} className="w-full px-4 py-2 bg-card border border-border rounded-lg focus:ring-2 focus:ring-primary" />
        <p className="text-xs text-muted-foreground mt-1">Include venue name, street, city - we'll use this to place your pin on the map</p>
      </div>
      <div><label className="block text-sm font-medium mb-2">City <span className="text-destructive">*</span></label>
        <input required value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} placeholder={formData.country === 'United States' ? 'San Francisco' : 'Amsterdam'} className="w-full px-4 py-2 bg-card border border-border rounded-lg focus:ring-2 focus:ring-primary" />
      </div>
      <div><label className="block text-sm font-medium mb-2">Description <span className="text-destructive">*</span></label>
        <textarea required value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} rows={4} className="w-full px-4 py-2 bg-card border border-border rounded-lg resize-none focus:ring-2 focus:ring-primary" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div><label className="block text-sm font-medium mb-2">Group URL</label>
          <input type="url" value={formData.meetup_url} onChange={(e) => setFormData({...formData, meetup_url: e.target.value})} className="w-full px-4 py-2 bg-card border border-border rounded-lg focus:ring-2 focus:ring-primary" />
        </div>
        <div><label className="block text-sm font-medium mb-2">Website</label>
          <input type="url" value={formData.website} onChange={(e) => setFormData({...formData, website: e.target.value})} className="w-full px-4 py-2 bg-card border border-border rounded-lg focus:ring-2 focus:ring-primary" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div><label className="block text-sm font-medium mb-2">Your Name <span className="text-destructive">*</span></label>
          <input required value={formData.organizer_name} onChange={(e) => setFormData({...formData, organizer_name: e.target.value})} className="w-full px-4 py-2 bg-card border border-border rounded-lg focus:ring-2 focus:ring-primary" />
        </div>
        <div><label className="block text-sm font-medium mb-2">Email <span className="text-destructive">*</span></label>
          <input required type="email" value={formData.organizer_email} onChange={(e) => setFormData({...formData, organizer_email: e.target.value})} className="w-full px-4 py-2 bg-card border border-border rounded-lg focus:ring-2 focus:ring-primary" />
        </div>
      </div>
      {result && <div className={`p-4 rounded-lg border ${result.success ? 'bg-green-500/10 border-green-500/20' : 'bg-destructive/10 border-destructive/20'}`}>
        <p className={`text-sm font-medium ${result.success ? 'text-green-600 dark:text-green-400' : 'text-destructive'}`}>{result.message}</p>
      </div>}
      <button type="submit" disabled={submitting} className="w-full bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 disabled:opacity-50">
        {submitting ? 'Submitting...' : 'Submit Community'}
      </button>
      <p className="text-xs text-muted-foreground text-center">Reviewed before being added</p>
    </form>
  );
}
