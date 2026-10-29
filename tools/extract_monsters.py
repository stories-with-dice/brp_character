#!/usr/bin/env python3
"""Extract BRP creatures and NPCs from the rulebook PDFs, rate each one with an
Encounter Level (EL), and write an RPG Keeper content pack.

Sources (both PDFs are in the repo root and are gitignored):
  - Basic Roleplaying - Universal Game Engine v1.02.pdf  (core book, Chapter 11)
  - Basic Roleplaying Creatures_v1_00.pdf                (Creatures book)

The parser reads text spans with their font and position (PyMuPDF), because the
plain text order of a two-column page mixes up the stat blocks of two creatures.
The Encounter Level model is in encounter_level.py; docs/encounter-level.md
explains it.

Usage:
  python3 tools/extract_monsters.py                 # writes build/brp-monsters-pack.json
  python3 tools/extract_monsters.py --report        # also prints every monster with its EL
  python3 tools/extract_monsters.py --duplicates keep-both

Needs PyMuPDF: pip install -r tools/requirements.txt
"""
import argparse
import datetime
import json
import math
import os
import re
import sys

import pymupdf

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import encounter_level as elm  # noqa: E402

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CORE_PDF = os.path.join(ROOT, 'Basic Roleplaying - Universal Game Engine v1.02.pdf')
CREATURES_PDF = os.path.join(ROOT, 'Basic Roleplaying Creatures_v1_00.pdf')
DEFAULT_OUT = os.path.join(ROOT, 'build', 'brp-monsters-pack.json')

CHARS = ['STR', 'CON', 'SIZ', 'INT', 'POW', 'DEX', 'CHA']
DASHES = '–—‒−'


# ---------------------------------------------------------------- PDF lines

class Line:
    """One PyMuPDF line: its spans joined, with the font of the first span."""
    __slots__ = ('page', 'x', 'y', 'x1', 'y1', 'font', 'size', 'text', 'spans', 'col')

    def __init__(self, page, bbox, spans, mid):
        self.page = page
        self.x, self.y, self.x1, self.y1 = bbox
        self.spans = spans
        self.font = spans[0]['font']
        self.size = round(spans[0]['size'], 1)
        self.text = clean(' '.join(s['text'].strip() for s in spans if s['text'].strip()))
        self.col = 0 if self.x < mid else 1

    def __repr__(self):
        return 'L(p%d c%d %d,%d %s %s %r)' % (self.page, self.col, self.x, self.y, self.font, self.size, self.text)


def clean(s):
    s = s.replace('­', '').replace('’', "'").replace('ﬁ', 'fi').replace('ﬂ', 'fl')
    return re.sub(r'\s+', ' ', s).strip()


def page_lines(doc, pno):
    page = doc[pno]
    mid = page.rect.width / 2
    out = []
    for b in page.get_text('dict')['blocks']:
        for l in b.get('lines', []):
            spans = [s for s in l['spans'] if s['text'].strip()]
            # split a line at wide gaps: table cells ("Bite", "50%") share one PDF line
            groups = []
            for s in spans:
                if groups and s['bbox'][0] - groups[-1][-1]['bbox'][2] < 12:
                    groups[-1].append(s)
                else:
                    groups.append([s])
            for g in groups:
                bbox = (g[0]['bbox'][0], min(s['bbox'][1] for s in g), g[-1]['bbox'][2], max(s['bbox'][3] for s in g))
                out.append(Line(pno + 1, bbox, g, mid))
    return out


def parse_avg(s):
    """'10–11' -> 10, '25' -> 25, '25w' -> 25, '—' -> None.

    The book prints an average that ends in a half point as a range ("10–11");
    a creature stat is a whole number, so it takes the lower value."""
    s = s.strip()
    for d in DASHES:
        s = s.replace(d, '-')
    m = re.match(r'^(\d+(?:\.\d+)?)\s*(?:-\s*(\d+(?:\.\d+)?))?', s)
    if not m:
        return None
    a = float(m.group(1))
    if m.group(2):
        a = (a + float(m.group(2))) / 2
    return math.floor(a)


