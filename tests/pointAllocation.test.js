import { test } from "node:test";
import assert from "node:assert/strict";
import {
  sumAllocations,
  remainingPoints,
  skillsAtCapBeforeProfessionPoints,
  skillsOverCap,
  headroomFor,
} from "../js/engine/pointAllocation.js";
import { skillTotal, currentTotalBeforePoints } from "../js/engine/skillSheet.js";

function entry(overrides = {}) {
  return { name: "Test", category: "Mental", base: 5, categoryBonus: 0, personalityBonus: 0, professionalPoints: 0, personalPoints: 0, ...overrides };
}

function namedEntries(map) {
  const out = {};
  for (const [name, overrides] of Object.entries(map)) out[name] = entry({ name, ...overrides });
  return out;
}

test("sumAllocations totals every value in the map", () => {
  assert.equal(sumAllocations({ A: 10, B: 25, C: 0 }), 35);
});

test("sumAllocations treats missing/non-numeric values as zero", () => {
  assert.equal(sumAllocations({ A: 10, B: undefined, C: "not a number" }), 10);
});

test("remainingPoints subtracts the allocation total from the pool", () => {
  assert.equal(remainingPoints(250, { A: 100, B: 50 }), 100);
});

test("remainingPoints can go negative when over-spent", () => {
  assert.equal(remainingPoints(100, { A: 80, B: 50 }), -30);
});

test("skillsAtCapBeforeProfessionPoints flags skills already at or above the cap", () => {
  const entries = namedEntries({
    Low: { base: 10 },
    High: { base: 40, categoryBonus: 40 }, // 80 total, at/above a 75 cap
  });
  assert.deepEqual(skillsAtCapBeforeProfessionPoints(entries, 75), ["High"]);
});

test("skillsOverCap flags skills whose grand total (including allocated points) exceeds the cap", () => {
  const entries = namedEntries({
    OK: { base: 10, professionalPoints: 50 }, // 60
    Over: { base: 10, professionalPoints: 70 }, // 80
  });
  assert.deepEqual(skillsOverCap(entries, 75), ["Over"]);
});

test("headroomFor with the default baseline (currentTotalBeforePoints) ignores already-spent professional points", () => {
  const e = entry({ base: 10, categoryBonus: 5, professionalPoints: 40 }); // before-points total = 15
  assert.equal(headroomFor(e, 75), 60);
});

test("headroomFor with the skillTotal baseline accounts for professional points already spent", () => {
  const e = entry({ base: 10, categoryBonus: 5, professionalPoints: 40 }); // grand total = 55
  assert.equal(headroomFor(e, 75, skillTotal), 20);
});

test("headroomFor never goes negative", () => {
  const e = entry({ base: 40, categoryBonus: 40 }); // 80, over a 75 cap
  assert.equal(headroomFor(e, 75), 0);
});
