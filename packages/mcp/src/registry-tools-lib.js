/**
 * Pure MCP registry tool metadata helpers.
 *
 * Public policy, read-only tool name lists, and tool definition metadata live
 * here. Runtime registry handlers stay in `registry.js`.
 *
 * The public surface (`registry.js` / `@heyclaude/mcp/registry`) re-exports
 * everything below so existing imports stay unchanged.
 */
import { jsonSchemaForTool, jsonSchemaForToolOutput } from "./schemas.js";

export const MCP_PUBLIC_POLICY = {
  apiKeyRequired: false,
  readOnly: true,
  createsIssues: false,
  createsPullRequests: false,
  publishesContent: false,
  writesLocalFiles: false,
  note: "HeyClaude MCP tools only read public registry artifacts or prepare maintainer-reviewed submission drafts.",
};

export const READ_ONLY_TOOL_NAMES = [
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

export const LOCAL_DRAFT_TOOL_NAMES = [
  "submission.validate",
  "submission.urls",
  "submission.prepare",
  "submission.review",
];

export const TOOL_DEFINITIONS = [
  {
    name: "registry.search",
    description:
      "Search read-only HeyClaude registry entries by query, category, exact tag, and skill platform compatibility.",
    inputSchema: jsonSchemaForTool("registry.search"),
    outputSchema: jsonSchemaForToolOutput("registry.search"),
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
    },
  },
  {
    name: "registry.plan",
    description:
      "Plan a read-only Claude or Codex workflow toolbox from ranked HeyClaude registry entries. Each entry includes an inline install block (install command, config snippet, download URL) and the recommended stack is summarized as a copy-pasteable installPlan, alongside trust and follow-up guidance.",
    inputSchema: jsonSchemaForTool("registry.plan"),
    outputSchema: jsonSchemaForToolOutput("registry.plan"),
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
    },
  },
  {
    name: "registry.recommend",
    description:
      "Answer 'what should I use to do X' in one call. Given a plain-language task (and optional platform/category), returns the best-match HeyClaude entries ranked by fit — each with why it fits, trust summary, disclosed safety/privacy notes, and an inline install block — plus a topPick and a consolidated installPlan. Unlike workflow.plan it does not force category diversity; it returns the genuinely best matches. Collapses the search → compare → detail → asset loop into a single answer-shaped response.",
    inputSchema: jsonSchemaForTool("registry.recommend"),
    outputSchema: jsonSchemaForToolOutput("registry.recommend"),
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
    },
  },
  {
    name: "registry.info",
    description:
      "Fetch read-only HeyClaude MCP package, registry, tool, and public rate-limit metadata.",
    inputSchema: jsonSchemaForTool("registry.info"),
  },
  {
    name: "registry.list",
    description:
      "List read-only HeyClaude entries with bounded pagination and optional category, platform, tag, and query filters.",
    inputSchema: jsonSchemaForTool("registry.list"),
  },
  {
    name: "registry.updates",
    description:
      "List recently added or upstream-updated HeyClaude entries from generated registry metadata.",
    inputSchema: jsonSchemaForTool("registry.updates"),
  },
  {
    name: "entry.related",
    description:
      "Fetch read-only related HeyClaude entries based on category, tags, platforms, keywords, and source metadata.",
    inputSchema: jsonSchemaForTool("entry.related"),
  },
  {
    name: "entry.detail",
    description:
      "Fetch a read-only HeyClaude registry entry detail payload by category and slug. By default (bodyMode='excerpt') the body markdown is trimmed to a short lead and large copyable fields are omitted to conserve context, with bodyChars/bodyTruncated/omittedFields describing what was dropped; pass bodyMode='full' for the complete content or 'none' to drop the body entirely. Use entry.asset to retrieve omitted install/script content.",
    inputSchema: jsonSchemaForTool("entry.detail"),
  },
  {
    name: "entry.asset",
    description:
      "Fetch the category-aware copy/install asset for a HeyClaude entry without writing local files. Pass assetType (e.g. 'install_command', 'config_snippet') to return only that asset and avoid the full_content/script payloads when you do not need them.",
    inputSchema: jsonSchemaForTool("entry.asset"),
  },
  {
    name: "entry.compare",
    description:
      "Compare 2-5 read-only HeyClaude entries by fit, category, platforms, source metadata, and install complexity.",
    inputSchema: jsonSchemaForTool("entry.compare"),
  },
  {
    name: "registry.stats",
    description:
      "Fetch aggregate read-only registry stats, freshness, category counts, and real source-signal coverage.",
    inputSchema: jsonSchemaForTool("registry.stats"),
  },
  {
    name: "install.setup",
    description:
      "Fetch read-only MCP client setup snippets for Codex, Claude Desktop, Cursor, Windsurf, or remote HTTP clients.",
    inputSchema: jsonSchemaForTool("install.setup"),
  },
  {
    name: "install.compatibility",
    description:
      "Fetch platform compatibility metadata for a HeyClaude skill entry.",
    inputSchema: jsonSchemaForTool("install.compatibility"),
  },
  {
    name: "install.guidance",
    description:
      "Fetch read-only install, config, usage, and package guidance for a HeyClaude entry.",
    inputSchema: jsonSchemaForTool("install.guidance"),
  },
  {
    name: "install.adapter",
    description:
      "Fetch generated read-only platform adapter content, currently Cursor rule adapters for skill packages.",
    inputSchema: jsonSchemaForTool("install.adapter"),
  },
  {
    name: "registry.feeds",
    description:
      "List read-only HeyClaude registry feeds, category feeds, platform feeds, and artifact locations.",
    inputSchema: jsonSchemaForTool("registry.feeds"),
  },
  {
    name: "submission.schema",
    description:
      "Fetch read-only HeyClaude submission schemas for PR-first intake by category.",
    inputSchema: jsonSchemaForTool("submission.schema"),
  },
  {
    name: "submission.validate",
    description:
      "Validate a HeyClaude content submission draft locally without creating GitHub issues, pull requests, or publishing content.",
    inputSchema: jsonSchemaForTool("submission.validate"),
  },
  {
    name: "submission.duplicates",
    description:
      "Search generated registry artifacts for likely duplicate entries before a user opens a submission PR.",
    inputSchema: jsonSchemaForTool("submission.duplicates"),
  },
  {
    name: "submission.urls",
    description:
      "Build prefilled HeyClaude submit and review URLs for a validated PR-first submission draft without making write calls.",
    inputSchema: jsonSchemaForTool("submission.urls"),
  },
  {
    name: "submission.guidance",
    description:
      "Fetch category-specific HeyClaude contribution guidance, required fields, and review expectations.",
    inputSchema: jsonSchemaForTool("submission.guidance"),
  },
  {
    name: "submission.prepare",
    description:
      "Build a read-only maintainer-reviewed HeyClaude submission draft with canonical PR text and URLs.",
    inputSchema: jsonSchemaForTool("submission.prepare"),
  },
  {
    name: "submission.examples",
    description:
      "Fetch read-only category examples and templates for faster, more accurate HeyClaude submissions.",
    inputSchema: jsonSchemaForTool("submission.examples"),
  },
  {
    name: "submission.review",
    description:
      "Review a HeyClaude submission draft locally for schema errors, duplicate risk, and maintainer checklist items without writing to GitHub.",
    inputSchema: jsonSchemaForTool("submission.review"),
  },
  {
    name: "submission.policy",
    description:
      "Fetch HeyClaude's read-only submission, artifact, import, and maintainer-review policy for contributors and agents.",
    inputSchema: jsonSchemaForTool("submission.policy"),
  },
  {
    name: "entry.trust",
    description:
      "Explain deterministic trust, source, package, safety, privacy, and review metadata signals for one HeyClaude entry. This is a metadata review only and does not provide malware scanning, automatic safety guarantees, or installation approval.",
    inputSchema: jsonSchemaForTool("entry.trust"),
  },
  {
    name: "entry.safety",
    description:
      "Review 1-5 HeyClaude entries for source, package, safety, and privacy metadata fit before install or recommendation. This is a metadata review only and does not provide malware scanning, automatic safety guarantees, or installation approval.",
    inputSchema: jsonSchemaForTool("entry.safety"),
  },
  {
    name: "entry.coverage",
    description:
      "Compare 2-5 HeyClaude entries side by side by how much trust metadata they disclose (source, package, safety, privacy, and review provenance) and rank them by deterministic signal coverage. This measures disclosed-metadata completeness only; it is not a malware scan, a safety verdict, or installation approval, and a higher score does not mean an entry is safe.",
    inputSchema: jsonSchemaForTool("entry.coverage"),
  },
];

for (const tool of TOOL_DEFINITIONS) {
  tool.outputSchema ||= jsonSchemaForToolOutput(tool.name);
  tool.annotations ||= {
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: false,
  };
}
