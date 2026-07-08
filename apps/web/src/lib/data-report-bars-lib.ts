// Pure bar-width computation for a data report's distribution table, split out
// of data-report.tsx so the max-scaling can be unit-tested without rendering.

import type { DistRow } from "@/components/data-report";

/**
 * Percentage widths (0–100) for a distribution table's bars, one per row, each
 * scaled to the largest row's `count`. Every row resolves to 0 when the maximum
 * count is 0 (including an empty list), and each width is rounded to a whole
 * number.
 */
export function distBarWidths(rows: readonly DistRow[]): number[] {
  const max = rows.reduce((m, r) => Math.max(m, r.count), 0);
  return rows.map((r) => (max ? Math.round((r.count / max) * 100) : 0));
}
