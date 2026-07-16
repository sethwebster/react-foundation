import { describe, expect, it } from "vitest";

import { getAllUpdates, getUpdateBySlug } from "./updates";

describe("public updates", () => {
  it("never includes drafts in public update collections", () => {
    const updates = getAllUpdates();

    expect(updates.length).toBeGreaterThan(0);
    expect(updates.every((update) => update.metadata.draft !== true)).toBe(true);
    expect(updates.map((update) => update.slug)).not.toContain(
      "the-state-of-react",
    );
  });

  it("does not expose draft updates by their direct slug", () => {
    expect(getUpdateBySlug("the-state-of-react")).toBeNull();
  });

  it("still returns published updates", () => {
    expect(getUpdateBySlug("welcome-to-react-foundation")?.metadata.title).toBe(
      "Welcome to the React Foundation",
    );
  });
});
