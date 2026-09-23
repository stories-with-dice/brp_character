export const WEALTH_LEVELS = ["Destitute", "Poor", "Average", "Affluent", "Wealthy"];

/** Parse a profession's free-text wealth description (e.g. "Poor to Affluent,
 * usually Average") into the set of mentioned levels and an optional
 * "usually" favorite, then pick one -- weighting toward "usually X" if present. */
export function pickWealthLevel(wealthText, rng = Math.random) {
  const mentioned = WEALTH_LEVELS.filter((lvl) => wealthText.includes(lvl));
  if (mentioned.length === 0) return "Average";
  const usuallyMatch = wealthText.match(/usually (\w+)/i);
  const usually = usuallyMatch && WEALTH_LEVELS.find((l) => l.toLowerCase() === usuallyMatch[1].toLowerCase());
  if (usually && rng() < 0.6) return usually;
  return mentioned[Math.floor(rng() * mentioned.length)];
}
