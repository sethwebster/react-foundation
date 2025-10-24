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
    name: '', country: '',
    street: '', city: '', state: '', postal: '', // Address components
    description: '', meetup_url: '', website: '', member_count: '',
    organizer_name: '', organizer_email: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{success: boolean; message: string} | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user) { router.push('/api/auth/signin'); return; }
    setSubmitting(true); setResult(null);
    try {
      // Build full address from components
      const fullAddress = [formData.street, formData.city, formData.state, formData.postal, formData.country]
        .filter(Boolean)
        .join(', ');

      const res = await fetch('/api/communities/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          address: fullAddress, // Constructed from components
          member_count: parseInt(formData.member_count) || 0,
          submitted_by: session.user.email
        })
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

  // Get address field labels based on country
  const getAddressFields = () => {
    const country = formData.country;

    if (country === 'United States' || country === 'Canada') {
      return {
        street: { label: 'Street Address', placeholder: '123 Main Street', required: true },
        city: { label: 'City', placeholder: 'San Francisco', required: true },
        state: { label: country === 'United States' ? 'State' : 'Province', placeholder: country === 'United States' ? 'CA' : 'Ontario', required: true },
        postal: { label: country === 'United States' ? 'ZIP Code' : 'Postal Code', placeholder: country === 'United States' ? '94102' : 'M5H 2N2', required: false }
      };
    }

    if (country === 'United Kingdom') {
      return {
        street: { label: 'Street Address', placeholder: '123 High Street', required: true },
        city: { label: 'City', placeholder: 'London', required: true },
        state: { label: 'County (Optional)', placeholder: 'Greater London', required: false },
        postal: { label: 'Postcode', placeholder: 'SW1A 1AA', required: false }
      };
    }

    if (country === 'India') {
      return {
        street: { label: 'Street Address', placeholder: '123, MG Road', required: true },
        city: { label: 'City', placeholder: 'Bangalore', required: true },
        state: { label: 'State', placeholder: 'Karnataka', required: true },
        postal: { label: 'PIN Code', placeholder: '560001', required: false }
      };
    }

    if (country === 'Germany') {
      return {
        street: { label: 'Straße', placeholder: 'Hauptstraße 123', required: true },
        city: { label: 'Stadt', placeholder: 'Berlin', required: true },
        state: { label: 'Bundesland (Optional)', placeholder: 'Berlin', required: false },
        postal: { label: 'PLZ', placeholder: '10115', required: true }
      };
    }

    // Default for other countries
    return {
      street: { label: 'Street Address', placeholder: '123 Main Street', required: true },
      city: { label: 'City', placeholder: 'Amsterdam', required: true },
      state: { label: 'State/Province (Optional)', placeholder: '', required: false },
      postal: { label: 'Postal Code (Optional)', placeholder: '', required: false }
    };
  };

  const fields = formData.country ? getAddressFields() : null;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div><label className="block text-sm font-medium mb-2">Community Name <span className="text-destructive">*</span></label>
        <input required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="React Amsterdam" className="w-full px-4 py-2 bg-card border border-border rounded-lg focus:ring-2 focus:ring-primary" />
      </div>

      <CountrySelect label="Country" required value={formData.country} onChange={(country) => setFormData({...formData, country})} placeholder="Select your country first" />

      {fields && (
        <>
          <div><label className="block text-sm font-medium mb-2">{fields.street.label} {fields.street.required && <span className="text-destructive">*</span>}</label>
            <input required={fields.street.required} value={formData.street} onChange={(e) => setFormData({...formData, street: e.target.value})} placeholder={fields.street.placeholder} className="w-full px-4 py-2 bg-card border border-border rounded-lg focus:ring-2 focus:ring-primary" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium mb-2">{fields.city.label} {fields.city.required && <span className="text-destructive">*</span>}</label>
              <input required={fields.city.required} value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} placeholder={fields.city.placeholder} className="w-full px-4 py-2 bg-card border border-border rounded-lg focus:ring-2 focus:ring-primary" />
            </div>
            {fields.state.label && (
              <div><label className="block text-sm font-medium mb-2">{fields.state.label} {fields.state.required && <span className="text-destructive">*</span>}</label>
                <input required={fields.state.required} value={formData.state} onChange={(e) => setFormData({...formData, state: e.target.value})} placeholder={fields.state.placeholder} className="w-full px-4 py-2 bg-card border border-border rounded-lg focus:ring-2 focus:ring-primary" />
              </div>
            )}
          </div>

          {fields.postal.label && (
            <div><label className="block text-sm font-medium mb-2">{fields.postal.label} {fields.postal.required && <span className="text-destructive">*</span>}</label>
              <input required={fields.postal.required} value={formData.postal} onChange={(e) => setFormData({...formData, postal: e.target.value})} placeholder={fields.postal.placeholder} className="w-full px-4 py-2 bg-card border border-border rounded-lg focus:ring-2 focus:ring-primary" />
            </div>
          )}
        </>
      )}

      {!formData.country && (
        <div className="p-4 bg-muted/30 rounded-lg text-sm text-muted-foreground text-center">
          👆 Select a country above to continue
        </div>
      )}
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
