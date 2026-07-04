/**
 * State of Agent Skills report helpers extracted into a pure library module.
 *
 * The deterministic skill distribution and report-model layer lives in
 * `@/lib/skills-stats-lib` and is re-exported below so the public
 * `@/lib/skills-stats` surface is unchanged for routes and tests.
 */
export { buildSkillsReport } from "@/lib/skills-stats-lib";
