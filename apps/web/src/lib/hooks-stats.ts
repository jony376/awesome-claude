/**
 * State of Claude Code Hooks report helpers extracted into a pure library module.
 *
 * The deterministic hook distribution and report-model layer lives in
 * `@/lib/hooks-stats-lib` and is re-exported below so the public
 * `@/lib/hooks-stats` surface is unchanged for routes and tests.
 */
export {
  HOOK_EVENTS,
  buildHooksReport,
  complexityDistribution,
  hookEventDistribution,
  hookEventOf,
  prerequisiteDistribution,
  useCaseDistribution,
} from "@/lib/hooks-stats-lib";
