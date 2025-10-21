"use client";

import { useState, useEffect } from "react";

interface UsernameInputProps {
  githubLogin: string | null;
  onUsernameChange: (username: string) => void;
  isPending: boolean;
}

export function UsernameInput({ githubLogin, onUsernameChange, isPending }: UsernameInputProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customUsername, setCustomUsername] = useState("");
  const [storedUsername, setStoredUsername] = useState<string | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('contributor-username');
    setStoredUsername(saved);
    setIsLoading(false);

    // Auto-fetch if we have a saved username and not logged in
    if (!githubLogin && saved) {
      onUsernameChange(saved);
    }
  }, [githubLogin, onUsernameChange]);

  const handleCustomUsernameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customUsername.trim()) {
      const username = customUsername.trim();
      localStorage.setItem('contributor-username', username);
      setStoredUsername(username);
      onUsernameChange(username);
      setShowCustomInput(false);
      setCustomUsername("");
    }
  };

  // Show shimmer while loading localStorage
  if (isLoading) {
    return (
      <div className="space-y-2">
        <div className="h-4 w-24 animate-pulse rounded bg-white/5" />
        <div className="h-10 w-full animate-pulse rounded-lg bg-white/5" />
      </div>
    );
  }

  // Logged in with GitHub
  if (githubLogin) {
    return (
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-white/50">
          Connected GitHub
        </p>
        <div className="flex items-center justify-between rounded-lg border border-white/15 bg-slate-950/60 px-3 py-2 text-sm text-white/80">
          <span>{githubLogin}</span>
          <button
            type="button"
            onClick={() => onUsernameChange(githubLogin)}
            className="rounded-md border border-white/10 bg-white/10 px-2 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white transition hover:border-white/30 hover:bg-white/20 disabled:cursor-not-allowed disabled:border-white/5 disabled:bg-white/5"
            disabled={isPending}
          >
            {isPending ? "Refreshing…" : "Refresh"}
          </button>
        </div>
      </div>
    );
  }

  // Has stored username (not logged in)
  if (storedUsername && !showCustomInput) {
    return (
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-white/50">
          Tracking
        </p>
        <div className="flex items-center justify-between rounded-lg border border-white/15 bg-slate-950/60 px-3 py-2 text-sm text-white/80">
          <span>{storedUsername}</span>
          <button
            type="button"
            onClick={() => setShowCustomInput(true)}
            className="rounded-md border border-white/10 bg-white/10 px-2 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white transition hover:border-white/30 hover:bg-white/20"
          >
            Change
          </button>
        </div>
      </div>
    );
  }

  // Custom username input form
  if (showCustomInput) {
    return (
      <div className="space-y-2">
        <p className="text-xs text-white/60">
          Enter your GitHub username
        </p>
        <form onSubmit={handleCustomUsernameSubmit} className="flex flex-col gap-2">
          <input
            type="text"
            value={customUsername}
            onChange={(e) => setCustomUsername(e.target.value)}
            placeholder="GitHub username"
            className="rounded-lg border border-white/15 bg-slate-950/60 px-3 py-2 text-sm text-white/80 placeholder:text-white/40 focus:border-sky-500/50 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
            autoFocus
          />
          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 rounded-md border border-sky-500/30 bg-sky-500/10 px-2 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-sky-300 transition hover:border-sky-500/50 hover:bg-sky-500/20"
              disabled={isPending || !customUsername.trim()}
            >
              {isPending ? "Checking..." : "Check"}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowCustomInput(false);
                setCustomUsername("");
              }}
              className="rounded-md border border-white/10 bg-white/5 px-2 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white/60 transition hover:border-white/20 hover:bg-white/10"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    );
  }

  // Initial state - no username
  return (
    <div className="space-y-2">
      <p className="text-xs text-white/60">
        Track your React ecosystem contributions
      </p>
      <button
        onClick={() => setShowCustomInput(true)}
        className="w-full rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-white/70 transition hover:border-cyan-400/30 hover:bg-slate-900/60 hover:text-cyan-300"
      >
        Enter GitHub Username
      </button>
    </div>
  );
}
