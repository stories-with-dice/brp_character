// Chapter 4: Powers -- power sets, power levels, and the starting catalogs
// for each power set (magic spells, mutations, psychic abilities, sorcery
// spells, superpowers), with the starting-power rules per power level.
// Page numbers refer to Basic Roleplaying - Universal Game Engine v1.02.

export const POWER_LEVELS = ["Normal", "Heroic", "Epic", "Superhuman"];

/** How many power sets (and at what level) a character may begin with,
 * given the campaign's power level. Each option is an array of
 * {level, count} entries describing sets to pick. */
export const POWER_SETS_BY_LEVEL = {
  Normal: [[{ level: "Normal", count: 1 }]],
  Heroic: [
    [{ level: "Heroic", count: 1 }],
    [{ level: "Normal", count: 2 }],
  ],
  Epic: [
    [{ level: "Epic", count: 1 }],
    [{ level: "Heroic", count: 1 }, { level: "Normal", count: 1 }],
    [{ level: "Normal", count: 3 }],
  ],
  Superhuman: [
    [{ level: "Superhuman", count: 1 }],
    [{ level: "Epic", count: 1 }, { level: "Normal", count: 1 }],
    [{ level: "Heroic", count: 1 }, { level: "Normal", count: 2 }],
    [{ level: "Heroic", count: 2 }],
    [{ level: "Normal", count: 4 }],
  ],
};

/** @type {{id:string, name:string, description:string, resistance:string, minPOW?:number}[]} */
export const POWER_TYPES = [
  {
    id: "magic",
    name: "Magic",
    description: "Spells cast like skills, using percentile rolls to determine success. A magician usually has a small number of spells used frequently.",
    resistance: "POW",
  },
  {
    id: "mutation",
    name: "Mutations",
    description: "Modifications or special abilities that accentuate or expand capabilities beyond human norms. Not all mutations are beneficial.",
    resistance: "CON",
  },
  {
    id: "psychic",
    name: "Psychic Abilities",
    description: "Strange powers of the mind, resolved as resistance rolls using INT or POW versus an opposing characteristic.",
    resistance: "INT/POW",
  },
  {
    id: "sorcery",
    name: "Sorcery",
    description: "Short magical incantations that cause a supernatural effect automatically, except when successfully resisted. A sorcerer can change memorized spells day to day.",
    resistance: "POW",
    minPOW: 16, // "To be able to cast sorcery spells, a sorcerer must have POW 16+" (p. 78)
  },
  {
    id: "superpowers",
    name: "Superpowers",
    description: "Expansions of existing skills, new abilities, or ways to exceed natural limits. Often resolved with resistance rolls, though some are automatic.",
    resistance: "varies",
  },
];

export function findPowerType(id) {
  return POWER_TYPES.find((p) => p.id === id);
}

export function powerSetOptionsFor(campaignPowerLevel) {
  return POWER_SETS_BY_LEVEL[campaignPowerLevel] ?? POWER_SETS_BY_LEVEL.Normal;
}

// ---------------------------------------------------------------- Magic (p. 58-59)

/** Number of starting spells, each at INT×1 (p. 58). */
export const STARTING_MAGIC_SPELLS = { Normal: 4, Heroic: 6, Epic: 8, Superhuman: 10 };

/** Extras a magician begins with, by power level (p. 58). The Epic familiar
 * is "if desired"; it is listed here and the player can ignore it. */
export const STARTING_MAGIC_EXTRAS = {
  Normal: [],
  Heroic: [],
  Epic: ["Familiar (optional)"],
  Superhuman: ["Wizard's staff (already constructed)", "Familiar"],
};

