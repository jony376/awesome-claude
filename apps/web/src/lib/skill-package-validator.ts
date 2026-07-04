/**
 * Agent Skill package validation helpers extracted into a pure library module.
 *
 * The deterministic package parsing and submission-draft layer lives in
 * `@/lib/skill-package-validator-lib` and is re-exported below so the public
 * `@/lib/skill-package-validator` surface is unchanged for routes and tests.
 */
export {
  validateSkillPackageFiles,
  type SkillPackageFile,
  type SkillPackageValidation,
} from "@/lib/skill-package-validator-lib";
