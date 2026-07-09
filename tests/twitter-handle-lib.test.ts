import { describe, expect, it } from "vitest";

import { twitterHandleFrom } from "../apps/web/src/lib/twitter-handle-lib";

describe("twitterHandleFrom", () => {
  it("derives an @handle from the first path segment", () => {
    expect(twitterHandleFrom("https://x.com/jsonbored")).toBe("@jsonbored");
  });

  it("does not double an existing @ in the path", () => {
    expect(twitterHandleFrom("https://x.com/@jsonbored")).toBe("@jsonbored");
  });

  it("ignores trailing slashes and extra path segments", () => {
    expect(twitterHandleFrom("https://twitter.com/jsonbored/status/1")).toBe(
      "@jsonbored",
    );
    expect(twitterHandleFrom("https://x.com/jsonbored/")).toBe("@jsonbored");
  });

  it("returns undefined when the URL has no path segment", () => {
    expect(twitterHandleFrom("https://x.com")).toBeUndefined();
    expect(twitterHandleFrom("https://x.com/")).toBeUndefined();
  });

  it("returns undefined for an unparseable URL", () => {
    expect(twitterHandleFrom("not a url")).toBeUndefined();
    expect(twitterHandleFrom("")).toBeUndefined();
  });
});
