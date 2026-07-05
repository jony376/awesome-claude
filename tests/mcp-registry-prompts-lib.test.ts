import { describe, expect, it } from "vitest";

import {
  PROMPT_DEFINITIONS,
  getRegistryPrompt,
  listRegistryPrompts,
} from "../packages/mcp/src/registry-prompts-lib.js";
import {
  PROMPT_DEFINITIONS as promptsFromWrapper,
  getRegistryPrompt as getPromptFromWrapper,
  listRegistryPrompts as listPromptsFromWrapper,
} from "../packages/mcp/src/registry.js";

describe("registry-prompts-lib definitions", () => {
  it("lists the read-only workflow prompts exposed by MCP", () => {
    expect(listRegistryPrompts()).toEqual({ prompts: PROMPT_DEFINITIONS });
    expect(PROMPT_DEFINITIONS.map((prompt) => prompt.name)).toEqual([
      "asset.find",
      "submission.prepare",
      "submission.review",
      "install.asset",
    ]);
  });

  it("requires asset.find use_case arguments in generated prompt text", () => {
    const prompt = getRegistryPrompt({
      name: "asset.find",
      arguments: {
        use_case: "browser automation",
        category: "mcp",
        platform: "Cursor",
      },
    });
    expect(prompt.messages[0]?.content).toMatchObject({
      type: "text",
      text: expect.stringContaining("browser automation"),
    });
    expect(String(prompt.messages[0]?.content?.text)).toContain("category mcp");
    expect(String(prompt.messages[0]?.content?.text)).toContain(
      "for platform Cursor",
    );
  });

  it("returns an unknown-prompt fallback without throwing", () => {
    const prompt = getRegistryPrompt({ name: "missing.prompt" });
    expect(String(prompt.messages[0]?.content?.text)).toContain(
      "Unknown HeyClaude MCP prompt: missing.prompt",
    );
  });
});

describe("registry re-export compatibility", () => {
  it("keeps the public registry wrapper wired to the extracted lib", () => {
    expect(listPromptsFromWrapper()).toEqual(listRegistryPrompts());
    expect(promptsFromWrapper).toBe(PROMPT_DEFINITIONS);
    expect(
      getPromptFromWrapper({
        name: "install.asset",
        arguments: { category: "skills", slug: "browser-bridge" },
      }),
    ).toEqual(
      getRegistryPrompt({
        name: "install.asset",
        arguments: { category: "skills", slug: "browser-bridge" },
      }),
    );
  });
});
