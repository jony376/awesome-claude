import path from "node:path";
import { describe, expect, it } from "vitest";

import {
  isSafePathPart,
  safeRelativePath,
  unwrapEntries,
} from "../packages/mcp/src/registry-artifact-lib.js";

describe("registry-artifact-lib path safety", () => {
  it("accepts slug-safe category and entry path parts", () => {
    expect(isSafePathPart("skills")).toBe(true);
    expect(isSafePathPart("browser-bridge")).toBe(true);
    expect(isSafePathPart("Bad_Slug")).toBe(false);
    expect(isSafePathPart("../escape")).toBe(false);
  });

  it("normalizes safe relative artifact paths and rejects traversal", () => {
    expect(safeRelativePath("entries/skills/browser-bridge.json")).toBe(
      path.join("entries", "skills", "browser-bridge.json"),
    );
    expect(() => safeRelativePath("entries/../secrets.json")).toThrow(
      /Unsafe registry artifact path/i,
    );
  });
});

describe("registry-artifact-lib envelope parsing", () => {
  it("unwraps registry artifact envelopes with entries arrays", () => {
    const entries = [{ category: "mcp", slug: "example" }];
    expect(unwrapEntries({ entries })).toBe(entries);
    expect(() => unwrapEntries({ entries: null })).toThrow(
      /Expected registry artifact envelope/i,
    );
  });
});
