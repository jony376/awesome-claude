import { describe, expect, it } from "vitest";

import {
  entryClaimStatusValue,
  entryHasPrivacyNotes,
  entryHasSafetyNotes,
  entryIsInstallable,
  entryPackageTrustValue,
  entrySourceStatusValue,
  matchesRegistryPlatform,
  matchesRegistryQuery,
  normalizeRegistryPlatform,
  normalizedRegistrySearchText,
  normalizeRegistrySearchQuery,
  rankRegistrySearchEntries,
  scoreRegistrySearchEntry,
  tokenizeRegistrySearchQuery,
} from "../packages/mcp/src/search-ranking-lib.js";
import {
  matchesRegistryQuery as matchesRegistryQueryFromWrapper,
  scoreRegistrySearchEntry as scoreRegistrySearchEntryFromWrapper,
} from "../packages/mcp/src/search-ranking.js";

function makeEntry(overrides: Record<string, unknown> = {}) {
  return {
    category: "mcp",
    slug: "browser-bridge",
    title: "Browser Bridge",
    description: "Runs Playwright automation for Claude Code sessions.",
    tags: ["browser-automation"],
    keywords: ["playwright", "browser automation"],
    platforms: ["claude-code"],
    installCommand: "npx -y browser-bridge",
    ...overrides,
  };
}

describe("search-ranking-lib query normalization", () => {
  it("normalizes and tokenizes registry search queries", () => {
    expect(normalizeRegistrySearchQuery("  Browser PLAYWRIGHT  ")).toBe(
      "browser playwright",
    );
    expect(
      tokenizeRegistrySearchQuery("browser playwright automation"),
    ).toEqual(["browser", "playwright", "automation"]);
    expect(tokenizeRegistrySearchQuery("a")).toEqual([]);
  });

  it("caps query length and token count", () => {
    const longQuery = "browser ".repeat(80);
    expect(normalizeRegistrySearchQuery(longQuery).length).toBeLessThanOrEqual(
      256,
    );
    expect(tokenizeRegistrySearchQuery(longQuery).length).toBeLessThanOrEqual(
      12,
    );
  });
});

describe("search-ranking-lib platform and haystack helpers", () => {
  it("normalizes platform aliases", () => {
    expect(normalizeRegistryPlatform("claude")).toBe("claude-code");
    expect(normalizeRegistryPlatform("cursor-rules")).toBe("cursor");
    expect(normalizeRegistryPlatform("unknown-platform")).toBe(
      "unknown-platform",
    );
  });

  it("builds normalized search text from entry metadata", () => {
    const haystack = normalizedRegistrySearchText(
      makeEntry({
        safetyNotes: ["Runs local browser automation."],
        privacyNotes: ["Reads selected project files."],
      }),
    );
    expect(haystack).toContain("browser bridge");
    expect(haystack).toContain("runs local browser automation");
  });

  it("matches registry platforms and blank platform filters", () => {
    const entry = makeEntry({ platforms: ["claude-code", "cursor"] });
    expect(matchesRegistryPlatform(entry, "claude")).toBe(true);
    expect(matchesRegistryPlatform(entry, "codex")).toBe(false);
    expect(matchesRegistryPlatform(entry, "")).toBe(true);
  });
});

describe("search-ranking-lib trust and install signals", () => {
  it("detects installable entries and source availability", () => {
    expect(entryIsInstallable(makeEntry())).toBe(true);
    expect(
      entryIsInstallable(
        makeEntry({
          installCommand: "",
          configSnippet: "",
          downloadUrl: "",
          installable: false,
        }),
      ),
    ).toBe(false);
    expect(
      entrySourceStatusValue(makeEntry({ repoUrl: "https://x.test" })),
    ).toBe("available");
    expect(entrySourceStatusValue(makeEntry({ repoUrl: "" }))).toBe("missing");
  });

  it("reads package trust, claim status, and safety/privacy notes", () => {
    expect(
      entryPackageTrustValue(
        makeEntry({ downloadTrust: "first-party", downloadUrl: "/x.zip" }),
      ),
    ).toBe("first-party");
    expect(entryClaimStatusValue(makeEntry({ claimStatus: "verified" }))).toBe(
      "verified",
    );
    expect(
      entryHasSafetyNotes(
        makeEntry({ trustSignals: { hasSafetyNotes: true }, safetyNotes: [] }),
      ),
    ).toBe(true);
    expect(
      entryHasPrivacyNotes(makeEntry({ privacyNotes: ["Reads local files."] })),
    ).toBe(true);
  });
});

describe("search-ranking-lib query matching and ranking", () => {
  it("matches multi-token registry queries regardless of order", () => {
    const entry = makeEntry();
    expect(matchesRegistryQuery(entry, "browser playwright")).toBe(true);
    expect(matchesRegistryQuery(entry, "playwright browser")).toBe(true);
    expect(matchesRegistryQuery(entry, "spreadsheet export")).toBe(false);
  });

  it("expands shorthand aliases such as gh and automation", () => {
    const entry = makeEntry({
      title: "Repository Review MCP",
      tags: ["github", "code-review"],
      keywords: ["repository review"],
    });
    expect(matchesRegistryQuery(entry, "gh review")).toBe(true);
    expect(
      matchesRegistryQuery(
        makeEntry({
          title: "QA Automation MCP",
          tags: ["testing", "qa"],
          keywords: ["automated browser checks"],
        }),
        "automation qa",
      ),
    ).toBe(true);
  });

  it("does not inherit prototype property names as alias keys", () => {
    const entry = makeEntry({
      title: "Constructor Fixture",
      keywords: ["constructor"],
    });
    expect(matchesRegistryQuery(entry, "constructor")).toBe(true);
    expect(matchesRegistryQuery(entry, "constructor spreadsheet")).toBe(false);
  });

  it("scores ranked registry search using alias expansion", () => {
    const entry = makeEntry();
    const ranked = scoreRegistrySearchEntry(entry, "browser playwright");
    expect(ranked.score).toBeGreaterThan(0);
    expect(ranked.reasons.length).toBeGreaterThan(0);
    expect(scoreRegistrySearchEntry(entry, ",".repeat(10_000))).toEqual({
      score: 0,
      reasons: [],
    });
  });

  it("ranks entries by score and dateAdded tie-breakers", () => {
    const older = makeEntry({
      slug: "older",
      title: "Browser Bridge Older",
      dateAdded: "2026-01-01",
    });
    const newer = makeEntry({
      slug: "newer",
      title: "Browser Bridge Newer",
      dateAdded: "2026-02-01",
    });
    const ranked = rankRegistrySearchEntries([older, newer], "browser bridge");
    expect(ranked).toHaveLength(2);
    expect(ranked[0]?.entry?.slug).toBe("newer");
    expect(ranked[1]?.entry?.slug).toBe("older");
  });
});

describe("search-ranking re-export compatibility", () => {
  it("keeps the public wrapper wired to the extracted lib", () => {
    const entry = makeEntry();
    expect(matchesRegistryQueryFromWrapper(entry, "browser playwright")).toBe(
      matchesRegistryQuery(entry, "browser playwright"),
    );
    expect(
      scoreRegistrySearchEntryFromWrapper(entry, "browser playwright").score,
    ).toBe(scoreRegistrySearchEntry(entry, "browser playwright").score);
  });
});
