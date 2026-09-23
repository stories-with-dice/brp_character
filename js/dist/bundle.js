(() => {
  // js/data/professions.js
  var PROFESSIONS = [
    {
      name: "Artist",
      description: "You make your living through making art, whether drawing, painting, sculpture, design, photography, filmmaking, or any other means of creative expression.",
      wealth: "Any, but usually Poor or Average",
      fixed: ["Insight", "Language (Own)", "Listen", "Research", "Spot"],
      choices: [
        { count: 2, from: ["Art (any)"] },
        { count: 1, from: ["Craft (any)"] },
        { count: 1, from: ["Knowledge (any)"] },
        { count: 1, from: ["Language (Other)"] }
      ]
    },
    {
      name: "Assassin",
      description: "As a coldblooded professional assassin, death is your trade. Whether you kill for money or some other cause, you are skilled in the termination of other living beings, usually in secrecy.",
      wealth: "Average or Affluent",
      fixed: ["Dodge", "Hide", "Listen", "Spot", "Stealth"],
      choices: [
        { count: 5, from: ["Brawl", "Disguise", "Drive (any)", "Grapple", "Firearm (any)", "Fine Manipulation", "Martial Arts", "Melee Weapon (any)", "Missile Weapon (any)", "Ride (any)", "Throw", "Track"] }
      ]
    },
    {
      name: "Athlete",
      description: "Whether professional or amateur, state-sponsored or still in school, you excel in a style of sports or exercise, honing your body and resolve for solo or team athletic competition.",
      wealth: "Poor through Wealthy, usually Average or Affluent",
      fixed: ["Climb", "Dodge", "Jump", "Stealth", "Throw"],
      choices: [
        { count: 5, from: ["Brawl", "First Aid", "Grapple", "Insight", "Listen", "Martial Arts", "Spot", "Ride (any)", "Swim"] }
      ]
    },
    {
      name: "Beggar",
      description: "You survive by begging for money, food, and other necessities. You may call yourself a hobo, homeless, or a wandering vagabond.",
      wealth: "Destitute",
      fixed: ["Bargain", "Fast Talk", "Hide", "Insight", "Knowledge (Region: local area)", "Listen", "Persuade", "Sleight of Hand", "Spot", "Stealth"],
      choices: []
    },
    {
      name: "Clerk",
      description: "You spend your days at a desk, usually working in some financial field, such as an accountant or salaried employee in a company, government, or other organization.",
      wealth: "Average",
      fixed: ["Bargain", "Etiquette", "Knowledge (Accounting)", "Knowledge (Law)", "Language (Own)", "Persuade", "Research", "Status"],
      choices: [
        { count: 1, from: ["Knowledge (any)"] },
        { count: 1, from: ["Technical Skill (Computer Use)", "Literacy"] }
      ]
    },
    {
      name: "Computer Tech",
      description: "You could be a corporate software engineer or an illicit hacker. Your life is spent interfaced with a computer, often connected to the world's information network.",
      wealth: "Average to Affluent",
      fixed: ["Craft (Computer Hardware or Code)", "Language (Other, a programming language)", "Repair (Electrical)", "Repair (Electronics)", "Research", "Science (Mathematics)", "Status", "Technical Skill (Computer Use)"],
      choices: [
        { count: 1, from: ["Knowledge (any)"] },
        { count: 1, from: ["Knowledge (Accounting)", "Hide", "Knowledge (Law)"] }
      ]
    },
    {
      name: "Crafter",
      description: "Whether a village blacksmith, a glassblower, or a maker of finely tuned watches, you make trade goods by hand and sell them to interested buyers.",
      wealth: "Poor to Affluent, usually Average",
      fixed: ["Appraise", "Bargain", "Spot", "Research", "Status"],
      choices: [
        { count: 1, from: ["Art (any)"] },
        { count: 2, from: ["Craft (any)"] },
        { count: 2, from: ["Fine Manipulation", "Heavy Machine (any)", "Repair (Electrical)", "Repair (Electronics)", "Repair (Mechanical)"] }
      ]
    },
    {
      name: "Criminal",
      description: "You make your way through the world by breaking the law, whether by strong-arm theft, organized crime, picking pockets, or some other means of gaining valuables or money illegally.",
      wealth: "Poor to Affluent, sometimes Wealthy, usually Average",
      fixed: ["Bargain", "Hide", "Stealth"],
      choices: [
        { count: 1, from: ["Drive (any)", "Ride (any)"] },
        { count: 6, from: ["Appraise", "Brawl", "Climb", "Fast Talk", "Fine Manipulation", "Firearm (any)", "Gaming", "Grapple", "Insight", "Jump", "Knowledge (Law)", "Listen", "Martial Arts", "Melee Weapon (any)", "Persuade", "Spot", "Throw"] }
      ]
    },
    {
      name: "Detective",
      description: "Whether employed by the police or working privately, you use skills of observation, deduction, and criminology to determine who has committed crimes.",
      wealth: "Average or Affluent",
      fixed: ["Firearm (Handgun)", "Knowledge (Law)", "Listen", "Persuade", "Spot", "Research"],
      choices: [
        { count: 4, from: ["Art (any)", "Brawl", "Disguise", "Dodge", "Drive (any)", "Fast Talk", "Firearm (any)", "Grapple", "Hide", "Insight", "Knowledge (any)", "Language (Other)", "Language (Own)", "Medicine", "Ride (any)", "Science (any)", "Technical Skill (Computer Use)", "Stealth", "Track"] }
      ]
    },
    {
      name: "Doctor",
      description: "You have made it your calling to treat the injured, infirm, sick, and otherwise unhealthy, using diagnostic skills and medical practices gained through extensive training and study.",
      wealth: "Average to Affluent",
      fixed: ["First Aid", "Language (Other)", "Medicine", "Persuade", "Research", "Spot"],
      choices: [
        { count: 4, from: ["Insight", "Language (any)", "Psychotherapy", "Science (any)", "Status"] }
      ]
    },
    {
      name: "Engineer",
      description: "You build, repair, or maintain machines, work in construction, or are a mechanic dealing with technology appropriate to your era and setting.",
      wealth: "Poor to Affluent, usually Average",
      fixed: ["Craft (any)", "Repair (Mechanical)", "Repair (Structural)", "Spot", "Status"],
      choices: [
        { count: 5, from: ["Art (Drafting)", "Drive (any)", "Heavy Machine (any)", "Knowledge (any)", "Pilot (any)", "Repair (Electrical)", "Repair (Electronics)", "Science (any)", "Technical Skill (Computer Use)"] }
      ]
    },
    {
      name: "Entertainer",
      description: "You use your performing talent to entertain audiences of all sizes, improvisational or scripted, in person or through broadcast transmission or prerecorded distribution.",
      wealth: "Destitute to Wealthy, usually Average",
      fixed: ["Disguise", "Fast Talk", "Fine Manipulation", "Insight", "Listen", "Persuade"],
      choices: [
        { count: 1, from: ["Art (any)"] },
        { count: 2, from: ["Language (Other)"] },
        { count: 1, from: ["Perform (any)"] }
      ]
    },
    {
      name: "Explorer",
      description: "You have made it your life's work to seek out the unknown corners of the world, go where none have gone before, and to bring back knowledge of what you have found.",
      wealth: "Affluent or Wealthy",
      fixed: ["Climb", "Language (Other)", "Language (Own)", "Persuade", "Research", "Spot"],
      choices: [
        { count: 4, from: ["Knowledge (Anthropology)", "Knowledge (Group)", "Knowledge (History)", "Knowledge (Natural World)", "Knowledge (Region)", "Drive (any)", "Fast Talk", "Firearm (Pistol)", "Firearm (Revolver)", "Firearm (Rifle)", "Navigate", "Pilot (Aircraft)", "Pilot (Boat)", "Ride (any)", "Science (Geology)", "Swim", "Track"] }
      ]
    },
    {
      name: "Farmer",
      description: "As a farmer you dwell in a rural or barely tamed area, coaxing a living out of the land through growing crops or tending animal herds.",
      wealth: "Poor to Affluent, usually Average",
      fixed: ["Bargain", "Craft (any)", "Knowledge (Natural History)", "Listen", "Spot"],
      choices: [
        { count: 5, from: ["Brawl", "Drive (any)", "Firearm (Rifle)", "Firearm (Shotgun)", "First Aid", "Heavy Machine (any)", "Knowledge (History)", "Repair (Mechanical)", "Ride (any)", "Science (Biology)", "Science (Botany)", "Science (Geology)", "Track"] }
      ]
    },
    {
      name: "Gambler",
      description: "You survive by the whim of chance, or by cheating fate in games of luck and skill, drifting from one gambling arena to another.",
      wealth: "Poor to Affluent, usually Average",
      fixed: ["Bargain", "Brawl", "Dodge", "Fast Talk", "Gaming", "Insight", "Knowledge (Accounting)", "Persuade", "Sleight of Hand", "Spot"],
      choices: []
    },
    {
      name: "Herder",
      description: "You make your living tending herd animals, riding the open range and taking care of the herds, finding strays and bringing them to market.",
      wealth: "Poor to Average, occasionally Affluent",
      fixed: ["Craft (Knots)", "Firearm (Rifle)", "Knowledge (Natural History)", "Knowledge (Region: the Range)", "Listen", "Navigate", "Ride (any)", "Spot", "Throw", "Track"],
      choices: []
    },
    {
      name: "Hunter",
      description: "Whether for survival or for the thrill of the hunt, you specialize in tracking and either trapping or killing wild animals or other beings.",
      wealth: "Poor or Average, unless a big-game or sport hunter, then Wealthy",
      fixed: ["Climb", "Hide", "Listen", "Navigate", "Spot", "Stealth", "Track"],
      choices: [
        { count: 3, from: ["Firearm (Rifle)", "Firearm (Shotgun)", "Knowledge (Natural History)", "Knowledge (Region)", "Language (Other)", "Melee Weapon (Spear)", "Missile Weapon (any)", "Ride (any)"] }
      ]
    },
    {
      name: "Journalist",
      description: "Columnist, web journalist, photojournalist, anchor, or commentator, you cover current events for the public.",
      wealth: "Average to Affluent",
      fixed: ["Fast Talk", "Insight", "Language (Own)", "Listen", "Persuade", "Research", "Spot"],
      choices: [
        { count: 3, from: ["Art (Photography)", "Craft (Photography)", "Disguise", "Hide", "Knowledge (any)", "Language (Other)", "Status", "Stealth", "Technical Skill (Computer Use)"] }
      ]
    },
    {
      name: "Laborer",
      description: "You work a blue-collar job: factory, warehouse, or other heavy labor.",
      wealth: "Poor or Average",
      fixed: ["Climb", "Craft (any)", "Drive (any)", "Brawl", "Grapple", "Heavy Machine (any)"],
      choices: [
        { count: 4, from: ["Appraise", "Fine Manipulation", "Language (Other)", "Literacy", "Repair (Mechanical)", "Repair (Structural)", "Technical Skill (Computer Use)"] }
      ]
    },
    {
      name: "Lawkeeper",
      description: "You uphold and defend the law, with community-backed authority.",
      wealth: "Usually Average; corrupt lawkeepers sometimes Affluent",
      fixed: ["Brawl", "Dodge", "Fast Talk", "Knowledge (Law)", "Listen", "Spot"],
      choices: [
        { count: 4, from: ["Drive (any)", "Firearm (any)", "First Aid", "Grapple", "Insight", "Knowledge (Region)", "Knowledge (Group)", "Language (Other)", "Martial Arts", "Melee Weapon (any)", "Missile Weapon (any)", "Pilot (any)", "Ride (any)", "Status", "Technical Skill (Computer Use)", "Track"] }
      ]
    },
    {
      name: "Lawyer",
      description: "Trained in the law, you prosecute, defend, or otherwise represent legal interests.",
      wealth: "Destitute, Poor, Average, Affluent, or Wealthy (varies widely)",
      fixed: ["Bargain", "Fast Talk", "Insight", "Knowledge (Law)", "Language (Own)", "Perform (Oratory)", "Persuade", "Research", "Status"],
      choices: [
        { count: 1, from: ["Knowledge (any)"] }
      ]
    },
    {
      name: "Mechanic",
      description: "You maintain, repair, and build machines and vehicles, good with tools of every kind.",
      wealth: "Poor to Average, usually Average",
      fixed: ["Bargain", "Craft (Metalwork)", "Drive (any)", "Fine Manipulation", "Heavy Machine (any)", "Repair (Electrical)", "Repair (Electronics)", "Repair (Mechanical)", "Repair (Structural)", "Spot"],
      choices: []
    },
    {
      name: "Merchant",
      description: "You buy low and sell high, whether as a shop owner, traveling salesman, or trade vessel owner.",
      wealth: "Average to Wealthy, usually Affluent",
      fixed: ["Fast Talk", "Insight", "Knowledge (History)", "Knowledge (Business)", "Persuade", "Research", "Status"],
      choices: [
        { count: 2, from: ["Art (any)", "Craft (any)", "Drive (any)", "Language (Other)", "Language (Own)", "Pilot (any)", "Ride (any)"] }
      ]
    },
    {
      name: "Noble",
      description: "You were born into wealth and a ruling class, accustomed to an elegant and extravagant lifestyle.",
      wealth: "Affluent to Wealthy, usually Wealthy",
      fixed: ["Bargain", "Drive (any)", "Etiquette", "Language (Own)", "Language (Other)", "Literacy", "Status"],
      choices: [
        { count: 3, from: ["Art (any)", "Craft (any)", "Knowledge (any)", "Perform (any)", "Ride (any)"] }
      ]
    },
    {
      name: "Occultist",
      description: "You are a student of obscure secrets, hidden lore, and magical power, and may belong to an occult organization.",
      wealth: "Poor to Wealthy, usually Affluent",
      fixed: ["Fast Talk", "Insight", "Knowledge (Anthropology)", "Knowledge (History)", "Knowledge (Occult)", "Language (Other)", "Language (Own)", "Research"],
      choices: [
        { count: 2, from: ["Art (any)", "Craft (any)", "Knowledge (Archaeology)", "Medicine", "Science (any)", "Status"] }
      ],
      special: "If magic is present in the setting, may have magic powers."
    },
    {
      name: "Pilot",
      description: "You guide a vessel of land, sea, air, or space, commercially, officially, or militarily.",
      wealth: "Average to Affluent (Affluent if owns own vessel)",
      fixed: ["Drive (any)", "Heavy Machine (any)", "Listen", "Navigate", "Pilot (any)", "Spot"],
      choices: [
        { count: 4, from: ["Bargain", "Climb", "Command", "Craft (any)", "Knowledge (Region)", "Repair (Electrical)", "Repair (Electronics)", "Repair (Mechanical)", "Language (Other)", "Persuade", "Science (Physics)", "Science (Astronomy)", "Technical Skill (Computer Use)"] }
      ]
    },
    {
      name: "Politician",
      description: "You are an elected or appointed authority figure directing government activities.",
      wealth: "Affluent to Wealthy, usually Affluent",
      fixed: ["Bargain", "Etiquette", "Fast Talk", "Insight", "Knowledge (Law)", "Persuade", "Status"],
      choices: [
        { count: 3, from: ["Knowledge (Accounting)", "Knowledge (Group)", "Knowledge (History)", "Knowledge (Region)", "Listen", "Language (Other)", "Language (Own)", "Perform (Oratory)", "Research"] }
      ]
    },
    {
      name: "Priest",
      description: "You are devoted to your faith, engaged in preaching and worship-related activities, from monk to televangelist.",
      wealth: "Poor to Affluent, usually Average, possibly Wealthy if a religious leader of a large group",
      fixed: ["Fast Talk", "Insight", "Knowledge (History)", "Knowledge (Philosophy)", "Knowledge (Religion)", "Language (Own)", "Perform (Ritual)", "Persuade"],
      choices: [
        { count: 2, from: ["Knowledge (Occult)", "Language (Other)", "Listen", "Literacy", "Perform (Oratory)", "Research", "Status", "Teach"] }
      ],
      special: "Faith or cult affiliation may grant access to magical or supernatural powers."
    },
    {
      name: "Sailor",
      description: "You work a ship: pirate, naval officer, or trader.",
      wealth: "Poor or Average, usually Average",
      fixed: ["Climb", "Craft (any)", "Dodge", "Grapple", "Navigate", "Pilot (Boat)", "Swim"],
      choices: [
        { count: 3, from: ["Artillery (any)", "Command", "Language (Other)", "Listen", "Repair (Mechanical)", "Repair (Structural)", "Spot"] }
      ]
    },
    {
      name: "Scholar",
      description: "You study and specialize in one or more fields of knowledge, and may teach.",
      wealth: "Average or Affluent, usually Average",
      fixed: ["Language (Other)", "Language (Own)", "Persuade", "Research", "Teach"],
      choices: [
        { count: 5, from: ["Knowledge (any)", "Science (any)"] }
      ]
    },
    {
      name: "Scientist",
      description: "You explore a field of science through speculation, experimentation, and observation.",
      wealth: "Average or Affluent, usually Affluent",
      fixed: ["Craft (any)", "Persuade", "Research", "Status"],
      choices: [
        { count: 1, from: ["Technical Skill (Computer Use)", "Heavy Machine (any)"] },
        { count: 5, from: ["Knowledge (any)", "Science (any)"] }
      ]
    },
    {
      name: "Servant",
      description: "You are a helper or servant, tending the household affairs of an affluent employer.",
      wealth: "Poor to Average (sometimes limited access to employer's Affluent or Wealthy lifestyle)",
      fixed: ["Craft (any)", "Etiquette", "Hide", "Language (Own)", "Listen", "Stealth"],
      choices: [
        { count: 4, from: ["Bargain", "Drive (any)", "First Aid", "Insight", "Knowledge (Accounting)", "Language (Other)", "Persuade"] }
      ]
    },
    {
      name: "Shaman",
      description: "You are a tribal magician who contacts the spirit world, aiding your chieftain and tribe.",
      wealth: "Poor or Average, tribal-level existence",
      fixed: ["Art (any)", "Insight", "Knowledge (History)", "Knowledge (Occult)", "Language (Own)", "Listen", "Perform (Ritual)", "Persuade"],
      choices: [
        { count: 2, from: ["Craft (any)", "Fast Talk", "First Aid", "Hide", "Knowledge (Anthropology)", "Language (Other)", "Medicine", "Science (Pharmacy)", "Status"] }
      ],
      special: "May have the ability to use magic, depending on the setting."
    },
    {
      name: "Slave",
      description: "You were captured or enslaved, or born into captivity, and serve a master, organization, or religion.",
      wealth: "Destitute to Poor (sometimes limited access to an owner's Affluent or Wealthy lifestyle)",
      fixed: ["Craft (any)", "Dodge", "Etiquette", "Fast Talk", "Hide", "Insight", "Language (Other)", "Listen", "Stealth"],
      choices: [
        { count: 1, from: ["Any skill (occupational specialty)"] }
      ]
    },
    {
      name: "Soldier",
      description: "You are a professional, enlisted, or conscripted soldier who works in a squad.",
      wealth: "Poor or Average, but frequently access to expensive or prohibited equipment",
      fixed: ["Brawl", "Climb", "Dodge", "First Aid"],
      choices: [
        { count: 6, from: ["Artillery (any)", "Command", "Drive (any)", "Firearm (Rifle)", "Grapple", "Heavy Weapon (any)", "Hide", "Language (Other)", "Listen", "Jump", "Medicine", "Melee Weapon (any)", "Missile Weapon (any)", "Navigate", "Repair (Mechanical)", "Ride (any)", "Spot", "Stealth", "Throw"] }
      ]
    },
    {
      name: "Spy",
      description: "You practice subterfuge and infiltration, entering countries or organizations under cover.",
      wealth: "Average or Affluent, depending on setting",
      fixed: ["Dodge", "Fast Talk", "Hide", "Listen", "Research", "Spot", "Stealth"],
      choices: [
        { count: 3, from: ["Art (Photography)", "Brawl", "Disguise", "Etiquette", "Firearm (any)", "Grapple", "Knowledge (any)", "Language (Other)", "Language (Own)", "Martial Arts", "Navigate", "Pilot (any)", "Repair (Electronics)", "Repair (Mechanical)", "Ride (any)", "Swim", "Technical Skill (Computer Use)", "Throw", "Track"] }
      ]
    },
    {
      name: "Student",
      description: "You study as a general student or apprentice: university, martial arts academy, wizard's school, and so on.",
      wealth: "Poor to Wealthy, usually Average",
      fixed: ["Language (Own)", "Research"],
      choices: [
        { count: 8, from: ["Art (any)", "Craft (any)", "First Aid", "Insight", "Knowledge (any)", "Language (Other)", "Listen", "Medicine", "Repair (any)", "Perform (any)", "Persuade", "Psychotherapy", "Science (any)", "Technical Skill (Computer Use)"] }
      ],
      special: "Students of the arcane arts may have access to magic or sorcery, or may attend a school that helps control superpowers, mutations, or psychic abilities."
    },
    {
      name: "Teacher",
      description: "You instruct in one or more subjects: university, school, or tutoring.",
      wealth: "Average or Affluent, usually Average",
      fixed: ["Language (Own)", "Persuade", "Research", "Status", "Teach"],
      choices: [
        { count: 5, from: ["Art (any)", "Craft (any)", "First Aid", "Insight", "Knowledge (any)", "Language (Other)", "Listen", "Medicine", "Repair (any)", "Perform (any)", "Persuade", "Psychotherapy", "Science (any)", "Technical Skill (Computer Use)"] }
      ]
    },
    {
      name: "Technician",
      description: "You maintain, repair, and utilize complex machinery, computers, and electronics, though you do not design them.",
      wealth: "Average or Affluent",
      fixed: ["Fine Manipulation", "Heavy Machine (any)", "Listen", "Science (Physics)", "Research", "Spot", "Technical Skill (Computer Use)"],
      choices: [
        { count: 1, from: ["Repair (any)"] },
        { count: 2, from: ["Craft (any)", "Drive (any)", "Pilot (any)"] }
      ]
    },
    {
      name: "Thief",
      description: "You steal to survive or because it appeals to you, anything from pickpocket to jewel thief.",
      wealth: "Any, subject to gamemaster approval",
      fixed: ["Appraise", "Dodge", "Fast Talk", "Hide", "Stealth"],
      choices: [
        { count: 5, from: ["Bargain", "Brawl", "Climb", "Disguise", "Fine Manipulation", "Firearm (Pistol)", "Firearm (Revolver)", "Firearm (Shotgun)", "Grapple", "Insight", "Listen", "Jump", "Knowledge (Law)", "Persuade", "Repair (Mechanical)", "Spot"] }
      ]
    },
    {
      name: "Tribesperson",
      description: "You are a member of a primitive-culture tribe, surviving through hunting and foraging.",
      wealth: "Destitute to Poor, tribal-level (a noble of the tribe has higher wealth per Status)",
      fixed: ["Craft (any)", "Dodge", "Grapple", "Hide", "Knowledge (Natural History)", "Spot", "Throw", "Track"],
      choices: [
        { count: 2, from: ["Brawl", "Climb", "First Aid", "Listen", "Jump", "Knowledge (Occult)", "Melee Weapon (Spear)", "Melee Weapon (Club)", "Missile Weapon (Bow)", "Language (Other)", "Ride (any)", "Stealth", "Swim"] }
      ]
    },
    {
      name: "Warrior",
      description: "You specialize in individual combat, whether a code-of-honor duelist, mercenary, or barbaric adventurer.",
      wealth: "Destitute to Average, usually Poor",
      fixed: ["Brawl", "Dodge", "Grapple"],
      choices: [
        { count: 1, from: ["Melee Weapon (any)"] },
        { count: 1, from: ["Missile Weapon (any)"] },
        { count: 5, from: ["Climb", "Firearm (any)", "Hide", "Listen", "Jump", "Language (Other)", "Martial Arts", "Ride (any)", "Spot", "Stealth", "Swim", "Throw", "Track"] }
      ]
    },
    {
      name: "Wizard",
      description: "You understand and use magic or sorcery, dedicated to expanding your spells and power points.",
      wealth: "Poor to Wealthy, usually Affluent",
      fixed: ["Craft (any)", "Insight", "Knowledge (Occult)", "Language (Other)", "Listen", "Perform (Ritual)", "Persuade", "Research"],
      choices: [
        { count: 2, from: ["Knowledge (any)"] }
      ],
      special: "Can use magic or sorcery; work with the gamemaster to determine initial spells."
    },
    {
      name: "Writer",
      description: "You write prose, poetry, or scripts, comfortable communicating in writing.",
      wealth: "Poor to Wealthy, usually Average",
      fixed: ["Art (Writing)", "Insight", "Language (Own)", "Persuade", "Research"],
      choices: [
        { count: 5, from: ["Fast Talk", "Knowledge (any)", "Language (Other)", "Listen", "Status", "Technical Skill (Computer Use)"] }
      ]
    }
  ];
  function findProfession(name) {
    return PROFESSIONS.find((p) => p.name === name);
  }

  // js/engine/dice.js
  function rollDie(sides, rng = Math.random) {
    return Math.floor(rng() * sides) + 1;
  }
  function rollDice(count, sides, rng = Math.random) {
    let total = 0;
    for (let i = 0; i < count; i++) total += rollDie(sides, rng);
    return total;
  }
  function roll3d6(rng = Math.random) {
    return rollDice(3, 6, rng);
  }
  function roll2d6plus6(rng = Math.random) {
    return rollDice(2, 6, rng) + 6;
  }

  // js/engine/characteristics.js
  var CHARACTERISTICS = ["STR", "CON", "SIZ", "INT", "POW", "DEX", "CHA"];
  var D3D6_CHARACTERISTICS = ["STR", "CON", "POW", "DEX", "CHA"];
  var D2D6PLUS6_CHARACTERISTICS = ["INT", "SIZ"];
  var GENERATION_METHODS = {
    STANDARD: "standard",
    // 3D6 for STR/CON/POW/DEX/CHA, 2D6+6 for INT/SIZ, redistribute 3
    CHOOSE_ROLLS: "chooseRolls",
    // roll 3D6 seven times, assign freely (SIZ/INT min 8)
    HIGHER_START: "higherStart",
    // 2D6+6 for all seven
    POINT_BUY: "pointBuy"
    // 24 points (or 36/48/60 for higher power levels), base 10
  };
  function rollStandardCharacteristics(rng = Math.random) {
    const chars = {};
    for (const c of D3D6_CHARACTERISTICS) chars[c] = roll3d6(rng);
    for (const c of D2D6PLUS6_CHARACTERISTICS) chars[c] = roll2d6plus6(rng);
    return chars;
  }
  function rollChooseableCharacteristics(rng = Math.random) {
    const rolls = [];
    for (let i = 0; i < 7; i++) rolls.push(roll3d6(rng));
    return rolls;
  }
  function rollHigherStartCharacteristics(rng = Math.random) {
    const chars = {};
    for (const c of CHARACTERISTICS) chars[c] = roll2d6plus6(rng);
    return chars;
  }
  var POINT_BUY_BUDGETS = { Normal: 24, Heroic: 36, Epic: 48, Superhuman: 60 };
  var POINT_BUY_COST = { STR: 1, CON: 1, SIZ: 1, CHA: 1, DEX: 3, INT: 3, POW: 3 };
  function pointBuyBaseline() {
    const chars = {};
    for (const c of CHARACTERISTICS) chars[c] = 10;
    return chars;
  }
  var CHARACTERISTIC_ROLL_MULTIPLIERS = {
    STR: { name: "Effort", mult: 5 },
    CON: { name: "Stamina", mult: 5 },
    INT: { name: "Idea", mult: 5 },
    POW: { name: "Luck", mult: 5 },
    DEX: { name: "Agility", mult: 5 },
    CHA: { name: "Charm", mult: 5 },
    EDU: { name: "Knowledge", mult: 5 }
  };
  function characteristicRolls(chars) {
    const rolls = {};
    for (const [key, { name, mult }] of Object.entries(CHARACTERISTIC_ROLL_MULTIPLIERS)) {
      if (chars[key] != null) rolls[name] = chars[key] * mult;
    }
    return rolls;
  }

  // js/engine/characteristicsRandom.js
  function randomStandardCharacteristics(rng = Math.random, { maxPoints = 3, cap = 21 } = {}) {
    const chars = rollStandardCharacteristics(rng);
    let moved = 0;
    let guard = 0;
    while (moved < maxPoints && guard < 50) {
      guard++;
      const sources = CHARACTERISTICS.filter((c) => chars[c] > 3);
      const targets = CHARACTERISTICS.filter((c) => chars[c] < cap);
      if (sources.length === 0 || targets.length === 0) break;
      const source = sources[Math.floor(rng() * sources.length)];
      const target = targets[Math.floor(rng() * targets.length)];
      if (source === target) continue;
      chars[source] -= 1;
      chars[target] += 1;
      moved += 1;
    }
    return chars;
  }
  function randomChooseRollsCharacteristics(rng = Math.random) {
    const rolls = rollChooseableCharacteristics(rng);
    const order = [...CHARACTERISTICS].sort(() => rng() - 0.5);
    const chars = {};
    order.forEach((c, i) => {
      chars[c] = rolls[i];
    });
    for (const key of ["SIZ", "INT"]) {
      if (chars[key] < 8) {
        const swapTarget = CHARACTERISTICS.find((c) => c !== key && chars[c] >= 8 && !["SIZ", "INT"].includes(c));
        if (swapTarget) {
          const tmp = chars[key];
          chars[key] = chars[swapTarget];
          chars[swapTarget] = tmp;
        }
      }
    }
    return chars;
  }
  function randomPointBuyCharacteristics(rng = Math.random, campaignPowerLevel = "Normal", { cap = 21 } = {}) {
    const chars = pointBuyBaseline();
    let budget = POINT_BUY_BUDGETS[campaignPowerLevel] ?? POINT_BUY_BUDGETS.Normal;
    let guard = 0;
    while (budget > 0 && guard < 200) {
      guard++;
      const affordable = CHARACTERISTICS.filter((c) => chars[c] < cap && POINT_BUY_COST[c] <= budget);
      if (affordable.length === 0) break;
      const pick = affordable[Math.floor(rng() * affordable.length)];
      chars[pick] += 1;
      budget -= POINT_BUY_COST[pick];
    }
    return chars;
  }
  function generateCharacteristics(method, rng = Math.random, campaignPowerLevel = "Normal") {
    switch (method) {
      case GENERATION_METHODS.CHOOSE_ROLLS:
        return randomChooseRollsCharacteristics(rng);
      case GENERATION_METHODS.HIGHER_START:
        return rollHigherStartCharacteristics(rng);
      case GENERATION_METHODS.POINT_BUY:
        return randomPointBuyCharacteristics(rng, campaignPowerLevel);
      case GENERATION_METHODS.STANDARD:
      default:
        return randomStandardCharacteristics(rng);
    }
  }

  // js/engine/derived.js
  var DAMAGE_MODIFIER_TABLE = [
    { max: 12, dice: "-1D6" },
    { max: 16, dice: "-1D4" },
    { max: 24, dice: "None" },
    { max: 32, dice: "+1D4" },
    { max: 40, dice: "+1D6" },
    { max: 56, dice: "+2D6" },
    { max: 72, dice: "+3D6" },
    { max: 88, dice: "+4D6" },
    { max: 104, dice: "+5D6" },
    { max: 120, dice: "+6D6" },
    { max: 136, dice: "+7D6" },
    { max: 152, dice: "+8D6" },
    { max: 168, dice: "+9D6" }
  ];
  function damageModifier(str, siz) {
    const total = str + siz;
    if (total <= 168) {
      const row = DAMAGE_MODIFIER_TABLE.find((r) => total <= r.max);
      return row.dice;
    }
    const extraSteps = Math.ceil((total - 168) / 16);
    return `+${9 + extraSteps}D6`;
  }
  function hitPoints(con, siz, { totalHitPointsOption = false } = {}) {
    const sum = con + siz;
    return totalHitPointsOption ? sum : Math.ceil(sum / 2);
  }
  function majorWoundLevel(hp) {
    return Math.ceil(hp / 2);
  }
  function powerPoints(pow) {
    return pow;
  }
  function experienceBonus(int) {
    return Math.ceil(int / 2);
  }
  var HUMAN_MOVE = 10;
  function fatiguePoints(str, con) {
    return str + con;
  }
  function sanityPoints(pow) {
    return pow * 5;
  }
  function hitPointsByLocation(totalHp) {
    return {
      head: Math.ceil(totalHp / 3),
      chest: Math.ceil(totalHp * 4 / 10),
      abdomen: Math.ceil(totalHp / 3),
      leftArm: Math.ceil(totalHp / 4),
      rightArm: Math.ceil(totalHp / 4),
      leftLeg: Math.ceil(totalHp / 3),
      rightLeg: Math.ceil(totalHp / 3)
    };
  }
  function computeDerived(chars, options = {}) {
    const {
      totalHitPointsOption = false,
      fatigueOption = false,
      sanityOption = false,
      hitLocationOption = false
    } = options;
    const hp = hitPoints(chars.CON, chars.SIZ, { totalHitPointsOption });
    const derived = {
      damageModifier: damageModifier(chars.STR, chars.SIZ),
      hitPoints: hp,
      majorWoundLevel: majorWoundLevel(hp),
      powerPoints: powerPoints(chars.POW),
      experienceBonus: experienceBonus(chars.INT),
      move: HUMAN_MOVE
    };
    if (fatigueOption) derived.fatiguePoints = fatiguePoints(chars.STR, chars.CON);
    if (sanityOption) derived.sanityPoints = sanityPoints(chars.POW);
    if (hitLocationOption) derived.hitPointsByLocation = hitPointsByLocation(hp);
    return derived;
  }

  // js/engine/age.js
  var DEFAULT_MIN_AGE = 18;
  var SKILL_POINTS_PER_DECADE = { Normal: 0, Heroic: 20, Epic: 30, Superhuman: 40 };
  function rollStartingAge(rng = Math.random) {
    return 17 + rollDie(6, rng);
  }
  function ageModifiers(age, campaignPowerLevel, { minAge = DEFAULT_MIN_AGE } = {}) {
    const perDecade = SKILL_POINTS_PER_DECADE[campaignPowerLevel] ?? 0;
    let skillPointModifier = 0;
    let youngCharacteristicPenalty = 0;
    if (age > minAge) {
      const fullDecadesOver = Math.floor((age - minAge) / 10);
      skillPointModifier += fullDecadesOver * perDecade;
    } else if (age < minAge) {
      const yearsUnder = minAge - age;
      skillPointModifier -= yearsUnder * perDecade;
      youngCharacteristicPenalty = yearsUnder;
    }
    let characteristicPenalties = 0;
    if (age >= 80) characteristicPenalties = 3;
    else if (age >= 50) characteristicPenalties = 1;
    return { skillPointModifier, characteristicPenalties, youngCharacteristicPenalty };
  }

  // js/data/skills.js
  var SKILL_CATEGORIES = [
    "Combat",
    "Communication",
    "Manipulation",
    "Mental",
    "Perception",
    "Physical"
  ];
  var CATEGORY_CHARACTERISTICS = {
    Combat: { primary: "DEX", secondary: ["INT", "STR"], negative: [] },
    Communication: { primary: "INT", secondary: ["POW", "CHA"], negative: [] },
    Manipulation: { primary: "DEX", secondary: ["INT", "STR"], negative: [] },
    Mental: { primary: "INT", secondary: ["POW", "EDU"], negative: [] },
    Perception: { primary: "INT", secondary: ["POW", "CON"], negative: [] },
    Physical: { primary: "DEX", secondary: ["STR", "CON"], negative: ["SIZ"] }
  };
  var SIMPLE_CATEGORY_PRIMARY = {
    Combat: "DEX",
    Communication: "CHA",
    Manipulation: "DEX",
    Mental: "INT",
    Perception: "POW",
    Physical: "STR"
  };
  var WEAPON_CLASSES = {
    Firearm: ["Machine Gun", "Pistol", "Revolver", "Rifle", "Shotgun", "Submachine Gun"],
    "Melee Weapon": [
      "Axe",
      "Club",
      "Dagger",
      "Flail",
      "Hammer",
      "Hand",
      "Mace",
      "Polearm",
      "Spear",
      "Staff",
      "Sword",
      "Improvised"
    ],
    "Missile Weapon": ["Bow", "Crossbow", "Missile", "Spear"],
    "Energy Weapon": ["Energy Pistol", "Energy Rifle"],
    "Heavy Weapon": ["Bazooka", "Flamethrower", "Mini Gun", "Rocket Launcher", "Grenade"],
    Artillery: ["Cannon", "Ballista", "Trebuchet", "Vehicle-Mounted"],
    Parry: ["Axe", "Club", "Dagger", "Flail", "Hammer", "Mace", "Polearm", "Spear", "Staff", "Sword", "Shield"],
    Shield: ["Buckler", "Large Shield", "Medium Shield", "Small Shield"]
  };
  var OPEN_SPECIALTY_SKILLS = {
    Art: ["Calligraphy", "Composing", "Conceptual Art", "Digital Art", "Drawing", "Painting", "Photography", "Poetry", "Sculpture", "Sketching", "Songwriting", "Writing"],
    Craft: ["Blacksmithing", "Carpentry", "Ceramics", "Cooking", "Leatherworking", "Locksmithing", "Metallurgy", "Stonemasonry"],
    Knowledge: ["Academic Lore", "Accounting", "Anthropology", "Archaeology", "Art History", "Blasphemous Lore", "Business", "Espionage", "Folklore", "History", "Law", "Linguistics", "Literature", "Occult", "Philosophy", "Politics", "Region", "Religion", "Streetwise"],
    Language: ["Own Language", "Other Language"],
    Science: ["Astronomy", "Behavioral Science", "Biology", "Botany", "Chemistry", "Cryptography", "Genetics", "Geology", "Mathematics", "Meteorology", "Natural History", "Pharmacology", "Physics", "Planetology", "Psychology", "Quantum Mechanics", "Xenobiology", "Zoology"],
    "Technical Skill": ["Clockwork", "Computers", "Cybernetics", "Electronics", "Robotics", "Sensors", "Siege Engines", "Traps"],
    Etiquette: ["Business", "Court", "High Society", "Military", "Street"],
    Perform: ["Act", "Conduct Orchestra", "Dance", "Juggle", "Orate", "Play Instrument", "Recite", "Ritual", "Sing"],
    Pilot: ["Airplane", "Airship", "Balloon", "Boat", "Helicopter", "Hovercraft", "Jet Aircraft", "Jetpack", "Starship", "Submarine"],
    Drive: ["Automobile", "Bicycle", "Carriage", "Cart", "Chariot", "Dogsled", "Motorcycle", "Sleigh", "Truck"],
    Ride: ["Camel", "Elephant", "Horse", "Motorcycle-like Beast", "Other Mount"],
    "Heavy Machine": ["Armored Vehicle", "Boiler", "Bulldozer", "Crane", "Engine", "Locomotive", "Turbine"],
    Repair: ["Electrical", "Electronic", "Engineering", "Hydroelectric", "Mechanical", "Structural", "Quantum"]
  };
  var SKILLS = [
    { name: "Appraise", category: "Mental", base: "15", desc: "Estimate an object's worth." },
    { name: "Art", category: "Manipulation", base: "05", desc: "Create paintings, sculpture, music, and other art.", specialty: "open", specialtyKey: "Art" },
    { name: "Artillery", category: "Combat", base: "01", desc: "Fire massive field pieces and heavy vehicular weapons.", specialty: "weaponClass", specialtyKey: "Artillery" },
    { name: "Bargain", category: "Communication", base: "05", desc: "Haggle over prices and negotiate deals." },
    { name: "Brawl", category: "Combat", base: "25", desc: "Unarmed combat: punches, kicks, and holds." },
    { name: "Climb", category: "Physical", base: "40", desc: "Climb walls, trees, and cliffs." },
    { name: "Command", category: "Communication", base: "05", desc: "Inspire and direct subordinates." },
    { name: "Craft", category: "Manipulation", base: "05", desc: "Construct and build things by hand.", specialty: "open", specialtyKey: "Craft" },
    { name: "Demolition", category: "Manipulation", base: "01", desc: "Store, transport, set, and detonate explosives with precision." },
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
    { name: "Psychotherapy", category: "Mental", base: "01 or 00", desc: "Evaluate and treat mental illness and trauma." },
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
    { name: "Track", category: "Perception", base: "10", desc: "Identify tracks and follow a trail." }
  ];
  function findSkill(name) {
    return SKILLS.find((s) => s.name === name);
  }

  // js/engine/skillRef.js
  var WILDCARD_RE = /^Any skill/i;
  function parseSkillRef(ref) {
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
  function resolveSkillDisplayName(ref, rng = Math.random) {
    const { base, specialty, wildcard } = parseSkillRef(ref);
    if (wildcard) return null;
    const skillDef = findSkill(base);
    if (!skillDef) return ref;
    if (!skillDef.specialty) return base;
    const isOpenChoice = specialty == null || /^any$/i.test(specialty) || /^various$/i.test(specialty);
    if (!isOpenChoice) return `${base} (${specialty})`;
    const pool = specialtyPoolFor(skillDef.specialtyKey ?? base);
    if (!pool || pool.length === 0) return base;
    const pick = pool[Math.floor(rng() * pool.length)];
    return `${base} (${pick})`;
  }

  // js/engine/professionSkills.js
  function pickRandomDistinct(pool, count, exclude, rng) {
    const available = pool.filter((item) => !exclude.has(item));
    const chosen = [];
    const working = [...available];
    for (let i = 0; i < count && working.length > 0; i++) {
      const idx = Math.floor(rng() * working.length);
      chosen.push(working.splice(idx, 1)[0]);
    }
    return chosen;
  }
  function resolveProfessionSkills(profession, rng = Math.random) {
    const resolved = /* @__PURE__ */ new Set();
    const displayNames = [];
    const addRef = (ref) => {
      const name = resolveSkillDisplayName(ref, rng);
      if (name && !resolved.has(name)) {
        resolved.add(name);
        displayNames.push(name);
      }
      return name;
    };
    for (const ref of profession.fixed) addRef(ref);
    for (const choice of profession.choices ?? []) {
      if (choice.from.length === 1 && /^Any skill/i.test(choice.from[0])) {
        const allSkillNames = SKILLS.map((s) => s.name).filter((n) => !resolved.has(n));
        const picks2 = pickRandomDistinct(allSkillNames, choice.count, resolved, rng);
        for (const base of picks2) addRef(base);
        continue;
      }
      const picks = pickRandomDistinct(choice.from, choice.count, /* @__PURE__ */ new Set(), rng);
      for (const ref of picks) addRef(ref);
    }
    return displayNames;
  }
  function allocatePointsRandomly(pool, slots, rng = Math.random, { maxChunk = 15 } = {}) {
    const allocation = {};
    const open = slots.filter((s) => s.headroom > 0).map((s) => ({ ...s }));
    for (const s of open) allocation[s.key] = 0;
    let remaining = pool;
    while (remaining > 0 && open.length > 0) {
      const idx = Math.floor(rng() * open.length);
      const slot = open[idx];
      const chunk = Math.min(slot.headroom, remaining, 1 + Math.floor(rng() * maxChunk));
      allocation[slot.key] += chunk;
      slot.headroom -= chunk;
      remaining -= chunk;
      if (slot.headroom <= 0) open.splice(idx, 1);
    }
    return allocation;
  }

  // js/engine/skillFormula.js
  function evalTerm(term, chars) {
    const t = term.trim();
    if (/^\d+$/.test(t)) return parseInt(t, 10);
    const mulMatch = t.match(/^([A-Z]+)\s*\*\s*(\d+)$/i);
    if (mulMatch) {
      const [, char, mult] = mulMatch;
      const val = chars[char.toUpperCase()];
      if (val == null) throw new Error(`Unknown characteristic in formula: ${char}`);
      return val * parseInt(mult, 10);
    }
    const divMatch = t.match(/^([A-Z]+)\s*\/\s*(\d+)$/i);
    if (divMatch) {
      const [, char, div] = divMatch;
      const val = chars[char.toUpperCase()];
      if (val == null) throw new Error(`Unknown characteristic in formula: ${char}`);
      return Math.floor(val / parseInt(div, 10));
    }
    const sumMatch = t.match(/^([A-Z]+)\s*\+\s*([A-Z]+)$/i);
    if (sumMatch) {
      const [, a, b] = sumMatch;
      const va = chars[a.toUpperCase()];
      const vb = chars[b.toUpperCase()];
      if (va == null || vb == null) throw new Error(`Unknown characteristic in formula: ${t}`);
      return va + vb;
    }
    const bare = chars[t.toUpperCase()];
    if (bare != null) return bare;
    throw new Error(`Cannot evaluate skill formula term: ${term}`);
  }
  function evaluateSkillFormula(formula, chars) {
    return formula.split(/\s+or\s+/i).map((term) => evalTerm(term, chars));
  }

  // js/engine/categoryBonus.js
  function fullBonusForCategory(category, chars) {
    const def = CATEGORY_CHARACTERISTICS[category];
    let bonus = 0;
    const primary = chars[def.primary];
    bonus += primary - 10;
    for (const key of def.secondary) {
      const diff = chars[key] - 10;
      bonus += Math.sign(diff) * Math.floor(Math.abs(diff) / 2);
    }
    for (const key of def.negative) {
      const diff = chars[key] - 10;
      bonus -= diff;
    }
    return bonus;
  }
  function simpleBonusForCategory(category, chars) {
    const primary = SIMPLE_CATEGORY_PRIMARY[category];
    return Math.ceil(chars[primary] / 2);
  }
  function computeCategoryBonuses(chars, method = "full") {
    const bonuses = {};
    for (const category of SKILL_CATEGORIES) {
      bonuses[category] = method === "simple" ? simpleBonusForCategory(category, chars) : fullBonusForCategory(category, chars);
    }
    return bonuses;
  }

  // js/engine/skillSheet.js
  function baselineSkillEntries(chars, options = {}) {
    const { useCategoryBonus = false, categoryBonusMethod = "full", usePowers = false } = options;
    const categoryBonuses = useCategoryBonus ? computeCategoryBonuses(chars, categoryBonusMethod) : null;
    const entries = {};
    for (const skill of SKILLS) {
      if (skill.specialty) continue;
      if (skill.optionOnly === "powers" && !usePowers) continue;
      const candidates = evaluateSkillFormula(skill.base, chars);
      const base = candidates[skill.formulaDefaultIndex ?? 0];
      entries[skill.name] = {
        name: skill.name,
        category: skill.category,
        base,
        categoryBonus: categoryBonuses ? categoryBonuses[skill.category] : 0,
        personalityBonus: 0,
        professionalPoints: 0,
        personalPoints: 0
      };
    }
    return entries;
  }
  function ensureSkillEntry(entries, displayName, chars, options = {}) {
    if (entries[displayName]) return entries[displayName];
    const { useCategoryBonus = false, categoryBonusMethod = "full" } = options;
    const baseName = displayName.replace(/\s*\([^)]*\)\s*$/, "");
    const skillDef = SKILLS.find((s) => s.name === baseName) ?? SKILLS.find((s) => s.name === displayName);
    const category = skillDef ? skillDef.category : "Mental";
    let base = 0;
    if (skillDef) {
      try {
        const candidates = evaluateSkillFormula(skillDef.base, chars);
        base = candidates[skillDef.formulaDefaultIndex ?? 0];
        if (candidates.length > 1 && skillDef.specialty) base = candidates[candidates.length - 1];
      } catch {
        base = 0;
      }
    }
    const categoryBonus = useCategoryBonus ? computeCategoryBonuses(chars, categoryBonusMethod)[category] : 0;
    entries[displayName] = {
      name: displayName,
      category,
      base,
      categoryBonus,
      personalityBonus: 0,
      professionalPoints: 0,
      personalPoints: 0
    };
    return entries[displayName];
  }
  function skillTotal(entry) {
    return entry.base + entry.categoryBonus + entry.personalityBonus + entry.professionalPoints + entry.personalPoints;
  }
  function currentTotalBeforePoints(entry) {
    return entry.base + entry.categoryBonus + entry.personalityBonus;
  }

  // js/engine/skillPoints.js
  var PROFESSIONAL_SKILL_POINTS = { Normal: 250, Heroic: 325, Epic: 400, Superhuman: 500 };
  var PROFESSIONAL_SKILL_CAP = { Normal: 75, Heroic: 90, Epic: 101, Superhuman: Infinity };
  var PERSONAL_SKILL_CAP = { Normal: 50, Heroic: 75, Epic: 90, Superhuman: 100 };
  var EDU_SKILL_POINT_MULTIPLIER = { Normal: 20, Heroic: 25, Epic: 30, Superhuman: 40 };
  var PERSONAL_SKILL_POINT_MULTIPLIER = { Normal: 10, Heroic: 10, Epic: 10, Superhuman: 10 };
  var INCREASED_PERSONAL_SKILL_POINT_MULTIPLIER = { Normal: 10, Heroic: 15, Epic: 20, Superhuman: 25 };
  function professionalSkillPointPool(campaignPowerLevel, { eduOption = false, edu = null } = {}) {
    if (eduOption && edu != null) {
      return edu * EDU_SKILL_POINT_MULTIPLIER[campaignPowerLevel];
    }
    return PROFESSIONAL_SKILL_POINTS[campaignPowerLevel];
  }
  function personalSkillPointPool(int, campaignPowerLevel, { increasedOption = false } = {}) {
    const table = increasedOption ? INCREASED_PERSONAL_SKILL_POINT_MULTIPLIER : PERSONAL_SKILL_POINT_MULTIPLIER;
    return int * table[campaignPowerLevel];
  }
  function professionalSkillCap(campaignPowerLevel) {
    return PROFESSIONAL_SKILL_CAP[campaignPowerLevel];
  }
  function personalSkillCap(campaignPowerLevel) {
    return PERSONAL_SKILL_CAP[campaignPowerLevel];
  }

  // js/data/personality.js
  var PERSONALITY_TYPES = [
    {
      id: 1,
      name: "Brutal",
      description: "Your character thinks first of solving problems by means of physical force and brawn.",
      skills: ["Brawl", "Climb", "Dodge", "Grapple", "Insight", "Jump", "Ride", "Sense", "Stealth", "Swim", "Throw"],
      combatChoices: 2
    },
    {
      id: 2,
      name: "Skilled",
      description: "Your character believes that technique, craft, and expertise are the secrets of success.",
      skills: ["Appraise", "Disguise", "Dodge", "Fine Manipulation", "First Aid", "Navigate", "Pilot", "Ride", "Sleight of Hand", "Stealth"],
      craftChoices: 1,
      knowledgeChoices: 1,
      combatChoices: 1
    },
    {
      id: 3,
      name: "Cunning",
      description: "Your character first tries to outsmart an opponent to gain an advantage.",
      skills: ["Appraise", "Bargain", "Disguise", "Insight", "Listen", "Research", "Sense", "Spot", "Stealth"],
      knowledgeChoices: 2,
      technicalChoices: 1,
      combatChoices: 1
    },
    {
      id: 4,
      name: "Charming",
      description: "Your character enjoys persuading other people to work, while they make the decisions.",
      skills: ["Appraise", "Bargain", "Command", "Etiquette", "Fast Talk", "Insight", "Perform", "Persuade", "Sense", "Status"],
      languageChoices: 1,
      combatChoices: 1
    }
  ];
  var PERSONALITY_BONUS = 20;
  function findPersonalityType(id) {
    return PERSONALITY_TYPES.find((p) => p.id === id);
  }

  // js/engine/personalityEngine.js
  var COMBAT_SKILL_NAMES = SKILLS.filter((s) => s.category === "Combat").map((s) => s.name);
  var CRAFT_LIKE = { craftChoices: "Craft", knowledgeChoices: "Knowledge", technicalChoices: "Technical Skill", languageChoices: "Language" };
  function rollPersonalityType(rng = Math.random) {
    return findPersonalityType(rollDie(4, rng));
  }
  function resolvePersonalitySkills(personality, rng = Math.random) {
    const names = new Set(personality.skills);
    for (const [choiceKey, base] of Object.entries(CRAFT_LIKE)) {
      const count = personality[choiceKey];
      if (!count) continue;
      for (let i = 0; i < count; i++) {
        const display = resolveSkillDisplayName(`${base} (any)`, rng);
        if (display) names.add(display);
      }
    }
    if (personality.combatChoices) {
      const pool = COMBAT_SKILL_NAMES.filter((n) => !names.has(n));
      for (let i = 0; i < personality.combatChoices && pool.length > 0; i++) {
        const idx = Math.floor(rng() * pool.length);
        names.add(pool.splice(idx, 1)[0]);
      }
    }
    return [...names];
  }

  // js/data/distinctiveFeatures.js
  var CHA_FEATURE_COUNT_TABLE = [
    { max: 3, count: 4 },
    { max: 7, count: 3 },
    { max: 9, count: 2 },
    { max: 11, count: 1 },
    { max: 14, count: 2 },
    { max: 16, count: 3 },
    { max: Infinity, count: 4 }
  ];
  function featureCountForCHA(cha) {
    const row = CHA_FEATURE_COUNT_TABLE.find((r) => cha <= r.max);
    return row ? row.count : 1;
  }
  var DISTINCTIVE_FEATURE_CATEGORIES = [
    {
      roll: 1,
      category: "Hair on Head",
      options: ["Bald", "bald on top", "blond", "black", "braided", "brown", "crew-cut", "curly", "dirty", "full of lice", "glossy", "gray", "long", "lustrous", "matted", "oily", "perfumed", "receding", "red", "shaven", "spiky", "very long", "wavy", "wig"]
    },
    {
      roll: 2,
      category: "Facial Hair",
      options: ["Arched eyebrows", "braided beard", "bushy beard", "curled and perfumed beard", "enormous mustachios", "eyebrows grown together", "goatee", "long beard", "no eyebrows", "sideburns", "strange designs cut in close-trimmed beard", "thick eyebrows"]
    },
    {
      roll: 3,
      category: "Facial Feature",
      options: ["Birthmark", "black eyes", "blue eyes", "bright eyes", "broken nose", "broken teeth", "brown eyes", "deeply tanned", "double chin", "earrings", "enormous chin", "even teeth", "eye patch", "fleshy lips", "gap in teeth", "gray eyes", "hairy ears", "high cheekbones", "hooked nose", "large eyes", "large nose", "long eyelashes", "jagged teeth", "nose ring", "pale", "pockmarked skin", "pointed chin", "pointed teeth", "prominent incisors", "pug nose", "round face", "scar", "sensuous lips", "stained teeth", "tattooed", "thin lips", "tiny ears", "turned-up nose", "warts", "weak chin", "white teeth", "wide-eyed", "yellow teeth"]
    },
    {
      roll: 4,
      category: "Expression",
      options: ["Adoring", "alluring", "arrogant", "bemused", "bright-eyed", "curious", "cringing", "dour", "drunken", "friendly", "guarded", "haughty", "lecherous", "leering", "meek", "mischievous", "na\xEFve", "outgoing", "piercing", "pleasant", "proud", "seductive", "sneaky", "sneering", "squinting"]
    },
    {
      roll: 5,
      category: "Clothes",
      options: ["Ancient style", "armored hat", "athletic", "barefoot", "clothes leave wearer too hot or too cold", "conical hat", "embroidered with special emblem", "expensive", "fashionable", "fine boots", "for wrong sex", "formfitting", "full of holes", "garish", "gaudy", "ill-fitting", "lots of cheap jewelry", "new", "nightclothes", "partly nude", "peaked hat", "prim", "rich", "sandals", "satiny", "sexy", "skintight", "sporty", "subdued", "too much ornamentation", "uniform", "utilitarian", "vulgar", "wide hat"]
    },
    {
      roll: 6,
      category: "Bearing",
      options: ["Angry", "casual", "clumsy", "confident", "ethereal", "fearful", "graceful", "humble", "jaunty", "languid", "military", "nimble", "plodding", "pushy", "reserved", "slouching", "sprightly", "stiff", "swaggering", "sensual", "swaying", "wary", "weary", "yielding"]
    },
    {
      roll: 7,
      category: "Speech",
      options: ["Accented", "affected", "aggressive", "deep", "demanding", "drawling", "faint", "hesitant", "high-pitched", "imperious", "musical", "mumbling", "nasal", "raspy", "sharp", "sensual", "shrill", "slow", "smooth", "soft-spoken", "strong", "throaty", "unintelligible", "whining"]
    },
    {
      roll: 8,
      category: "Arms and Hands",
      options: ["Birthmark visible", "bracelets or other arm jewelry", "bulging biceps", "calloused hands", "deeply tanned", "hairless", "hairy", "knobby elbows", "large knuckles", "left-handed", "long arms", "long fingernails", "muscular", "one arm longer than the other", "one finger missing", "one too many fingers present", "pointed elbows", "pointed fingernails", "powerful arms and hands", "rings", "scar", "slender", "smooth-skinned", "tattooed", "unlined", "very hairy", "very pale skin"]
    },
    {
      roll: 9,
      category: "Torso",
      options: ["Barrel-like", "belly ring", "birthmark visible", "broad-shouldered", "curvy", "every bone shows", "flat stomach", "hairless", "high waist", "lean", "long torso", "many scars", "muscular", "narrow", "no navel", "one nipple gone", "potbellied", "prominent scar", "short", "shrunken chest", "sinewy", "sleek", "slender", "slim-hipped", "svelte", "tall", "tan lines visible", "tanned", "tattooed", "thick", "thin", "very hairy", "very pale", "willowy"]
    },
    {
      roll: 10,
      category: "Legs and Feet",
      options: ["Birthmark visible", "bulging thighs and calves", "calloused feet", "deeply tanned", "hairless", "hairy", "knobby knees", "limping in one leg", "many scars", "muscular", "one toe missing", "one too many toes present", "scar", "scars from flame or acid", "sleek", "smooth", "tanned", "tattooed", "toe ring", "very hairy", "very long legs", "very pale skin", "very short legs", "weathered skin"]
    }
  ];
  function categoryForRoll(d10) {
    const idx = ((d10 - 1) % 10 + 10) % 10;
    return DISTINCTIVE_FEATURE_CATEGORIES[idx];
  }

  // js/engine/distinctiveFeaturesEngine.js
  function generateDistinctiveFeatures(cha, rng = Math.random, count = null) {
    const n = count ?? featureCountForCHA(cha);
    const features = [];
    for (let i = 0; i < n; i++) {
      const category = categoryForRoll(rollDie(10, rng));
      const option = category.options[Math.floor(rng() * category.options.length)];
      features.push({ category: category.category, description: option });
    }
    return features;
  }

  // js/data/powers.js
  var POWER_SETS_BY_LEVEL = {
    Normal: [[{ level: "Normal", count: 1 }]],
    Heroic: [
      [{ level: "Heroic", count: 1 }],
      [{ level: "Normal", count: 2 }]
    ],
    Epic: [
      [{ level: "Epic", count: 1 }],
      [{ level: "Heroic", count: 1 }, { level: "Normal", count: 1 }],
      [{ level: "Normal", count: 3 }]
    ],
    Superhuman: [
      [{ level: "Superhuman", count: 1 }],
      [{ level: "Epic", count: 1 }, { level: "Normal", count: 1 }],
      [{ level: "Heroic", count: 1 }, { level: "Normal", count: 2 }],
      [{ level: "Heroic", count: 2 }],
      [{ level: "Normal", count: 4 }]
    ]
  };
  var POWER_TYPES = [
    {
      id: "magic",
      name: "Magic",
      description: "Spells cast like skills, using percentile rolls to determine success. A magician usually has a small number of spells used frequently.",
      resistance: "POW"
    },
    {
      id: "mutation",
      name: "Mutations",
      description: "Modifications or special abilities that accentuate or expand capabilities beyond human norms. Not all mutations are beneficial.",
      resistance: "CON"
    },
    {
      id: "psychic",
      name: "Psychic Abilities",
      description: "Strange powers of the mind, resolved as resistance rolls using INT or POW versus an opposing characteristic.",
      resistance: "INT/POW"
    },
    {
      id: "sorcery",
      name: "Sorcery",
      description: "Short magical incantations that cause a supernatural effect automatically, except when successfully resisted. A sorcerer can change memorized spells day to day.",
      resistance: "POW"
    },
    {
      id: "superpowers",
      name: "Superpowers",
      description: "Expansions of existing skills, new abilities, or ways to exceed natural limits. Often resolved with resistance rolls, though some are automatic.",
      resistance: "varies"
    }
  ];
  function powerSetOptionsFor(campaignPowerLevel) {
    return POWER_SETS_BY_LEVEL[campaignPowerLevel] ?? POWER_SETS_BY_LEVEL.Normal;
  }

  // js/engine/powersEngine.js
  function choosePowerSetOption(campaignPowerLevel, rng = Math.random) {
    const options = powerSetOptionsFor(campaignPowerLevel);
    return options[Math.floor(rng() * options.length)];
  }
  function assignPowerTypes(option, rng = Math.random, { allowDuplicates = false } = {}) {
    const totalSlots = option.reduce((sum, o) => sum + o.count, 0);
    const available = [...POWER_TYPES];
    const assignments = [];
    for (const { level, count } of option) {
      for (let i = 0; i < count; i++) {
        let pool = available.length > 0 ? available : POWER_TYPES;
        const idx = Math.floor(rng() * pool.length);
        const type = pool[idx];
        if (!allowDuplicates) {
          const realIdx = available.indexOf(type);
          if (realIdx >= 0) available.splice(realIdx, 1);
        }
        assignments.push({ level, type: type.id, name: type.name, resistance: type.resistance, spells: [] });
      }
    }
    return assignments;
  }
  function buildPowersBlock(campaignPowerLevel, pow, rng = Math.random) {
    const option = choosePowerSetOption(campaignPowerLevel, rng);
    const sets = assignPowerTypes(option, rng);
    return { powerPoints: pow, sets };
  }

  // js/engine/wealth.js
  var WEALTH_LEVELS = ["Destitute", "Poor", "Average", "Affluent", "Wealthy"];
  function pickWealthLevel(wealthText, rng = Math.random) {
    const mentioned = WEALTH_LEVELS.filter((lvl) => wealthText.includes(lvl));
    if (mentioned.length === 0) return "Average";
    const usuallyMatch = wealthText.match(/usually (\w+)/i);
    const usually = usuallyMatch && WEALTH_LEVELS.find((l) => l.toLowerCase() === usuallyMatch[1].toLowerCase());
    if (usually && rng() < 0.6) return usually;
    return mentioned[Math.floor(rng() * mentioned.length)];
  }

  // js/engine/characterFactory.js
  function defaultOptions() {
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
      gender: ""
    };
  }
  function extraPersonalSkillSlots(rng, exclude) {
    const pool = SKILLS.filter((s) => !exclude.has(s.name));
    const count = 5 + Math.floor(rng() * 6);
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
  function generateRandomCharacter(userOptions = {}, rng = Math.random) {
    const options = { ...defaultOptions(), ...userOptions };
    const level = options.campaignPowerLevel;
    let chars = generateCharacteristics(options.characteristicMethod, rng, level);
    if (options.useEDU) chars.EDU = roll2d6plus6(rng);
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
    const derived = computeDerived(chars, {
      totalHitPointsOption: options.useTotalHitPoints,
      fatigueOption: options.useFatigue,
      sanityOption: options.useSanity,
      hitLocationOption: options.useHitLocation
    });
    const powers = options.usePowers ? buildPowersBlock(level, derived.powerPoints, rng) : null;
    const professionName = options.profession ?? PROFESSIONS[Math.floor(rng() * PROFESSIONS.length)].name;
    const profession = findProfession(professionName);
    if (!profession) throw new Error(`Unknown profession: ${professionName}`);
    const professionSkillNames = resolveProfessionSkills(profession, rng);
    const skillOptions = { useCategoryBonus: options.useCategoryBonus, categoryBonusMethod: options.categoryBonusMethod, usePowers: options.usePowers };
    const entries = baselineSkillEntries(chars, skillOptions);
    for (const name of professionSkillNames) ensureSkillEntry(entries, name, chars, skillOptions);
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
    const professionalPool = Math.max(0, professionalSkillPointPool(level, { eduOption: options.useEDU, edu: chars.EDU }) + skillPointModifier);
    const professionalCap = professionalSkillCap(level);
    const professionalSlots = professionSkillNames.map((name) => ({
      key: name,
      headroom: Math.max(0, professionalCap - currentTotalBeforePoints(entries[name]))
    }));
    const professionalAllocation = allocatePointsRandomly(professionalPool, professionalSlots, rng);
    for (const [key, pts] of Object.entries(professionalAllocation)) entries[key].professionalPoints += pts;
    const personalPool = personalSkillPointPool(chars.INT, level, { increasedOption: options.useIncreasedPersonalPoints });
    const personalCap = personalSkillCap(level);
    const alreadyNamed = new Set(Object.keys(entries));
    const extraNames = extraPersonalSkillSlots(rng, alreadyNamed);
    for (const name of extraNames) ensureSkillEntry(entries, name, chars, skillOptions);
    const personalCandidateKeys = [.../* @__PURE__ */ new Set([...professionSkillNames, ...personality?.skills ?? [], ...extraNames])];
    const personalSlots = personalCandidateKeys.map((name) => ({
      key: name,
      headroom: Math.max(0, personalCap - skillTotal(entries[name]))
    }));
    const personalAllocation = allocatePointsRandomly(personalPool, personalSlots, rng);
    for (const [key, pts] of Object.entries(personalAllocation)) entries[key].personalPoints += pts;
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
      options
    };
  }

  // js/ui/render.js
  var ROLL_LABELS = { STR: "Effort", CON: "Stamina", INT: "Idea", POW: "Luck", DEX: "Agility", CHA: "Charm", EDU: "Knowledge" };
  function el(tag, attrs = {}, children = []) {
    const node = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (k === "text") node.textContent = v;
      else if (k === "html") node.innerHTML = v;
      else if (k.startsWith("on") && typeof v === "function") node.addEventListener(k.slice(2), v);
      else node.setAttribute(k, v);
    }
    for (const child of [].concat(children)) {
      if (child) node.appendChild(child);
    }
    return node;
  }
  function characteristicsCard(character) {
    const rows = Object.entries(character.characteristics).map(([key, value]) => {
      const rollLabel = ROLL_LABELS[key];
      const roll = rollLabel ? character.characteristicRolls[rollLabel] : null;
      return el("tr", {}, [
        el("td", { text: `${key}${rollLabel ? ` (${rollLabel})` : ""}` }),
        el("td", { text: roll != null ? `${value}  (${roll}%)` : `${value}` })
      ]);
    });
    return el("div", { class: "card" }, [
      el("h3", { text: "Characteristics" }),
      el("table", { class: "char-table" }, rows)
    ]);
  }
  function derivedCard(character) {
    const d = character.derived;
    const rows = [
      ["Damage Modifier", d.damageModifier],
      ["Hit Points", d.hitPoints],
      ["Major Wound Level", d.majorWoundLevel],
      ["Power Points", d.powerPoints],
      ["Experience Bonus", d.experienceBonus],
      ["Move", d.move]
    ];
    if (d.fatiguePoints != null) rows.push(["Fatigue Points", d.fatiguePoints]);
    if (d.sanityPoints != null) rows.push(["Sanity Points", d.sanityPoints]);
    const card = el("div", { class: "card" }, [
      el("h3", { text: "Derived Characteristics" }),
      el(
        "table",
        { class: "char-table" },
        rows.map(([label, value]) => el("tr", {}, [el("td", { text: label }), el("td", { text: String(value) })]))
      )
    ]);
    if (d.hitPointsByLocation) {
      const locRows = Object.entries(d.hitPointsByLocation).map(
        ([loc, hp]) => el("tr", {}, [el("td", { text: loc }), el("td", { text: String(hp) })])
      );
      card.appendChild(el("h3", { text: "Hit Points by Location", style: "margin-top:10px" }));
      card.appendChild(el("table", { class: "char-table" }, locRows));
    }
    return card;
  }
  function summaryCard(character) {
    const rows = [
      ["Profession", character.profession],
      ["Wealth", character.wealth],
      ["Age", character.age],
      ["Gender", character.gender || "-"]
    ];
    if (character.personality) rows.push(["Personality", character.personality.name]);
    const card = el("div", { class: "card" }, [
      el("h3", { text: "Summary" }),
      el(
        "table",
        { class: "char-table" },
        rows.map(([label, value]) => el("tr", {}, [el("td", { text: label }), el("td", { text: String(value) })]))
      )
    ]);
    if (character.professionDescription) {
      card.appendChild(el("p", { text: character.professionDescription, style: "color:var(--text-dim); font-size:0.82rem; margin-top:8px;" }));
    }
    if (character.special) {
      card.appendChild(el("p", { html: `<strong>Special:</strong> ${character.special}`, style: "font-size:0.82rem; margin-top:4px;" }));
    }
    if (character.personality) {
      card.appendChild(el("p", { text: character.personality.description, style: "color:var(--text-dim); font-size:0.82rem; margin-top:4px;" }));
    }
    return card;
  }
  function featuresCard(character) {
    if (!character.distinctiveFeatures?.length) return null;
    const list = el(
      "ul",
      { class: "features-list" },
      character.distinctiveFeatures.map((f) => el("li", { text: `${f.category}: ${f.description}` }))
    );
    return el("div", { class: "card" }, [el("h3", { text: "Distinctive Features" }), list]);
  }
  function powersCard(character) {
    if (!character.powers) return null;
    const list = el(
      "ul",
      { class: "powers-list" },
      character.powers.sets.map(
        (s) => el("li", { text: `${s.name} (${s.level} power level, resists via ${s.resistance})` })
      )
    );
    return el("div", { class: "card" }, [
      el("h3", { text: `Powers -- ${character.powers.powerPoints} Power Points` }),
      list,
      el("p", {
        text: "Groundwork only: specific spells/mutations/talents are not generated and can be filled in during play.",
        style: "color:var(--text-dim); font-size:0.8rem; margin-top:6px;"
      })
    ]);
  }
  function skillsSection(character) {
    const trained = /* @__PURE__ */ new Set();
    if (character.personality) for (const s of character.personality.skills) trained.add(s);
    const entries = Object.values(character.skills).map((e) => ({ ...e, total: skillTotal(e) }));
    entries.sort((a, b) => a.name.localeCompare(b.name));
    const grid = el("div", { class: "skills-grid" });
    for (const category of SKILL_CATEGORIES) {
      const inCategory = entries.filter((e) => e.category === category);
      if (inCategory.length === 0) continue;
      grid.appendChild(el("div", { class: "category-heading", text: category }));
      for (const entry of inCategory) {
        const wasTrained = entry.professionalPoints > 0 || entry.personalPoints > 0 || entry.personalityBonus > 0;
        grid.appendChild(
          el("div", { class: `skill-row${wasTrained ? " trained" : ""}`, title: `base ${entry.base} + category ${entry.categoryBonus} + personality ${entry.personalityBonus} + profession ${entry.professionalPoints} + personal ${entry.personalPoints}` }, [
            el("span", { class: "skill-name", text: entry.name }),
            el("span", { class: "skill-total", text: `${entry.total}%` })
          ])
        );
      }
    }
    return el("div", { class: "skills-section" }, [
      el("h3", { text: "Skills" }),
      el("p", { text: `Professional skill points: ${character.professionalSkillPointPool} | Personal skill points: ${character.personalSkillPointPool}`, style: "color:var(--text-dim); font-size:0.8rem;" }),
      grid
    ]);
  }
  function renderCharacterSheet(container, character, { onNameChange, onGenderChange } = {}) {
    container.innerHTML = "";
    const nameInput = el("input", {
      type: "text",
      value: character.name || "",
      placeholder: "Character name",
      oninput: (e) => onNameChange?.(e.target.value)
    });
    const header = el("div", { class: "sheet-header" }, [
      el("div", {}, [
        nameInput,
        el("div", { class: "sheet-subline", text: `${character.profession} \u2022 ${character.gender || "unspecified"} \u2022 age ${character.age}` })
      ])
    ]);
    const grid = el("div", { class: "sheet-grid" }, [
      summaryCard(character),
      characteristicsCard(character),
      derivedCard(character),
      featuresCard(character),
      powersCard(character)
    ]);
    container.appendChild(header);
    container.appendChild(grid);
    container.appendChild(skillsSection(character));
  }

  // js/ui/storage.js
  var STORAGE_KEY = "brp-characters-v1";
  var PROBE_KEY = "__brp_storage_probe__";
  var memoryFallback = [];
  var persistent = null;
  function detectPersistence() {
    if (persistent != null) return persistent;
    try {
      window.localStorage.setItem(PROBE_KEY, "1");
      window.localStorage.removeItem(PROBE_KEY);
      persistent = true;
    } catch {
      persistent = false;
    }
    return persistent;
  }
  function isStoragePersistent() {
    return detectPersistence();
  }
  function loadAllCharacters() {
    if (!detectPersistence()) return [...memoryFallback];
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [...memoryFallback];
    }
  }
  function saveAllCharacters(list) {
    memoryFallback = list;
    if (!detectPersistence()) return false;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
      return true;
    } catch {
      return false;
    }
  }
  function saveCharacter(character) {
    const list = loadAllCharacters();
    const idx = list.findIndex((c) => c._id === character._id);
    if (idx >= 0) list[idx] = character;
    else list.push(character);
    saveAllCharacters(list);
    return list;
  }
  function deleteCharacter(id) {
    const list = loadAllCharacters().filter((c) => c._id !== id);
    saveAllCharacters(list);
    return list;
  }
  function newCharacterId() {
    return `char_${Date.now()}_${Math.floor(Math.random() * 1e6)}`;
  }

  // js/ui/export.js
  function triggerDownload(filename, blob) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1e3);
  }
  function safeFileBase(character) {
    const base = (character.name || character.profession || "brp-character").trim();
    return base.replace(/[^a-z0-9\-_ ]/gi, "").replace(/\s+/g, "-").toLowerCase() || "brp-character";
  }
  function exportToJson(character) {
    const blob = new Blob([JSON.stringify(character, null, 2)], { type: "application/json" });
    triggerDownload(`${safeFileBase(character)}.json`, blob);
  }
  function sortedSkillEntries(character) {
    return Object.values(character.skills).map((e) => ({ ...e, total: skillTotal(e) })).sort((a, b) => a.name.localeCompare(b.name));
  }
  function characterToMarkdown(character) {
    const lines = [];
    lines.push(`# ${character.name || "Unnamed Character"}`);
    lines.push("");
    lines.push(`**Profession:** ${character.profession}  `);
    lines.push(`**Gender:** ${character.gender || "-"}  `);
    lines.push(`**Age:** ${character.age}  `);
    lines.push(`**Wealth:** ${character.wealth}  `);
    if (character.personality) lines.push(`**Personality:** ${character.personality.name} -- ${character.personality.description}  `);
    lines.push("");
    lines.push("## Characteristics");
    lines.push("");
    lines.push("| Characteristic | Value | Roll |");
    lines.push("|---|---|---|");
    const rollNames = { STR: "Effort", CON: "Stamina", INT: "Idea", POW: "Luck", DEX: "Agility", CHA: "Charm", EDU: "Knowledge" };
    for (const [key, value] of Object.entries(character.characteristics)) {
      const rollName = rollNames[key];
      const roll = rollName ? character.characteristicRolls[rollName] : "";
      lines.push(`| ${key} | ${value} | ${roll ?? ""} |`);
    }
    lines.push("");
    lines.push("## Derived Characteristics");
    lines.push("");
    lines.push(`- Damage Modifier: ${character.derived.damageModifier}`);
    lines.push(`- Hit Points: ${character.derived.hitPoints}`);
    lines.push(`- Major Wound Level: ${character.derived.majorWoundLevel}`);
    lines.push(`- Power Points: ${character.derived.powerPoints}`);
    lines.push(`- Experience Bonus: ${character.derived.experienceBonus}`);
    lines.push(`- Move: ${character.derived.move}`);
    if (character.derived.fatiguePoints != null) lines.push(`- Fatigue Points: ${character.derived.fatiguePoints}`);
    if (character.derived.sanityPoints != null) lines.push(`- Sanity Points: ${character.derived.sanityPoints}`);
    lines.push("");
    if (character.distinctiveFeatures?.length) {
      lines.push("## Distinctive Features");
      lines.push("");
      for (const f of character.distinctiveFeatures) lines.push(`- ${f.category}: ${f.description}`);
      lines.push("");
    }
    if (character.powers) {
      lines.push("## Powers");
      lines.push("");
      lines.push(`Power Points: ${character.powers.powerPoints}`);
      lines.push("");
      for (const set of character.powers.sets) lines.push(`- ${set.name} (${set.level})`);
      lines.push("");
    }
    lines.push("## Skills");
    lines.push("");
    lines.push("| Skill | Category | Total % |");
    lines.push("|---|---|---|");
    for (const entry of sortedSkillEntries(character)) {
      lines.push(`| ${entry.name} | ${entry.category} | ${entry.total} |`);
    }
    lines.push("");
    return lines.join("\n");
  }
  function exportToMarkdown(character) {
    const md = characterToMarkdown(character);
    const blob = new Blob([md], { type: "text/markdown" });
    triggerDownload(`${safeFileBase(character)}.md`, blob);
  }
  function exportToPdf(character) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ unit: "pt", format: "letter" });
    const marginX = 40;
    let y = 50;
    const lineHeight = 14;
    const addLine = (text, opts = {}) => {
      const { size = 10, bold = false, gap = lineHeight } = opts;
      doc.setFontSize(size);
      doc.setFont(void 0, bold ? "bold" : "normal");
      if (y > 760) {
        doc.addPage();
        y = 50;
      }
      doc.text(text, marginX, y);
      y += gap;
    };
    addLine(character.name || "Unnamed Character", { size: 18, bold: true, gap: 22 });
    addLine(`${character.profession} - ${character.gender || "?"}, Age ${character.age}, ${character.wealth}`, { size: 11 });
    y += 6;
    addLine("Characteristics", { size: 13, bold: true, gap: 18 });
    const charLine = Object.entries(character.characteristics).map(([k, v]) => `${k} ${v}`).join("   ");
    addLine(charLine, { size: 10 });
    y += 6;
    addLine("Derived", { size: 13, bold: true, gap: 18 });
    addLine(
      `Damage Mod ${character.derived.damageModifier}   HP ${character.derived.hitPoints}   Major Wound ${character.derived.majorWoundLevel}   PP ${character.derived.powerPoints}   Exp Bonus ${character.derived.experienceBonus}   Move ${character.derived.move}`,
      { size: 10 }
    );
    if (character.derived.fatiguePoints != null) addLine(`Fatigue ${character.derived.fatiguePoints}`, { size: 10 });
    if (character.derived.sanityPoints != null) addLine(`Sanity ${character.derived.sanityPoints}`, { size: 10 });
    y += 6;
    if (character.personality) {
      addLine("Personality", { size: 13, bold: true, gap: 18 });
      addLine(`${character.personality.name}: ${character.personality.description}`, { size: 10 });
      y += 6;
    }
    addLine("Skills", { size: 13, bold: true, gap: 18 });
    for (const entry of sortedSkillEntries(character)) {
      addLine(`${entry.name}  ${entry.total}%`, { size: 9, gap: 12 });
    }
    if (character.distinctiveFeatures?.length) {
      y += 6;
      addLine("Distinctive Features", { size: 13, bold: true, gap: 18 });
      for (const f of character.distinctiveFeatures) addLine(`${f.category}: ${f.description}`, { size: 9, gap: 12 });
    }
    doc.save(`${safeFileBase(character)}.pdf`);
  }

  // js/ui/app.js
  var currentCharacter = null;
  var $ = (id) => document.getElementById(id);
  function populateProfessionSelect() {
    const select = $("opt-profession");
    for (const p of [...PROFESSIONS].sort((a, b) => a.name.localeCompare(b.name))) {
      const opt = document.createElement("option");
      opt.value = p.name;
      opt.textContent = p.name;
      select.appendChild(opt);
    }
  }
  function readOptionsFromForm() {
    const options = defaultOptions();
    options.campaignPowerLevel = $("opt-campaign-level").value;
    options.characteristicMethod = $("opt-char-method").value;
    const professionValue = $("opt-profession").value;
    options.profession = professionValue || null;
    const ageValue = $("opt-age").value;
    options.age = ageValue ? parseInt(ageValue, 10) : null;
    options.name = $("opt-name").value.trim();
    options.gender = $("opt-gender").value.trim();
    options.useEDU = $("opt-edu").checked;
    options.useAgeModifiers = $("opt-age-modifiers").checked;
    options.useCategoryBonus = $("opt-category-bonus").checked;
    options.categoryBonusMethod = document.querySelector('input[name="opt-category-method"]:checked').value;
    options.useIncreasedPersonalPoints = $("opt-increased-personal").checked;
    options.usePersonality = $("opt-personality").checked;
    options.useDistinctiveFeatures = $("opt-distinctive-features").checked;
    options.useTotalHitPoints = $("opt-total-hp").checked;
    options.useHitLocation = $("opt-hit-location").checked;
    options.useFatigue = $("opt-fatigue").checked;
    options.useSanity = $("opt-sanity").checked;
    options.usePowers = $("opt-powers").checked;
    return options;
  }
  function showSheet(character) {
    currentCharacter = character;
    $("sheet-panel").hidden = false;
    renderCharacterSheet($("character-sheet"), character, {
      onNameChange: (value) => {
        currentCharacter.name = value;
      }
    });
    $("sheet-panel").scrollIntoView?.({ behavior: "smooth", block: "start" });
  }
  function generate() {
    const options = readOptionsFromForm();
    const character = generateRandomCharacter(options);
    if (!character._id) character._id = newCharacterId();
    showSheet(character);
  }
  function renderSavedList() {
    const list = $("saved-character-list");
    list.innerHTML = "";
    const characters = loadAllCharacters();
    if (characters.length === 0) {
      list.appendChild(Object.assign(document.createElement("li"), { className: "empty-hint", textContent: "No saved characters yet." }));
      return;
    }
    for (const c of characters.slice().reverse()) {
      const li = document.createElement("li");
      const info = document.createElement("div");
      info.innerHTML = `<div class="char-name">${c.name || "(unnamed)"}</div><div class="char-meta">${c.profession}, age ${c.age}</div>`;
      info.style.cursor = "pointer";
      info.addEventListener("click", () => showSheet(c));
      const delBtn = document.createElement("button");
      delBtn.className = "delete-btn";
      delBtn.textContent = "\u2715";
      delBtn.title = "Delete";
      delBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        deleteCharacter(c._id);
        renderSavedList();
      });
      li.appendChild(info);
      li.appendChild(delBtn);
      list.appendChild(li);
    }
  }
  function wireEvents() {
    $("btn-generate").addEventListener("click", generate);
    $("btn-regenerate").addEventListener("click", generate);
    $("btn-new-character").addEventListener("click", () => {
      $("sheet-panel").hidden = true;
      currentCharacter = null;
      $("opt-name").value = "";
      $("opt-gender").value = "";
      $("opt-age").value = "";
    });
    $("btn-save").addEventListener("click", () => {
      if (!currentCharacter) return;
      saveCharacter(currentCharacter);
      renderSavedList();
    });
    $("btn-export-json").addEventListener("click", () => currentCharacter && exportToJson(currentCharacter));
    $("btn-export-md").addEventListener("click", () => currentCharacter && exportToMarkdown(currentCharacter));
    $("btn-export-pdf").addEventListener("click", () => currentCharacter && exportToPdf(currentCharacter));
    $("toggle-settings").addEventListener("click", () => {
      const body = $("settings-body");
      const hidden = body.style.display === "none";
      body.style.display = hidden ? "" : "none";
      $("toggle-settings").textContent = hidden ? "hide" : "show";
    });
    $("opt-category-bonus").addEventListener("change", (e) => {
      $("category-bonus-sub").style.opacity = e.target.checked ? "1" : "0.4";
    });
  }
  function init() {
    populateProfessionSelect();
    wireEvents();
    renderSavedList();
    $("storage-warning").hidden = isStoragePersistent();
  }
  init();
})();
