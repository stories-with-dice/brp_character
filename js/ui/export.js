import { skillTotal } from "../engine/skillSheet.js";

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

export function characterToMarkdown(character) {
  const lines = [];
  lines.push(`# ${character.name || "Unnamed Character"}`);
  lines.push("");
  lines.push(`**Profession:** ${character.profession}  `);
  lines.push(`**Gender:** ${character.gender || "-"}  `);
  lines.push(`**Age:** ${character.age}  `);
  lines.push(`**Wealth:** ${character.wealth}  `);
  if (character.personality) lines.push(`**Personality:** ${character.personality.name} -- ${character.personality.description}  `);
  lines.push("");
  lines.push("## Characteristics");
  lines.push("");
  lines.push("| Characteristic | Value | Roll |");
  lines.push("|---|---|---|");
  const rollNames = { STR: "Effort", CON: "Stamina", INT: "Idea", POW: "Luck", DEX: "Agility", CHA: "Charm", EDU: "Knowledge" };
  for (const [key, value] of Object.entries(character.characteristics)) {
    const rollName = rollNames[key];
    const roll = rollName ? character.characteristicRolls[rollName] : "";
    lines.push(`| ${key} | ${value} | ${roll ?? ""} |`);
  }
  lines.push("");
  lines.push("## Derived Characteristics");
  lines.push("");
  lines.push(`- Damage Modifier: ${character.derived.damageModifier}`);
  lines.push(`- Hit Points: ${character.derived.hitPoints}`);
  lines.push(`- Major Wound Level: ${character.derived.majorWoundLevel}`);
  lines.push(`- Power Points: ${character.derived.powerPoints}`);
  lines.push(`- Experience Bonus: ${character.derived.experienceBonus}`);
  lines.push(`- Move: ${character.derived.move}`);
  if (character.derived.fatiguePoints != null) lines.push(`- Fatigue Points: ${character.derived.fatiguePoints}`);
  if (character.derived.sanityPoints != null) lines.push(`- Sanity Points: ${character.derived.sanityPoints}`);
  lines.push("");

  if (character.distinctiveFeatures?.length) {
    lines.push("## Distinctive Features");
    lines.push("");
    for (const f of character.distinctiveFeatures) lines.push(`- ${f.category}: ${f.description}`);
    lines.push("");
  }

  if (character.powers) {
    lines.push("## Powers");
    lines.push("");
    lines.push(`Power Points: ${character.powers.powerPoints}`);
    lines.push("");
    for (const set of character.powers.sets) lines.push(`- ${set.name} (${set.level})`);
    lines.push("");
  }

  lines.push("## Skills");
  lines.push("");
  lines.push("| Skill | Category | Total % |");
  lines.push("|---|---|---|");
  for (const entry of sortedSkillEntries(character)) {
    lines.push(`| ${entry.name} | ${entry.category} | ${entry.total} |`);
  }
  lines.push("");

  return lines.join("\n");
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

  if (character.distinctiveFeatures?.length) {
    y += 6;
    addLine("Distinctive Features", { size: 13, bold: true, gap: 18 });
    for (const f of character.distinctiveFeatures) addLine(`${f.category}: ${f.description}`, { size: 9, gap: 12 });
  }

  doc.save(`${safeFileBase(character)}.pdf`);
}
