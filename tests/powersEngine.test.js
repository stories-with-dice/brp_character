import { test } from "node:test";
import assert from "node:assert/strict";
import {
  choosePowerSetOption,
  assignPowerTypes,
  buildPowersBlock,
  flattenPowerSetOption,
  buildPowersBlockManual,
  buildPowerSetManual,
  generatePowerSet,
  generateMutations,
  validateMutationPicks,
  mutationPicksUsed,
  superpowerCost,
  describePower,
} from "../js/engine/powersEngine.js";
import {
  POWER_TYPES,
  POWER_LEVELS,
  sorcerySpellLevelBudget,
  superpowerPointBudget,
  mutationPickRules,
  mutationForRoll,
} from "../js/data/powers.js";

const CHARS = { STR: 12, CON: 13, SIZ: 14, INT: 15, POW: 16, DEX: 11, CHA: 10 };

/** Deterministic RNG cycling through the given values in [0,1). */
function seq(...values) {
  let i = 0;
  return () => values[i++ % values.length];
}

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

test("assignPowerTypes skips sorcery when POW is below 16", () => {
  for (let i = 0; i < 50; i++) {
    const assignments = assignPowerTypes([{ level: "Normal", count: 4 }], Math.random, { characteristics: { ...CHARS, POW: 15 } });
    assert.ok(!assignments.some((a) => a.type === "sorcery"));
    assert.equal(assignments.length, 4);
  }
});

test("buildPowersBlock sets powerPoints to POW plus any Extra Energy", () => {
  for (let i = 0; i < 30; i++) {
    const block = buildPowersBlock("Superhuman", 17, CHARS);
    const extra = block.sets
      .filter((s) => s.type === "superpowers")
      .flatMap((s) => s.powers)
      .filter((p) => p.name === "Extra Energy")
      .reduce((sum, p) => sum + 10 * p.level, 0);
    assert.equal(block.powerPoints, 17 + extra);
    assert.ok(block.sets.length > 0);
    for (const set of block.sets) assert.ok(set.powers.length > 0, `${set.type} set has powers`);
  }
});

test("starting magic and psychic sets have the rulebook count at INT×1 / POW×1", () => {
  const magicCounts = { Normal: 4, Heroic: 6, Epic: 8, Superhuman: 10 };
  const psychicCounts = { Normal: 2, Heroic: 4, Epic: 6, Superhuman: 10 };
  for (const level of POWER_LEVELS) {
    const magic = generatePowerSet(level, "magic", CHARS);
    assert.equal(magic.powers.length, magicCounts[level]);
    assert.equal(new Set(magic.powers.map((p) => p.name)).size, magicCounts[level]);
    assert.ok(magic.powers.every((p) => p.skill === CHARS.INT));
    const psychic = generatePowerSet(level, "psychic", CHARS);
    assert.equal(psychic.powers.length, psychicCounts[level]);
    assert.ok(psychic.powers.every((p) => p.skill === CHARS.POW));
  }
  assert.deepEqual(generatePowerSet("Superhuman", "magic", CHARS).extras, ["Wizard's staff (already constructed)", "Familiar"]);
});

test("sorcerySpellLevelBudget follows the rulebook (½ INT round up, INT, INT×2, INT×4)", () => {
  assert.equal(sorcerySpellLevelBudget("Normal", 15), 8);
  assert.equal(sorcerySpellLevelBudget("Heroic", 15), 15);
  assert.equal(sorcerySpellLevelBudget("Epic", 15), 30);
  assert.equal(sorcerySpellLevelBudget("Superhuman", 15), 60);
});

test("random sorcery spells stay within the level budget and each spell's level range", () => {
  for (const level of POWER_LEVELS) {
    for (let i = 0; i < 20; i++) {
      const set = generatePowerSet(level, "sorcery", CHARS);
      assert.ok(set.spent <= set.budget, `${level}: ${set.spent} <= ${set.budget}`);
      assert.equal(set.spent, set.powers.reduce((sum, p) => sum + p.level, 0));
      assert.doesNotThrow(() => buildPowerSetManual(level, "sorcery", CHARS, set.powers));
    }
  }
});

