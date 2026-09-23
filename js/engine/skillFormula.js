// Evaluates the small formula language used for skill base chances, e.g.
// "05", "DEX*2", "INT+POW", "INT*5 or 00", "20 or 01". Formulas with "or"
// have a context-dependent choice (e.g. Language: own language vs. unknown
// language); evaluate() returns all candidate numeric values so callers can
// pick the appropriate one, defaulting to the first.

function evalTerm(term, chars) {
  const t = term.trim();
  if (/^\d+$/.test(t)) return parseInt(t, 10);
  const mulMatch = t.match(/^([A-Z]+)\s*\*\s*(\d+)$/i);
  if (mulMatch) {
    const [, char, mult] = mulMatch;
    const val = chars[char.toUpperCase()];
    if (val == null) throw new Error(`Unknown characteristic in formula: ${char}`);
    return val * parseInt(mult, 10);
  }
  const divMatch = t.match(/^([A-Z]+)\s*\/\s*(\d+)$/i);
  if (divMatch) {
    const [, char, div] = divMatch;
    const val = chars[char.toUpperCase()];
    if (val == null) throw new Error(`Unknown characteristic in formula: ${char}`);
    return Math.floor(val / parseInt(div, 10));
  }
  const sumMatch = t.match(/^([A-Z]+)\s*\+\s*([A-Z]+)$/i);
  if (sumMatch) {
    const [, a, b] = sumMatch;
    const va = chars[a.toUpperCase()];
    const vb = chars[b.toUpperCase()];
    if (va == null || vb == null) throw new Error(`Unknown characteristic in formula: ${t}`);
    return va + vb;
  }
  const bare = chars[t.toUpperCase()];
  if (bare != null) return bare;
  throw new Error(`Cannot evaluate skill formula term: ${term}`);
}

/** Returns an array of candidate numeric base chances for a formula string. */
export function evaluateSkillFormula(formula, chars) {
  return formula.split(/\s+or\s+/i).map((term) => evalTerm(term, chars));
}

/** Returns the default (first-listed) candidate value. */
export function defaultBaseChance(formula, chars) {
  return evaluateSkillFormula(formula, chars)[0];
}
