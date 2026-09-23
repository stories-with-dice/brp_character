// LocalStorage persistence for saved characters, with a graceful in-memory
// fallback. Some browsing contexts (notably a page opened directly via a
// file:// URL, which some browsers/environments treat as an "opaque origin")
// throw a SecurityError on any localStorage access rather than simply being
// empty. We detect that once, and fall back to an in-memory list for the
// current session so Save/Delete never crash -- callers can check
// isStoragePersistent() to warn the user that saves won't survive a reload.
const STORAGE_KEY = "brp-characters-v1";
const PROBE_KEY = "__brp_storage_probe__";

let memoryFallback = [];
let persistent = null; // cached detection result

function detectPersistence() {
  if (persistent != null) return persistent;
  try {
    window.localStorage.setItem(PROBE_KEY, "1");
    window.localStorage.removeItem(PROBE_KEY);
    persistent = true;
  } catch {
    persistent = false;
  }
  return persistent;
}

export function isStoragePersistent() {
  return detectPersistence();
}

export function loadAllCharacters() {
  if (!detectPersistence()) return [...memoryFallback];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [...memoryFallback];
  }
}

export function saveAllCharacters(list) {
  memoryFallback = list;
  if (!detectPersistence()) return false;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    return true;
  } catch {
    return false;
  }
}

export function saveCharacter(character) {
  const list = loadAllCharacters();
  const idx = list.findIndex((c) => c._id === character._id);
  if (idx >= 0) list[idx] = character;
  else list.push(character);
  saveAllCharacters(list);
  return list;
}

export function deleteCharacter(id) {
  const list = loadAllCharacters().filter((c) => c._id !== id);
  saveAllCharacters(list);
  return list;
}

export function newCharacterId() {
  return `char_${Date.now()}_${Math.floor(Math.random() * 1e6)}`;
}
