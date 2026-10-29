// Parses profession/personality skill reference strings like "Firearm (Rifle)",
// "Knowledge (Law)", "Art (any)", "Melee Weapon (any)" into a base skill name
// plus an optional specialty, and resolves "(any)" into a concrete specialty.
import { WEAPON_CLASSES, OPEN_SPECIALTY_SKILLS, SPECIALTY_ALIASES, SPECIALTY_ERAS, findSkill } from "../data/skills.js";

const WILDCARD_RE = /^Any skill/i;

/** @returns {{base:string, specialty:string|null, wildcard?:boolean}} */
export function parseSkillRef(ref) {
  if (WILDCARD_RE.test(ref)) return { base: null, specialty: null, wildcard: true };
  const match = ref.match(/^(.+?)\s*\(([^)]+)\)\s*$/);
  if (!match) return { base: ref.trim(), specialty: null };
  const [, base, specialty] = match;
  return { base: base.trim(), specialty: specialty.trim() };
}

/** The list of concrete specialty names offered for a base skill (weapon
 * class or open specialty list), or null if that skill has no specialty
 * system / isn't found. Used to populate specialty pickers in the UI.
 * With an `era` (the campaign setting's, settings.js ERAS), only the
 * specialties of that era or earlier (SPECIALTY_ERAS): Firearm in era 3 ->
 * Pistol, Rifle, Shotgun. */
export function specialtyOptionsFor(base, era = null) {
  const skillDef = findSkill(base);
  const key = skillDef?.specialtyKey ?? base;
  const options = WEAPON_CLASSES[key] ?? OPEN_SPECIALTY_SKILLS[key] ?? null;
  if (!options || era == null) return options;
  return options.filter((o) => (SPECIALTY_ERAS[base]?.[o] ?? 0) <= era);
}

/** The one spelling of a specialty the book writes two ways, e.g.
 * ("Technical Skill", "Computer Use") -> "Computers". Other specialties pass through. */
export function canonicalSpecialty(base, specialty) {
  return SPECIALTY_ALIASES[base]?.[specialty] ?? specialty;
}

function isOpenSpecialtyText(specialty) {
  return specialty == null || /^any$/i.test(specialty) || /^various$/i.test(specialty);
}

/** True if this ref needs a concrete specialty chosen before it can be added
 * to a character sheet (i.e. it says "(any)"/"(various)"/nothing but the
 * base skill has a specialty system with concrete options). */
export function refNeedsSpecialtyChoice(ref) {
  const { base, specialty, wildcard } = parseSkillRef(ref);
  if (wildcard) return false;
  const skillDef = findSkill(base);
  if (!skillDef?.specialty) return false;
  if (!isOpenSpecialtyText(specialty)) return false;
  const options = specialtyOptionsFor(base);
  return Boolean(options && options.length > 0);
}

/** Resolve "any"/"various" specialties to a concrete choice; leaves specific
 * specialties (e.g. "Rifle", "Law") untouched. Returns the display name to
 * use for this skill instance, e.g. "Melee Weapon (Sword)". */
export function resolveSkillDisplayName(ref, rng = Math.random, era = null) {
  const { base, specialty, wildcard } = parseSkillRef(ref);
  if (wildcard) return null; // caller must special-case wildcard "any skill" refs
  const skillDef = findSkill(base);
  if (!skillDef) return ref; // unknown skill name, pass through as-is

  if (!skillDef.specialty) return base; // no specialty system for this skill

  if (!isOpenSpecialtyText(specialty)) return `${base} (${canonicalSpecialty(base, specialty)})`;

  // Prefer a specialty of the setting's era; with none, any (the caller substitutes it).
  const fitting = specialtyOptionsFor(base, era);
  const pool = fitting?.length ? fitting : specialtyOptionsFor(base);
  if (!pool || pool.length === 0) return base;
  const pick = pool[Math.floor(rng() * pool.length)];
  return `${base} (${pick})`;
}

/** Manually resolve a ref given an explicit specialty choice (from a UI
 * picker), instead of rolling one. `chosenSpecialty` is ignored for refs
 * that already have a concrete specialty or no specialty system. */
export function resolveSkillDisplayNameManual(ref, chosenSpecialty) {
  const { base, specialty, wildcard } = parseSkillRef(ref);
  if (wildcard) return null;
  const skillDef = findSkill(base);
  if (!skillDef) return ref;
  if (!skillDef.specialty) return base;
  if (!isOpenSpecialtyText(specialty)) return `${base} (${canonicalSpecialty(base, specialty)})`;
  if (!chosenSpecialty) return null; // caller must supply a choice for open specialties
  return `${base} (${canonicalSpecialty(base, chosenSpecialty)})`;
}

export function baseSkillName(displayName) {
  return parseSkillRef(displayName).base ?? displayName;
}
