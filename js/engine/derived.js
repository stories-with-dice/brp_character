// Step Five: Derived Characteristics, plus optional Fatigue/Sanity/Hit-Location systems.

const DAMAGE_MODIFIER_TABLE = [
  { max: 12, dice: "-1D6" },
  { max: 16, dice: "-1D4" },
  { max: 24, dice: "None" },
  { max: 32, dice: "+1D4" },
  { max: 40, dice: "+1D6" },
  { max: 56, dice: "+2D6" },
  { max: 72, dice: "+3D6" },
  { max: 88, dice: "+4D6" },
  { max: 104, dice: "+5D6" },
  { max: 120, dice: "+6D6" },
  { max: 136, dice: "+7D6" },
  { max: 152, dice: "+8D6" },
  { max: 168, dice: "+9D6" },
];

/** Damage Modifier table (STR+SIZ -> dice string), extending by +1D6 per 16 above 168. */
export function damageModifier(str, siz) {
  const total = str + siz;
  if (total <= 168) {
    const row = DAMAGE_MODIFIER_TABLE.find((r) => total <= r.max);
    return row.dice;
  }
  const extraSteps = Math.ceil((total - 168) / 16);
  return `+${9 + extraSteps}D6`;
}

/** Hit Points: (CON+SIZ)/2 rounded up (standard) or CON+SIZ (Total Hit Points option). */
export function hitPoints(con, siz, { totalHitPointsOption = false } = {}) {
  const sum = con + siz;
  return totalHitPointsOption ? sum : Math.ceil(sum / 2);
}

export function majorWoundLevel(hp) {
  return Math.ceil(hp / 2);
}

export function powerPoints(pow) {
  return pow;
}

export function experienceBonus(int) {
  return Math.ceil(int / 2);
}

export const HUMAN_MOVE = 10;

export function fatiguePoints(str, con) {
  return str + con;
}

export function sanityPoints(pow) {
  return pow * 5;
}

/** Hit points per hit location, given total HP (rounding up each location). */
export function hitPointsByLocation(totalHp) {
  return {
    head: Math.ceil(totalHp / 3),
    chest: Math.ceil((totalHp * 4) / 10),
    abdomen: Math.ceil(totalHp / 3),
    leftArm: Math.ceil(totalHp / 4),
    rightArm: Math.ceil(totalHp / 4),
    leftLeg: Math.ceil(totalHp / 3),
    rightLeg: Math.ceil(totalHp / 3),
  };
}

/** Compute all derived characteristics for a character in one call. */
export function computeDerived(chars, options = {}) {
  const {
    totalHitPointsOption = false,
    fatigueOption = false,
    sanityOption = false,
    hitLocationOption = false,
  } = options;

  const hp = hitPoints(chars.CON, chars.SIZ, { totalHitPointsOption });
  const derived = {
    damageModifier: damageModifier(chars.STR, chars.SIZ),
    hitPoints: hp,
    majorWoundLevel: majorWoundLevel(hp),
    powerPoints: powerPoints(chars.POW),
    experienceBonus: experienceBonus(chars.INT),
    move: HUMAN_MOVE,
  };
  if (fatigueOption) derived.fatiguePoints = fatiguePoints(chars.STR, chars.CON);
  if (sanityOption) derived.sanityPoints = sanityPoints(chars.POW);
  if (hitLocationOption) derived.hitPointsByLocation = hitPointsByLocation(hp);
  return derived;
}
