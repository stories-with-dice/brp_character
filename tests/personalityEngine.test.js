import { test } from "node:test";
import assert from "node:assert/strict";
import { rollPersonalityType, resolvePersonalitySkills, resolvePersonalitySkillsManual, buildCustomPersonality } from "../js/engine/personalityEngine.js";
import { PERSONALITY_TYPES, PERSONALITY_SKILL_COUNT } from "../js/data/personality.js";
import { SKILLS } from "../js/data/skills.js";

test("rollPersonalityType always returns one of the four defined types", () => {
  for (let i = 0; i < 50; i++) {
    const type = rollPersonalityType();
    assert.ok(PERSONALITY_TYPES.includes(type));
  }
});

test("resolvePersonalitySkills includes every fixed skill in the package", () => {
  const brutal = PERSONALITY_TYPES.find((p) => p.name === "Brutal");
  const names = resolvePersonalitySkills(brutal);
  for (const skill of brutal.skills) assert.ok(names.includes(skill));
});

test("resolvePersonalitySkills adds the correct number of combat-skill choices", () => {
  const brutal = PERSONALITY_TYPES.find((p) => p.name === "Brutal");
  const names = resolvePersonalitySkills(brutal);
  assert.equal(names.length, brutal.skills.length + brutal.combatChoices);
});

test("resolvePersonalitySkills resolves specialty choices (Skilled has a Craft pick)", () => {
  const skilled = PERSONALITY_TYPES.find((p) => p.name === "Skilled");
  const names = resolvePersonalitySkills(skilled);
  assert.ok(names.some((n) => n.startsWith("Craft (")));
});

test("resolvePersonalitySkills never leaves a weapon-class combat pick without a specialty", () => {
  // Regression test: combat-choice picks used to add bare weapon-class names
  // (e.g. "Firearm" with no specialty), which isn't a usable skill per the
  // book. Run many times since the pick is random.
  const brutal = PERSONALITY_TYPES.find((p) => p.name === "Brutal");
  const weaponClassBases = ["Firearm", "Melee Weapon", "Missile Weapon", "Energy Weapon", "Heavy Weapon", "Artillery", "Parry", "Shield"];
  for (let i = 0; i < 50; i++) {
    const names = resolvePersonalitySkills(brutal);
    for (const name of names) {
      if (weaponClassBases.includes(name)) {
        assert.fail(`"${name}" was added without a specialty`);
      }
    }
  }
});

test("resolvePersonalitySkillsManual builds the exact list from the player's picks", () => {
  const brutal = PERSONALITY_TYPES.find((p) => p.name === "Brutal");
  const names = resolvePersonalitySkillsManual(brutal, { combatChoices: ["Firearm (Rifle)", "Melee Weapon (Sword)"] });
  for (const skill of brutal.skills) assert.ok(names.includes(skill));
  assert.ok(names.includes("Firearm (Rifle)"));
  assert.ok(names.includes("Melee Weapon (Sword)"));
  assert.equal(names.length, brutal.skills.length + 2);
});

test("resolvePersonalitySkillsManual throws when the combat pick count is wrong", () => {
  const brutal = PERSONALITY_TYPES.find((p) => p.name === "Brutal");
  assert.throws(() => resolvePersonalitySkillsManual(brutal, { combatChoices: ["Brawl"] }));
});

test("resolvePersonalitySkillsManual throws when a combat pick isn't actually a combat skill", () => {
  const brutal = PERSONALITY_TYPES.find((p) => p.name === "Brutal");
  assert.throws(() => resolvePersonalitySkillsManual(brutal, { combatChoices: ["Persuade", "Brawl"] }));
});

test("resolvePersonalitySkillsManual throws when a combat pick duplicates a fixed skill", () => {
  const brutal = PERSONALITY_TYPES.find((p) => p.name === "Brutal");
  // Brawl and Grapple are already fixed skills of Brutal.
  assert.throws(() => resolvePersonalitySkillsManual(brutal, { combatChoices: ["Brawl", "Grapple"] }));
});

test("resolvePersonalitySkillsManual validates craft/knowledge/technical/language specialty picks", () => {
  const skilled = PERSONALITY_TYPES.find((p) => p.name === "Skilled");
  const names = resolvePersonalitySkillsManual(skilled, {
    craftChoices: ["Craft (Blacksmithing)"],
    knowledgeChoices: ["Knowledge (History)"],
    combatChoices: ["Brawl"],
  });
  assert.ok(names.includes("Craft (Blacksmithing)"));
  assert.ok(names.includes("Knowledge (History)"));
});

test("resolvePersonalitySkillsManual rejects a specialty pick for the wrong base skill", () => {
  const skilled = PERSONALITY_TYPES.find((p) => p.name === "Skilled");
  assert.throws(() =>
    resolvePersonalitySkillsManual(skilled, {
      craftChoices: ["Knowledge (History)"], // wrong base for craftChoices
      knowledgeChoices: ["Knowledge (History)"],
      combatChoices: ["Brawl"],
    })
  );
});

test("buildCustomPersonality accepts exactly 13 distinct skills", () => {
  const thirteen = SKILLS.slice(0, 13).map((s) => s.name);
  const personality = buildCustomPersonality(thirteen);
  assert.equal(personality.name, "Custom");
  assert.equal(personality.skills.length, PERSONALITY_SKILL_COUNT);
});

test("buildCustomPersonality rejects a count other than 13", () => {
  const twelve = SKILLS.slice(0, 12).map((s) => s.name);
  assert.throws(() => buildCustomPersonality(twelve));
});

test("buildCustomPersonality rejects duplicate skills", () => {
  const dupes = [...SKILLS.slice(0, 12).map((s) => s.name), SKILLS[0].name];
  assert.throws(() => buildCustomPersonality(dupes));
});
