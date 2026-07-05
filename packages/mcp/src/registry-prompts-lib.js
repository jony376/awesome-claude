/**
 * Pure MCP registry prompt helpers.
 *
 * Prompt definitions and prompt message builders live here. Runtime registry
 * handlers stay in `registry.js`.
 *
 * The public surface (`registry.js` / `@heyclaude/mcp/registry`) re-exports
 * everything below so existing imports stay unchanged.
 */

export const PROMPT_DEFINITIONS = [
  {
    name: "asset.find",
    title: "Find the best Claude asset",
    description:
      "Guide a client through searching, comparing, and recommending HeyClaude entries for a use case.",
    arguments: [
      {
        name: "use_case",
        description: "The task, workflow, or problem the user wants to solve.",
        required: true,
      },
      {
        name: "category",
        description: "Optional HeyClaude category to constrain discovery.",
      },
      {
        name: "platform",
        description:
          "Optional client/platform such as Claude, Codex, Cursor, or Windsurf.",
      },
    ],
  },
  {
    name: "submission.prepare",
    title: "Prepare a HeyClaude submission",
    description:
      "Guide a user through drafting a maintainer-reviewed HeyClaude submission without opening a PR automatically.",
    arguments: [
      { name: "category", description: "Submission category.", required: true },
      { name: "name", description: "Submission name or title." },
      {
        name: "source_url",
        description: "Primary source, docs, package, or repo URL.",
      },
    ],
  },
  {
    name: "submission.review",
    title: "Review submission before opening PR",
    description:
      "Check a draft for schema gaps, duplicate risk, source review, and maintainer checklist items.",
    arguments: [
      {
        name: "draft",
        description: "A concise description or JSON-shaped draft fields.",
        required: true,
      },
    ],
  },
  {
    name: "install.asset",
    title: "Install a HeyClaude asset safely",
    description:
      "Guide installation/use of one entry while keeping source and secret-handling checks explicit.",
    arguments: [
      { name: "category", description: "Entry category.", required: true },
      { name: "slug", description: "Entry slug.", required: true },
      { name: "platform", description: "Optional target client/platform." },
    ],
  },
];

function promptArgument(args, name) {
  return String(args?.[name] || "").trim();
}

export function listRegistryPrompts() {
  return {
    prompts: PROMPT_DEFINITIONS,
  };
}

export function getRegistryPrompt(args = {}) {
  const name = String(args.name || "");
  const prompt = PROMPT_DEFINITIONS.find(
    (candidate) => candidate.name === name,
  );
  if (!prompt) {
    return {
      description: "Unknown HeyClaude MCP prompt.",
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `Unknown HeyClaude MCP prompt: ${name}`,
          },
        },
      ],
    };
  }
  const values = args.arguments || {};
  const useCase = promptArgument(values, "use_case");
  const category = promptArgument(values, "category");
  const platform = promptArgument(values, "platform");
  const slug = promptArgument(values, "slug");
  const sourceUrl = promptArgument(values, "source_url");
  const draft = promptArgument(values, "draft");

  const promptTextByName = {
    "asset.find": `Find the best HeyClaude asset for this use case: ${useCase || "(not provided)"}.

Use the read-only HeyClaude MCP tools. Start with registry.search or registry.list${category ? ` in category ${category}` : ""}${platform ? ` for platform ${platform}` : ""}. Compare credible candidates with entry.compare, inspect details with entry.detail, and cite exact category/slug pairs. Do not invent popularity metrics when source stats are absent.`,
    "submission.prepare": `Prepare a HeyClaude submission draft${category ? ` for category ${category}` : ""}${promptArgument(values, "name") ? ` named ${promptArgument(values, "name")}` : ""}${sourceUrl ? ` from ${sourceUrl}` : ""}.

Use submission.schema, submission.examples, submission.prepare, submission.review, and submission.duplicates. Return missing fields and the canonical PR-first submit URL/body. Do not create GitHub issues or publish content.`,
    "submission.review": `Review this HeyClaude submission draft before a PR is opened:

${draft || "(draft not provided)"}

Use submission.review and submission.duplicates where structured fields are available. Treat schema-valid as not publish-valid, call out source-review needs, and keep the result maintainer-reviewed.`,
    "install.asset": `Help install or use the HeyClaude entry ${category || "(category)"}/${slug || "(slug)"}${platform ? ` for ${platform}` : ""}.

Use install.guidance and entry.asset. Include source links, config/install text exactly as returned, and secret-handling cautions where relevant. Do not write local files or claim the install was completed.`,
  };

  return {
    description: prompt.description,
    messages: [
      {
        role: "user",
        content: {
          type: "text",
          text: promptTextByName[name],
        },
      },
    ],
  };
}
