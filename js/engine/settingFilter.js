// The campaign setting filter: which skills and professions fit a setting.
// `era` is the setting's era (settings.js ERAS index), or null for "Any": then
// everything fits. A skill fits when its era is not later than the setting's
// (SPECIALTY_ERAS and the skills' `era` in skills.js).
//
// When a profession lists a skill that does not fit, the book says (core
// p.22, "Settings and Skills"): "substitute a different specialty if that
// makes it work, and if no other specialty is appropriate, choose another
// skill within the same category." substituteSkill() does that at random;
// substituteOptions() lists the choices for the wizard.
import { SKILLS, SPECIALTY_ERAS, findSkill } from "../data/skills.js";
import { findSetting, PROFESSION_MIN_ERA } from "../data/settings.js";
import { PROFESSIONS } from "../data/professions.js";
import { parseSkillRef, specialtyOptionsFor, canonicalSpecialty } from "./skillRef.js";

/** The era of a setting id ("high-medieval" -> 2), or null for "any"/unknown. */
export function settingEra(settingId) {
  return findSetting(settingId).era ?? null;
}

/** The earliest era of a skill display name: "Firearm (Revolver)" -> 4, "Dodge" -> 0. */
export function skillEra(name) {
  const { base, specialty } = parseSkillRef(name);
  const def = findSkill(base);
  let era = def?.era ?? 0;
  if (specialty && /^(any|various)$/i.test(specialty)) return Math.max(era, minSpecialtyEra(base));
  if (specialty) era = Math.max(era, SPECIALTY_ERAS[base]?.[canonicalSpecialty(base, specialty)] ?? 0);
  else if (def?.specialty) era = Math.max(era, minSpecialtyEra(base));
  return era;
}

// The era of a skill's earliest specialty: "Energy Weapon" -> 7.
function minSpecialtyEra(base) {
  const options = specialtyOptionsFor(base) ?? [];
  if (!options.length) return 0;
  return Math.min(...options.map((o) => SPECIALTY_ERAS[base]?.[o] ?? 0));
}

/** True when a skill (display name or profession ref) fits the era. */
export function skillFits(name, era) {
  return era == null || skillEra(name) <= era;
}

/** The specialties of a base skill that fit the era, e.g. Firearm in era 3 -> Pistol, Rifle, Shotgun. */
export function fittingSpecialties(base, era) {
  return specialtyOptionsFor(base, era) ?? [];
}

/** The professions that fit a setting id, in PROFESSIONS order. */
export function professionsForSetting(settingId) {
  const setting = findSetting(settingId);
  return PROFESSIONS.filter((p) => {
    const rule = setting.professions;
    if (rule?.only && !rule.only.includes(p.name)) return false;
    if (rule?.except && rule.except.includes(p.name)) return false;
    return setting.era == null || (PROFESSION_MIN_ERA[p.name] ?? 0) <= setting.era;
  });
}

/**
 * The skills that can replace `name` in the era, in the book's order of
 * preference: other specialties of the same skill, else the other skills of
 * the same category (specialty skills with each fitting specialty). Names in
 * `taken` are left out. Empty when `name` already fits.
 * Example: "Firearm (Rifle)" in era 2 -> ["Artillery (Ballista)", "Artillery (Trebuchet)", "Brawl", ...].
 */
export function substituteOptions(name, era, taken = new Set()) {
  if (skillFits(name, era)) return [];
  const { base } = parseSkillRef(name);
  const sameBase = fittingSpecialties(base, era).map((s) => `${base} (${s})`).filter((n) => !taken.has(n));
  if (sameBase.length) return sameBase;
  const category = findSkill(base)?.category;
  const out = [];
  for (const skill of SKILLS) {
    if (skill.category !== category || skill.name === base || skill.optionOnly) continue;
    if (skill.specialty) {
      for (const s of fittingSpecialties(skill.name, era)) out.push(`${skill.name} (${s})`);
    } else if (skillFits(skill.name, era)) {
      out.push(skill.name);
    }
  }
  return out.filter((n) => !taken.has(n));
}

/** `name` when it fits the era, else a random substitute (substituteOptions), or `name` when there is none. */
export function substituteSkill(name, era, rng = Math.random, taken = new Set()) {
  const options = substituteOptions(name, era, taken);
  if (!options.length) return name;
  return options[Math.floor(rng() * options.length)];
}
