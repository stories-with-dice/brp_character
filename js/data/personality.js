// Step Six: Personality (Optional). Four packages, each granting +20 to 13 skills.

export const PERSONALITY_TYPES = [
  {
    id: 1,
    name: "Brutal",
    description: "Your character thinks first of solving problems by means of physical force and brawn.",
    skills: ["Brawl", "Climb", "Dodge", "Grapple", "Insight", "Jump", "Ride", "Sense", "Stealth", "Swim", "Throw"],
    combatChoices: 2,
  },
  {
    id: 2,
    name: "Skilled",
    description: "Your character believes that technique, craft, and expertise are the secrets of success.",
    skills: ["Appraise", "Disguise", "Dodge", "Fine Manipulation", "First Aid", "Navigate", "Pilot", "Ride", "Sleight of Hand", "Stealth"],
    craftChoices: 1,
    knowledgeChoices: 1,
    combatChoices: 1,
  },
  {
    id: 3,
    name: "Cunning",
    description: "Your character first tries to outsmart an opponent to gain an advantage.",
    skills: ["Appraise", "Bargain", "Disguise", "Insight", "Listen", "Research", "Sense", "Spot", "Stealth"],
    knowledgeChoices: 2,
    technicalChoices: 1,
    combatChoices: 1,
  },
  {
    id: 4,
    name: "Charming",
    description: "Your character enjoys persuading other people to work, while they make the decisions.",
    skills: ["Appraise", "Bargain", "Command", "Etiquette", "Fast Talk", "Insight", "Perform", "Persuade", "Sense", "Status"],
    languageChoices: 1,
    combatChoices: 1,
  },
];

export const PERSONALITY_BONUS = 20;
export const PERSONALITY_SKILL_COUNT = 13;

export function findPersonalityType(id) {
  return PERSONALITY_TYPES.find((p) => p.id === id);
}
