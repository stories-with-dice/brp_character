import { test } from "node:test";
import assert from "node:assert/strict";
import { PROFESSIONS } from "../js/data/professions.js";
import { SKILLS, findSkill, WEAPON_CLASSES, OPEN_SPECIALTY_SKILLS } from "../js/data/skills.js";
import { parseSkillRef } from "../js/engine/skillRef.js";

test("there are exactly 44 professions, matching the rulebook's A-Z list", () => {
  assert.equal(PROFESSIONS.length, 44);
});

test("profession names are unique", () => {
  const names = PROFESSIONS.map((p) => p.name);
  assert.equal(new Set(names).size, names.length);
});

test("every profession has a non-empty description and wealth string", () => {
  for (const p of PROFESSIONS) {
    assert.ok(p.description && p.description.length > 10, p.name);
    assert.ok(p.wealth && p.wealth.length > 0, p.name);
  }
});

test("every profession's fixed+choices skill refs resolve to a known base skill or a recognized wildcard", () => {
  for (const profession of PROFESSIONS) {
    const allRefs = [...profession.fixed, ...(profession.choices ?? []).flatMap((c) => c.from)];
    for (const ref of allRefs) {
      const { base, wildcard } = parseSkillRef(ref);
      if (wildcard) continue;
      const found = findSkill(base) || SKILLS.some((s) => s.name === base);
      assert.ok(found, `${profession.name}: unknown base skill "${base}" from ref "${ref}"`);
    }
  }
});

test("skill category is always one of the six defined categories", () => {
  const valid = new Set(["Combat", "Communication", "Manipulation", "Mental", "Perception", "Physical"]);
  for (const s of SKILLS) assert.ok(valid.has(s.category), s.name);
});

test("every skill name is unique", () => {
  const names = SKILLS.map((s) => s.name);
  assert.equal(new Set(names).size, names.length);
});

test("every skill with specialty:'weaponClass' has a matching WEAPON_CLASSES entry", () => {
  for (const s of SKILLS) {
    if (s.specialty === "weaponClass") {
      assert.ok(WEAPON_CLASSES[s.specialtyKey], `${s.name} missing WEAPON_CLASSES[${s.specialtyKey}]`);
    }
  }
});

test("every skill with specialty:'open' has a matching OPEN_SPECIALTY_SKILLS entry", () => {
  for (const s of SKILLS) {
    if (s.specialty === "open") {
      assert.ok(OPEN_SPECIALTY_SKILLS[s.specialtyKey], `${s.name} missing OPEN_SPECIALTY_SKILLS[${s.specialtyKey}]`);
    }
  }
});
