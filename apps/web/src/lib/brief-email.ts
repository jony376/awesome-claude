/**
 * Weekly brief email rendering helpers extracted into a pure library module.
 *
 * The HTML/text newsletter builder lives in `@/lib/brief-email-lib` and is
 * re-exported below so the public `@/lib/brief-email` surface is unchanged
 * for plugins and tests.
 */
export { buildBriefEmail } from "@/lib/brief-email-lib";
