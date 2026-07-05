import { describe, expect, it } from "vitest";
import { z } from "zod";

import {
  CompareEntriesInputSchema,
  SearchRegistryInputSchema,
  SubmissionFieldsSchema,
  TOOL_INPUT_SCHEMAS,
  formatZodError,
  jsonSchemaForTool,
  jsonSchemaForToolOutput,
  parseToolArguments,
} from "../packages/mcp/src/schemas-lib.js";
import {
  formatZodError as formatZodErrorFromWrapper,
  jsonSchemaForTool as jsonSchemaForToolFromWrapper,
  parseToolArguments as parseToolArgumentsFromWrapper,
} from "../packages/mcp/src/schemas.js";

const PUBLIC_TOOL_NAMES = [
  "registry.search",
  "registry.plan",
  "registry.recommend",
  "registry.info",
  "registry.list",
  "registry.updates",
  "entry.related",
  "entry.detail",
  "entry.asset",
  "entry.compare",
  "registry.stats",
  "install.setup",
  "install.compatibility",
  "install.guidance",
  "install.adapter",
  "registry.feeds",
  "submission.schema",
  "submission.validate",
  "submission.duplicates",
  "submission.urls",
  "submission.guidance",
  "submission.prepare",
  "submission.examples",
  "submission.review",
  "submission.policy",
  "entry.trust",
  "entry.safety",
  "entry.coverage",
];

describe("schemas-lib tool registry", () => {
  it("registers every public MCP tool input schema", () => {
    expect(Object.keys(TOOL_INPUT_SCHEMAS).sort()).toEqual(
      PUBLIC_TOOL_NAMES.sort(),
    );
  });

  it("converts known tool schemas to JSON Schema without $schema", () => {
    const schema = jsonSchemaForTool("registry.search");
    expect(schema.type).toBe("object");
    expect(schema.properties).toHaveProperty("query");
    expect(schema).not.toHaveProperty("$schema");
  });

  it("throws for unknown tool schema names", () => {
    expect(() => jsonSchemaForTool("not_a_real_tool")).toThrow(
      "Unknown HeyClaude MCP tool schema",
    );
    expect(() => jsonSchemaForToolOutput("not_a_real_tool")).toThrow(
      "Unknown HeyClaude MCP tool output schema",
    );
    expect(() => parseToolArguments("not_a_real_tool", {})).toThrow(
      "Unknown HeyClaude MCP tool schema",
    );
  });
});

describe("schemas-lib argument parsing", () => {
  it("parses registry search arguments with defaults and filters", () => {
    expect(
      parseToolArguments("registry.search", { query: "mcp", limit: 1 }),
    ).toEqual({
      query: "mcp",
      limit: 1,
    });
    expect(parseToolArguments("registry.search", {})).toEqual({});
  });

  it("rejects unknown registry.search fields and invalid limits", () => {
    expect(() =>
      parseToolArguments("registry.search", { query: "mcp", extra: true }),
    ).toThrow();
    expect(() => parseToolArguments("registry.search", { limit: 0 })).toThrow();
    expect(() =>
      parseToolArguments("registry.search", { limit: 26 }),
    ).toThrow();
  });

  it("parses submission.validate fields through the submission schema", () => {
    expect(
      parseToolArguments("submission.validate", {
        fields: {
          category: "mcp",
          name: "Example MCP",
          description: "Source-backed MCP server used in schema tests.",
        },
      }),
    ).toMatchObject({
      fields: {
        category: "mcp",
        name: "Example MCP",
      },
    });
  });

  it("parses entry.compare arguments with two entries", () => {
    expect(
      parseToolArguments("entry.compare", {
        entries: [
          { category: "skills", slug: "demo-skill" },
          { category: "mcp", slug: "demo-mcp" },
        ],
      }),
    ).toMatchObject({
      entries: [
        { category: "skills", slug: "demo-skill" },
        { category: "mcp", slug: "demo-mcp" },
      ],
    });
  });
});

describe("schemas-lib direct schema validation", () => {
  it("accepts strict registry search filters", () => {
    expect(
      SearchRegistryInputSchema.parse({
        query: "browser automation",
        category: "mcp",
        platform: "claude-code",
        hasSafetyNotes: "true",
        limit: 5,
      }),
    ).toMatchObject({
      query: "browser automation",
      category: "mcp",
      platform: "claude-code",
      hasSafetyNotes: "true",
      limit: 5,
    });
  });

  it("rejects invalid category slugs and compare entry counts", () => {
    expect(() =>
      SearchRegistryInputSchema.parse({ category: "Invalid Category" }),
    ).toThrow();
    expect(() =>
      CompareEntriesInputSchema.parse({
        entries: [{ category: "mcp", slug: "only-one" }],
      }),
    ).toThrow();
  });

  it("enforces submission notes shape limits", () => {
    expect(() =>
      SubmissionFieldsSchema.parse({
        safety_notes: Array.from(
          { length: 9 },
          (_, index) => `line ${index}`,
        ).join("\n"),
      }),
    ).toThrow();
  });
});

describe("schemas-lib error formatting", () => {
  it("returns JSON-schema output metadata for known tools", () => {
    const schema = jsonSchemaForToolOutput("entry.compare");
    expect(schema.type).toBe("object");
    expect(schema.properties).toHaveProperty("ok");
    expect(schema.required).toContain("ok");
  });

  it("flattens ZodError issues into path/message/code records", () => {
    const result = z.object({ a: z.string() }).safeParse({ a: 123 });
    expect(result.success).toBe(false);
    if (result.success) return;
    const issues = formatZodError(result.error);
    expect(issues).not.toBeNull();
    expect(issues![0]).toMatchObject({ path: "a", code: "invalid_type" });
    expect(typeof issues![0].message).toBe("string");
  });

  it("returns null for non-Zod errors", () => {
    expect(formatZodError(new Error("boom"))).toBeNull();
  });
});

describe("schemas re-export compatibility", () => {
  it("keeps the public wrapper wired to the extracted lib", () => {
    expect(
      parseToolArgumentsFromWrapper("registry.search", {
        query: "mcp",
        limit: 2,
      }),
    ).toEqual(
      parseToolArguments("registry.search", { query: "mcp", limit: 2 }),
    );
    expect(jsonSchemaForToolFromWrapper("registry.search")).toEqual(
      jsonSchemaForTool("registry.search"),
    );
    expect(formatZodErrorFromWrapper(new Error("boom"))).toBeNull();
  });
});
