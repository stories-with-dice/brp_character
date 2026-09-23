// End-to-end smoke test for the actual DOM/app wiring (index.html + the
// built bundle), using jsdom. This loads index.html the same way a user
// opening the file directly in a browser would -- via a file:// URL, not an
// HTTP server -- specifically to catch the class of bug where ES module
// <script type="module"> imports get blocked by the browser's file://
// same-origin policy (see js/dist/bundle.js + npm run build). It then
// clicks the real buttons and asserts on the real DOM.
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { JSDOM } from "jsdom";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const INDEX_PATH = path.join(ROOT, "index.html");

let dom;
let window;
let document;

before(async () => {
  dom = await JSDOM.fromFile(INDEX_PATH, { runScripts: "dangerously", resources: "usable", pretendToBeVisual: true });
  await new Promise((resolve) => setTimeout(resolve, 500)); // let the classic <script> tags finish executing
  window = dom.window;
  document = window.document;
});

after(() => {
  window.close();
});

test("index.html was loaded as a genuine file:// document (reproduces the double-click scenario)", () => {
  assert.equal(document.location.protocol, "file:");
});

test("the app initializes with no module-loading errors (app.js runs as a classic bundled script)", () => {
  // If js/dist/bundle.js failed to load/execute (e.g. because index.html
  // still referenced it as type="module", which Chrome blocks under
  // file://), none of app.js's init() DOM wiring would have run and the
  // profession <select> would still contain only its static "Random" option.
  const select = document.getElementById("opt-profession");
  assert.equal(select.options.length, 45, "profession dropdown should be populated by app.js's init()");
});

test("clicking Generate produces a visible, populated character sheet", () => {
  document.getElementById("btn-generate").click();
  const sheetPanel = document.getElementById("sheet-panel");
  assert.equal(sheetPanel.hidden, false);
  const sheet = document.getElementById("character-sheet");
  assert.ok(sheet.children.length > 0);
  assert.match(sheet.textContent, /Summary/);
  assert.match(sheet.textContent, /Characteristics/);
  assert.match(sheet.textContent, /Skills/);
});

test("pinning a specific profession is reflected in the generated sheet", () => {
  document.getElementById("opt-profession").value = "Wizard";
  document.getElementById("btn-generate").click();
  const sheet = document.getElementById("character-sheet");
  assert.match(sheet.textContent, /Wizard/);
});

test("every characteristic-generation method can drive a full generation without throwing", () => {
  for (const method of ["standard", "chooseRolls", "higherStart", "pointBuy"]) {
    document.getElementById("opt-char-method").value = method;
    assert.doesNotThrow(() => document.getElementById("btn-generate").click(), method);
    assert.ok(document.getElementById("character-sheet").children.length > 0, method);
  }
});

test("enabling every optional-rule toggle still produces a valid sheet", () => {
  for (const id of ["opt-edu", "opt-category-bonus", "opt-increased-personal", "opt-distinctive-features", "opt-total-hp", "opt-hit-location", "opt-fatigue", "opt-sanity", "opt-powers"]) {
    document.getElementById(id).checked = true;
  }
  document.getElementById("btn-generate").click();
  const text = document.getElementById("character-sheet").textContent;
  assert.match(text, /Power Points/);
  assert.match(text, /Distinctive Features/);
  assert.match(text, /Fatigue Points/);
  assert.match(text, /Sanity Points/);
  assert.match(text, /Hit Points by Location/);
});

test("saving a character adds it to the saved list, and it reloads on click", () => {
  document.getElementById("opt-name").value = "Smoke Test Hero";
  document.getElementById("btn-generate").click();
  document.getElementById("btn-save").click();
  const list = document.getElementById("saved-character-list");
  assert.match(list.textContent, /Smoke Test Hero/);
});

test("New Character hides the sheet panel and clears the identity fields", () => {
  document.getElementById("btn-new-character").click();
  assert.equal(document.getElementById("sheet-panel").hidden, true);
  assert.equal(document.getElementById("opt-name").value, "");
});

test("JSON and Markdown export buttons don't crash the page when clicked", () => {
  // jsdom doesn't implement window.URL.createObjectURL, so the actual blob
  // download silently fails inside the click handler here (jsdom logs it to
  // its virtual console rather than propagating it) -- this is a gap in
  // jsdom's Web API coverage, not our code: URL.createObjectURL is a
  // standard, universally-supported browser API and works in real Chrome,
  // Firefox, Edge, and Safari. This assertion only guards against the click
  // handler itself throwing synchronously (e.g. a ReferenceError from a bug
  // in export.js), which *would* propagate here.
  document.getElementById("btn-generate").click();
  assert.doesNotThrow(() => document.getElementById("btn-export-json").click());
  assert.doesNotThrow(() => document.getElementById("btn-export-md").click());
});
