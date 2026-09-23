import { PROFESSIONS, findProfession } from "../data/professions.js";
import { CHARACTERISTICS, GENERATION_METHODS, characteristicRolls } from "./characteristics.js";
import { generateCharacteristics } from "./characteristicsRandom.js";
import { computeDerived } from "./derived.js";
import { rollStartingAge, ageModifiers, DEFAULT_MIN_AGE } from "./age.js";
import { resolveProfessionSkills, allocatePointsRandomly } from "./professionSkills.js";
import { baselineSkillEntries, ensureSkillEntry, currentTotalBeforePoints, skillTotal } from "./skillSheet.js";
import { professionalSkillPointPool, personalSkillPointPool, professionalSkillCap, personalSkillCap } from "./skillPoints.js";
import { rollPersonalityType, resolvePersonalitySkills, PERSONALITY_BONUS } from "./personalityEngine.js";
import { generateDistinctiveFeatures } from "./distinctiveFeaturesEngine.js";
import { buildPowersBlock } from "./powersEngine.js";
import { pickWealthLevel } from "./wealth.js";
import { SKILLS } from "../data/skills.js";
import { resolveSkillDisplayName } from "./skillRef.js";
import { roll2d6plus6 } from "./dice.js";

/** @typedef {object} GenerationOptions
 * @property {'Normal'|'Heroic'|'Epic'|'Superhuman'} campaignPowerLevel
 * @property {'standard'|'chooseRolls'|'higherStart'|'pointBuy'} characteristicMethod
 * @property {boolean} useEDU
 * @property {boolean} useCategoryBonus
 * @property {'full'|'simple'} categoryBonusMethod
 * @property {boolean} usePersonality
 * @property {boolean} useDistinctiveFeatures
 * @property {boolean} useFatigue
 * @property {boolean} useSanity
 * @property {boolean} useHitLocation
 * @property {boolean} useTotalHitPoints
 * @property {boolean} useIncreasedPersonalPoints
 * @property {boolean} useAgeModifiers
 * @property {boolean} usePowers
 * @property {string|null} profession profession name, or null to pick randomly
 * @property {number|null} age fixed age, or null to roll 17+1D6
 * @property {string} name
 * @property {string} gender
 */

export function defaultOptions() {
  return {
    campaignPowerLevel: "Normal",
    characteristicMethod: GENERATION_METHODS.STANDARD,
    useEDU: false,
    useCategoryBonus: false,
    categoryBonusMethod: "full",
    usePersonality: true,
    useDistinctiveFeatures: false,
    useFatigue: false,
    useSanity: false,
    useHitLocation: false,
    useTotalHitPoints: false,
    useIncreasedPersonalPoints: false,
    useAgeModifiers: true,
    usePowers: false,
    profession: null,
    age: null,
    name: "",
    gender: "",
  };
}

function extraPersonalSkillSlots(rng, exclude) {
  const pool = SKILLS.filter((s) => !exclude.has(s.name));
  const count = 5 + Math.floor(rng() * 6); // 5..10
  const names = [];
  const working = [...pool];
  for (let i = 0; i < count && working.length > 0; i++) {
    const idx = Math.floor(rng() * working.length);
    const skillDef = working.splice(idx, 1)[0];
    const ref = skillDef.specialty ? `${skillDef.name} (any)` : skillDef.name;
    const display = resolveSkillDisplayName(ref, rng);
    if (display) names.push(display);
  }
  return names;
}

/** Generate a complete random character, honoring every optional-rule toggle
 * in `options`. This is the "randomly generate a character from the
 * professions" entry point. */
