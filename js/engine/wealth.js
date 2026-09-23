export const WEALTH_LEVELS = ["Destitute", "Poor", "Average", "Affluent", "Wealthy"];

/** The wealth levels explicitly mentioned in a profession's free-text wealth
 * description (e.g. "Poor to Affluent, usually Average" -> ["Poor","Average","Affluent"]),
 * in WEALTH_LEVELS order. Falls back to ["Average"] if none are mentioned. */
export function mentionedWealthLevels(wealthText) {
  const mentioned = WEALTH_LEVELS.filter((lvl) => wealthText.includes(lvl));
  return mentioned.length > 0 ? mentioned : ["Average"];
}

/** The level called out as "usually X" in a wealth description, if any. */
export function preferredWealthLevel(wealthText) {
  const usuallyMatch = wealthText.match(/usually (\w+)/i);
  if (!usuallyMatch) return null;
  return WEALTH_LEVELS.find((l) => l.toLowerCase() === usuallyMatch[1].toLowerCase()) ?? null;
}

/** Pick one of the mentioned wealth levels at random, weighting toward the
 * "usually X" favorite (60% of the time) when one is present. */
export function pickWealthLevel(wealthText, rng = Math.random) {
  const mentioned = mentionedWealthLevels(wealthText);
  const usually = preferredWealthLevel(wealthText);
  if (usually && rng() < 0.6) return usually;
  return mentioned[Math.floor(rng() * mentioned.length)];
}
