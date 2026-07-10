import { describe, expect, it } from "vitest";

import { AI_BOTS, matchAiBot, matchAiReferrer } from "@/lib/ai-sources-lib";
import {
  AI_BOTS as AI_BOTS_FROM_WRAPPER,
  matchAiBot as matchAiBotFromWrapper,
  matchAiReferrer as matchAiReferrerFromWrapper,
} from "@/lib/ai-sources";

describe("matchAiReferrer", () => {
  it("maps assistant hostnames (incl. subdomains) to a stable source key", () => {
    expect(matchAiReferrer("https://chatgpt.com/")).toBe("chatgpt");
    expect(matchAiReferrer("https://chat.openai.com/c/abc")).toBe("chatgpt");
    expect(matchAiReferrer("https://www.perplexity.ai/search")).toBe(
      "perplexity",
    );
    expect(matchAiReferrer("https://gemini.google.com/app")).toBe("gemini");
    expect(matchAiReferrer("claude.ai")).toBe("claude");
    expect(matchAiReferrer("https://copilot.microsoft.com/chat")).toBe(
      "copilot",
    );
    expect(matchAiReferrer("https://x.ai/grok")).toBe("grok");
  });

  it("returns null for non-AI / organic / empty referrers", () => {
    expect(matchAiReferrer("https://www.google.com/search?q=x")).toBeNull();
    expect(matchAiReferrer("https://news.ycombinator.com/")).toBeNull();
    expect(matchAiReferrer("")).toBeNull();
    expect(matchAiReferrer(null)).toBeNull();
    expect(matchAiReferrer(undefined)).toBeNull();
    expect(matchAiReferrer("not a url")).toBeNull();
  });

  it("does not match look-alike hostnames", () => {
    // a phishing-style host that merely contains the brand must not match.
    expect(matchAiReferrer("https://chatgpt.com.evil.example/")).toBeNull();
    expect(matchAiReferrer("https://notperplexity.ai/")).toBeNull();
  });

  it("accepts bare hostnames with ports stripped by URL parsing", () => {
    expect(matchAiReferrer("https://claude.ai:443/chat")).toBe("claude");
  });
});

describe("matchAiBot", () => {
  it("classifies search/user/training bots by their UA token", () => {
    expect(
      matchAiBot(
        "Mozilla/5.0 ... OAI-SearchBot/1.3; +https://openai.com/searchbot",
      ),
    ).toMatchObject({ operator: "openai", purpose: "search" });
    expect(
      matchAiBot(
        "Mozilla/5.0 (compatible; ClaudeBot/1.0; +claudebot@anthropic.com)",
      ),
    ).toMatchObject({ operator: "anthropic", purpose: "train" });
    expect(
      matchAiBot(
        "Mozilla/5.0 ... PerplexityBot/1.0; +https://perplexity.ai/perplexitybot",
      ),
    ).toMatchObject({ operator: "perplexity", purpose: "search" });
    expect(
      matchAiBot("Mozilla/5.0 ... DuckAssistBot/1.0; +https://duckduckgo.com"),
    ).toMatchObject({ operator: "duckduckgo", purpose: "search" });
  });

  it("prefers the most specific token (ChatGPT-User over the generic GPTBot)", () => {
    expect(
      matchAiBot("Mozilla/5.0 ... ChatGPT-User/1.0; +https://openai.com/bot"),
    ).toMatchObject({
      operator: "openai",
      purpose: "user",
    });
    expect(
      matchAiBot(
        "Mozilla/5.0 ... Claude-User/1.0; +https://anthropic.com/claudebot",
      ),
    ).toMatchObject({ operator: "anthropic", purpose: "user" });
  });

  it("returns null for a normal browser UA", () => {
    expect(
      matchAiBot(
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36",
      ),
    ).toBeNull();
    expect(matchAiBot(null)).toBeNull();
    expect(matchAiBot(undefined)).toBeNull();
    expect(matchAiBot("")).toBeNull();
  });

  it("keeps bot tokens unique so substring matching can't misclassify", () => {
    const tokens = AI_BOTS.map((b) => b.token);
    expect(new Set(tokens).size).toBe(tokens.length);
  });

  it("orders high-signal search/user bots before training crawlers per operator", () => {
    const openAi = AI_BOTS.filter((bot) => bot.operator === "openai");
    expect(openAi.map((bot) => bot.purpose)).toEqual([
      "search",
      "user",
      "train",
    ]);
  });
});

describe("ai-sources public wrapper re-exports", () => {
  it("keeps the public wrapper re-export aligned with the lib module", () => {
    expect(AI_BOTS_FROM_WRAPPER).toEqual(AI_BOTS);
    expect(matchAiReferrerFromWrapper("https://chatgpt.com/")).toBe(
      matchAiReferrer("https://chatgpt.com/"),
    );
    expect(
      matchAiBotFromWrapper(
        "Mozilla/5.0 ... OAI-SearchBot/1.3; +https://openai.com/searchbot",
      ),
    ).toEqual(
      matchAiBot(
        "Mozilla/5.0 ... OAI-SearchBot/1.3; +https://openai.com/searchbot",
      ),
    );
  });
});
