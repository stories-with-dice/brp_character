import { test } from "node:test";
import assert from "node:assert/strict";
import { characterToMarkdown, compendiumPowerRef } from "../js/ui/export.js";
import { generateRandomCharacter, defaultOptions } from "../js/engine/characterFactory.js";

function sampleCharacter(powers) {
  return {
    name: "Ada Vance",
    gender: "Female",
    age: 24,
    profession: "Occultist",
    wealth: "Wealthy",
    characteristics: { STR: 10, CON: 12, SIZ: 13, INT: 15, POW: 14, DEX: 11, CHA: 9, EDU: 16 },
    characteristicRolls: { Effort: 50, Stamina: 60, Idea: 75, Luck: 70, Agility: 55, Charm: 45, Knowledge: 80 },
    derived: {
      damageModifier: "None", hitPoints: 13, majorWoundLevel: 7, powerPoints: 14, experienceBonus: 8, move: 10,
      sanityPoints: 70, hitPointsByLocation: { head: 5, chest: 6 },
    },
    personality: { name: "Cunning", description: "Outsmarts opponents." },
    distinctiveFeatures: [{ category: "Scar", description: "Across the chin" }],
    skills: Object.fromEntries([
      { name: "Dodge", category: "Physical", base: 22 },
      { name: "Firearm (Rifle)", category: "Combat", base: 25, professionalPoints: 20 },
      { name: "Fly", category: "Physical", base: 0, categoryBonus: -2 },
    ].map((s) => [s.name, { categoryBonus: 0, personalityBonus: 0, professionalPoints: 0, personalPoints: 0, ...s }])),
    powers,
  };
}

test("characterToMarkdown writes the RPG Keeper BRP sheet layout", () => {
  const md = characterToMarkdown(sampleCharacter(null));
  assert.match(md, /^# Ada Vance \[BRP\]\n/);
  assert.match(md, /\nSTR: 10; CON: 12; SIZ: 13; INT: 15; POW: 14; DEX: 11; CHA: 9; EDU: 16\n/);
  assert.doesNotMatch(md, /```|\|/, "no code fence, no table");
  assert.match(md, /\nHP: 13\/13; PP: 14\/14; SAN: 70\/70\n/);
  assert.match(md, /\nMajor Wound: 7; Move: 10; Damage Modifier: None; Experience Bonus: 8\n/);
  assert.match(md, /Effort 50%, Stamina 60%, Idea 75%, Luck 70%, Agility 55%, Charm 45%, Knowledge 80%, Sanity 70%/);
  assert.match(md, /- \*\*Combat:\*\* Firearm \(Rifle\) 45%/);
  assert.match(md, /- \*\*Physical:\*\* Dodge 22%, Fly 0%/, "a negative skill total is written as 0%");
  assert.match(md, /\*\*Hit locations:\*\* Head 5 · Chest 6/);
  assert.doesNotMatch(md, /## Powers/);
});

test("characterToMarkdown links powers to the RPG Keeper Compendium and uses the powers' Power Points", () => {
  const md = characterToMarkdown(sampleCharacter({
    powerPoints: 20,
    sets: [{ type: "sorcery", name: "Sorcery", level: "Normal", powers: [{ name: "Heal", level: 2 }], extras: ["Grimoire"], budget: 4, spent: 2 }],
  }));
  assert.match(md, /PP: 20\/20/);
  assert.match(md, /### Sorcery \(Normal\), 2\/4 spell levels\n\n- \[Heal \(Sorcery\)\] level 2\n- Grimoire/);
});

test("compendiumPowerRef matches the RPG Keeper BRP Compendium names", () => {
  assert.equal(compendiumPowerRef("magic", { name: "Heal" }), "[Heal]");
  assert.equal(compendiumPowerRef("magic", { name: "Conjure Elemental" }), "[Conjure (type) Elemental]");
  assert.equal(compendiumPowerRef("sorcery", { name: "Hell's Razor" }), "[Hell’s Razor]");
  assert.equal(compendiumPowerRef("superpowers", { name: "Teleport" }), "[Teleport (Superpower)]");
  assert.equal(compendiumPowerRef("psychic", { name: "Sensitivity" }), "[Sensitivity (Psychic Ability)]");
  assert.equal(compendiumPowerRef("mutation", { name: "Allergy", adverse: true }), "[Allergy (Adverse)]");
  assert.equal(compendiumPowerRef("mutation", { name: "Coloration" }), "[Coloration (Minor)]");
});

test("characterToMarkdown handles random characters with every option on", () => {
  for (let i = 0; i < 50; i++) {
    const options = { ...defaultOptions(), usePowers: true, campaignPowerLevel: ["Normal", "Heroic", "Epic", "Superhuman"][i % 4] };
    const md = characterToMarkdown(generateRandomCharacter(options));
    assert.match(md, /^# \S.* \[BRP\]\n/, "every random character has a name");
    assert.match(md, /; DEX: \d+;/);
    assert.match(md, /\nHP: \d+\/\d+; PP: \d+\/\d+/);
    assert.doesNotMatch(md, /undefined|NaN/);
  }
});
