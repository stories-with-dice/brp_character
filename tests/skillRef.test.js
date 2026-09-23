import { test } from "node:test";
import assert from "node:assert/strict";
import { parseSkillRef, resolveSkillDisplayName, baseSkillName } from "../js/engine/skillRef.js";

test("parseSkillRef splits base and specialty", () => {
  assert.deepEqual(parseSkillRef("Firearm (Rifle)"), { base: "Firearm", specialty: "Rifle" });
  assert.deepEqual(parseSkillRef("Knowledge (Law)"), { base: "Knowledge", specialty: "Law" });
});

test("parseSkillRef handles plain skill names with no specialty", () => {
  assert.deepEqual(parseSkillRef("Dodge"), { base: "Dodge", specialty: null });
});

test("parseSkillRef flags the 'Any skill' wildcard", () => {
  assert.equal(parseSkillRef("Any skill (occupational specialty)").wildcard, true);
});

test("resolveSkillDisplayName keeps a specific specialty as-is", () => {
  assert.equal(resolveSkillDisplayName("Firearm (Rifle)"), "Firearm (Rifle)");
});

test("resolveSkillDisplayName resolves 'any' to a concrete specialty from the weapon class list", () => {
  const rng = () => 0; // first item in the pool
  const name = resolveSkillDisplayName("Melee Weapon (any)", rng);
  assert.match(name, /^Melee Weapon \(.+\)$/);
});

test("resolveSkillDisplayName resolves open specialty skills (Art, Craft, Knowledge)", () => {
  const rng = () => 0;
  const name = resolveSkillDisplayName("Knowledge (any)", rng);
  assert.match(name, /^Knowledge \(.+\)$/);
});

test("resolveSkillDisplayName passes through skills with no specialty system", () => {
  assert.equal(resolveSkillDisplayName("Dodge"), "Dodge");
});

test("baseSkillName strips any parenthetical specialty", () => {
  assert.equal(baseSkillName("Firearm (Rifle)"), "Firearm");
  assert.equal(baseSkillName("Dodge"), "Dodge");
});
