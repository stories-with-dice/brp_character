import { GIVEN_NAMES, SURNAMES } from "../data/names.js";

const pick = (list, rng) => list[Math.floor(rng() * list.length)];

/** The given-name pool for a free-text gender: "F"/"Female"/"woman" -> female
 * names, "M"/"Male"/"man" -> male names, anything else (or blank) -> all three pools. */
export function givenNamePool(gender = "") {
  const g = gender.trim().toLowerCase();
  if (/^(f|female|woman|girl)$/.test(g)) return GIVEN_NAMES.female;
  if (/^(m|male|man|boy)$/.test(g)) return GIVEN_NAMES.male;
  return [...GIVEN_NAMES.female, ...GIVEN_NAMES.male, ...GIVEN_NAMES.neutral];
}

/** A random "Given Surname" name, e.g. "Nadia Okafor". */
export function randomName(gender = "", rng = Math.random) {
  return `${pick(givenNamePool(gender), rng)} ${pick(SURNAMES, rng)}`;
}
