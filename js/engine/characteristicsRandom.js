// Random-generation helpers layered on top of engine/characteristics.js's
// pure dice/table functions -- these encode a *reasonable* automated
// strategy for the choices a player would normally make by hand (which
// rolls go where, how to spend redistribution/point-buy points). They are
// intentionally simple; a manual UI can always override the result.
import {
  CHARACTERISTICS,
  D3D6_CHARACTERISTICS,
  D2D6PLUS6_CHARACTERISTICS,
  GENERATION_METHODS,
  rollStandardCharacteristics,
  rollChooseableCharacteristics,
  rollHigherStartCharacteristics,
  pointBuyBaseline,
  POINT_BUY_BUDGETS,
  POINT_BUY_COST,
} from "./characteristics.js";

/** Standard method + randomly redistributing up to `maxPoints` between characteristics. */
export function randomStandardCharacteristics(rng = Math.random, { maxPoints = 3, cap = 21 } = {}) {
  const chars = rollStandardCharacteristics(rng);
  let moved = 0;
  let guard = 0;
  while (moved < maxPoints && guard < 50) {
    guard++;
    const sources = CHARACTERISTICS.filter((c) => chars[c] > 3);
    const targets = CHARACTERISTICS.filter((c) => chars[c] < cap);
    if (sources.length === 0 || targets.length === 0) break;
    const source = sources[Math.floor(rng() * sources.length)];
    const target = targets[Math.floor(rng() * targets.length)];
    if (source === target) continue;
    chars[source] -= 1;
    chars[target] += 1;
    moved += 1;
  }
  return chars;
}

/** "Choosing Characteristic Values" option: roll 3D6 seven times, assign to
 * characteristics, keeping SIZ and INT at 8 or above by swapping if needed. */
export function randomChooseRollsCharacteristics(rng = Math.random) {
  const rolls = rollChooseableCharacteristics(rng);
  const order = [...CHARACTERISTICS].sort(() => rng() - 0.5);
  const chars = {};
  order.forEach((c, i) => {
    chars[c] = rolls[i];
  });
  for (const key of ["SIZ", "INT"]) {
    if (chars[key] < 8) {
      const swapTarget = CHARACTERISTICS.find((c) => c !== key && chars[c] >= 8 && !["SIZ", "INT"].includes(c));
      if (swapTarget) {
        const tmp = chars[key];
        chars[key] = chars[swapTarget];
        chars[swapTarget] = tmp;
      }
    }
  }
  return chars;
}

/** Point-based Character Creation (Option): spend the full budget randomly,
 * respecting per-characteristic costs, never dropping below 10 (auto-gen
 * keeps it simple and only spends upward). */
export function randomPointBuyCharacteristics(rng = Math.random, campaignPowerLevel = "Normal", { cap = 21 } = {}) {
  const chars = pointBuyBaseline();
  let budget = POINT_BUY_BUDGETS[campaignPowerLevel] ?? POINT_BUY_BUDGETS.Normal;
  let guard = 0;
  while (budget > 0 && guard < 200) {
    guard++;
    const affordable = CHARACTERISTICS.filter((c) => chars[c] < cap && POINT_BUY_COST[c] <= budget);
    if (affordable.length === 0) break;
    const pick = affordable[Math.floor(rng() * affordable.length)];
    chars[pick] += 1;
    budget -= POINT_BUY_COST[pick];
  }
  return chars;
}

export function generateCharacteristics(method, rng = Math.random, campaignPowerLevel = "Normal") {
  switch (method) {
    case GENERATION_METHODS.CHOOSE_ROLLS:
      return randomChooseRollsCharacteristics(rng);
    case GENERATION_METHODS.HIGHER_START:
      return rollHigherStartCharacteristics(rng);
    case GENERATION_METHODS.POINT_BUY:
      return randomPointBuyCharacteristics(rng, campaignPowerLevel);
    case GENERATION_METHODS.STANDARD:
    default:
      return randomStandardCharacteristics(rng);
  }
}