test("superpowerPointBudget follows the rulebook", () => {
  assert.equal(superpowerPointBudget("Normal", CHARS), 8); // highest 16 × ½
  assert.equal(superpowerPointBudget("Heroic", CHARS), 16);
  assert.equal(superpowerPointBudget("Epic", CHARS), 32);
  assert.equal(superpowerPointBudget("Superhuman", CHARS), 91);
});

test("random superpowers stay within budget and pass manual validation", () => {
  for (const level of POWER_LEVELS) {
    for (let i = 0; i < 30; i++) {
      const set = generatePowerSet(level, "superpowers", CHARS);
      assert.ok(set.spent <= set.budget);
      assert.doesNotThrow(() => buildPowerSetManual(level, "superpowers", CHARS, set.powers));
    }
  }
});

test("superpowerCost handles variants and per-SIZ costs", () => {
  assert.equal(superpowerCost({ name: "Drain", variant: "Hit Points", level: 2 }, CHARS), 20);
  assert.equal(superpowerCost({ name: "Drain", variant: "Power Points", level: 2 }, CHARS), 10);
  assert.equal(superpowerCost({ name: "Force Field", level: 1 }, CHARS), 14); // SIZ 14 pays 14 for Force Field 1
  assert.equal(superpowerCost({ name: "Super Characteristic", variant: "DEX", level: 2 }, CHARS), 6);
});

test("manual superpowers reject over-budget picks and missing types", () => {
  assert.throws(() => buildPowerSetManual("Normal", "superpowers", CHARS, [{ name: "Super Speed", level: 1 }]), /budget/);
  assert.throws(() => buildPowerSetManual("Heroic", "superpowers", CHARS, [{ name: "Armor", level: 2 }]), /choice/);
  const set = buildPowerSetManual("Heroic", "superpowers", CHARS, [
    { name: "Armor", level: 2, specifics: ["Heat"] },
    { name: "Adaptation", level: 2, specifics: ["Cold", "Vacuum"] },
  ]);
  assert.equal(set.spent, 8);
  assert.equal(describePower("superpowers", set.powers[1]), "Adaptation (Cold, Vacuum) 2 -- 6 pts");
});

test("mutationForRoll reads the Random Mutations table, with 91-00 as roll again", () => {
  assert.equal(mutationForRoll(1).name, "Adaptability");
  assert.equal(mutationForRoll(30).name, "Hands");
  assert.equal(mutationForRoll(90).name, "Wings");
  assert.equal(mutationForRoll(91), null);
  assert.equal(mutationForRoll(100), null);
});

test("mutationPickRules follows the rulebook", () => {
  assert.deepEqual(mutationPickRules("Heroic", 5), { picks: 2, maxAdverse: 2, adverseBuysPicks: true }); // minimum 2
  assert.equal(mutationPickRules("Heroic", 13).picks, 4);
  assert.equal(mutationPickRules("Epic", 13).picks, 7);
  assert.equal(mutationPickRules("Superhuman", 13).picks, 13);
  assert.equal(mutationPickRules("Superhuman", 13).maxAdverse, 7);
});

test("Normal mutations: two D100 rolls, a repeated result becomes major", () => {
  // 0.0,0.1 -> D100 roll 01 (Adaptability), twice.
  const mutations = generateMutations("Normal", CHARS, seq(0, 0.1));
  assert.deepEqual(mutations, [{ name: "Adaptability", severity: "major", adverse: false }]);
});

test("Normal mutations: a successful Luck roll after an adverse result gives one more roll", () => {
  // Roll 05 (Allergy, adverse) -> Luck roll 01 succeeds -> roll 01 (Adaptability) -> roll 01 again (major).
  const mutations = generateMutations("Normal", CHARS, seq(0, 0.5, 0, 0.1, 0, 0.1, 0, 0.1));
  assert.equal(mutations[0].name, "Allergy");
  assert.equal(mutations[0].adverse, true);
  assert.deepEqual(mutations[1], { name: "Adaptability", severity: "major", adverse: false });
});

