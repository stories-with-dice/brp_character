import { SKILLS } from "../data/skills.js";
import { resolveSkillDisplayName } from "./skillRef.js";

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

/**
 * Resolve a profession's skill list (fixed + randomly-resolved "choose N of
 * the following" pools) into a flat list of concrete skill display names,
 * e.g. ["Dodge", "Hide", "Melee Weapon (Sword)", ...].
 */
export function resolveProfessionSkills(profession, rng = Math.random) {
  const resolved = new Set();
  const displayNames = [];

  const addRef = (ref) => {
    const name = resolveSkillDisplayName(ref, rng);
    if (name && !resolved.has(name)) {
      resolved.add(name);
      displayNames.push(name);
    }
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
    const picks = pickRandomDistinct(choice.from, choice.count, new Set(), rng);
    for (const ref of picks) addRef(ref);
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
