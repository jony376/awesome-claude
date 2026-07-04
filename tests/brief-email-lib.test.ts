import { describe, expect, it } from "vitest";

import { buildBriefEmail } from "@/lib/brief-email-lib";

const SITE_URL = "https://heyclau.de";

function briefItem(
  overrides: {
    title?: string;
    url?: string;
    description?: string;
    category?: string;
    dateAdded?: string;
    sourceUrls?: string[];
    safetyNotesCount?: number;
    privacyNotesCount?: number;
    packageVerified?: boolean;
  } = {},
) {
  return {
    title: "Example Entry",
    url: "/entry/mcp/example",
    category: "mcp",
    description: "A useful MCP server with source-backed setup notes.",
    ...overrides,
  };
}

describe("brief-email-lib buildBriefEmail", () => {
  it("builds review and audience weekly brief emails from persisted payloads", () => {
    const brief = {
      summary: { newEntryCount: 2, sourceBackedCount: 1, saferInstallCount: 1 },
      sections: {
        newEntries: [
          briefItem({
            title: "Escaped <MCP>",
            url: "/entry/mcp/escaped",
            sourceUrls: ["https://example.com/source"],
            packageVerified: true,
            dateAdded: "2026-01-08",
          }),
        ],
        saferInstalls: [],
      },
    };

    const review = buildBriefEmail({
      brief,
      siteUrl: SITE_URL,
      dateLabel: "2026-01-09",
      approveUrl: "https://gate.example/approve",
    });
    expect(review.subject).toBe("[Review] Weekly Brief — Jan 9");
    expect(review.html).toContain("Escaped &lt;MCP&gt;");
    expect(review.html).toContain("Approve &amp; schedule send");
    expect(review.text).toContain("https://heyclau.de/entry/mcp/escaped");

    const audience = buildBriefEmail({
      brief: { sections: {} },
      siteUrl: SITE_URL,
      dateLabel: "not-a-date",
    });
    expect(audience.subject).toBe("HeyClaude Weekly Brief — not-a-date");
    expect(audience.html).toContain("No notable activity this week.");
  });

  it("renders theme, editor note, and featured versus overflow density", () => {
    const full = buildBriefEmail({
      brief: {
        summary: {
          newEntryCount: 6,
          sourceBackedCount: 0,
          saferInstallCount: 0,
        },
        theme: "6 new this week, led by 6 rules.",
        note: "Glad to be back —\nreply and tell me what to cover.",
        sections: {
          newEntries: Array.from({ length: 6 }, (_, index) =>
            briefItem({
              title: `Entry ${index}`,
              url: `/entry/rules/e${index}`,
              category: "rules",
              description: "desc",
            }),
          ),
        },
      },
      siteUrl: SITE_URL,
      dateLabel: "2026-06-19",
    });

    expect(full.subject).toBe("HeyClaude Weekly Brief — Jun 19");
    expect(full.html).toContain("6 new this week, led by 6 rules.");
    expect(full.html).toContain("From the editor");
    expect(full.html).toContain("reply and tell me what to cover.");
    expect(full.text).toContain("From the editor:");
    expect((full.html.match(/padding:14px 16px/g) ?? []).length).toBe(4);
    expect(
      (full.html.match(/border-bottom:1px solid #f0ede4/g) ?? []).length,
    ).toBe(2);
  });

  it("labels unknown categories safely without prototype pollution", () => {
    const email = buildBriefEmail({
      brief: {
        sections: {
          newEntries: [
            briefItem({
              title: "Prototype category label",
              url: "/entry/tools/prototype",
              category: "constructor",
              description: "Should render a human label, not Object.prototype.",
            }),
          ],
        },
      },
      siteUrl: SITE_URL,
      dateLabel: "2026-06-19",
    });

    expect(email.text).toContain("[Constructor]");
    expect(email.text).not.toContain("[Function:");
  });

  it("renders all brief sections with their intros", () => {
    const email = buildBriefEmail({
      brief: {
        sections: {
          newEntries: [briefItem({ title: "Fresh Entry" })],
          sourceBacked: [
            briefItem({
              title: "Documented Entry",
              category: "skills",
              url: "/entry/skills/documented",
            }),
          ],
          saferInstalls: [
            briefItem({
              title: "Installable Entry",
              category: "commands",
              url: "/entry/commands/installable",
            }),
          ],
        },
      },
      siteUrl: SITE_URL,
      dateLabel: "2026-03-01",
    });

    expect(email.html).toContain("New this week");
    expect(email.html).toContain("Fresh additions to the registry.");
    expect(email.html).toContain("Source-backed picks");
    expect(email.html).toContain("Safer installs");
    expect(email.text).toContain("NEW THIS WEEK");
    expect(email.text).toContain("SOURCE-BACKED PICKS");
    expect(email.text).toContain("SAFER INSTALLS");
  });

  it("maps known category slugs to human labels in HTML and text", () => {
    const categories = [
      ["mcp", "MCP server"],
      ["agents", "Agent"],
      ["skills", "Skill"],
      ["guides", "Guide"],
    ] as const;

    for (const [category, label] of categories) {
      const email = buildBriefEmail({
        brief: {
          sections: {
            newEntries: [
              briefItem({
                title: `${category} pick`,
                category,
                url: `/entry/${category}/pick`,
              }),
            ],
          },
        },
        siteUrl: SITE_URL,
        dateLabel: "2026-03-01",
      });

      expect(email.html).toContain(label);
      expect(email.text).toContain(`[${label}]`);
    }
  });

  it("includes trust badges and added-date metadata on featured cards", () => {
    const email = buildBriefEmail({
      brief: {
        sections: {
          newEntries: [
            briefItem({
              title: "Trusted Entry",
              sourceUrls: ["https://docs.example.com"],
              packageVerified: true,
              safetyNotesCount: 2,
              dateAdded: "2026-02-14",
            }),
          ],
        },
      },
      siteUrl: SITE_URL,
      dateLabel: "2026-02-15",
    });

    expect(email.html).toContain("source-backed");
    expect(email.html).toContain("verified package");
    expect(email.html).toContain("safety notes");
    expect(email.html).toContain("added Feb 14");
  });

  it("resolves relative item URLs against the site URL and preserves absolute links", () => {
    const email = buildBriefEmail({
      brief: {
        sections: {
          newEntries: [
            briefItem({
              title: "Relative Link",
              url: "/entry/hooks/relative",
            }),
            briefItem({
              title: "Absolute Link",
              url: "https://external.example/entry",
            }),
          ],
        },
      },
      siteUrl: SITE_URL,
      dateLabel: "2026-03-01",
    });

    expect(email.text).toContain("https://heyclau.de/entry/hooks/relative");
    expect(email.text).toContain("https://external.example/entry");
  });

  it("omits theme and editor note blocks when payload fields are blank", () => {
    const email = buildBriefEmail({
      brief: {
        theme: "   ",
        note: "",
        sections: {
          newEntries: [briefItem({ title: "Only Entry" })],
        },
      },
      siteUrl: SITE_URL,
      dateLabel: "2026-03-01",
    });

    expect(email.html).not.toContain("From the editor");
    expect(email.text).not.toContain("From the editor:");
    expect(email.html).not.toContain("margin:0 0 22px;");
  });

  it("includes the approve CTA only in review mode", () => {
    const review = buildBriefEmail({
      brief: { sections: { newEntries: [briefItem()] } },
      siteUrl: SITE_URL,
      dateLabel: "2026-03-01",
      approveUrl: "https://gate.example/approve",
    });
    const audience = buildBriefEmail({
      brief: { sections: { newEntries: [briefItem()] } },
      siteUrl: SITE_URL,
      dateLabel: "2026-03-01",
    });

    expect(review.html).toContain("Draft for review");
    expect(review.text).toContain(
      "Approve & schedule: https://gate.example/approve",
    );
    expect(audience.html).not.toContain("Draft for review");
    expect(audience.text).not.toContain("Approve & schedule:");
  });

  it("filters untitled rows and truncates long descriptions in output", () => {
    const longDescription =
      "This description is intentionally long enough that the weekly brief renderer should truncate it before embedding the text inside the HTML card preview for email clients.";

    const email = buildBriefEmail({
      brief: {
        sections: {
          newEntries: [
            briefItem({
              title: "",
              description: "hidden",
            }),
            briefItem({
              title: "Long Description Entry",
              description: longDescription,
            }),
          ],
        },
      },
      siteUrl: SITE_URL,
      dateLabel: "2026-03-01",
    });

    expect(email.html).not.toContain("hidden");
    expect(email.html).toContain("Long Description Entry");
    expect(email.html).toContain("…");
    expect(email.text).toContain("Long Description Entry");
  });

  it("renders the summary line with zero-safe counts", () => {
    const email = buildBriefEmail({
      brief: {
        summary: {},
        sections: {},
      },
      siteUrl: SITE_URL,
      dateLabel: "2026-03-01",
    });

    expect(email.html).toContain(
      "0 new this week · 0 source-backed · 0 safer installs",
    );
    expect(email.text).toContain(
      "0 new this week · 0 source-backed · 0 safer installs",
    );
  });

  it("escapes HTML metacharacters in titles, notes, and approve URLs", () => {
    const email = buildBriefEmail({
      brief: {
        note: 'Use "caution" & review <scripts>.',
        sections: {
          newEntries: [
            briefItem({
              title: 'Title "with" <tags>',
              description: 'Desc & "quotes"',
            }),
          ],
        },
      },
      siteUrl: SITE_URL,
      dateLabel: "2026-03-01",
      approveUrl: 'https://gate.example/approve?x="1"&y=<2>',
    });

    expect(email.html).toContain("Title &quot;with&quot; &lt;tags&gt;");
    expect(email.html).toContain(
      "Use &quot;caution&quot; &amp; review &lt;scripts&gt;.",
    );
    expect(email.html).toContain(
      'href="https://gate.example/approve?x=&quot;1&quot;&amp;y=&lt;2&gt;"',
    );
  });
});
