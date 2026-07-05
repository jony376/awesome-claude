/**
 * MCP endpoint URL surface.
 *
 * Pure endpoint normalization helpers live in `endpoint-url-lib.js`. This
 * module re-exports that surface so existing imports stay unchanged.
 */
export {
  DEFAULT_REMOTE_MCP_URL,
  DEFAULT_REQUEST_TIMEOUT_MS,
  normalizeEndpointUrl,
  normalizeTimeoutMs,
} from "./endpoint-url-lib.js";
