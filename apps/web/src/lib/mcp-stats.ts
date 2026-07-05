/**
 * MCP registry statistics helpers extracted into a pure library module.
 *
 * The deterministic transport/auth classification and distribution layer lives in
 * `@/lib/mcp-stats-lib` and is re-exported below so the public `@/lib/mcp-stats`
 * surface is unchanged for data-report routes and tests.
 */
export {
  authDistribution,
  classifyAuth,
  classifyTransport,
  hostingDistribution,
  hostingOf,
  supplyChainCoverage,
  transportDistribution,
  type McpAuth,
  type McpTransport,
  type StatRow,
} from "@/lib/mcp-stats-lib";
