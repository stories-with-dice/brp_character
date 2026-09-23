// Small pure helpers for manually spending a skill point pool (professional
// or personal) across chosen skills, with live remaining/cap feedback.
import { skillTotal, currentTotalBeforePoints } from "./skillSheet.js";

/** Sum of all values in an allocation map (skillName -> points). */
export function sumAllocations(allocations) {
  return Object.values(allocations).reduce((sum, v) => sum + (Number(v) || 0), 0);
}

/** Points left in the pool after the given allocation map is spent. Can go
 * negative if the caller has over-spent (used to flag an invalid state). */
export function remainingPoints(pool, allocations) {
  return pool - sumAllocations(allocations);
}

/** Names of skills whose *base+category+personality(+profession)* total
 * already exceeds `cap` before any points from this allocation phase are
 * added -- i.e. skills that should accept zero additional points. */
export function skillsAtCapBeforeProfessionPoints(entries, cap) {
  return Object.values(entries)
    .filter((e) => currentTotalBeforePoints(e) >= cap)
    .map((e) => e.name);
}

/** Names of skills whose grand total (including whatever's already been
 * allocated) exceeds `cap` -- used to flag an over-cap manual entry so the
 * UI can warn the user before they proceed. */
export function skillsOverCap(entries, cap) {
  return Object.values(entries)
    .filter((e) => skillTotal(e) > cap)
    .map((e) => e.name);
}

/** How many more points a single skill can accept before hitting `cap`.
 * `baseline` selects what counts as "already there": pass
 * `currentTotalBeforePoints` (the default) when spending *professional*
 * points, since the book's cap check happens before those are added; pass
 * `skillTotal` when spending *personal* points, since those are spent after
 * professional points and should account for them. */
export function headroomFor(entry, cap, baseline = currentTotalBeforePoints) {
  return Math.max(0, cap - baseline(entry));
}
