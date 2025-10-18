"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import type { ContributionStats, MaintainerTier } from "@/lib/maintainer-tiers";

export type MaintainerProgressState = {
  stats: ContributionStats | null;
  tier: MaintainerTier | null;
  username: string | null;
};

const MaintainerProgressContext = createContext<{
  progress: MaintainerProgressState;
  setProgress: (data: MaintainerProgressState) => void;
} | null>(null);

const defaultState: MaintainerProgressState = {
  stats: null,
  tier: null,
  username: null,
};

export function MaintainerProgressProvider({ children }: { children: ReactNode }) {
  const [progress, setProgress] = useState<MaintainerProgressState>(defaultState);

  const value = useMemo(
    () => ({
      progress,
      setProgress,
    }),
    [progress],
  );

  return (
    <MaintainerProgressContext.Provider value={value}>
      {children}
    </MaintainerProgressContext.Provider>
  );
}

export function useMaintainerProgress() {
  const context = useContext(MaintainerProgressContext);
  if (!context) {
    throw new Error("useMaintainerProgress must be used within MaintainerProgressProvider");
  }
  return context;
}
