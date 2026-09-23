import { test } from "node:test";
import assert from "node:assert/strict";
import { validateChoiceSelection, validateAllChoiceSelections } from "../js/engine/professionChoices.js";
import { findProfession } from "../js/data/professions.js";

test("validateChoiceSelection accepts an exact, in-pool selection", () => {
  const choice = { count: 2, from: ["A", "B", "C"] };
  assert.equal(validateChoiceSelection(choice, ["A", "B"]), null);
});

test("validateChoiceSelection rejects too few or too many picks", () => {
  const choice = { count: 2, from: ["A", "B", "C"] };
  assert.match(validateChoiceSelection(choice, ["A"]), /exactly 2/);
  assert.match(validateChoiceSelection(choice, ["A", "B", "C"]), /exactly 2/);
});

test("validateChoiceSelection rejects duplicates", () => {
  const choice = { count: 2, from: ["A", "B", "C"] };
  assert.match(validateChoiceSelection(choice, ["A", "A"]), /Duplicate/);
});

test("validateChoiceSelection rejects a ref not in the pool", () => {
  const choice = { count: 1, from: ["A", "B"] };
  assert.match(validateChoiceSelection(choice, ["Z"]), /isn't one of/);
});

test("validateChoiceSelection allows any skill name for the 'Any skill' wildcard pool", () => {
  const choice = { count: 1, from: ["Any skill (occupational specialty)"] };
  assert.equal(validateChoiceSelection(choice, ["Melee Weapon (Sword)"]), null);
});

test("validateAllChoiceSelections returns no errors for a fully valid Warrior selection", () => {
  const warrior = findProfession("Warrior");
  const selections = [
    ["Melee Weapon (any)"],
    ["Missile Weapon (any)"],
    ["Climb", "Hide", "Listen", "Jump", "Spot"],
  ];
  assert.deepEqual(validateAllChoiceSelections(warrior, selections), []);
});

test("validateChoiceSelection accepts already-resolved specialties matching an '(any)' pool entry with count > pool size", () => {
  const choice = { count: 2, from: ["Art (any)"] };
  assert.equal(validateChoiceSelection(choice, ["Art (Painting)", "Art (Sculpture)"]), null);
});

test("validateChoiceSelection rejects a resolved specialty whose base doesn't match any pool entry", () => {
  const choice = { count: 1, from: ["Art (any)"] };
  assert.match(validateChoiceSelection(choice, ["Craft (Woodworking)"]), /isn't one of/);
});

test("validateChoiceSelection still rejects a raw '(any)' pool entry repeated without any specialty resolution", () => {
  const choice = { count: 2, from: ["Art (any)"] };
  assert.match(validateChoiceSelection(choice, ["Art (any)", "Art (any)"]), /Duplicate/);
});

test("validateAllChoiceSelections reports one error per invalid choice group", () => {
  const warrior = findProfession("Warrior");
  const selections = [[], [], []];
  const errors = validateAllChoiceSelections(warrior, selections);
  assert.equal(errors.length, 3);
});
