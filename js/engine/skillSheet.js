import { SKILLS } from "../data/skills.js";
import { evaluateSkillFormula } from "./skillFormula.js";
import { computeCategoryBonuses } from "./categoryBonus.js";

/** Build baseline entries for every non-specialty skill (Dodge, Climb, Brawl,
 * Persuade, etc.) -- the ones listed once on the character sheet with a fixed
 * base chance. Specialty skills (Art, Craft, Knowledge, Firearm, ...) are
 * handled separately as concrete named instances once a specialty is chosen. */
export function baselineSkillEntries(chars, options = {}) {
  const { useCategoryBonus = false, categoryBonusMethod = "full", usePowers = false } = options;
  const categoryBonuses = useCategoryBonus ? computeCategoryBonuses(chars, categoryBonusMethod) : null;

  const entries = {};
  for (const skill of SKILLS) {
    if (skill.specialty) continue;
    if (skill.optionOnly === "powers" && !usePowers) continue;
    const candidates = evaluateSkillFormula(skill.base, chars);
    const base = candidates[skill.formulaDefaultIndex ?? 0];
    entries[skill.name] = {
      name: skill.name,
      category: skill.category,
      base,
      categoryBonus: categoryBonuses ? categoryBonuses[skill.category] : 0,
      personalityBonus: 0,
      professionalPoints: 0,
      personalPoints: 0,
    };
  }
  return entries;
}

/** Ensure a (possibly specialty) skill display name has an entry in `entries`,
 * creating a baseline one from its base skill definition if missing. */
export function ensureSkillEntry(entries, displayName, chars, options = {}) {
  if (entries[displayName]) return entries[displayName];
  const { useCategoryBonus = false, categoryBonusMethod = "full" } = options;
  const baseName = displayName.replace(/\s*\([^)]*\)\s*$/, "");
  const skillDef = SKILLS.find((s) => s.name === baseName) ?? SKILLS.find((s) => s.name === displayName);
  const category = skillDef ? skillDef.category : "Mental";
  let base = 0;
  if (skillDef) {
    try {
      const candidates = evaluateSkillFormula(skillDef.base, chars);
      base = candidates[skillDef.formulaDefaultIndex ?? 0];
      // "05 or 00" style formulas for specialty skills (Knowledge, Science, etc.)
      // default to the *lower* (00) since a specific, untrained specialty
      // starts from nothing until points are spent on it.
      if (candidates.length > 1 && skillDef.specialty) base = candidates[candidates.length - 1];
    } catch {
      base = 0;
    }
  }
  const categoryBonus = useCategoryBonus ? computeCategoryBonuses(chars, categoryBonusMethod)[category] : 0;
  entries[displayName] = {
    name: displayName,
    category,
    base,
    categoryBonus,
    personalityBonus: 0,
    professionalPoints: 0,
    personalPoints: 0,
  };
  return entries[displayName];
}

export function skillTotal(entry) {
  return entry.base + entry.categoryBonus + entry.personalityBonus + entry.professionalPoints + entry.personalPoints;
}

export function currentTotalBeforePoints(entry) {
  return entry.base + entry.categoryBonus + entry.personalityBonus;
}
