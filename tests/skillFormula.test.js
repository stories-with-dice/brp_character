import { test } from "node:test";
import assert from "node:assert/strict";
import { evaluateSkillFormula, defaultBaseChance } from "../js/engine/skillFormula.js";

const chars = { STR: 10, CON: 12, SIZ: 14, INT: 16, POW: 8, DEX: 18, CHA: 11, EDU: 13 };

test("evaluateSkillFormula handles flat numbers", () => {
  assert.deepEqual(evaluateSkillFormula("05", chars), [5]);
});

test("evaluateSkillFormula handles multiplication", () => {
  assert.deepEqual(evaluateSkillFormula("DEX*2", chars), [36]);
});

test("evaluateSkillFormula handles division (rounded down)", () => {
  assert.deepEqual(evaluateSkillFormula("DEX/2", chars), [9]);
});

test("evaluateSkillFormula handles characteristic sums", () => {
  assert.deepEqual(evaluateSkillFormula("INT+POW", chars), [24]);
});

test("evaluateSkillFormula handles 'or' alternatives, in order", () => {
  assert.deepEqual(evaluateSkillFormula("INT*5 or 00", chars), [80, 0]);
});

test("evaluateSkillFormula handles bare characteristic references", () => {
  assert.deepEqual(evaluateSkillFormula("EDU", chars), [13]);
});

test("defaultBaseChance returns the first candidate", () => {
  assert.equal(defaultBaseChance("20 or 01", chars), 20);
});

test("evaluateSkillFormula throws on an unknown characteristic", () => {
  assert.throws(() => evaluateSkillFormula("XYZ*2", chars));
});
