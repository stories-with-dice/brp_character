import { test } from "node:test";
import assert from "node:assert/strict";
import { rollPersonalityType, resolvePersonalitySkills } from "../js/engine/personalityEngine.js";
import { PERSONALITY_TYPES } from "../js/data/personality.js";

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
