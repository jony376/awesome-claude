/**
 * MCP stdio server surface.
 *
 * SDK server wiring lives in `server-lib.js`. This module re-exports that
 * surface so existing `@heyclaude/mcp/server` imports stay unchanged.
 */
export { createHeyClaudeMcpServer, runStdioServer } from "./server-lib.js";