def parse_armor(s):
    """'5-pt. hide' -> (5, 'hide'); 'None (may wear armor)' -> (0, 'may wear armor')."""
    s = clean(s)
    m = re.match(r'^(\d+)\s*(?:-|\s)?\s*(?:pts?\.?|points?)?\s*(.*)$', s)
    if m:
        note = m.group(2).strip(' ,;')
        note = re.sub(r'^\((.*)\)$', r'\1', note)
        return int(m.group(1)), note
    note = re.sub(r'^(None|—|-)\s*', '', s).strip()
    note = re.sub(r'^\((.*)\)$', r'\1', note)
    return 0, note


def fmt_num(v):
    if v is None:
        return None
    return int(v) if float(v) == int(v) else v


# ---------------------------------------------------------- Creatures book

CB_HEAD_FONT = 'Almaq-Refined'          # 16 pt: creature name, 10 pt: stat labels
CB_VARIANT_FONT = 'AGaramondPro-Bold'   # 12 pt: subtype name ("Kraken, Small")
CB_FIRST_PAGE, CB_LAST_PAGE = 8, 153    # Natural Animals .. Viking (1-based PDF pages)
DERIVED = ['MOVE', 'HIT POINTS', 'DAMAGE', 'MODIFIER', 'DAMAGE MODIFIER', 'ARMOR']
CB_LABELS = set(CHARS + DERIVED + ['ATTACK', 'ATTACKS', '%', 'DAMAGE MODIFIER'])


def is_cb_label(l, text=None):
    return l.font == CB_HEAD_FONT and l.size < 12 and (text is None or l.text == text)


def cb_parse(doc):
    """Return a list of raw creature dicts from the Creatures book."""
    stream = []   # headings, stat boxes, attack tables, text lines in reading order
    for pno in range(CB_FIRST_PAGE - 1, CB_LAST_PAGE):
        lines = page_lines(doc, pno)
        boxes = cb_boxes(lines)
        tables = cb_attack_tables(lines)
        used = set()
        for b in boxes:
            used |= b.pop('_used')
        for t in tables:
            used |= t.pop('_used')
        items = []
        for l in lines:
            if id(l) in used or (l.font == 'BoucherieBlock'):
                continue
            if l.font == CB_HEAD_FONT and l.size >= 15:
                items.append((l.col, l.y, 'head', l))
            elif (l.font == CB_HEAD_FONT and l.text not in CB_LABELS and l.text == l.text.upper()
                  and len(l.text) > 4):
                items.append((l.col, l.y, 'variant', l))      # "DARKNESS ELEMENTAL", "GOLEM, IRON"
            elif l.font == CB_VARIANT_FONT and l.size >= 11.5:
                items.append((l.col, l.y, 'variant', l))
            elif (l.font == 'Roboto-Bold' and not l.text.endswith(':') and len(l.text) > 3
                  and l.text == l.text.upper() and re.search(r'[A-Z]{3}', l.text)):
                items.append((l.col, l.y, 'variant', l))      # "DARKNESS ELEMENTAL"
            elif l.font == 'BoucherieBlock-Bold' and l.size < 12:
                items.append((l.col, l.y, 'title', l))        # a sidebar title, or "Wolf Form" over a box
            else:
                items.append((l.col, l.y, 'text', l))
        for b in boxes:
            items.append((b['col'], b['y'], 'box', b))
        for t in tables:
            items.append((t['col'], t['y'], 'attacks', t))
        items.sort(key=lambda it: (it[0], it[1]))
        for col, y, kind, obj in items:
            stream.append((pno + 1, col, y, kind, obj))
    return cb_assemble(stream)


