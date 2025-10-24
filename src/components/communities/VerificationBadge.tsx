/**
 * Verification Badge Component
 * Shows verification status of a community
 */

'use client';

export function VerificationBadge({
  verified,
  status,
  size = 'sm',
}: {
  verified: boolean;
  status?: 'pending' | 'verified' | 'rejected';
  size?: 'sm' | 'md' | 'lg';
}) {
  // Legacy communities: verified=true means verified
  // New communities: use verification_status
  const finalStatus = status || (verified ? 'verified' : 'pending');

  const config = {
    verified: {
      icon: '✓',
      bg: 'bg-green-500/10',
      text: 'text-green-600 dark:text-green-400',
      border: 'border-green-500/20',
      label: 'Verified',
    },
    pending: {
      icon: '⏳',
      bg: 'bg-yellow-500/10',
      text: 'text-yellow-600 dark:text-yellow-400',
      border: 'border-yellow-500/20',
      label: 'Pending Review',
    },
    rejected: {
      icon: '✗',
      bg: 'bg-red-500/10',
      text: 'text-red-600 dark:text-red-400',
      border: 'border-red-500/20',
      label: 'Not Verified',
    },
  }[finalStatus];

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base',
  }[size];

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-medium border ${config.bg} ${config.text} ${config.border} ${sizeClasses}`}
      title={config.label}
    >
      <span>{config.icon}</span>
      <span className="hidden sm:inline">{config.label}</span>
    </span>
  );
}
