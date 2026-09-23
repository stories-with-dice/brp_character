// Step-by-step manual character builder. Mirrors the BRP character-creation
// steps (Chapter 2), letting the player make every choice by hand, with a
// "Randomize this step" shortcut available on each step. Reuses the same
// engine functions Quick Random uses, just driven by UI state instead of an
// RNG, and hands off to the same assembleCharacter() shape as the random
// path so render.js/export.js work identically either way.
import { el, renderCharacterSheet } from "./render.js";
import { PROFESSIONS, findProfession } from "../data/professions.js";
import { SKILLS, findSkill } from "../data/skills.js";
import { PERSONALITY_TYPES, PERSONALITY_SKILL_COUNT } from "../data/personality.js";
import { DISTINCTIVE_FEATURE_CATEGORIES, featureCountForCHA } from "../data/distinctiveFeatures.js";
import { POWER_TYPES } from "../data/powers.js";

import {
  CHARACTERISTICS,
  GENERATION_METHODS,
  rollStandardCharacteristics,
  rollChooseableCharacteristics,
  rollHigherStartCharacteristics,
  pointBuyBaseline,
  POINT_BUY_BUDGETS,
  POINT_BUY_COST,
} from "../engine/characteristics.js";
import { computeDerived } from "../engine/derived.js";
import { rollStartingAge, ageModifiers, applyCharacteristicReductions, DEFAULT_MIN_AGE, OLD_AGE_PENALTY_CHARACTERISTICS } from "../engine/age.js";
import { roll2d6plus6 } from "../engine/dice.js";
import {
  resolveProfessionSkills,
  resolveProfessionSkillsManual,
  allocatePointsRandomly,
} from "../engine/professionSkills.js";
import {
  refNeedsSpecialtyChoice,
  specialtyOptionsFor,
  resolveSkillDisplayNameManual,
  resolveSkillDisplayName,
  parseSkillRef,
  baseSkillName,
} from "../engine/skillRef.js";
import { baselineSkillEntries, ensureSkillEntry, currentTotalBeforePoints, skillTotal } from "../engine/skillSheet.js";
import { professionalSkillPointPool, personalSkillPointPool, professionalSkillCap, personalSkillCap } from "../engine/skillPoints.js";
import {
  rollPersonalityType,
  resolvePersonalitySkills,
  resolvePersonalitySkillsManual,
  buildCustomPersonality,
  COMBAT_SKILL_NAMES,
  PERSONALITY_BONUS,
} from "../engine/personalityEngine.js";
import { generateDistinctiveFeatures } from "../engine/distinctiveFeaturesEngine.js";
import { assignPowerTypes, flattenPowerSetOption, buildPowersBlockManual } from "../engine/powersEngine.js";
import { powerSetOptionsFor } from "../data/powers.js";
import { mentionedWealthLevels, preferredWealthLevel, pickWealthLevel } from "../engine/wealth.js";
import { sumAllocations, headroomFor } from "../engine/pointAllocation.js";
import { assembleCharacter } from "../engine/characterAssembly.js";

const $ = (id) => document.getElementById(id);

let state = null;
let onFinishCallback = null;

function freshState(options) {
  return {
    options,
    name: "",
    gender: "",
    charMethod: options.characteristicMethod,
    rolledCharacteristics: null, // the raw roll, before redistribution
    characteristics: null, // current working characteristics (post any in-step edits)
    redistributionTokens: 3,
    rollPool: null, // for chooseRolls: array of 7 rolled values
    rollAssignment: null, // for chooseRolls: {STR:idx, CON:idx, ...}
    pointBuySpent: 0,
    baseCharacteristics: null, // snapshot taken once the characteristics step is confirmed
    age: null,
    oldPenaltyPicks: [],
    youngPenaltyPicks: [],
    ageSkillPointModifier: 0,
    powerOptionIndex: null,
    powerSlotChoices: [], // [{level, typeId}]
    personalityMode: null, // 'type' | 'custom'
    personalityTypeId: null,
    personalityPicks: { craftChoices: [], knowledgeChoices: [], technicalChoices: [], languageChoices: [], combatChoices: [] },
    personalityCustomSkills: [],
    personality: null, // resolved {name, description, skills}
    professionName: null,
    professionChoiceSelections: [], // parallel to profession.choices
    professionSpecialtyChoices: {}, // ref -> specialty
    skillEntries: null,
    professionalAllocations: {},
    personalAllocations: {},
    personalExtraSkills: [],
    wealthLevel: null,
    possessionsNotes: "",
    description: "",
    background: "",
    distinctiveFeatureChoices: [], // [{category, description}]
  };
}

function activeSteps(options) {
  const steps = ["characteristics"];
  if (options.usePowers) steps.push("powers");
  steps.push("age");
  if (options.usePersonality) steps.push("personality");
  steps.push("profession");
  if (options.useDistinctiveFeatures) steps.push("features");
  steps.push("background");
  steps.push("review");
  return steps;
}

const STEP_TITLES = {
  characteristics: "Step 1: Name & Characteristics",
  powers: "Step 2: Powers",
  age: "Step 3: Age & Experience",
  personality: "Step 6: Personality",
  profession: "Step 7: Profession & Skills",
  features: "Step 9: Distinctive Features",
  background: "Step 8/10: Possessions & Background",
  review: "Review & Finish",
};

let stepIndex = 0;

function currentStepId() {
  return activeSteps(state.options)[stepIndex];
}

function showError(msg) {
  const box = $("wizard-error");
  if (msg) {
    box.textContent = msg;
    box.hidden = false;
  } else {
    box.hidden = true;
  }
}

// ---------------------------------------------------------------- helpers

