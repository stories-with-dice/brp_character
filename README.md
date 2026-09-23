# BRP Character Generator

An unofficial character generator for Chaosium's **Basic Roleplaying (BRP) Universal Game Engine**. Runs entirely in the browser as a static site — no server, no build step required to use it.

> Basic Roleplaying is a registered trademark of Moon Design Publications. This is a fan-made tool; rules content is adapted from the BRP Universal Game Engine rulebook for personal use.

## Using it

Just open `index.html` in a browser (double-click it — it works directly off `file://`, no local server needed). Two ways to build a character:

- **🎲 Quick Random Generate** — rolls and resolves everything at once: characteristics, profession, skill picks, skill points, and every optional rule you've enabled.
- **🛠 Build Step-by-Step** — a guided wizard through each character-creation step (characteristics → powers → age → personality → profession & skills → distinctive features → background → review), with every choice editable by hand and a "🎲 Randomize this step" shortcut on each screen.

Both read the same **Optional Rules & Settings** panel at the top: campaign power level, characteristic-generation method, and toggles for every optional subsystem in the rulebook (EDU, skill category bonuses, personality types, distinctive features, fatigue, sanity, hit locations, total hit points, increased personal skill points, age modifiers, and powers).

Finished characters can be saved (in-browser storage, with an in-memory fallback and a warning banner if storage isn't available in your context) and exported as **JSON**, **Markdown**, or **PDF**.

## Project structure

```
index.html            entry point — open this directly
css/styles.css         all styling
js/data/               static rules data (skills, professions, personality types, powers, distinctive features)
js/engine/             pure, testable game-logic functions (dice, characteristics, skills, professions, etc.)
js/ui/                 DOM/browser code: app.js (wiring), wizard.js (step-by-step flow), render.js, export.js, storage.js
js/lib/                vendored third-party libraries (jsPDF)
js/dist/bundle.js      built bundle that index.html actually loads (see "Building" below)
tests/                 the test suite (see "Testing" below)
```

`js/engine` and `js/data` have no DOM dependency and run identically in Node (for tests) and the browser. `js/ui` is DOM-only and is bundled into a single classic script for the browser — see below for why.

## Building

`index.html` loads `js/dist/bundle.js`, a single pre-bundled, non-module script — **not** the `js/ui/*.js` source files directly. This is deliberate: browsers block `<script type="module">` imports when a page is opened via `file://` (a same-origin/CORS restriction), and the whole point of this app is that you can just double-click `index.html` with no server. So the source stays as clean ES modules, and [esbuild](https://esbuild.github.io/) bundles them into one classic script that works everywhere.

If you edit anything under `js/`, rebuild before reopening `index.html`:

```sh
npm install     # first time only
npm run build   # regenerates js/dist/bundle.js
```

`npm test` rebuilds automatically first (see `pretest` in package.json), so `js/dist/bundle.js` never goes stale as long as you run tests before checking your work.

## Testing

```sh
npm test
```

Runs the full suite with Node's built-in test runner (`node --test`). This includes:

- **Unit tests** for every engine module (dice, characteristics, derived stats, skill formulas, category bonuses, professions, skills, age, powers, personality) — pure functions, no DOM.
- **End-to-end smoke tests** (`tests/ui.smoke.test.js`, `tests/wizard.smoke.test.js`) that load the real `index.html` via an actual `file://` URL with [jsdom](https://github.com/jsdom/jsdom) and click through the real UI, including a full run of the step-by-step wizard across every characteristic-generation method and every optional-rule combination. These specifically guard against the browser-loading regression described above.

A `Makefile` wraps the same commands (`make test`, `make build`) for anyone who prefers `make`.

## Scope notes

A few rulebook systems are intentionally out of scope or simplified, by design decisions made during development:

- **Powers** (magic/mutations/psychic/sorcery/superpowers) are groundwork only: you choose power type(s) and get Power Points, but no spell/mutation/power catalog is generated — that's left for a future pass.
- **Equipment/possessions** (Chapter 8) are guidance text plus a free-form notes field, not an itemized purchasing system.
- **Non-human/creature characters** (Chapter 11) aren't supported — humans only.
- Vague, GM-discretion-only options with no concrete formula in the book (e.g. Cultural Modifiers) aren't implemented as toggles.
