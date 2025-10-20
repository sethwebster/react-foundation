import type { Product } from "@/lib/products";
import { products } from "@/lib/products";

export type MaintainerTierId = "contributor" | "sustainer" | "core";

export type LibraryCategory =
  | "core"
  | "state"
  | "data"
  | "routing"
  | "framework"
  | "forms"
  | "testing"
  | "ui"
  | "animation"
  | "tooling"
  | "styling"
  | "tables";

type RepoTarget = {
  owner: string;
  name: string;
  category: LibraryCategory;
  tier: 1 | 2 | 3; // For potential future weighting
  provider?: 'github' | 'gitlab' | 'bitbucket' | 'gitea'; // Default: github
};

export type MaintainerTier = {
  id: MaintainerTierId;
  label: string;
  description: string;
  minScore: number;
  unlocks: string[];
};

export type ContributionStats = {
  pullRequests: number;
  issues: number;
  commits: number;
  score: number;
  perRepository: Array<{
    repository: string;
    pullRequests: number;
    issues: number;
    commits: number;
  }>;
};

export const ecosystemLibraries: RepoTarget[] = [
  // Core React (9 repos)
  { owner: "facebook", name: "react", category: "core", tier: 1 }, // Includes React Compiler (in /compiler subdirectory)
  { owner: "facebook", name: "relay", category: "data", tier: 1 },
  { owner: "facebook", name: "jest", category: "testing", tier: 1 },
  { owner: "facebook", name: "react-native", category: "core", tier: 1 },
  { owner: "facebook", name: "hermes", category: "core", tier: 1 },
  { owner: "reactjs", name: "react.dev", category: "core", tier: 1 },
  { owner: "reactjs", name: "rfcs", category: "core", tier: 1 },
  { owner: "react-native-community", name: "react-native-releases", category: "core", tier: 2 },
  { owner: "react-navigation", name: "react-navigation", category: "routing", tier: 1 },

  // State Management (6 repos)
  { owner: "reduxjs", name: "redux", category: "state", tier: 1 },
  { owner: "reduxjs", name: "redux-toolkit", category: "state", tier: 1 },
  { owner: "pmndrs", name: "zustand", category: "state", tier: 2 },
  { owner: "pmndrs", name: "jotai", category: "state", tier: 2 },
  { owner: "pmndrs", name: "valtio", category: "state", tier: 2 },
  { owner: "statelyai", name: "xstate", category: "state", tier: 2 },

  // Data Fetching (5 repos)
  { owner: "TanStack", name: "query", category: "data", tier: 1 },
  { owner: "vercel", name: "swr", category: "data", tier: 1 },
  { owner: "apollographql", name: "apollo-client", category: "data", tier: 1 },
  { owner: "trpc", name: "trpc", category: "data", tier: 2 },
  { owner: "urql-graphql", name: "urql", category: "data", tier: 2 },

  // Routing (3 repos)
  { owner: "remix-run", name: "react-router", category: "routing", tier: 1 },
  { owner: "TanStack", name: "router", category: "routing", tier: 2 },
  { owner: "molefrog", name: "wouter", category: "routing", tier: 3 },

  // Meta-frameworks (5 repos)
  { owner: "vercel", name: "next.js", category: "framework", tier: 1 },
  { owner: "remix-run", name: "remix", category: "framework", tier: 1 },
  { owner: "expo", name: "expo", category: "framework", tier: 1 },
  { owner: "gatsbyjs", name: "gatsby", category: "framework", tier: 2 },
  { owner: "withastro", name: "astro", category: "framework", tier: 2 },

  // Forms & Validation (5 repos)
  { owner: "react-hook-form", name: "react-hook-form", category: "forms", tier: 1 },
  { owner: "jaredpalmer", name: "formik", category: "forms", tier: 2 },
  { owner: "colinhacks", name: "zod", category: "forms", tier: 1 },
  { owner: "jquense", name: "yup", category: "forms", tier: 2 },
  { owner: "final-form", name: "react-final-form", category: "forms", tier: 3 },

  // Testing (4 repos)
  { owner: "testing-library", name: "react-testing-library", category: "testing", tier: 1 },
  { owner: "vitest-dev", name: "vitest", category: "testing", tier: 1 },
  { owner: "microsoft", name: "playwright", category: "testing", tier: 1 },
  { owner: "testing-library", name: "react-hooks-testing-library", category: "testing", tier: 2 },

  // UI/Component Libraries (6 repos)
  { owner: "radix-ui", name: "primitives", category: "ui", tier: 1 },
  { owner: "tailwindlabs", name: "headlessui", category: "ui", tier: 1 },
  { owner: "adobe", name: "react-spectrum", category: "ui", tier: 2 },
  { owner: "ariakit", name: "ariakit", category: "ui", tier: 2 },
  { owner: "mui", name: "material-ui", category: "ui", tier: 1 },
  { owner: "chakra-ui", name: "chakra-ui", category: "ui", tier: 2 },

  // Animation (3 repos)
  { owner: "framer", name: "motion", category: "animation", tier: 1 },
  { owner: "pmndrs", name: "react-spring", category: "animation", tier: 2 },
  { owner: "formkit", name: "auto-animate", category: "animation", tier: 3 },

  // Dev Tools & Bundling (5 repos)
  { owner: "storybookjs", name: "storybook", category: "tooling", tier: 1 },
  { owner: "vitejs", name: "vite", category: "tooling", tier: 1 },
  { owner: "facebook", name: "metro", category: "tooling", tier: 2 },
  { owner: "vercel", name: "turbo", category: "tooling", tier: 2 },
  { owner: "facebook", name: "react-devtools", category: "tooling", tier: 1 },

  // Data Tables (1 repo)
  { owner: "TanStack", name: "table", category: "tables", tier: 1 },

  // Styling (3 repos)
  { owner: "styled-components", name: "styled-components", category: "styling", tier: 1 },
  { owner: "emotion-js", name: "emotion", category: "styling", tier: 1 },
  { owner: "tailwindlabs", name: "tailwindcss", category: "styling", tier: 1 },
];

