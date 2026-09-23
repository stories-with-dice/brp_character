// Chapter 4: Powers -- groundwork data only (Step Two of character creation).
// Full spell lists / mutation tables / psychic talent lists / sorcery spells /
// superpower catalogs are out of scope for this generator; this module models
// enough structure (power sets, power levels, points, and a resistance
// characteristic) that a future update can plug in real power catalogs
// without reshaping the character data model.

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

/** @type {{id:string, name:string, description:string, resistance:string}[]} */
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
