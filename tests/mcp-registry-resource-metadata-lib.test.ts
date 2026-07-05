import { describe, expect, it } from "vitest";

import {
  DISCOVERY_RESOURCES,
  RESOURCE_TEMPLATES,
  listRegistryResourceTemplates,
} from "../packages/mcp/src/registry-resource-metadata-lib.js";
import {
  RESOURCE_TEMPLATES as templatesFromWrapper,
  listRegistryResourceTemplates as listTemplatesFromWrapper,
} from "../packages/mcp/src/registry.js";

describe("registry-resource-metadata-lib templates", () => {
  it("lists entry and category resource templates", () => {
    expect(listRegistryResourceTemplates()).toEqual({
      resourceTemplates: RESOURCE_TEMPLATES,
    });
    expect(RESOURCE_TEMPLATES.map((resource) => resource.uriTemplate)).toEqual([
      "heyclaude://entry/{category}/{slug}",
      "heyclaude://category/{category}",
    ]);
  });

  it("lists bounded discovery resources for recent, trending, and jobs feeds", () => {
    expect(DISCOVERY_RESOURCES.map((resource) => resource.uri)).toEqual([
      "heyclaude://registry/recent",
      "heyclaude://registry/trending",
      "heyclaude://jobs/active",
    ]);
  });
});

describe("registry re-export compatibility", () => {
  it("keeps the public registry wrapper wired to the extracted lib", () => {
    expect(templatesFromWrapper).toBe(RESOURCE_TEMPLATES);
    expect(listTemplatesFromWrapper).toBe(listRegistryResourceTemplates);
  });
});
