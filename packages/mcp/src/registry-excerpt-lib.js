/**
 * Pure MCP registry entry body excerpt helpers.
 *
 * Token-efficient body projection, excerpt trimming, and asset-field omission
 * live here. Runtime registry handlers stay in `registry.js`.
 */
export const ENTRY_BODY_EXCERPT_CHARS = 1200;

// Large copyable-content fields that largely duplicate the body or the install
// asset. In non-full modes they are omitted (and surfaced via omittedFields)
// because the caller should pull them from entry.asset when needed,
// rather than paying for tens of kilobytes on every detail lookup.
export const ENTRY_ASSET_FIELDS = [
  "scriptBody",
  "fullCopyableContent",
  "copySnippet",
];

export function excerptText(text, limit) {
  if (text.length <= limit) {
    return text;
  }
  const slice = text.slice(0, limit);
  // Back off to the last paragraph/sentence/word boundary so the excerpt does
  // not end mid-word; fall back to the hard cut if no decent boundary exists.
  const boundary = Math.max(
    slice.lastIndexOf("\n\n"),
    slice.lastIndexOf("\n"),
    slice.lastIndexOf(". "),
    slice.lastIndexOf(" "),
  );
  const cut = boundary > limit * 0.6 ? slice.slice(0, boundary) : slice;
  return `${cut.trimEnd()}…`;
}

export function withAssetHint(bodyMeta) {
  if (bodyMeta.omittedFields.length > 0) {
    bodyMeta.assetHint =
      "Large copyable fields were omitted to save context; call entry.asset for the full script or snippet.";
  }
  return bodyMeta;
}

// Projects an entry's heavy content to the requested verbosity so the default
// entry.detail response stays token-efficient. Returns the (possibly
// trimmed) entry plus body metadata describing exactly what was returned.
export function projectEntryBody(entry, requestedMode) {
  const mode =
    requestedMode === "none" || requestedMode === "full"
      ? requestedMode
      : "excerpt";
  const body = typeof entry.body === "string" ? entry.body : "";
  const bodyChars = body.length;

  if (mode === "full") {
    return {
      entry,
      bodyMeta: {
        bodyMode: "full",
        bodyChars,
        bodyTruncated: false,
        omittedFields: [],
      },
    };
  }

  // Lean modes: drop large copyable asset fields, keep small useful ones.
  const projected = { ...entry };
  const omittedFields = [];
  for (const field of ENTRY_ASSET_FIELDS) {
    const value = projected[field];
    const size = typeof value === "string" ? value.length : 0;
    if (size > ENTRY_BODY_EXCERPT_CHARS) {
      delete projected[field];
      omittedFields.push({ field, chars: size });
    }
  }

  if (mode === "none") {
    delete projected.body;
    return {
      entry: projected,
      bodyMeta: withAssetHint({
        bodyMode: "none",
        bodyChars,
        bodyTruncated: bodyChars > 0,
        omittedFields,
      }),
    };
  }

  if (bodyChars > ENTRY_BODY_EXCERPT_CHARS) {
    projected.body = excerptText(body, ENTRY_BODY_EXCERPT_CHARS);
    return {
      entry: projected,
      bodyMeta: withAssetHint({
        bodyMode: "excerpt",
        bodyChars,
        bodyTruncated: true,
        omittedFields,
      }),
    };
  }

  return {
    entry: projected,
    bodyMeta: withAssetHint({
      bodyMode: "excerpt",
      bodyChars,
      bodyTruncated: false,
      omittedFields,
    }),
  };
}
