// Campaign settings (core book Chapter 10, pp.205-210) and their technology eras.
//
// The book gives each setting "Character Types" (which professions fit) and a
// "Technology" note. It sorts weapons into four tables (Chapter 8: Primitive,
// Historic, Modern, Advanced), but it does not say which skill specialties
// exist in which setting. ERAS is a finer scale made for this generator: each
// setting has one era, and each skill specialty an earliest era
// (SPECIALTY_ERAS in skills.js). A skill fits a setting when its era is not
// later than the setting's. The era of each setting is read from its
// Technology note; the specialty eras are this generator's judgment where the
// book is silent.

export const ERAS = [
  "Primitive", // 0: stone, bone, wood (Primitive weapon tables)
  "Ancient", // 1: bronze and iron, writing (Historic tables)
  "Medieval", // 2: feudal, crossbows (Historic tables)
  "Renaissance", // 3: gunpowder, flintlocks (first Modern table firearms)
  "Industrial", // 4: steam, revolvers, telegraph
  "Early 20th Century", // 5: cars, airplanes, radio, submachine guns
  "Modern", // 6: computers, helicopters, present day
  "Near Future", // 7: cybernetics, early energy weapons
  "Space Age", // 8: starships, energy weapons (Advanced tables)
];

// `professions`: null = any profession; { only: [...] } or { except: [...] }.
// "Any but Journalist, Scientist, and Technician" is the book's wording for
// the settings before the Renaissance. The book's "Tribesfolk" is the
// Tribesperson profession. "Almost any" has no list in the book, so it is any.
const PRE_MODERN_EXCEPT = { except: ["Journalist", "Scientist", "Technician"] };

export const SETTINGS = [
  { id: "any", name: "Any (no setting filter)", era: null, professions: null },
  { id: "prehistoric", name: "Prehistoric Age", page: 205, era: 0, professions: { only: ["Crafter", "Farmer", "Hunter", "Shaman", "Tribesperson"] } },
  { id: "ancient", name: "Ancient World", page: 205, era: 1, professions: PRE_MODERN_EXCEPT },
  { id: "early-medieval", name: "Early Medieval", page: 206, era: 2, professions: PRE_MODERN_EXCEPT },
  { id: "high-medieval", name: "High Medieval", page: 206, era: 2, professions: PRE_MODERN_EXCEPT },
  { id: "high-fantasy", name: "High Fantasy", page: 206, era: 2, professions: PRE_MODERN_EXCEPT },
  { id: "imperial-asia", name: "Imperial Asia", page: 206, era: 2, professions: PRE_MODERN_EXCEPT },
  { id: "arabian-nights", name: "Arabian Nights", page: 206, era: 2, professions: PRE_MODERN_EXCEPT },
  { id: "renaissance", name: "Enlightenment and Renaissance", page: 206, era: 3, professions: null },
  { id: "exploration", name: "Age of Exploration", page: 207, era: 3, professions: null },
  { id: "sail", name: "Age of Sail", page: 207, era: 3, professions: null },
  { id: "industrial", name: "Industrial Age", page: 207, era: 4, professions: null },
  { id: "victorian", name: "Victorian Age", page: 207, era: 4, professions: null },
  { id: "wild-west", name: "Wild West", page: 207, era: 4, professions: null },
  { id: "pulp", name: "Pulp Era", page: 208, era: 5, professions: null },
  { id: "planetary", name: "Planetary Adventure", page: 208, era: 8, professions: null },
  { id: "ww2", name: "World War II", page: 208, era: 5, professions: null },
  { id: "noir", name: "Noir", page: 208, era: 5, professions: null },
  { id: "modern", name: "Modern", page: 208, era: 6, professions: null },
  { id: "superworld", name: "Superworld", page: 208, era: 6, professions: null },
  { id: "postapocalyptic", name: "Postapocalyptic", page: 209, era: 6, professions: null },
  { id: "near-future", name: "Near-Future/Cyberpunk", page: 209, era: 7, professions: null },
  { id: "space-exploration", name: "Space Exploration", page: 209, era: 8, professions: null },
  { id: "space-opera", name: "Space Opera", page: 210, era: 8, professions: null },
];

// Professions the book's lists miss, by earliest era: Computer Tech needs
// computers (the book excludes only Journalist, Scientist, and Technician).
export const PROFESSION_MIN_ERA = { "Computer Tech": 6 };

export function findSetting(id) {
  return SETTINGS.find((s) => s.id === id) ?? SETTINGS[0];
}
