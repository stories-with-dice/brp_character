// Dice rolling utilities. Every function accepts an injectable RNG
// (`rng: () => number` returning [0,1)) so tests can supply a deterministic
// sequence. Defaults to Math.random for real use.

/** Roll a single die of `sides` faces, returning 1..sides. */
export function rollDie(sides, rng = Math.random) {
  return Math.floor(rng() * sides) + 1;
}

/** Roll `count` dice of `sides` faces and sum them. */
export function rollDice(count, sides, rng = Math.random) {
  let total = 0;
  for (let i = 0; i < count; i++) total += rollDie(sides, rng);
  return total;
}

export function roll3d6(rng = Math.random) {
  return rollDice(3, 6, rng);
}

export function roll2d6plus6(rng = Math.random) {
  return rollDice(2, 6, rng) + 6;
}

export function roll1d100(rng = Math.random) {
  // 00 is a valid percentile result and represents 100.
  const tens = rollDie(10, rng) - 1; // 0-9
  const ones = rollDie(10, rng) - 1; // 0-9
  const result = tens * 10 + ones;
  return result === 0 ? 100 : result;
}

export function roll1d4(rng = Math.random) {
  return rollDie(4, rng);
}

export function roll1d10(rng = Math.random) {
  return rollDie(10, rng);
}

/**
 * Parse and roll simple dice notation: "3D6", "1D6-1", "2D6+1D4", "1D10*10",
 * "1D6+2", "2D4-1". Supports a chain of +/- terms, each either a flat
 * number, a dice term (NDM), or a dice term multiplied by a flat number
 * (NDM*K). Whitespace-insensitive, case-insensitive.
 */
export function rollNotation(notation, rng = Math.random) {
  const cleaned = String(notation).replace(/\s+/g, "").toUpperCase();
  const termRe = /([+-]?)(\d*D\d+(?:\*\d+)?|\d+)/g;
  let match;
  let total = 0;
  let found = false;
  while ((match = termRe.exec(cleaned)) !== null) {
    found = true;
    const sign = match[1] === "-" ? -1 : 1;
    const term = match[2];
    if (term.includes("D")) {
      const [dicePart, multPart] = term.split("*");
      const [countStr, sidesStr] = dicePart.split("D");
      const count = countStr === "" ? 1 : parseInt(countStr, 10);
      const sides = parseInt(sidesStr, 10);
      const mult = multPart ? parseInt(multPart, 10) : 1;
      total += sign * rollDice(count, sides, rng) * mult;
    } else {
      total += sign * parseInt(term, 10);
    }
  }
  if (!found) throw new Error(`Unrecognized dice notation: ${notation}`);
  return total;
}

/** Deterministic RNG for tests: returns values from a fixed queue, cycling if exhausted. */
export function sequenceRng(values) {
  let i = 0;
  return () => {
    const v = values[i % values.length];
    i++;
    return v;
  };
}

/** Build an RNG fraction that makes rollDie(sides, rng) return exactly `face`. */
export function fractionForFace(face, sides) {
  return (face - 1) / sides + 0.5 / sides;
}
