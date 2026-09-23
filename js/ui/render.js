import { skillTotal } from "../engine/skillSheet.js";
import { SKILL_CATEGORIES } from "../data/skills.js";

const ROLL_LABELS = { STR: "Effort", CON: "Stamina", INT: "Idea", POW: "Luck", DEX: "Agility", CHA: "Charm", EDU: "Knowledge" };

export function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === "text") node.textContent = v;
    else if (k === "html") node.innerHTML = v;
    else if (k.startsWith("on") && typeof v === "function") node.addEventListener(k.slice(2), v);
    else node.setAttribute(k, v);
  }
  for (const child of [].concat(children)) {
    if (child == null || child === false) continue;
    node.appendChild(typeof child === "string" || typeof child === "number" ? document.createTextNode(String(child)) : child);
  }
  return node;
}

function characteristicsCard(character) {
  const rows = Object.entries(character.characteristics).map(([key, value]) => {
    const rollLabel = ROLL_LABELS[key];
    const roll = rollLabel ? character.characteristicRolls[rollLabel] : null;
    return el("tr", {}, [
      el("td", { text: `${key}${rollLabel ? ` (${rollLabel})` : ""}` }),
      el("td", { text: roll != null ? `${value}  (${roll}%)` : `${value}` }),
    ]);
  });
  return el("div", { class: "card" }, [
    el("h3", { text: "Characteristics" }),
    el("table", { class: "char-table" }, rows),
  ]);
}

function derivedCard(character) {
  const d = character.derived;
  const rows = [
    ["Damage Modifier", d.damageModifier],
    ["Hit Points", d.hitPoints],
    ["Major Wound Level", d.majorWoundLevel],
    ["Power Points", d.powerPoints],
    ["Experience Bonus", d.experienceBonus],
    ["Move", d.move],
  ];
  if (d.fatiguePoints != null) rows.push(["Fatigue Points", d.fatiguePoints]);
  if (d.sanityPoints != null) rows.push(["Sanity Points", d.sanityPoints]);
  const card = el("div", { class: "card" }, [
    el("h3", { text: "Derived Characteristics" }),
    el(
      "table",
      { class: "char-table" },
      rows.map(([label, value]) => el("tr", {}, [el("td", { text: label }), el("td", { text: String(value) })]))
    ),
  ]);
  if (d.hitPointsByLocation) {
    const locRows = Object.entries(d.hitPointsByLocation).map(([loc, hp]) =>
      el("tr", {}, [el("td", { text: loc }), el("td", { text: String(hp) })])
    );
    card.appendChild(el("h3", { text: "Hit Points by Location", style: "margin-top:10px" }));
    card.appendChild(el("table", { class: "char-table" }, locRows));
  }
  return card;
}

function summaryCard(character) {
  const rows = [
    ["Profession", character.profession],
    ["Wealth", character.wealth],
    ["Age", character.age],
    ["Gender", character.gender || "-"],
  ];
  if (character.personality) rows.push(["Personality", character.personality.name]);
  const card = el("div", { class: "card" }, [
    el("h3", { text: "Summary" }),
    el(
      "table",
      { class: "char-table" },
      rows.map(([label, value]) => el("tr", {}, [el("td", { text: label }), el("td", { text: String(value) })]))
    ),
  ]);
  if (character.professionDescription) {
    card.appendChild(el("p", { text: character.professionDescription, style: "color:var(--text-dim); font-size:0.82rem; margin-top:8px;" }));
  }
  if (character.special) {
    card.appendChild(el("p", { html: `<strong>Special:</strong> ${character.special}`, style: "font-size:0.82rem; margin-top:4px;" }));
  }
  if (character.personality) {
    card.appendChild(el("p", { text: character.personality.description, style: "color:var(--text-dim); font-size:0.82rem; margin-top:4px;" }));
  }
  return card;
}