def cb_boxes(lines):
    """Find stat boxes: a column of characteristic labels plus the derived block to their right."""
    labels = [l for l in lines if is_cb_label(l) and l.text in CHARS]
    labels.sort(key=lambda l: (l.col, l.y))
    boxes = []
    for l in labels:
        cur = boxes[-1] if boxes else None
        if (l.text == 'STR' or cur is None or cur['col'] != l.col or abs(cur['x'] - l.x) > 10
                or l.y - cur['ylast'] > 25 or l.text in cur['chars']):
            cur = {'col': l.col, 'x': l.x, 'y': l.y, 'ylast': l.y, 'page': l.page, 'chars': {}, 'dice': {},
                   'derived': {}, '_used': set()}
            boxes.append(cur)
        cur['ylast'] = l.y
        cur['_used'].add(id(l))
        vals = sorted([v for v in lines if v.font.startswith('RobotoCondensed') and abs(v.y - l.y) < 5
                       and l.x + 20 < v.x < l.x + 110], key=lambda v: v.x)
        for v in vals:
            cur['_used'].add(id(v))
        if vals:
            dice = vals[0].text if len(vals) > 1 else ''
            cur['dice'][l.text] = dice
            cur['chars'][l.text] = parse_avg(vals[-1].text)
    for b in boxes:
        dl = [l for l in lines if is_cb_label(l) and l.text in DERIVED and l.col == b['col']
              and b['x'] + 70 < l.x < b['x'] + 160 and b['y'] - 12 < l.y < b['ylast'] + 30]
        for l in dl:
            b['_used'].add(id(l))
        anchors = [l for l in dl if l.text != 'MODIFIER']
        vals = [v for v in lines if v.font.startswith('RobotoCondensed') and v.col == b['col']
                and b['x'] + 140 < v.x < b['x'] + 260 and b['y'] - 12 < v.y < b['ylast'] + 40
                and id(v) not in b['_used']]
        for v in sorted(vals, key=lambda v: (v.y, v.x)):
            if not anchors:
                break
            a = min(anchors, key=lambda a: abs((a.y + 5 if a.text == 'DAMAGE' else a.y) - v.y))
            if abs(a.y - v.y) > 16:
                continue
            b['_used'].add(id(v))
            key = 'DAMAGE' if a.text.startswith('DAMAGE') else a.text
            b['derived'][key] = (b['derived'].get(key, '') + ' ' + v.text).strip()
    return boxes


PCT_CELL = r'^(\d+%?|Automatic|[\u2013\u2014-])$'


def cb_attack_tables(lines):
    """Find ATTACK / % / DAMAGE tables and read their rows."""
    tables = []
    for h in [l for l in lines if is_cb_label(l) and l.text in ('ATTACK', 'ATTACKS')]:
        t = {'col': h.col, 'y': h.y, 'page': h.page, 'rows': [], '_used': {id(h)}}
        pct_x, dmg_x = h.x + 55, h.x + 108
        top = h.y
        for l in lines:
            if is_cb_label(l) and abs(l.x - h.x) < 4 and 0 < l.y - h.y < 14:
                t['_used'].add(id(l))       # "(wolf form)" under "ATTACKS"
                top = l.y
            if is_cb_label(l) and l.text in ('%', 'DAMAGE') and abs(l.y - h.y) < 8 and h.x < l.x < h.x + 150:
                t['_used'].add(id(l))
                if l.text == '%':
                    pct_x = l.x - 12
                else:
                    dmg_x = l.x - 4
        cells = [l for l in lines if l.font.startswith('RobotoCondensed') and h.x - 6 < l.x < h.x + 250
                 and h.y < l.y < h.y + 260]
        cells.sort(key=lambda l: (l.y, l.x))
        kept, last_y = [], top
        for c in cells:
            if c.y - last_y > 22:
                break
            last_y = c.y
            kept.append(c)
            t['_used'].add(id(c))
        # explode lines into spans (a name and its % can share a line), then merge spans per cell
        spans = []
        for c in kept:
            for sp in c.spans:
                x, y = sp['bbox'][0], sp['bbox'][1]
                region = 0 if x < pct_x else (1 if x < dmg_x else 2)
                txt = clean(sp['text'])
                m = re.match(r'^(.*?)\s*(\d+%)$', txt) if region == 0 else None
                if m and m.group(1):
                    spans.append([0, x, y, m.group(1)])
                    spans.append([1, x + 1, y, m.group(2)])
                else:
                    spans.append([region, x, y, txt])
        spans.sort(key=lambda c: (c[0], round(c[2]), c[1]))
        cells = []
        for c in spans:
            if cells and cells[-1][0] == c[0] and abs(cells[-1][2] - c[2]) < 2.5:
                cells[-1][3] = (cells[-1][3] + ' ' + c[3]).strip()
            else:
                cells.append(list(c))
        pcts = [c for c in cells if c[0] == 1 and re.match(PCT_CELL, c[3])]
        anchors = sorted(pcts or [c for c in cells if c[0] == 0], key=lambda c: c[2])
        rows = []
        for a in anchors:
            if rows and abs(rows[-1]['y'] - a[2]) < 4:
                continue
            rows.append({'y': a[2], 'name': '', 'pct': '', 'dmg': ''})
        for region, x, y, txt in sorted(cells, key=lambda c: (c[2], c[1])):
            if not rows:
                break
            if region == 0:
                row = min(rows, key=lambda r: abs(r['y'] - y))
                row['name'] = (row['name'] + ' ' + txt).strip()
            elif region == 1 and re.match(PCT_CELL, txt):
                min(rows, key=lambda r: abs(r['y'] - y))['pct'] = txt
            else:
                row = min(rows, key=lambda r: abs(r['y'] - y))
                row['dmg'] = (row['dmg'] + ' ' + txt).strip()
        t['rows'] = [{'name': r['name'], 'pct': parse_pct(r['pct']), 'damage': clean(r['dmg'])} for r in rows]
        tables.append(t)
    return tables


