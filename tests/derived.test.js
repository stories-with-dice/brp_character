import { test } from "node:test";
import assert from "node:assert/strict";
import {
  damageModifier,
  hitPoints,
  majorWoundLevel,
  powerPoints,
  experienceBonus,
  fatiguePoints,
  sanityPoints,
  hitPointsByLocation,
  computeDerived,
} from "../js/engine/derived.js";

test("damageModifier matches the book's table at key breakpoints", () => {
  assert.equal(damageModifier(6, 6), "-1D6"); // 12
  assert.equal(damageModifier(8, 8), "-1D4"); // 16
  assert.equal(damageModifier(10, 10), "None"); // 20
  assert.equal(damageModifier(16, 16), "+1D4"); // 32
  assert.equal(damageModifier(20, 20), "+1D6"); // 40
  assert.equal(damageModifier(28, 28), "+2D6"); // 56
  assert.equal(damageModifier(84, 84), "+9D6"); // 168, top of the printed table
});

test("damageModifier extends by +1D6 per 16 points above 168", () => {
  assert.equal(damageModifier(90, 90), "+10D6"); // 180: ceil((180-168)/16)=1 -> 9+1
  assert.equal(damageModifier(100, 100), "+11D6"); // 200: ceil((200-168)/16)=2 -> 9+2
});

test("hitPoints rounds (CON+SIZ)/2 up", () => {
  assert.equal(hitPoints(11, 10), 11); // 21/2=10.5 -> 11
  assert.equal(hitPoints(10, 10), 10);
});

test("hitPoints uses CON+SIZ directly with the Total Hit Points option", () => {
  assert.equal(hitPoints(11, 10, { totalHitPointsOption: true }), 21);
});

test("majorWoundLevel is half hit points rounded up", () => {
  assert.equal(majorWoundLevel(15), 8);
  assert.equal(majorWoundLevel(14), 7);
});

test("powerPoints equals POW", () => {
  assert.equal(powerPoints(14), 14);
});

test("experienceBonus is half INT rounded up", () => {
  assert.equal(experienceBonus(15), 8);
  assert.equal(experienceBonus(14), 7);
});

test("fatiguePoints is STR+CON", () => {
  assert.equal(fatiguePoints(12, 14), 26);
});

test("sanityPoints is POW x 5", () => {
  assert.equal(sanityPoints(12), 60);
});

test("hitPointsByLocation sums to roughly the whole (each location rounds up independently)", () => {
  const loc = hitPointsByLocation(14);
  assert.equal(loc.head, 5); // ceil(14/3)
  assert.equal(loc.chest, 6); // ceil(14*4/10)
  assert.equal(loc.leftArm, 4); // ceil(14/4)
});

test("computeDerived only includes optional fields when their toggle is on", () => {
  const chars = { STR: 12, CON: 12, SIZ: 12, INT: 12, POW: 12, DEX: 12, CHA: 12 };
  const minimal = computeDerived(chars);
  assert.equal(minimal.fatiguePoints, undefined);
  assert.equal(minimal.sanityPoints, undefined);
  assert.equal(minimal.hitPointsByLocation, undefined);

  const full = computeDerived(chars, { fatigueOption: true, sanityOption: true, hitLocationOption: true });
  assert.ok(full.fatiguePoints);
  assert.ok(full.sanityPoints);
  assert.ok(full.hitPointsByLocation);
});
