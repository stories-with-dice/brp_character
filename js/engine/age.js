// Step Three: Age & Experience.
import { rollDie } from "./dice.js";

export const DEFAULT_MIN_AGE = 18;
export const BASE_AGE_ROLL = "17+1D6"; // resolved to a number by rollStartingAge

export const SKILL_POINTS_PER_DECADE = { Normal: 0, Heroic: 20, Epic: 30, Superhuman: 40 };

export function rollStartingAge(rng = Math.random) {
  return 17 + rollDie(6, rng);
}

/**
 * Age-based modifiers (Step Three), returned as adjustments to apply elsewhere:
 * - skillPointModifier: added to/subtracted from the professional skill point pool
 * - characteristicPenalties: number of characteristics (player's choice, from
 *   STR/CON/DEX/CHA) that lose 1 point each, at 50+ (one) and 80+ (three total)
 * - youngCharacteristicPenalty: 1 point off any characteristic other than EDU,
 *   per year below the minimum starting age
 */
export function ageModifiers(age, campaignPowerLevel, { minAge = DEFAULT_MIN_AGE } = {}) {
  const perDecade = SKILL_POINTS_PER_DECADE[campaignPowerLevel] ?? 0;
  let skillPointModifier = 0;
  let youngCharacteristicPenalty = 0;

  if (age > minAge) {
    const fullDecadesOver = Math.floor((age - minAge) / 10);
    skillPointModifier += fullDecadesOver * perDecade;
  } else if (age < minAge) {
    const yearsUnder = minAge - age;
    skillPointModifier -= yearsUnder * perDecade;
    youngCharacteristicPenalty = yearsUnder;
  }

  let characteristicPenalties = 0;
  if (age >= 80) characteristicPenalties = 3;
  else if (age >= 50) characteristicPenalties = 1;

  return { skillPointModifier, characteristicPenalties, youngCharacteristicPenalty };
}
