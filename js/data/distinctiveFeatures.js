// Step Nine (Option): Distinctive Features. Count is based on CHA distance from average.

export const CHA_FEATURE_COUNT_TABLE = [
  { max: 3, count: 4 },
  { max: 7, count: 3 },
  { max: 9, count: 2 },
  { max: 11, count: 1 },
  { max: 14, count: 2 },
  { max: 16, count: 3 },
  { max: Infinity, count: 4 },
];

export function featureCountForCHA(cha) {
  const row = CHA_FEATURE_COUNT_TABLE.find((r) => cha <= r.max);
  return row ? row.count : 1;
}

/** @type {{roll:number, category:string, options:string[]}[]} */
export const DISTINCTIVE_FEATURE_CATEGORIES = [
  {
    roll: 1,
    category: "Hair on Head",
    options: ["Bald", "bald on top", "blond", "black", "braided", "brown", "crew-cut", "curly", "dirty", "full of lice", "glossy", "gray", "long", "lustrous", "matted", "oily", "perfumed", "receding", "red", "shaven", "spiky", "very long", "wavy", "wig"],
  },
  {
    roll: 2,
    category: "Facial Hair",
    options: ["Arched eyebrows", "braided beard", "bushy beard", "curled and perfumed beard", "enormous mustachios", "eyebrows grown together", "goatee", "long beard", "no eyebrows", "sideburns", "strange designs cut in close-trimmed beard", "thick eyebrows"],
  },
  {
    roll: 3,
    category: "Facial Feature",
    options: ["Birthmark", "black eyes", "blue eyes", "bright eyes", "broken nose", "broken teeth", "brown eyes", "deeply tanned", "double chin", "earrings", "enormous chin", "even teeth", "eye patch", "fleshy lips", "gap in teeth", "gray eyes", "hairy ears", "high cheekbones", "hooked nose", "large eyes", "large nose", "long eyelashes", "jagged teeth", "nose ring", "pale", "pockmarked skin", "pointed chin", "pointed teeth", "prominent incisors", "pug nose", "round face", "scar", "sensuous lips", "stained teeth", "tattooed", "thin lips", "tiny ears", "turned-up nose", "warts", "weak chin", "white teeth", "wide-eyed", "yellow teeth"],
  },
  {
    roll: 4,
    category: "Expression",
    options: ["Adoring", "alluring", "arrogant", "bemused", "bright-eyed", "curious", "cringing", "dour", "drunken", "friendly", "guarded", "haughty", "lecherous", "leering", "meek", "mischievous", "naïve", "outgoing", "piercing", "pleasant", "proud", "seductive", "sneaky", "sneering", "squinting"],
  },
  {
    roll: 5,
    category: "Clothes",
    options: ["Ancient style", "armored hat", "athletic", "barefoot", "clothes leave wearer too hot or too cold", "conical hat", "embroidered with special emblem", "expensive", "fashionable", "fine boots", "for wrong sex", "formfitting", "full of holes", "garish", "gaudy", "ill-fitting", "lots of cheap jewelry", "new", "nightclothes", "partly nude", "peaked hat", "prim", "rich", "sandals", "satiny", "sexy", "skintight", "sporty", "subdued", "too much ornamentation", "uniform", "utilitarian", "vulgar", "wide hat"],
  },
  {
    roll: 6,
    category: "Bearing",
    options: ["Angry", "casual", "clumsy", "confident", "ethereal", "fearful", "graceful", "humble", "jaunty", "languid", "military", "nimble", "plodding", "pushy", "reserved", "slouching", "sprightly", "stiff", "swaggering", "sensual", "swaying", "wary", "weary", "yielding"],
  },
  {
    roll: 7,
    category: "Speech",
    options: ["Accented", "affected", "aggressive", "deep", "demanding", "drawling", "faint", "hesitant", "high-pitched", "imperious", "musical", "mumbling", "nasal", "raspy", "sharp", "sensual", "shrill", "slow", "smooth", "soft-spoken", "strong", "throaty", "unintelligible", "whining"],
  },
  {
    roll: 8,
    category: "Arms and Hands",
    options: ["Birthmark visible", "bracelets or other arm jewelry", "bulging biceps", "calloused hands", "deeply tanned", "hairless", "hairy", "knobby elbows", "large knuckles", "left-handed", "long arms", "long fingernails", "muscular", "one arm longer than the other", "one finger missing", "one too many fingers present", "pointed elbows", "pointed fingernails", "powerful arms and hands", "rings", "scar", "slender", "smooth-skinned", "tattooed", "unlined", "very hairy", "very pale skin"],
  },
  {
    roll: 9,
    category: "Torso",
    options: ["Barrel-like", "belly ring", "birthmark visible", "broad-shouldered", "curvy", "every bone shows", "flat stomach", "hairless", "high waist", "lean", "long torso", "many scars", "muscular", "narrow", "no navel", "one nipple gone", "potbellied", "prominent scar", "short", "shrunken chest", "sinewy", "sleek", "slender", "slim-hipped", "svelte", "tall", "tan lines visible", "tanned", "tattooed", "thick", "thin", "very hairy", "very pale", "willowy"],
  },
  {
    roll: 10,
    category: "Legs and Feet",
    options: ["Birthmark visible", "bulging thighs and calves", "calloused feet", "deeply tanned", "hairless", "hairy", "knobby knees", "limping in one leg", "many scars", "muscular", "one toe missing", "one too many toes present", "scar", "scars from flame or acid", "sleek", "smooth", "tanned", "tattooed", "toe ring", "very hairy", "very long legs", "very pale skin", "very short legs", "weathered skin"],
  },
];

export function categoryForRoll(d10) {
  const idx = ((d10 - 1) % 10 + 10) % 10;
  return DISTINCTIVE_FEATURE_CATEGORIES[idx];
}
