import { test } from "node:test";
import assert from "node:assert/strict";
import { resolveProfessionSkills, resolveProfessionSkillsManual, allocatePointsRandomly } from "../js/engine/professionSkills.js";
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

test("resolveProfessionSkills always yields fixed.length + sum(choice counts) skills, even for pools smaller than their count", () => {
  // Regression test: Artist/Crafter/Entertainer/Wizard each have a choice
  // pool with only one listed ref but a count of 2 (e.g. Artist's "choose 2"
  // from just ["Art (any)"], meaning two different Art specialties), and
  // Scholar/Scientist need 5 picks from a 2-ref pool. These used to silently
  // resolve to fewer skills than intended because the picker sampled
  // without replacement from too-small pools.
  for (const profession of PROFESSIONS) {
    const expected = profession.fixed.length + (profession.choices ?? []).reduce((sum, c) => sum + c.count, 0);
    for (let i = 0; i < 5; i++) {
      const names = resolveProfessionSkills(profession);
      assert.equal(names.length, expected, `${profession.name}: expected ${expected}, got ${names.length}`);
    }
  }
});

test("resolveProfessionSkills gives Artist two distinct Art specialties from its 'choose 2' pool of one ref", () => {
  const artist = findProfession("Artist");
  const names = resolveProfessionSkills(artist);
  const artSkills = names.filter((n) => n.startsWith("Art ("));
  assert.equal(artSkills.length, 2);
  assert.equal(new Set(artSkills).size, 2);
});

test("resolveProfessionSkills disambiguates Entertainer's repeated 'Language (Other)' pick instead of dropping it", () => {
  const entertainer = findProfession("Entertainer");
  const names = resolveProfessionSkills(entertainer);
  const languageSkills = names.filter((n) => n.startsWith("Language (Other)"));
  assert.equal(languageSkills.length, 2);
  assert.equal(new Set(languageSkills).size, 2); // must be distinguishable, not identical
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

test("resolveProfessionSkillsManual builds the exact skill list from the player's choices", () => {
  const warrior = findProfession("Warrior");
  const selections = [
    ["Melee Weapon (any)"],
    ["Missile Weapon (any)"],
    ["Climb", "Hide", "Listen", "Jump", "Spot"],
  ];
  const specialtyChoices = { "Melee Weapon (any)": "Sword", "Missile Weapon (any)": "Bow" };
  const names = resolveProfessionSkillsManual(warrior, selections, specialtyChoices);
  assert.ok(names.includes("Brawl"));
  assert.ok(names.includes("Dodge"));
  assert.ok(names.includes("Grapple"));
  assert.ok(names.includes("Melee Weapon (Sword)"));
  assert.ok(names.includes("Missile Weapon (Bow)"));
  assert.ok(names.includes("Climb"));
  assert.equal(names.length, 10);
});

test("resolveProfessionSkillsManual throws when a choice group has the wrong count", () => {
  const warrior = findProfession("Warrior");
  const selections = [["Melee Weapon (any)"], [], []];
  assert.throws(() => resolveProfessionSkillsManual(warrior, selections, {}));
});

test("resolveProfessionSkillsManual throws when an open-specialty ref has no chosen specialty", () => {
  const warrior = findProfession("Warrior");
  const selections = [
    ["Melee Weapon (any)"],
    ["Missile Weapon (any)"],
    ["Climb", "Hide", "Listen", "Jump", "Spot"],
  ];
  assert.throws(() => resolveProfessionSkillsManual(warrior, selections, {}));
});

test("resolveProfessionSkillsManual resolves a fixed ref's open specialty via specialtyChoices", () => {
  const engineer = findProfession("Engineer");
  const selections = [["Art (Drafting)", "Drive (any)", "Knowledge (any)", "Repair (Electrical)", "Science (any)"]];
  const specialtyChoices = { "Craft (any)": "Carpentry", "Drive (any)": "Truck", "Knowledge (any)": "History", "Science (any)": "Physics" };
  const names = resolveProfessionSkillsManual(engineer, selections, specialtyChoices);
  assert.ok(names.includes("Craft (Carpentry)"));
  assert.ok(names.includes("Drive (Truck)"));
});

test("resolveProfessionSkillsManual dedups when two picks resolve to the same concrete skill", () => {
  const warrior = findProfession("Warrior");
  const selections = [
    ["Melee Weapon (any)"],
    ["Missile Weapon (any)"],
    ["Climb", "Hide", "Listen", "Jump", "Spot"],
  ];
  const specialtyChoices = { "Melee Weapon (any)": "Sword", "Missile Weapon (any)": "Bow" };
  const names = resolveProfessionSkillsManual(warrior, selections, specialtyChoices);
  assert.equal(new Set(names).size, names.length);
});

test("resolveProfessionSkillsManual accepts two already-resolved specialties for a 'choose 2 from a 1-ref pool' choice (Artist)", () => {
  const artist = findProfession("Artist");
  // Artist: fixed (5) + choices: [2 Art, 1 Craft, 1 Knowledge, 1 Language(Other)]
  const selections = [
    ["Art (Painting)", "Art (Sculpture)"],
    ["Craft (any)"],
    ["Knowledge (any)"],
    ["Language (Other)"],
  ];
  const specialtyChoices = { "Craft (any)": "Blacksmithing", "Knowledge (any)": "History" };
  const names = resolveProfessionSkillsManual(artist, selections, specialtyChoices);
  assert.ok(names.includes("Art (Painting)"));
  assert.ok(names.includes("Art (Sculpture)"));
  assert.equal(names.length, artist.fixed.length + 5);
});

test("resolveProfessionSkillsManual rejects two identical specialties for a 'choose 2' choice (Artist)", () => {
  const artist = findProfession("Artist");
  const selections = [
    ["Art (Painting)", "Art (Painting)"],
    ["Craft (any)"],
    ["Knowledge (any)"],
    ["Language (Other)"],
  ];
  assert.throws(() => resolveProfessionSkillsManual(artist, selections, { "Craft (any)": "Blacksmithing", "Knowledge (any)": "History" }));
});

test("resolveProfessionSkillsManual accepts already-concrete skill names for an 'Any skill' wildcard pool", () => {
  const slave = findProfession("Slave");
  const selections = [["Craft (Woodworking)"]];
  // Slave's fixed list itself includes open-specialty refs ("Craft (any)"
  // and bare "Etiquette", which also needs a group per the book), separate
  // from the wildcard choice pool, so both need a resolution too.
  const specialtyChoices = { "Craft (any)": "Leatherworking", Etiquette: "Household" };
  const names = resolveProfessionSkillsManual(slave, selections, specialtyChoices);
  assert.ok(names.includes("Craft (Woodworking)"));
  assert.ok(names.includes("Craft (Leatherworking)"));
  assert.equal(names.length, slave.fixed.length + 1);
});
