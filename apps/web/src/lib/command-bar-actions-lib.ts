// Pure query-filtering for the command bar's action list, split out of
// command-bar.tsx so the match and cap rules can be unit-tested without React.

/** How many matching actions the command bar shows for a non-empty query. */
export const MAX_MATCHED_ACTIONS = 4;

/**
 * Filter the command bar's actions for a query. A blank (or whitespace-only)
 * query returns every action unchanged; otherwise actions are matched by
 * case-insensitive substring on their `label` and capped at
 * {@link MAX_MATCHED_ACTIONS}.
 */
export function filterCommandActions<T extends { label: string }>(all: T[], q: string): T[] {
  if (!q.trim()) return all;
  const needle = q.toLowerCase();
  return all.filter((a) => a.label.toLowerCase().includes(needle)).slice(0, MAX_MATCHED_ACTIONS);
}