def parse_pct(s):
    if (s or '').strip().lower() == 'automatic':
        return 100
    m = re.search(r'(\d+)', s or '')
    return int(m.group(1)) if m else None


def cb_assemble(stream):
    creatures = []
    head = None        # current creature heading segment
    seg = None         # current text segment (creature or variant)
    title = None       # last small title: (page, col, y, text)
    for page, col, y, kind, obj in stream:
        if kind == 'head':
            head = {'name': obj.text, 'page': page, 'text': [], 'boxes': [], 'variants': []}
            creatures.append(head)
            seg = head
        elif kind == 'variant':
            if head is None:
                continue
            v = {'name': obj.text, 'page': page, 'text': [], 'boxes': [], 'parent': head}
            head['variants'].append(v)
            seg = v
        elif kind == 'title':
            title = (page, col, y, obj.text)
        elif kind == 'box':
            if seg is not None and obj['chars']:
                obj['attacks'] = []
                if title and title[:2] == (page, col) and 0 < y - title[2] < 40:
                    obj['label'] = title[3]
                seg['boxes'].append(obj)
        elif kind == 'attacks':
            target = seg
            # an attack table belongs to the last stat box seen in its segment, or the parent's
            while target is not None and not target['boxes']:
                target = target.get('parent')
            if target is not None:
                # tables follow their boxes in order: box, table, box, table or box, box, table, table
                box = next((b for b in target['boxes'] if not b['attacks']), target['boxes'][-1])
                box['attacks'].extend(obj['rows'])
        elif kind == 'text' and seg is not None:
            seg['text'].append(obj)
    out = []
    for c in creatures:
        segs = [c] + c['variants']
        for s in segs:
            for i, box in enumerate(s['boxes']):
                if box.get('label'):
                    name = '%s, %s' % (titlecase(s['name']), box['label'])
                elif len(s['boxes']) == 1:
                    name = s['name']
                else:
                    name = '%s (%d)' % (s['name'], i + 1)
                out.append(cb_creature(name, s, box))
    return out


def text_sections(lines, section_fonts=('Roboto', 'AGaramondPro')):
    """Split segment text lines into description and labelled sections (Notes, Skills, Powers…)."""
    desc, secs, cur = [], {}, None
    done = set()
    for l in lines:
        t = l.text
        if cur in done:
            cur = None
        m = re.match(r'^(Notes|Skills|Powers|Weaknesses|Attacks):\s*(.*)$', t)
        if l.font.endswith('Bold') and m:
            cur = m.group(1)
            secs[cur] = m.group(2)
            continue
        if cur is None:
            if l.font.startswith('AGaramondPro') and l.size < 11:
                desc.append(t)
        elif l.font.startswith(section_fonts) and not l.font.startswith('RobotoCondensed'):
            if l.size >= 10.5 and l.font.startswith('AGaramondPro-Bold'):
                cur = None
                continue
            secs[cur] = (secs[cur] + ' ' + t).strip()
            if cur == 'Skills' and t.endswith('.'):
                done.add(cur)
    return join_hyphens(' '.join(desc)), {k: join_hyphens(v) for k, v in secs.items()}