function featuresCard(character) {
  if (!character.distinctiveFeatures?.length) return null;
  const list = el(
    "ul",
    { class: "features-list" },
    character.distinctiveFeatures.map((f) => el("li", { text: `${f.category}: ${f.description}` }))
  );
  return el("div", { class: "card" }, [el("h3", { text: "Distinctive Features" }), list]);
}

function powersCard(character) {
  if (!character.powers) return null;
  const list = el(
    "ul",
    { class: "powers-list" },
    character.powers.sets.map((s) =>
      el("li", { text: `${s.name} (${s.level} power level, resists via ${s.resistance})` })
    )
  );
  return el("div", { class: "card" }, [
    el("h3", { text: `Powers -- ${character.powers.powerPoints} Power Points` }),
    list,
    el("p", {
      text: "Groundwork only: specific spells/mutations/talents are not generated and can be filled in during play.",
      style: "color:var(--text-dim); font-size:0.8rem; margin-top:6px;",
    }),
  ]);
}

function backgroundCard(character) {
  const { description, background, possessionsNotes } = character;
  if (!description && !background && !possessionsNotes) return null;
  const card = el("div", { class: "card" }, [el("h3", { text: "Background & Possessions" })]);
  if (description) card.appendChild(el("p", { text: description, style: "font-size:0.85rem; margin-bottom:6px;" }));
  if (background) card.appendChild(el("p", { text: background, style: "font-size:0.85rem; margin-bottom:6px;" }));
  if (possessionsNotes) card.appendChild(el("p", { html: `<strong>Possessions:</strong> ${possessionsNotes}`, style: "font-size:0.85rem;" }));
  return card;
}

function skillsSection(character) {
  const trained = new Set();
  if (character.personality) for (const s of character.personality.skills) trained.add(s);
  const entries = Object.values(character.skills).map((e) => ({ ...e, total: skillTotal(e) }));
  entries.sort((a, b) => a.name.localeCompare(b.name));

  const grid = el("div", { class: "skills-grid" });
  for (const category of SKILL_CATEGORIES) {
    const inCategory = entries.filter((e) => e.category === category);
    if (inCategory.length === 0) continue;
    grid.appendChild(el("div", { class: "category-heading", text: category }));
    for (const entry of inCategory) {
      const wasTrained = entry.professionalPoints > 0 || entry.personalPoints > 0 || entry.personalityBonus > 0;
      grid.appendChild(
        el("div", { class: `skill-row${wasTrained ? " trained" : ""}`, title: `base ${entry.base} + category ${entry.categoryBonus} + personality ${entry.personalityBonus} + profession ${entry.professionalPoints} + personal ${entry.personalPoints}` }, [
          el("span", { class: "skill-name", text: entry.name }),
          el("span", { class: "skill-total", text: `${entry.total}%` }),
        ])
      );
    }
  }

  return el("div", { class: "skills-section" }, [
    el("h3", { text: "Skills" }),
    el("p", { text: `Professional skill points: ${character.professionalSkillPointPool} | Personal skill points: ${character.personalSkillPointPool}`, style: "color:var(--text-dim); font-size:0.8rem;" }),
    grid,
  ]);
}

export function renderCharacterSheet(container, character, { onNameChange, onGenderChange } = {}) {
  container.innerHTML = "";

  const nameInput = el("input", {
    type: "text",
    value: character.name || "",
    placeholder: "Character name",
    oninput: (e) => onNameChange?.(e.target.value),
  });

  const header = el("div", { class: "sheet-header" }, [
    el("div", {}, [
      nameInput,
      el("div", { class: "sheet-subline", text: `${character.profession} • ${character.gender || "unspecified"} • age ${character.age}` }),
    ]),
  ]);

  const grid = el("div", { class: "sheet-grid" }, [
    summaryCard(character),
    characteristicsCard(character),
    derivedCard(character),
    featuresCard(character),
    powersCard(character),
    backgroundCard(character),
  ]);

  container.appendChild(header);
  container.appendChild(grid);
  container.appendChild(skillsSection(character));
}
