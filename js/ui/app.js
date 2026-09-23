import { generateRandomCharacter, defaultOptions } from "../engine/characterFactory.js";
import { PROFESSIONS } from "../data/professions.js";
import { renderCharacterSheet } from "./render.js";
import { loadAllCharacters, saveCharacter, deleteCharacter, newCharacterId, isStoragePersistent } from "./storage.js";
import { exportToJson, exportToMarkdown, exportToPdf } from "./export.js";

let currentCharacter = null;

const $ = (id) => document.getElementById(id);

function populateProfessionSelect() {
  const select = $("opt-profession");
  for (const p of [...PROFESSIONS].sort((a, b) => a.name.localeCompare(b.name))) {
    const opt = document.createElement("option");
    opt.value = p.name;
    opt.textContent = p.name;
    select.appendChild(opt);
  }
}

function readOptionsFromForm() {
  const options = defaultOptions();
  options.campaignPowerLevel = $("opt-campaign-level").value;
  options.characteristicMethod = $("opt-char-method").value;
  const professionValue = $("opt-profession").value;
  options.profession = professionValue || null;
  const ageValue = $("opt-age").value;
  options.age = ageValue ? parseInt(ageValue, 10) : null;
  options.name = $("opt-name").value.trim();
  options.gender = $("opt-gender").value.trim();

  options.useEDU = $("opt-edu").checked;
  options.useAgeModifiers = $("opt-age-modifiers").checked;
  options.useCategoryBonus = $("opt-category-bonus").checked;
  options.categoryBonusMethod = document.querySelector('input[name="opt-category-method"]:checked').value;
  options.useIncreasedPersonalPoints = $("opt-increased-personal").checked;
  options.usePersonality = $("opt-personality").checked;
  options.useDistinctiveFeatures = $("opt-distinctive-features").checked;
  options.useTotalHitPoints = $("opt-total-hp").checked;
  options.useHitLocation = $("opt-hit-location").checked;
  options.useFatigue = $("opt-fatigue").checked;
  options.useSanity = $("opt-sanity").checked;
  options.usePowers = $("opt-powers").checked;

  return options;
}

function showSheet(character) {
  currentCharacter = character;
  $("sheet-panel").hidden = false;
  renderCharacterSheet($("character-sheet"), character, {
    onNameChange: (value) => {
      currentCharacter.name = value;
    },
  });
  $("sheet-panel").scrollIntoView?.({ behavior: "smooth", block: "start" });
}

function generate() {
  const options = readOptionsFromForm();
  const character = generateRandomCharacter(options);
  if (!character._id) character._id = newCharacterId();
  showSheet(character);
}

function renderSavedList() {
  const list = $("saved-character-list");
  list.innerHTML = "";
  const characters = loadAllCharacters();
  if (characters.length === 0) {
    list.appendChild(Object.assign(document.createElement("li"), { className: "empty-hint", textContent: "No saved characters yet." }));
    return;
  }
  for (const c of characters.slice().reverse()) {
    const li = document.createElement("li");
    const info = document.createElement("div");
    info.innerHTML = `<div class="char-name">${c.name || "(unnamed)"}</div><div class="char-meta">${c.profession}, age ${c.age}</div>`;
    info.style.cursor = "pointer";
    info.addEventListener("click", () => showSheet(c));
    const delBtn = document.createElement("button");
    delBtn.className = "delete-btn";
    delBtn.textContent = "✕";
    delBtn.title = "Delete";
    delBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      deleteCharacter(c._id);
      renderSavedList();
    });
    li.appendChild(info);
    li.appendChild(delBtn);
    list.appendChild(li);
  }
}

function wireEvents() {
  $("btn-generate").addEventListener("click", generate);
  $("btn-regenerate").addEventListener("click", generate);

  $("btn-new-character").addEventListener("click", () => {
    $("sheet-panel").hidden = true;
    currentCharacter = null;
    $("opt-name").value = "";
    $("opt-gender").value = "";
    $("opt-age").value = "";
  });

  $("btn-save").addEventListener("click", () => {
    if (!currentCharacter) return;
    saveCharacter(currentCharacter);
    renderSavedList();
  });

  $("btn-export-json").addEventListener("click", () => currentCharacter && exportToJson(currentCharacter));
  $("btn-export-md").addEventListener("click", () => currentCharacter && exportToMarkdown(currentCharacter));
  $("btn-export-pdf").addEventListener("click", () => currentCharacter && exportToPdf(currentCharacter));

  $("toggle-settings").addEventListener("click", () => {
    const body = $("settings-body");
    const hidden = body.style.display === "none";
    body.style.display = hidden ? "" : "none";
    $("toggle-settings").textContent = hidden ? "hide" : "show";
  });

  $("opt-category-bonus").addEventListener("change", (e) => {
    $("category-bonus-sub").style.opacity = e.target.checked ? "1" : "0.4";
  });
}

function init() {
  populateProfessionSelect();
  wireEvents();
  renderSavedList();
  $("storage-warning").hidden = isStoragePersistent();
}

init();
