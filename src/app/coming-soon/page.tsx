/**
 * Coming Soon Page - Cyberpunk/Neon Style
 * Blocks access to site unless user is on allowlist
 */

'use client';

import React, { useState } from 'react';
import { signIn } from 'next-auth/react';
import { SiGithub } from '@icons-pack/react-simple-icons';
import { ReactLogo3D } from '@/components/ui/react-logo-3d';
import { Starfield } from '@/components/ui/starfield';
import {
  useAccessControl,
  useComingSoonRedirect,
  useAccessRequest,
} from '@/lib/access-control/use-access-control';

export default function ComingSoonPage() {
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Business logic in custom hooks
  const { isAuthenticated, userEmail } = useAccessControl();
  useComingSoonRedirect(); // Auto-redirects if allowlisted

  const {
    email,
    setEmail,
    message,
    setMessage,
    isSubmitting,
    submitted,
    submitRequest,
  } = useAccessRequest();

  const handleRequestAccess = async (e: React.FormEvent) => {
    e.preventDefault();

    // Use authenticated email
    if (userEmail) {
      setEmail(userEmail);
    }

    await submitRequest();
  };

  // Fade in after a brief delay
  React.useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Auto-show request form when user signs in
  React.useEffect(() => {
    if (isAuthenticated && userEmail) {
      setShowRequestForm(true);
    }
  }, [isAuthenticated, userEmail]);

  return (
    <div className={`dark fixed inset-0 overflow-hidden bg-slate-950 transition-opacity duration-1000 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
      {/* Cyberpunk Grid Background */}
      <div className="pointer-events-none absolute inset-0 opacity-20">
        <div
          className="h-full w-full"
          style={{
            backgroundImage: `
              linear-gradient(rgba(0, 255, 255, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0, 255, 255, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
            transform: 'perspective(500px) rotateX(60deg)',
            transformOrigin: 'center bottom',
          }}
        />
      </div>

      {/* Warm Gradient Overlay */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(239,68,68,0.08),_transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_35%,_rgba(251,146,60,0.15),_transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_20%,_rgba(236,72,153,0.12),_transparent_45%)]" />
      </div>

      {/* Scanline Effect - Temporarily disabled */}
      {/* <div
        className="pointer-events-none absolute inset-0 opacity-10"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, rgba(0, 255, 255, 0.5) 0px, transparent 1px, transparent 2px, rgba(0, 255, 255, 0.5) 3px)',
        }}
      /> */}

      {/* Three.js Starfield */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <Starfield />
      </div>

      {/* Content */}
      <div className="relative z-10 flex h-full flex-col items-center justify-center overflow-y-auto px-4 py-8">
        <div className="w-full max-w-2xl space-y-6 text-center">
          {/* Logo/Icon Area with 3D React Logo */}
          <div className="pointer-events-none relative mx-auto h-56 w-56">
            <div className="absolute inset-0 animate-pulse rounded-full bg-primary/20 blur-3xl" />
            <div className="relative h-full w-full">
              <ReactLogo3D scale={0.5} />
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <h1 className="text-4xl font-black uppercase tracking-wider sm:text-5xl md:text-6xl">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-amber-400 to-orange-500 drop-shadow-[0_0_20px_rgba(0,255,255,0.5)]">
                React Foundation
              </span>
            </h1>
            <div className="flex items-center justify-center gap-2">
              <div className="h-px w-8 bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />
              <p className="text-lg font-bold uppercase tracking-[0.3em] text-cyan-400 sm:text-xl">
                Coming Soon
              </p>
              <div className="h-px w-8 bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />
            </div>
          </div>

          {/* Description */}
          <p className="mx-auto max-w-xl text-sm text-cyan-100/80 sm:text-base">
            We&apos;re building something <span className="font-bold text-cyan-400">revolutionary</span> for the React ecosystem.
            Support open source maintainers, earn exclusive access, and shape the future of React together.
          </p>

          {/* Glitch Text Effect */}
          <div className="py-2">
            <div className="inline-block border border-primary/50 bg-slate-900/50 px-6 py-3 backdrop-blur-sm">
              <p className="glitch-text font-mono text-sm uppercase tracking-wider text-pink-400">
                [ System Initializing... ]
              </p>
            </div>
          </div>

          {/* Auth/Request Section */}
          <div className="space-y-3">
            {!isAuthenticated && (
              <div className="space-y-4">
                <p className="text-sm text-slate-400">
                  Sign in with GitHub to request early access
                </p>
                {/* GitHub Sign In */}
                <button
                  onClick={() => signIn('github', { callbackUrl: '/' })}
                  className="group relative w-full cursor-pointer overflow-hidden rounded-lg border-2 border-cyan-400 bg-slate-900/80 px-4 py-3 sm:px-8 sm:py-4 font-bold uppercase tracking-wider text-sm sm:text-base text-cyan-400 shadow-[0_0_20px_rgba(0,255,255,0.3)] transition hover:bg-primary/10 hover:shadow-[0_0_30px_rgba(0,255,255,0.5)]"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/10 to-transparent opacity-0 transition group-hover:opacity-100" />
                  <div className="relative flex items-center justify-center gap-2 sm:gap-3">
                    <SiGithub className="w-5 h-5 sm:w-6 sm:h-6" />
                    <span>Sign in with GitHub</span>
                  </div>
                </button>
              </div>
            )}

            {isAuthenticated && !showRequestForm && (
              <div className="space-y-4">
                <div className="rounded-lg border border-pink-500/50 bg-accent/10 p-6 backdrop-blur-sm">
                  <p className="font-semibold text-pink-400">Access Restricted</p>
                  <p className="mt-2 text-sm text-pink-100/80">
                    You&apos;re signed in as <span className="font-mono text-cyan-400">{userEmail}</span> but
                    you&apos;re not on the allowlist yet.
                  </p>
                </div>
              </div>
            )}

            {/* Request Access Form */}
            {showRequestForm && isAuthenticated && userEmail && (
              <div className="rounded-xl border border-primary/50 bg-slate-900/90 p-6 backdrop-blur-sm">
                {!submitted ? (
                  <form onSubmit={handleRequestAccess} className="space-y-4">
                    <div>
                      <label className="mb-2 block text-left text-sm font-semibold uppercase tracking-wider text-cyan-400">
                        GitHub Account
                      </label>
                      <input
                        type="email"
                        required
                        value={userEmail}
                        disabled
                        className="w-full rounded-lg border border-primary/50 bg-slate-900/30 px-4 py-3 font-mono text-cyan-100 opacity-75"
                      />
                      <p className="mt-1 text-xs text-slate-500">
                        Using your authenticated GitHub email
                      </p>
                    </div>
                    <div>
                      <label className="mb-2 block text-left text-sm font-semibold uppercase tracking-wider text-cyan-400">
                        Why do you want access?
                      </label>
                      <textarea
                        required
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        rows={4}
                        className="w-full rounded-lg border border-primary/50 bg-slate-900/50 px-4 py-3 font-mono text-cyan-100 placeholder-cyan-500/30 outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/50"
                        placeholder="Tell us about your involvement in the React ecosystem..."
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full cursor-pointer rounded-lg border-2 border-cyan-400 bg-primary/10 px-6 py-3 font-bold uppercase tracking-wider text-cyan-400 shadow-[0_0_20px_rgba(0,255,255,0.3)] transition hover:bg-primary/50/20 hover:shadow-[0_0_30px_rgba(0,255,255,0.5)] disabled:opacity-50"
                    >
                      {isSubmitting ? 'Sending...' : 'Request Access'}
                    </button>
                  </form>
                ) : (
                  <div className="space-y-3 py-4">
                    <div className="text-4xl">✓</div>
                    <p className="font-bold text-cyan-400">Request Sent!</p>
                    <p className="text-sm text-cyan-100/70">
                      We&apos;ll review your request and get back to you soon.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Status Indicators */}
          <div className="flex items-center justify-center gap-6 pt-6">
            <StatusDot label="Backend" status="online" />
            <StatusDot label="API" status="online" />
            <StatusDot label="Launch" status="pending" />
          </div>
        </div>
      </div>

      {/* Fixed Footer */}
      <div className="fixed bottom-6 left-0 right-0 z-20 text-center">
        <p className="font-mono text-xs uppercase tracking-widest text-primary/50">
          React Foundation · 2025
        </p>
      </div>

      {/* Add animations */}
      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) translateX(0px);
            opacity: 0;
          }
          50% {
            transform: translateY(-100px) translateX(50px);
            opacity: 1;
          }
        }

        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes glitch {
          0%, 10% {
            transform: translate(0);
            text-shadow: none;
          }
          12% {
            transform: translate(-3px, 2px);
            text-shadow: 3px -2px 0 rgba(0, 255, 255, 0.8), -3px 2px 0 rgba(255, 0, 255, 0.8);
          }
          14% {
            transform: translate(2px, -2px);
            text-shadow: -2px 3px 0 rgba(0, 255, 255, 0.8), 2px -3px 0 rgba(255, 0, 255, 0.8);
          }
          16% {
            transform: translate(-2px, 1px);
            text-shadow: 4px 0 0 rgba(0, 255, 255, 0.8), -4px 0 0 rgba(255, 0, 255, 0.8);
          }
          18%, 100% {
            transform: translate(0);
            text-shadow: none;
          }
        }

        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }

        .glitch-text {
          animation: glitch 3s infinite;
          position: relative;
        }
      `}</style>
    </div>
  );
}

function StatusDot({ label, status }: { label: string; status: 'online' | 'pending' | 'offline' }) {
  const colors = {
    online: 'bg-success/50 shadow-[0_0_10px_rgba(34,197,94,0.8)]',
    pending: 'bg-warning/50 shadow-[0_0_10px_rgba(250,204,21,0.8)] animate-pulse',
    offline: 'bg-destructive/50 shadow-[0_0_10px_rgba(239,68,68,0.8)]',
  };

  return (
    <div className="flex items-center gap-2">
      <div className={`h-2 w-2 rounded-full ${colors[status]}`} />
      <span className="font-mono text-xs uppercase tracking-wider text-primary/70">
        {label}
      </span>
    </div>
  );
}
