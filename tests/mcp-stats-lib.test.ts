import { describe, expect, it } from "vitest";

import {
  authDistribution,
  classifyAuth,
  classifyTransport,
  hostingDistribution,
  hostingOf,
  supplyChainCoverage,
  transportDistribution,
} from "@/lib/mcp-stats-lib";
import {
  classifyTransport as classifyTransportFromWrapper,
  supplyChainCoverage as supplyChainCoverageFromWrapper,
} from "@/lib/mcp-stats";
import type { Entry } from "@/types/registry";

/** Build a minimal Entry; only the fields the stats helpers read need to be real. */
function mk(partial: Partial<Entry>): Entry {
  return { category: "mcp", slug: "x", title: "X", ...partial } as Entry;
}

describe("mcp-stats-lib classifyTransport", () => {
  it("detects stdio from a local command config", () => {
    expect(
      classifyTransport(
        mk({ configSnippet: '{"command":"npx","args":["-y","srv"]}' }),
      ),
    ).toBe("stdio (local)");
  });

  it("detects HTTP from an explicit type, a remote url, or the install flag", () => {
    expect(
      classifyTransport(
        mk({ configSnippet: '{"type":"http","url":"https://x/mcp"}' }),
      ),
    ).toBe("HTTP");
    expect(
      classifyTransport(mk({ copySnippet: '{"url":"https://x.app/mcp"}' })),
    ).toBe("HTTP");
    expect(
      classifyTransport(
        mk({
          installCommand: "claude mcp add --transport http x https://x/mcp",
        }),
      ),
    ).toBe("HTTP");
    expect(
      classifyTransport(
        mk({
          configSnippet: '{"transport":"streamable-http","url":"https://x/mcp"}',
        }),
      ),
    ).toBe("HTTP");
  });

  it("detects SSE before HTTP when both markers appear", () => {
    expect(
      classifyTransport(
        mk({ configSnippet: '{"transport":"sse","url":"https://x/sse"}' }),
      ),
    ).toBe("SSE");
    expect(
      classifyTransport(
        mk({
          installCommand:
            "claude mcp add --transport sse demo https://x/sse-endpoint",
        }),
      ),
    ).toBe("SSE");
    expect(
      classifyTransport(
        mk({
          configSnippet:
            '{"type":"http","url":"https://x/mcp","transport":"sse","endpoint":"https://x/sse"}',
        }),
      ),
    ).toBe("SSE");
  });

  it("is Unspecified with no config/install signal", () => {
    expect(classifyTransport(mk({}))).toBe("Unspecified");
  });

  it("does not infer transport from unrelated non-empty config", () => {
    expect(
      classifyTransport(
        mk({ configSnippet: '{"env":{"API_KEY":"required"}}' }),
      ),
    ).toBe("Unspecified");
    expect(
      classifyTransport(
        mk({ copySnippet: '{"headers":{"authorization":"Bearer token"}}' }),
      ),
    ).toBe("Unspecified");
  });

  it("joins config, copy, and install fields case-insensitively", () => {
    expect(
      classifyTransport(
        mk({
          configSnippet: '{"COMMAND":"NPX"}',
          copySnippet: "",
          installCommand: "",
        }),
      ),
    ).toBe("Unspecified");
    expect(
      classifyTransport(
        mk({
          configSnippet: '{"command":"npx"}',
          copySnippet: '{"URL":"https://remote/mcp"}',
        }),
      ),
    ).toBe("HTTP");
  });
});

describe("mcp-stats-lib hostingOf", () => {
  it("maps transport to local/remote", () => {
    expect(hostingOf("stdio (local)")).toBe("Local (stdio)");
    expect(hostingOf("HTTP")).toBe("Remote (hosted)");
    expect(hostingOf("SSE")).toBe("Remote (hosted)");
    expect(hostingOf("Unspecified")).toBe("Unspecified");
  });
});

