/**
 * Job listing D1/IO layer built on top of pure helpers in `jobs-lib.ts`.
 *
 * The deterministic normalization/public-index layer lives in
 * `@/lib/jobs-lib` and is re-exported below so the public `@/lib/jobs`
 * surface is unchanged for routes and sibling modules.
 */
import { getSiteDb, type D1DatabaseLike } from "@/lib/db";
import { validateJobPublicExposure } from "@heyclaude/registry/commercial";

import { mapJobListingRow, sortJobs, type JobListing, type JobListingRow } from "@/lib/jobs-lib";

export {
  buildPublicJobsIndex,
  jobSourceLabel,
  mapJobListingRow,
  normalizeJobLocation,
  sortJobs,
  toPublicJobListing,
  type JobListing,
  type JobListingRow,
  type JobSource,
  type JobSourceKind,
  type JobStatus,
  type JobTier,
  type PublicJobListing,
} from "@/lib/jobs-lib";

function getJobsDb(): D1DatabaseLike | null {
  return getSiteDb();
}

export async function queryActiveJobs(db: D1DatabaseLike): Promise<JobListing[]> {
  const { results } = await db
    .prepare(
      `SELECT
        slug,
        title,
        company_name,
        company_url,
        location_text,
        summary,
        description_md,
        employment_type,
        posted_at,
        compensation_summary,
        equity_summary,
        bonus_summary,
        benefits_json,
        responsibilities_json,
        requirements_json,
        apply_url,
        tier,
        status,
        source,
        source_kind,
        source_url,
        first_seen_at,
        last_checked_at,
        source_checked_at,
        stale_check_count,
        curation_note,
        paid_placement_expires_at,
        claimed_employer,
        posted_by_email,
        expires_at,
        is_remote,
        is_worldwide
      FROM jobs_listings
      WHERE status = 'active'
        AND (expires_at IS NULL OR datetime(expires_at) >= datetime('now'))
      ORDER BY
        CASE tier
          WHEN 'sponsored' THEN 3
          WHEN 'featured' THEN 2
          ELSE 1
        END DESC,
        datetime(posted_at) DESC,
        datetime(created_at) DESC`,
    )
    .bind()
    .all<JobListingRow>();

  return sortJobs(
    results
      .map((row) => mapJobListingRow(row))
      .filter((job) => {
        const report = validateJobPublicExposure(job as Record<string, unknown>);
        if (!report.ok) {
          console.warn("[jobs] active job failed public exposure gate", {
            slug: job.slug,
            errors: report.errors,
          });
        }
        return report.ok;
      }),
  );
}

export async function getJobs(): Promise<JobListing[]> {
  const db = getJobsDb();
  if (!db) return [];

  try {
    return await queryActiveJobs(db);
  } catch (error) {
    console.warn(
      "[jobs] failed to query active D1 jobs",
      error instanceof Error ? error.message : "unknown error",
    );
    return [];
  }
}

export async function getJobBySlug(slug: string): Promise<JobListing | null> {
  const jobs = await getJobs();
  return jobs.find((item) => item.slug === slug) ?? null;
}
