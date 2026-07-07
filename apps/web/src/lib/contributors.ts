import { cache } from "react";

import { getDirectoryEntries, type DirectoryEntry } from "@/lib/content.server";
import { contributorSlug } from "@/lib/contributor-identity-lib";

// `contributorSlug` is the canonical handle->slug normalizer and already lives
// (unit-tested) in contributor-identity-lib. Re-export it here so existing
// `@/lib/contributors` consumers keep working without a second, drifting copy.
export { contributorSlug };

export type ContributorSummary = {
  slug: string;
  name: string;
  profileUrl?: string;
  entryCount: number;
  entries: DirectoryEntry[];
};

export const getContributors = cache(async () => {
  const entries = await getDirectoryEntries();
  const grouped = new Map<string, ContributorSummary>();

  for (const entry of entries) {
    const name = String(entry.submittedBy || entry.author || "JSONbored").trim();
    if (!name) continue;
    const slug = contributorSlug(name);
    if (!slug) continue;
    const profileUrl = entry.submittedByUrl || entry.authorProfileUrl;
    const existing = grouped.get(slug) ?? {
      slug,
      name,
      profileUrl,
      entryCount: 0,
      entries: [],
    };
    existing.entries.push(entry);
    existing.entryCount = existing.entries.length;
    existing.profileUrl ||= profileUrl;
    grouped.set(slug, existing);
  }

  return [...grouped.values()].sort(
    (left, right) => right.entryCount - left.entryCount || left.name.localeCompare(right.name),
  );
});

export const getContributor = cache(async (slug: string) => {
  const contributors = await getContributors();
  return contributors.find((contributor) => contributor.slug === slug) ?? null;
});
