// Step One / Step Four: Name & Characteristics, and Characteristic Rolls.
import { roll3d6, roll2d6plus6 } from "./dice.js";

export const CHARACTERISTICS = ["STR", "CON", "SIZ", "INT", "POW", "DEX", "CHA"];
export const D3D6_CHARACTERISTICS = ["STR", "CON", "POW", "DEX", "CHA"];
export const D2D6PLUS6_CHARACTERISTICS = ["INT", "SIZ"];

/**
 * Generation methods (mutually exclusive, per "Choosing Characteristic Values",
 * "Higher Starting Characteristics", and "Point-based Character Creation" options).
 */
export const GENERATION_METHODS = {
  STANDARD: "standard", // 3D6 for STR/CON/POW/DEX/CHA, 2D6+6 for INT/SIZ, redistribute 3
  CHOOSE_ROLLS: "chooseRolls", // roll 3D6 seven times, assign freely (SIZ/INT min 8)
  HIGHER_START: "higherStart", // 2D6+6 for all seven
  POINT_BUY: "pointBuy", // 24 points (or 36/48/60 for higher power levels), base 10
};

export function rollStandardCharacteristics(rng = Math.random) {
  const chars = {};
  for (const c of D3D6_CHARACTERISTICS) chars[c] = roll3d6(rng);
  for (const c of D2D6PLUS6_CHARACTERISTICS) chars[c] = roll2d6plus6(rng);
  return chars;
}

/** Roll 3D6 seven times, returning the raw pool for the player to assign. */
export function rollChooseableCharacteristics(rng = Math.random) {
  const rolls = [];
  for (let i = 0; i < 7; i++) rolls.push(roll3d6(rng));
  return rolls;
}

export function rollHigherStartCharacteristics(rng = Math.random) {
  const chars = {};
  for (const c of CHARACTERISTICS) chars[c] = roll2d6plus6(rng);
  return chars;
}

/** Point-buy budgets per campaign power level (base characteristic = 10). */
export const POINT_BUY_BUDGETS = { Normal: 24, Heroic: 36, Epic: 48, Superhuman: 60 };
export const POINT_BUY_COST = { STR: 1, CON: 1, SIZ: 1, CHA: 1, DEX: 3, INT: 3, POW: 3 };

export function pointBuyBaseline() {
  const chars = {};
  for (const c of CHARACTERISTICS) chars[c] = 10;
  return chars;
}

/** Cost to move a characteristic from 10 to `value` (positive spends points, negative refunds). */
export function pointBuyCost(characteristic, value) {
  const perPoint = POINT_BUY_COST[characteristic];
  return (value - 10) * perPoint;
}

/**
 * Redistribute up to `maxPoints` between characteristics (Standard method's
 * "redistribute up to 3 points" step). `deltas` is a map of characteristic ->
 * signed integer change; the sum of positive deltas must not exceed maxPoints,
 * and each positive delta must be matched by an equal total of negative
 * deltas taken from other characteristics (points are moved, not created).
 */
export function applyRedistribution(chars, deltas, maxPoints = 3, cap = 21) {
  const result = { ...chars };
  let moved = 0;
  for (const [key, delta] of Object.entries(deltas)) {
    if (delta > 0) moved += delta;
  }
  if (moved > maxPoints) {
    throw new Error(`Cannot redistribute more than ${maxPoints} points (attempted ${moved}).`);
  }
  for (const [key, delta] of Object.entries(deltas)) {
    if (!(key in result)) throw new Error(`Unknown characteristic: ${key}`);
    result[key] += delta;
    if (result[key] > cap) {
      throw new Error(`${key} cannot exceed ${cap} through redistribution.`);
    }
  }
  return result;
}

export const CHARACTERISTIC_ROLL_MULTIPLIERS = {
  STR: { name: "Effort", mult: 5 },
  CON: { name: "Stamina", mult: 5 },
  INT: { name: "Idea", mult: 5 },
  POW: { name: "Luck", mult: 5 },
  DEX: { name: "Agility", mult: 5 },
  CHA: { name: "Charm", mult: 5 },
  EDU: { name: "Knowledge", mult: 5 },
};

/** Step Four: Characteristic Rolls (Effort, Stamina, Idea, Luck, Agility, Charm, [Knowledge]). */
export function characteristicRolls(chars) {
  const rolls = {};
  for (const [key, { name, mult }] of Object.entries(CHARACTERISTIC_ROLL_MULTIPLIERS)) {
    if (chars[key] != null) rolls[name] = chars[key] * mult;
  }
  return rolls;
}
