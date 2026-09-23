import { test } from "node:test";
import assert from "node:assert/strict";
import { resolveProfessionSkills, allocatePointsRandomly } from "../js/engine/professionSkills.js";
import { PROFESSIONS, findProfession } from "../js/data/professions.js";

test("resolveProfessionSkills returns every fixed skill for a profession with no choices", () => {
  const gambler = findProfession("Gambler");
  const names = resolveProfessionSkills(gambler);
  for (const fixed of gambler.fixed) assert.ok(names.includes(fixed), `missing fixed skill ${fixed}`);
  assert.equal(names.length, gambler.fixed.length);
});

test("resolveProfessionSkills resolves the correct number of choice picks", () => {
  const warrior = findProfession("Warrior");
  const names = resolveProfessionSkills(warrior);
  // fixed (3) + 1 melee + 1 missile + 5 from the general pool = 10
  assert.equal(names.length, 10);
});

test("resolveProfessionSkills never produces duplicate skill names", () => {
  for (const profession of PROFESSIONS) {
    const names = resolveProfessionSkills(profession);
    assert.equal(new Set(names).size, names.length, `duplicates in ${profession.name}`);
  }
});

test("resolveProfessionSkills handles the Slave profession's 'any skill' wildcard choice", () => {
  const slave = findProfession("Slave");
  const names = resolveProfessionSkills(slave);
  assert.equal(names.length, slave.fixed.length + 1);
});

test("every profession resolves without throwing, for every listed profession", () => {
  for (const profession of PROFESSIONS) {
    assert.doesNotThrow(() => resolveProfessionSkills(profession), profession.name);
  }
});

test("allocatePointsRandomly never exceeds a slot's headroom", () => {
  const slots = [{ key: "A", headroom: 10 }, { key: "B", headroom: 5 }];
  const allocation = allocatePointsRandomly(100, slots);
  assert.ok(allocation.A <= 10);
  assert.ok(allocation.B <= 5);
});

test("allocatePointsRandomly spends the full pool when total headroom allows it", () => {
  const slots = [{ key: "A", headroom: 50 }, { key: "B", headroom: 50 }];
  const allocation = allocatePointsRandomly(60, slots);
  assert.equal(allocation.A + allocation.B, 60);
});

test("allocatePointsRandomly caps total spend at the sum of headrooms", () => {
  const slots = [{ key: "A", headroom: 5 }, { key: "B", headroom: 5 }];
  const allocation = allocatePointsRandomly(100, slots);
  assert.equal(allocation.A + allocation.B, 10);
});

test("allocatePointsRandomly with zero pool allocates nothing", () => {
  const slots = [{ key: "A", headroom: 10 }];
  const allocation = allocatePointsRandomly(0, slots);
  assert.equal(allocation.A, 0);
});
