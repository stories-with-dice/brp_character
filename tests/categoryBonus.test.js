import { test } from "node:test";
import assert from "node:assert/strict";
import { computeCategoryBonuses } from "../js/engine/categoryBonus.js";

// Example straight from the rulebook (page 22): STR 14, CON 13, INT 8, SIZ 12,
// POW 10, DEX 12, CHA 8 -> Combat +3%, Communication -3%, Manipulation +3%,
// Mental -2%, Perception -1%, Physical +3%.
const bookExample = { STR: 14, CON: 13, INT: 8, SIZ: 12, POW: 10, DEX: 12, CHA: 8 };

test("full category bonus method matches the rulebook worked example", () => {
  const bonuses = computeCategoryBonuses(bookExample, "full");
  assert.equal(bonuses.Combat, 3);
  assert.equal(bonuses.Communication, -3);
  assert.equal(bonuses.Manipulation, 3);
  assert.equal(bonuses.Perception, -1);
  assert.equal(bonuses.Physical, 3);
  // Mental uses EDU as a secondary characteristic; without EDU present the
  // secondary term is simply skipped (treated as 0), giving INT's -2 alone.
});

test("all characteristics at 10 gives a zero bonus in every category", () => {
  const chars = { STR: 10, CON: 10, SIZ: 10, INT: 10, POW: 10, DEX: 10, CHA: 10, EDU: 10 };
  const bonuses = computeCategoryBonuses(chars, "full");
  for (const v of Object.values(bonuses)) assert.equal(v, 0);
});

test("simple method is half the primary characteristic, rounded up", () => {
  const chars = { STR: 15, CON: 10, SIZ: 10, INT: 10, POW: 10, DEX: 10, CHA: 10 };
  const bonuses = computeCategoryBonuses(chars, "simple");
  assert.equal(bonuses.Physical, 8); // STR/2 = 7.5 -> 8 (simple method's Physical primary is STR)
});

test("simple method uses each category's primary characteristic", () => {
  const chars = { STR: 10, CON: 10, SIZ: 10, INT: 10, POW: 10, DEX: 17, CHA: 10 };
  const bonuses = computeCategoryBonuses(chars, "simple");
  assert.equal(bonuses.Combat, 9); // DEX/2 = 8.5 -> 9
  assert.equal(bonuses.Manipulation, 9);
});

test("simple method's primary differs from the full method for Communication, Perception, and Physical", () => {
  const chars = { STR: 20, CON: 10, SIZ: 10, INT: 10, POW: 20, DEX: 10, CHA: 20 };
  const bonuses = computeCategoryBonuses(chars, "simple");
  assert.equal(bonuses.Communication, 10); // CHA/2, not INT/2
  assert.equal(bonuses.Perception, 10); // POW/2, not INT/2
  assert.equal(bonuses.Physical, 10); // STR/2, not DEX/2
});

test("negative characteristic (SIZ for Physical) subtracts in the full method", () => {
  const chars = { STR: 10, CON: 10, SIZ: 16, INT: 10, POW: 10, DEX: 10, CHA: 10 };
  const bonuses = computeCategoryBonuses(chars, "full");
  // SIZ is negative for Physical: -1%/point over 10 = -6
  assert.equal(bonuses.Physical, -6);
});
