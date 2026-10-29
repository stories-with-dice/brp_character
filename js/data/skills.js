// BRP skill list: categories, base chance formulas, specialty lists, and short descriptions.
// Base chance formulas are small strings evaluated by engine/skillFormula.js against a
// characteristics object, e.g. "05", "DEX*2", "INT*5 or 00", "STR*5".

export const SKILL_CATEGORIES = [
  "Combat",
  "Communication",
  "Manipulation",
  "Mental",
  "Perception",
  "Physical",
];

// Category -> {primary, secondary[], negative[]} characteristic keys, for the
// optional Skill Category Bonus system.
export const CATEGORY_CHARACTERISTICS = {
  Combat: { primary: "DEX", secondary: ["INT", "STR"], negative: [] },
  Communication: { primary: "INT", secondary: ["POW", "CHA"], negative: [] },
  Manipulation: { primary: "DEX", secondary: ["INT", "STR"], negative: [] },
  Mental: { primary: "INT", secondary: ["POW", "EDU"], negative: [] },
  Perception: { primary: "INT", secondary: ["POW", "CON"], negative: [] },
  Physical: { primary: "DEX", secondary: ["STR", "CON"], negative: ["SIZ"] },
};

// The "Simpler Skill Bonuses" option (page 23) intentionally uses a
// *different* primary characteristic per category than the full method above.
export const SIMPLE_CATEGORY_PRIMARY = {
  Combat: "DEX",
  Communication: "CHA",
  Manipulation: "DEX",
  Mental: "INT",
  Perception: "POW",
  Physical: "STR",
};

// Weapon "classes" used as specialty picklists for weapon-based combat skills.
export const WEAPON_CLASSES = {
  Firearm: ["Machine Gun", "Pistol", "Revolver", "Rifle", "Shotgun", "Submachine Gun"],
  "Melee Weapon": [
    "Axe", "Club", "Dagger", "Flail", "Hammer", "Hand", "Mace", "Polearm",
    "Spear", "Staff", "Sword", "Improvised",
  ],
  "Missile Weapon": ["Bow", "Crossbow", "Missile", "Spear"],
  "Energy Weapon": ["Energy Pistol", "Energy Rifle"],
  "Heavy Weapon": ["Bazooka", "Flamethrower", "Mini Gun", "Rocket Launcher", "Grenade"],
  Artillery: ["Cannon", "Ballista", "Trebuchet", "Vehicle-Mounted"],
  Parry: ["Axe", "Club", "Dagger", "Flail", "Hammer", "Mace", "Polearm", "Spear", "Staff", "Sword", "Shield"],
  Shield: ["Buckler", "Large Shield", "Medium Shield", "Small Shield"],
};

// Skills whose "(various)" specialty is open-ended / free text rather than a fixed class list.
export const OPEN_SPECIALTY_SKILLS = {
  Art: ["Calligraphy", "Composing", "Conceptual Art", "Digital Art", "Drawing", "Painting", "Photography", "Poetry", "Sculpture", "Sketching", "Songwriting", "Writing"],
  Craft: ["Blacksmithing", "Carpentry", "Ceramics", "Cooking", "Leatherworking", "Locksmithing", "Metallurgy", "Stonemasonry"],
  Knowledge: ["Academic Lore", "Accounting", "Anthropology", "Archaeology", "Art History", "Blasphemous Lore", "Business", "Espionage", "Folklore", "History", "Law", "Linguistics", "Literature", "Occult", "Philosophy", "Politics", "Region", "Religion", "Streetwise"],
  Language: ["Own", "Other"],
  Science: ["Astronomy", "Behavioral Science", "Biology", "Botany", "Chemistry", "Cryptography", "Genetics", "Geology", "Mathematics", "Meteorology", "Natural History", "Pharmacology", "Physics", "Planetology", "Psychology", "Quantum Mechanics", "Xenobiology", "Zoology"],
  "Technical Skill": ["Clockwork", "Computers", "Cybernetics", "Electronics", "Robotics", "Sensors", "Siege Engines", "Traps"],
  Etiquette: ["Business", "Court", "High Society", "Military", "Street"],
  Perform: ["Act", "Conduct Orchestra", "Dance", "Juggle", "Orate", "Play Instrument", "Recite", "Ritual", "Sing"],
  Pilot: ["Airplane", "Airship", "Balloon", "Boat", "Helicopter", "Hovercraft", "Jet Aircraft", "Jetpack", "Starship", "Submarine"],
  Drive: ["Automobile", "Bicycle", "Carriage", "Cart", "Chariot", "Dogsled", "Motorcycle", "Sleigh", "Truck"],
  Ride: ["Camel", "Elephant", "Horse", "Motorcycle-like Beast", "Other Mount"],
  "Heavy Machine": ["Armored Vehicle", "Boiler", "Bulldozer", "Crane", "Engine", "Locomotive", "Turbine"],
  Repair: ["Electrical", "Electronic", "Engineering", "Hydroelectric", "Mechanical", "Structural", "Quantum"],
};

