// Pure derivation of an @handle from a profile URL, split out of __root.tsx so
// the parsing and failure cases can be unit-tested without the route.

/**
 * The `@handle` for a Twitter/X profile URL: the first non-empty path segment,
 * prefixed with a single `@` (an existing leading `@` is not doubled). Returns
 * `undefined` when the URL is unparseable or carries no path segment.
 */
export function twitterHandleFrom(profileUrl: string): string | undefined {
  try {
    const handle = new URL(profileUrl).pathname.split("/").filter(Boolean)[0];
    return handle ? `@${handle.replace(/^@/, "")}` : undefined;
  } catch {
    return undefined;
  }
}
