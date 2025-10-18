import type { Product } from "@/lib/products";
import { products } from "@/lib/products";

export type MaintainerTierId = "contributor" | "sustainer" | "core";

type RepoTarget = {
  owner: string;
  name: string;
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

export const maintainerRepos: RepoTarget[] = [
  { owner: "facebook", name: "react" },
  { owner: "facebook", name: "react-compiler" },
  { owner: "facebook", name: "relay" },
  { owner: "facebook", name: "jest" },
  { owner: "facebook", name: "react-native" },
  { owner: "reactjs", name: "react.dev" },
  { owner: "reactjs", name: "rfcs" },
  { owner: "react-native-community", name: "react-native-releases" },
];

export const maintainerTiers: MaintainerTier[] = [
  {
    id: "contributor",
    label: "Contributor Access",
    description:
      "Unlocks once you have demonstrated consistent contributions across React repositories.",
    minScore: 12,
    unlocks: products
      .filter((product) => product.unlockTier === "contributor")
      .map((product) => product.slug),
  },
  {
    id: "sustainer",
    label: "Sustainer Access",
    description:
      "Reserved for folks sustaining the ecosystem with repeated fixes, docs, and support.",
    minScore: 32,
    unlocks: products
      .filter((product) => product.unlockTier === "sustainer")
      .map((product) => product.slug),
  },
  {
    id: "core",
    label: "Core Ally Access",
    description:
      "Unlocked by the top contributors partnering closely with the React Core and Maintainers.",
    minScore: 56,
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

export function determineTier(score: number): MaintainerTier {
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