def join_hyphens(s):
    return re.sub(r'(\w)- (\w)', r'\1\2', s).strip()


def cb_creature(name, seg, box):
    parent = seg.get('parent')
    desc, secs = text_sections(seg['text'], ('Roboto',))
    if parent is not None:
        pdesc, psecs = text_sections(parent['text'], ('Roboto',))
        desc = desc or pdesc
        for k, v in psecs.items():
            secs.setdefault(k, v)
    d = box['derived']
    armor, armor_note = parse_armor(d.get('ARMOR', ''))
    return {
        'name': titlecase(name),
        'book': 'Creatures',
        'page': box['page'],
        'desc': desc,
        'characteristics': {k: fmt_num(v) for k, v in box['chars'].items() if v is not None},
        'dice': box['dice'],
        'hp': parse_avg(d.get('HIT POINTS', '') or ''),
        'move': d.get('MOVE', ''),
        'damageBonus': clean_db(d.get('DAMAGE', '')),
        'armor': armor,
        'armorNote': armor_note,
        'attacks': box['attacks'],
        'skills': secs.get('Skills', ''),
        'notes': secs.get('Notes', ''),
        'powers': secs.get('Powers', ''),
    }


def clean_db(s):
    s = clean(s)
    for d in DASHES:
        s = s.replace(d, '-')
    if not s or s.lower().startswith('none') or s in ('-', '0'):
        return 'None'
    return s.replace('-', '–') if s.startswith('-') else s


SMALL_WORDS = {'or', 'of', 'and', 'the', 'in', 'a', 'an'}


def titlecase(s):
    if s != s.upper():
        return s
    words = s.lower().split(' ')
    return ' '.join(w if (i and w in SMALL_WORDS) else w[:1].upper() + w[1:] for i, w in enumerate(words)).replace(
        '-Man', '-man')


# --------------------------------------------------------------- core book

CORE_TABLE_PAGE = 228                    # Natural Creatures table
CORE_FIRST_PAGE, CORE_LAST_PAGE = 229, 250
CORE_HEAD_FONT = 'AGaramondPro-Bold'     # 10 pt creature name
CORE_LABEL_FONT = 'FuturaPTCond-Medium'


def core_parse(doc):
    return core_table(doc) + core_blocks(doc)


def core_table(doc):
    lines = page_lines(doc, CORE_TABLE_PAGE - 1)
    hdr = next(l for l in lines if l.text == 'Name' and l.font == CORE_LABEL_FONT)
    cols = sorted([(l.x, l.text) for l in lines if abs(l.y - hdr.y) < 3 and l.font == CORE_LABEL_FONT])
    names = [l for l in lines if l.font == CORE_LABEL_FONT and l.y > hdr.y + 5 and abs(l.x - hdr.x) < 4]
    rows = []
    for l in names:
        if rows and l.y - rows[-1]['ylast'] < 13:
            rows[-1]['name'] += ' ' + l.text
            rows[-1]['ylast'] = l.y
        else:
            rows.append({'name': l.text, 'y': l.y, 'ylast': l.y, 'cells': {}})
    for r in rows:
        r['cy'] = (r['y'] + r['ylast']) / 2
    body = [l for l in lines if l.font.startswith('FuturaPTCond-Book') and l.y > hdr.y + 5]
    for l in sorted(body, key=lambda l: (l.y, l.x)):
        col = max([c for c in cols if c[0] <= l.x + 3], key=lambda c: c[0])[1]
        r = min(rows, key=lambda r: abs(r['cy'] - (l.y + 0.5)))
        r['cells'].setdefault(col, []).append(l.text)
    out = []
    for r in rows:
        c = r['cells']
        chars = {}
        for k in ['STR', 'CON', 'SIZ', 'POW', 'DEX']:
            v = c.get(k, [])
            if v:
                chars[k] = fmt_num(parse_avg(v[-1]))
        armor, note = parse_armor(' '.join(c.get('Armor', [])))
        atk_text = ' '.join(c.get('Attack and %, Damage', []))
        out.append({
            'name': r['name'].replace('Eagle.', 'Eagle,'),
            'book': 'Core',
            'page': CORE_TABLE_PAGE - 5,
            'desc': '',
            'characteristics': chars,
            'hp': parse_avg(' '.join(c.get('HP', []))),
            'move': ', '.join(c.get('MOV', [])),
            'damageBonus': clean_db(' '.join(c.get('DM', []))),
            'armor': armor,
            'armorNote': note,
            'attacks': split_attacks(atk_text),
            'skills': join_hyphens(' '.join(c.get('Skills', []))),
            'notes': '',
            'powers': '',
        })
    return out