// Legacy export for backwards compatibility
export const maintainerRepos = ecosystemLibraries;

export const maintainerTiers: MaintainerTier[] = [
  {
    id: "contributor",
    label: "Contributor Access",
    description:
      "Unlocks once you have demonstrated consistent contributions across the React ecosystem.",
    minScore: 40,
    unlocks: products
      .filter((product) => product.unlockTier === "contributor")
      .map((product) => product.slug),
  },
  {
    id: "sustainer",
    label: "Sustainer Access",
    description:
      "Reserved for folks sustaining the ecosystem with repeated fixes, docs, and support across multiple libraries.",
    minScore: 120,
    unlocks: products
      .filter((product) => product.unlockTier === "sustainer")
      .map((product) => product.slug),
  },
  {
    id: "core",
    label: "Core Ally Access",
    description:
      "Unlocked by the top contributors and maintainers who are pillars of the React ecosystem.",
    minScore: 250,
    unlocks: products
      .filter((product) => product.unlockTier === "core")
      .map((product) => product.slug),
  },
];

export const tierWeights = {
  pullRequests: 8,
  issues: 3,
  commits: 1,
} as const;

type GraphQLContributionEntry = {
  repository?: {
    owner?: { login?: string };
    name?: string;
  };
  contributions?: {
    totalCount?: number;
  };
};

type GraphQLPayload = {
  user?: {
    name?: string;
    contributionsCollection?: {
      totalPullRequestContributions?: number;
      totalIssueContributions?: number;
      totalCommitContributions?: number;
      pullRequestContributionsByRepository?: GraphQLContributionEntry[];
      issueContributionsByRepository?: GraphQLContributionEntry[];
      commitContributionsByRepository?: GraphQLContributionEntry[];
    };
  };
};

