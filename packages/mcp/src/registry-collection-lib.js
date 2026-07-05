/**
 * Pure MCP registry collection and date helpers.
 *
 * Trust-filter argument normalization, array utilities, and date floor parsing
 * live here. Runtime registry handlers stay in `registry.js`.
 */
import { normalizeText } from "./registry-normalize-lib.js";

export function parsedTrustArgs(args = {}) {
  return {
    hasSafetyNotes: args.hasSafetyNotes || "all",
    hasPrivacyNotes: args.hasPrivacyNotes || "all",
    downloadTrust: args.downloadTrust || "all",
    claimStatus: args.claimStatus || "all",
    sourceStatus: args.sourceStatus || "all",
  };
}

export function intersection(left = [], right = [], normalize = normalizeText) {
  const rightValues = new Set((right || []).map(normalize).filter(Boolean));
  return (left || [])
    .map(normalize)
    .filter((value, index, values) => value && values.indexOf(value) === index)
    .filter((value) => rightValues.has(value));
}

export function unique(values = []) {
  return values.filter(
    (value, index, list) => value && list.indexOf(value) === index,
  );
}

export function normalizeDateFloor(value) {
  const text = String(value || "").trim();
  if (!text) return "";
  const timestamp = Date.parse(text);
  if (!Number.isFinite(timestamp)) return "";
  return new Date(timestamp).toISOString().slice(0, 10);
}