// The book spells some specialties two ways: the skill's own "Specialties:"
// list (Chapter 3) says "Computers", while a profession says "Technical Skill
// (Computer Use)". Without this map one character could get both as two
// skills. Each variant maps to the Chapter 3 spelling (skillRef.js canonicalSpecialty).
export const SPECIALTY_ALIASES = {
  Firearm: { Handgun: "Pistol" },
  Language: { "Own Language": "Own", "Other Language": "Other" },
  Perform: { Oratory: "Orate" },
  Pilot: { Aircraft: "Airplane" },
  Repair: { Electronics: "Electronic" },
  Science: { Pharmacy: "Pharmacology" },
  "Technical Skill": { "Computer Use": "Computers" },
};

// Earliest era (an index into ERAS in settings.js) of each specialty, for the
// setting filter (engine/settingFilter.js). A specialty not listed here is era
// 0: it fits every setting. Sources: the four weapon tables of Chapter 8
// (Primitive, Historic, Modern, Advanced; flintlocks and muskets are in the
// Modern table, so Firearm starts in the Renaissance), the skills' Setting
// Notes in Chapter 3 (Energy Weapon "usually only in futuristic settings"),
// and this generator's judgment where the book is silent (vehicles, sciences).
export const SPECIALTY_ERAS = {
  Artillery: { Ballista: 1, Trebuchet: 2, Cannon: 3, "Vehicle-Mounted": 5 },
  "Energy Weapon": { "Energy Pistol": 7, "Energy Rifle": 7 },
  Firearm: { Pistol: 3, Rifle: 3, Shotgun: 3, Revolver: 4, "Machine Gun": 4, "Submachine Gun": 5 },
  "Heavy Weapon": { Grenade: 5, Bazooka: 5, Flamethrower: 5, "Rocket Launcher": 5, "Mini Gun": 6 },
  "Melee Weapon": { Sword: 1, Mace: 1, Polearm: 1, Hammer: 1, Flail: 2 },
  "Missile Weapon": { Crossbow: 2 },
  Parry: { Sword: 1, Mace: 1, Polearm: 1, Hammer: 1, Flail: 2 },
  Shield: { Buckler: 1 },
  Art: { Calligraphy: 1, Writing: 1, Photography: 4, "Conceptual Art": 5, "Digital Art": 6 },
  Craft: { Blacksmithing: 1, Metallurgy: 1, Metalwork: 1, Locksmithing: 1, Photography: 4, "Computer Hardware or Code": 6 },
  Knowledge: {
    "Academic Lore": 1, Accounting: 1, Business: 1, History: 1, Law: 1, Literature: 1, Philosophy: 1, Politics: 1,
    "Natural History": 1, Linguistics: 3, "Art History": 3, Anthropology: 4, Archaeology: 4,
  },
  Language: { "Other, a programming language": 6 },
  Literacy: { Own: 1, Other: 1 },
  Science: {
    Astronomy: 1, Botany: 1, Cryptography: 1, Mathematics: 1, "Natural History": 1, Biology: 3, Chemistry: 3,
    Physics: 3, Zoology: 3, Geology: 4, Meteorology: 4, Pharmacology: 4, Psychology: 4, "Behavioral Science": 5,
    "Quantum Mechanics": 5, Genetics: 6, Planetology: 8, Xenobiology: 8,
  },
  "Technical Skill": { "Siege Engines": 1, Clockwork: 3, Electronics: 5, Sensors: 5, Computers: 6, Robotics: 6, Cybernetics: 7 },
  Etiquette: { Business: 1, Court: 1, "High Society": 1, Military: 1, Street: 1 },
  Perform: { "Conduct Orchestra": 3 },
  Pilot: { Balloon: 3, Airship: 4, Airplane: 5, Submarine: 5, "Jet Aircraft": 5, Helicopter: 5, Hovercraft: 6, Jetpack: 7, Starship: 8 },
  Drive: { Cart: 1, Chariot: 1, Carriage: 2, Sleigh: 2, Bicycle: 4, Automobile: 5, Motorcycle: 5, Truck: 5 },
  Ride: { Camel: 1, Elephant: 1, Horse: 1 },
  "Heavy Machine": { Crane: 1, Boiler: 4, Engine: 4, Locomotive: 4, "Armored Vehicle": 5, Bulldozer: 5, Turbine: 5 },
  Repair: { Engineering: 1, Structural: 1, Mechanical: 2, Electrical: 4, Electronic: 5, Hydroelectric: 5, Quantum: 8 },
};

