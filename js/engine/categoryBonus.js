import { CATEGORY_CHARACTERISTICS, SIMPLE_CATEGORY_PRIMARY, SKILL_CATEGORIES } from "../data/skills.js";

/** Full Skill Category Bonus system: primary +1%/pt over 10 (-1%/pt under),
 * secondary +1%/2pts over 10 (-1%/2pts under, round down), negative inverted. */
function fullBonusForCategory(category, chars) {
  const def = CATEGORY_CHARACTERISTICS[category];
  let bonus = 0;
  const primary = chars[def.primary];
  bonus += primary - 10;
  for (const key of def.secondary) {
    const diff = chars[key] - 10;
    bonus += Math.sign(diff) * Math.floor(Math.abs(diff) / 2);
  }
  for (const key of def.negative) {
    const diff = chars[key] - 10;
    bonus -= diff;
  }
  return bonus;
}

/** Simpler Skill Bonus (Option): category bonus = 1/2 primary characteristic,
 * round up. Note the simple method's primary characteristic differs from the
 * full method's for Communication, Perception, and Physical (see page 23). */
function simpleBonusForCategory(category, chars) {
  const primary = SIMPLE_CATEGORY_PRIMARY[category];
  return Math.ceil(chars[primary] / 2);
}

/**
 * Compute skill category bonuses for all six categories.
 * @param {object} chars characteristics
 * @param {'full'|'simple'} method
 */
export function computeCategoryBonuses(chars, method = "full") {
  const bonuses = {};
  for (const category of SKILL_CATEGORIES) {
    bonuses[category] = method === "simple"
      ? simpleBonusForCategory(category, chars)
      : fullBonusForCategory(category, chars);
  }
  return bonuses;
}
