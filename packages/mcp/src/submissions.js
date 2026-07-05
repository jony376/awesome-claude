/**
 * MCP submission draft helpers surface.
 *
 * Pure submission parsing, validation, and duplicate-search helpers live in
 * `submissions-lib.js`. This module re-exports that surface so existing
 * `./submissions.js` imports stay unchanged.
 */
export {
  SUBMISSION_SITE_URL,
  buildPrDraftFromSpec,
  buildSubmissionUrlsFromSpec,
  getCategorySubmissionGuidanceFromSpec,
  getSubmissionExamplesFromSpec,
  getSubmissionSchemaFromSpec,
  normalizeSubmissionFields,
  prepareSubmissionDraftFromSpec,
  reviewSubmissionDraftFromSpec,
  searchDuplicateEntries,
  slugify,
  validateSubmissionDraftFromSpec,
} from "./submissions-lib.js";
