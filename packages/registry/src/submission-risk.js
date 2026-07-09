/**
 * Public submission risk analysis surface.
 *
 * Pure draft/direct-content risk scoring helpers live in
 * `submission-risk-lib.js`. This module re-exports that surface so existing
 * `@heyclaude/registry/submission-risk`, route, and package-root imports stay
 * unchanged.
 */
export {
  SUBMISSION_RISK_SCHEMA_VERSION,
  SUBMISSION_RISK_COMMENT_MARKER,
  analyzeDirectContentRisk,
  analyzeSubmissionDraftRisk,
  directContentRequestChangesReasons,
  formatSubmissionRiskMarkdown,
} from "./submission-risk-lib.js";
