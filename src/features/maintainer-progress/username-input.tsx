"use client";

import { useEffect, useRef, useState } from "react";
import { useSyncExternalStore } from "react";
import { RFDS } from "@/components/rfds";
import { createLocalStorageStore } from "@/lib/local-storage-store";

interface UsernameInputProps {
  githubLogin: string | null;
  onUsernameChange: (username: string) => void;
  isPending: boolean;
}

const USERNAME_STORAGE_KEY = 'contributor-username';

const usernameStore = createLocalStorageStore<string | null>({
  key: USERNAME_STORAGE_KEY,
  fallback: null,
  read: (raw) => raw ?? null,
  write: (value) => (value === null ? null : value),
});

export function UsernameInput({ githubLogin, onUsernameChange, isPending }: UsernameInputProps) {
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customUsername, setCustomUsername] = useState("");
  const lastRequestedUsername = useRef<string | null>(null);

  const storedUsername = useSyncExternalStore(
    usernameStore.subscribe,
    usernameStore.getSnapshot,
    usernameStore.getServerSnapshot
  );

  useEffect(() => {
    const targetUsername = githubLogin ?? storedUsername;
    if (!targetUsername || lastRequestedUsername.current === targetUsername) {
      return;
    }

    lastRequestedUsername.current = targetUsername;

    if (githubLogin) {
      usernameStore.set(githubLogin);
    }

    onUsernameChange(targetUsername);
  }, [githubLogin, onUsernameChange, storedUsername]);

  const handleCustomUsernameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customUsername.trim()) {
      return;
    }

    const username = customUsername.trim();
    usernameStore.set(username);
    onUsernameChange(username);
    setShowCustomInput(false);
    setCustomUsername("");
  };

  // Logged in with GitHub
  if (githubLogin) {
    return (
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-foreground/50">
          Connected GitHub
        </p>
        <div className="flex items-center justify-between rounded-lg border border-border/15 bg-background/60 px-3 py-2 text-sm text-foreground/80">
          <span>{githubLogin}</span>
          <RFDS.SemanticButton
            variant="ghost"
            size="sm"
            onClick={() => onUsernameChange(githubLogin)}
            disabled={isPending}
            className="text-xs uppercase tracking-[0.2em]"
          >
            {isPending ? "Refreshing…" : "Refresh"}
          </RFDS.SemanticButton>
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
          <RFDS.SemanticButton
            variant="ghost"
            size="sm"
            onClick={() => setShowCustomInput(true)}
            className="text-xs uppercase tracking-[0.2em]"
          >
            Change
          </RFDS.SemanticButton>
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
          <RFDS.Input
            type="text"
            value={customUsername}
            onChange={(e) => setCustomUsername(e.target.value)}
            placeholder="GitHub username"
            autoFocus
          />
          <div className="flex gap-2">
            <RFDS.SemanticButton
              type="submit"
              variant="primary"
              size="sm"
              disabled={isPending || !customUsername.trim()}
              className="flex-1 text-xs uppercase tracking-[0.2em]"
            >
              {isPending ? "Checking..." : "Check"}
            </RFDS.SemanticButton>
            <RFDS.SemanticButton
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setShowCustomInput(false);
                setCustomUsername("");
              }}
              className="text-xs uppercase tracking-[0.2em]"
            >
              Cancel
            </RFDS.SemanticButton>
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
      <RFDS.SemanticButton
        variant="outline"
        onClick={() => setShowCustomInput(true)}
        className="w-full"
      >
        Enter GitHub Username
      </RFDS.SemanticButton>
    </div>
  );
}
