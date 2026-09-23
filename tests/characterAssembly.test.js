import { test } from "node:test";
import assert from "node:assert/strict";
import { assembleCharacter } from "../js/engine/characterAssembly.js";

const chars = { STR: 10, CON: 12, SIZ: 14, INT: 16, POW: 8, DEX: 18, CHA: 11 };
const minimalParts = {
  age: 22,
  professionName: "Warrior",
  professionDescription: "Fights stuff.",
  wealth: "Poor",
  characteristics: chars,
  derived: { hitPoints: 13 },
  skills: {},
  professionalSkillPointPool: 250,
  personalSkillPointPool: 160,
  options: { campaignPowerLevel: "Normal" },
};

test("assembleCharacter computes characteristicRolls from the given characteristics", () => {
  const character = assembleCharacter(minimalParts);
  assert.equal(character.characteristicRolls.Effort, 50);
  assert.equal(character.characteristicRolls.Agility, 90);
});

test("assembleCharacter defaults name/gender/description/background/possessionsNotes to empty strings", () => {
  const character = assembleCharacter(minimalParts);
  assert.equal(character.name, "");
  assert.equal(character.gender, "");
  assert.equal(character.description, "");
  assert.equal(character.background, "");
  assert.equal(character.possessionsNotes, "");
});

test("assembleCharacter defaults personality/powers to null and distinctiveFeatures to []", () => {
  const character = assembleCharacter(minimalParts);
  assert.equal(character.personality, null);
  assert.equal(character.powers, null);
  assert.deepEqual(character.distinctiveFeatures, []);
});

test("assembleCharacter defaults special to null when the profession has none", () => {
  const character = assembleCharacter(minimalParts);
  assert.equal(character.special, null);
});

test("assembleCharacter passes through every supplied field unchanged", () => {
  const character = assembleCharacter({
    ...minimalParts,
    name: "Rogar",
    gender: "Male",
    special: "Can use magic",
    personality: { name: "Brutal", description: "...", skills: ["Brawl"] },
    distinctiveFeatures: [{ category: "Facial Feature", description: "Scar" }],
    powers: { powerPoints: 12, sets: [] },
    description: "Tall and grim.",
    background: "Orphaned young.",
    possessionsNotes: "A rusty sword.",
  });
  assert.equal(character.name, "Rogar");
  assert.equal(character.gender, "Male");
  assert.equal(character.special, "Can use magic");
  assert.equal(character.personality.name, "Brutal");
  assert.equal(character.distinctiveFeatures.length, 1);
  assert.equal(character.powers.powerPoints, 12);
  assert.equal(character.description, "Tall and grim.");
  assert.equal(character.background, "Orphaned young.");
  assert.equal(character.possessionsNotes, "A rusty sword.");
});

test("assembleCharacter uses professionName as the profession field", () => {
  const character = assembleCharacter(minimalParts);
  assert.equal(character.profession, "Warrior");
});
