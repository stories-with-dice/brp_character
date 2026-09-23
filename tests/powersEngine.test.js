import { test } from "node:test";
import assert from "node:assert/strict";
import { choosePowerSetOption, assignPowerTypes, buildPowersBlock } from "../js/engine/powersEngine.js";
import { POWER_TYPES } from "../js/data/powers.js";

test("choosePowerSetOption returns a valid option for each campaign level", () => {
  for (const level of ["Normal", "Heroic", "Epic", "Superhuman"]) {
    const option = choosePowerSetOption(level);
    assert.ok(Array.isArray(option) && option.length > 0, level);
  }
});

test("assignPowerTypes produces exactly the requested number of power sets", () => {
  const option = [{ level: "Heroic", count: 1 }, { level: "Normal", count: 1 }];
  const assignments = assignPowerTypes(option);
  assert.equal(assignments.length, 2);
  assert.equal(assignments[0].level, "Heroic");
  assert.equal(assignments[1].level, "Normal");
});

test("assignPowerTypes avoids duplicate power types when enough distinct types exist", () => {
  const option = [{ level: "Normal", count: 4 }]; // 4 requested, 5 types available
  const assignments = assignPowerTypes(option);
  const ids = assignments.map((a) => a.type);
  assert.equal(new Set(ids).size, assignments.length);
});

test("assignPowerTypes only ever assigns known power type ids", () => {
  const option = [{ level: "Superhuman", count: 1 }];
  const [assignment] = assignPowerTypes(option);
  assert.ok(POWER_TYPES.some((t) => t.id === assignment.type));
});

test("buildPowersBlock sets powerPoints to the given POW value", () => {
  const block = buildPowersBlock("Normal", 17);
  assert.equal(block.powerPoints, 17);
  assert.ok(Array.isArray(block.sets));
});
