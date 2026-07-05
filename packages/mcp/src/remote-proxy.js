/**
 * MCP remote proxy surface.
 *
 * Streamable HTTP proxy helpers live in `remote-proxy-lib.js`. This module
 * re-exports that surface so existing `@heyclaude/mcp/remote-proxy` imports stay
 * unchanged.
 */
export {
  createRemoteMcpProxyServer,
  createRemoteMcpProxyServerFromClient,
  createTimeoutFetch,
  runRemoteStdioProxy,
} from "./remote-proxy-lib.js";
