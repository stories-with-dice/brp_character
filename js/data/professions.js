// BRP professions (Chapter 2, "Professions A through Z").
// `fixed` are skills every member of the profession gets to spend points on.
// `choices` are "choose N of the following" pools; each entry may include a
// suggested specialty in parentheses, which is a hint, not a restriction.

/** @typedef {{count:number, from:string[]}} SkillChoice */
/** @typedef {{name:string, description:string, wealth:string, fixed:string[], choices:SkillChoice[], special?:string}} Profession */

/** @type {Profession[]} */
export const PROFESSIONS = [
  {
    name: "Artist",
    description: "You make your living through making art, whether drawing, painting, sculpture, design, photography, filmmaking, or any other means of creative expression.",
    wealth: "Any, but usually Poor or Average",
    fixed: ["Insight", "Language (Own)", "Listen", "Research", "Spot"],
    choices: [
      { count: 2, from: ["Art (any)"] },
      { count: 1, from: ["Craft (any)"] },
      { count: 1, from: ["Knowledge (any)"] },
      { count: 1, from: ["Language (Other)"] },
    ],
  },
  {
    name: "Assassin",
    description: "As a coldblooded professional assassin, death is your trade. Whether you kill for money or some other cause, you are skilled in the termination of other living beings, usually in secrecy.",
    wealth: "Average or Affluent",
    fixed: ["Dodge", "Hide", "Listen", "Spot", "Stealth"],
    choices: [
      { count: 5, from: ["Brawl", "Disguise", "Drive (any)", "Grapple", "Firearm (any)", "Fine Manipulation", "Martial Arts", "Melee Weapon (any)", "Missile Weapon (any)", "Ride (any)", "Throw", "Track"] },
    ],
  },
  {
    name: "Athlete",
    description: "Whether professional or amateur, state-sponsored or still in school, you excel in a style of sports or exercise, honing your body and resolve for solo or team athletic competition.",
    wealth: "Poor through Wealthy, usually Average or Affluent",
    fixed: ["Climb", "Dodge", "Jump", "Stealth", "Throw"],
    choices: [
      { count: 5, from: ["Brawl", "First Aid", "Grapple", "Insight", "Listen", "Martial Arts", "Spot", "Ride (any)", "Swim"] },
    ],
  },
  {
    name: "Beggar",
    description: "You survive by begging for money, food, and other necessities. You may call yourself a hobo, homeless, or a wandering vagabond.",
    wealth: "Destitute",
    fixed: ["Bargain", "Fast Talk", "Hide", "Insight", "Knowledge (Region: local area)", "Listen", "Persuade", "Sleight of Hand", "Spot", "Stealth"],
    choices: [],
  },
  {
    name: "Clerk",
    description: "You spend your days at a desk, usually working in some financial field, such as an accountant or salaried employee in a company, government, or other organization.",
    wealth: "Average",
    fixed: ["Bargain", "Etiquette", "Knowledge (Accounting)", "Knowledge (Law)", "Language (Own)", "Persuade", "Research", "Status"],
    choices: [
      { count: 1, from: ["Knowledge (any)"] },
      { count: 1, from: ["Technical Skill (Computer Use)", "Literacy"] },
    ],
  },
  {
    name: "Computer Tech",
    description: "You could be a corporate software engineer or an illicit hacker. Your life is spent interfaced with a computer, often connected to the world's information network.",
    wealth: "Average to Affluent",
    fixed: ["Craft (Computer Hardware or Code)", "Language (Other, a programming language)", "Repair (Electrical)", "Repair (Electronics)", "Research", "Science (Mathematics)", "Status", "Technical Skill (Computer Use)"],
    choices: [
      { count: 1, from: ["Knowledge (any)"] },
      { count: 1, from: ["Knowledge (Accounting)", "Hide", "Knowledge (Law)"] },
    ],
  },
  {
    name: "Crafter",
    description: "Whether a village blacksmith, a glassblower, or a maker of finely tuned watches, you make trade goods by hand and sell them to interested buyers.",
    wealth: "Poor to Affluent, usually Average",
    fixed: ["Appraise", "Bargain", "Spot", "Research", "Status"],
    choices: [
      { count: 1, from: ["Art (any)"] },
      { count: 2, from: ["Craft (any)"] },
      { count: 2, from: ["Fine Manipulation", "Heavy Machine (any)", "Repair (Electrical)", "Repair (Electronics)", "Repair (Mechanical)"] },
    ],
  },
  {
    name: "Criminal",
    description: "You make your way through the world by breaking the law, whether by strong-arm theft, organized crime, picking pockets, or some other means of gaining valuables or money illegally.",
    wealth: "Poor to Affluent, sometimes Wealthy, usually Average",
    fixed: ["Bargain", "Hide", "Stealth"],
    choices: [
      { count: 1, from: ["Drive (any)", "Ride (any)"] },
      { count: 6, from: ["Appraise", "Brawl", "Climb", "Fast Talk", "Fine Manipulation", "Firearm (any)", "Gaming", "Grapple", "Insight", "Jump", "Knowledge (Law)", "Listen", "Martial Arts", "Melee Weapon (any)", "Persuade", "Spot", "Throw"] },
    ],
  },
  {
    name: "Detective",
    description: "Whether employed by the police or working privately, you use skills of observation, deduction, and criminology to determine who has committed crimes.",
    wealth: "Average or Affluent",
    fixed: ["Firearm (Handgun)", "Knowledge (Law)", "Listen", "Persuade", "Spot", "Research"],
    choices: [
      { count: 4, from: ["Art (any)", "Brawl", "Disguise", "Dodge", "Drive (any)", "Fast Talk", "Firearm (any)", "Grapple", "Hide", "Insight", "Knowledge (any)", "Language (Other)", "Language (Own)", "Medicine", "Ride (any)", "Science (any)", "Technical Skill (Computer Use)", "Stealth", "Track"] },
    ],
  },
  {
    name: "Doctor",
    description: "You have made it your calling to treat the injured, infirm, sick, and otherwise unhealthy, using diagnostic skills and medical practices gained through extensive training and study.",
    wealth: "Average to Affluent",
    fixed: ["First Aid", "Language (Other)", "Medicine", "Persuade", "Research", "Spot"],
    choices: [
      { count: 4, from: ["Insight", "Language (any)", "Psychotherapy", "Science (any)", "Status"] },
    ],
  },
  {
    name: "Engineer",
    description: "You build, repair, or maintain machines, work in construction, or are a mechanic dealing with technology appropriate to your era and setting.",
    wealth: "Poor to Affluent, usually Average",
    fixed: ["Craft (any)", "Repair (Mechanical)", "Repair (Structural)", "Spot", "Status"],
    choices: [
      { count: 5, from: ["Art (Drafting)", "Drive (any)", "Heavy Machine (any)", "Knowledge (any)", "Pilot (any)", "Repair (Electrical)", "Repair (Electronics)", "Science (any)", "Technical Skill (Computer Use)"] },
    ],
  },
  {
    name: "Entertainer",
    description: "You use your performing talent to entertain audiences of all sizes, improvisational or scripted, in person or through broadcast transmission or prerecorded distribution.",
    wealth: "Destitute to Wealthy, usually Average",
    fixed: ["Disguise", "Fast Talk", "Fine Manipulation", "Insight", "Listen", "Persuade"],
    choices: [
      { count: 1, from: ["Art (any)"] },
      { count: 2, from: ["Language (Other)"] },
      { count: 1, from: ["Perform (any)"] },
    ],
  },
  {
    name: "Explorer",
    description: "You have made it your life's work to seek out the unknown corners of the world, go where none have gone before, and to bring back knowledge of what you have found.",
    wealth: "Affluent or Wealthy",
    fixed: ["Climb", "Language (Other)", "Language (Own)", "Persuade", "Research", "Spot"],
    choices: [
      { count: 4, from: ["Knowledge (Anthropology)", "Knowledge (Group)", "Knowledge (History)", "Knowledge (Natural World)", "Knowledge (Region)", "Drive (any)", "Fast Talk", "Firearm (Pistol)", "Firearm (Revolver)", "Firearm (Rifle)", "Navigate", "Pilot (Aircraft)", "Pilot (Boat)", "Ride (any)", "Science (Geology)", "Swim", "Track"] },
    ],
  },
  {
    name: "Farmer",
    description: "As a farmer you dwell in a rural or barely tamed area, coaxing a living out of the land through growing crops or tending animal herds.",
    wealth: "Poor to Affluent, usually Average",
    fixed: ["Bargain", "Craft (any)", "Knowledge (Natural History)", "Listen", "Spot"],
    choices: [
      { count: 5, from: ["Brawl", "Drive (any)", "Firearm (Rifle)", "Firearm (Shotgun)", "First Aid", "Heavy Machine (any)", "Knowledge (History)", "Repair (Mechanical)", "Ride (any)", "Science (Biology)", "Science (Botany)", "Science (Geology)", "Track"] },
    ],
  },
  {
    name: "Gambler",
    description: "You survive by the whim of chance, or by cheating fate in games of luck and skill, drifting from one gambling arena to another.",
    wealth: "Poor to Affluent, usually Average",
    fixed: ["Bargain", "Brawl", "Dodge", "Fast Talk", "Gaming", "Insight", "Knowledge (Accounting)", "Persuade", "Sleight of Hand", "Spot"],
    choices: [],
  },
  {
    name: "Herder",
    description: "You make your living tending herd animals, riding the open range and taking care of the herds, finding strays and bringing them to market.",
    wealth: "Poor to Average, occasionally Affluent",
    fixed: ["Craft (Knots)", "Firearm (Rifle)", "Knowledge (Natural History)", "Knowledge (Region: the Range)", "Listen", "Navigate", "Ride (any)", "Spot", "Throw", "Track"],
    choices: [],
  },
  {
    name: "Hunter",
    description: "Whether for survival or for the thrill of the hunt, you specialize in tracking and either trapping or killing wild animals or other beings.",
    wealth: "Poor or Average, unless a big-game or sport hunter, then Wealthy",
    fixed: ["Climb", "Hide", "Listen", "Navigate", "Spot", "Stealth", "Track"],
    choices: [
      { count: 3, from: ["Firearm (Rifle)", "Firearm (Shotgun)", "Knowledge (Natural History)", "Knowledge (Region)", "Language (Other)", "Melee Weapon (Spear)", "Missile Weapon (any)", "Ride (any)"] },
    ],
  },
  {
    name: "Journalist",
    description: "Columnist, web journalist, photojournalist, anchor, or commentator, you cover current events for the public.",
    wealth: "Average to Affluent",
    fixed: ["Fast Talk", "Insight", "Language (Own)", "Listen", "Persuade", "Research", "Spot"],
    choices: [
      { count: 3, from: ["Art (Photography)", "Craft (Photography)", "Disguise", "Hide", "Knowledge (any)", "Language (Other)", "Status", "Stealth", "Technical Skill (Computer Use)"] },
    ],
  },
  {
    name: "Laborer",
    description: "You work a blue-collar job: factory, warehouse, or other heavy labor.",
    wealth: "Poor or Average",
    fixed: ["Climb", "Craft (any)", "Drive (any)", "Brawl", "Grapple", "Heavy Machine (any)"],
    choices: [
      { count: 4, from: ["Appraise", "Fine Manipulation", "Language (Other)", "Literacy", "Repair (Mechanical)", "Repair (Structural)", "Technical Skill (Computer Use)"] },
    ],
  },
  {
    name: "Lawkeeper",
    description: "You uphold and defend the law, with community-backed authority.",
    wealth: "Usually Average; corrupt lawkeepers sometimes Affluent",
    fixed: ["Brawl", "Dodge", "Fast Talk", "Knowledge (Law)", "Listen", "Spot"],
    choices: [
      { count: 4, from: ["Drive (any)", "Firearm (any)", "First Aid", "Grapple", "Insight", "Knowledge (Region)", "Knowledge (Group)", "Language (Other)", "Martial Arts", "Melee Weapon (any)", "Missile Weapon (any)", "Pilot (any)", "Ride (any)", "Status", "Technical Skill (Computer Use)", "Track"] },
    ],
  },
  {
    name: "Lawyer",
    description: "Trained in the law, you prosecute, defend, or otherwise represent legal interests.",
    wealth: "Destitute, Poor, Average, Affluent, or Wealthy (varies widely)",
    fixed: ["Bargain", "Fast Talk", "Insight", "Knowledge (Law)", "Language (Own)", "Perform (Oratory)", "Persuade", "Research", "Status"],
    choices: [
      { count: 1, from: ["Knowledge (any)"] },
    ],
  },
  {
    name: "Mechanic",
    description: "You maintain, repair, and build machines and vehicles, good with tools of every kind.",
    wealth: "Poor to Average, usually Average",
    fixed: ["Bargain", "Craft (Metalwork)", "Drive (any)", "Fine Manipulation", "Heavy Machine (any)", "Repair (Electrical)", "Repair (Electronics)", "Repair (Mechanical)", "Repair (Structural)", "Spot"],
    choices: [],
  },
  {
    name: "Merchant",
    description: "You buy low and sell high, whether as a shop owner, traveling salesman, or trade vessel owner.",
    wealth: "Average to Wealthy, usually Affluent",
    fixed: ["Fast Talk", "Insight", "Knowledge (History)", "Knowledge (Business)", "Persuade", "Research", "Status"],
    choices: [
      { count: 2, from: ["Art (any)", "Craft (any)", "Drive (any)", "Language (Other)", "Language (Own)", "Pilot (any)", "Ride (any)"] },
    ],
  },
  {
    name: "Noble",
    description: "You were born into wealth and a ruling class, accustomed to an elegant and extravagant lifestyle.",
    wealth: "Affluent to Wealthy, usually Wealthy",
    fixed: ["Bargain", "Drive (any)", "Etiquette", "Language (Own)", "Language (Other)", "Literacy", "Status"],
    choices: [
      { count: 3, from: ["Art (any)", "Craft (any)", "Knowledge (any)", "Perform (any)", "Ride (any)"] },
    ],
  },
  {
    name: "Occultist",
    description: "You are a student of obscure secrets, hidden lore, and magical power, and may belong to an occult organization.",
    wealth: "Poor to Wealthy, usually Affluent",
    fixed: ["Fast Talk", "Insight", "Knowledge (Anthropology)", "Knowledge (History)", "Knowledge (Occult)", "Language (Other)", "Language (Own)", "Research"],
    choices: [
      { count: 2, from: ["Art (any)", "Craft (any)", "Knowledge (Archaeology)", "Medicine", "Science (any)", "Status"] },
    ],
    special: "If magic is present in the setting, may have magic powers.",
  },
  {
    name: "Pilot",
    description: "You guide a vessel of land, sea, air, or space, commercially, officially, or militarily.",
    wealth: "Average to Affluent (Affluent if owns own vessel)",
    fixed: ["Drive (any)", "Heavy Machine (any)", "Listen", "Navigate", "Pilot (any)", "Spot"],
    choices: [
      { count: 4, from: ["Bargain", "Climb", "Command", "Craft (any)", "Knowledge (Region)", "Repair (Electrical)", "Repair (Electronics)", "Repair (Mechanical)", "Language (Other)", "Persuade", "Science (Physics)", "Science (Astronomy)", "Technical Skill (Computer Use)"] },
    ],
  },
  {
    name: "Politician",
    description: "You are an elected or appointed authority figure directing government activities.",
    wealth: "Affluent to Wealthy, usually Affluent",
    fixed: ["Bargain", "Etiquette", "Fast Talk", "Insight", "Knowledge (Law)", "Persuade", "Status"],
    choices: [
      { count: 3, from: ["Knowledge (Accounting)", "Knowledge (Group)", "Knowledge (History)", "Knowledge (Region)", "Listen", "Language (Other)", "Language (Own)", "Perform (Oratory)", "Research"] },
    ],
  },
  {
    name: "Priest",
    description: "You are devoted to your faith, engaged in preaching and worship-related activities, from monk to televangelist.",
    wealth: "Poor to Affluent, usually Average, possibly Wealthy if a religious leader of a large group",
    fixed: ["Fast Talk", "Insight", "Knowledge (History)", "Knowledge (Philosophy)", "Knowledge (Religion)", "Language (Own)", "Perform (Ritual)", "Persuade"],
    choices: [
      { count: 2, from: ["Knowledge (Occult)", "Language (Other)", "Listen", "Literacy", "Perform (Oratory)", "Research", "Status", "Teach"] },
    ],
    special: "Faith or cult affiliation may grant access to magical or supernatural powers.",
  },
  {
    name: "Sailor",
    description: "You work a ship: pirate, naval officer, or trader.",
    wealth: "Poor or Average, usually Average",
    fixed: ["Climb", "Craft (any)", "Dodge", "Grapple", "Navigate", "Pilot (Boat)", "Swim"],
    choices: [
      { count: 3, from: ["Artillery (any)", "Command", "Language (Other)", "Listen", "Repair (Mechanical)", "Repair (Structural)", "Spot"] },
    ],
  },
  {
    name: "Scholar",
    description: "You study and specialize in one or more fields of knowledge, and may teach.",
    wealth: "Average or Affluent, usually Average",
    fixed: ["Language (Other)", "Language (Own)", "Persuade", "Research", "Teach"],
    choices: [
      { count: 5, from: ["Knowledge (any)", "Science (any)"] },
    ],
  },
  {
    name: "Scientist",
    description: "You explore a field of science through speculation, experimentation, and observation.",
    wealth: "Average or Affluent, usually Affluent",
    fixed: ["Craft (any)", "Persuade", "Research", "Status"],
    choices: [
      { count: 1, from: ["Technical Skill (Computer Use)", "Heavy Machine (any)"] },
      { count: 5, from: ["Knowledge (any)", "Science (any)"] },
    ],
  },
  {
    name: "Servant",
    description: "You are a helper or servant, tending the household affairs of an affluent employer.",
    wealth: "Poor to Average (sometimes limited access to employer's Affluent or Wealthy lifestyle)",
    fixed: ["Craft (any)", "Etiquette", "Hide", "Language (Own)", "Listen", "Stealth"],
    choices: [
      { count: 4, from: ["Bargain", "Drive (any)", "First Aid", "Insight", "Knowledge (Accounting)", "Language (Other)", "Persuade"] },
    ],
  },
  {
    name: "Shaman",
    description: "You are a tribal magician who contacts the spirit world, aiding your chieftain and tribe.",
    wealth: "Poor or Average, tribal-level existence",
    fixed: ["Art (any)", "Insight", "Knowledge (History)", "Knowledge (Occult)", "Language (Own)", "Listen", "Perform (Ritual)", "Persuade"],
    choices: [
      { count: 2, from: ["Craft (any)", "Fast Talk", "First Aid", "Hide", "Knowledge (Anthropology)", "Language (Other)", "Medicine", "Science (Pharmacy)", "Status"] },
    ],
    special: "May have the ability to use magic, depending on the setting.",
  },
  {
    name: "Slave",
    description: "You were captured or enslaved, or born into captivity, and serve a master, organization, or religion.",
    wealth: "Destitute to Poor (sometimes limited access to an owner's Affluent or Wealthy lifestyle)",
    fixed: ["Craft (any)", "Dodge", "Etiquette", "Fast Talk", "Hide", "Insight", "Language (Other)", "Listen", "Stealth"],
    choices: [
      { count: 1, from: ["Any skill (occupational specialty)"] },
    ],
  },
  {
    name: "Soldier",
    description: "You are a professional, enlisted, or conscripted soldier who works in a squad.",
    wealth: "Poor or Average, but frequently access to expensive or prohibited equipment",
    fixed: ["Brawl", "Climb", "Dodge", "First Aid"],
    choices: [
      { count: 6, from: ["Artillery (any)", "Command", "Drive (any)", "Firearm (Rifle)", "Grapple", "Heavy Weapon (any)", "Hide", "Language (Other)", "Listen", "Jump", "Medicine", "Melee Weapon (any)", "Missile Weapon (any)", "Navigate", "Repair (Mechanical)", "Ride (any)", "Spot", "Stealth", "Throw"] },
    ],
  },
  {
    name: "Spy",
    description: "You practice subterfuge and infiltration, entering countries or organizations under cover.",
    wealth: "Average or Affluent, depending on setting",
    fixed: ["Dodge", "Fast Talk", "Hide", "Listen", "Research", "Spot", "Stealth"],
    choices: [
      { count: 3, from: ["Art (Photography)", "Brawl", "Disguise", "Etiquette", "Firearm (any)", "Grapple", "Knowledge (any)", "Language (Other)", "Language (Own)", "Martial Arts", "Navigate", "Pilot (any)", "Repair (Electronics)", "Repair (Mechanical)", "Ride (any)", "Swim", "Technical Skill (Computer Use)", "Throw", "Track"] },
    ],
  },
  {
    name: "Student",
    description: "You study as a general student or apprentice: university, martial arts academy, wizard's school, and so on.",
    wealth: "Poor to Wealthy, usually Average",
    fixed: ["Language (Own)", "Research"],
    choices: [
      { count: 8, from: ["Art (any)", "Craft (any)", "First Aid", "Insight", "Knowledge (any)", "Language (Other)", "Listen", "Medicine", "Repair (any)", "Perform (any)", "Persuade", "Psychotherapy", "Science (any)", "Technical Skill (Computer Use)"] },
    ],
    special: "Students of the arcane arts may have access to magic or sorcery, or may attend a school that helps control superpowers, mutations, or psychic abilities.",
  },
  {
    name: "Teacher",
    description: "You instruct in one or more subjects: university, school, or tutoring.",
    wealth: "Average or Affluent, usually Average",
    fixed: ["Language (Own)", "Persuade", "Research", "Status", "Teach"],
    choices: [
      { count: 5, from: ["Art (any)", "Craft (any)", "First Aid", "Insight", "Knowledge (any)", "Language (Other)", "Listen", "Medicine", "Repair (any)", "Perform (any)", "Persuade", "Psychotherapy", "Science (any)", "Technical Skill (Computer Use)"] },
    ],
  },
  {
    name: "Technician",
    description: "You maintain, repair, and utilize complex machinery, computers, and electronics, though you do not design them.",
    wealth: "Average or Affluent",
    fixed: ["Fine Manipulation", "Heavy Machine (any)", "Listen", "Science (Physics)", "Research", "Spot", "Technical Skill (Computer Use)"],
    choices: [
      { count: 1, from: ["Repair (any)"] },
      { count: 2, from: ["Craft (any)", "Drive (any)", "Pilot (any)"] },
    ],
  },
  {
    name: "Thief",
    description: "You steal to survive or because it appeals to you, anything from pickpocket to jewel thief.",
    wealth: "Any, subject to gamemaster approval",
    fixed: ["Appraise", "Dodge", "Fast Talk", "Hide", "Stealth"],
    choices: [
      { count: 5, from: ["Bargain", "Brawl", "Climb", "Disguise", "Fine Manipulation", "Firearm (Pistol)", "Firearm (Revolver)", "Firearm (Shotgun)", "Grapple", "Insight", "Listen", "Jump", "Knowledge (Law)", "Persuade", "Repair (Mechanical)", "Spot"] },
    ],
  },
  {
    name: "Tribesperson",
    description: "You are a member of a primitive-culture tribe, surviving through hunting and foraging.",
    wealth: "Destitute to Poor, tribal-level (a noble of the tribe has higher wealth per Status)",
    fixed: ["Craft (any)", "Dodge", "Grapple", "Hide", "Knowledge (Natural History)", "Spot", "Throw", "Track"],
    choices: [
      { count: 2, from: ["Brawl", "Climb", "First Aid", "Listen", "Jump", "Knowledge (Occult)", "Melee Weapon (Spear)", "Melee Weapon (Club)", "Missile Weapon (Bow)", "Language (Other)", "Ride (any)", "Stealth", "Swim"] },
    ],
  },
  {
    name: "Warrior",
    description: "You specialize in individual combat, whether a code-of-honor duelist, mercenary, or barbaric adventurer.",
    wealth: "Destitute to Average, usually Poor",
    fixed: ["Brawl", "Dodge", "Grapple"],
    choices: [
      { count: 1, from: ["Melee Weapon (any)"] },
      { count: 1, from: ["Missile Weapon (any)"] },
      { count: 5, from: ["Climb", "Firearm (any)", "Hide", "Listen", "Jump", "Language (Other)", "Martial Arts", "Ride (any)", "Spot", "Stealth", "Swim", "Throw", "Track"] },
    ],
  },
  {
    name: "Wizard",
    description: "You understand and use magic or sorcery, dedicated to expanding your spells and power points.",
    wealth: "Poor to Wealthy, usually Affluent",
    fixed: ["Craft (any)", "Insight", "Knowledge (Occult)", "Language (Other)", "Listen", "Perform (Ritual)", "Persuade", "Research"],
    choices: [
      { count: 2, from: ["Knowledge (any)"] },
    ],
    special: "Can use magic or sorcery; work with the gamemaster to determine initial spells.",
  },
  {
    name: "Writer",
    description: "You write prose, poetry, or scripts, comfortable communicating in writing.",
    wealth: "Poor to Wealthy, usually Average",
    fixed: ["Art (Writing)", "Insight", "Language (Own)", "Persuade", "Research"],
    choices: [
      { count: 5, from: ["Fast Talk", "Knowledge (any)", "Language (Other)", "Listen", "Status", "Technical Skill (Computer Use)"] },
    ],
  },
];

export function findProfession(name) {
  return PROFESSIONS.find((p) => p.name === name);
}
