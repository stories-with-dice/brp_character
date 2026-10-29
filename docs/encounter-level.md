# Encounter Level for BRP creatures

`tools/extract_monsters.py` reads the creatures and NPCs from the two BRP rulebook PDFs. It gives each one an
Encounter Level (EL) and writes an RPG Keeper content pack. `tools/encounter_level.py` has the EL model.

## What the books say

BRP has no challenge rating. Both books say that their creatures "are not balanced in the same fashion as
player characters":

- Core book, Chapter 11: Creatures, p.221.
- *Basic Roleplaying: Creatures*, Introduction, p.1.

The only scaling rule is in *Basic Roleplaying: Creatures*, pp.149–150 ("Customizing Creatures and Nonplayer
Characters"):

- The creatures are built for a Normal power level game.
- For Heroic PCs, increase the number of foes by 25% or more.
- For Epic PCs, double the number of foes.
- For Superhuman PCs, the book gives no number.

So an EL is not in the books. It can be calculated, because a stat block has every number that combat uses:
skill %, damage, damage modifier, armor, hit points, Dodge, and SIZ.

## How the EL is calculated

EL 1 is one starting PC at the Normal power level (the reference PC, below). An EL 3 creature is a fair fight
for three such PCs.

1. Damage per round. The model applies the core book's Attack and Defense Matrix (p.127) to the expected
   damage of each attack:
   - Levels of success for the attack and for the defender's parry or Dodge. Critical is 1/20 of the skill,
     special is 1/5 (rounded up).
   - Special damage by type (p.128–129): impaling doubles the weapon dice, crushing doubles the damage
     modifier, bleeding adds about 2 HP.
   - A critical does the weapon's full damage plus the damage modifier, and ignores armor.
   - Armor is subtracted from the full damage distribution, not from the average. A creature with 8 armor
     takes damage from a 1D8+1 sword only on a roll of 9, a special, or a critical.
   - Each later parry or Dodge in a round is at a cumulative –30%. The model assumes that the defender
     meets one more attack each round than the attacker makes (other combatants attack it too).
   - Missile attacks can be dodged only at half Dodge, once a round. A defender cannot parry an attacker
     with twice its SIZ, an area attack, or a sweep attack.
   - Damage over the target's hit points does not count (overkill).
2. Attacks per round. The model reads the stat block's notes ("one bite attack and two claw attacks each
   combat round"). Without such a note it uses the one attack that does the most damage.
   `ROUTINE_OVERRIDES` in `encounter_level.py` corrects three stat blocks (Kraken, Small; Kraken, Large;
   Vampire).
3. Offense = the creature's damage per round against the reference PC, divided by the reference PC's damage
   per round against another reference PC.
4. Toughness = the rounds a reference PC needs to drop the creature, divided by the rounds a reference PC
   needs to drop another reference PC.
5. EL = √(offense × toughness).

The square root follows Lanchester's square law. The fighting strength of a side is its total damage per round
times its total hit points. With that law, ELs add up: two EL 1 creatures are a fair fight for two reference
PCs, and an EL 4 creature is a fair fight for four.

Rounding: steps of 0.5 below EL 5 (the lowest EL is 0.5), whole numbers from EL 5 up. RPG Keeper's Populate by
HD works in steps of 0.5, so it can use every EL. The Encounter Level ability text of each monster also shows
the unrounded EL.

### The reference PC

`REFERENCE_PC` in `encounter_level.py`. It is a starting Normal-power-level PC with average human
characteristics (core book p.11: 250 professional skill points, no skill over 75%):

| Stat | Value |
|---|---|
| Hit points | 12 (CON 10.5, SIZ 13) |
| Damage modifier | None |
| Armor | 2 (hard leather) |
| Attack | Broadsword 60%, 1D8+1, bleeding |
| Parry | 60% (with the broadsword) |
| Dodge | 35% |

The reference PC is the largest assumption. A party with firearms or with heavy armor sees other ratings. For
example, a knight in 10-point armor is EL 6, because a 1D8+1 sword hurts it only with a special or a critical.
Change `REFERENCE_PC` and run the script again to rate creatures for another kind of party.

### What the EL does not count

The model counts only physical attacks and physical defense. The Encounter Level text of a monster names what
it skipped for that monster:

- Special attacks without damage dice (a basilisk's Glance, a darkness elemental's Fearshock, Grapple).
- Immunities (a werewolf is immune to weapons that are not silver, fire, or magic).
- Regeneration, poison, and venom.
- Area attacks that hit more than one PC (a dragon's breath).
- Powers: spells, psychic abilities, superpowers.

Read those notes before you use a creature. A werewolf at EL 2 is EL 2 only for a party with silver weapons.

Eight entries get no EL, because they have no hit points or no attack with damage dice: Insect Swarm, Piranha
Swarm, Rat Pack, Ghost, Wraith, Elemental, Water, Artificial Intelligence, and Shapechanger.

## Party budget

The budget for a fight is the sum of the PC values, times the difficulty:

| Power level | PC value | Source |
|---|---|---|
| Normal | 1 | the reference PC |
| Heroic | 1.25 | Creatures p.149: +25% foes |
| Epic | 2 | Creatures p.150: double the foes |
| Superhuman | 3 | my estimate; the book gives no number |

| Difficulty | Multiplier |
|---|---|
| Easy | 0.5 |
| Standard (a fair fight) | 1 |
| Hard | 1.5 |
| Deadly | 2 |

Examples:

- Four Normal PCs, standard fight: 4 × 1 × 1 = EL 4.
- Four Heroic PCs, hard fight: 4 × 1.25 × 1.5 = EL 7.5.
- Three Epic PCs, easy fight: 3 × 2 × 0.5 = EL 3.

`party_budget()` in `encounter_level.py` does this calculation.

## Make the pack

The PDFs must be in the repo root (they are gitignored):

- `Basic Roleplaying - Universal Game Engine v1.02.pdf`
- `Basic Roleplaying Creatures_v1_00.pdf`

```sh
python3 -m pip install -r tools/requirements.txt
python3 tools/extract_monsters.py --report
```

The script writes `build/brp-monsters-pack.json`. `build/` is gitignored, because the pack holds book text. Keep
the pack out of public repositories.

The books print an average that ends in a half point as a range (`10–11`). The script stores the lower value
(10) for characteristics and hit points (`parse_avg()`), the same as RPG Keeper's bundled BRP Bestiary.

Options:

- `--report` prints every monster with its EL, offense, toughness, and attacks per round.
- `--duplicates keep-both` also keeps the core book version of a creature that is in both books, with
  " (core)" after its name. By default, the Creatures book version replaces it. All 73 core book creatures
  are also in the Creatures book.
- `--raw-json FILE` writes the parsed stat blocks before the EL step, to check the parser.
- `--out FILE` writes the pack to another path.

## Use the pack in RPG Keeper

1. In Keeper, click **Import** and pick `build/brp-monsters-pack.json`.
2. Tick **Replace the items I already have**. This replaces Keeper's bundled BRP Bestiary entries (from the
   core book, without an EL) with the rated ones. Keeper keeps two old entries that have no match:
   **Werewolf** and **Priest**. The pack has "Werewolf, Hybrid Form", "Werewolf, Wolf Form", and
   "Priest, Warrior" in their place. Delete the old two by hand if you want.
3. Click **Import**. Keeper switches the System to BRP.

The pack puts the EL in the fields that Keeper uses for Hit Dice (`hd` and `hdNum`), and also in
`encounterLevel`. Each monster also has an "Encounter Level" ability with the explanation. When the System is
BRP, Keeper labels these fields "EL":

- **Bestiary tab**: the **EL** min and max filter.
- **Combat → + Populate by EL**: the party calculator (PCs, power level, difficulty) fills the **Total EL**
  with the budget from the tables above. Optional: type the number of monsters. Keeper picks monsters whose
  ELs add up to exactly that total. It never picks a monster without an EL.
- **Edit form**: the BRP form has an **EL** field. A save keeps the EL. Type an EL to rate your own monsters.
