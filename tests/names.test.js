import { test } from "node:test";
import assert from "node:assert/strict";
import { givenNamePool, randomName } from "../js/engine/names.js";
import { GIVEN_NAMES, SURNAMES } from "../js/data/names.js";

test("givenNamePool follows a female or male gender, and uses every pool otherwise", () => {
  assert.equal(givenNamePool("Female"), GIVEN_NAMES.female);
  assert.equal(givenNamePool(" m "), GIVEN_NAMES.male);
  const all = givenNamePool("");
  assert.equal(all.length, GIVEN_NAMES.female.length + GIVEN_NAMES.male.length + GIVEN_NAMES.neutral.length);
  assert.deepEqual(givenNamePool("nonbinary"), all);
});

test("randomName is a given name and a surname from the lists", () => {
  for (let i = 0; i < 50; i++) {
    const [given, surname] = randomName("F").split(" ");
    assert.ok(GIVEN_NAMES.female.includes(given), given);
    assert.ok(SURNAMES.includes(surname), surname);
  }
  assert.equal(randomName("", () => 0), `${GIVEN_NAMES.female[0]} ${SURNAMES[0]}`);
});