export function generateRandomCharacter(userOptions = {}, rng = Math.random) {
  const options = { ...defaultOptions(), ...userOptions };
  const level = options.campaignPowerLevel;

  // Step One / Four: Characteristics
  let chars = generateCharacteristics(options.characteristicMethod, rng, level);
  if (options.useEDU) chars.EDU = roll2d6plus6(rng);

  // Step Two: Powers (groundwork) -- resolved after characteristics since it
  // needs POW; applied after derived stats are computed below.

  // Step Three: Age & Experience
  let age = options.age ?? rollStartingAge(rng);
  if (options.useEDU && age < chars.EDU + 5) age = chars.EDU + 5;
  let skillPointModifier = 0;
  if (options.useAgeModifiers) {
    const mods = ageModifiers(age, level, { minAge: DEFAULT_MIN_AGE });
    skillPointModifier = mods.skillPointModifier;
    const pool = ["STR", "CON", "DEX", "CHA"];
    for (let i = 0; i < mods.characteristicPenalties; i++) {
      const key = pool[Math.floor(rng() * pool.length)];
      chars[key] = Math.max(1, chars[key] - 1);
    }
    for (let i = 0; i < mods.youngCharacteristicPenalty; i++) {
      const eligible = CHARACTERISTICS.filter((c) => c !== "EDU");
      const key = eligible[Math.floor(rng() * eligible.length)];
      chars[key] = Math.max(1, chars[key] - 1);
    }
  }

  // Step Five: Derived Characteristics
  const derived = computeDerived(chars, {
    totalHitPointsOption: options.useTotalHitPoints,
    fatigueOption: options.useFatigue,
    sanityOption: options.useSanity,
    hitLocationOption: options.useHitLocation,
  });

  const powers = options.usePowers ? buildPowersBlock(level, derived.powerPoints, rng) : null;

  // Step Seven: Profession (skill list only, points spent after personality)
  const professionName = options.profession ?? PROFESSIONS[Math.floor(rng() * PROFESSIONS.length)].name;
  const profession = findProfession(professionName);
  if (!profession) throw new Error(`Unknown profession: ${professionName}`);
  const professionSkillNames = resolveProfessionSkills(profession, rng);

  const skillOptions = { useCategoryBonus: options.useCategoryBonus, categoryBonusMethod: options.categoryBonusMethod, usePowers: options.usePowers };
  const entries = baselineSkillEntries(chars, skillOptions);
  for (const name of professionSkillNames) ensureSkillEntry(entries, name, chars, skillOptions);

  // Step Six: Personality (Optional) -- applied before profession points so
  // its bonus counts toward the "no skill begins higher than cap%" check.
  let personality = null;
  if (options.usePersonality) {
    const type = rollPersonalityType(rng);
    const personalitySkillNames = resolvePersonalitySkills(type, rng);
    for (const name of personalitySkillNames) {
      const entry = ensureSkillEntry(entries, name, chars, skillOptions);
      entry.personalityBonus += PERSONALITY_BONUS;
    }
    personality = { name: type.name, description: type.description, skills: personalitySkillNames };
  }

  // Step Seven: spend professional skill points
  const professionalPool = Math.max(0, professionalSkillPointPool(level, { eduOption: options.useEDU, edu: chars.EDU }) + skillPointModifier);
  const professionalCap = professionalSkillCap(level);
  const professionalSlots = professionSkillNames.map((name) => ({
    key: name,
    headroom: Math.max(0, professionalCap - currentTotalBeforePoints(entries[name])),
  }));
  const professionalAllocation = allocatePointsRandomly(professionalPool, professionalSlots, rng);
  for (const [key, pts] of Object.entries(professionalAllocation)) entries[key].professionalPoints += pts;

  // Personal skill point pool (INT x 10, or increased option)
  const personalPool = personalSkillPointPool(chars.INT, level, { increasedOption: options.useIncreasedPersonalPoints });
  const personalCap = personalSkillCap(level);
  const alreadyNamed = new Set(Object.keys(entries));
  const extraNames = extraPersonalSkillSlots(rng, alreadyNamed);
  for (const name of extraNames) ensureSkillEntry(entries, name, chars, skillOptions);
  const personalCandidateKeys = [...new Set([...professionSkillNames, ...(personality?.skills ?? []), ...extraNames])];
  const personalSlots = personalCandidateKeys.map((name) => ({
    key: name,
    headroom: Math.max(0, personalCap - skillTotal(entries[name])),
  }));
  const personalAllocation = allocatePointsRandomly(personalPool, personalSlots, rng);
  for (const [key, pts] of Object.entries(personalAllocation)) entries[key].personalPoints += pts;

  // Step Nine (Option): Distinctive Features
  const distinctiveFeatures = options.useDistinctiveFeatures ? generateDistinctiveFeatures(chars.CHA, rng) : [];

  const wealth = pickWealthLevel(profession.wealth, rng);

  return {
    name: options.name || "",
    gender: options.gender || "",
    age,
    profession: profession.name,
    professionDescription: profession.description,
    wealth,
    special: profession.special ?? null,
    characteristics: chars,
    characteristicRolls: characteristicRolls(chars),
    derived,
    skills: entries,
    personality,
    distinctiveFeatures,
    powers,
    professionalSkillPointPool: professionalPool,
    personalSkillPointPool: personalPool,
    options,
  };
}