test("Heroic+ random mutations use exactly the pick allowance and are beneficial", () => {
  for (const level of ["Heroic", "Epic", "Superhuman"]) {
    for (let i = 0; i < 20; i++) {
      const mutations = generateMutations(level, CHARS, Math.random);
      assert.equal(mutationPicksUsed(mutations), mutationPickRules(level, CHARS.CON).picks);
      assert.ok(mutations.every((m) => !m.adverse));
      assert.doesNotThrow(() => validateMutationPicks(level, CHARS, mutations));
    }
  }
});

test("validateMutationPicks lets adverse picks buy extra beneficial picks", () => {
  // Heroic, CON 13 -> 4 picks.
  const four = [{ name: "Wings", severity: "major" }, { name: "Hardy", severity: "major" }];
  assert.doesNotThrow(() => validateMutationPicks("Heroic", CHARS, four));
  assert.throws(() => validateMutationPicks("Heroic", CHARS, [...four, { name: "Venom", severity: "minor" }]), /beneficial/);
  assert.doesNotThrow(() => validateMutationPicks("Heroic", CHARS, [...four, { name: "Venom", severity: "minor" }, { name: "Allergy", severity: "minor" }]));
  assert.throws(() => validateMutationPicks("Heroic", CHARS, [{ name: "Wings", severity: "minor" }]), /Use all/);
  assert.throws(() => validateMutationPicks("Heroic", CHARS, [{ name: "Coloration", severity: "major" }, { name: "Hardy", severity: "major" }]), /only a minor/);
});

test("flattenPowerSetOption expands each {level,count} entry into one slot per count", () => {
  const slots = flattenPowerSetOption([{ level: "Heroic", count: 1 }, { level: "Normal", count: 2 }]);
  assert.deepEqual(slots, [{ level: "Heroic" }, { level: "Normal" }, { level: "Normal" }]);
});

test("buildPowersBlockManual builds sets from the player's own picks", () => {
  const block = buildPowersBlockManual(
    15,
    [
      { level: "Heroic", typeId: "magic", picks: ["Blast", "Heal", "Light", "Dark", "Ward", "Wall"] },
      { level: "Normal", typeId: "sorcery", picks: [{ name: "Leap", level: 4 }, { name: "Make Whole", level: 3 }] },
    ],
    CHARS
  );
  assert.equal(block.powerPoints, 15);
  assert.equal(block.sets.length, 2);
  assert.equal(block.sets[0].name, "Magic");
  assert.equal(block.sets[0].level, "Heroic");
  assert.deepEqual(block.sets[0].powers[0], { name: "Blast", skill: 15 });
  assert.equal(block.sets[1].name, "Sorcery");
  assert.equal(block.sets[1].spent, 7);
  assert.equal(block.sets[1].budget, 8);
});

test("buildPowersBlockManual rejects wrong counts, over-budget spells, and low-POW sorcery", () => {
  assert.throws(() => buildPowersBlockManual(15, [{ level: "Normal", typeId: "magic", picks: ["Blast"] }], CHARS), /exactly 4/);
  assert.throws(() => buildPowersBlockManual(15, [{ level: "Normal", typeId: "sorcery", picks: [{ name: "Leap", level: 4 }, { name: "Liken Shape", level: 4 }, { name: "Fury", level: 1 }] }], CHARS), /limit is 8/);
  assert.throws(() => buildPowersBlockManual(15, [{ level: "Normal", typeId: "sorcery", picks: [] }], { ...CHARS, POW: 15 }), /POW 16/);
});

test("buildPowersBlockManual throws on an unknown power type id", () => {
  assert.throws(() => buildPowersBlockManual(10, [{ level: "Normal", typeId: "telekinesis", picks: [] }], CHARS));
});
