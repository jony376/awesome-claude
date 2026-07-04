/**
 * Quality dashboard helpers extracted into a pure library module.
 *
 * The deterministic trust-report aggregation layer lives in
 * `@/lib/quality-dashboard-lib` and is re-exported below so the public
 * `@/lib/quality-dashboard` surface is unchanged for routes and tests.
 */
export {
  buildCategoryHref,
  buildCategoryTrustRows,
  buildEntryHref,
  buildQualityDashboardSummary,
  findSafetyPrivacyGaps,
  isRiskBearingCategory,
  rankWeakestTrustCategories,
  summarizeProvenanceCoverage,
  summarizeRiskBearingTotals,
  toSafePathSegment,
  type CategoryTrustRow,
  type ProvenanceCoverage,
  type QualityDashboardSummary,
  type RiskBearingTotals,
  type SafetyPrivacyGap,
} from "@/lib/quality-dashboard-lib";
