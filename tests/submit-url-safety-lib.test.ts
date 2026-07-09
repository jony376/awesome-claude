import { describe, expect, it } from "vitest";

import {
  originFor,
  safeGateStatusUrl,
  safeUrlForOrigins,
  sanitizeNextActionUrl,
} from "../apps/web/src/lib/submit-url-safety-lib";

const BASE = "https://base.example";
const GATE = "https://gate.example";

describe("originFor", () => {
  it("returns the origin of a valid URL", () => {
    expect(originFor("https://a.example/x?y=1")).toBe("https://a.example");
  });

  it("returns '' for an unparseable URL", () => {
    expect(originFor("not a url")).toBe("");
  });
});

describe("safeUrlForOrigins", () => {
  it("returns '' for a missing value", () => {
    expect(safeUrlForOrigins(undefined, new Set([BASE]), BASE)).toBe("");
  });

  it("returns an allowed absolute https URL unchanged", () => {
    expect(
      safeUrlForOrigins(
        "https://ok.example/p?q=1",
        new Set(["https://ok.example"]),
        BASE,
      ),
    ).toBe("https://ok.example/p?q=1");
  });

  it("rejects a cross-origin URL", () => {
    expect(
      safeUrlForOrigins(
        "https://evil.example/p",
        new Set(["https://ok.example"]),
        BASE,
      ),
    ).toBe("");
  });

  it("rejects a non-http(s) protocol even on an allowed origin", () => {
    expect(
      safeUrlForOrigins(
        "ftp://ok.example/p",
        new Set(["ftp://ok.example"]),
        BASE,
      ),
    ).toBe("");
  });

  it("returns a same-origin root-relative input as a path", () => {
    expect(safeUrlForOrigins("/dash?x=1#h", new Set([BASE]), BASE)).toBe(
      "/dash?x=1#h",
    );
  });

  it("returns '' when the URL cannot be parsed (invalid base)", () => {
    expect(safeUrlForOrigins("x", new Set([BASE]), "")).toBe("");
  });
});

describe("safeGateStatusUrl", () => {
  it("accepts a status URL on the gate's own origin", () => {
    expect(safeGateStatusUrl(`${GATE}/status/abc`, GATE)).toBe(
      `${GATE}/status/abc`,
    );
  });

  it("rejects a status URL on any other origin", () => {
    expect(safeGateStatusUrl("https://evil.example/status/abc", GATE)).toBe("");
  });

  it("rejects everything when the gate URL is unset", () => {
    expect(safeGateStatusUrl(`${GATE}/status/abc`, "")).toBe("");
  });

  it("returns '' for a missing status URL", () => {
    expect(safeGateStatusUrl(undefined, GATE)).toBe("");
  });
});

describe("sanitizeNextActionUrl", () => {
  it("returns the payload untouched when there is no nextAction", () => {
    const payload = { ok: true as const };
    expect(sanitizeNextActionUrl(payload, BASE)).toBe(payload);
  });

  it("returns the payload untouched when nextAction has no url", () => {
    const payload = { nextAction: { label: "Open" } };
    expect(sanitizeNextActionUrl(payload, BASE)).toBe(payload);
  });

  it("keeps a same-origin nextAction url, normalized", () => {
    const result = sanitizeNextActionUrl(
      { nextAction: { label: "Open", url: "/pr/1" } },
      BASE,
    );
    expect(result.nextAction).toEqual({ label: "Open", url: "/pr/1" });
  });

  it("drops a cross-origin nextAction url to undefined", () => {
    const result = sanitizeNextActionUrl(
      { nextAction: { label: "Open", url: "https://evil.example/x" } },
      BASE,
    );
    expect(result.nextAction).toEqual({ label: "Open", url: undefined });
  });

  it("preserves the rest of the payload", () => {
    const result = sanitizeNextActionUrl(
      {
        valid: true,
        nextAction: { label: "Open", url: "https://evil.example/x" },
      },
      BASE,
    );
    expect(result.valid).toBe(true);
  });

  it("returns the payload untouched when the site origin is unparseable", () => {
    const payload = {
      nextAction: { label: "Open", url: "https://evil.example/x" },
    };
    expect(sanitizeNextActionUrl(payload, "")).toBe(payload);
  });
});
