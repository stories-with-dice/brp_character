"""Encounter Level (EL) for Basic Roleplaying creatures and NPCs.

BRP has no challenge rating: both books say their creatures "are not balanced in
the same fashion as player characters". This module derives one from the stat
block. docs/encounter-level.md explains the model; in short:

  offense  = damage per round the monster deals to a reference PC
             / damage per round a reference PC deals to another reference PC
  defense  = rounds a reference PC needs to drop the monster
             / rounds a reference PC needs to drop another reference PC
  EL       = sqrt(offense * defense)

EL 1 is one starting Normal-power-level PC. Lanchester's square law makes the
geometric mean additive: a group of monsters is a fair fight for a party whose
PC count (in Normal PCs) equals the sum of the monsters' ELs.

Damage per round uses the core book's Attack and Defense Matrix (p.127):
levels of success for the attack and for the parry or Dodge, special damage by
type (impaling, crushing, bleeding), criticals that do full damage and ignore
armor, and the cumulative -30% on each later parry or Dodge in a round.
Damage over the target's hit points is not counted (overkill).
"""
import math
import re
from functools import lru_cache

# A starting Normal-power-level PC (core book p.11: 250 professional skill points,
# no skill over 75% at creation). Average human characteristics: STR 3D6,
# CON 3D6, SIZ 2D6+6 -> HP (10.5+13)/2 = 12, damage modifier None.
REFERENCE_PC = {
    'name': 'Reference PC (Normal)',
    'hp': 12,
    'siz': 13,
    'armor': 2,           # hard leather (core book armor table)
    'dodge': 35,
    'damageBonus': 'None',
    'attacks': [{'name': 'Broadsword', 'pct': 60, 'damage': '1D8+1 (bleeding)'}],
}

# PC value of one PC per power level, from Basic Roleplaying: Creatures
# pp.149-150 ("Customizing Creatures"): heroic parties meet +25% foes, epic
# parties double the number. Superhuman has no number in the book; 3 is a guess.
POWER_LEVEL_EL = {'normal': 1.0, 'heroic': 1.25, 'epic': 2.0, 'superhuman': 3.0}
DIFFICULTY = {'easy': 0.5, 'standard': 1.0, 'hard': 1.5, 'deadly': 2.0}

NUMBER_WORDS = {'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5, 'six': 6, 'seven': 7, 'eight': 8,
                'nine': 9, 'ten': 10, 'twice': 2, 'both': 2}

NATURAL = re.compile(r'\b(bite|claws?|kick|gore|trample|tail|tentacles?|sting|butt|horns?|hoof|hooves|beak|'
                     r'talons?|crush|constrict\w*|slam|stomp|tusks?|trunk|rake|hug|peck|wings?|pincers?|fangs?|'
                     r'plunge|swallow|touch|bash|ram|head|lash|smother|engulf|sweep|tongue|spit|mandibles?|'
                     r'grip|rend|squeeze|pseudopod|limb|hands?|feet|foot|charge|swat|stamp|jaws?|thorn|vine|'
                     r'branch|lash)\b', re.I)
UNARMED = re.compile(r'\b(brawl|fist|punch|grapple|martial arts?|unarmed|wrestle|strangle|choke)\b', re.I)
MISSILE = re.compile(r'\b(gun|pistol|rifle|revolver|shotgun|carbine|smg|submachine|machine gun|bow|longbow|'
                     r'crossbow|laser|blaster|sling|thrown|dart|throw|javelin|missile|rocket|grenade|ray|beam|'
                     r'blast|bolt|shuriken|spit|projectile|cannon|derringer|uzi|musket|arquebus|flamethrower|'
                     r'net)\b', re.I)
AREA = re.compile(r'\b(breath|breathe|sweep|area|cloud|gaze|scream|roar|aura|spray|swarm)\b', re.I)
SHIELD = re.compile(r'\b(shield|buckler|targe)\b', re.I)


def norm_name(s):
    return ' '.join(sorted(w for w in re.sub(r'[^a-z0-9]+', ' ', s.lower()).split() if w != 'etc'))