def split_attacks(text):
    """'Bite 25%, 1D10; Claw 25%, 1D6+dm' -> rows. Also reads one attack per line."""
    rows = []
    for part in re.split(r';\s*|\n', text):
        part = clean(part)
        m = re.match(r'^(.*?)\s+(\d+)%\s*,?\s*(.*)$', part)
        if m:
            rows.append({'name': m.group(1).strip(), 'pct': int(m.group(2)), 'damage': m.group(3).strip()})
        elif part and rows:
            rows[-1]['damage'] = (rows[-1]['damage'] + ' ' + part).strip()
    return rows


def core_blocks(doc):
    stream = []
    for pno in range(CORE_FIRST_PAGE - 1, CORE_LAST_PAGE):
        lines = page_lines(doc, pno)
        for l in lines:
            if 'Boucherie' in l.font:
                continue
            stream.append((l.page, l.col, l.y, l.x, l))
    stream.sort(key=lambda s: (s[0], s[1], s[2], s[3]))
    out, cur = [], None
    i = 0
    items = [s[4] for s in stream]
    while i < len(items):
        l = items[i]
        if l.font == CORE_HEAD_FONT and 9.5 <= l.size < 11 and not l.text.endswith(':'):
            cur = {'name': l.text, 'page': l.page, 'pre': [], 'blocks': []}
            out.append(cur)
            i += 1
            continue
        if cur is None:
            i += 1
            continue
        if l.font == CORE_LABEL_FONT and l.text in CHARS:
            # a header row of characteristic labels; the value rows follow below it
            hdr = [x for x in items if x.page == l.page and x.col == l.col and abs(x.y - l.y) < 3
                   and x.font == CORE_LABEL_FONT]
            vals = [x for x in items if x.page == l.page and x.col == l.col and l.y + 5 < x.y < l.y + 34
                    and x.font.startswith('FuturaPTCond-Book')]
            vrows = sorted({round(v.y) for v in vals})
            block = {'page': l.page, 'chars': {}, 'dice': {}, 'labels': [], 'attacks': [], 'skills': '',
                     'powers': '', 'notes': ''}
            for h in hdr:
                cell = sorted([v for v in vals if abs(v.x - h.x) < 9], key=lambda v: v.y)
                if not cell:
                    continue
                block['chars'][h.text] = parse_avg(cell[-1].text)
                if len(cell) > 1:
                    block['dice'][h.text] = cell[0].text
            cur['blocks'].append(block)
            skip = {id(x) for x in hdr + vals}
            i += 1
            while i < len(items) and id(items[i]) in skip:
                i += 1
            continue
        if cur['blocks']:
            cur['blocks'][-1]['labels'].append(l)
        else:
            cur['pre'].append(l)
        i += 1
    return [c for c in (core_creature(c) for c in out) for c in c]


