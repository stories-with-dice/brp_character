import {
  powerSetOptionsFor,
  POWER_TYPES,
  findPowerType,
  STARTING_MAGIC_SPELLS,
  STARTING_MAGIC_EXTRAS,
  MAGIC_SPELLS,
  STARTING_PSYCHIC_ABILITIES,
  PSYCHIC_ABILITIES,
  MUTATIONS,
  findMutation,
  mutationForRoll,
  mutationPickRules,
  SORCERY_SPELLS,
  findSorcerySpell,
  sorcerySpellLevelBudget,
  SUPERPOWERS,
  findSuperpower,
  superpowerPointBudget,
} from "../data/powers.js";
import { SKILLS } from "../data/skills.js";
import { roll1d100 } from "./dice.js";

/** Pick one of the valid "how many power sets, at what level" options for a
 * campaign power level (random for auto-generation, or index-selected). */
export function choosePowerSetOption(campaignPowerLevel, rng = Math.random) {
  const options = powerSetOptionsFor(campaignPowerLevel);
  return options[Math.floor(rng() * options.length)];
}

/** True if a character with these characteristics can use this power type
 * (sorcery needs POW 16+, p. 78). */
export function canUsePowerType(typeId, characteristics) {
  const type = findPowerType(typeId);
  if (!type) return false;
  return !type.minPOW || (characteristics?.POW ?? 0) >= type.minPOW;
}

/**
 * Build a character's power sets: given an option like
 * [{level:"Heroic", count:1}, {level:"Normal", count:1}], randomly assigns a
 * power TYPE (magic/mutation/psychic/sorcery/superpowers) to each requested
 * slot (without repeats, unless there are more slots than types). With
 * `characteristics`, types the character cannot use (sorcery below POW 16)
 * are skipped.
 */
