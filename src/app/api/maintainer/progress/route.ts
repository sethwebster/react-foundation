import { NextResponse } from "next/server";

import {
  determineTier,
  getNextTier,
  ecosystemLibraries,
} from "@/lib/maintainer-tiers";
import { fetchAggregatedContributions, type RepositoryIdentifier } from "@/lib/providers";

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

  try {
    // Convert ecosystem libraries to RepositoryIdentifier format
    const repos: RepositoryIdentifier[] = ecosystemLibraries.map((lib) => ({
      provider: lib.provider || 'github',
      owner: lib.owner,
      name: lib.name,
    }));

    // Fetch contributions across all providers
    const aggregated = await fetchAggregatedContributions(
      username,
      repos,
      token
    );

    console.log("Maintainer progress for", username, JSON.stringify(aggregated, null, 2));

    const tier = determineTier(aggregated.score);
    const nextTier = getNextTier(aggregated.score);

    return NextResponse.json({
      username,
      stats: aggregated,
      tier,
      nextTier,
      maintainersTracked: ecosystemLibraries,
    });
  } catch (error) {
    console.error("Error fetching contributions:", error);
    return NextResponse.json(
      { error: "Failed to fetch contribution data." },
      { status: 500 },
    );
  }
}