# ------------------------------------------------------------------ dice

def parse_db(db):
    """'+2D6' -> [(2, 6, 1)], '–1D4' -> [(1, 4, -1)], 'None' -> []."""
    terms = []
    s = (db or '').replace('–', '-').replace('−', '-').replace(' ', '')
    for sign, n, sides in re.findall(r'([+-]?)(\d*)[dD](\d+)', s):
        terms.append((int(n or 1), int(sides), -1 if sign == '-' else 1))
    return terms


def halve_db(terms):
    """BRP half damage modifier: halve the dice (2D6 -> 1D6, 1D6 -> 1D3, 1D4 -> 1D2, 3D6 -> 1D6+1D3)."""
    out = []
    for n, sides, sign in terms:
        if n >= 2:
            out.append((n // 2, sides, sign))
        if n % 2:
            out.append((1, max(1, sides // 2), sign))
    return out


def double_db(terms):
    if not terms:
        return [(1, 4, 1)]          # crushing with no modifier: +1D4 (core p.128)
    if all(sign < 0 for _, _, sign in terms):
        return []                   # a negative modifier becomes none
    return [(n * 2, sides, sign) for n, sides, sign in terms]


class Damage:
    """A parsed damage expression: weapon dice + flat bonus + damage modifier part."""

    def __init__(self, text, db_terms):
        self.text = text or ''
        t = self.text
        low = t.lower()
        self.kind = damage_kind(low)
        main = re.split(r'\(|/(?=\s*\d+[dD]\d)', t, maxsplit=1)[0]  # '4D6/2D6/1D6': the first range
        main = main.replace('½', '1/2').replace('–', '-').replace('−', '-')
        main = re.sub(r'1\s*/\s*2', '1/2', main)
        main = re.sub(r'(?i)\bhalf\s*dm\b', '1/2dm', main)
        self.dice, self.flat, self.db = [], 0, []
        has_dm = False
        for m in re.finditer(r'([+-]?)\s*(?:(1/2)\s*(?:dm|db)|(dm|db)|(\d*)\s*[dD]\s*(\d+)|(\d+))', main, re.I):
            sign = -1 if m.group(1) == '-' else 1
            if m.group(2):
                self.db += halve_db(db_terms)
                has_dm = True
            elif m.group(3):
                self.db += db_terms
                has_dm = True
            elif m.group(5):
                self.dice.append((int(m.group(4) or 1), int(m.group(5)), sign))
            elif m.group(6):
                self.flat += sign * int(m.group(6))
        self.has_dm = has_dm
        self.damaging = bool(self.dice or self.flat > 0 or (has_dm and db_terms))

    def weapon_max(self):
        return sum(n * s * sign for n, s, sign in self.dice) + self.flat


def damage_kind(low):
    for k in ('impaling', 'crushing', 'bleeding', 'entangling', 'knockback'):
        if k in low:
            return k
    return None


def attack_kind(name, dmg):
    if dmg.kind:
        return dmg.kind
    n = name.lower()
    if re.search(r'bite|claw|talon|fang|rake|sword|axe|knife|dagger|scimitar|saber|sabre|cutlass|rend|jaw', n):
        return 'bleeding'
    if re.search(r'gore|horn|sting|spear|lance|arrow|bow|bolt|gun|pistol|rifle|revolver|tusk|beak|pike|rapier|'
                 r'trident|javelin|dart|peck', n):
        return 'impaling'
    if re.search(r'kick|trample|fist|punch|tail|slam|butt|club|mace|hammer|staff|stomp|brawl|crush|hoof|ram|'
                 r'trunk|flail|maul|shield|plunge', n):
        return 'crushing'
    return None


@lru_cache(maxsize=None)
def dist(terms):
    """Distribution of a sum of dice terms: dict value -> probability. terms: tuple of (n, sides, sign)."""
    d = {0: 1.0}
    for n, sides, sign in terms:
        for _ in range(n):
            nd = {}
            p = 1.0 / sides
            for v, pv in d.items():
                for face in range(1, sides + 1):
                    k = v + sign * face
                    nd[k] = nd.get(k, 0.0) + pv * p
            d = nd
    return d


def expect(terms, flat, armor, cap, extra=0):
    """E[min(cap, max(0, X + flat - armor) + extra)], extra only on a wound (bleeding)."""
    total = 0.0
    for v, p in dist(tuple(sorted(terms))).items():
        dmg = max(0, v + flat - armor)
        if dmg > 0:
            dmg += extra
        total += p * min(cap, dmg)
    return total


def outcome_damage(attack, armor, cap):
    """Expected damage of a normal hit, a special hit, and a critical hit."""
    dmg = attack['dmg']
    dice, flat, db = dmg.dice, dmg.flat, dmg.db
    normal = expect(dice + db, flat, armor, cap)
    kind = attack['kind']
    if kind == 'impaling':
        special = expect(dice + dice + db, flat * 2, armor, cap)
    elif kind == 'crushing':
        special = expect(dice + double_db(db if dmg.has_dm else []), flat, armor, cap)
    elif kind == 'bleeding':
        special = expect(dice + db, flat, armor, cap, extra=2)  # ~2 rounds of 1 HP bleeding
    else:
        special = normal
    crit = expect(db, dmg.weapon_max(), 0, cap)
    return normal, special, crit


# ------------------------------------------------------- success levels

def levels(skill):
    """P(critical), P(special but not critical), P(success but not special), P(failure)."""
    if skill <= 0:
        return 0.0, 0.0, 0.0, 1.0
    succ = min(skill, 95) / 100.0
    crit = min(math.ceil(skill / 20.0) / 100.0, succ)
    spec = min(math.ceil(skill / 5.0) / 100.0, succ)
    return crit, spec - crit, succ - spec, 1.0 - succ


def expected_hit(attack_skill, defense_skill, normal, special, crit):
    """Expected damage of one attack through the Attack and Defense Matrix (core p.127)."""
    ac, asp, asu, _ = levels(attack_skill)
    dc, dsp, dsu, df = levels(defense_skill)
    return (ac * (dsp * normal + dsu * special + df * crit)
            + asp * (dsu * normal + df * special)
            + asu * (df * normal))


# ------------------------------------------------------------ combatant

def skill_value(skills_text, name):
    m = re.search(r'\b' + name + r'\s*(?:\([^)]*\))?\s*(\d+)%', skills_text or '', re.I)
    return int(m.group(1)) if m else 0


def combatant(m):
    """Normalize a parsed stat block (or REFERENCE_PC) for the damage model."""
    db_terms = parse_db(m.get('damageBonus'))
    attacks = []
    for a in m.get('attacks', []):
        if a.get('pct') is None:
            continue
        dmg = Damage(a.get('damage', ''), db_terms)
        name = a.get('name', '')
        text = name + ' ' + a.get('damage', '')
        attacks.append({
            'name': name, 'pct': a['pct'], 'dmg': dmg, 'kind': attack_kind(name, dmg),
            'missile': bool(MISSILE.search(name)) and not NATURAL.search(name) and 'thrown' not in name.lower()
            or bool(re.search(r'\bthrown\b', name, re.I)),
            'area': bool(AREA.search(text)),
            'natural': bool(NATURAL.search(name)),
            'unarmed': bool(UNARMED.search(name)),
            'shield': bool(SHIELD.search(name)),
        })
    chars = m.get('characteristics') or {}
    siz = m.get('siz', chars.get('SIZ'))
    dodge = m.get('dodge')
    if dodge is None:
        dodge = skill_value(m.get('skills', ''), 'Dodge')
    parry = 0
    for a in attacks:
        if not (a['natural'] or a['missile'] or a['area'] or a['unarmed']) or a['shield']:
            parry = max(parry, a['pct'])
    return {
        'name': m.get('name', ''),
        'hp': m.get('hp'),
        'siz': siz or 0,
        'armor': m.get('armor') or 0,
        'dodge': dodge,
        'parry': parry,
        'attacks': attacks,
        'notes': ' '.join(m.get(k, '') or '' for k in ('notes', 'powers', 'desc')),
    }


def defense_skill(defender, attack, attacker_siz, pos):
    """The defender's parry or Dodge chance against the pos-th attack it faces this round."""
    if attack['missile']:
        return defender['dodge'] / 2.0 if pos == 0 else 0  # Dodge vs. missiles: Difficult, first only
    best = defender['dodge']
    big = attacker_siz and defender['siz'] and attacker_siz >= 2 * defender['siz']
    if not (big or attack['area']):
        best = max(best, defender['parry'])
    return best - 30 * pos


# Stat blocks whose notes the attack-count rule reads wrong. Keys are pack names.
ROUTINE_OVERRIDES = {
    # "eight tentacle attacks": a tentacle hit only grips; two grips constrict for the listed damage
    'Kraken, Small': ['Tentacle', 'Bite'],
    'Kraken, Large': ['Tentacle', 'Bite'],
    # "one bite and two claw attacks per round" (core and Creatures book notes)
    'Vampire': ['Bite', 'Claw', 'Claw'],
}


def routine(c):
    """The attacks the combatant makes in one round, from its notes ('two attacks each round')."""
    dmg_attacks = [a for a in c['attacks'] if a['dmg'].damaging]
    if not dmg_attacks:
        return [], ''
    if c['name'] in ROUTINE_OVERRIDES:
        by_name = {a['name']: a for a in dmg_attacks}
        chosen = [by_name[n] for n in ROUTINE_OVERRIDES[c['name']] if n in by_name]
        if chosen:
            return chosen, ', '.join(a['name'] for a in chosen)
    ranked = sorted(dmg_attacks, key=lambda a: a['score'], reverse=True)
    best = [ranked[0]]
    count_words = '|'.join(NUMBER_WORDS) + r'|\d+'
    part_re = re.compile(r'\b(' + count_words + r')\s+(?:separate\s+|different\s+|melee\s+)?'
                         r'((?:[a-z]+\s+){0,2}?)attacks?\b', re.I)
    for sent in re.split(r'(?<=[.!?:])\s+', c['notes']):
        if not re.search(r'\bround\b', sent, re.I):
            continue
        options = []    # one list of attacks per "X attacks" phrase
        for mm in part_re.finditer(sent):
            g = mm.group(1).lower()
            k = min(int(g) if g.isdigit() else NUMBER_WORDS[g], 12)
            word = mm.group(2).strip().split(' ')[-1].lower().rstrip('s') if mm.group(2).strip() else ''
            named = next((a for a in dmg_attacks if word and a['name'].lower().startswith(word)), None)
            options.append([named] * k if named else [None] * k)
        if not options:
            if re.search(r'\battacks?\s+twice\b', sent, re.I) and len(best) < 2:
                best = ranked[:2] if len(ranked) > 1 else ranked * 2
            continue
        # "one bite attack and two claw attacks": add them up; "two claws, or one claw and one bite": the larger
        parts = max(options, key=len) if re.search(r'\bor\b', sent, re.I) else sum(options, [])
        if len(parts) <= len(best):
            continue
        chosen = [a for a in parts if a is not None]
        spare = [a for a in ranked if a not in chosen] or ranked
        for i in range(len(parts) - len(chosen)):
            chosen.append(spare[i % len(spare)])
        best = chosen
    label = ', '.join(a['name'] for a in best)
    return best, label


def dpr(attacker, defender, chosen=None):
    """Expected damage per round of attacker against defender."""
    if chosen is None:
        chosen, _ = routine(attacker)
    if not chosen:
        return 0.0
    cap = defender['hp'] or 1
    k = len(chosen) + 1     # incoming attacks per round: these plus one from someone else
    total = 0.0
    for a in chosen:
        normal, special, crit = outcome_damage(a, defender['armor'], cap)
        per_pos = [expected_hit(a['pct'], defense_skill(defender, a, attacker['siz'], pos), normal, special, crit)
                   for pos in range(k)]
        total += sum(per_pos) / k
    return total


def score_attacks(attacker, defender):
    for a in attacker['attacks']:
        if a['dmg'].damaging:
            normal, special, crit = outcome_damage(a, defender['armor'], defender['hp'] or 1)
            a['score'] = expected_hit(a['pct'], defense_skill(defender, a, attacker['siz'], 0), normal, special, crit)
        else:
            a['score'] = 0.0


# -------------------------------------------------------------- rating

def _ref():
    ref = combatant(REFERENCE_PC)
    score_attacks(ref, ref)
    return ref


def rate(m):
    """Rate a parsed stat block. Returns {el, raw, offense, defense, routine, reason}."""
    ref = _ref()
    ref_dpr = dpr(ref, ref)
    c = combatant(m)
    if not c['hp']:
        return {'el': None, 'raw': None, 'offense': None, 'defense': None, 'routine': '', 'reason': 'no hit points'}
    score_attacks(c, ref)
    chosen, label = routine(c)
    if not chosen:
        return {'el': None, 'raw': None, 'offense': None, 'defense': None, 'routine': '',
                'reason': 'no damaging attack'}
    off = dpr(c, ref, chosen) / ref_dpr
    taken = dpr(ref, c)
    rounds = c['hp'] / taken if taken > 0 else 1e6
    ref_rounds = ref['hp'] / ref_dpr
    dfn = rounds / ref_rounds
    raw = math.sqrt(off * dfn)
    return {'el': round_el(raw), 'raw': raw, 'offense': off, 'defense': dfn, 'routine': label, 'reason': '',
            'uncounted': uncounted(m, c, chosen)}


def uncounted(m, c, chosen):
    """What the stat block has that the damage model does not count, for the GM to judge."""
    notes = ' '.join(m.get(k, '') or '' for k in ('notes', 'powers'))
    out = []
    special = [a['name'] for a in c['attacks'] if not a['dmg'].damaging and not UNARMED.search(a['name'])]
    if special:
        out.append('special attacks (%s)' % ', '.join(special))
    if re.search(r'immune|invulnerable|bounce off|only (?:be )?(?:harmed|damaged|hurt|affected)', notes, re.I):
        out.append('immunities')
    if re.search(r'regenerat', notes, re.I):
        out.append('regeneration')
    if any(re.search(r'poison|venom', a['dmg'].text, re.I) for a in c['attacks']):
        out.append('poison or venom')
    if any(a['area'] for a in chosen):
        out.append('area damage to more than one target')
    powers = m.get('powers', '') or ''
    if re.search(r'\d+%|\bspells?\b|superpower|sorcery|magic|psychic', powers, re.I) and not re.search(
            r'\brarely\b|^none', powers, re.I):
        out.append('powers')
    return out


def round_el(raw):
    """EL steps: 0.5 below 5 (minimum 0.5), whole numbers from 5 up."""
    if raw < 5:
        return max(0.5, round(raw * 2) / 2)
    return float(round(raw))


def el_label(el):
    return ('%g' % el) if el is not None else ''


def describe(r):
    text = ('EL %s: a fair fight for about %s starting Normal-level PC%s. Offense %.1fx and toughness %.1fx a '
            'reference PC (unrounded EL %.2f). Attacks per round: %s.') % (
        el_label(r['el']), el_label(r['el']), '' if r['el'] == 1 else 's', r['offense'], r['defense'], r['raw'],
        r['routine'])
    if r.get('uncounted'):
        text += ' Not counted: %s.' % '; '.join(r['uncounted'])
    return text


def party_budget(pcs, difficulty='standard'):
    """pcs: list of power levels ('normal', 'heroic', ...) or numbers. Returns the total EL budget."""
    total = sum(POWER_LEVEL_EL.get(p, 1.0) if isinstance(p, str) else float(p) for p in pcs)
    return total * DIFFICULTY[difficulty]
