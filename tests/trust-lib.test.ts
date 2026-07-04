import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  getTrustReasons,
  installRiskLevel,
  INSTALL_RISK_DETAIL,
  INSTALL_RISK_LABEL,
  summarizeTrust,
} from "@/lib/trust-lib";
import {
  getTrustReasons as getTrustReasonsFromWrapper,
  installRiskLevel as installRiskLevelFromWrapper,
} from "@/lib/trust";
import type { Entry } from "@/types/registry";

function entry(overrides: Partial<Entry> = {}): Entry {
  return {
    category: "skills",
    slug: "demo",
    title: "Demo",
    description: "d",
    trust: "trusted",
    source: "first-party",
    platforms: [],
    tags: [],
    ...overrides,
  } as Entry;
}

const byId = (reasons: ReturnType<typeof getTrustReasons>, id: string) =>
  reasons.find((r) => r.id === id);

describe("trust-lib getTrustReasons", () => {
  it("always emits the six core reasons", () => {
    const reasons = getTrustReasons(entry());
    for (const id of ["trust-level", "source", "claim", "reviewed", "safety", "privacy"]) {
      expect(byId(reasons, id), `missing ${id}`).toBeDefined();
    }
  });

  it("maps trust posture to severity", () => {
    expect(byId(getTrustReasons(entry({ trust: "trusted" })), "trust-level")?.severity).toBe("ok");
    expect(byId(getTrustReasons(entry({ trust: "review" })), "trust-level")?.severity).toBe(
      "warning",
    );
    expect(byId(getTrustReasons(entry({ trust: "limited" })), "trust-level")?.severity).toBe(
      "warning",
    );
    expect(byId(getTrustReasons(entry({ trust: "blocked" })), "trust-level")?.severity).toBe(
      "blocker",
    );
  });

  it("maps source provenance to severity", () => {
    expect(byId(getTrustReasons(entry({ source: "first-party" })), "source")?.severity).toBe("ok");
    expect(byId(getTrustReasons(entry({ source: "source-backed" })), "source")?.severity).toBe(
      "ok",
    );
    expect(byId(getTrustReasons(entry({ source: "external" })), "source")?.severity).toBe("info");
    expect(
      byId(getTrustReasons(entry({ source: "community" as Entry["source"] })), "source")?.severity,
    ).toBe("warning");
  });

  it("links repository metadata on the source reason when available", () => {
    const reason = byId(
      getTrustReasons(entry({ sourceUrl: "https://github.com/example/repo" })),
      "source",
    );
    expect(reason?.sourceHref).toBe("https://github.com/example/repo");
    expect(reason?.sourceLabel).toBe("Repository");
  });

  it("treats safetyNotesList and privacyNotesList as equivalent to string notes", () => {
    expect(byId(getTrustReasons(entry({ safetyNotes: "runs a worker" })), "safety")?.severity).toBe(
      "ok",
    );
    expect(
      byId(getTrustReasons(entry({ safetyNotesList: ["touches ~/.ssh"] })), "safety")?.severity,
    ).toBe("ok");
    expect(
      byId(getTrustReasons(entry({ privacyNotesList: ["no telemetry"] })), "privacy")?.severity,
    ).toBe("ok");
    expect(byId(getTrustReasons(entry()), "safety")?.severity).toBe("warning");
  });

  it("only emits checksum reason when a download is present", () => {
    expect(byId(getTrustReasons(entry()), "checksum")).toBeUndefined();
    expect(
      byId(getTrustReasons(entry({ downloadUrl: "https://x/y.zip" })), "checksum")?.severity,
    ).toBe("warning");
    expect(
      byId(getTrustReasons(entry({ downloadSha256: "abcdef0123456789" })), "checksum")?.severity,
    ).toBe("ok");
  });

  it("only emits package-verified reason when the flag is defined", () => {
    expect(byId(getTrustReasons(entry()), "package-verified")).toBeUndefined();
    expect(
      byId(getTrustReasons(entry({ packageVerified: true })), "package-verified")?.severity,
    ).toBe("ok");
    expect(
      byId(getTrustReasons(entry({ packageVerified: false })), "package-verified")?.severity,
    ).toBe("warning");
  });

  it("emits prerequisites reason only when present", () => {
    expect(byId(getTrustReasons(entry()), "prereqs")).toBeUndefined();
    expect(
      byId(getTrustReasons(entry({ prerequisites: ["Node 20", "an API key"] })), "prereqs")?.label,
    ).toContain("2 prerequisites");
    expect(
      byId(getTrustReasons(entry({ prerequisites: ["one"] })), "prereqs")?.label,
    ).toContain("1 prerequisite");
  });
});

