import { afterEach, describe, expect, it, vi } from "vitest";

import { createTimeoutFetch } from "../packages/mcp/src/remote-proxy-lib.js";
import { createTimeoutFetch as createTimeoutFetchFromWrapper } from "../packages/mcp/src/remote-proxy.js";

describe("remote-proxy-lib timeout fetch", () => {
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it("wraps fetch with redirect error and abort propagation", async () => {
    const removeEventListener = vi.fn();
    const callerSignal = {
      aborted: false,
      addEventListener: vi.fn(),
      removeEventListener,
    } as unknown as AbortSignal;
    const fetchMock = vi.fn(async (_url: URL | string, init?: RequestInit) => {
      expect(init?.redirect).toBe("error");
      expect(init?.signal).toBeInstanceOf(AbortSignal);
      return new Response("ok", { status: 200 });
    }) as typeof fetch;
    globalThis.fetch = fetchMock;

    await expect(
      createTimeoutFetch(50)("https://example.com/mcp", {
        signal: callerSignal,
      }),
    ).resolves.toMatchObject({ status: 200 });
    expect(removeEventListener).toHaveBeenCalled();
  });

  it("aborts immediately when the caller signal is already aborted", async () => {
    const fetchMock = vi.fn(async (_url: URL | string, init?: RequestInit) => {
      expect(init?.signal).toMatchObject({ aborted: true });
      return new Response("ok", { status: 200 });
    }) as typeof fetch;
    globalThis.fetch = fetchMock;

    const abortedSignal = {
      aborted: true,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    } as unknown as AbortSignal;
    await createTimeoutFetch(50)("https://example.com/mcp", {
      signal: abortedSignal,
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});

describe("remote-proxy re-export compatibility", () => {
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it("keeps the public wrapper wired to the extracted lib", async () => {
    const fetchMock = vi.fn(async () => new Response("ok", { status: 200 }));
    globalThis.fetch = fetchMock as typeof fetch;

    await createTimeoutFetchFromWrapper(50)("https://example.com/mcp");
    await createTimeoutFetch(50)("https://example.com/mcp");

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls[0]?.[1]?.redirect).toBe("error");
    expect(fetchMock.mock.calls[1]?.[1]?.redirect).toBe("error");
  });
});