/** Magic Spell Summary (p. 59). `cost` is the power point cost per level. */
export const MAGIC_SPELLS = [
  { name: "Blast", cost: 3, summary: "Ranged, does 1D6 points of magical damage per level." },
  { name: "Change", cost: 1, summary: "Transforms 3 SIZ points of an item or being per level." },
  { name: "Conjure Elemental", cost: 1, summary: "Summons or dismisses an elemental of a specific type." },
  { name: "Control", cost: 3, summary: "Allows control over a target's mind, requires a resistance roll." },
  { name: "Countermagic", cost: 1, summary: "Reflects incoming spells back at the magician." },
  { name: "Dark", cost: 1, summary: "Fills an area with darkness." },
  { name: "Diminish", cost: 1, summary: "Reduces one of the target's characteristics by 1 per level." },
  { name: "Dispel", cost: 1, summary: "Eliminates existing spell effects, may banish supernatural beings." },
  { name: "Dull", cost: 1, summary: "Reduces a weapon's attack chance and damage." },
  { name: "Enhance", cost: 1, summary: "Increases one of the target's characteristics by 1 per level." },
  { name: "Fire", cost: 3, summary: "Ranged, does 1D6 points of fire damage per level." },
  { name: "Frost", cost: 3, summary: "Ranged, does 1D6 points of frost damage per level." },
  { name: "Heal", cost: 3, summary: "Heals 1D6 points of damage per level." },
  { name: "Illusion", cost: 1, summary: "Creates 3 SIZ points of an illusion per level." },
  { name: "Invisibility", cost: 1, summary: "Each level makes 3 SIZ points of an object or person invisible." },
  { name: "Lift", cost: 1, summary: "Lifts 3 SIZ points of an object or person per level." },
  { name: "Light", cost: 1, summary: "Fills an area with light." },
  { name: "Lightning", cost: 3, summary: "Ranged, does 1D6 points of lightning damage per level." },
  { name: "Perception", cost: 1, summary: "Allows the magician to detect one thing within range." },
  { name: "Protection", cost: 1, summary: "Adds 1 point of armor value per level against physical attacks." },
  { name: "Resistance", cost: 1, summary: "Reduces damage from heat and/or cold by 1 point per level." },
  { name: "Seal", cost: 1, summary: "Joins two inanimate objects together." },
  { name: "Sharpen", cost: 1, summary: "Increases a weapon's attack chance and damage." },
  { name: "Speak to Mind", cost: 1, summary: "Allows mental communication between the magician and a target." },
  { name: "Teleport", cost: 1, summary: "Teleports 3 SIZ points per level anywhere within range." },
  { name: "Unseal", cost: 1, summary: "Separates two connected objects." },
  { name: "Vision", cost: 1, summary: "Allows the magician to see what is happening elsewhere, or in the past." },
  { name: "Wall", cost: 1, summary: "Creates a barrier to protect your character." },
  { name: "Ward", cost: 1, summary: "Defines an area protected by Blast and Countermagic." },
  { name: "Wounding", cost: 3, summary: "Causes 1D6 points of damage per level." },
];

// ---------------------------------------------------------------- Mutations (p. 65-70)

/** Random Mutations table (p. 66). `adverse` follows each mutation's own
 * description (Allergy is "(Adverse)" in its description although the table
 * has no asterisk). `minorOnly` mutations have no major version. A roll of
 * 91-00 is "Gamemaster or Player Choice: pick or roll again". */
