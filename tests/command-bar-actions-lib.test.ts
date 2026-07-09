import { describe, expect, it } from "vitest";

import {
  MAX_MATCHED_ACTIONS,
  filterCommandActions,
} from "../apps/web/src/lib/command-bar-actions-lib";

const actions = [
  { id: "a", label: "Browse all resources" },
  { id: "b", label: "Trending this week" },
  { id: "c", label: "Ecosystem & integrations" },
  { id: "d", label: "Registry quality" },
  { id: "e", label: "Best of HeyClaude" },
  { id: "f", label: "Submit a resource" },
];

describe("filterCommandActions", () => {
  it("returns every action unchanged for a blank query", () => {
    expect(filterCommandActions(actions, "")).toBe(actions);
  });

  it("treats a whitespace-only query as blank", () => {
    expect(filterCommandActions(actions, "   ")).toBe(actions);
  });

  it("matches labels case-insensitively", () => {
    expect(filterCommandActions(actions, "TRENDING").map((a) => a.id)).toEqual([
      "b",
    ]);
  });

  it("matches on substrings, not just prefixes", () => {
    expect(filterCommandActions(actions, "quality").map((a) => a.id)).toEqual([
      "d",
    ]);
  });

  it("caps matches at MAX_MATCHED_ACTIONS", () => {
    // "e" appears in every label above, so every action matches.
    const matched = filterCommandActions(actions, "e");
    expect(matched).toHaveLength(MAX_MATCHED_ACTIONS);
    expect(matched.map((a) => a.id)).toEqual(["a", "b", "c", "d"]);
  });

  it("returns an empty array when nothing matches", () => {
    expect(filterCommandActions(actions, "zzzz")).toEqual([]);
  });
});
