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
        <div className="h-4 w-24 animate-pulse rounded bg-background/5" />
        <div className="h-10 w-full animate-pulse rounded-lg bg-background/5" />
      </div>
    );
  }

  // Logged in with GitHub
  if (githubLogin) {
    return (
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-foreground/50">
          Connected GitHub
        </p>
        <div className="flex items-center justify-between rounded-lg border border-border/15 bg-background/60 px-3 py-2 text-sm text-foreground/80">
          <span>{githubLogin}</span>
          <button
            type="button"
            onClick={() => onUsernameChange(githubLogin)}
            className="rounded-md border border-border/10 bg-background/10 px-2 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-foreground transition hover:border-border/30 hover:bg-background/20 disabled:cursor-not-allowed disabled:border-border/5 disabled:bg-background/5"
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
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-foreground/50">
          Tracking
        </p>
        <div className="flex items-center justify-between rounded-lg border border-border/15 bg-background/60 px-3 py-2 text-sm text-foreground/80">
          <span>{storedUsername}</span>
          <button
            type="button"
            onClick={() => setShowCustomInput(true)}
            className="rounded-md border border-border/10 bg-background/10 px-2 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-foreground transition hover:border-border/30 hover:bg-background/20"
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
        <p className="text-xs text-foreground/60">
          Enter your GitHub username
        </p>
        <form onSubmit={handleCustomUsernameSubmit} className="flex flex-col gap-2">
          <input
            type="text"
            value={customUsername}
            onChange={(e) => setCustomUsername(e.target.value)}
            placeholder="GitHub username"
            className="rounded-lg border border-border/15 bg-background/60 px-3 py-2 text-sm text-foreground/80 placeholder:text-foreground/40 focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
            autoFocus
          />
          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 rounded-md border border-primary/30 bg-primary/10 px-2 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-sky-300 transition hover:border-primary/50 hover:bg-primary/20"
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
              className="rounded-md border border-border/10 bg-background/5 px-2 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-foreground/60 transition hover:border-border/20 hover:bg-background/10"
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
      <p className="text-xs text-foreground/60">
        Track your React ecosystem contributions
      </p>
      <button
        onClick={() => setShowCustomInput(true)}
        className="w-full rounded-lg border border-border/10 bg-background/60 px-3 py-2 text-sm text-foreground/70 transition hover:border-cyan-400/30 hover:bg-muted/60 hover:text-cyan-300"
      >
        Enter GitHub Username
      </button>
    </div>
  );
}
