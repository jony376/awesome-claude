import { describe, expect, it } from "vitest";

import type { DistRow } from "../apps/web/src/components/data-report";
import { distBarWidths } from "../apps/web/src/lib/data-report-bars-lib";

const row = (label: string, count: number): DistRow => ({
  label,
  count,
  pct: 0,
});

describe("distBarWidths", () => {
  it("returns an empty array for no rows", () => {
    expect(distBarWidths([])).toEqual([]);
  });

  it("scales every row to the largest count", () => {
    expect(distBarWidths([row("a", 10), row("b", 5), row("c", 1)])).toEqual([
      100, 50, 10,
    ]);
  });

  it("gives the max row 100%", () => {
    expect(distBarWidths([row("a", 3), row("b", 9)])).toEqual([33, 100]);
  });

  it("returns 0 for every row when all counts are 0", () => {
    expect(distBarWidths([row("a", 0), row("b", 0)])).toEqual([0, 0]);
  });

  it("rounds each width to a whole number", () => {
    // 1/3 => 33.33.. rounds to 33, 2/3 => 66.66.. rounds to 67
    expect(distBarWidths([row("a", 1), row("b", 2), row("c", 3)])).toEqual([
      33, 67, 100,
    ]);
  });
});
