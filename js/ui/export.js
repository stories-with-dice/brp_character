import { skillTotal } from "../engine/skillSheet.js";
import { describePower, describePowerSet } from "../engine/powersEngine.js";
import { findSetting } from "../data/settings.js";

function triggerDownload(filename, blob) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function safeFileBase(character) {
  const base = (character.name || character.profession || "brp-character").trim();
  return base.replace(/[^a-z0-9\-_ ]/gi, "").replace(/\s+/g, "-").toLowerCase() || "brp-character";
}

export function exportToJson(character) {
  const blob = new Blob([JSON.stringify(character, null, 2)], { type: "application/json" });
  triggerDownload(`${safeFileBase(character)}.json`, blob);
}

function sortedSkillEntries(character) {
  return Object.values(character.skills)
    .map((e) => ({ ...e, total: skillTotal(e) }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

// The Markdown export targets RPG Keeper's character sheet (osr_keeper repo):
// - the "[BRP]" tag after the name in the first heading marks the sheet as BRP
//   (Keeper shows the name without it);
// - "Name: N" text becomes a sheet variable (usable as $Name in dice formulas),
//   so the characteristics are "STR: 13; CON: 14; ..." (the Combat tracker reads
//   DEX, the DEX rank, and INT from it);
// - "Name: current/max" is a resource: Keeper makes a tracker for each one
//   ("HP: 13/13; PP: 17/17" -> "HP (Name)", "PP (Name)"). Resources and
//   variables go one group per line, separated by "; ";
// - "Name NN%" text becomes a clickable d100 roll, so every skill,
//   characteristic roll, and percentile power is written that way;
// - "[Name]" looks up a Compendium entry on hover. RPG Keeper's bundled BRP
//   Compendium (data/seed-brp.json) has every power, under the names below.

// Power names the BRP Compendium spells another way, by power type. The
// Compendium adds "(Sorcery)", "(Superpower)", etc. where two types share a
// name, "(Adverse)" to the adverse mutations, and uses typographic apostrophes.
const COMPENDIUM_POWER_NAMES = {
  magic: { "Conjure Elemental": "Conjure (type) Elemental" },
  psychic: { Sensitivity: "Sensitivity (Psychic Ability)" },
  sorcery: { Heal: "Heal (Sorcery)", Leap: "Leap (Sorcery)", Ward: "Ward (Sorcery)" },
  superpowers: Object.fromEntries(
    ["Armor", "Invisibility", "Protection", "Regeneration", "Resistance", "Teleport"].map((n) => [n, `${n} (Superpower)`])
  ),
  mutation: { Coloration: "Coloration (Minor)" },
};

/** The `[Name]` reference RPG Keeper's BRP Compendium has for a power, e.g. "[Heal (Sorcery)]". */
export function compendiumPowerRef(typeId, entry) {
  let name = COMPENDIUM_POWER_NAMES[typeId]?.[entry.name] ?? entry.name;
  if (typeId === "mutation" && entry.adverse) name += " (Adverse)";
  if (typeId === "sorcery") name = name.replace(/'/g, "\u2019");
  return `[${name}]`;
}

function powerLine(typeId, entry) {
  const ref = compendiumPowerRef(typeId, entry);
  switch (typeId) {
    case "magic":
    case "psychic":
      return `${ref} ${entry.skill}%`;
    case "sorcery":
      return `${ref} level ${entry.level}`;
    case "mutation":
      return `${ref} (${entry.severity})`;
    case "superpowers": {
      const qualifiers = [entry.variant, ...(entry.specifics ?? [])].filter(Boolean);
      const name = qualifiers.length ? `${ref} (${qualifiers.join(", ")})` : ref;
      return `${name} level ${entry.level}, ${entry.cost} pts`;
    }
    default:
      return ref;
  }
}

const ROLL_NAMES = { STR: "Effort", CON: "Stamina", INT: "Idea", POW: "Luck", DEX: "Agility", CHA: "Charm", EDU: "Knowledge" };
const CHARACTERISTIC_ORDER = ["STR", "CON", "SIZ", "INT", "POW", "DEX", "CHA", "EDU"];
const LOCATION_LABELS = {
  head: "Head", chest: "Chest", abdomen: "Abdomen",
  leftArm: "L. Arm", rightArm: "R. Arm", leftLeg: "L. Leg", rightLeg: "R. Leg",
};

// A skill below 0% has no chance at all. RPG Keeper would also read "-1%" as
// a d20 modifier, so the export writes 0%.
const pct = (n) => `${Math.max(0, n)}%`;

export function characterToMarkdown(character) {
  const d = character.derived;
  const lines = [];
  // "[BRP]" after the name puts the sheet in RPG Keeper's BRP system; it is not a Compendium link.
  lines.push(`# ${character.name || "Unnamed Character"} [BRP]`);
  lines.push("");
  const setting = findSetting(character.options?.setting);
  const tagline = [character.profession, character.gender, character.age != null ? `Age ${character.age}` : null, character.wealth,
    setting.era != null ? setting.name : null]
    .filter(Boolean)
    .join(" · ");
  lines.push(`*${tagline}*`);
  lines.push("");
  if (character.personality) {
    lines.push(`**Personality:** ${character.personality.name}. ${character.personality.description}`);
    lines.push("");
  }

  const keys = [...CHARACTERISTIC_ORDER.filter((k) => k in character.characteristics),
    ...Object.keys(character.characteristics).filter((k) => !CHARACTERISTIC_ORDER.includes(k))];
  lines.push(keys.map((k) => `${k}: ${character.characteristics[k]}`).join("; "));
  lines.push("");

  // Resources, each "Name: current/max": hit points, power points (from the
  // powers block when there is one), and the optional fatigue and sanity points.
  const powerPoints = character.powers?.powerPoints ?? d.powerPoints;
  const resources = [`HP: ${d.hitPoints}/${d.hitPoints}`, `PP: ${powerPoints}/${powerPoints}`];
  if (d.fatiguePoints != null) resources.push(`FP: ${d.fatiguePoints}/${d.fatiguePoints}`);
  if (d.sanityPoints != null) resources.push(`SAN: ${d.sanityPoints}/${d.sanityPoints}`);
  lines.push(resources.join("; "));
  lines.push("");
  lines.push([`Major Wound: ${d.majorWoundLevel}`, `Move: ${d.move}`, `Damage Modifier: ${d.damageModifier}`, `Experience Bonus: ${d.experienceBonus}`].join("; "));
  lines.push("");
  if (d.hitPointsByLocation) {
    const locs = Object.entries(d.hitPointsByLocation).map(([loc, hp]) => `${LOCATION_LABELS[loc] ?? loc} ${hp}`);
    lines.push(`**Hit locations:** ${locs.join(" · ")}`);
    lines.push("");
  }

  lines.push("## Rolls");
  lines.push("");
  const rolls = Object.entries(ROLL_NAMES)
    .filter(([key, rollName]) => key in character.characteristics && character.characteristicRolls[rollName] != null)
    .map(([, rollName]) => `${rollName} ${pct(character.characteristicRolls[rollName])}`);
  if (d.sanityPoints != null) rolls.push(`Sanity ${pct(d.sanityPoints)}`);
  lines.push(rolls.join(", "));
  lines.push("");

  lines.push("## Skills");
  lines.push("");
  const byCategory = new Map();
  for (const entry of sortedSkillEntries(character)) {
    if (!byCategory.has(entry.category)) byCategory.set(entry.category, []);
    byCategory.get(entry.category).push(`${entry.name} ${pct(entry.total)}`);
  }
  for (const category of [...byCategory.keys()].sort()) {
    lines.push(`- **${category}:** ${byCategory.get(category).join(", ")}`);
  }
  lines.push("");

  if (character.powers) {
    lines.push("## Powers");
    lines.push("");
    for (const set of character.powers.sets) {
      lines.push(`### ${describePowerSet(set).replace(" -- ", ", ")}`);
      lines.push("");
      for (const p of set.powers ?? []) lines.push(`- ${powerLine(set.type, p)}`);
      for (const extra of set.extras ?? []) lines.push(`- ${extra}`);
      lines.push("");
    }
  }

  if (character.distinctiveFeatures?.length) {
    lines.push("## Distinctive features");
    lines.push("");
    for (const f of character.distinctiveFeatures) lines.push(`- **${f.category}:** ${f.description}`);
    lines.push("");
  }

  const notes = [character.description, character.background].filter(Boolean);
  if (notes.length || character.possessionsNotes) {
    lines.push("## Notes");
    lines.push("");
    for (const n of notes) {
      lines.push(n);
      lines.push("");
    }
    if (character.possessionsNotes) {
      lines.push(`**Possessions:** ${character.possessionsNotes}`);
      lines.push("");
    }
  }

  return lines.join("\n");
}

/**
 * Copy the Markdown sheet to the clipboard, ready for RPG Keeper's "Paste from clipboard".
 * Resolves true on success. Falls back to execCommand("copy") where the
 * async Clipboard API is missing or refused.
 */
export async function copyMarkdownToClipboard(character) {
  const md = characterToMarkdown(character);
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(md);
      return true;
    }
  } catch {
    // fall through to the execCommand fallback
  }
  const area = document.createElement("textarea");
  area.value = md;
  area.setAttribute("readonly", "");
  area.style.position = "fixed";
  area.style.opacity = "0";
  document.body.appendChild(area);
  area.select();
  try {
    return typeof document.execCommand === "function" && document.execCommand("copy");
  } catch {
    return false;
  } finally {
    area.remove();
  }
}

export function exportToMarkdown(character) {
  const md = characterToMarkdown(character);
  const blob = new Blob([md], { type: "text/markdown" });
  triggerDownload(`${safeFileBase(character)}.md`, blob);
}

export function exportToPdf(character) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: "pt", format: "letter" });
  const marginX = 40;
  let y = 50;
  const lineHeight = 14;

  const addLine = (text, opts = {}) => {
    const { size = 10, bold = false, gap = lineHeight } = opts;
    doc.setFontSize(size);
    doc.setFont(undefined, bold ? "bold" : "normal");
    if (y > 760) {
      doc.addPage();
      y = 50;
    }
    doc.text(text, marginX, y);
    y += gap;
  };

  addLine(character.name || "Unnamed Character", { size: 18, bold: true, gap: 22 });
  addLine(`${character.profession} - ${character.gender || "?"}, Age ${character.age}, ${character.wealth}`, { size: 11 });
  y += 6;

  addLine("Characteristics", { size: 13, bold: true, gap: 18 });
  const charLine = Object.entries(character.characteristics).map(([k, v]) => `${k} ${v}`).join("   ");
  addLine(charLine, { size: 10 });
  y += 6;

  addLine("Derived", { size: 13, bold: true, gap: 18 });
  addLine(
    `Damage Mod ${character.derived.damageModifier}   HP ${character.derived.hitPoints}   Major Wound ${character.derived.majorWoundLevel}   PP ${character.derived.powerPoints}   Exp Bonus ${character.derived.experienceBonus}   Move ${character.derived.move}`,
    { size: 10 }
  );
  if (character.derived.fatiguePoints != null) addLine(`Fatigue ${character.derived.fatiguePoints}`, { size: 10 });
  if (character.derived.sanityPoints != null) addLine(`Sanity ${character.derived.sanityPoints}`, { size: 10 });
  y += 6;

  if (character.personality) {
    addLine("Personality", { size: 13, bold: true, gap: 18 });
    addLine(`${character.personality.name}: ${character.personality.description}`, { size: 10 });
    y += 6;
  }

  addLine("Skills", { size: 13, bold: true, gap: 18 });
  for (const entry of sortedSkillEntries(character)) {
    addLine(`${entry.name}  ${entry.total}%`, { size: 9, gap: 12 });
  }

  if (character.powers) {
    y += 6;
    addLine(`Powers (${character.powers.powerPoints} Power Points)`, { size: 13, bold: true, gap: 18 });
    for (const set of character.powers.sets) {
      addLine(describePowerSet(set), { size: 10, bold: true, gap: 14 });
      for (const p of set.powers ?? []) addLine(describePower(set.type, p), { size: 9, gap: 12 });
      for (const extra of set.extras ?? []) addLine(extra, { size: 9, gap: 12 });
    }
  }

  if (character.distinctiveFeatures?.length) {
    y += 6;
    addLine("Distinctive Features", { size: 13, bold: true, gap: 18 });
    for (const f of character.distinctiveFeatures) addLine(`${f.category}: ${f.description}`, { size: 9, gap: 12 });
  }

  doc.save(`${safeFileBase(character)}.pdf`);
}
