import { PERSONALITY_TYPES, PERSONALITY_BONUS, PERSONALITY_SKILL_COUNT, findPersonalityType } from "../data/personality.js";
import { SKILLS } from "../data/skills.js";
import { rollDie } from "./dice.js";
import { resolveSkillDisplayName, baseSkillName } from "./skillRef.js";

export const COMBAT_SKILL_NAMES = SKILLS.filter((s) => s.category === "Combat").map((s) => s.name);
const CRAFT_LIKE = { craftChoices: "Craft", knowledgeChoices: "Knowledge", technicalChoices: "Technical Skill", languageChoices: "Language" };

export function rollPersonalityType(rng = Math.random) {
  return findPersonalityType(rollDie(4, rng));
}

/** Resolve a personality package into a flat list of skill display names that
 * each receive +20 (PERSONALITY_BONUS). */
export function resolvePersonalitySkills(personality, rng = Math.random) {
  const names = new Set(personality.skills);

  for (const [choiceKey, base] of Object.entries(CRAFT_LIKE)) {
    const count = personality[choiceKey];
    if (!count) continue;
    for (let i = 0; i < count; i++) {
      const display = resolveSkillDisplayName(`${base} (any)`, rng);
      if (display) names.add(display);
    }
  }

  if (personality.combatChoices) {
    const usedBases = new Set([...names].map(baseSkillName));
    const pool = COMBAT_SKILL_NAMES.filter((n) => !usedBases.has(n));
    for (let i = 0; i < personality.combatChoices && pool.length > 0; i++) {
      const idx = Math.floor(rng() * pool.length);
      const baseName = pool.splice(idx, 1)[0];
      // Weapon-class combat skills (Firearm, Melee Weapon, ...) need a
      // specialty before they're usable; resolveSkillDisplayName rolls one
      // when the skill has a specialty system, and passes bare skills
      // (Brawl, Dodge, Grapple, Martial Arts) through unchanged.
      const display = resolveSkillDisplayName(baseName, rng);
      if (display) names.add(display);
    }
  }

  return [...names];
}

/**
 * Manually resolve a personality package from the player's own picks,
 * instead of rolling them.
 * @param {object} personality one of PERSONALITY_TYPES
 * @param {{craftChoices?:string[], knowledgeChoices?:string[], technicalChoices?:string[], languageChoices?:string[], combatChoices?:string[]}} picks
 *   already-concrete skill display names (e.g. "Craft (Carpentry)") for each
 *   choice category, and plain skill names (e.g. "Brawl") for combatChoices.
 * @returns {string[]} flat list of skill display names.
 */
export function resolvePersonalitySkillsManual(personality, picks = {}) {
  const names = new Set(personality.skills);

  for (const [choiceKey, base] of Object.entries(CRAFT_LIKE)) {
    const required = personality[choiceKey] ?? 0;
    if (required === 0) continue;
    const chosen = picks[choiceKey] ?? [];
    if (chosen.length !== required) {
      throw new Error(`${choiceKey}: choose exactly ${required} (currently ${chosen.length}).`);
    }
    for (const display of chosen) {
      if (!display.startsWith(`${base} (`)) {
        throw new Error(`${choiceKey}: "${display}" isn't a ${base} specialty.`);
      }
      names.add(display);
    }
  }

  const requiredCombat = personality.combatChoices ?? 0;
  if (requiredCombat > 0) {
    const chosen = picks.combatChoices ?? [];
    if (chosen.length !== requiredCombat) {
      throw new Error(`combatChoices: choose exactly ${requiredCombat} (currently ${chosen.length}).`);
    }
    const chosenBases = chosen.map(baseSkillName);
    if (new Set(chosenBases).size !== chosenBases.length) {
      throw new Error("combatChoices: duplicate picks aren't allowed.");
    }
    const fixedBases = new Set(personality.skills.map(baseSkillName));
    for (const skillName of chosen) {
      const base = baseSkillName(skillName);
      if (!COMBAT_SKILL_NAMES.includes(base)) {
        throw new Error(`"${skillName}" isn't a combat skill.`);
      }
      if (fixedBases.has(base)) {
        throw new Error(`"${skillName}" is already part of this personality package.`);
      }
      names.add(skillName);
    }
  }

  return [...names];
}

/** Build a "Custom" personality package (Step Six's "or create your own,
 * choosing 13 skills and adding 20 points to each") from the player's own
 * skill picks. */
export function buildCustomPersonality(selectedSkillNames) {
  if (selectedSkillNames.length !== PERSONALITY_SKILL_COUNT) {
    throw new Error(`Choose exactly ${PERSONALITY_SKILL_COUNT} skills (currently ${selectedSkillNames.length}).`);
  }
  if (new Set(selectedSkillNames).size !== selectedSkillNames.length) {
    throw new Error("Duplicate skills aren't allowed.");
  }
  return {
    id: "custom",
    name: "Custom",
    description: "A player-chosen set of 13 skills, each granted a +20 bonus.",
    skills: [...selectedSkillNames],
  };
}

export const PERSONALITY_TYPE_LIST = PERSONALITY_TYPES;
export { PERSONALITY_BONUS };