export const MUTATIONS = [
  { min: 1, max: 3, name: "Adaptability", summary: "Survival in unusual environments." },
  { min: 4, max: 5, name: "Allergy", adverse: true, summary: "Skills reduced by contact to an allergen." },
  { min: 6, max: 9, name: "Biped (Quadruped)", adverse: true, summary: "If two-legged, forced to walk four-legged." },
  { min: 10, max: 12, name: "Camouflage", summary: "Skin has a concealing texture or color." },
  { min: 13, max: 15, name: "Coloration", minorOnly: true, summary: "Unusual coloration (minor only)." },
  { min: 16, max: 19, name: "Congenital Disease", adverse: true, summary: "Suffers from a debilitating disease." },
  { min: 20, max: 22, name: "Decreased Characteristic", adverse: true, summary: "Characteristic decreased." },
  { min: 23, max: 25, name: "Disease Carrier", adverse: true, summary: "Carries (but is immune to) an infectious disease." },
  { min: 26, max: 29, name: "Group Intelligence", summary: "Part of a hive mind." },
  { min: 30, max: 30, name: "Hands", summary: "Has extra hands or prehensile limb." },
  { min: 31, max: 33, name: "Hardy", summary: "Resistant to damage." },
  { min: 34, max: 35, name: "Hybrid", summary: "Has an animalistic trait." },
  { min: 36, max: 37, name: "Imitation", summary: "Imitates an animal's natural trait." },
  { min: 38, max: 44, name: "Increased Characteristic", summary: "Characteristic increased." },
  { min: 45, max: 48, name: "Keen Sense", summary: "Has one or more sharp senses." },
  { min: 49, max: 50, name: "Luminescence", summary: "Emits a light from body." },
  { min: 51, max: 53, name: "Metabolic Improvement", summary: "Has a beneficial but unusual metabolism." },
  { min: 54, max: 57, name: "Metabolic Weakness", adverse: true, summary: "Has a disadvantageous and unusual metabolism." },
  { min: 58, max: 60, name: "Natural Armor", summary: "Has natural armor (scales, horn, hide, etc.)." },
  { min: 61, max: 65, name: "Natural Weaponry", summary: "Has natural weapon (spine, claw, teeth, etc.)." },
  { min: 66, max: 67, name: "Pain Sensitivity", adverse: true, summary: "Low resistance to pain." },
  { min: 68, max: 68, name: "Pheromone", summary: "Emits chemicals that can affect others." },
  { min: 69, max: 70, name: "Reduced Sense", adverse: true, summary: "Impaired or missing primary sense." },
  { min: 71, max: 72, name: "Regeneration", summary: "Able to heal rapidly." },
  { min: 73, max: 74, name: "Sensitivity", summary: "Has an unusual affinity for a substance." },
  { min: 75, max: 76, name: "Speech (Mimicry)", summary: "Can imitate animal noises or speak clearly." },
  { min: 77, max: 81, name: "Structural Improvement", summary: "Has an unusual and beneficial body form." },
  { min: 82, max: 86, name: "Structural Weakness", adverse: true, summary: "Has an unusual and disadvantageous body form." },
  { min: 87, max: 89, name: "Venom", summary: "Emits a natural poison." },
  { min: 90, max: 90, name: "Wings", summary: "Has wings and can glide or fly." },
];

export function findMutation(name) {
  return MUTATIONS.find((m) => m.name === name);
}

/** Look up a D100 roll (1-100) on the Random Mutations table. Returns null
 * for 91-00 ("pick or roll again"). */
export function mutationForRoll(roll) {
  return MUTATIONS.find((m) => roll >= m.min && roll <= m.max) ?? null;
}

// ---------------------------------------------------------------- Psychic abilities (p. 71)

/** Number of starting psychic abilities, each at POW×1 (p. 71). */
export const STARTING_PSYCHIC_ABILITIES = { Normal: 2, Heroic: 4, Epic: 6, Superhuman: 10 };

/** Psychic Abilities Summary (p. 71). */
export const PSYCHIC_ABILITIES = [
  { name: "Astral Projection", summary: "Leave physical body and travel in psychic form." },
  { name: "Aura Detection", summary: "Perceive the aura emanated by a living being." },
  { name: "Clairvoyance", summary: "Project awareness into another place." },
  { name: "Cryokinesis", summary: "Create an area of intense cold on an area, object, or target." },
  { name: "Danger Sense", summary: "Detect danger from other characters or situations." },
  { name: "Dead Calm", summary: "Resist mental shock or delay the effects of sanity loss." },
  { name: "Divination", summary: "Ask a higher power for guidance and insight." },
  { name: "Eidetic Memory", summary: "Perfect and total recall of previous experiences." },
  { name: "Emotion Control", summary: "Affect the emotional state of a target or targets." },
  { name: "Empathy", summary: "Detect the inner feelings of a target or targets." },
  { name: "Intuition", summary: "Detect a certain person or class of item." },
  { name: "Levitation", summary: "Floating movement above the ground." },
  { name: "Mind Blast", summary: "A psychic attack against a target." },
  { name: "Mind Control", summary: "Controlling the physical body and will of a target." },
  { name: "Mind Shield", summary: "A protection against psychic interference and attacks." },
  { name: "Precognition", summary: "A brief glimpse into the future." },
  { name: "Psychometry", summary: "'Read' past emotions associated with an object or place." },
  { name: "Pyrokinesis", summary: "Heat an area, object, or target to extreme temperatures." },
  { name: "Sensitivity", summary: "Detect psychic emanations or supernatural beings in an area." },
  { name: "Telekinesis", summary: "Manipulate and move objects mentally." },
  { name: "Telepathy", summary: "Read minds or speak mind-to-mind with a target." },
];

