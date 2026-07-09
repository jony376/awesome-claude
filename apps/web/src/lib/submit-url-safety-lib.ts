// Pure same-origin URL guards for the submit flow, split out of the route so the
// origin allowlisting can be unit-tested. None of these throw, and they collapse
// unsafe or cross-origin input to "" (or, for a nextAction, to `undefined`).
// The siteConfig-backed URLs are default parameters so tests can inject them.

import { siteConfig } from "@/lib/site";

/** The origin of a URL, or "" when it cannot be parsed. */
export function originFor(value: string): string {
  try {
    return new URL(value).origin;
  } catch {
    return "";
  }
}

/**
 * Return `value` only when it resolves (against `baseUrl`) to an http(s) URL
 * whose origin is in `allowedOrigins`; a same-origin, root-relative input is
 * returned as a path. Anything else (missing, cross-origin, non-http, or
 * unparseable) becomes "".
 */
export function safeUrlForOrigins(
  value: string | undefined,
  allowedOrigins: Set<string>,
  baseUrl = siteConfig.url,
): string {
  if (!value) return "";
  try {
    const url = new URL(value, baseUrl);
    if (
      (url.protocol !== "https:" && url.protocol !== "http:") ||
      !allowedOrigins.has(url.origin)
    ) {
      return "";
    }
    if (value.startsWith("/") && url.origin === originFor(baseUrl)) {
      return `${url.pathname}${url.search}${url.hash}`;
    }
    return url.toString();
  } catch {
    return "";
  }
}

/**
 * A submission-gate status URL, accepted only when it lives on the gate's own
 * origin. Anything else — missing, cross-origin, or an unset/unparseable gate
 * URL (which allows no origins at all) — becomes "".
 */
export function safeGateStatusUrl(
  value: string | undefined,
  gateUrl = siteConfig.submissionGateUrl,
): string {
  const gateOrigin = originFor(gateUrl);
  return safeUrlForOrigins(value, new Set(gateOrigin ? [gateOrigin] : []));
}

/** The part of a preflight response whose `nextAction` URL must stay same-origin. */
export type WithNextAction = {
  nextAction?: {
    label: string;
    url?: string;
  };
};

/**
 * Clamp a preflight response's `nextAction.url` to `siteUrl`'s own origin. The
 * payload is returned untouched when it carries no `nextAction.url` (or the
 * site origin is unparseable); otherwise a cross-origin or unsafe URL is
 * dropped to `undefined` and a same-origin one is normalized.
 */
export function sanitizeNextActionUrl<T extends WithNextAction>(
  payload: T,
  siteUrl = siteConfig.url,
): T {
  const siteOrigin = originFor(siteUrl);
  if (!payload.nextAction?.url || !siteOrigin) return payload;
  const safeNextUrl = safeUrlForOrigins(payload.nextAction.url, new Set([siteOrigin]), siteUrl);
  return {
    ...payload,
    nextAction: {
      ...payload.nextAction,
      ...(safeNextUrl ? { url: safeNextUrl } : { url: undefined }),
    },
  };
}
