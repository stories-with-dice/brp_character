// Validation for a player's manual picks against a profession's "choose N of
// the following" pools (js/data/professions.js `choices` entries).
import { parseSkillRef } from "./skillRef.js";

function isOpenPoolEntry(poolRef) {
  const { specialty, wildcard } = parseSkillRef(poolRef);
  return !wildcard && specialty != null && /^(any|various)$/i.test(specialty);
}

/** True if a selected item satisfies a pool entry: either an exact string
 * match, or -- for an "(any)"/"(various)" pool entry -- any already-resolved
 * concrete skill of the same base (e.g. "Art (Painting)" satisfies "Art
 * (any)"). This lets pools whose count exceeds their listed options (e.g.
 * Artist's "choose 2" from a pool of just ["Art (any)"]) be satisfied by
 * picking the same base skill more than once, each with a different
 * specialty. */
function selectionMatchesPoolEntry(selected, poolRef) {
  if (selected === poolRef) return true;
  if (!isOpenPoolEntry(poolRef)) return false;
  return parseSkillRef(selected).base === parseSkillRef(poolRef).base;
}

/** @param {{count:number, from:string[]}} choice
 * @param {string[]} selectedRefs the refs (or already-specialty-resolved
 *   skill names) the player picked
 * @returns {string|null} an error message, or null if the selection is valid */
export function validateChoiceSelection(choice, selectedRefs) {
  if (!Array.isArray(selectedRefs)) return "No selection made.";
  const isWildcard = choice.from.length === 1 && /^Any skill/i.test(choice.from[0]);
  if (selectedRefs.length !== choice.count) {
    return `Choose exactly ${choice.count} (currently ${selectedRefs.length}).`;
  }
  if (new Set(selectedRefs).size !== selectedRefs.length) {
    return "Duplicate selections aren't allowed.";
  }
  if (!isWildcard) {
    for (const ref of selectedRefs) {
      if (!choice.from.some((poolRef) => selectionMatchesPoolEntry(ref, poolRef))) {
        return `"${ref}" isn't one of the offered options.`;
      }
    }
  }
  return null;
}

/** Validate a full set of choice selections for a profession (array parallel
 * to profession.choices). Returns an array of error messages (empty if all
 * choices are valid). */
export function validateAllChoiceSelections(profession, selectionsByChoiceIndex) {
  const errors = [];
  (profession.choices ?? []).forEach((choice, i) => {
    const err = validateChoiceSelection(choice, selectionsByChoiceIndex[i] ?? []);
    if (err) errors.push(`Choice ${i + 1}: ${err}`);
  });
  return errors;
}