// ---------------------------------------------------------------- Sorcery (p. 78, 83)

/** Sorcery Spell Summary (p. 83). Spell levels range from `min` to `max`;
 * a spell's level is also its power point cost. */
export const SORCERY_SPELLS = [
  { name: "Cloak of Night", category: "Augmentation", min: 1, max: 4, summary: "Adds +20% per level to Hide." },
  { name: "Leap", category: "Augmentation", min: 1, max: 4, summary: "Adds +20% per level to Jump." },
  { name: "Sureness", category: "Augmentation", min: 1, max: 4, summary: "Adds +20% per level to Stealth." },
  { name: "Bolster the Soul", category: "Characteristic", min: 1, max: 3, summary: "Adds 3 points per level to POW." },
  { name: "Inhuman Plasticity", category: "Characteristic", min: 1, max: 3, summary: "Adds 3 points per level to SIZ." },
  { name: "Lightning Speed", category: "Characteristic", min: 1, max: 3, summary: "Adds 1 point per level to MOV." },
  { name: "Relentless Vitality", category: "Characteristic", min: 1, max: 3, summary: "Adds 3 points per level to CON." },
  { name: "Suppleness of the Serpent", category: "Characteristic", min: 1, max: 3, summary: "Adds 3 points per level to DEX." },
  { name: "Titan's Strength", category: "Characteristic", min: 1, max: 3, summary: "Adds 3 points per level to STR." },
  { name: "Unearthly Beauty", category: "Characteristic", min: 1, max: 3, summary: "Adds 3 points per level to CHA." },
  { name: "Wisdom of the Sage", category: "Characteristic", min: 1, max: 3, summary: "Adds 3 points per level to INT." },
  { name: "Hammer of the Gods", category: "Combat", min: 1, max: 4, summary: "Adds 1 point damage per level to blunt weapons." },
  { name: "Hell's Razor", category: "Combat", min: 1, max: 4, summary: "Adds 1 point damage per level to cutting weapons." },
  { name: "Sorcery's Sharp Flame", category: "Combat", min: 1, max: 4, summary: "Adds 1 point damage per level to impaling weapons." },
  { name: "Sorcerous Armor", category: "Combat", min: 1, max: 4, summary: "Adds 1 point of armor per level." },
  { name: "Talons of the Beast", category: "Combat", min: 1, max: 4, summary: "Adds 1 point damage per level to unarmed or brawling weapons." },
  { name: "Unbreakable Bulwark", category: "Combat", min: 1, max: 4, summary: "Adds 1 point of armor per level to shields." },
  { name: "Make Fast", category: "Enhancement", min: 1, max: 1, summary: "Glues together two inanimate objects." },
  { name: "Make Whole", category: "Enhancement", min: 3, max: 3, summary: "Repairs a broken item." },
  { name: "Midnight", category: "Enhancement", min: 1, max: 1, summary: "Creates an area of darkness." },
  { name: "Moonrise", category: "Enhancement", min: 1, max: 1, summary: "Creates a floating globe of light." },
  { name: "Bounty of the Sea", category: "Elemental", min: 4, max: 4, summary: "Fills an area with water." },
  { name: "Fires of the Sun", category: "Elemental", min: 4, max: 4, summary: "Fills an area with flame." },
  { name: "Gift of the Earth", category: "Elemental", min: 4, max: 4, summary: "Fills an area with dirt." },
  { name: "Wings of the Sky", category: "Elemental", min: 4, max: 4, summary: "Fills an area with wind." },
  { name: "Curse of Sorcery", category: "Manipulative", min: 4, max: 4, summary: "Causes target to suffer a disfiguring feature." },
  { name: "Fury", category: "Manipulative", min: 1, max: 1, summary: "Enrages target, speeding their attacks." },
  { name: "Inescapable Bonds", category: "Manipulative", min: 3, max: 3, summary: "Immobilizes target, requires a resistance roll." },
  { name: "Liken Shape", category: "Manipulative", min: 4, max: 4, summary: "Assume the image of another person." },
  { name: "Muddle", category: "Manipulative", min: 1, max: 1, summary: "Disorients target." },
  { name: "Pox", category: "Manipulative", min: 1, max: 1, summary: "Reduces target's power points, requires a resistance roll." },
  { name: "Brazier of Power", category: "Occult", min: 4, max: 4, summary: "Creates a reservoir of power points." },
  { name: "Chain of Being", category: "Occult", min: 4, max: 4, summary: "Creates a pool of power points." },
  { name: "Undo Sorcery", category: "Occult", min: 1, max: 4, summary: "Cancels various sorcery spells." },
  { name: "Ward", category: "Occult", min: 3, max: 3, summary: "Creates a magical alarm." },
  { name: "Summon Demon", category: "Summoning", min: 1, max: 1, summary: "Summons a demon." },
  { name: "Summon Elemental", category: "Summoning", min: 1, max: 1, summary: "Summons an elemental." },
  { name: "Bird's Vision", category: "Utility", min: 1, max: 1, summary: "Controls a bird and sees through its eyes." },
  { name: "Breath of Life", category: "Utility", min: 1, max: 1, summary: "Provides breathable air underwater or elsewhere." },
  { name: "Farsight", category: "Utility", min: 1, max: 1, summary: "Doubles range at which something can be seen." },
  { name: "Heal", category: "Utility", min: 2, max: 2, summary: "Restores lost hit points." },
  { name: "Keen Ear", category: "Utility", min: 1, max: 1, summary: "Carries spoken words across great distances." },
  { name: "Refutation", category: "Utility", min: 1, max: 4, summary: "Protects against Undo Sorcery." },
  { name: "Vermin's Vision", category: "Utility", min: 1, max: 1, summary: "Controls vermin and sees through its eyes." },
  { name: "Witch Sight", category: "Utility", min: 3, max: 3, summary: "Determines target's POW." },
];