describe("trust-lib summarizeTrust", () => {
  it("counts every reason exactly once across severities", () => {
    const reasons = getTrustReasons(
      entry({ trust: "blocked", source: "external", packageVerified: false }),
    );
    const counts = summarizeTrust(reasons);
    expect(counts.ok + counts.info + counts.warning + counts.blocker).toBe(reasons.length);
    expect(counts.blocker).toBeGreaterThan(0);
  });
});

describe("trust-lib installRiskLevel", () => {
  const lowEntry = () =>
    entry({
      trust: "trusted",
      source: "first-party",
      claimed: true,
      reviewed: true,
      safetyNotes: "runs read-only",
      privacyNotes: "no telemetry",
      packageVerified: true,
    });

  it("returns low for a clean trusted entry", () => {
    expect(installRiskLevel(lowEntry())).toBe("low");
  });

  it("returns high when blocked", () => {
    expect(installRiskLevel(entry({ trust: "blocked" }))).toBe("high");
  });

  it("returns review when trust is not trusted (no blocker)", () => {
    expect(installRiskLevel({ ...lowEntry(), trust: "review" } as Entry)).toBe("review");
    expect(installRiskLevel({ ...lowEntry(), trust: "limited" } as Entry)).toBe("review");
  });

  it("downgrades a trusted entry to review on any warning", () => {
    expect(installRiskLevel({ ...lowEntry(), reviewed: false } as Entry)).toBe("review");
    expect(
      installRiskLevel({ ...lowEntry(), safetyNotes: undefined, safetyNotesList: [] } as Entry),
    ).toBe("review");
    expect(installRiskLevel({ ...lowEntry(), packageVerified: false } as Entry)).toBe("review");
  });

  it("exposes labels and details for every risk level", () => {
    expect(INSTALL_RISK_LABEL.low).toBe("Low risk");
    expect(INSTALL_RISK_LABEL.review).toBe("Review first");
    expect(INSTALL_RISK_LABEL.high).toBe("High risk");
    expect(INSTALL_RISK_DETAIL.low).toContain("Source-backed");
    expect(INSTALL_RISK_DETAIL.review).toContain("safety notes");
    expect(INSTALL_RISK_DETAIL.high).toContain("human review");
  });

  it("keeps the public wrapper re-export aligned with the lib module", () => {
    const sample = lowEntry();
    expect(getTrustReasonsFromWrapper(sample)).toEqual(getTrustReasons(sample));
    expect(installRiskLevelFromWrapper(sample)).toBe(installRiskLevel(sample));
  });
});

describe("trust-lib freshness 60-day boundary", () => {
  const NOW = new Date("2026-06-13T00:00:00.000Z");
  const daysAgo = (n: number) => new Date(NOW.getTime() - n * 86_400_000).toISOString();

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("treats verification under 60 days old as fresh", () => {
    const reasons = getTrustReasons(entry({ reviewedAt: daysAgo(59) }));
    const freshness = byId(reasons, "freshness");
    expect(freshness?.severity).toBe("ok");
    expect(freshness?.label).toBe("Recently verified");
  });

  it("treats verification at/after 60 days as stale", () => {
    expect(byId(getTrustReasons(entry({ reviewedAt: daysAgo(60) })), "freshness")?.severity).toBe(
      "warning",
    );
    expect(byId(getTrustReasons(entry({ reviewedAt: daysAgo(120) })), "freshness")?.severity).toBe(
      "warning",
    );
  });

  it("prefers brandVerifiedAt over reviewedAt/submittedAt for freshness", () => {
    const reasons = getTrustReasons(
      entry({ brandVerifiedAt: daysAgo(1), reviewedAt: daysAgo(900) }),
    );
    expect(byId(reasons, "freshness")?.severity).toBe("ok");
  });

  it("a stale verification pushes an otherwise-clean entry to review risk", () => {
    const stale = entry({
      trust: "trusted",
      source: "first-party",
      claimed: true,
      reviewed: true,
      safetyNotes: "x",
      privacyNotes: "y",
      packageVerified: true,
      reviewedAt: daysAgo(90),
    });
    expect(installRiskLevel(stale)).toBe("review");
  });
});
