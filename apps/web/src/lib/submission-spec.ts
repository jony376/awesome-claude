/**
 * Website submission spec helpers extracted into a pure library module.
 *
 * The category field matrix, preflight checks, and packet builder live in
 * `@/lib/submission-spec-lib` and are re-exported below so the public
 * `@/lib/submission-spec` surface is unchanged for routes and tests.
 */
export {
  SUBMISSION_SPEC,
  buildSubmissionPacket,
  preflight,
  slugify,
  type CategorySpec,
  type FieldKind,
  type PreflightIssue,
  type SpecField,
} from "@/lib/submission-spec-lib";
