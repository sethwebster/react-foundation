import { NextResponse } from "next/server";

import {
  computeContributionStatsFromGitHub,
  determineTier,
  getNextTier,
  maintainerRepos,
} from "@/lib/maintainer-tiers";

const GRAPHQL_ENDPOINT = "https://api.github.com/graphql";
const requestTimeoutMs = 15000;

const query = /* GraphQL */ `
  query MaintainerProgress($login: String!, $from: DateTime!, $to: DateTime!) {
    user(login: $login) {
      name
      avatarUrl
      url
      contributionsCollection(from: $from, to: $to) {
        totalPullRequestContributions
        totalIssueContributions
        totalCommitContributions
        pullRequestContributionsByRepository(maxRepositories: 50) {
          repository {
            name
            owner {
              login
            }
          }
          contributions(first: 1) {
            totalCount
          }
        }
        issueContributionsByRepository(maxRepositories: 50) {
          repository {
            name
            owner {
              login
            }
          }
          contributions(first: 1) {
            totalCount
          }
        }
        commitContributionsByRepository(maxRepositories: 50) {
          repository {
            name
            owner {
              login
            }
          }
          contributions(first: 1) {
            totalCount
          }
        }
      }
    }
  }
`;

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const username = body?.username?.trim();

  if (!username) {
    return NextResponse.json({ error: "Username is required." }, { status: 400 });
  }

  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    return NextResponse.json(
      { error: "Server missing GitHub token configuration." },
      { status: 500 },
    );
  }

  const now = new Date();
  const from = new Date(now);
  from.setFullYear(now.getFullYear() - 1);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), requestTimeoutMs);

  try {
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query,
        variables: {
          login: username,
          from: from.toISOString(),
          to: now.toISOString(),
        },
      }),
      signal: controller.signal,
      cache: "no-store",
    });

    clearTimeout(timeout);

    if (!response.ok) {
      const errorPayload = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorPayload?.message ?? "GitHub API request failed." },
        { status: response.status },
      );
    }

    const payload = await response.json();
    if (payload.errors?.length) {
      const message = payload.errors[0]?.message ?? "Unknown GitHub error.";
      if (message.includes("Could not resolve to a User")) {
        return NextResponse.json({ error: "GitHub user not found." }, { status: 404 });
      }
      return NextResponse.json({ error: message }, { status: 502 });
    }

    const stats = computeContributionStatsFromGitHub(payload.data);
    console.log("Maintainer progress for", username, JSON.stringify(stats, null, 2));
    const tier = determineTier(stats.score);
    const nextTier = getNextTier(stats.score);

    return NextResponse.json({
      username,
      stats,
      tier,
      nextTier,
      maintainersTracked: maintainerRepos,
    });
  } catch (error) {
    clearTimeout(timeout);
    if (error instanceof DOMException && error.name === "AbortError") {
      return NextResponse.json(
        { error: "GitHub request timed out." },
        { status: 504 },
      );
    }
    console.error(error);
    return NextResponse.json(
      { error: "Unexpected server error." },
      { status: 500 },
    );
  }
}
