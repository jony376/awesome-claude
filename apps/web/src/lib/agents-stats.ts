/**
 * State of AI Agents report helpers extracted into a pure library module.
 *
 * The deterministic agent distribution and report-model layer lives in
 * `@/lib/agents-stats-lib` and is re-exported below so the public
 * `@/lib/agents-stats` surface is unchanged for routes and tests.
 */
export { buildAgentsReport } from "@/lib/agents-stats-lib";
