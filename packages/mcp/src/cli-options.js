/**
 * MCP CLI options surface.
 *
 * Pure CLI parsing helpers live in `cli-options-lib.js`. This module re-exports
 * that surface so existing `@heyclaude/mcp/cli-options` imports stay unchanged.
 */
export { parseCliArgs, renderHelp } from "./cli-options-lib.js";
