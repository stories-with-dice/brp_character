import { SKILLS } from "../data/skills.js";
import { resolveSkillDisplayName, resolveSkillDisplayNameManual, refNeedsSpecialtyChoice } from "./skillRef.js";
import { validateAllChoiceSelections } from "./professionChoices.js";

/** Randomly pick `count` distinct items from `pool`, avoiding items already in `exclude`. */
function pickRandomDistinct(pool, count, exclude, rng) {
  const available = pool.filter((item) => !exclude.has(item));
  const chosen = [];
  const working = [...available];
  for (let i = 0; i < count && working.length > 0; i++) {
    const idx = Math.floor(rng() * working.length);
    chosen.push(working.splice(idx, 1)[0]);
  }
  return chosen;
}

/** If `name` is already taken, append a numeric suffix ("#2", "#3", ...)
 * until it isn't. Used so a skill picked more than once (e.g. "any two Art
 * skills" resolving to the same specialty twice, or a ref like "Language
 * (Other)" that can't be re-randomized at all) still results in the right
 * *count* of skills, instead of one silently vanishing as a "duplicate". */
function uniqueName(name, resolved) {
  if (!resolved.has(name)) return name;
  let suffix = 2;
  while (resolved.has(`${name} #${suffix}`)) suffix++;
  return `${name} #${suffix}`;
}

/**
 * Resolve a profession's skill list (fixed + randomly-resolved "choose N of
 * the following" pools) into a flat list of concrete skill display names,
 * e.g. ["Dodge", "Hide", "Melee Weapon (Sword)", ...].
 */
export function resolveProfessionSkills(profession, rng = Math.random) {
  const resolved = new Set();
  const displayNames = [];

  const addRef = (ref) => {
    let name = resolveSkillDisplayName(ref, rng);
    if (!name) return null;
    // Retry a few times to dodge an unlucky specialty collision (cheap and
    // usually unnecessary given how large most specialty pools are) before
    // falling back to disambiguating -- this guarantees a profession always
    // ends up with the full count of skills it's supposed to grant, even
    // for refs that can't be re-randomized at all (e.g. "Language (Other)"
    // picked twice) or pools smaller than the count being picked from them
    // (e.g. Artist's "choose 2" from just ["Art (any)"]).
    let attempts = 0;
    while (resolved.has(name) && attempts < 20) {
      name = resolveSkillDisplayName(ref, rng);
      attempts++;
    }
    name = uniqueName(name, resolved);
    resolved.add(name);
    displayNames.push(name);
    return name;
  };

  for (const ref of profession.fixed) addRef(ref);

  for (const choice of profession.choices ?? []) {
    if (choice.from.length === 1 && /^Any skill/i.test(choice.from[0])) {
      const allSkillNames = SKILLS.map((s) => s.name).filter((n) => !resolved.has(n));
      const picks = pickRandomDistinct(allSkillNames, choice.count, resolved, rng);
      for (const base of picks) addRef(base);
      continue;
    }
    // Sample from choice.from; allow repeats when the pool has fewer
    // distinct refs than the required count -- e.g. Artist's "choose 2"
    // from ["Art (any)"] means two different Art specialties, not one.
    const picks =
      choice.from.length >= choice.count
        ? pickRandomDistinct(choice.from, choice.count, new Set(), rng)
        : Array.from({ length: choice.count }, () => choice.from[Math.floor(rng() * choice.from.length)]);
    for (const ref of picks) addRef(ref);
  }

  return displayNames;
}

/**
 * Manually resolve a profession's skill list from the player's own choices,
 * instead of rolling them.
 *
 * @param {object} profession
 * @param {string[][]} choiceSelections array parallel to profession.choices;
 *   each entry is the exact set of refs the player picked from that choice's
 *   pool (or, for an "Any skill" wildcard pool, already-concrete skill
 *   display names the player picked from a full skill search).
 * @param {Record<string,string>} specialtyChoices map of ref -> concrete
 *   specialty the player picked, for any fixed or chosen ref that says
 *   "(any)"/"(various)" (see refNeedsSpecialtyChoice).
 * @returns {string[]} flat list of concrete skill display names.
 * @throws if choiceSelections don't match the profession's choice counts/pools,
 *   or a ref needing a specialty choice is missing one.
 */
export function resolveProfessionSkillsManual(profession, choiceSelections, specialtyChoices = {}) {
  const errors = validateAllChoiceSelections(profession, choiceSelections);
  if (errors.length > 0) throw new Error(errors.join(" "));

  const resolved = new Set();
  const displayNames = [];

  const addRef = (ref) => {
    let name = refNeedsSpecialtyChoice(ref)
      ? resolveSkillDisplayNameManual(ref, specialtyChoices[ref])
      : resolveSkillDisplayNameManual(ref, null);
    if (!name) throw new Error(`Missing specialty choice for "${ref}".`);
    name = uniqueName(name, resolved);
    resolved.add(name);
    displayNames.push(name);
  };

  for (const ref of profession.fixed) addRef(ref);
  for (const selection of choiceSelections) {
    for (const ref of selection) addRef(ref);
  }

  return displayNames;
}

/**
 * Greedily distribute `pool` points across `slots` (array of {key, headroom})
 * in random chunks, respecting each slot's remaining headroom under its cap.
 * Mutates nothing; returns a map of key -> points allocated.
 */
export function allocatePointsRandomly(pool, slots, rng = Math.random, { maxChunk = 15 } = {}) {
  const allocation = {};
  const open = slots.filter((s) => s.headroom > 0).map((s) => ({ ...s }));
  for (const s of open) allocation[s.key] = 0;

  let remaining = pool;
  while (remaining > 0 && open.length > 0) {
    const idx = Math.floor(rng() * open.length);
    const slot = open[idx];
    const chunk = Math.min(slot.headroom, remaining, 1 + Math.floor(rng() * maxChunk));
    allocation[slot.key] += chunk;
    slot.headroom -= chunk;
    remaining -= chunk;
    if (slot.headroom <= 0) open.splice(idx, 1);
  }
  return allocation;
}