def core_creature(c):
    res = []
    desc = join_hyphens(' '.join(l.text for l in c['pre'] if l.font.startswith('AGaramondPro-Regular')))
    for n, b in enumerate(c['blocks']):
        fields, sec, attacks = {}, None, []
        for l in b['labels']:
            t = re.sub(r'^M \| ?|^M$', '', l.text).strip()
            if l.font.startswith('TemplarsCipher') and not t:
                continue
            for m in re.finditer(r'(Move|Hit Points|Damage Modifier|Armor):\s*\|?\s*([^|]*?)(?=\s*\|?\s*(?:Move|Hit Points|Damage Modifier|Armor):|$)', t):
                fields[m.group(1)] = m.group(2).strip()
            if re.match(r'^(Move|Hit Points|Damage Modifier|Armor):', t):
                sec = None
                continue
            m = re.match(r'^(Attacks|Skills|Powers|Notes|Weaknesses):\s*\|?\s*(.*)$', t)
            if m and l.font.startswith('AGaramondPro-Bold'):
                sec = m.group(1)
                if sec != 'Attacks':
                    b[sec.lower()] = m.group(2)
                continue
            if sec == 'Attacks':
                if re.search(r'\d+%', t):
                    attacks.append(t)
                elif attacks:
                    attacks[-1] += ' ' + t
                else:
                    sec = None
            elif sec in ('Skills', 'Powers', 'Notes', 'Weaknesses'):
                b[sec.lower()] = (b.get(sec.lower(), '') + ' ' + t).strip()
        armor, note = parse_armor(fields.get('Armor', ''))
        name = c['name'] if len(c['blocks']) == 1 else '%s (%d)' % (c['name'], n + 1)
        res.append({
            'name': name,
            'book': 'Core',
            'page': b['page'] - 5,
            'desc': desc,
            'characteristics': {k: fmt_num(v) for k, v in b['chars'].items() if v is not None},
            'dice': b['dice'],
            'hp': parse_avg(fields.get('Hit Points', '') or ''),
            'move': fields.get('Move', ''),
            'damageBonus': clean_db(fields.get('Damage Modifier', '')),
            'armor': armor,
            'armorNote': note,
            'attacks': split_attacks('\n'.join(attacks)),
            'skills': join_hyphens(b.get('skills', '')),
            'notes': join_hyphens(b.get('notes', '')),
            'powers': join_hyphens(b.get('powers', '')),
        })
    return res


# ------------------------------------------------------------------- pack

# Creatures book names that RPG Keeper's bundled BRP Bestiary (data/seed-brp.json) spells another way.
# The pack uses Keeper's name, so "Replace the items I already have" swaps the old entry.
KEEPER_NAMES = {
    'Snake, Constrictor': 'Snake (Constrictor)',
    'Snake, Venomous': 'Snake (Venomous)',
    'Squid, Giant': 'Squid (Giant)',
    'Air Elemental': 'Elemental, Air',
    'Earth Elemental': 'Elemental, Earth',
    'Fire Elemental': 'Elemental, Fire',
    'Water Elemental': 'Elemental, Water',
}

# Core book names whose Creatures book entry has another name.
CORE_ALIASES = {
    'Werewolf (1)': 'Werewolf, Hybrid Form',
    'Werewolf (2)': 'Werewolf, Wolf Form',
    'Priest': 'Priest, Warrior',
}

def slug(s):
    return re.sub(r'[^a-z0-9]+', '-', s.lower()).strip('-')


def keeper_damage(s):
    """Write half the damage modifier as RPG Keeper's brpResolveDb() reads it: '+½dm'."""
    s = re.sub(r'\+\s*1\s*/\s*2\s*dm', '+\u00bddm', s)
    return re.sub(r'\s+\)', ')', s)


def attacks_text(attacks):
    return '; '.join('%s %s%%, %s' % (a['name'], a['pct'] if a['pct'] is not None else '?',
                                      keeper_damage(a['damage'])) for a in attacks)


