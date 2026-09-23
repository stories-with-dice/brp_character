// Step Seven: Profession and Skills -- point pools and caps by campaign power level.

export const PROFESSIONAL_SKILL_POINTS = { Normal: 250, Heroic: 325, Epic: 400, Superhuman: 500 };
export const PROFESSIONAL_SKILL_CAP = { Normal: 75, Heroic: 90, Epic: 101, Superhuman: Infinity };
export const PERSONAL_SKILL_CAP = { Normal: 50, Heroic: 75, Epic: 90, Superhuman: 100 };

export const EDU_SKILL_POINT_MULTIPLIER = { Normal: 20, Heroic: 25, Epic: 30, Superhuman: 40 };
export const PERSONAL_SKILL_POINT_MULTIPLIER = { Normal: 10, Heroic: 10, Epic: 10, Superhuman: 10 };
export const INCREASED_PERSONAL_SKILL_POINT_MULTIPLIER = { Normal: 10, Heroic: 15, Epic: 20, Superhuman: 25 };

/** Professional skill point pool, before age/EDU modifiers. */
export function professionalSkillPointPool(campaignPowerLevel, { eduOption = false, edu = null } = {}) {
  if (eduOption && edu != null) {
    return edu * EDU_SKILL_POINT_MULTIPLIER[campaignPowerLevel];
  }
  return PROFESSIONAL_SKILL_POINTS[campaignPowerLevel];
}

/** Personal skill point pool: INT*10 normally, or INT*15/20/25 with the
 * Increased Personal Skill Points option (heroic+ only). */
export function personalSkillPointPool(int, campaignPowerLevel, { increasedOption = false } = {}) {
  const table = increasedOption ? INCREASED_PERSONAL_SKILL_POINT_MULTIPLIER : PERSONAL_SKILL_POINT_MULTIPLIER;
  return int * table[campaignPowerLevel];
}

export function professionalSkillCap(campaignPowerLevel) {
  return PROFESSIONAL_SKILL_CAP[campaignPowerLevel];
}

export function personalSkillCap(campaignPowerLevel) {
  return PERSONAL_SKILL_CAP[campaignPowerLevel];
}