export function findSorcerySpell(name) {
  return SORCERY_SPELLS.find((s) => s.name === name);
}

/** Total levels of sorcery spells a starting sorcerer knows, by power level
 * (p. 78): Normal ½ INT (round up), Heroic INT, Epic INT×2, Superhuman INT×4. */
export function sorcerySpellLevelBudget(campaignPowerLevel, int) {
  switch (campaignPowerLevel) {
    case "Heroic": return int;
    case "Epic": return int * 2;
    case "Superhuman": return int * 4;
    default: return Math.ceil(int / 2);
  }
}

// ---------------------------------------------------------------- Superpowers (p. 90-110)

/** Energy Types (p. 95). */
export const ENERGY_TYPES = ["Cold", "Darkness", "Electric", "Gravity", "Heat", "Kinetic", "Light", "Magnetic", "Radiation", "Sound", "Wind"];
/** Adaptation environments (p. 95). */
export const ADAPTATION_ENVIRONMENTS = ["Cold", "Corrosive", "Heat", "High Gravity", "High Pressure", "Low Gravity", "Radiation", "Underwater", "Vacuum"];
/** Super Movement types (p. 104). */
export const SUPER_MOVEMENT_TYPES = ["Air Walking", "Irresistible", "Lightfoot", "Trackless", "Wall Walking", "Water Walking", "Zero-gravity"];
/** Super Sense types (p. 105). */
export const SUPER_SENSE_TYPES = ["Dark Vision", "Microscopic Vision", "Night Vision", "Sonar Detection", "Super Hearing", "Super Smell/Taste", "Super Touch", "Super Vision"];

