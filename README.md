# BRP Character Generator

An unofficial character generator for Chaosium's **Basic Roleplaying (BRP) Universal Game Engine**. Runs entirely in the browser as a static site — no server, no build step required to use it.

> Basic Roleplaying is a registered trademark of Moon Design Publications. This is a fan-made tool; rules content is adapted from the BRP Universal Game Engine rulebook for personal use.

## Using it

Just open `index.html` in a browser (double-click it — it works directly off `file://`, no local server needed). Two ways to build a character:

- **🎲 Quick Random Generate** — rolls and resolves everything at once: characteristics, profession, skill picks, skill points, and every optional rule you've enabled.
- **🛠 Build Step-by-Step** — a guided wizard through each character-creation step (characteristics → powers → age → personality → profession & skills → distinctive features → background → review), with every choice editable by hand and a "🎲 Randomize this step" shortcut on each screen.

Both read the same **Optional Rules & Settings** panel at the top: campaign power level, characteristic-generation method, campaign setting, and toggles for every optional subsystem in the rulebook (EDU, skill category bonuses, personality types, distinctive features, fatigue, sanity, hit locations, total hit points, increased personal skill points, age modifiers, and powers).

**Setting** lists the 23 settings of the core book's Chapter 10 (Prehistoric Age to Space Opera), or **Any** for no limit. A setting limits:

- **Professions**, as its "Character Types" say (pp.205–210): Prehistoric Age allows only Crafter, Farmer, Hunter, Shaman, and Tribesperson; Ancient World to Arabian Nights allow any but Journalist, Scientist, and Technician. The book misses one: Computer Tech needs the Modern era or later. The Quick Random **Profession** list and the wizard's list follow the setting.
- **Skills**, by technology era. Each setting has an era (`js/data/settings.js`: Primitive, Ancient, Medieval, Renaissance, Industrial, Early 20th Century, Modern, Near Future, Space Age), and each skill specialty an earliest era (`SPECIALTY_ERAS` in `js/data/skills.js`). For example, Energy Weapon (Energy Pistol) needs the Near Future, Pilot (Starship) the Space Age, and Firearm (Rifle) the Renaissance (flintlocks and muskets are in the book's Modern weapon table). The book's four weapon tables and the skills' Setting Notes set some eras; the rest are this generator's judgment. Edit the tables to change them.
- **Substitutes**: when a profession lists a skill the setting does not have, the book says to "substitute a different specialty if that makes it work, and if no other specialty is appropriate, choose another skill within the same category" (p.22). Quick Random does that at random (Soldier's Firearm (Rifle) in High Medieval becomes, for example, Missile Weapon (Crossbow)). The wizard marks the skill "not in this setting" and asks for the substitute.

The sheet and the Markdown export name the setting.

Finished characters can be saved (in-browser storage, with an in-memory fallback and a warning banner if storage isn't available in your context) and exported as **JSON**, **Markdown**, or **PDF**.

A character with a blank name gets a random one (`js/data/names.js`). The Markdown export (and **📋 Copy Markdown**) is an RPG Keeper BRP character sheet, one group per paragraph, values separated by `; `:

```markdown
# Nadia Okafor [BRP]

STR: 13; CON: 14; SIZ: 11; INT: 11; POW: 17; DEX: 12; CHA: 14

HP: 13/13; PP: 17/17

Major Wound: 7; Move: 10; Damage Modifier: None; Experience Bonus: 6
```

- `[BRP]` puts the sheet in Keeper's BRP system. Keeper names the character without it.
- Each `Name: N` is a Keeper sheet variable; the Combat tracker reads DEX (the DEX rank) and INT from them.
- Each `Name: current/max` is a resource: Keeper makes a tracker for it (`HP (Nadia Okafor)`, `PP (Nadia Okafor)`, and `FP`/`SAN` when those rules are on).
- Every `Skill NN%` is a clickable d100 roll. No tables or code fences: they break the `Name: N` values.

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

## Monster pack for RPG Keeper

`tools/extract_monsters.py` reads the creatures and NPCs from the two BRP PDFs (core book and *Basic Roleplaying: Creatures*), gives each one an Encounter Level, and writes a content pack for the RPG Keeper app. It needs Python 3 and PyMuPDF:

```sh
python3 -m pip install -r tools/requirements.txt
python3 tools/extract_monsters.py --report    # writes build/brp-monsters-pack.json
python3 -m unittest discover -s tools          # tests for the Encounter Level model
```

The pack holds book text, so `build/` is gitignored. [docs/encounter-level.md](docs/encounter-level.md) explains the Encounter Level model, the party budget, and how to use the pack in Keeper.

## Scope notes

A few rulebook systems are intentionally out of scope or simplified, by design decisions made during development:

- **Powers** (magic/mutations/psychic/sorcery/superpowers) get their starting powers from the Chapter 4 rules (spell and ability counts, sorcery spell-level limits, mutation picks, superpower character point budgets), drawn from each power set's summary list. Power effects (for example Increased Characteristic or Super Characteristic) are not applied to characteristics or skills, superpower power modifiers and character failings are not modeled, and Sidekick is not offered.
- **Equipment/possessions** (Chapter 8) are guidance text plus a free-form notes field, not an itemized purchasing system.
- **Non-human/creature characters** (Chapter 11) aren't supported — humans only.
- Vague, GM-discretion-only options with no concrete formula in the book (e.g. Cultural Modifiers) aren't implemented as toggles.
