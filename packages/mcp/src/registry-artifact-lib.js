/**
 * Pure MCP registry artifact path helpers.
 *
 * Slug-safe path validation and artifact envelope parsing live here.
 * Runtime registry handlers stay in `registry.js`.
 */
import path from "node:path";

const safePathPartPattern = /^[a-z0-9-]+$/;

export function isSafePathPart(value) {
  return safePathPartPattern.test(String(value || ""));
}

export function safeRelativePath(relativePath) {
  const parts = String(relativePath || "").split("/");
  if (
    !parts.length ||
    parts.some((part) => !part || part === "." || part === "..")
  ) {
    throw new Error(`Unsafe registry artifact path: ${relativePath}`);
  }
  return parts.join(path.sep);
}

export function unwrapEntries(payload) {
  if (!payload || !Array.isArray(payload.entries)) {
    throw new Error("Expected registry artifact envelope with entries array.");
  }
  return payload.entries;
}
