/**
 * Pure MCP registry entry filter helpers.
 *
 * Tag matching, boolean filter normalization, and trust-filter gating live here.
 * Runtime registry handlers stay in `registry.js`.
 */
import { normalizeText } from "./registry-normalize-lib.js";
import {
  entryClaimStatusValue,
  entryHasPrivacyNotes,
  entryHasSafetyNotes,
  entryPackageTrustValue,
  entrySourceStatusValue,
} from "./search-ranking.js";

export function booleanFilterMatches(value, filter = "all") {
  if (!filter || filter === "all") return true;
  return filter === "true" ? Boolean(value) : !value;
}

export function entryMatchesTag(entry, tag) {
  if (!tag) return true;
  return (entry.tags || []).some(
    (candidate) => normalizeText(candidate) === tag,
  );
}

export function entryMatchesTrustFilters(entry, args = {}) {
  if (!booleanFilterMatches(entryHasSafetyNotes(entry), args.hasSafetyNotes)) {
    return false;
  }
  if (
    !booleanFilterMatches(entryHasPrivacyNotes(entry), args.hasPrivacyNotes)
  ) {
    return false;
  }
  if (
    args.downloadTrust &&
    args.downloadTrust !== "all" &&
    entryPackageTrustValue(entry) !== args.downloadTrust
  ) {
    return false;
  }
  if (
    args.claimStatus &&
    args.claimStatus !== "all" &&
    entryClaimStatusValue(entry) !== args.claimStatus
  ) {
    return false;
  }
  if (
    args.sourceStatus &&
    args.sourceStatus !== "all" &&
    entrySourceStatusValue(entry) !== args.sourceStatus
  ) {
    return false;
  }
  return true;
}
