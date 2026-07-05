import { describe, expect, it } from "vitest";

import {
  LOCAL_DRAFT_TOOL_NAMES,
  MCP_PUBLIC_POLICY,
  READ_ONLY_TOOL_NAMES,
  TOOL_DEFINITIONS,
} from "../packages/mcp/src/registry-tools-lib.js";
import {
  LOCAL_DRAFT_TOOL_NAMES as localDraftFromWrapper,
  MCP_PUBLIC_POLICY as policyFromWrapper,
  READ_ONLY_TOOL_NAMES as readOnlyFromWrapper,
  TOOL_DEFINITIONS as toolsFromWrapper,
} from "../packages/mcp/src/registry.js";

describe("registry-tools-lib policy and tool lists", () => {
  it("keeps the public MCP policy read-only and PR-safe", () => {
    expect(MCP_PUBLIC_POLICY).toMatchObject({
      apiKeyRequired: false,
      readOnly: true,
      createsIssues: false,
      createsPullRequests: false,
      publishesContent: false,
      writesLocalFiles: false,
    });
    expect(MCP_PUBLIC_POLICY.note).toContain("read public registry artifacts");
  });

  it("aligns tool definitions with the read-only tool name list", () => {
    expect(TOOL_DEFINITIONS.map((tool) => tool.name)).toEqual(
      READ_ONLY_TOOL_NAMES,
    );
    expect(
      LOCAL_DRAFT_TOOL_NAMES.every((name) =>
        READ_ONLY_TOOL_NAMES.includes(name),
      ),
    ).toBe(true);
  });

  it("fills default output schemas and read-only annotations", () => {
    for (const tool of TOOL_DEFINITIONS) {
      expect(tool.inputSchema).toBeTruthy();
      expect(tool.outputSchema).toBeTruthy();
      expect(tool.annotations).toMatchObject({
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      });
    }
  });
});

describe("registry re-export compatibility", () => {
  it("keeps the public registry wrapper wired to the extracted lib", () => {
    expect(policyFromWrapper).toBe(MCP_PUBLIC_POLICY);
    expect(readOnlyFromWrapper).toBe(READ_ONLY_TOOL_NAMES);
    expect(localDraftFromWrapper).toBe(LOCAL_DRAFT_TOOL_NAMES);
    expect(toolsFromWrapper).toBe(TOOL_DEFINITIONS);
  });
});
