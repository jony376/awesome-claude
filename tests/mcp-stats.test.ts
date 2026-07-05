import { describe, expect, it } from "vitest";

import {
  authDistribution,
  classifyAuth,
  classifyTransport,
  hostingDistribution,
  hostingOf,
  supplyChainCoverage,
  transportDistribution,
} from "@/lib/mcp-stats";
import type { Entry } from "@/types/registry";

function mk(partial: Partial<Entry>): Entry {
  return { category: "mcp", slug: "x", title: "X", ...partial } as Entry;
}

describe("mcp-stats re-export surface", () => {
  it("keeps the public import path wired to the extracted lib", () => {
    const entries = [
      mk({ configSnippet: '{"command":"npx"}', prerequisites: ["API key"] }),
      mk({
        configSnippet: '{"type":"http","url":"https://a/mcp"}',
        prerequisites: ["OAuth"],
      }),
    ];

    expect(classifyTransport(entries[0])).toBe("stdio (local)");
    expect(hostingOf("HTTP")).toBe("Remote (hosted)");
    expect(classifyAuth(entries[1])).toBe("OAuth");
    expect(transportDistribution(entries).total).toBe(2);
    expect(hostingDistribution(entries).total).toBe(2);
    expect(authDistribution(entries).total).toBe(2);
    expect(supplyChainCoverage(entries).total).toBe(2);
  });
});