/**
 * Superpower Summary (p. 94) with each power's Character Point Cost.
 * - `cost`: character points per level. `costPerSIZ: true` multiplies it by
 *   the character's SIZ (Force Field: "SIZ 14 must pay 14 points for Force
 *   Field 1").
 * - `variants`: the cost depends on a sub-choice (Drain, Resistance, ...).
 * - `specify`: the list the power is keyed to ("Armor (Heat)"). With
 *   `specifyPerLevel`, each level picks one more entry (Adaptation).
 * - `perLevelLabel`: what one "level" is called, when it is not a level.
 * Sidekick is left out: its cost is "Variable" and it is a full character.
 */
export const SUPERPOWERS = [
  { name: "Absorption", cost: 3, specify: ENERGY_TYPES, summary: "Absorb energy from an attack and turn it into power points." },
  { name: "Adaptation", cost: 3, specify: ADAPTATION_ENVIRONMENTS, specifyPerLevel: true, summary: "Each level allows survival in one hostile environment." },
  { name: "Alternate Form", cost: 20, perLevelLabel: "form", summary: "Each level is an alternate body to switch into." },
  { name: "Armor", cost: 1, specify: ENERGY_TYPES, summary: "Each level provides 1 point of protection against a specific energy type." },
  { name: "Barrier", cost: 3, summary: "Each level creates a 1-meter-square section of protective wall." },
  { name: "Defense", cost: 1, summary: "Lowers the chance to be hit by -1% per level." },
  { name: "Density Control", cost: 1, summary: "Each level adds or subtracts 1 point of density (SIZ)." },
  { name: "Diminish/Enhance Characteristic", cost: 5, summary: "Lowers or increases a characteristic by 1D6 per level." },
  {
    name: "Drain",
    variants: [{ name: "Hit Points", cost: 10 }, { name: "Power Points", cost: 5 }, { name: "Fatigue Points", cost: 5 }, { name: "Sanity Points", cost: 5 }],
    summary: "Each level drains 1 hit point, power point, fatigue point, or sanity point from a target.",
  },
  { name: "Energy Control", cost: 3, specify: ENERGY_TYPES, summary: "Allows creation of and control over a specific energy type." },
  { name: "Energy Projection", cost: 10, specify: ENERGY_TYPES, summary: "Allows projection of a focused beam of damaging energy." },
  { name: "Extra Energy", cost: 1, summary: "Each level provides +10 additional power points." },
  { name: "Extra Hit Points", cost: 1, summary: "Each level provides +1 additional hit point." },
  { name: "Flight", cost: 1, summary: "Each level allows self-powered flight for 1 SIZ point." },
  { name: "Force Field", cost: 1, costPerSIZ: true, specify: ENERGY_TYPES, summary: "Each level offers 10 points of armor against a specific type of energy." },
  { name: "Intangibility", cost: 2, summary: "Allows movement through solid objects." },
  { name: "Invisibility", cost: 1, summary: "Each level turns 1 SIZ point invisible." },
  { name: "Leap", cost: 1, summary: "Adds to the normal jumping distance, horizontally and vertically." },
  { name: "Protection", cost: 1, specify: ENERGY_TYPES, summary: "Each level reduces the level of an attacking energy type." },
  { name: "Regeneration", cost: 3, summary: "Each level returns 1 lost hit point per combat round." },
  {
    name: "Resistance",
    variants: [{ name: "Turn-based", cost: 1 }, { name: "Permanent", cost: 3 }],
    specify: ENERGY_TYPES,
    summary: "Each level resists 1 point of damage from a single energy type.",
  },
  { name: "Size Change", cost: 1, summary: "Each level adds or subtracts 1 point of SIZ." },
  { name: "Snare Projection", cost: 1, summary: "Each level is 1 STR and/or SIZ of a net, web, rope, or other confining snare." },
  { name: "Stretching", cost: 3, summary: "Stretch body into different sizes and shapes." },
  {
    name: "Super Characteristic",
    variants: [
      { name: "STR", cost: 1 }, { name: "CON", cost: 1 }, { name: "SIZ", cost: 1 }, { name: "CHA", cost: 1 },
      { name: "DEX", cost: 3 }, { name: "INT", cost: 3 }, { name: "POW", cost: 3 }, { name: "EDU", cost: 3 },
    ],
    summary: "Each level adds +1 to one characteristic.",
  },
  { name: "Super Movement", cost: 10, specify: SUPER_MOVEMENT_TYPES, maxLevel: 1, summary: "Each type involves a unique method of movement." },
  { name: "Super Sense", cost: 3, specify: SUPER_SENSE_TYPES, summary: "Each type improves an existing sense or adds an extraordinary aspect to the sense." },
  { name: "Super Skill", cost: 2, specify: "skill", summary: "Each level adds +20% to a specific skill." },
  { name: "Super Speed", cost: 20, summary: "Each level adds an additional action or movement each combat round." },
  { name: "Teleport", cost: 1, summary: "Each level allows instantaneous teleportation of 1 SIZ point of an object or target." },
  {
    name: "Transfer",
    variants: [{ name: "Hit Points", cost: 3 }, { name: "Power Points", cost: 1 }, { name: "Fatigue Points", cost: 1 }, { name: "Sanity Points", cost: 1 }],
    summary: "Each level allows transfer of 1 hit point, power point, fatigue point, or sanity point to a target.",
  },
  { name: "Unarmed Combat", cost: 20, summary: "Increases ability in unarmed combat." },
  { name: "Weather Control", cost: 3, summary: "Alters or creates weather in an area." },
];