def to_keeper(m, rating):
    """A BRP monster def in the shape of RPG Keeper's data/seed-brp.json, plus hd/hdNum = EL."""
    abilities = []
    el = rating['el']
    if el is not None:
        abilities.append({'name': 'Encounter Level', 'text': elm.describe(rating)})
    for key, label in (('notes', 'Notes'), ('powers', 'Powers')):
        if m.get(key):
            abilities.append({'name': label, 'text': m[key]})
    src = '%s p.%d' % ('BRP Creatures' if m['book'] == 'Creatures' else 'BRP core', m['page'])
    desc = m['desc'] or ''
    desc = (desc + ' ' if desc else '') + '(' + src + ')'
    name = KEEPER_NAMES.get(m['name'], m['name'])
    out = {
        'name': name,
        'ref': 'brpbook:monster:' + slug(name),
        'source': 'brp',
        'desc': desc,
        'characteristics': m['characteristics'],
        'hp': fmt_num(m['hp']) if m['hp'] is not None else 0,
        'move': m['move'],
        'damageBonus': m['damageBonus'],
        'armor': m['armor'],
        'armorNote': m['armorNote'],
        'attacksText': attacks_text(m['attacks']),
        'skillsText': m['skills'].rstrip('.'),
        'abilities': abilities,
        'encounterLevel': el,
    }
    if el is not None:
        # RPG Keeper's Bestiary HD filter and Combat's "Populate by HD" read hd/hdNum.
        out['hd'] = elm.el_label(el)
        out['hdNum'] = el
    return out


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('--core', default=CORE_PDF)
    ap.add_argument('--creatures', default=CREATURES_PDF)
    ap.add_argument('--out', default=DEFAULT_OUT)
    ap.add_argument('--duplicates', choices=['prefer-creatures', 'keep-both'], default='prefer-creatures',
                    help='a creature in both books: keep only the Creatures book version (default), '
                         'or keep both, with " (core)" after the core book name')
    ap.add_argument('--report', action='store_true', help='print every monster with its EL, sorted by EL')
    ap.add_argument('--raw-json', help='also write the parsed stat blocks (before EL) to this file')
    args = ap.parse_args()

    creatures = cb_parse(pymupdf.open(args.creatures))
    core = core_parse(pymupdf.open(args.core))
    if args.raw_json:
        with open(args.raw_json, 'w') as f:
            json.dump({'creatures': creatures, 'core': core}, f, indent=1, ensure_ascii=False)

    names = {elm.norm_name(m['name']) for m in creatures}
    monsters = list(creatures)
    for m in core:
        if elm.norm_name(CORE_ALIASES.get(m['name'], m['name'])) in names:
            if args.duplicates == 'keep-both':
                m = dict(m, name=m['name'] + ' (core)')
            else:
                continue
        monsters.append(m)

    pack_monsters, rows = [], []
    for m in monsters:
        rating = elm.rate(m)
        pack_monsters.append(to_keeper(m, rating))
        rows.append((m, rating))

    pack = {
        'pack': {'name': 'Basic Roleplaying creatures with Encounter Level (from your PDFs)', 'system': 'brp',
                 'version': 1, 'createdAt': datetime.datetime.now(datetime.timezone.utc).isoformat()},
        'monsters': pack_monsters,
    }
    os.makedirs(os.path.dirname(os.path.abspath(args.out)), exist_ok=True)
    with open(args.out, 'w') as f:
        json.dump(pack, f, indent=1, ensure_ascii=False)

    unrated = [m['name'] for m, r in rows if r['el'] is None]
    print('Creatures book: %d stat blocks; core book: %d; pack: %d monsters (%d without an EL)'
          % (len(creatures), len(core), len(pack_monsters), len(unrated)))
    print('Wrote ' + os.path.relpath(args.out))
    if unrated:
        print('No EL (no hit points or no damaging attack): ' + ', '.join(unrated))
    if args.report:
        print()
        print('%-34s %-9s %5s %6s %6s %6s  %s' % ('Name', 'Book', 'EL', 'raw', 'off', 'def', 'attacks/round'))
        for m, r in sorted(rows, key=lambda x: (x[1]['raw'] or 0)):
            print('%-34s %-9s %5s %6s %6s %6s  %s' % (
                m['name'][:34], '%s %d' % (m['book'], m['page']),
                elm.el_label(r['el']) if r['el'] is not None else '-',
                '%.2f' % r['raw'] if r['raw'] is not None else '-',
                '%.2f' % r['offense'] if r['offense'] is not None else '-',
                '%.2f' % r['defense'] if r['defense'] is not None else '-',
                r.get('routine', '')))


if __name__ == '__main__':
    main()
