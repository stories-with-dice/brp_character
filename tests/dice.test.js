import { test } from "node:test";
import assert from "node:assert/strict";
import { rollDie, rollDice, roll3d6, roll2d6plus6, roll1d100, rollNotation, sequenceRng, fractionForFace } from "../js/engine/dice.js";

test("rollDie respects RNG boundaries", () => {
  const low = () => 0;
  const high = () => 0.9999999;
  assert.equal(rollDie(6, low), 1);
  assert.equal(rollDie(6, high), 6);
});

test("fractionForFace produces the requested face", () => {
  for (let sides = 2; sides <= 20; sides++) {
    for (let face = 1; face <= sides; face++) {
      const rng = () => fractionForFace(face, sides);
      assert.equal(rollDie(sides, rng), face, `sides=${sides} face=${face}`);
    }
  }
});

test("rollDice sums the correct number of dice", () => {
  const rng = sequenceRng([fractionForFace(3, 6), fractionForFace(4, 6), fractionForFace(5, 6)]);
  assert.equal(rollDice(3, 6, rng), 12);
});

test("roll3d6 is bounded 3-18", () => {
  for (let i = 0; i < 200; i++) {
    const v = roll3d6();
    assert.ok(v >= 3 && v <= 18, `roll3d6 out of range: ${v}`);
  }
});

test("roll2d6plus6 is bounded 8-18", () => {
  for (let i = 0; i < 200; i++) {
    const v = roll2d6plus6();
    assert.ok(v >= 8 && v <= 18, `roll2d6plus6 out of range: ${v}`);
  }
});

test("roll1d100 is bounded 1-100 and can produce 100 from double zero", () => {
  const rng = sequenceRng([fractionForFace(1, 10), fractionForFace(1, 10)]);
  assert.equal(roll1d100(rng), 100);
  for (let i = 0; i < 300; i++) {
    const v = roll1d100();
    assert.ok(v >= 1 && v <= 100, `roll1d100 out of range: ${v}`);
  }
});

test("rollNotation parses flat numbers", () => {
  assert.equal(rollNotation("5"), 5);
});

test("rollNotation parses NDM with modifier", () => {
  const rng = sequenceRng([fractionForFace(6, 6)]); // force a 6
  assert.equal(rollNotation("1D6-1", rng), 5);
});

test("rollNotation parses multiplied dice terms", () => {
  const rng = sequenceRng([fractionForFace(1, 10)]); // force a 1
  assert.equal(rollNotation("1D10*10", rng), 10);
});

test("rollNotation parses compound expressions", () => {
  const rng = sequenceRng([fractionForFace(4, 6), fractionForFace(2, 4)]);
  assert.equal(rollNotation("1D6+1D4", rng), 6);
});

test("rollNotation throws on garbage input", () => {
  assert.throws(() => rollNotation("banana"));
});
