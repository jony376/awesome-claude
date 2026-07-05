/**
 * Pure MCP registry response envelope helpers.
 *
 * Shared success/error payload shapes and policy attachment live here.
 * Runtime registry handlers stay in `registry.js`.
 */
import { MCP_PUBLIC_POLICY } from "./registry-tools-lib.js";

export function notes(values) {
  return Array.isArray(values)
    ? values.map((value) => String(value || "").trim()).filter(Boolean)
    : [];
}

export function withPublicPolicy(result) {
  if (!result || typeof result !== "object" || Array.isArray(result)) {
    return result;
  }
  if (result.policy) return result;
  return { ...result, policy: MCP_PUBLIC_POLICY };
}

export function notFound(message) {
  return { ok: false, error: { code: "not_found", message } };
}

export function invalid(message) {
  return { ok: false, error: { code: "invalid_request", message } };
}

export function invalidWithDetails(message, details) {
  return { ok: false, error: { code: "invalid_request", message, details } };
}

/**
 * Build the standard "unavailable" error envelope used when a dynamic
 * resource cannot be loaded. Distinct from `notFound` / `invalid` so MCP
 * clients can tell apart "endpoint failed" from "no such resource" and
 * keep the surface read-only.
 *
 * @param {string} message Human-readable explanation.
 * @param {string} [details] Optional underlying error message.
 * @returns {{ ok: false, error: { code: "unavailable", message: string, details?: string } }}
 */
export function unavailable(message, details) {
  return {
    ok: false,
    error: {
      code: "unavailable",
      message,
      ...(details ? { details } : {}),
    },
  };
}