export function computeContributionStatsFromGitHub(payload: GraphQLPayload): ContributionStats {
  const collection = payload?.user?.contributionsCollection;

  // Easter egg: Creator achievement
  const userName = payload?.user?.name || '';
  const isCreator = userName.toLowerCase() === 'seth webster';

  if (isCreator) {
    console.log('🎉 LEGENDARY CREATOR DETECTED: Seth Webster!');
    return {
      pullRequests: 1250,
      issues: 0,
      commits: 0,
      score: 9999,
      perRepository: [{
        repository: 'react-foundation-store/created',
        pullRequests: 1250,
        issues: 0,
        commits: 0,
      }],
    };
  }

  if (!collection) {
    return {
      pullRequests: 0,
      issues: 0,
      commits: 0,
      score: 0,
      perRepository: [],
    };
  }

  const allowed = new Set(
    maintainerRepos.map((repo) => `${repo.owner.toLowerCase()}/${repo.name.toLowerCase()}`),
  );

  const aggregateByRepo: Record<
    string,
    { pullRequests: number; issues: number; commits: number }
  > = {};

  const addContribution = (
    repoOwner: string,
    repoName: string,
    kind: "pullRequests" | "issues" | "commits",
    count: number,
  ) => {
    const key = `${repoOwner.toLowerCase()}/${repoName.toLowerCase()}`;
    if (!allowed.has(key)) {
      return;
    }
    if (!aggregateByRepo[key]) {
      aggregateByRepo[key] = { pullRequests: 0, issues: 0, commits: 0 };
    }
    aggregateByRepo[key][kind] += count;
  };

  (collection.pullRequestContributionsByRepository ?? []).forEach((entry) => {
    const repoOwner = entry?.repository?.owner?.login;
    const repoName = entry?.repository?.name;
    if (!repoOwner || !repoName) {
      return;
    }
    addContribution(
      repoOwner,
      repoName,
      "pullRequests",
      entry?.contributions?.totalCount ?? 0,
    );
  });

  (collection.issueContributionsByRepository ?? []).forEach((entry) => {
    const repoOwner = entry?.repository?.owner?.login;
    const repoName = entry?.repository?.name;
    if (!repoOwner || !repoName) {
      return;
    }
    addContribution(
      repoOwner,
      repoName,
      "issues",
      entry?.contributions?.totalCount ?? 0,
    );
  });

  (collection.commitContributionsByRepository ?? []).forEach((entry) => {
    const repoOwner = entry?.repository?.owner?.login;
    const repoName = entry?.repository?.name;
    if (!repoOwner || !repoName) {
      return;
    }
    addContribution(
      repoOwner,
      repoName,
      "commits",
      entry?.contributions?.totalCount ?? 0,
    );
  });

  const perRepository = Object.entries(aggregateByRepo)
    .map(([repository, stats]) => ({
      repository,
      ...stats,
    }))
    .sort((a, b) => b.pullRequests + b.issues + b.commits - (a.pullRequests + a.issues + a.commits));

  const totals = perRepository.reduce(
    (acc, repo) => {
      acc.pullRequests += repo.pullRequests;
      acc.issues += repo.issues;
      acc.commits += repo.commits;
      return acc;
    },
    { pullRequests: 0, issues: 0, commits: 0 },
  );

  const score =
    totals.pullRequests * tierWeights.pullRequests +
    totals.issues * tierWeights.issues +
    totals.commits * tierWeights.commits;

  return {
    pullRequests: totals.pullRequests,
    issues: totals.issues,
    commits: totals.commits,
    score,
    perRepository,
  };
}

export function determineTier(score: number): MaintainerTier | null {
  // If score doesn't meet the minimum tier threshold, return null
  if (score < maintainerTiers[0].minScore) {
    return null;
  }

  let current = maintainerTiers[0];
  for (const tier of maintainerTiers) {
    if (score >= tier.minScore) {
      current = tier;
    } else {
      break;
    }
  }
  return current;
}

export function getNextTier(score: number): MaintainerTier | null {
  for (const tier of maintainerTiers) {
    if (score < tier.minScore) {
      return tier;
    }
  }
  return null;
}

export function getUnlockedProductsForTier(
  tierId: MaintainerTierId,
): Product[] {
  const tierOrder = maintainerTiers.map((tier) => tier.id);
  const tierIndex = tierOrder.indexOf(tierId);
  if (tierIndex === -1) {
    return [];
  }
  const allowed = new Set(tierOrder.slice(0, tierIndex + 1));
  return products.filter(
    (product) => !product.unlockTier || allowed.has(product.unlockTier as MaintainerTierId),
  );
}
