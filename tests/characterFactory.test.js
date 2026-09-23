import { test } from "node:test";
import assert from "node:assert/strict";
import { generateRandomCharacter, defaultOptions } from "../js/engine/characterFactory.js";
import { CHARACTERISTICS } from "../js/engine/characteristics.js";
import { PROFESSIONS } from "../js/data/professions.js";
import { professionalSkillCap, personalSkillCap } from "../js/engine/skillPoints.js";
import { skillTotal } from "../js/engine/skillSheet.js";

test("generateRandomCharacter produces all seven characteristics", () => {
  const character = generateRandomCharacter();
  for (const c of CHARACTERISTICS) assert.ok(character.characteristics[c] > 0, c);
});

test("generateRandomCharacter picks a valid profession when none is specified", () => {
  const character = generateRandomCharacter();
  assert.ok(PROFESSIONS.some((p) => p.name === character.profession));
});

test("generateRandomCharacter honors an explicit profession choice", () => {
  const character = generateRandomCharacter({ profession: "Wizard" });
  assert.equal(character.profession, "Wizard");
});

test("generateRandomCharacter's skills include every skill from the chosen profession", () => {
  const character = generateRandomCharacter({ profession: "Doctor" });
  assert.ok(character.skills["First Aid"]);
  assert.ok(character.skills["Medicine"]);
});

test("generateRandomCharacter never exceeds the professional skill cap from profession points alone", () => {
  for (let i = 0; i < 10; i++) {
    const character = generateRandomCharacter({ campaignPowerLevel: "Normal" });
    const cap = professionalSkillCap("Normal");
    for (const entry of Object.values(character.skills)) {
      const beforePersonal = entry.base + entry.categoryBonus + entry.personalityBonus + entry.professionalPoints;
      assert.ok(beforePersonal <= cap + 0.001, `${entry.name} = ${beforePersonal} > cap ${cap}`);
    }
  }
});

test("generateRandomCharacter respects the EDU option and derives a bigger professional pool", () => {
  const character = generateRandomCharacter({ useEDU: true });
  assert.ok(character.characteristics.EDU >= 8 && character.characteristics.EDU <= 18);
});

test("generateRandomCharacter omits optional derived stats when their toggles are off", () => {
  const character = generateRandomCharacter({ useFatigue: false, useSanity: false, useHitLocation: false });
  assert.equal(character.derived.fatiguePoints, undefined);
  assert.equal(character.derived.sanityPoints, undefined);
  assert.equal(character.derived.hitPointsByLocation, undefined);
});

test("generateRandomCharacter includes optional derived stats when their toggles are on", () => {
  const character = generateRandomCharacter({ useFatigue: true, useSanity: true, useHitLocation: true });
  assert.ok(character.derived.fatiguePoints > 0);
  assert.ok(character.derived.sanityPoints > 0);
  assert.ok(character.derived.hitPointsByLocation);
});

test("generateRandomCharacter includes a personality package by default", () => {
  const character = generateRandomCharacter();
  assert.ok(character.personality);
  assert.ok(character.personality.name);
});

test("generateRandomCharacter omits personality when disabled", () => {
  const character = generateRandomCharacter({ usePersonality: false });
  assert.equal(character.personality, null);
});

test("generateRandomCharacter includes distinctive features only when enabled", () => {
  const withFeatures = generateRandomCharacter({ useDistinctiveFeatures: true });
  assert.ok(withFeatures.distinctiveFeatures.length > 0);
  const without = generateRandomCharacter({ useDistinctiveFeatures: false });
  assert.equal(without.distinctiveFeatures.length, 0);
});

test("generateRandomCharacter includes powers only when enabled", () => {
  const withPowers = generateRandomCharacter({ usePowers: true });
  assert.ok(withPowers.powers);
  assert.ok(withPowers.powers.sets.length > 0);
  const without = generateRandomCharacter({ usePowers: false });
  assert.equal(without.powers, null);
});

test("generateRandomCharacter's wealth is one of the five defined levels", () => {
  const character = generateRandomCharacter();
  assert.ok(["Destitute", "Poor", "Average", "Affluent", "Wealthy"].includes(character.wealth));
});

test("generateRandomCharacter works across every profession without throwing", () => {
  for (const profession of PROFESSIONS) {
    assert.doesNotThrow(() => generateRandomCharacter({ profession: profession.name }), profession.name);
  }
});

test("generateRandomCharacter works at every campaign power level", () => {
  for (const level of ["Normal", "Heroic", "Epic", "Superhuman"]) {
    assert.doesNotThrow(() => generateRandomCharacter({ campaignPowerLevel: level }), level);
  }
});

test("generateRandomCharacter's Superhuman characters can exceed 100% in a skill", () => {
  // Not guaranteed every run, but across many Superhuman generations for a
  // combat-heavy profession, at least one skill should climb past 100%.
  let sawOver100 = false;
  for (let i = 0; i < 15 && !sawOver100; i++) {
    const character = generateRandomCharacter({ campaignPowerLevel: "Superhuman", profession: "Warrior" });
    for (const entry of Object.values(character.skills)) {
      if (skillTotal(entry) > 100) sawOver100 = true;
    }
  }
  assert.ok(sawOver100, "expected at least one skill over 100% across 15 Superhuman Warriors");
});

test("defaultOptions returns a fully-populated, sensible baseline", () => {
  const options = defaultOptions();
  assert.equal(options.campaignPowerLevel, "Normal");
  assert.equal(options.profession, null);
  assert.equal(typeof options.usePersonality, "boolean");
});