/** @typedef {{name:string, category:string, base:string, desc:string, specialty?: 'open'|'weaponClass', specialtyKey?: string, uncommon?: boolean, era?: number}} Skill
 * `era`: earliest era of a skill without specialties (settings.js ERAS); none = 0. */

/** @type {Skill[]} */
export const SKILLS = [
  { name: "Appraise", category: "Mental", base: "15", desc: "Estimate an object's worth." },
  { name: "Art", category: "Manipulation", base: "05", desc: "Create paintings, sculpture, music, and other art.", specialty: "open", specialtyKey: "Art" },
  { name: "Artillery", category: "Combat", base: "01", desc: "Fire massive field pieces and heavy vehicular weapons.", specialty: "weaponClass", specialtyKey: "Artillery" },
  { name: "Bargain", category: "Communication", base: "05", desc: "Haggle over prices and negotiate deals." },
  { name: "Brawl", category: "Combat", base: "25", desc: "Unarmed combat: punches, kicks, and holds." },
  { name: "Climb", category: "Physical", base: "40", desc: "Climb walls, trees, and cliffs." },
  { name: "Command", category: "Communication", base: "05", desc: "Inspire and direct subordinates." },
  { name: "Craft", category: "Manipulation", base: "05", desc: "Construct and build things by hand.", specialty: "open", specialtyKey: "Craft" },
  { name: "Demolition", category: "Manipulation", base: "01", era: 3, desc: "Store, transport, set, and detonate explosives with precision." },
  { name: "Disguise", category: "Communication", base: "01", desc: "Appear as a different person via costume and makeup." },
  { name: "Dodge", category: "Physical", base: "DEX*2", desc: "Evade attacks." },
  { name: "Drive", category: "Physical", base: "20 or 01", desc: "Steer and control ground vehicles.", specialty: "open", specialtyKey: "Drive" },
  { name: "Energy Weapon", category: "Combat", base: "01", desc: "Fire hand-held directed-energy weapons.", specialty: "weaponClass", specialtyKey: "Energy Weapon", uncommon: true },
  { name: "Etiquette", category: "Communication", base: "05", desc: "Behave appropriately per a culture or group's social codes.", specialty: "open", specialtyKey: "Etiquette" },
  { name: "Fast Talk", category: "Communication", base: "05", desc: "Quickly convince or bluff a target." },
  { name: "Fine Manipulation", category: "Manipulation", base: "05", desc: "Careful fingerwork: lockpicking, disarming traps, tying knots." },
  { name: "Firearm", category: "Combat", base: "01", desc: "Accuracy and familiarity with firearms.", specialty: "weaponClass", specialtyKey: "Firearm" },
  { name: "First Aid", category: "Mental", base: "30", desc: "Stop bleeding, bandage wounds, and stabilize the injured." },
  { name: "Fly", category: "Physical", base: "DEX*4 or DEX/2", desc: "Aerial maneuvering without a vehicle.", formulaDefaultIndex: 1 },
  { name: "Gaming", category: "Mental", base: "INT+POW", desc: "Play games of skill and chance." },
  { name: "Grapple", category: "Combat", base: "25", desc: "Wrestle and subdue an opponent." },
  { name: "Heavy Machine", category: "Manipulation", base: "01", desc: "Operate machines larger than a person.", specialty: "open", specialtyKey: "Heavy Machine" },
  { name: "Heavy Weapon", category: "Combat", base: "01", desc: "Operate large direct-fire or explosive weapons.", specialty: "weaponClass", specialtyKey: "Heavy Weapon", uncommon: true },
  { name: "Hide", category: "Physical", base: "10", desc: "Conceal an object or yourself." },
  { name: "Insight", category: "Perception", base: "05", desc: "Read another's character, emotional state, or motives." },
  { name: "Jump", category: "Physical", base: "25", desc: "Leap for height or distance." },
  { name: "Knowledge", category: "Mental", base: "05 or 00", desc: "Remember facts and recall trivia within a field of study.", specialty: "open", specialtyKey: "Knowledge" },
  { name: "Language", category: "Communication", base: "INT*5 or 00", desc: "Verbal communication in a specific language.", specialty: "open", specialtyKey: "Language" },
  { name: "Listen", category: "Perception", base: "25", desc: "Hear and interpret sounds." },
  { name: "Literacy", category: "Mental", base: "00", desc: "Read and write a specific language.", specialty: "open", specialtyKey: "Language" },
  { name: "Martial Arts", category: "Combat", base: "01", desc: "Mastery of a specific fighting style, paired with another combat skill." },
  { name: "Medicine", category: "Mental", base: "05", desc: "Diagnose and treat serious injuries, disease, and poison." },
  { name: "Melee Weapon", category: "Combat", base: "01", desc: "Wield a weapon type in hand-to-hand combat.", specialty: "weaponClass", specialtyKey: "Melee Weapon" },
  { name: "Missile Weapon", category: "Combat", base: "01", desc: "Wield hand-thrown or self-propelled ranged weapons.", specialty: "weaponClass", specialtyKey: "Missile Weapon" },
  { name: "Navigate", category: "Perception", base: "10", desc: "Find a route via compass, charts, stars, or instinct." },
  { name: "Parry", category: "Combat", base: "01", desc: "Use a weapon to block an incoming attack.", specialty: "weaponClass", specialtyKey: "Parry" },
  { name: "Perform", category: "Communication", base: "05", desc: "Acting, dancing, playing instruments, and other performance.", specialty: "open", specialtyKey: "Perform" },
  { name: "Persuade", category: "Communication", base: "15", desc: "Convince someone lastingly that an idea is correct." },
  { name: "Pilot", category: "Physical", base: "01", desc: "Steer and control air, water, or space vehicles.", specialty: "open", specialtyKey: "Pilot" },
  { name: "Projection", category: "Physical", base: "DEX*2", desc: "Target power-based attacks.", optionOnly: "powers" },
  { name: "Psychotherapy", category: "Mental", base: "01 or 00", era: 4, desc: "Evaluate and treat mental illness and trauma." },
  { name: "Repair", category: "Manipulation", base: "15", desc: "Fix damaged or broken equipment.", specialty: "open", specialtyKey: "Repair" },
  { name: "Research", category: "Perception", base: "25", desc: "Locate and identify information sources." },
  { name: "Ride", category: "Physical", base: "05", desc: "Ride, handle, and care for a specific animal type.", specialty: "open", specialtyKey: "Ride" },
  { name: "Science", category: "Mental", base: "01", desc: "Scientific knowledge and methodology of a field.", specialty: "open", specialtyKey: "Science" },
  { name: "Sense", category: "Perception", base: "10", desc: "Taste, touch, smell, and other senses." },
  { name: "Shield", category: "Combat", base: "01", desc: "Block attacks with a shield.", specialty: "weaponClass", specialtyKey: "Shield" },
  { name: "Sleight of Hand", category: "Manipulation", base: "05", desc: "Manipulate small objects covertly." },
  { name: "Spot", category: "Perception", base: "25", desc: "Search for details and notice fleeting clues." },
  { name: "Status", category: "Communication", base: "15", desc: "Reputation, social class, and prosperity." },
  { name: "Stealth", category: "Physical", base: "10", desc: "Sneak through an area unnoticed." },
  { name: "Strategy", category: "Mental", base: "01", desc: "Guide forces in battle and large-scale military planning." },
  { name: "Swim", category: "Physical", base: "25", desc: "Move through or under water." },
  { name: "Teach", category: "Communication", base: "10", desc: "Train others in information or technique." },
  { name: "Technical Skill", category: "Mental", base: "05", desc: "Operate, maintain, and modify advanced technology.", specialty: "open", specialtyKey: "Technical Skill" },
  { name: "Throw", category: "Physical", base: "25", desc: "Hit a target with a thrown object." },
  { name: "Track", category: "Perception", base: "10", desc: "Identify tracks and follow a trail." },
];

export function findSkill(name) {
  return SKILLS.find((s) => s.name === name);
}
