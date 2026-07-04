import { describe, expect, it } from "vitest";

import { buildSkillsReport } from "@/lib/skills-stats-lib";
import { buildSkillsReport as buildSkillsReportFromWrapper } from "@/lib/skills-stats";
import {
  buildReportDataset,
  REPORT_PATHS,
  tagDistribution,
} from "@/lib/data-reports";
import { ENTRIES, REGISTRY_GENERATED_AT } from "@/data/entries";
import type { Entry } from "@/types/registry";

function skill(partial: Partial<Entry>): Entry {
  return {
    category: "skills",
    trust: "trusted",
    source: "source-backed",
    tags: [],
    ...partial,
  } as Entry;
}

describe("skills-stats-lib tagDistribution", () => {
  it("ranks tags by frequency and honours the exclude set", () => {
    const entries = [
      { tags: ["Testing", "skills"] },
      { tags: ["testing", "linting"] },
      { tags: ["skills"] },
    ];
    const rows = tagDistribution(entries, {
      exclude: new Set(["skills"]),
      limit: 5,
    });
    expect(rows[0]).toEqual({ label: "testing", count: 2, pct: 67 });
    expect(rows.some((r) => r.label === "skills")).toBe(false);
  });
});

describe("skills-stats-lib buildSkillsReport (deterministic)", () => {
  const sample = [
    skill({
      skillType: "capability-pack",
      skillLevel: "expert",
      verificationStatus: "validated",
      packageVerified: true,
      tags: ["testing"],
    }),
    skill({
      skillType: "general",
      skillLevel: "advanced",
      verificationStatus: "draft",
      tags: ["docs"],
    }),
  ];

  it("is stable and reports the right totals/stats", () => {
    const a = buildSkillsReport(sample, "2026-06-20");
    const b = buildSkillsReport(sample, "2026-06-20");
    expect(a).toEqual(b);
    expect(a.slug).toBe("/state-of-agent-skills");
    expect(a.exportSlug).toBe("agent-skills");
    expect(a.total).toBe(2);
    expect(a.stats.find((s) => s.key === "validated")?.value).toBe(50);
    expect(a.stats.find((s) => s.key === "packs")?.value).toBe(50);
    expect(a.stats.find((s) => s.key === "packaged")?.value).toBe(50);
  });

  it("drops degenerate single-bucket dimensions", () => {
    const uniform = [
      skill({ skillType: "general", tags: ["testing"] }),
      skill({ skillType: "general", tags: ["docs"] }),
    ];
    const model = buildSkillsReport(uniform, "2026-06-20");
    for (const dimension of model.dimensions) {
      expect(dimension.rows.length).toBeGreaterThan(1);
    }
    expect(model.dimensions.some((d) => d.key === "skill-type")).toBe(false);
  });

  it("excludes mechanism tags from the use-case distribution", () => {
    const model = buildSkillsReport(
      [
        skill({ tags: ["skills", "agent-skills", "testing"] }),
        skill({ tags: ["Skill", "CI", "testing"] }),
      ],
      "2026-06-20",
    );
    const useCases = model.dimensions.find((d) => d.key === "use-cases");
    expect(useCases?.rows.map((row) => row.label)).toEqual(["testing", "ci"]);
  });

  it("reports packaging, maturity, and verification dimensions for diverse samples", () => {
    const model = buildSkillsReport(
      [
        skill({
          skillType: "capability-pack",
          skillLevel: "foundational",
          verificationStatus: "draft",
          packageVerified: true,
          tags: ["testing"],
        }),
        skill({
          skillType: "general",
          skillLevel: "expert",
          verificationStatus: "production",
          packageVerified: false,
          tags: ["docs"],
        }),
      ],
      "2026-06-20",
    );
    const keys = model.dimensions.map((dimension) => dimension.key);
    expect(keys).toEqual(
      expect.arrayContaining([
        "skill-type",
        "maturity",
        "verification",
        "packaging",
      ]),
    );
    const packaging = model.dimensions.find((d) => d.key === "packaging");
    expect(packaging?.rows).toEqual([
      { label: "Verified package", count: 1, pct: 50 },
      { label: "Source only", count: 1, pct: 50 },
    ]);
  });

  it("returns an empty report when the registry has no skills", () => {
    const model = buildSkillsReport(
      [skill({ category: "agents", tags: ["testing"] }) as Entry],
      "2026-06-20",
    );
    expect(model.total).toBe(0);
    expect(model.dimensions).toEqual([]);
    expect(model.stats.find((s) => s.key === "total")?.value).toBe(0);
  });

  it("keeps the public wrapper re-export aligned with the lib module", () => {
    const fromLib = buildSkillsReport(sample, "2026-06-20");
    const fromWrapper = buildSkillsReportFromWrapper(sample, "2026-06-20");
    expect(fromWrapper).toEqual(fromLib);
  });
});

describe("skills-stats-lib report Dataset JSON-LD", () => {
  it("measures every stat and dimension", () => {
    const model = buildSkillsReport(
      [
        skill({ skillType: "capability-pack", tags: ["testing"] }),
        skill({ skillType: "general", tags: ["docs"] }),
      ],
      "2026-06-20",
    );
    const ds = buildReportDataset(model) as Record<string, unknown>;
    expect(ds["@type"]).toBe("Dataset");
    expect(ds.dateModified).toBe("2026-06-20");
    const measured = ds.variableMeasured as string[];
    for (const stat of model.stats) expect(measured).toContain(stat.label);
    for (const dimension of model.dimensions)
      expect(measured).toContain(dimension.title);
    expect(new Set(measured).size).toBe(measured.length);
  });
});

describe("skills-stats-lib sitemap manifest", () => {
  it("lists the new report so it gets indexed", () => {
    expect(REPORT_PATHS).toContain("/state-of-agent-skills");
    expect(new Set(REPORT_PATHS).size).toBe(REPORT_PATHS.length);
  });
});

describe("skills-stats-lib real registry data", () => {
  const asOf = String(REGISTRY_GENERATED_AT).slice(0, 10);
  const model = buildSkillsReport(ENTRIES, asOf);

  it("covers a substantial skills corpus with informative dimensions", () => {
    expect(model.total).toBeGreaterThan(50);
    expect(model.dimensions.length).toBeGreaterThanOrEqual(2);
    for (const dimension of model.dimensions) {
      expect(dimension.rows.length).toBeGreaterThan(1);
    }
  });
});
