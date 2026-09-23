// Parses profession/personality skill reference strings like "Firearm (Rifle)",
// "Knowledge (Law)", "Art (any)", "Melee Weapon (any)" into a base skill name
// plus an optional specialty, and resolves "(any)" into a concrete specialty.
import { WEAPON_CLASSES, OPEN_SPECIALTY_SKILLS, findSkill } from "../data/skills.js";

const WILDCARD_RE = /^Any skill/i;

/** @returns {{base:string, specialty:string|null, wildcard?:boolean}} */
export function parseSkillRef(ref) {
  if (WILDCARD_RE.test(ref)) return { base: null, specialty: null, wildcard: true };
  const match = ref.match(/^(.+?)\s*\(([^)]+)\)\s*$/);
  if (!match) return { base: ref.trim(), specialty: null };
  const [, base, specialty] = match;
  return { base: base.trim(), specialty: specialty.trim() };
}

function specialtyPoolFor(base) {
  if (WEAPON_CLASSES[base]) return WEAPON_CLASSES[base];
  if (OPEN_SPECIALTY_SKILLS[base]) return OPEN_SPECIALTY_SKILLS[base];
  return null;
}

/** Resolve "any"/"various" specialties to a concrete choice; leaves specific
 * specialties (e.g. "Rifle", "Law") untouched. Returns the display name to
 * use for this skill instance, e.g. "Melee Weapon (Sword)". */
export function resolveSkillDisplayName(ref, rng = Math.random) {
  const { base, specialty, wildcard } = parseSkillRef(ref);
  if (wildcard) return null; // caller must special-case wildcard "any skill" refs
  const skillDef = findSkill(base);
  if (!skillDef) return ref; // unknown skill name, pass through as-is

  if (!skillDef.specialty) return base; // no specialty system for this skill

  const isOpenChoice = specialty == null || /^any$/i.test(specialty) || /^various$/i.test(specialty);
  if (!isOpenChoice) return `${base} (${specialty})`;

  const pool = specialtyPoolFor(skillDef.specialtyKey ?? base);
  if (!pool || pool.length === 0) return base;
  const pick = pool[Math.floor(rng() * pool.length)];
  return `${base} (${pick})`;
}

export function baseSkillName(displayName) {
  return parseSkillRef(displayName).base ?? displayName;
}
