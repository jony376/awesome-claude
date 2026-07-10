/**
 * AI source detection surface.
 *
 * Pure referrer and crawler matchers live in `ai-sources-lib.ts`. This module
 * re-exports that surface so existing `@/lib/ai-sources` imports stay unchanged
 * for the Analytics Engine tap and client referral tracking.
 */
export type { AiBot, AiBotPurpose } from "@/lib/ai-sources-lib";
export { AI_BOTS, matchAiBot, matchAiReferrer } from "@/lib/ai-sources-lib";
