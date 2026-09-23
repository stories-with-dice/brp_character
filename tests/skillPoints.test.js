import { test } from "node:test";
import assert from "node:assert/strict";
import {
  professionalSkillPointPool,
  personalSkillPointPool,
  professionalSkillCap,
  personalSkillCap,
} from "../js/engine/skillPoints.js";

test("professionalSkillPointPool matches the book's flat pools", () => {
  assert.equal(professionalSkillPointPool("Normal"), 250);
  assert.equal(professionalSkillPointPool("Heroic"), 325);
  assert.equal(professionalSkillPointPool("Epic"), 400);
  assert.equal(professionalSkillPointPool("Superhuman"), 500);
});

test("professionalSkillPointPool uses EDU x multiplier with the EDU option", () => {
  assert.equal(professionalSkillPointPool("Normal", { eduOption: true, edu: 14 }), 280);
  assert.equal(professionalSkillPointPool("Heroic", { eduOption: true, edu: 14 }), 350);
});

test("professionalSkillCap matches the book (75/90/101/unlimited)", () => {
  assert.equal(professionalSkillCap("Normal"), 75);
  assert.equal(professionalSkillCap("Heroic"), 90);
  assert.equal(professionalSkillCap("Epic"), 101);
  assert.equal(professionalSkillCap("Superhuman"), Infinity);
});

test("personalSkillCap matches the book (50/75/90/100)", () => {
  assert.equal(personalSkillCap("Normal"), 50);
  assert.equal(personalSkillCap("Heroic"), 75);
  assert.equal(personalSkillCap("Epic"), 90);
  assert.equal(personalSkillCap("Superhuman"), 100);
});

test("personalSkillPointPool is INT x 10 by default", () => {
  assert.equal(personalSkillPointPool(15, "Normal"), 150);
});

test("personalSkillPointPool uses the increased multipliers with the option on", () => {
  assert.equal(personalSkillPointPool(15, "Heroic", { increasedOption: true }), 225); // INT*15
  assert.equal(personalSkillPointPool(15, "Epic", { increasedOption: true }), 300); // INT*20
  assert.equal(personalSkillPointPool(15, "Superhuman", { increasedOption: true }), 375); // INT*25
});
