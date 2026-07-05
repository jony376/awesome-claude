/**
 * Pure MCP registry resource metadata helpers.
 *
 * Static MCP resource template and discovery resource descriptors live here.
 * Runtime registry handlers stay in `registry.js`.
 */
const jsonMimeType = "application/json";

export const RESOURCE_TEMPLATES = [
  {
    uriTemplate: "heyclaude://entry/{category}/{slug}",
    name: "HeyClaude entry detail",
    title: "HeyClaude entry detail",
    description:
      "Read a single generated HeyClaude entry detail artifact as JSON.",
    mimeType: jsonMimeType,
  },
  {
    uriTemplate: "heyclaude://category/{category}",
    name: "HeyClaude category entries",
    title: "HeyClaude category entries",
    description:
      "Read generated summary entries for one HeyClaude category as JSON.",
    mimeType: jsonMimeType,
  },
];

/**
 * Static MCP resource descriptors for the bounded discovery surfaces
 * exposed alongside the directory and category feeds. Appended to
 * {@link listRegistryResources} output and routed by
 * {@link readRegistryResource}.
 *
 * @type {Array<{ uri: string, name: string, title: string, description: string, mimeType: string }>}
 */
export const DISCOVERY_RESOURCES = [
  {
    uri: "heyclaude://registry/recent",
    name: "HeyClaude recent registry updates",
    title: "HeyClaude recent registry updates",
    description:
      "Bounded list of recently added or upstream-updated HeyClaude entries from the generated search index.",
    mimeType: jsonMimeType,
  },
  {
    uri: "heyclaude://registry/trending",
    name: "HeyClaude trending registry entries",
    title: "HeyClaude trending registry entries",
    description:
      "Bounded list of trending HeyClaude entries from the public /api/registry/trending endpoint; degrades gracefully when dynamic state is unavailable.",
    mimeType: jsonMimeType,
  },
  {
    uri: "heyclaude://jobs/active",
    name: "HeyClaude active jobs",
    title: "HeyClaude active jobs",
    description:
      "Bounded list of active public job listings from the public /api/jobs endpoint; degrades gracefully when dynamic state is unavailable.",
    mimeType: jsonMimeType,
  },
];

export function listRegistryResourceTemplates() {
  return {
    resourceTemplates: RESOURCE_TEMPLATES,
  };
}