function num(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function skillOptionsForState() {
  return { useCategoryBonus: state.options.useCategoryBonus, categoryBonusMethod: state.options.categoryBonusMethod, usePowers: state.options.usePowers };
}

/** Render a <select> of concrete specialty options for a base skill, wired
 * to call `onChange(value)`. */
function specialtySelect(base, currentValue, onChange) {
  const options = specialtyOptionsFor(base) ?? [];
  const select = el("select", {
    onchange: (e) => onChange(e.target.value),
  });
  for (const opt of options) {
    const optionEl = el("option", { value: opt, text: opt });
    if (opt === currentValue) optionEl.setAttribute("selected", "selected");
    select.appendChild(optionEl);
  }
  return select;
}

// ------------------------------------------------------------ Step: Characteristics

function rerollCharacteristics() {
  const method = state.charMethod;
  const existingEDU = state.characteristics?.EDU ?? null;
  if (method === GENERATION_METHODS.CHOOSE_ROLLS) {
    state.rollPool = rollChooseableCharacteristics();
    state.rollAssignment = {};
    CHARACTERISTICS.forEach((c, i) => {
      state.rollAssignment[c] = i;
    });
    state.rolledCharacteristics = null;
    // This method assigns STR..CHA from rollPool/rollAssignment (see
    // currentAssignedCharacteristics), not from state.characteristics -- but
    // EDU isn't part of that pool, so it's tracked here regardless of method.
    state.characteristics = {};
  } else if (method === GENERATION_METHODS.HIGHER_START) {
    state.rolledCharacteristics = rollHigherStartCharacteristics();
    state.characteristics = { ...state.rolledCharacteristics };
  } else if (method === GENERATION_METHODS.POINT_BUY) {
    state.rolledCharacteristics = pointBuyBaseline();
    state.characteristics = { ...state.rolledCharacteristics };
    state.pointBuySpent = 0;
  } else {
    state.rolledCharacteristics = rollStandardCharacteristics();
    state.characteristics = { ...state.rolledCharacteristics };
    state.redistributionTokens = 3;
  }
  if (state.options.useEDU) state.characteristics.EDU = existingEDU;
}

function currentAssignedCharacteristics() {
  if (state.charMethod === GENERATION_METHODS.CHOOSE_ROLLS) {
    const chars = {};
    for (const c of CHARACTERISTICS) {
      const idx = state.rollAssignment?.[c];
      chars[c] = idx != null ? state.rollPool[idx] : null;
    }
    if (state.options.useEDU) chars.EDU = state.characteristics?.EDU ?? null;
    return chars;
  }
  return state.characteristics;
}

function renderCharacteristicsStep(container) {
  if (!state.rolledCharacteristics && !state.rollPool) rerollCharacteristics();

  container.appendChild(
    el("div", { class: "field-row" }, [
      el("div", { class: "field" }, [el("label", { text: "Name" }), el("input", { type: "text", value: state.name, oninput: (e) => (state.name = e.target.value) })]),
      el("div", { class: "field" }, [el("label", { text: "Gender" }), el("input", { type: "text", value: state.gender, oninput: (e) => (state.gender = e.target.value) })]),
    ])
  );

  container.appendChild(el("p", { class: "readonly-note", text: `Generation method: ${methodLabel(state.charMethod)} (set in Optional Rules above).` }));

  if (state.charMethod === GENERATION_METHODS.CHOOSE_ROLLS) {
    container.appendChild(renderChooseRollsTable());
  } else if (state.charMethod === GENERATION_METHODS.POINT_BUY) {
    container.appendChild(renderPointBuyTable());
  } else {
    container.appendChild(renderStandardOrHigherTable());
  }

  if (state.options.useEDU) {
    container.appendChild(renderEduRow());
  }

  container.appendChild(renderCharacteristicsPreview());
}

function methodLabel(method) {
  return (
    {
      [GENERATION_METHODS.STANDARD]: "Standard (3D6 / 2D6+6, redistribute 3)",
      [GENERATION_METHODS.CHOOSE_ROLLS]: "Choosing Characteristic Values (7x 3D6, assign)",
      [GENERATION_METHODS.HIGHER_START]: "Higher Starting Characteristics (2D6+6 all)",
      [GENERATION_METHODS.POINT_BUY]: "Point-based Character Creation",
    }[method] ?? method
  );
}

function renderStandardOrHigherTable() {
  const isStandard = state.charMethod === GENERATION_METHODS.STANDARD;
  const rows = CHARACTERISTICS.map((c) => el("tr", {}, [el("td", { text: c }), el("td", { text: String(state.characteristics[c]) })]));
  const table = el("table", { class: "char-edit-table" }, rows);
  const wrap = el("div", {}, [table]);

  if (isStandard) {
    wrap.appendChild(el("p", { class: "budget-line", text: `Redistribution tokens remaining: ${state.redistributionTokens} of 3` }));
    const fromSelect = el(
      "select",
      { id: "redist-from" },
      CHARACTERISTICS.map((c) => el("option", { value: c, text: c }))
    );
    const toSelect = el(
      "select",
      { id: "redist-to" },
      CHARACTERISTICS.map((c) => el("option", { value: c, text: c }))
    );
    const moveBtn = el("button", {
      class: "btn btn-small",
      text: "Move 1 point",
      onclick: () => {
        const from = fromSelect.value;
        const to = toSelect.value;
        if (from === to) return showError("Pick two different characteristics to move a point between.");
        if (state.redistributionTokens <= 0) return showError("No redistribution tokens left.");
        const minFrom = ["SIZ", "INT"].includes(from) ? 8 : 3;
        if (state.characteristics[from] - 1 < minFrom) return showError(`${from} can't go below ${minFrom}.`);
        if (state.characteristics[to] + 1 > 21) return showError(`${to} can't exceed 21.`);
        state.characteristics[from] -= 1;
        state.characteristics[to] += 1;
        state.redistributionTokens -= 1;
        showError(null);
        rerenderStep();
      },
    });
    wrap.appendChild(el("div", { class: "field-row" }, [fromSelect, toSelect, moveBtn]));
  }
  return wrap;
}

function renderChooseRollsTable() {
  const wrap = el("div", {});
  wrap.appendChild(el("p", { class: "readonly-note", text: `Rolled values: ${state.rollPool.map((v, i) => `#${i + 1}=${v}`).join(", ")}` }));
  const rows = CHARACTERISTICS.map((c) => {
    const select = el(
      "select",
      {
        onchange: (e) => {
          state.rollAssignment[c] = Number(e.target.value);
          rerenderStep();
        },
      },
      state.rollPool.map((v, i) => {
        const opt = el("option", { value: String(i), text: `Roll #${i + 1} = ${v}` });
        if (state.rollAssignment[c] === i) opt.setAttribute("selected", "selected");
        return opt;
      })
    );
    return el("tr", {}, [el("td", { text: c }), el("td", {}, [select])]);
  });
  wrap.appendChild(el("table", { class: "char-edit-table" }, rows));

  const usedIdx = Object.values(state.rollAssignment);
  const duplicates = usedIdx.length !== new Set(usedIdx).size;
  if (duplicates) wrap.appendChild(el("p", { class: "wizard-error", text: "Each rolled value must be assigned to exactly one characteristic." }));
  const chars = currentAssignedCharacteristics();
  if (chars.SIZ != null && chars.SIZ < 8) wrap.appendChild(el("p", { class: "wizard-error", text: "SIZ must be at least 8 with this method." }));
  if (chars.INT != null && chars.INT < 8) wrap.appendChild(el("p", { class: "wizard-error", text: "INT must be at least 8 with this method." }));
  return wrap;
}

function renderPointBuyTable() {
  const level = state.options.campaignPowerLevel;
  const budget = POINT_BUY_BUDGETS[level] ?? POINT_BUY_BUDGETS.Normal;
  const wrap = el("div", {});
  const rows = CHARACTERISTICS.filter((c) => c !== "EDU").map((c) => {
    const cost = POINT_BUY_COST[c];
    const minus = el("button", {
      class: "pip-btn",
      text: "-",
      onclick: () => {
        if (state.characteristics[c] <= 3) return;
        state.characteristics[c] -= 1;
        state.pointBuySpent -= cost;
        rerenderStep();
      },
    });
    const plus = el("button", {
      class: "pip-btn",
      text: "+",
      onclick: () => {
        if (state.characteristics[c] >= 21) return showError(`${c} can't exceed 21.`);
        if (state.pointBuySpent + cost > budget) return showError("Not enough budget remaining.");
        state.characteristics[c] += 1;
        state.pointBuySpent += cost;
        showError(null);
        rerenderStep();
      },
    });
    return el("tr", {}, [el("td", { text: `${c} (${cost}pt/pt)` }), el("td", {}, [minus]), el("td", { text: String(state.characteristics[c]) }), el("td", {}, [plus])]);
  });
  wrap.appendChild(el("table", { class: "char-edit-table" }, rows));
  const over = state.pointBuySpent > budget;
  wrap.appendChild(el("p", { class: `budget-line${over ? " over" : ""}`, text: `Budget: ${state.pointBuySpent} / ${budget} spent` }));
  return wrap;
}

function renderEduRow() {
  const wrap = el("div", { class: "field-row" });
  const input = el("input", {
    type: "number",
    value: state.characteristics.EDU ?? "",
    onchange: (e) => {
      state.characteristics.EDU = e.target.value ? Number(e.target.value) : null;
      rerenderStep();
    },
  });
  const rollBtn = el("button", {
    class: "btn btn-small",
    text: "Roll 2D6+6",
    onclick: () => {
      state.characteristics.EDU = roll2d6plus6();
      rerenderStep();
    },
  });
  wrap.appendChild(el("div", { class: "field" }, [el("label", { text: "EDU (Education)" }), input, rollBtn]));
  return wrap;
}

function renderCharacteristicsPreview() {
  const chars = currentAssignedCharacteristics();
  if (Object.values(chars).some((v) => v == null)) {
    return el("p", { class: "readonly-note", text: "Assign all characteristics to see derived stats." });
  }
  const derived = computeDerived(chars, {
    totalHitPointsOption: state.options.useTotalHitPoints,
    fatigueOption: state.options.useFatigue,
    sanityOption: state.options.useSanity,
    hitLocationOption: state.options.useHitLocation,
  });
  const rolls = { Effort: chars.STR * 5, Stamina: chars.CON * 5, Idea: chars.INT * 5, Luck: chars.POW * 5, Agility: chars.DEX * 5, Charm: chars.CHA * 5 };
  if (chars.EDU != null) rolls.Knowledge = chars.EDU * 5;
  const lines = [
    `HP ${derived.hitPoints} • Damage Mod ${derived.damageModifier} • Power Points ${derived.powerPoints} • Move ${derived.move} • Exp Bonus ${derived.experienceBonus}`,
    Object.entries(rolls).map(([k, v]) => `${k} ${v}%`).join(" • "),
  ];
  return el("div", { class: "card" }, [el("h3", { text: "Preview" }), ...lines.map((l) => el("p", { text: l, style: "font-size:0.85rem;" }))]);
}

function finalizeCharacteristicsStep() {
  const chars = currentAssignedCharacteristics();
  for (const c of CHARACTERISTICS) {
    if (chars[c] == null) throw new Error(`Assign a value for ${c} before continuing.`);
  }
  if (state.options.useEDU && chars.EDU == null) throw new Error("Roll or enter an EDU value before continuing.");
  if (state.charMethod === GENERATION_METHODS.CHOOSE_ROLLS) {
    const usedIdx = Object.values(state.rollAssignment);
    if (usedIdx.length !== new Set(usedIdx).size) throw new Error("Each rolled value must be assigned to exactly one characteristic.");
    if (chars.SIZ < 8 || chars.INT < 8) throw new Error("SIZ and INT must each be at least 8 with this method.");
  }
  if (state.charMethod === GENERATION_METHODS.POINT_BUY) {
    const level = state.options.campaignPowerLevel;
    const budget = POINT_BUY_BUDGETS[level] ?? POINT_BUY_BUDGETS.Normal;
    if (state.pointBuySpent > budget) throw new Error("You've spent more points than your budget allows.");
  }
  state.baseCharacteristics = { ...chars };
  state.characteristics = { ...chars };
}

// ------------------------------------------------------------ Step: Powers

function powerOptionLabel(option) {
  return option.map((o) => `${o.count} at ${o.level}`).join(" + ");
}

function renderPowersStep(container) {
  const level = state.options.campaignPowerLevel;
  const powerOptions = powerSetOptionsFor(level);
  if (state.powerOptionIndex == null) state.powerOptionIndex = 0;
  if (state.powerSlotChoices.length === 0) {
    const slots = flattenPowerSetOption(powerOptions[state.powerOptionIndex]);
    state.powerSlotChoices = slots.map((s) => ({ level: s.level, typeId: POWER_TYPES[0].id }));
  }

  container.appendChild(el("p", { class: "readonly-note", text: "Choose how many power sets your character begins with, and what type each one is." }));

  const radios = powerOptions.map((option, i) =>
    el("label", { class: "toggle", style: "display:block; margin-bottom:6px;" }, [
      el("input", {
        type: "radio",
        name: "power-option",
        ...(i === state.powerOptionIndex ? { checked: "checked" } : {}),
        onchange: () => {
          state.powerOptionIndex = i;
          state.powerSlotChoices = flattenPowerSetOption(powerOptions[i]).map((s) => ({ level: s.level, typeId: POWER_TYPES[0].id }));
          rerenderStep();
        },
      }),
      ` ${powerOptionLabel(option)}`,
    ])
  );
  container.appendChild(el("div", {}, radios));

  const slotRows = state.powerSlotChoices.map((slot, i) =>
    el("div", { class: "field-row" }, [
      el("div", { class: "field" }, [
        el("label", { text: `Power set ${i + 1} (${slot.level})` }),
        el(
          "select",
          {
            onchange: (e) => {
              state.powerSlotChoices[i].typeId = e.target.value;
            },
          },
          POWER_TYPES.map((t) => {
            const opt = el("option", { value: t.id, text: `${t.name} (resists via ${t.resistance})` });
            if (t.id === slot.typeId) opt.setAttribute("selected", "selected");
            return opt;
          })
        ),
      ]),
    ])
  );
  container.appendChild(el("div", {}, slotRows));
}

function finalizePowersStep() {
  if (state.powerSlotChoices.some((s) => !s.typeId)) throw new Error("Choose a power type for every power set.");
}

// ------------------------------------------------------------ Step: Age

function renderAgeStep(container) {
  if (state.age == null) state.age = rollStartingAge();

  const input = el("input", {
    type: "number",
    value: state.age,
    onchange: (e) => {
      state.age = e.target.value ? Number(e.target.value) : null;
      rerenderStep();
    },
  });
  const rollBtn = el("button", { class: "btn btn-small", text: "Roll 17+1D6", onclick: () => { state.age = rollStartingAge(); rerenderStep(); } });
  container.appendChild(el("div", { class: "field-row" }, [el("div", { class: "field" }, [el("label", { text: "Age" }), input, rollBtn])]));

  if (!state.options.useAgeModifiers || state.age == null) {
    container.appendChild(el("p", { class: "readonly-note", text: "Age-based modifiers are turned off in Optional Rules, or no age is set yet." }));
    return;
  }

  const mods = ageModifiers(state.age, state.options.campaignPowerLevel, { minAge: DEFAULT_MIN_AGE });
  container.appendChild(el("p", { class: "readonly-note", text: `Professional skill point modifier: ${mods.skillPointModifier >= 0 ? "+" : ""}${mods.skillPointModifier}` }));
  state.ageSkillPointModifier = mods.skillPointModifier;

  while (state.oldPenaltyPicks.length < mods.characteristicPenalties) state.oldPenaltyPicks.push(OLD_AGE_PENALTY_CHARACTERISTICS[0]);
  state.oldPenaltyPicks.length = mods.characteristicPenalties;
  while (state.youngPenaltyPicks.length < mods.youngCharacteristicPenalty) state.youngPenaltyPicks.push(CHARACTERISTICS.filter((c) => c !== "EDU")[0]);
  state.youngPenaltyPicks.length = mods.youngCharacteristicPenalty;

  if (mods.characteristicPenalties > 0) {
    container.appendChild(el("p", { class: "readonly-note", text: `Age 50+/80+: choose ${mods.characteristicPenalties} characteristic(s) to reduce by 1 (from STR/CON/DEX/CHA).` }));
    container.appendChild(
      el(
        "div",
        {},
        state.oldPenaltyPicks.map((pick, i) =>
          el(
            "select",
            { onchange: (e) => (state.oldPenaltyPicks[i] = e.target.value) },
            OLD_AGE_PENALTY_CHARACTERISTICS.map((c) => {
              const opt = el("option", { value: c, text: c });
              if (c === pick) opt.setAttribute("selected", "selected");
              return opt;
            })
          )
        )
      )
    );
  }

  if (mods.youngCharacteristicPenalty > 0) {
    const eligible = CHARACTERISTICS.filter((c) => c !== "EDU");
    container.appendChild(el("p", { class: "readonly-note", text: `Below minimum age: choose ${mods.youngCharacteristicPenalty} characteristic reduction(s) (any characteristic except EDU; repeats allowed).` }));
    container.appendChild(
      el(
        "div",
        {},
        state.youngPenaltyPicks.map((pick, i) =>
          el(
            "select",
            { onchange: (e) => (state.youngPenaltyPicks[i] = e.target.value) },
            eligible.map((c) => {
              const opt = el("option", { value: c, text: c });
              if (c === pick) opt.setAttribute("selected", "selected");
              return opt;
            })
          )
        )
      )
    );
  }

  const preview = applyCharacteristicReductions(state.baseCharacteristics, [...state.oldPenaltyPicks, ...state.youngPenaltyPicks]);
  container.appendChild(
    el("p", { class: "readonly-note", text: `Resulting characteristics: ${CHARACTERISTICS.map((c) => `${c} ${preview[c]}`).join(", ")}` })
  );
}

function finalizeAgeStep() {
  if (state.age == null || state.age < 1) throw new Error("Enter a valid age.");
  if (state.options.useAgeModifiers) {
    state.characteristics = applyCharacteristicReductions(state.baseCharacteristics, [...state.oldPenaltyPicks, ...state.youngPenaltyPicks]);
  } else {
    state.characteristics = { ...state.baseCharacteristics };
    state.ageSkillPointModifier = 0;
  }
}

// ------------------------------------------------------------ Step: Personality

function personalitySpecialtyPicks(personality, rng = Math.random) {
  const picks = { craftChoices: [], knowledgeChoices: [], technicalChoices: [], languageChoices: [], combatChoices: [] };
  const bases = { craftChoices: "Craft", knowledgeChoices: "Knowledge", technicalChoices: "Technical Skill", languageChoices: "Language" };
  for (const [key, base] of Object.entries(bases)) {
    const count = personality[key] ?? 0;
    for (let i = 0; i < count; i++) {
      const options = specialtyOptionsFor(base) ?? [];
      const pick = options[Math.floor(rng() * options.length)];
      picks[key].push(`${base} (${pick})`);
    }
  }
  const combatCount = personality.combatChoices ?? 0;
  const fixedBases = new Set(personality.skills.map(baseSkillName));
  const availableBases = COMBAT_SKILL_NAMES.filter((b) => !fixedBases.has(b));
  const usedBases = new Set();
  for (let i = 0; i < combatCount; i++) {
    const pool = availableBases.filter((b) => !usedBases.has(b));
    if (pool.length === 0) break;
    const base = pool[Math.floor(rng() * pool.length)];
    usedBases.add(base);
    picks.combatChoices.push(resolveSkillDisplayName(base, rng));
  }
  return picks;
}

function renderPersonalityStep(container) {
  if (state.personalityMode == null) {
    state.personalityMode = "type";
    state.personalityTypeId = PERSONALITY_TYPES[0].id;
    state.personalityPicks = personalitySpecialtyPicks(PERSONALITY_TYPES[0]);
  }

  const modeRow = el("div", { class: "field-row" }, [
    el("label", { class: "toggle" }, [
      el("input", { type: "radio", name: "personality-mode", ...(state.personalityMode === "type" ? { checked: "checked" } : {}), onchange: () => { state.personalityMode = "type"; rerenderStep(); } }),
      " Choose a package",
    ]),
    el("label", { class: "toggle" }, [
      el("input", { type: "radio", name: "personality-mode", ...(state.personalityMode === "custom" ? { checked: "checked" } : {}), onchange: () => { state.personalityMode = "custom"; rerenderStep(); } }),
      " Custom (pick any 13 skills)",
    ]),
  ]);
  container.appendChild(modeRow);

  if (state.personalityMode === "custom") {
    container.appendChild(renderCustomPersonalityPicker());
    return;
  }

  const typeSelect = el(
    "select",
    {
      onchange: (e) => {
        state.personalityTypeId = Number(e.target.value);
        const type = PERSONALITY_TYPES.find((p) => p.id === state.personalityTypeId);
        state.personalityPicks = personalitySpecialtyPicks(type);
        rerenderStep();
      },
    },
    PERSONALITY_TYPES.map((p) => {
      const opt = el("option", { value: String(p.id), text: p.name });
      if (p.id === state.personalityTypeId) opt.setAttribute("selected", "selected");
      return opt;
    })
  );
  container.appendChild(el("div", { class: "field-row" }, [el("div", { class: "field" }, [el("label", { text: "Personality package" }), typeSelect])]));

  const type = PERSONALITY_TYPES.find((p) => p.id === state.personalityTypeId);
  container.appendChild(el("p", { class: "readonly-note", text: type.description }));
  container.appendChild(el("p", { class: "readonly-note", text: `Fixed skills (+20 each): ${type.skills.join(", ")}` }));

  const bases = { craftChoices: "Craft", knowledgeChoices: "Knowledge", technicalChoices: "Technical Skill", languageChoices: "Language" };
  for (const [key, base] of Object.entries(bases)) {
    const count = type[key] ?? 0;
    if (count === 0) continue;
    const picks = state.personalityPicks[key];
    container.appendChild(
      el(
        "div",
        { class: "choice-pool" },
        [el("div", { class: "choice-pool-title", text: `${base}: choose ${count}` })].concat(
          Array.from({ length: count }).map((_, i) =>
            specialtySelect(base, (picks[i] ?? "").replace(`${base} (`, "").replace(")", ""), (v) => {
              state.personalityPicks[key][i] = `${base} (${v})`;
            })
          )
        )
      )
    );
  }

  if (type.combatChoices) {
    const fixedBases = new Set(type.skills.map(baseSkillName));
    const availableBases = COMBAT_SKILL_NAMES.filter((b) => !fixedBases.has(b));
    const picks = state.personalityPicks.combatChoices;
    container.appendChild(
      el(
        "div",
        { class: "choice-pool" },
        [el("div", { class: "choice-pool-title", text: `Combat skill: choose ${type.combatChoices}` })].concat(
          Array.from({ length: type.combatChoices }).map((_, i) => renderCombatSkillPicker(availableBases, picks, i))
        )
      )
    );
  }
}

function renderCombatSkillPicker(availableBases, picks, i) {
  const current = picks[i] ?? "";
  const currentBase = current ? baseSkillName(current) : availableBases[0];
  const baseSelect = el(
    "select",
    {
      onchange: (e) => {
        const base = e.target.value;
        const skillDef = findSkill(base);
        picks[i] = skillDef?.specialty ? resolveSkillDisplayNameManual(`${base} (any)`, specialtyOptionsFor(base)[0]) : base;
        rerenderStep();
      },
    },
    availableBases.map((b) => {
      const opt = el("option", { value: b, text: b });
      if (b === currentBase) opt.setAttribute("selected", "selected");
      return opt;
    })
  );
  const wrap = el("span", { class: "choice-item" }, [baseSelect]);
  const skillDef = findSkill(currentBase);
  if (skillDef?.specialty) {
    const currentSpecialty = current.includes("(") ? parseSkillRef(current).specialty : specialtyOptionsFor(currentBase)[0];
    wrap.appendChild(specialtySelect(currentBase, currentSpecialty, (v) => { picks[i] = `${currentBase} (${v})`; }));
    if (!current) picks[i] = `${currentBase} (${currentSpecialty})`;
  } else if (!current) {
    picks[i] = currentBase;
  }
  return wrap;
}

function renderCustomPersonalityPicker() {
  const wrap = el("div", {});
  wrap.appendChild(el("p", { class: "readonly-note", text: `Choose exactly ${PERSONALITY_SKILL_COUNT} skills to each receive +20. Specialty skills need a specialty chosen too.` }));
  wrap.appendChild(el("p", { class: "budget-line", text: `Selected: ${state.personalityCustomSkills.length} / ${PERSONALITY_SKILL_COUNT}` }));

  // Non-specialty skills: simple checkboxes.
  const grid = el("div", { class: "wizard-skill-alloc" });
  for (const skillDef of SKILLS.filter((s) => !s.specialty)) {
    const checked = state.personalityCustomSkills.includes(skillDef.name);
    grid.appendChild(
      el("label", { class: "toggle" }, [
        el("input", {
          type: "checkbox",
          ...(checked ? { checked: "checked" } : {}),
          onchange: (e) => {
            if (e.target.checked) {
              if (state.personalityCustomSkills.length >= PERSONALITY_SKILL_COUNT) {
                e.target.checked = false;
                return showError(`You can only pick ${PERSONALITY_SKILL_COUNT} skills.`);
              }
              state.personalityCustomSkills.push(skillDef.name);
            } else {
              state.personalityCustomSkills = state.personalityCustomSkills.filter((n) => n !== skillDef.name);
            }
            showError(null);
            rerenderStep();
          },
        }),
        ` ${skillDef.name}`,
      ])
    );
  }
  wrap.appendChild(grid);

  wrap.appendChild(el("p", { class: "readonly-note", text: "Specialty skills (Art, Craft, Knowledge, weapon skills, ...):" }));
  wrap.appendChild(renderAddSpecialtySkillControl((displayName) => {
    if (state.personalityCustomSkills.length >= PERSONALITY_SKILL_COUNT) return showError(`You can only pick ${PERSONALITY_SKILL_COUNT} skills.`);
    if (state.personalityCustomSkills.includes(displayName)) return showError("That skill is already selected.");
    state.personalityCustomSkills.push(displayName);
    rerenderStep();
  }));
  if (state.personalityCustomSkills.some((n) => findSkill(baseSkillName(n))?.specialty)) {
    wrap.appendChild(
      el(
        "ul",
        { class: "features-list" },
        state.personalityCustomSkills
          .filter((n) => findSkill(baseSkillName(n))?.specialty)
          .map((n) =>
            el("li", {}, [
              `${n} `,
              el("button", { class: "btn-link", text: "remove", onclick: () => { state.personalityCustomSkills = state.personalityCustomSkills.filter((x) => x !== n); rerenderStep(); } }),
            ])
          )
      )
    );
  }

  return wrap;
}

function renderAddSpecialtySkillControl(onAdd) {
  const specialtySkills = SKILLS.filter((s) => s.specialty);
  const baseSelect = el(
    "select",
    {},
    specialtySkills.map((s) => el("option", { value: s.name, text: s.name }))
  );
  let specialtySelectEl = specialtySelect(specialtySkills[0].name, specialtyOptionsFor(specialtySkills[0].name)?.[0], () => {});
  const container = el("span", { class: "add-skill-row" }, [baseSelect, specialtySelectEl]);
  baseSelect.addEventListener("change", () => {
    const newSelect = specialtySelect(baseSelect.value, specialtyOptionsFor(baseSelect.value)?.[0], () => {});
    container.replaceChild(newSelect, specialtySelectEl);
    specialtySelectEl = newSelect;
  });
  const addBtn = el("button", {
    class: "btn btn-small",
    text: "+ Add",
    onclick: () => onAdd(`${baseSelect.value} (${specialtySelectEl.value})`),
  });
  container.appendChild(addBtn);
  return container;
}

function finalizePersonalityStep() {
  if (state.personalityMode === "custom") {
    state.personality = buildCustomPersonality(state.personalityCustomSkills);
  } else {
    const type = PERSONALITY_TYPES.find((p) => p.id === state.personalityTypeId);
    const skills = resolvePersonalitySkillsManual(type, state.personalityPicks);
    state.personality = { name: type.name, description: type.description, skills };
  }
}

// ------------------------------------------------------------ Step: Profession & Skills

function renderProfessionStep(container) {
  if (!state.professionName) {
    state.professionName = PROFESSIONS[0].name;
    state.professionChoiceSelections = findProfession(state.professionName).choices.map(() => []);
  }
  const profession = findProfession(state.professionName);

  const select = el(
    "select",
    {
      onchange: (e) => {
        state.professionName = e.target.value;
        const p = findProfession(state.professionName);
        state.professionChoiceSelections = p.choices.map(() => []);
        state.professionSpecialtyChoices = {};
        state.skillEntries = null;
        state.professionalAllocations = {};
        state.personalAllocations = {};
        state.personalExtraSkills = [];
        rerenderStep();
      },
    },
    [...PROFESSIONS].sort((a, b) => a.name.localeCompare(b.name)).map((p) => {
      const opt = el("option", { value: p.name, text: p.name });
      if (p.name === state.professionName) opt.setAttribute("selected", "selected");
      return opt;
    })
  );
  container.appendChild(el("div", { class: "field-row" }, [el("div", { class: "field" }, [el("label", { text: "Profession" }), select])]));
  container.appendChild(el("p", { class: "readonly-note", text: profession.description }));
  if (profession.special) container.appendChild(el("p", { class: "readonly-note", html: `<strong>Special:</strong> ${profession.special}` }));

  // Fixed skills' specialty resolution
  const openFixedRefs = profession.fixed.filter(refNeedsSpecialtyChoice);
  if (openFixedRefs.length > 0) {
    container.appendChild(el("div", { class: "choice-pool-title", text: "Choose specialties for this profession's fixed skills:" }));
    for (const ref of openFixedRefs) {
      const base = parseSkillRef(ref).base;
      const current = state.professionSpecialtyChoices[ref] ?? specialtyOptionsFor(base)[0];
      state.professionSpecialtyChoices[ref] = current;
      container.appendChild(
        el("div", { class: "choice-item" }, [`${ref}: `, specialtySelect(base, current, (v) => (state.professionSpecialtyChoices[ref] = v))])
      );
    }
  }
  const plainFixed = profession.fixed.filter((r) => !refNeedsSpecialtyChoice(r));
  if (plainFixed.length > 0) container.appendChild(el("p", { class: "readonly-note", text: `Fixed skills: ${plainFixed.join(", ")}` }));

  profession.choices.forEach((choice, i) => renderChoicePool(container, profession, choice, i));

  container.appendChild(renderSkillPointAllocation(profession));
}

/** True when a choice pool has fewer distinct refs than the number of picks
 * required (e.g. Artist's "choose 2" from just ["Art (any)"], meaning two
 * different Art specialties) -- a plain checkbox list can't represent
 * picking the same ref more than once, so this needs dedicated slot pickers. */
function poolNeedsRepeats(choice) {
  const isWildcard = choice.from.length === 1 && /^Any skill/i.test(choice.from[0]);
  return !isWildcard && choice.from.length < choice.count;
}

function renderRepeatSlotPool(pool, choice, index) {
  const selected = state.professionChoiceSelections[index] ?? [];
  while (selected.length < choice.count) selected.push(null);
  selected.length = choice.count;
  state.professionChoiceSelections[index] = selected;

  selected.forEach((current, slotIdx) => {
    const row = el("div", { class: "choice-item" });
    const currentBase = current ? parseSkillRef(current).base : parseSkillRef(choice.from[0]).base;
    const baseSelect = el(
      "select",
      {
        onchange: (e) => {
          const base = e.target.value;
          const options = specialtyOptionsFor(base) ?? [];
          selected[slotIdx] = options.length ? `${base} (${options[0]})` : base;
          rerenderStep();
        },
      },
      [...new Set(choice.from.map((ref) => parseSkillRef(ref).base))].map((base) => {
        const opt = el("option", { value: base, text: base });
        if (base === currentBase) opt.setAttribute("selected", "selected");
        return opt;
      })
    );
    row.appendChild(baseSelect);
    const options = specialtyOptionsFor(currentBase);
    if (options && options.length > 0) {
      const currentSpecialty = current ? parseSkillRef(current).specialty : options[0];
      if (!current) selected[slotIdx] = `${currentBase} (${currentSpecialty})`;
      row.appendChild(
        specialtySelect(currentBase, currentSpecialty, (v) => {
          selected[slotIdx] = `${currentBase} (${v})`;
        })
      );
    } else if (!current) {
      selected[slotIdx] = currentBase;
    }
    pool.appendChild(row);
  });

  const dupeCount = selected.length - new Set(selected).size;
  if (dupeCount > 0) {
    pool.appendChild(el("p", { class: "wizard-error", text: "Pick different specialties for each slot above." }));
  }
}

function renderChoicePool(container, profession, choice, index) {
  const isWildcard = choice.from.length === 1 && /^Any skill/i.test(choice.from[0]);
  const selected = state.professionChoiceSelections[index] ?? [];
  const pool = el("div", { class: "choice-pool" });
  pool.appendChild(el("div", { class: "choice-pool-title", text: `Choose ${choice.count} of the following:` }));
  pool.appendChild(el("div", { class: "choice-pool-status", text: `Selected: ${selected.length} / ${choice.count}` }));

  if (poolNeedsRepeats(choice)) {
    renderRepeatSlotPool(pool, choice, index);
    container.appendChild(pool);
    return;
  }

  if (isWildcard) {
    pool.appendChild(
      renderAddSpecialtySkillControlForWildcard((displayName) => {
        if (selected.length >= choice.count) return showError(`You've already chosen ${choice.count} for this pick.`);
        if (selected.includes(displayName)) return showError("Already selected.");
        selected.push(displayName);
        state.professionChoiceSelections[index] = selected;
        rerenderStep();
      })
    );
    if (selected.length) {
      pool.appendChild(
        el(
          "ul",
          { class: "features-list" },
          selected.map((n) =>
            el("li", {}, [`${n} `, el("button", { class: "btn-link", text: "remove", onclick: () => { state.professionChoiceSelections[index] = selected.filter((x) => x !== n); rerenderStep(); } })])
          )
        )
      );
    }
  } else {
    for (const ref of choice.from) {
      const isChecked = selected.includes(ref);
      const row = el("div", { class: "choice-item" });
      row.appendChild(
        el("label", {}, [
          el("input", {
            type: "checkbox",
            ...(isChecked ? { checked: "checked" } : {}),
            onchange: (e) => {
              if (e.target.checked) {
                if (selected.length >= choice.count) {
                  e.target.checked = false;
                  return showError(`Choose exactly ${choice.count} for this pick.`);
                }
                selected.push(ref);
              } else {
                const idx = selected.indexOf(ref);
                if (idx >= 0) selected.splice(idx, 1);
              }
              state.professionChoiceSelections[index] = selected;
              showError(null);
              rerenderStep();
            },
          }),
          ` ${ref}`,
        ])
      );
      if (isChecked && refNeedsSpecialtyChoice(ref)) {
        const base = parseSkillRef(ref).base;
        const current = state.professionSpecialtyChoices[ref] ?? specialtyOptionsFor(base)[0];
        state.professionSpecialtyChoices[ref] = current;
        row.appendChild(specialtySelect(base, current, (v) => (state.professionSpecialtyChoices[ref] = v)));
      }
      pool.appendChild(row);
    }
  }

  container.appendChild(pool);
}

function renderAddSpecialtySkillControlForWildcard(onAdd) {
  const baseSelect = el(
    "select",
    {},
    SKILLS.map((s) => el("option", { value: s.name, text: s.name }))
  );
  let specialtyEl = null;
  const container = el("span", { class: "add-skill-row" }, [baseSelect]);
  const syncSpecialty = () => {
    if (specialtyEl) container.removeChild(specialtyEl);
    const skillDef = findSkill(baseSelect.value);
    specialtyEl = skillDef?.specialty ? specialtySelect(baseSelect.value, specialtyOptionsFor(baseSelect.value)?.[0], () => {}) : null;
    if (specialtyEl) container.insertBefore(specialtyEl, container.lastChild);
  };
  baseSelect.addEventListener("change", syncSpecialty);
  const addBtn = el("button", {
    class: "btn btn-small",
    text: "+ Add",
    onclick: () => {
      const skillDef = findSkill(baseSelect.value);
      const name = skillDef?.specialty ? `${baseSelect.value} (${specialtyEl.value})` : baseSelect.value;
      onAdd(name);
    },
  });
  container.appendChild(addBtn);
  syncSpecialty();
  return container;
}

function buildSkillEntriesForProfessionStep(profession) {
  const skillOptions = skillOptionsForState();
  const entries = baselineSkillEntries(state.characteristics, skillOptions);
  try {
    const names = resolveProfessionSkillsManual(profession, state.professionChoiceSelections, state.professionSpecialtyChoices);
    for (const name of names) ensureSkillEntry(entries, name, state.characteristics, skillOptions);
  } catch {
    // choices incomplete; still show baseline entries so the allocator has something to render
  }
  if (state.personality) {
    for (const name of state.personality.skills) {
      const entry = ensureSkillEntry(entries, name, state.characteristics, skillOptions);
      entry.personalityBonus = PERSONALITY_BONUS;
    }
  }
  for (const name of state.personalExtraSkills) ensureSkillEntry(entries, name, state.characteristics, skillOptions);

  // Sync in whatever's already been entered so headroom/totals (especially
  // the personal-points grid, which needs to see professional points
  // already spent) reflect the live state, not a blank slate.
  for (const [key, pts] of Object.entries(state.professionalAllocations)) {
    if (entries[key]) entries[key].professionalPoints = pts;
  }
  for (const [key, pts] of Object.entries(state.personalAllocations)) {
    if (entries[key]) entries[key].personalPoints = pts;
  }

  return entries;
}

function renderSkillPointAllocation(profession) {
  const wrap = el("div", {});
  const entries = buildSkillEntriesForProfessionStep(profession);
  state.skillEntries = entries;

  const level = state.options.campaignPowerLevel;
  const professionalPool = Math.max(0, professionalSkillPointPool(level, { eduOption: state.options.useEDU, edu: state.characteristics.EDU }) + (state.options.useAgeModifiers ? state.ageSkillPointModifier : 0));
  const professionalCap = professionalSkillCap(level);

  let professionSkillNames = [];
  try {
    professionSkillNames = resolveProfessionSkillsManual(profession, state.professionChoiceSelections, state.professionSpecialtyChoices);
  } catch {
    professionSkillNames = [];
  }

  wrap.appendChild(el("h3", { text: "Professional Skill Points", style: "margin-top:16px;" }));
  if (professionSkillNames.length === 0) {
    wrap.appendChild(el("p", { class: "readonly-note", text: "Finish your skill choices above to allocate professional skill points." }));
  } else {
    const spent = sumAllocations(state.professionalAllocations);
    const remaining = professionalPool - spent;
    wrap.appendChild(el("p", { class: `budget-line${remaining < 0 ? " over" : ""}`, text: `${remaining} of ${professionalPool} points remaining` }));
    wrap.appendChild(renderAllocationGrid(professionSkillNames, entries, state.professionalAllocations, professionalCap, currentTotalBeforePoints));
  }

  wrap.appendChild(el("h3", { text: "Personal Skill Points", style: "margin-top:16px;" }));
  const personalPool = personalSkillPointPool(state.characteristics.INT, level, { increasedOption: state.options.useIncreasedPersonalPoints });
  const personalCap = personalSkillCap(level);
  const personalCandidates = [...new Set([...professionSkillNames, ...(state.personality?.skills ?? []), ...state.personalExtraSkills])];
  const spentPersonal = sumAllocations(state.personalAllocations);
  wrap.appendChild(el("p", { class: `budget-line${personalPool - spentPersonal < 0 ? " over" : ""}`, text: `${personalPool - spentPersonal} of ${personalPool} points remaining` }));
  wrap.appendChild(
    el("div", { class: "add-skill-row" }, [
      renderAddSpecialtySkillControlForWildcard((name) => {
        if (!state.personalExtraSkills.includes(name)) state.personalExtraSkills.push(name);
        rerenderStep();
      }),
      el("span", { class: "readonly-note", text: " add a skill to spend personal points on" }),
    ])
  );
  if (personalCandidates.length > 0) {
    wrap.appendChild(renderAllocationGrid(personalCandidates, entries, state.personalAllocations, personalCap, skillTotal));
  }

  return wrap;
}

function renderAllocationGrid(skillNames, entries, allocationMap, cap, baselineFn) {
  const grid = el("div", { class: "wizard-skill-alloc" });
  grid.appendChild(el("div", { class: "col-head", text: "Skill" }));
  grid.appendChild(el("div", { class: "col-head", text: "Cap headroom" }));
  grid.appendChild(el("div", { class: "col-head", text: "Points" }));
  for (const name of skillNames) {
    const entry = entries[name];
    if (!entry) continue;
    const headroom = headroomFor(entry, cap, baselineFn);
    const current = allocationMap[name] ?? 0;
    grid.appendChild(el("span", { class: `skill-label${headroom === 0 ? " over-cap" : ""}`, text: `${name} (base ${entry.base}${entry.categoryBonus ? `+${entry.categoryBonus}` : ""}${entry.personalityBonus ? `+${entry.personalityBonus}` : ""})` }));
    grid.appendChild(el("span", { text: String(headroom) }));
    grid.appendChild(
      el("input", {
        type: "number",
        min: "0",
        max: String(headroom + current),
        value: String(current),
        onchange: (e) => {
          const v = Math.max(0, num(e.target.value, 0));
          allocationMap[name] = Math.min(v, headroom + current);
          rerenderStep();
        },
      })
    );
  }
  return grid;
}

function finalizeProfessionStep() {
  const profession = findProfession(state.professionName);
  const names = resolveProfessionSkillsManual(profession, state.professionChoiceSelections, state.professionSpecialtyChoices);
  const skillOptions = skillOptionsForState();
  const entries = baselineSkillEntries(state.characteristics, skillOptions);
  for (const name of names) ensureSkillEntry(entries, name, state.characteristics, skillOptions);
  if (state.personality) {
    for (const name of state.personality.skills) {
      const entry = ensureSkillEntry(entries, name, state.characteristics, skillOptions);
      entry.personalityBonus = PERSONALITY_BONUS;
    }
  }
  for (const name of state.personalExtraSkills) ensureSkillEntry(entries, name, state.characteristics, skillOptions);

  for (const [key, pts] of Object.entries(state.professionalAllocations)) {
    if (entries[key]) entries[key].professionalPoints = pts;
  }
  for (const [key, pts] of Object.entries(state.personalAllocations)) {
    if (entries[key]) entries[key].personalPoints = pts;
  }

  const level = state.options.campaignPowerLevel;
  const professionalPool = Math.max(0, professionalSkillPointPool(level, { eduOption: state.options.useEDU, edu: state.characteristics.EDU }) + (state.options.useAgeModifiers ? state.ageSkillPointModifier : 0));
  const professionalCap = professionalSkillCap(level);
  if (sumAllocations(state.professionalAllocations) > professionalPool) throw new Error("You've spent more professional skill points than you have.");
  for (const name of names) {
    const entry = entries[name];
    if (skillTotal(entry) > professionalCap && entry.personalPoints === 0) {
      // allow if it was already at/above cap before points (grandfathered); otherwise flag
    }
  }

  const personalPool = personalSkillPointPool(state.characteristics.INT, level, { increasedOption: state.options.useIncreasedPersonalPoints });
  if (sumAllocations(state.personalAllocations) > personalPool) throw new Error("You've spent more personal skill points than you have.");

  state.skillEntries = entries;
  state.professionalPoolFinal = professionalPool;
  state.personalPoolFinal = personalPool;

  const mentioned = mentionedWealthLevels(profession.wealth);
  if (!state.wealthLevel || !mentioned.includes(state.wealthLevel)) {
    state.wealthLevel = preferredWealthLevel(profession.wealth) ?? mentioned[0];
  }
}

// ------------------------------------------------------------ Step: Distinctive Features

function renderFeaturesStep(container) {
  const count = featureCountForCHA(state.characteristics.CHA);
  while (state.distinctiveFeatureChoices.length < count) {
    const cat = DISTINCTIVE_FEATURE_CATEGORIES[state.distinctiveFeatureChoices.length % 10];
    state.distinctiveFeatureChoices.push({ category: cat.category, description: cat.options[0] });
  }
  state.distinctiveFeatureChoices.length = count;

  container.appendChild(el("p", { class: "readonly-note", text: `CHA ${state.characteristics.CHA} → ${count} distinctive feature(s).` }));

  state.distinctiveFeatureChoices.forEach((feature, i) => {
    const catSelect = el(
      "select",
      {
        onchange: (e) => {
          const cat = DISTINCTIVE_FEATURE_CATEGORIES.find((c) => c.category === e.target.value);
          state.distinctiveFeatureChoices[i] = { category: cat.category, description: cat.options[0] };
          rerenderStep();
        },
      },
      DISTINCTIVE_FEATURE_CATEGORIES.map((c) => {
        const opt = el("option", { value: c.category, text: c.category });
        if (c.category === feature.category) opt.setAttribute("selected", "selected");
        return opt;
      })
    );
    const cat = DISTINCTIVE_FEATURE_CATEGORIES.find((c) => c.category === feature.category);
    const descSelect = el(
      "select",
      { onchange: (e) => (state.distinctiveFeatureChoices[i].description = e.target.value) },
      cat.options.map((opt) => {
        const o = el("option", { value: opt, text: opt });
        if (opt === feature.description) o.setAttribute("selected", "selected");
        return o;
      })
    );
    container.appendChild(el("div", { class: "feature-slot" }, [el("span", { class: "slot-index", text: `${i + 1}.` }), catSelect, descSelect]));
  });
}

// ------------------------------------------------------------ Step: Background

function renderBackgroundStep(container) {
  const profession = findProfession(state.professionName);
  const mentioned = mentionedWealthLevels(profession.wealth);
  if (!state.wealthLevel) state.wealthLevel = preferredWealthLevel(profession.wealth) ?? mentioned[0];

  container.appendChild(el("p", { class: "readonly-note", text: `Wealth guidance for ${profession.name}: ${profession.wealth}` }));
  const wealthSelect = el(
    "select",
    { onchange: (e) => (state.wealthLevel = e.target.value) },
    mentioned.map((lvl) => {
      const opt = el("option", { value: lvl, text: lvl });
      if (lvl === state.wealthLevel) opt.setAttribute("selected", "selected");
      return opt;
    })
  );
  container.appendChild(el("div", { class: "field-row" }, [el("div", { class: "field" }, [el("label", { text: "Wealth level" }), wealthSelect])]));

  const possessionsArea = el("textarea", { class: "wizard-textarea", oninput: (e) => (state.possessionsNotes = e.target.value) });
  possessionsArea.value = state.possessionsNotes;
  container.appendChild(el("div", { class: "field" }, [el("label", { text: "Possessions notes" }), possessionsArea]));

  const descArea = el("textarea", { class: "wizard-textarea", oninput: (e) => (state.description = e.target.value) });
  descArea.value = state.description;
  container.appendChild(el("div", { class: "field" }, [el("label", { text: "Description (appearance, mannerisms, ...)" }), descArea]));

  const bgArea = el("textarea", { class: "wizard-textarea", oninput: (e) => (state.background = e.target.value) });
  bgArea.value = state.background;
  container.appendChild(el("div", { class: "field" }, [el("label", { text: "Background (origin, family, past, beliefs, ...)" }), bgArea]));
}

// ------------------------------------------------------------ Step: Review

function buildFinalCharacter() {
  const derived = computeDerived(state.characteristics, {
    totalHitPointsOption: state.options.useTotalHitPoints,
    fatigueOption: state.options.useFatigue,
    sanityOption: state.options.useSanity,
    hitLocationOption: state.options.useHitLocation,
  });
  const profession = findProfession(state.professionName);
  const powers = state.options.usePowers ? buildPowersBlockManual(derived.powerPoints, state.powerSlotChoices) : null;

  return assembleCharacter({
    name: state.name,
    gender: state.gender,
    age: state.age,
    professionName: profession.name,
    professionDescription: profession.description,
    wealth: state.wealthLevel,
    special: profession.special,
    characteristics: state.characteristics,
    derived,
    skills: state.skillEntries,
    personality: state.personality,
    distinctiveFeatures: state.distinctiveFeatureChoices,
    powers,
    professionalSkillPointPool: state.professionalPoolFinal,
    personalSkillPointPool: state.personalPoolFinal,
    description: state.description,
    background: state.background,
    possessionsNotes: state.possessionsNotes,
    options: state.options,
  });
}

function renderReviewStep(container) {
  const character = buildFinalCharacter();
  renderCharacterSheet(container, character, {
    onNameChange: (v) => (state.name = v),
  });
}

// ------------------------------------------------------------ Randomize-this-step

function randomizeCurrentStep() {
  const id = currentStepId();
  if (id === "characteristics") {
    rerollCharacteristics();
    if (state.charMethod === GENERATION_METHODS.CHOOSE_ROLLS) {
      // shuffle assignment
      const order = [...CHARACTERISTICS].sort(() => Math.random() - 0.5);
      state.rollAssignment = {};
      order.forEach((c, i) => (state.rollAssignment[c] = i));
    } else if (state.charMethod === GENERATION_METHODS.STANDARD) {
      let guard = 0;
      while (state.redistributionTokens > 0 && guard < 20) {
        guard++;
        const sources = CHARACTERISTICS.filter((c) => state.characteristics[c] > (["SIZ", "INT"].includes(c) ? 8 : 3));
        const targets = CHARACTERISTICS.filter((c) => state.characteristics[c] < 21);
        if (!sources.length || !targets.length) break;
        const from = sources[Math.floor(Math.random() * sources.length)];
        const to = targets[Math.floor(Math.random() * targets.length)];
        if (from === to) continue;
        state.characteristics[from] -= 1;
        state.characteristics[to] += 1;
        state.redistributionTokens -= 1;
      }
    } else if (state.charMethod === GENERATION_METHODS.POINT_BUY) {
      const level = state.options.campaignPowerLevel;
      const budget = POINT_BUY_BUDGETS[level] ?? POINT_BUY_BUDGETS.Normal;
      let guard = 0;
      while (state.pointBuySpent < budget && guard < 200) {
        guard++;
        const affordable = CHARACTERISTICS.filter((c) => c !== "EDU" && state.characteristics[c] < 21 && state.pointBuySpent + POINT_BUY_COST[c] <= budget);
        if (!affordable.length) break;
        const pick = affordable[Math.floor(Math.random() * affordable.length)];
        state.characteristics[pick] += 1;
        state.pointBuySpent += POINT_BUY_COST[pick];
      }
    }
    if (state.options.useEDU) state.characteristics.EDU = roll2d6plus6();
  } else if (id === "powers") {
    const level = state.options.campaignPowerLevel;
    const options = powerSetOptionsFor(level);
    state.powerOptionIndex = Math.floor(Math.random() * options.length);
    const assignments = assignPowerTypes(options[state.powerOptionIndex]);
    state.powerSlotChoices = assignments.map((a) => ({ level: a.level, typeId: a.type }));
  } else if (id === "age") {
    state.age = rollStartingAge();
  } else if (id === "personality") {
    state.personalityMode = "type";
    const type = rollPersonalityType();
    state.personalityTypeId = type.id;
    state.personalityPicks = personalitySpecialtyPicks(type);
  } else if (id === "profession") {
    const profession = PROFESSIONS[Math.floor(Math.random() * PROFESSIONS.length)];
    state.professionName = profession.name;
    const names = resolveProfessionSkills(profession);
    // Reconstruct choice selections/specialty choices from the random resolution
    // as best-effort: assign whole pool randomly then let allocation randomize too.
    state.professionChoiceSelections = profession.choices.map((choice) => {
      if (choice.from.length === 1 && /^Any skill/i.test(choice.from[0])) {
        const picks = [];
        const pool = names.filter((n) => !profession.fixed.includes(n));
        for (let i = 0; i < choice.count && pool.length; i++) picks.push(pool[Math.floor(Math.random() * pool.length)]);
        return picks;
      }
      if (poolNeedsRepeats(choice)) {
        // Fewer distinct refs than picks needed (e.g. Artist's "choose 2"
        // from just ["Art (any)"]): resolve each slot to a fully concrete,
        // mutually distinct specialty directly, same as renderRepeatSlotPool.
        const bases = [...new Set(choice.from.map((ref) => parseSkillRef(ref).base))];
        const picks = [];
        for (let i = 0; i < choice.count; i++) {
          const base = bases[Math.floor(Math.random() * bases.length)];
          const options = specialtyOptionsFor(base) ?? [];
          let name = options.length ? `${base} (${options[Math.floor(Math.random() * options.length)]})` : base;
          let attempts = 0;
          while (picks.includes(name) && attempts < 20 && options.length > 0) {
            name = `${base} (${options[Math.floor(Math.random() * options.length)]})`;
            attempts++;
          }
          picks.push(name);
        }
        return picks;
      }
      const shuffled = [...choice.from].sort(() => Math.random() - 0.5);
      return shuffled.slice(0, choice.count);
    });
    state.professionSpecialtyChoices = {};
    for (const ref of [...profession.fixed, ...state.professionChoiceSelections.flat()]) {
      if (refNeedsSpecialtyChoice(ref)) {
        const base = parseSkillRef(ref).base;
        const options = specialtyOptionsFor(base);
        state.professionSpecialtyChoices[ref] = options[Math.floor(Math.random() * options.length)];
      }
    }
    state.personalExtraSkills = [];
    try {
      const resolvedNames = resolveProfessionSkillsManual(profession, state.professionChoiceSelections, state.professionSpecialtyChoices);
      const skillOptions = skillOptionsForState();
      const entries = baselineSkillEntries(state.characteristics, skillOptions);
      for (const n of resolvedNames) ensureSkillEntry(entries, n, state.characteristics, skillOptions);
      if (state.personality) for (const n of state.personality.skills) ensureSkillEntry(entries, n, state.characteristics, skillOptions).personalityBonus = PERSONALITY_BONUS;
      const level = state.options.campaignPowerLevel;
      const professionalPool = Math.max(0, professionalSkillPointPool(level, { eduOption: state.options.useEDU, edu: state.characteristics.EDU }) + (state.options.useAgeModifiers ? state.ageSkillPointModifier : 0));
      const cap = professionalSkillCap(level);
      const slots = resolvedNames.map((name) => ({ key: name, headroom: headroomFor(entries[name], cap) }));
      state.professionalAllocations = allocatePointsRandomly(professionalPool, slots);

      const personalPool = personalSkillPointPool(state.characteristics.INT, level, { increasedOption: state.options.useIncreasedPersonalPoints });
      const personalCap = personalSkillCap(level);
      for (const [k, v] of Object.entries(state.professionalAllocations)) entries[k].professionalPoints = v;
      const candidates = [...new Set([...resolvedNames, ...(state.personality?.skills ?? [])])];
      const pSlots = candidates.map((name) => ({ key: name, headroom: headroomFor(entries[name], personalCap, skillTotal) }));
      state.personalAllocations = allocatePointsRandomly(personalPool, pSlots);
    } catch {
      state.professionalAllocations = {};
      state.personalAllocations = {};
    }
  } else if (id === "features") {
    state.distinctiveFeatureChoices = generateDistinctiveFeatures(state.characteristics.CHA);
  } else if (id === "background") {
    const profession = findProfession(state.professionName);
    state.wealthLevel = pickWealthLevel(profession.wealth);
  }
}

// ------------------------------------------------------------ Orchestration

const STEP_RENDERERS = {
  characteristics: renderCharacteristicsStep,
  powers: renderPowersStep,
  age: renderAgeStep,
  personality: renderPersonalityStep,
  profession: renderProfessionStep,
  features: renderFeaturesStep,
  background: renderBackgroundStep,
  review: renderReviewStep,
};

const STEP_FINALIZERS = {
  characteristics: finalizeCharacteristicsStep,
  powers: finalizePowersStep,
  age: finalizeAgeStep,
  personality: finalizePersonalityStep,
  profession: finalizeProfessionStep,
};

function renderProgress() {
  const steps = activeSteps(state.options);
  const progress = $("wizard-progress");
  progress.innerHTML = "";
  steps.forEach((id, i) => {
    const dot = el("span", { class: `step-dot${i === stepIndex ? " current" : i < stepIndex ? " done" : ""}`, text: `${i + 1}. ${STEP_TITLES[id].replace(/^Step \S+: /, "")}` });
    progress.appendChild(dot);
  });
}

function rerenderStep() {
  const id = currentStepId();
  $("wizard-step-title").textContent = STEP_TITLES[id];
  const body = $("wizard-step-body");
  body.innerHTML = "";
  showError(null);
  renderProgress();
  STEP_RENDERERS[id](body);

  $("btn-wizard-back").disabled = stepIndex === 0;
  $("btn-wizard-randomize").hidden = id === "review";
  $("btn-wizard-next").textContent = id === "review" ? "Finish & Save →" : "Next →";
}

function goNext() {
  const id = currentStepId();
  if (id === "review") {
    const character = buildFinalCharacter();
    onFinishCallback?.(character);
    return;
  }
  const finalizer = STEP_FINALIZERS[id];
  if (finalizer) {
    try {
      finalizer();
    } catch (err) {
      showError(err.message);
      return;
    }
  }
  const steps = activeSteps(state.options);
  if (stepIndex < steps.length - 1) {
    stepIndex += 1;
    rerenderStep();
  }
}

function goBack() {
  if (stepIndex > 0) {
    stepIndex -= 1;
    rerenderStep();
  }
}

export function startWizard(options, { onFinish, onCancel } = {}) {
  state = freshState(options);
  stepIndex = 0;
  onFinishCallback = onFinish;

  $("btn-wizard-back").onclick = goBack;
  $("btn-wizard-next").onclick = goNext;
  $("btn-wizard-randomize").onclick = () => {
    randomizeCurrentStep();
    rerenderStep();
  };
  $("btn-wizard-cancel").onclick = () => onCancel?.();

  rerenderStep();
}
