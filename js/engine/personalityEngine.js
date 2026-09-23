import { PERSONALITY_TYPES, PERSONALITY_BONUS, findPersonalityType } from "../data/personality.js";
import { SKILLS } from "../data/skills.js";
import { rollDie } from "./dice.js";
import { resolveSkillDisplayName } from "./skillRef.js";

const COMBAT_SKILL_NAMES = SKILLS.filter((s) => s.category === "Combat").map((s) => s.name);
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
    const pool = COMBAT_SKILL_NAMES.filter((n) => !names.has(n));
    for (let i = 0; i < personality.combatChoices && pool.length > 0; i++) {
      const idx = Math.floor(rng() * pool.length);
      names.add(pool.splice(idx, 1)[0]);
    }
  }

  return [...names];
}

export const PERSONALITY_TYPE_LIST = PERSONALITY_TYPES;
export { PERSONALITY_BONUS };
