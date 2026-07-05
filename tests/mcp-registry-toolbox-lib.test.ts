import { describe, expect, it } from "vitest";

import {
  selectDiverseRankedEntries,
  toolboxCaveats,
  toolboxCategoryMix,
  toolboxFitReasons,
  toolboxInstall,
  toolboxNextActions,
  toolboxTrustSummary,
  TOOLBOX_CONFIG_SNIPPET_INLINE_LIMIT,
} from "../packages/mcp/src/registry-toolbox-lib.js";

describe("registry-toolbox-lib diverse selection", () => {
  it("limits category repetition before filling remaining slots", () => {
    const ranked = [
      { entry: { category: "mcp", slug: "a" }, score: 10, reasons: [] },
      { entry: { category: "mcp", slug: "b" }, score: 9, reasons: [] },
      { entry: { category: "mcp", slug: "c" }, score: 8, reasons: [] },
      { entry: { category: "skills", slug: "d" }, score: 7, reasons: [] },
    ];
    const selected = selectDiverseRankedEntries(ranked, 3);
    expect(selected.map((item) => item.entry.slug)).toEqual(["a", "b", "d"]);
  });
});

describe("registry-toolbox-lib fit and caveats", () => {
  const entry = {
    category: "skills",
    slug: "example",
    platforms: ["Codex"],
    installCommand: "npm install -g skill",
    safetyNotes: [{ text: "Runs shell commands" }],
    privacyNotes: [],
    claimStatus: "verified",
  };

  it("builds fit reasons from ranking and entry metadata", () => {
    const reasons = toolboxFitReasons(entry, {
      score: 12,
      reasons: ["tag:automation"],
    });
    expect(reasons).toEqual(
      expect.arrayContaining([
        "tag:automation",
        "skills workflow surface",
        "actionable setup surface",
      ]),
    );
  });

  it("lists caveats for risk-bearing categories and missing disclosures", () => {
    const caveats = toolboxCaveats({
      category: "mcp",
      slug: "server",
      downloadUrl: "https://example.com/pkg.tgz",
    });
    expect(caveats).toEqual(
      expect.arrayContaining([
        "Source metadata is missing or incomplete.",
        "Download checksum metadata is not present.",
        "No structured safety notes are present.",
      ]),
    );
  });
});

describe("registry-toolbox-lib install and rollups", () => {
  it("inlines small config snippets and summarizes large ones", () => {
    const small = toolboxInstall({
      installable: true,
      installCommand: "npm install -g tool",
      configSnippet: "export KEY=1",
    });
    expect(small).toMatchObject({
      installCommand: "npm install -g tool",
      configSnippet: "export KEY=1",
    });

    const largeSnippet = "x".repeat(TOOLBOX_CONFIG_SNIPPET_INLINE_LIMIT + 1);
    const large = toolboxInstall({ configSnippet: largeSnippet });
    expect(large?.configSnippetChars).toBe(largeSnippet.length);
    expect(large?.configHint).toMatch(/entry\.asset/i);
  });

  it("builds next actions and category/trust rollups", () => {
    expect(toolboxNextActions({ category: "mcp", slug: "server" })).toEqual(
      expect.arrayContaining([
        expect.stringContaining("entry.detail"),
        expect.stringContaining("entry.trust"),
      ]),
    );
    expect(
      toolboxCategoryMix([
        { category: "skills" },
        { category: "mcp" },
        { category: "skills" },
      ]),
    ).toEqual([
      { category: "mcp", count: 1 },
      { category: "skills", count: 2 },
    ]);
    expect(
      toolboxTrustSummary([
        {
          trust: {
            source: { status: "available" },
            package: { downloadTrust: "first-party", packageVerified: true },
            disclosures: { hasSafetyNotes: true, hasPrivacyNotes: false },
          },
        },
      ]),
    ).toMatchObject({
      sourceBacked: 1,
      firstPartyOrVerifiedPackages: 1,
      entriesWithSafetyNotes: 1,
      entriesWithPrivacyNotes: 0,
    });
  });
});
