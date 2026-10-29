import { test } from "node:test";
import assert from "node:assert/strict";
import { skillEra, skillFits, fittingSpecialties, professionsForSetting, substituteOptions, substituteSkill, settingEra } from "../js/engine/settingFilter.js";
import { generateRandomCharacter } from "../js/engine/characterFactory.js";
import { resolveProfessionSkills, resolveProfessionSkillsManual } from "../js/engine/professionSkills.js";
import { findProfession } from "../js/data/professions.js";
import { SETTINGS, ERAS } from "../js/data/settings.js";

test("skillEra: the earliest era of a skill, its specialty, or its earliest specialty", () => {
  assert.equal(skillEra("Dodge"), 0);
  assert.equal(skillEra("Energy Weapon (Energy Pistol)"), 7);
  assert.equal(skillEra("Pilot (Starship)"), 8);
  assert.equal(skillEra("Pilot (Boat)"), 0);
  assert.equal(skillEra("Firearm (Rifle)"), 3);
  assert.equal(skillEra("Technical Skill (Computer Use)"), 6, "the book's other spelling of Computers");
  assert.equal(skillEra("Energy Weapon (any)"), 7);
  assert.equal(skillEra("Psychotherapy"), 4);
});

test("settings: every one has an era of ERAS, or null for Any", () => {
  for (const s of SETTINGS) assert.ok(s.era === null || (s.era >= 0 && s.era < ERAS.length), s.id);
  assert.equal(settingEra("any"), null);
  assert.equal(settingEra("high-medieval"), 2);
  assert.equal(settingEra("bogus"), null);
});

test("your examples: Energy Weapon (Energy Pistol) and Pilot (Starship) only fit the space-age settings", () => {
  for (const s of SETTINGS) {
    const space = s.era === null || s.era >= 8;
    assert.equal(skillFits("Pilot (Starship)", s.era), space, s.id);
    assert.equal(skillFits("Energy Weapon (Energy Pistol)", s.era), s.era === null || s.era >= 7, s.id);
  }
  assert.deepEqual(fittingSpecialties("Firearm", 3), ["Pistol", "Rifle", "Shotgun"]);
});

test("professionsForSetting: the book's lists (core pp.205-206) plus Computer Tech from the Modern era", () => {
  assert.deepEqual(professionsForSetting("prehistoric").map((p) => p.name).sort(), ["Crafter", "Farmer", "Hunter", "Shaman", "Tribesperson"]);
  const medieval = professionsForSetting("high-medieval").map((p) => p.name);
  for (const n of ["Journalist", "Scientist", "Technician", "Computer Tech"]) assert.ok(!medieval.includes(n), n);
  assert.ok(medieval.includes("Soldier"));
  assert.ok(!professionsForSetting("victorian").some((p) => p.name === "Computer Tech"));
  assert.ok(professionsForSetting("modern").some((p) => p.name === "Computer Tech"));
  assert.equal(professionsForSetting("any").length, professionsForSetting("space-opera").length);
});

test("substituteOptions: another specialty of the same skill first, else the other skills of its category (core p.22)", () => {
  assert.deepEqual(substituteOptions("Firearm (Revolver)", 3), ["Firearm (Pistol)", "Firearm (Rifle)", "Firearm (Shotgun)"]);
  const medieval = substituteOptions("Firearm (Rifle)", 2);
  assert.ok(medieval.includes("Missile Weapon (Crossbow)") && medieval.includes("Brawl"));
  assert.ok(medieval.every((n) => skillFits(n, 2) && !n.startsWith("Firearm")));
  assert.deepEqual(substituteOptions("Dodge", 0), [], "a fitting skill needs no substitute");
  assert.equal(substituteSkill("Pilot (Starship)", 8), "Pilot (Starship)");
  assert.ok(skillFits(substituteSkill("Pilot (Starship)", 5, () => 0), 5));
});

test("generateRandomCharacter: every skill and the profession fit the setting", () => {
  for (const s of SETTINGS) {
    const allowed = new Set(professionsForSetting(s.id).map((p) => p.name));
    for (let i = 0; i < 40; i++) {
      const c = generateRandomCharacter({ setting: s.id, usePersonality: true, usePowers: i % 2 === 0 });
      assert.ok(allowed.has(c.profession), `${s.id}: ${c.profession}`);
      for (const name of Object.keys(c.skills)) assert.ok(skillFits(name, s.era), `${s.id}: ${name}`);
    }
  }
});

test("resolveProfessionSkills: a Soldier in High Medieval keeps its skill count, with no firearms", () => {
  const soldier = findProfession("Soldier");
  const any = resolveProfessionSkills(soldier).length;
  for (let i = 0; i < 100; i++) {
    const names = resolveProfessionSkills(soldier, Math.random, 2);
    assert.equal(names.length, any);
    assert.ok(names.every((n) => skillFits(n, 2)), names.join(", "));
  }
});

test("resolveProfessionSkillsManual: a skill that does not fit needs a fitting substitute", () => {
  const soldier = findProfession("Soldier");
  const pool = ["Firearm (Rifle)", "Command", "Grapple", "Hide", "Listen", "Spot"];
  assert.throws(() => resolveProfessionSkillsManual(soldier, [pool], {}, { era: 2 }), /Firearm \(Rifle\)" does not fit/);
  assert.throws(() => resolveProfessionSkillsManual(soldier, [pool], {}, { era: 2, substitutions: { "Firearm (Rifle)": "Firearm (Pistol)" } }));
  const names = resolveProfessionSkillsManual(soldier, [pool], {}, { era: 2, substitutions: { "Firearm (Rifle)": "Missile Weapon (Crossbow)" } });
  assert.ok(names.includes("Missile Weapon (Crossbow)") && !names.includes("Firearm (Rifle)"));
  assert.ok(resolveProfessionSkillsManual(soldier, [pool], {}).includes("Firearm (Rifle)"), "no setting: unchanged");
});