export function assignPowerTypes(option, rng = Math.random, { allowDuplicates = false, characteristics = null } = {}) {
  const usable = characteristics ? POWER_TYPES.filter((t) => canUsePowerType(t.id, characteristics)) : POWER_TYPES;
  const available = [...usable];
  const assignments = [];
  for (const { level, count } of option) {
    for (let i = 0; i < count; i++) {
      let pool = available.length > 0 ? available : usable;
      const idx = Math.floor(rng() * pool.length);
      const type = pool[idx];
      if (!allowDuplicates) {
        const realIdx = available.indexOf(type);
        if (realIdx >= 0) available.splice(realIdx, 1);
      }
      assignments.push({ level, type: type.id, name: type.name, resistance: type.resistance });
    }
  }
  return assignments;
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

// ---------------------------------------------------------------- starting rules

/**
 * What a starting character gets for one power set at one power level
 * (Chapter 4). `kind` tells the UI which picker to show:
 * - "list": pick exactly `count` distinct entries from `catalog`, each at `skill`%.
 * - "levels": sorcery spells whose levels add up to at most `budget`.
 * - "mutations": `picks` mutation picks (major = 2), see mutationPickRules().
 * - "points": superpowers whose character point cost adds up to at most `budget`.
 */
export function startingPowerRules(typeId, powerLevel, characteristics) {
  const { INT = 0, POW = 0, CON = 0 } = characteristics;
  switch (typeId) {
    case "magic":
      return { kind: "list", catalog: MAGIC_SPELLS, count: STARTING_MAGIC_SPELLS[powerLevel], skill: INT, skillLabel: "INT×1", extras: STARTING_MAGIC_EXTRAS[powerLevel] ?? [] };
    case "psychic":
      return { kind: "list", catalog: PSYCHIC_ABILITIES, count: STARTING_PSYCHIC_ABILITIES[powerLevel], skill: POW, skillLabel: "POW×1", extras: [] };
    case "sorcery":
      return { kind: "levels", catalog: SORCERY_SPELLS, budget: sorcerySpellLevelBudget(powerLevel, INT), extras: ["Grimoire"] };
    case "mutation":
      return { kind: "mutations", catalog: MUTATIONS, ...mutationPickRules(powerLevel, CON), extras: [] };
    case "superpowers":
      return { kind: "points", catalog: SUPERPOWERS, budget: superpowerPointBudget(powerLevel, characteristics), extras: [] };
    default:
      throw new Error(`Unknown power type: ${typeId}`);
  }
}

function pickDistinct(list, count, rng) {
  const pool = [...list];
  const picks = [];
  while (picks.length < count && pool.length > 0) picks.push(pool.splice(Math.floor(rng() * pool.length), 1)[0]);
  return picks;
}

function setShell(powerLevel, typeId) {
  const type = findPowerType(typeId);
  if (!type) throw new Error(`Unknown power type: ${typeId}`);
  return { level: powerLevel, type: type.id, name: type.name, resistance: type.resistance };
}

// ---------------------------------------------------------------- mutations

/** Number of picks a list of mutations uses (minor = 1, major = 2). */
export function mutationPicksUsed(mutations) {
  return mutations.reduce((sum, m) => sum + (m.severity === "major" ? 2 : 1), 0);
}

/** Add one mutation result: new results are minor, a repeat makes it major
 * (p. 65). Returns false if the result cannot be added (already major, or a
 * minor-only mutation rolled twice), so the caller rolls again. */
function addMutationResult(mutations, def) {
  const existing = mutations.find((m) => m.name === def.name);
  if (!existing) {
    mutations.push({ name: def.name, severity: "minor", adverse: !!def.adverse });
    return true;
  }
  if (existing.severity === "major" || def.minorOnly) return false;
  existing.severity = "major";
  return true;
}

/**
 * Random starting mutations (p. 65).
 * - Normal: roll D100 twice on the Random Mutations table. After each adverse
 *   result, a successful Luck roll (POW×5) gives one more roll.
 * - Heroic and above: the player chooses, so the generator picks beneficial
 *   mutations at random until all picks are used.
 * A 91-00 result ("pick or roll again") is rolled again.
 */
export function generateMutations(powerLevel, characteristics, rng = Math.random) {
  const rules = mutationPickRules(powerLevel, characteristics.CON ?? 0);
  const mutations = [];
  let guard = 0;
  if (!rules.adverseBuysPicks) {
    let rollsLeft = rules.picks;
    while (rollsLeft > 0 && guard++ < 1000) {
      const def = mutationForRoll(roll1d100(rng));
      if (!def || !addMutationResult(mutations, def)) continue;
      rollsLeft--;
      if (def.adverse && roll1d100(rng) <= (characteristics.POW ?? 0) * 5) rollsLeft++;
    }
    return mutations;
  }
  const beneficial = MUTATIONS.filter((m) => !m.adverse);
  while (mutationPicksUsed(mutations) < rules.picks && guard++ < 1000) {
    const def = beneficial[Math.floor(rng() * beneficial.length)];
    addMutationResult(mutations, def);
  }
  return mutations;
}

/**
 * Check a player's own mutation picks against the starting rules (p. 65).
 * Normal: exactly 2 picks, of any kind. Heroic and above: the picks must use
 * the full allowance, adverse picks are limited to `maxAdverse`, and each
 * adverse pick buys one more beneficial pick.
 * @param {{name:string, severity:'minor'|'major'}[]} picks
 */
export function validateMutationPicks(powerLevel, characteristics, picks) {
  const rules = mutationPickRules(powerLevel, characteristics.CON ?? 0);
  const names = new Set();
  let adverse = 0;
  let beneficial = 0;
  for (const { name, severity } of picks) {
    const def = findMutation(name);
    if (!def) throw new Error(`Unknown mutation: ${name}`);
    if (names.has(name)) throw new Error(`${name} is picked more than once. Pick it as major instead.`);
    names.add(name);
    if (severity !== "minor" && severity !== "major") throw new Error(`Choose minor or major for ${name}.`);
    if (severity === "major" && def.minorOnly) throw new Error(`${name} has only a minor version.`);
    const cost = severity === "major" ? 2 : 1;
    if (def.adverse) adverse += cost;
    else beneficial += cost;
  }
  if (!rules.adverseBuysPicks) {
    if (adverse + beneficial !== rules.picks) throw new Error(`Pick exactly ${rules.picks} mutation picks (a major mutation counts as 2).`);
    return;
  }
  if (adverse > rules.maxAdverse) throw new Error(`You can take at most ${rules.maxAdverse} adverse mutation picks.`);
  if (adverse + beneficial < rules.picks) throw new Error(`Use all ${rules.picks} mutation picks (a major mutation counts as 2).`);
  if (beneficial > rules.picks + adverse) throw new Error(`You have ${rules.picks + adverse} beneficial picks (${rules.picks} plus 1 per adverse pick).`);
}

// ---------------------------------------------------------------- sorcery

/** Random sorcery spells: spells at random levels until no more fit in the
 * level budget (p. 78). */
export function generateSorcerySpells(powerLevel, characteristics, rng = Math.random) {
  let remaining = sorcerySpellLevelBudget(powerLevel, characteristics.INT ?? 0);
  const spells = [];
  for (const spell of pickDistinct(SORCERY_SPELLS, SORCERY_SPELLS.length, rng)) {
    const maxFit = Math.min(spell.max, remaining);
    if (maxFit < spell.min) continue;
    const level = spell.min + Math.floor(rng() * (maxFit - spell.min + 1));
    spells.push({ name: spell.name, level });
    remaining -= level;
  }
  return spells;
}

export function validateSorceryPicks(powerLevel, characteristics, picks) {
  const budget = sorcerySpellLevelBudget(powerLevel, characteristics.INT ?? 0);
  const names = new Set();
  let total = 0;
  for (const { name, level } of picks) {
    const spell = findSorcerySpell(name);
    if (!spell) throw new Error(`Unknown sorcery spell: ${name}`);
    if (names.has(name)) throw new Error(`${name} is picked more than once.`);
    names.add(name);
    if (!Number.isInteger(level) || level < spell.min || level > spell.max) throw new Error(`${name} must be level ${spell.min === spell.max ? spell.min : `${spell.min}-${spell.max}`}.`);
    total += level;
  }
  if (total > budget) throw new Error(`Sorcery spells total ${total} levels, but the limit is ${budget}.`);
}

// ---------------------------------------------------------------- superpowers

/** Character point cost per level of a superpower (with its variant), or
 * null if the variant is not valid. */
export function superpowerUnitCost(power, variantName, characteristics) {
  let cost = power.cost;
  if (power.variants) {
    const variant = power.variants.find((v) => v.name === variantName);
    if (!variant) return null;
    cost = variant.cost;
  }
  return power.costPerSIZ ? cost * (characteristics.SIZ ?? 0) : cost;
}

/** Highest level a superpower can be bought at, ignoring the budget. */
export function superpowerMaxLevel(power) {
  if (power.maxLevel) return power.maxLevel;
  if (power.specifyPerLevel) return power.specify.length;
  return Infinity;
}

/** Options for a superpower's `specify` field ("skill" means any skill). */
export function superpowerSpecifyOptions(power) {
  if (power.specify === "skill") return SKILLS.map((s) => s.name);
  return power.specify ?? null;
}

/** Character point cost of one bought superpower entry. */
export function superpowerCost({ name, variant, level }, characteristics) {
  const power = findSuperpower(name);
  if (!power) throw new Error(`Unknown superpower: ${name}`);
  const unit = superpowerUnitCost(power, variant, characteristics);
  if (unit == null) throw new Error(`Choose a valid option for ${name}.`);
  return unit * level;
}

function usableVariants(power, characteristics) {
  // Super Characteristic (EDU) only makes sense if the EDU option is on.
  return power.variants.filter((v) => power.name !== "Super Characteristic" || characteristics[v.name] != null);
}

/**
 * Random superpowers bought from the character point budget (p. 90). Each
 * power is bought once, at a random level up to about half the points left,
 * so the budget spreads over several powers. Stops at `maxPowers` powers or
 * when nothing more is affordable.
 */
export function generateSuperpowers(powerLevel, characteristics, rng = Math.random, { maxPowers = 8 } = {}) {
  let remaining = superpowerPointBudget(powerLevel, characteristics);
  const bought = [];
  const taken = new Set();
  while (bought.length < maxPowers) {
    const candidates = [];
    for (const power of SUPERPOWERS) {
      if (taken.has(power.name)) continue;
      const variants = power.variants ? usableVariants(power, characteristics) : [null];
      for (const v of variants) {
        const unit = superpowerUnitCost(power, v?.name, characteristics);
        if (unit > 0 && unit <= remaining) candidates.push({ power, variant: v?.name ?? null, unit });
      }
    }
    if (candidates.length === 0) break;
    const { power, variant, unit } = candidates[Math.floor(rng() * candidates.length)];
    const maxAffordable = Math.min(Math.floor(remaining / unit), superpowerMaxLevel(power));
    const levelCap = Math.max(1, Math.ceil(maxAffordable / 2));
    const level = 1 + Math.floor(rng() * levelCap);
    const entry = { name: power.name, level, cost: unit * level };
    if (variant) entry.variant = variant;
    const options = superpowerSpecifyOptions(power);
    if (options) entry.specifics = pickDistinct(options, power.specifyPerLevel ? level : 1, rng);
    bought.push(entry);
    taken.add(power.name);
    remaining -= entry.cost;
  }
  return bought;
}

/** @param {{name:string, variant?:string, specifics?:string[], level:number}[]} picks */
export function validateSuperpowerPicks(powerLevel, characteristics, picks) {
  const budget = superpowerPointBudget(powerLevel, characteristics);
  let total = 0;
  for (const pick of picks) {
    const power = findSuperpower(pick.name);
    if (!power) throw new Error(`Unknown superpower: ${pick.name}`);
    if (!Number.isInteger(pick.level) || pick.level < 1) throw new Error(`${pick.name} needs a level of 1 or more.`);
    if (pick.level > superpowerMaxLevel(power)) throw new Error(`${pick.name} can be at most level ${superpowerMaxLevel(power)}.`);
    const options = superpowerSpecifyOptions(power);
    if (options) {
      const specifics = pick.specifics ?? [];
      const needed = power.specifyPerLevel ? pick.level : 1;
      if (specifics.length !== needed || new Set(specifics).size !== needed || specifics.some((s) => !options.includes(s))) {
        throw new Error(`${pick.name} needs ${needed === 1 ? "one choice" : `${needed} different choices`} from its list.`);
      }
    }
    total += superpowerCost(pick, characteristics);
  }
  if (total > budget) throw new Error(`Superpowers cost ${total} character points, but the budget is ${budget}.`);
}

// ---------------------------------------------------------------- power sets

/** Total levels or points a set's contents use (sorcery levels, superpower
 * character points), for display against the set's budget. */
function spentFor(typeId, powers) {
  if (typeId === "sorcery") return powers.reduce((sum, p) => sum + p.level, 0);
  if (typeId === "superpowers") return powers.reduce((sum, p) => sum + p.cost, 0);
  return undefined;
}

function finishSet(powerLevel, typeId, characteristics, powers) {
  const rules = startingPowerRules(typeId, powerLevel, characteristics);
  const set = { ...setShell(powerLevel, typeId), powers, extras: [...rules.extras] };
  if (rules.budget != null) {
    set.budget = rules.budget;
    set.spent = spentFor(typeId, powers);
  }
  return set;
}

/** Randomly fill one power set with its starting powers (Chapter 4). */
export function generatePowerSet(powerLevel, typeId, characteristics, rng = Math.random) {
  const rules = startingPowerRules(typeId, powerLevel, characteristics);
  let powers;
  switch (typeId) {
    case "magic":
    case "psychic":
      powers = pickDistinct(rules.catalog, rules.count, rng).map((p) => ({ name: p.name, skill: rules.skill }));
      break;
    case "sorcery":
      powers = generateSorcerySpells(powerLevel, characteristics, rng);
      break;
    case "mutation":
      powers = generateMutations(powerLevel, characteristics, rng);
      break;
    case "superpowers":
      powers = generateSuperpowers(powerLevel, characteristics, rng);
      break;
  }
  return finishSet(powerLevel, typeId, characteristics, powers);
}

/**
 * Fill one power set from the player's own picks, after checking them
 * against the starting rules. `picks` has the same shape as the `powers` of
 * a generated set, so a random set can be edited and passed back in:
 * - magic/psychic: names (or {name}) of exactly the required number of entries
 * - sorcery: [{name, level}]
 * - mutation: [{name, severity}]
 * - superpowers: [{name, variant?, specifics?, level}]
 */
export function buildPowerSetManual(powerLevel, typeId, characteristics, picks = []) {
  if (!canUsePowerType(typeId, characteristics)) throw new Error(`${findPowerType(typeId)?.name ?? typeId} needs POW ${findPowerType(typeId)?.minPOW}+.`);
  const rules = startingPowerRules(typeId, powerLevel, characteristics);
  let powers;
  switch (typeId) {
    case "magic":
    case "psychic": {
      const names = picks.map((p) => (typeof p === "string" ? p : p.name));
      const known = new Set(rules.catalog.map((c) => c.name));
      const unknown = names.find((n) => !known.has(n));
      if (unknown) throw new Error(`Unknown entry: ${unknown}`);
      if (new Set(names).size !== names.length) throw new Error("Each entry can be picked only once.");
      if (names.length !== rules.count) throw new Error(`Pick exactly ${rules.count} for this ${findPowerType(typeId).name} power set.`);
      powers = names.map((name) => ({ name, skill: rules.skill }));
      break;
    }
    case "sorcery":
      validateSorceryPicks(powerLevel, characteristics, picks);
      powers = picks.map(({ name, level }) => ({ name, level }));
      break;
    case "mutation":
      validateMutationPicks(powerLevel, characteristics, picks);
      powers = picks.map(({ name, severity }) => ({ name, severity, adverse: !!findMutation(name).adverse }));
      break;
    case "superpowers":
      validateSuperpowerPicks(powerLevel, characteristics, picks);
      powers = picks.map((p) => {
        const entry = { name: p.name, level: p.level, cost: superpowerCost(p, characteristics) };
        if (p.variant) entry.variant = p.variant;
        if (p.specifics?.length) entry.specifics = [...p.specifics];
        return entry;
      });
      break;
  }
  return finishSet(powerLevel, typeId, characteristics, powers);
}

/** Extra power points from the Extra Energy superpower (+10 per level). */
export function extraPowerPoints(sets) {
  let extra = 0;
  for (const set of sets) {
    for (const p of set.powers ?? []) if (p.name === "Extra Energy" && set.type === "superpowers") extra += 10 * p.level;
  }
  return extra;
}

/**
 * Build the `powers` block of a character at random: a power set option,
 * a type for each set, and each set's starting powers.
 * @param {string} campaignPowerLevel
 * @param {number} pow current POW (power points equal POW)
 * @param {object} characteristics the unmodified characteristics from Step
 *   One, used for the starting rules (INT, POW, CON, SIZ, highest value)
 */
export function buildPowersBlock(campaignPowerLevel, pow, characteristics, rng = Math.random) {
  const option = choosePowerSetOption(campaignPowerLevel, rng);
  const sets = assignPowerTypes(option, rng, { characteristics }).map((a) => generatePowerSet(a.level, a.type, characteristics, rng));
  return { powerPoints: pow + extraPowerPoints(sets), sets };
}

/** Manually build the `powers` block from the player's own picks.
 * @param {number} pow
 * @param {{level:string, typeId:string, picks:any[]}[]} assignments one per power-set slot
 * @param {object} characteristics the unmodified characteristics from Step One
 */
export function buildPowersBlockManual(pow, assignments, characteristics) {
  const sets = assignments.map(({ level, typeId, picks }) => buildPowerSetManual(level, typeId, characteristics, picks));
  return { powerPoints: pow + extraPowerPoints(sets), sets };
}

// ---------------------------------------------------------------- display

/** One-line label for a power in a set, shared by the sheet and exports.
 * Sets saved before power catalogs existed have no `powers`; callers skip them. */
export function describePower(typeId, entry) {
  switch (typeId) {
    case "magic":
    case "psychic":
      return `${entry.name} ${entry.skill}%`;
    case "sorcery":
      return `${entry.name} (level ${entry.level})`;
    case "mutation":
      return `${entry.name} (${entry.severity}${entry.adverse ? ", adverse" : ""})`;
    case "superpowers": {
      const qualifiers = [entry.variant, ...(entry.specifics ?? [])].filter(Boolean);
      const name = qualifiers.length ? `${entry.name} (${qualifiers.join(", ")})` : entry.name;
      return `${name} ${entry.level} -- ${entry.cost} pts`;
    }
    default:
      return entry.name;
  }
}

/** Heading for a power set, e.g. "Sorcery (Heroic) -- 12/14 spell levels". */
export function describePowerSet(set) {
  let label = `${set.name} (${set.level})`;
  if (set.budget != null) label += ` -- ${set.spent}/${set.budget} ${set.type === "sorcery" ? "spell levels" : "character points"}`;
  return label;
}
