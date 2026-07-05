/**
 * MCP platform helpers surface.
 *
 * Pure platform slug and compatibility helpers live in `platforms-lib.js`.
 * This module re-exports that surface so existing `@heyclaude/mcp/platforms`
 * imports stay unchanged.
 */
export {
  SITE_URL,
  buildSkillPlatformCompatibility,
  platformFeedSlug,
} from "./platforms-lib.js";
