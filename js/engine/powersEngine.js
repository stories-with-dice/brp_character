import { powerSetOptionsFor, POWER_TYPES, findPowerType } from "../data/powers.js";

/** Pick one of the valid "how many power sets, at what level" options for a
 * campaign power level (random for auto-generation, or index-selected). */
export function choosePowerSetOption(campaignPowerLevel, rng = Math.random) {
  const options = powerSetOptionsFor(campaignPowerLevel);
  return options[Math.floor(rng() * options.length)];
}

/**
 * Build a character's power sets: given an option like
 * [{level:"Heroic", count:1}, {level:"Normal", count:1}], randomly assigns a
 * power TYPE (magic/mutation/psychic/sorcery/superpowers) to each requested
 * slot (without repeats, unless there are more slots than types).
 */
export function assignPowerTypes(option, rng = Math.random, { allowDuplicates = false } = {}) {
  const totalSlots = option.reduce((sum, o) => sum + o.count, 0);
  const available = [...POWER_TYPES];
  const assignments = [];
  for (const { level, count } of option) {
    for (let i = 0; i < count; i++) {
      let pool = available.length > 0 ? available : POWER_TYPES;
      const idx = Math.floor(rng() * pool.length);
      const type = pool[idx];
      if (!allowDuplicates) {
        const realIdx = available.indexOf(type);
        if (realIdx >= 0) available.splice(realIdx, 1);
      }
      assignments.push({ level, type: type.id, name: type.name, resistance: type.resistance, spells: [] });
    }
  }
  return assignments;
}

/** Groundwork: build the `powers` block of a character. Power Points equal
 * POW; individual spells/mutations/talents are left as empty arrays for a
 * future expansion to populate. */
export function buildPowersBlock(campaignPowerLevel, pow, rng = Math.random) {
  const option = choosePowerSetOption(campaignPowerLevel, rng);
  const sets = assignPowerTypes(option, rng);
  return { powerPoints: pow, sets };
}

/** Expand a "how many power sets, at what level" option (e.g.
 * [{level:"Heroic",count:1},{level:"Normal",count:1}]) into one entry per
 * individual power-set slot, for a UI to render one picker per slot. */
export function flattenPowerSetOption(option) {
  const slots = [];
  for (const { level, count } of option) {
    for (let i = 0; i < count; i++) slots.push({ level });
  }
  return slots;
}

/** Manually build the `powers` block from the player's own picks.
 * @param {number} pow
 * @param {{level:string, typeId:string}[]} assignments one per power-set slot
 */
export function buildPowersBlockManual(pow, assignments) {
  const sets = assignments.map(({ level, typeId }) => {
    const type = findPowerType(typeId);
    if (!type) throw new Error(`Unknown power type: ${typeId}`);
    return { level, type: type.id, name: type.name, resistance: type.resistance, spells: [] };
  });
  return { powerPoints: pow, sets };
}