describe("mcp-stats-lib classifyAuth", () => {
  it("prefers OAuth, then API key, then token, else none", () => {
    expect(
      classifyAuth(mk({ prerequisites: ["OAuth2 credentials or a PAT"] })),
    ).toBe("OAuth");
    expect(classifyAuth(mk({ prerequisites: ["oauth credentials"] }))).toBe(
      "OAuth",
    );
    expect(
      classifyAuth(mk({ prerequisites: ["An API key from the dashboard"] })),
    ).toBe("API key");
    expect(
      classifyAuth(mk({ prerequisites: ["An api_key from the dashboard"] })),
    ).toBe("API key");
    expect(
      classifyAuth(mk({ prerequisites: ["A personal access token (PAT)"] })),
    ).toBe("Token / PAT");
    expect(classifyAuth(mk({ prerequisites: ["Node.js 18+"] }))).toBe(
      "None / unspecified",
    );
  });

  it("reads from notes and description too, not just prerequisites", () => {
    expect(
      classifyAuth(mk({ safetyNotes: "Scope the API key to read-only." })),
    ).toBe("API key");
    expect(
      classifyAuth(mk({ description: "Connect via OAuth to your account." })),
    ).toBe("OAuth");
    expect(
      classifyAuth(mk({ privacyNotes: "Requires bearer token in headers." })),
    ).toBe("Token / PAT");
  });

  it("treats oauth as stronger than api key when both appear", () => {
    expect(
      classifyAuth(
        mk({
          prerequisites: ["API key", "OAuth consent flow"],
        }),
      ),
    ).toBe("OAuth");
  });
});

describe("mcp-stats-lib distributions", () => {
  const entries = [
    mk({ configSnippet: '{"command":"npx"}', prerequisites: ["API key"] }),
    mk({
      configSnippet: '{"command":"uvx"}',
      prerequisites: ["A personal access token"],
    }),
    mk({
      configSnippet: '{"type":"http","url":"https://a/mcp"}',
      prerequisites: ["OAuth"],
    }),
    mk({
      configSnippet: '{"transport":"sse","url":"https://b/sse"}',
      prerequisites: ["Node 18"],
    }),
  ];

  it("counts transports and keeps the fixed order, dropping empties", () => {
    const { rows, total } = transportDistribution(entries);
    expect(total).toBe(4);
    expect(rows.map((r) => [r.label, r.count])).toEqual([
      ["stdio (local)", 2],
      ["HTTP", 1],
      ["SSE", 1],
    ]);
  });

  it("keeps Unspecified last when an entry has no declared transport", () => {
    const { rows, total } = transportDistribution([
      mk({ configSnippet: '{"transport":"sse","url":"https://b/sse"}' }),
      mk({ configSnippet: '{"env":{"TOKEN":"required"}}' }),
    ]);

    expect(total).toBe(2);
    expect(rows.map((r) => [r.label, r.count])).toEqual([
      ["SSE", 1],
      ["Unspecified", 1],
    ]);
  });

  it("derives local-vs-remote hosting", () => {
    const rows = hostingDistribution(entries).rows;
    expect(rows.find((r) => r.label === "Local (stdio)")?.count).toBe(2);
    expect(rows.find((r) => r.label === "Remote (hosted)")?.count).toBe(2);
  });

  it("counts auth methods", () => {
    const rows = authDistribution(entries).rows;
    expect(rows.find((r) => r.label === "OAuth")?.count).toBe(1);
    expect(rows.find((r) => r.label === "API key")?.count).toBe(1);
    expect(rows.find((r) => r.label === "Token / PAT")?.count).toBe(1);
    expect(rows.find((r) => r.label === "None / unspecified")?.count).toBe(1);
  });

  it("returns empty rows for an empty entry list", () => {
    expect(transportDistribution([])).toEqual({ rows: [], total: 0 });
    expect(hostingDistribution([])).toEqual({ rows: [], total: 0 });
    expect(authDistribution([])).toEqual({ rows: [], total: 0 });
  });
});

describe("mcp-stats-lib supplyChainCoverage", () => {
  it("counts verified packages and checksummed downloads", () => {
    const cov = supplyChainCoverage([
      mk({
        packageVerified: true,
        downloadUrl: "/d.mcpb",
        downloadSha256: "abc",
      }),
      mk({ packageVerified: true }),
      mk({ downloadUrl: "/d.mcpb" }),
      mk({}),
    ]);
    expect(cov).toEqual({
      total: 4,
      packageVerified: 2,
      checksummedDownload: 1,
    });
  });

  it("requires both downloadUrl and downloadSha256 for checksummed counts", () => {
    expect(
      supplyChainCoverage([
        mk({ downloadUrl: "/pkg.mcpb", downloadSha256: "deadbeef" }),
        mk({ downloadSha256: "deadbeef" }),
        mk({ downloadUrl: "/pkg.mcpb" }),
      ]),
    ).toEqual({
      total: 3,
      packageVerified: 0,
      checksummedDownload: 1,
    });
  });
});

describe("mcp-stats-lib wrapper compatibility", () => {
  it("keeps the public import path wired to the extracted lib", () => {
    const entry = mk({
      configSnippet: '{"command":"npx"}',
      packageVerified: true,
    });
    expect(classifyTransportFromWrapper(entry)).toBe(classifyTransport(entry));
    expect(supplyChainCoverageFromWrapper([entry])).toEqual(
      supplyChainCoverage([entry]),
    );
  });
});
