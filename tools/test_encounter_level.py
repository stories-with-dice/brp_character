"""Tests for encounter_level.py. Run: python3 -m unittest discover -s tools"""
import os
import sys
import unittest

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import encounter_level as elm  # noqa: E402


def creature(**kw):
    base = {'name': 'Test', 'hp': 12, 'armor': 2, 'damageBonus': 'None', 'characteristics': {'SIZ': 13},
            'skills': 'Dodge 35%', 'notes': '', 'powers': '',
            'attacks': [{'name': 'Broadsword', 'pct': 60, 'damage': '1D8+1 (bleeding)'}]}
    base.update(kw)
    return base


class EncounterLevelTest(unittest.TestCase):
    def test_reference_pc_is_el_1(self):
        r = elm.rate(creature(attacks=[{'name': 'Broadsword', 'pct': 60, 'damage': '1D8+1 (bleeding)'}],
                              skills='Dodge 35%'))
        self.assertAlmostEqual(r['raw'], 1.0, places=6)
        self.assertEqual(r['el'], 1.0)

    def test_armor_above_weapon_maximum_leaves_only_criticals(self):
        ref = elm._ref()
        tank = elm.combatant(creature(armor=10))
        ref_atk = ref['attacks'][0]
        normal, special, crit = elm.outcome_damage(ref_atk, tank['armor'], tank['hp'])
        self.assertEqual(normal, 0.0)
        self.assertEqual(special, 0.0)         # bleeding needs a wound first
        self.assertEqual(crit, 9.0)            # 1D8+1 at maximum, armor ignored

    def test_more_armor_and_hp_raise_el(self):
        weak = elm.rate(creature(hp=6, armor=0))['raw']
        strong = elm.rate(creature(hp=24, armor=6))['raw']
        self.assertLess(weak, 1)
        self.assertGreater(strong, 2)

    def test_half_damage_modifier(self):
        d = elm.Damage('1D6+1 /2dm (bleeding)', elm.parse_db('+2D6'))
        self.assertEqual(d.db, [(1, 6, 1)])
        self.assertEqual(elm.halve_db(elm.parse_db('+1D4')), [(1, 2, 1)])
        self.assertEqual(elm.halve_db(elm.parse_db('+3D6')), [(1, 6, 1), (1, 3, 1)])

    def test_matrix_success_against_failed_defense(self):
        # attack 100% (95% cap): 5% crit, 15% special, 75% success; defense 0%
        e = elm.expected_hit(100, 0, normal=1.0, special=2.0, crit=3.0)
        self.assertAlmostEqual(e, 0.05 * 3 + 0.15 * 2 + 0.75 * 1)

    def test_attacks_per_round_from_notes(self):
        c = elm.combatant(creature(
            notes='In either form, a werewolf can make one bite attack and two claw attacks each combat round.',
            attacks=[{'name': 'Bite', 'pct': 50, 'damage': '1D8'}, {'name': 'Claw', 'pct': 50, 'damage': '1D6'}]))
        elm.score_attacks(c, elm._ref())
        chosen, label = elm.routine(c)
        self.assertEqual(label, 'Bite, Claw, Claw')

    def test_either_or_takes_the_larger_option(self):
        c = elm.combatant(creature(
            notes='Bears can attack twice in a round, using either two separate claw attacks or one claw and one '
                  'bite attack.',
            attacks=[{'name': 'Bite', 'pct': 25, 'damage': '1D10'}, {'name': 'Claw', 'pct': 25, 'damage': '1D6'}]))
        elm.score_attacks(c, elm._ref())
        self.assertEqual(elm.routine(c)[1], 'Claw, Claw')

    def test_no_hit_points_is_unrated(self):
        self.assertIsNone(elm.rate(creature(hp=None))['el'])

    def test_rounding(self):
        self.assertEqual(elm.round_el(0.1), 0.5)
        self.assertEqual(elm.round_el(1.26), 1.5)
        self.assertEqual(elm.round_el(4.74), 4.5)
        self.assertEqual(elm.round_el(6.6), 7.0)

    def test_party_budget(self):
        self.assertEqual(elm.party_budget(['normal'] * 4), 4.0)
        self.assertEqual(elm.party_budget(['heroic'] * 4, 'hard'), 7.5)
        self.assertEqual(elm.party_budget(['epic'] * 3, 'easy'), 3.0)


if __name__ == '__main__':
    unittest.main()
