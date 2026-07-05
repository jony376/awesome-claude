/**
 * MCP registry search ranking surface.
 *
 * Pure search normalization, platform matching, and ranking helpers live in
 * `search-ranking-lib.js`. This module re-exports that surface so existing
 * `@heyclaude/mcp/search-ranking` imports stay unchanged.
 */
export {
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
} from "./search-ranking-lib.js";
