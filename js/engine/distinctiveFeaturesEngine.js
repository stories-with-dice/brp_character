import { featureCountForCHA, categoryForRoll } from "../data/distinctiveFeatures.js";
import { rollDie } from "./dice.js";

/** Generate `count` (or CHA-derived count) distinctive features by rolling a
 * D10 category then picking a random option from that category. */
export function generateDistinctiveFeatures(cha, rng = Math.random, count = null) {
  const n = count ?? featureCountForCHA(cha);
  const features = [];
  for (let i = 0; i < n; i++) {
    const category = categoryForRoll(rollDie(10, rng));
    const option = category.options[Math.floor(rng() * category.options.length)];
    features.push({ category: category.category, description: option });
  }
  return features;
}
