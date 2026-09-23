// Packages already-resolved character pieces (characteristics, skills,
// profession, personality, powers, ...) into the final character object
// shape that js/ui/render.js and js/ui/export.js expect. Both the one-click
// random generator (characterFactory.js) and the manual step-by-step wizard
// build their pieces differently, but both hand them to this single, pure
// function so the two paths can never produce divergent output shapes.
import { characteristicRolls } from "./characteristics.js";

/**
 * @param {object} parts
 * @param {string} [parts.name] @param {string} [parts.gender] @param {number} parts.age
 * @param {string} parts.professionName @param {string} parts.professionDescription
 * @param {string} [parts.special] @param {string} parts.wealth
 * @param {object} parts.characteristics
 * @param {object} parts.derived
 * @param {Record<string, object>} parts.skills
 * @param {{name:string, description:string, skills:string[]}|null} [parts.personality]
 * @param {{category:string, description:string}[]} [parts.distinctiveFeatures]
 * @param {{powerPoints:number, sets:object[]}|null} [parts.powers]
 * @param {number} parts.professionalSkillPointPool @param {number} parts.personalSkillPointPool
 * @param {object} parts.options
 * @param {string} [parts.description] @param {string} [parts.background] @param {string} [parts.possessionsNotes]
 */
export function assembleCharacter(parts) {
  return {
    name: parts.name || "",
    gender: parts.gender || "",
    age: parts.age,
    profession: parts.professionName,
    professionDescription: parts.professionDescription,
    wealth: parts.wealth,
    special: parts.special ?? null,
    characteristics: parts.characteristics,
    characteristicRolls: characteristicRolls(parts.characteristics),
    derived: parts.derived,
    skills: parts.skills,
    personality: parts.personality ?? null,
    distinctiveFeatures: parts.distinctiveFeatures ?? [],
    powers: parts.powers ?? null,
    professionalSkillPointPool: parts.professionalSkillPointPool,
    personalSkillPointPool: parts.personalSkillPointPool,
    description: parts.description || "",
    background: parts.background || "",
    possessionsNotes: parts.possessionsNotes || "",
    options: parts.options,
  };
}
