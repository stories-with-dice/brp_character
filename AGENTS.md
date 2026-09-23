# AGENTS.md

Guidance for AI coding agents working in this repository. Read this before making changes.

## What this is

A client-side character generator for the Basic Roleplaying (BRP) Universal Game Engine tabletop RPG. Plain HTML/CSS/JS, no framework, no backend. See `README.md` for the user-facing overview.

## Critical constraint: `index.html` must work via `file://`

The app must run by double-clicking `index.html` — no server. This means:

- **Never** change `index.html` back to `<script type="module" src="js/ui/app.js">`. Chrome (and most browsers) block ES module imports as cross-origin requests under `file://`. `index.html` must load `js/dist/bundle.js` (a pre-bundled, non-module classic script built by esbuild from `js/ui/app.js`).
- If you edit anything under `js/`, run `npm run build` before manually testing in a browser. `npm test` does this automatically via the `pretest` script, so running tests is always safe.
- `js/dist/bundle.js` is committed (not gitignored) so the app works out of the box without a build step for end users. Don't add it to `.gitignore`.
- Don't add `fetch()` calls, dynamic `import()`, or any other network/module-loading behavior to `js/ui/*.js` — it all has to work from a `file://` origin with no server.

## Architecture

```
js/data/      static rules data (skills, professions, personality types, powers, distinctive features).
              No logic — just lists/tables extracted from the rulebook.
js/engine/    pure functions: dice, characteristics, derived stats, skill formulas/allocation,
              profession/personality/powers resolution (both random and manual variants), age
              modifiers, wealth. No DOM access. Runs identically in Node and the browser.
js/ui/        DOM-only glue: app.js (wires the "Quick Random" flow + saved-character list + settings
              panel), wizard.js (the step-by-step manual flow), render.js (character sheet rendering,
              shared `el()` DOM helper), export.js (JSON/Markdown/PDF), storage.js (localStorage with
              an in-memory fallback for opaque-origin contexts).
js/lib/       vendored third-party libraries (jsPDF), loaded via classic <script> in index.html.
js/dist/      build output (esbuild bundles js/ui/app.js -> bundle.js). Regenerate, don't hand-edit.
```

**Golden rule**: `js/engine` and `js/data` never import from `js/ui`, and never touch `document`/`window`/`localStorage`. This is what makes the engine layer unit-testable in plain Node and reusable identically by both the random generator (`characterFactory.js`) and the manual wizard (`wizard.js`).

### Random vs. manual character creation

Every "resolve this randomly" engine function (e.g. `resolveProfessionSkills`, `resolvePersonalitySkills`, `buildPowersBlock`) has a manual counterpart the wizard uses instead (`resolveProfessionSkillsManual`, `resolvePersonalitySkillsManual`, `buildPowersBlockManual`, etc.) that takes explicit player choices instead of an RNG. Both paths converge on `engine/characterAssembly.js`'s `assembleCharacter()` to build the final character object, so `render.js`/`export.js` work identically regardless of which path produced the character. **When adding a new character-creation choice, add both the random and manual resolution functions together**, and route both through `assembleCharacter()` — don't let the two paths' output shapes drift apart.

### Skill reference strings

Profession/personality data files reference skills as strings like `"Firearm (Rifle)"`, `"Craft (any)"`, `"Melee Weapon (any)"`, or bare `"Etiquette"`. `engine/skillRef.js` is the single source of truth for parsing these (`parseSkillRef`), detecting when a concrete specialty still needs to be chosen (`refNeedsSpecialtyChoice`), listing the valid specialty options (`specialtyOptionsFor`), and resolving to a final display name either randomly (`resolveSkillDisplayName`) or from a player's pick (`resolveSkillDisplayNameManual`). A skill with `specialty: "open"` or `"weaponClass"` in `data/skills.js` always needs resolution even when written bare (no parens) — e.g. `"Etiquette"` alone still needs a group chosen, matching the book's "specialty: by group" note.

**Known data quirk**: some profession choice pools have fewer distinct refs than the count required (e.g. Artist's "choose 2" from a pool of just `["Art (any)"]"`, meaning two different Art specialties). Both `resolveProfessionSkills` and `resolveProfessionSkillsManual` handle this (sampling with replacement / accepting repeated base refs with different specialties), and `professionChoices.js`'s `validateChoiceSelection` accepts already-resolved concrete names against an `"(any)"` pool entry for this reason. If you touch this code path, re-run `tests/professionSkills.test.js` and `tests/professionChoices.test.js` — they lock in this behavior with regression tests naming the specific affected professions.

## Testing

```sh
npm test
```

Node's built-in test runner (`node --test tests/*.test.js`), rebuilding the bundle first. Conventions:

- One test file per engine module (`tests/<module>.test.js`), pure unit tests, no DOM.
- `tests/ui.smoke.test.js` and `tests/wizard.smoke.test.js` are end-to-end: they load the **real** `index.html` via `JSDOM.fromFile` (a genuine `file://` URL — not an HTTP server) and click through the real DOM. This is intentional and important: an HTTP-served test would not have caught the original ES-module/`file://` regression. Keep using `fromFile`, not `fromURL`, for these.
- Random-generation code paths (profession pick, characteristic rolls, personality type, etc.) mean these smoke tests are non-deterministic by construction. When adding assertions here, prefer "doesn't throw and produces a structurally valid result" over exact values, and if you suspect flakiness, re-run the affected test file in a loop (`for i in $(seq 1 20); do node --test tests/wizard.smoke.test.js; done`) before concluding it's stable — several real bugs in this codebase were only ever found this way (see below).
- **jsdom gaps to expect, not fix**: `window.URL.createObjectURL` is unimplemented in jsdom (real browsers all support it fine) — export-button tests only assert the click handler doesn't throw synchronously, not that a file downloads. `HTMLCanvasElement.getContext` logs a harmless "Not implemented" warning from jsPDF's font metrics code. `localStorage` throws `SecurityError` under jsdom's `file://` "opaque origin" handling — this is exactly why `storage.js` has an in-memory fallback (`isStoragePersistent()`), and it's a legitimate defensive feature, not a workaround for the test environment.
- jsdom does **not** execute `<script type="module">` at all (silently no-ops), but does execute classic `<script src>` tags synchronously during parse — this is exactly why the smoke tests can drive the app for real: `index.html`'s classic `<script src="js/dist/bundle.js">` runs during `JSDOM.fromFile()`, same as a real browser would.

## Adding a new optional rule

1. Add the toggle to `defaultOptions()` in `engine/characterFactory.js` and wire it into `generateRandomCharacter()`.
2. Wire the same option into `wizard.js`'s `freshState()`/relevant step, respecting the shared `state.options` object (read from the same settings-panel toggle in `app.js`, both modes share one settings panel).
3. Add the checkbox to `index.html`'s `#settings-body`, wired in `app.js`'s `readOptionsFromForm()`.
4. Update `render.js` and `export.js` if the new data needs to appear on the sheet/exports.
5. Add unit tests for the engine change, and extend `tests/wizard.smoke.test.js`'s "every optional rule enabled" test to toggle it on.

## Data accuracy

`js/data/*.js` was extracted from the rulebook PDF (`Basic Roleplaying - Universal Game Engine v1.02.pdf`, present in the repo root) during initial development. If you need to verify or extend rules data, that PDF is the authoritative source — use `pdftotext -layout` to extract text for searching rather than guessing from memory.
