import { test } from "node:test";
import assert from "node:assert/strict";
import { mentionedWealthLevels, preferredWealthLevel, pickWealthLevel, WEALTH_LEVELS } from "../js/engine/wealth.js";

test("mentionedWealthLevels extracts every level named in the text, in canonical order", () => {
  assert.deepEqual(mentionedWealthLevels("Poor to Affluent, usually Average"), ["Poor", "Average", "Affluent"]);
});

test("mentionedWealthLevels falls back to Average when nothing is mentioned", () => {
  assert.deepEqual(mentionedWealthLevels("Varies widely depending on circumstances"), ["Average"]);
});

test("mentionedWealthLevels handles a single-level description", () => {
  assert.deepEqual(mentionedWealthLevels("Average"), ["Average"]);
});

test("preferredWealthLevel extracts the 'usually X' favorite", () => {
  assert.equal(preferredWealthLevel("Poor to Affluent, usually Average"), "Average");
});

test("preferredWealthLevel returns null when there is no 'usually' clause", () => {
  assert.equal(preferredWealthLevel("Destitute to Wealthy"), null);
});

test("pickWealthLevel always returns one of the five canonical levels", () => {
  for (let i = 0; i < 100; i++) {
    const level = pickWealthLevel("Poor to Affluent, usually Average");
    assert.ok(WEALTH_LEVELS.includes(level));
  }
});

test("pickWealthLevel only ever returns levels actually mentioned in the text", () => {
  for (let i = 0; i < 100; i++) {
    const level = pickWealthLevel("Destitute to Poor, tribal-level existence");
    assert.ok(["Destitute", "Poor"].includes(level));
  }
});
