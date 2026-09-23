import { test } from "node:test";
import assert from "node:assert/strict";
import {
  CHARACTERISTICS,
  rollStandardCharacteristics,
  rollChooseableCharacteristics,
  rollHigherStartCharacteristics,
  pointBuyBaseline,
  pointBuyCost,
  applyRedistribution,
  characteristicRolls,
} from "../js/engine/characteristics.js";
import { fractionForFace, sequenceRng } from "../js/engine/dice.js";
import { randomStandardCharacteristics, randomChooseRollsCharacteristics, randomPointBuyCharacteristics } from "../js/engine/characteristicsRandom.js";

test("rollStandardCharacteristics produces all seven characteristics in valid ranges", () => {
  const chars = rollStandardCharacteristics();
  for (const c of CHARACTERISTICS) assert.ok(c in chars, `missing ${c}`);
  for (const c of ["STR", "CON", "POW", "DEX", "CHA"]) {
    assert.ok(chars[c] >= 3 && chars[c] <= 18);
  }
  for (const c of ["INT", "SIZ"]) {
    assert.ok(chars[c] >= 8 && chars[c] <= 18);
  }
});

test("rollChooseableCharacteristics returns seven 3D6 rolls", () => {
  const rolls = rollChooseableCharacteristics();
  assert.equal(rolls.length, 7);
  for (const r of rolls) assert.ok(r >= 3 && r <= 18);
});

test("rollHigherStartCharacteristics uses 2D6+6 for all characteristics", () => {
  const chars = rollHigherStartCharacteristics();
  for (const c of CHARACTERISTICS) {
    assert.ok(chars[c] >= 8 && chars[c] <= 18, `${c}=${chars[c]}`);
  }
});

test("pointBuyBaseline starts everything at 10", () => {
  const chars = pointBuyBaseline();
  for (const c of CHARACTERISTICS) assert.equal(chars[c], 10);
});

test("pointBuyCost charges 3 points per point for DEX/INT/POW and 1 for the rest", () => {
  assert.equal(pointBuyCost("DEX", 13), 9);
  assert.equal(pointBuyCost("STR", 13), 3);
  assert.equal(pointBuyCost("POW", 8), -6);
});

test("applyRedistribution moves points without creating or destroying them", () => {
  const chars = { STR: 10, CON: 10, SIZ: 10, INT: 10, POW: 10, DEX: 10, CHA: 10 };
  const result = applyRedistribution(chars, { STR: 3, CON: -3 });
  assert.equal(result.STR, 13);
  assert.equal(result.CON, 7);
});

test("applyRedistribution rejects moving more than maxPoints", () => {
  const chars = { STR: 10, CON: 10 };
  assert.throws(() => applyRedistribution(chars, { STR: 4, CON: -4 }, 3));
});

test("applyRedistribution rejects exceeding the characteristic cap", () => {
  const chars = { STR: 20, CON: 10 };
  assert.throws(() => applyRedistribution(chars, { STR: 2, CON: -2 }, 3, 21));
});

test("characteristicRolls multiplies each characteristic by its listed factor", () => {
  const rolls = characteristicRolls({ STR: 10, CON: 12, INT: 14, POW: 8, DEX: 16, CHA: 11 });
  assert.equal(rolls.Effort, 50);
  assert.equal(rolls.Stamina, 60);
  assert.equal(rolls.Idea, 70);
  assert.equal(rolls.Luck, 40);
  assert.equal(rolls.Agility, 80);
  assert.equal(rolls.Charm, 55);
});

test("characteristicRolls includes Knowledge only when EDU is present", () => {
  const withEdu = characteristicRolls({ STR: 10, CON: 10, INT: 10, POW: 10, DEX: 10, CHA: 10, EDU: 12 });
  assert.equal(withEdu.Knowledge, 60);
  const withoutEdu = characteristicRolls({ STR: 10, CON: 10, INT: 10, POW: 10, DEX: 10, CHA: 10 });
  assert.equal(withoutEdu.Knowledge, undefined);
});

test("randomStandardCharacteristics never exceeds the characteristic cap", () => {
  for (let i = 0; i < 30; i++) {
    const chars = randomStandardCharacteristics();
    for (const c of CHARACTERISTICS) assert.ok(chars[c] <= 21, `${c}=${chars[c]}`);
  }
});

test("randomChooseRollsCharacteristics keeps SIZ and INT at 8 or above when possible", () => {
  for (let i = 0; i < 30; i++) {
    const chars = randomChooseRollsCharacteristics();
    assert.equal(Object.keys(chars).length, 7);
  }
});

test("randomPointBuyCharacteristics stays within the Normal budget and cap", () => {
  const chars = randomPointBuyCharacteristics(Math.random, "Normal");
  for (const c of CHARACTERISTICS) assert.ok(chars[c] >= 10 && chars[c] <= 21);
});
