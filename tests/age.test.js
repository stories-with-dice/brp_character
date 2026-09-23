import { test } from "node:test";
import assert from "node:assert/strict";
import { rollStartingAge, ageModifiers, DEFAULT_MIN_AGE, applyCharacteristicReductions } from "../js/engine/age.js";

test("rollStartingAge is bounded 18-23 (17+1D6)", () => {
  for (let i = 0; i < 200; i++) {
    const age = rollStartingAge();
    assert.ok(age >= 18 && age <= 23, `age out of range: ${age}`);
  }
});

test("ageModifiers gives zero modifiers at the default minimum age", () => {
  const mods = ageModifiers(DEFAULT_MIN_AGE, "Heroic");
  assert.equal(mods.skillPointModifier, 0);
  assert.equal(mods.characteristicPenalties, 0);
  assert.equal(mods.youngCharacteristicPenalty, 0);
});

test("ageModifiers adds skill points per full decade over minimum age, by campaign level", () => {
  assert.equal(ageModifiers(28, "Heroic").skillPointModifier, 20); // 1 full decade over 18
  assert.equal(ageModifiers(48, "Epic").skillPointModifier, 90); // 3 decades * 30
  assert.equal(ageModifiers(28, "Normal").skillPointModifier, 0); // Normal grants +0/decade
});

test("ageModifiers subtracts skill points per year under minimum age", () => {
  const mods = ageModifiers(15, "Heroic"); // 3 years under 18
  assert.equal(mods.skillPointModifier, -60);
  assert.equal(mods.youngCharacteristicPenalty, 3);
});

test("ageModifiers applies a characteristic penalty at 50+ and a larger one at 80+", () => {
  assert.equal(ageModifiers(55, "Normal").characteristicPenalties, 1);
  assert.equal(ageModifiers(85, "Normal").characteristicPenalties, 3);
  assert.equal(ageModifiers(49, "Normal").characteristicPenalties, 0);
});

test("applyCharacteristicReductions subtracts 1 from each named characteristic", () => {
  const chars = { STR: 12, CON: 12, DEX: 12, CHA: 12 };
  const result = applyCharacteristicReductions(chars, ["STR", "CHA"]);
  assert.equal(result.STR, 11);
  assert.equal(result.CHA, 11);
  assert.equal(result.CON, 12);
});

test("applyCharacteristicReductions allows the same characteristic to be picked more than once", () => {
  const chars = { STR: 12 };
  const result = applyCharacteristicReductions(chars, ["STR", "STR", "STR"]);
  assert.equal(result.STR, 9);
});

test("applyCharacteristicReductions does not mutate the input", () => {
  const chars = { STR: 12 };
  applyCharacteristicReductions(chars, ["STR"]);
  assert.equal(chars.STR, 12);
});

test("applyCharacteristicReductions clamps at the given minimum", () => {
  const chars = { STR: 2 };
  const result = applyCharacteristicReductions(chars, ["STR", "STR"], { min: 1 });
  assert.equal(result.STR, 1);
});

test("applyCharacteristicReductions throws on an unknown characteristic", () => {
  assert.throws(() => applyCharacteristicReductions({ STR: 10 }, ["XYZ"]));
});
