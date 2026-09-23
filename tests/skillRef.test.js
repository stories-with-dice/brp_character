import { test } from "node:test";
import assert from "node:assert/strict";
import {
  parseSkillRef,
  resolveSkillDisplayName,
  resolveSkillDisplayNameManual,
  specialtyOptionsFor,
  refNeedsSpecialtyChoice,
  baseSkillName,
} from "../js/engine/skillRef.js";

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

test("specialtyOptionsFor returns the weapon class list for weapon-class skills", () => {
  const options = specialtyOptionsFor("Melee Weapon");
  assert.ok(options.includes("Sword"));
  assert.ok(options.includes("Axe"));
});

test("specialtyOptionsFor returns the open specialty list for skills like Knowledge", () => {
  const options = specialtyOptionsFor("Knowledge");
  assert.ok(options.includes("History"));
});

test("specialtyOptionsFor returns null for skills with no specialty system", () => {
  assert.equal(specialtyOptionsFor("Dodge"), null);
});

test("refNeedsSpecialtyChoice is true for open ('any') specialty refs on a skill with a specialty system", () => {
  assert.equal(refNeedsSpecialtyChoice("Melee Weapon (any)"), true);
  assert.equal(refNeedsSpecialtyChoice("Knowledge (any)"), true);
});

test("refNeedsSpecialtyChoice is false when a concrete specialty is already given", () => {
  assert.equal(refNeedsSpecialtyChoice("Firearm (Rifle)"), false);
});

test("refNeedsSpecialtyChoice is false for skills with no specialty system", () => {
  assert.equal(refNeedsSpecialtyChoice("Dodge"), false);
});

test("refNeedsSpecialtyChoice is false for the wildcard 'Any skill' ref", () => {
  assert.equal(refNeedsSpecialtyChoice("Any skill (occupational specialty)"), false);
});

test("resolveSkillDisplayNameManual uses the caller-supplied specialty for open refs", () => {
  assert.equal(resolveSkillDisplayNameManual("Melee Weapon (any)", "Sword"), "Melee Weapon (Sword)");
});

test("resolveSkillDisplayNameManual ignores the supplied specialty when the ref is already concrete", () => {
  assert.equal(resolveSkillDisplayNameManual("Firearm (Rifle)", "Shotgun"), "Firearm (Rifle)");
});

test("resolveSkillDisplayNameManual returns null when an open ref has no chosen specialty yet", () => {
  assert.equal(resolveSkillDisplayNameManual("Melee Weapon (any)", null), null);
});

test("resolveSkillDisplayNameManual passes through skills with no specialty system", () => {
  assert.equal(resolveSkillDisplayNameManual("Dodge", null), "Dodge");
});
