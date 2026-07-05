import { describe, expect, it, vi } from "vitest";

import {
  createHeyClaudeMcpServer,
  runStdioServer,
} from "../packages/mcp/src/server-lib.js";
import {
  createHeyClaudeMcpServer as createServerFromWrapper,
  runStdioServer as runStdioServerFromWrapper,
} from "../packages/mcp/src/server.js";
import { packageVersion } from "../packages/mcp/src/package-metadata.js";

const { Server } =
  await import("../packages/mcp/node_modules/@modelcontextprotocol/sdk/dist/esm/server/index.js");

describe("server-lib MCP server wiring", () => {
  it("creates a registry MCP server with the package version metadata", () => {
    const server = createHeyClaudeMcpServer({});
    expect(server).toBeInstanceOf(Server);
    expect(server.server?.name || server._serverInfo?.name).toBe(
      "heyclaude-registry",
    );
    expect(server.server?.version || server._serverInfo?.version).toBe(
      packageVersion,
    );
  });

  it("reuses an injected artifact cache across handler calls", () => {
    const artifactCache = new Map();
    const server = createHeyClaudeMcpServer({ artifactCache });
    expect(server).toBeInstanceOf(Server);
    expect(artifactCache.size).toBe(0);
  });

  it("connects the registry server to a stdio transport", async () => {
    const connect = vi
      .spyOn(Server.prototype, "connect")
      .mockResolvedValue(undefined);

    await runStdioServer({});

    expect(connect).toHaveBeenCalledWith(expect.any(Object));
    connect.mockRestore();
  });
});

describe("server re-export compatibility", () => {
  it("keeps the public wrapper wired to the extracted lib", () => {
    expect(createServerFromWrapper).toBe(createHeyClaudeMcpServer);
    expect(runStdioServerFromWrapper).toBe(runStdioServer);
  });
});