export function findSuperpower(name) {
  return SUPERPOWERS.find((p) => p.name === name);
}

/** Starting character point budget for superpowers (p. 90), from the
 * character's unmodified characteristics: Normal highest×½ (round up),
 * Heroic highest, Epic highest×2, Superhuman the sum of all. */
export function superpowerPointBudget(campaignPowerLevel, characteristics) {
  const values = Object.values(characteristics).filter((v) => typeof v === "number");
  const highest = Math.max(...values);
  switch (campaignPowerLevel) {
    case "Heroic": return highest;
    case "Epic": return highest * 2;
    case "Superhuman": return values.reduce((sum, v) => sum + v, 0);
    default: return Math.ceil(highest / 2);
  }
}

// ---------------------------------------------------------------- Mutation pick counts (p. 65)

/** How many mutation picks a starting mutant gets (p. 65), and how many of
 * those may be adverse. A major mutation counts as two picks.
 * - Normal: roll D100 twice (2 picks); adverse results trigger the Luck-roll
 *   chain in the engine; picking instead of rolling is a gamemaster option.
 * - Heroic: ¼ CON (round up), minimum 2; adverse up to ¼ CON.
 * - Epic: ½ CON (round up); adverse up to ½ CON.
 * - Superhuman: CON; adverse up to ½ CON.
 * Adverse picks buy extra beneficial picks 1 to 1 (Heroic and above). */
export function mutationPickRules(campaignPowerLevel, con) {
  switch (campaignPowerLevel) {
    case "Heroic": return { picks: Math.max(2, Math.ceil(con / 4)), maxAdverse: Math.ceil(con / 4), adverseBuysPicks: true };
    case "Epic": return { picks: Math.ceil(con / 2), maxAdverse: Math.ceil(con / 2), adverseBuysPicks: true };
    case "Superhuman": return { picks: con, maxAdverse: Math.ceil(con / 2), adverseBuysPicks: true };
    default: return { picks: 2, maxAdverse: 2, adverseBuysPicks: false };
  }
}
