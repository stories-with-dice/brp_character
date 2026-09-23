import { test } from "node:test";
import assert from "node:assert/strict";
import { generateDistinctiveFeatures } from "../js/engine/distinctiveFeaturesEngine.js";
import { featureCountForCHA } from "../js/data/distinctiveFeatures.js";

test("featureCountForCHA follows the book's table", () => {
  assert.equal(featureCountForCHA(2), 4);
  assert.equal(featureCountForCHA(5), 3);
  assert.equal(featureCountForCHA(9), 2);
  assert.equal(featureCountForCHA(11), 1);
  assert.equal(featureCountForCHA(13), 2);
  assert.equal(featureCountForCHA(16), 3);
  assert.equal(featureCountForCHA(20), 4);
});

test("generateDistinctiveFeatures produces the CHA-derived count of features", () => {
  const features = generateDistinctiveFeatures(11); // count = 1
  assert.equal(features.length, 1);
  const features2 = generateDistinctiveFeatures(2); // count = 4
  assert.equal(features2.length, 4);
});

test("generateDistinctiveFeatures respects an explicit override count", () => {
  const features = generateDistinctiveFeatures(11, Math.random, 6);
  assert.equal(features.length, 6);
});

test("each generated feature has a category and non-empty description", () => {
  const features = generateDistinctiveFeatures(3);
  for (const f of features) {
    assert.ok(f.category);
    assert.ok(f.description);
  }
});
