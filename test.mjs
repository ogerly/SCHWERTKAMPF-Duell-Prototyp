// test.mjs — Smoke-Tests combat-engine.js (node test.mjs). Keine Randomness in Asserts.
import { T, WEAPONS, createFight, resetFight, attack, block, tick, tickFight, poseOf } from './combat-engine.js';

let n = 0;
function ok(cond, name) { n++; if (!cond) { console.error('FAIL:', name); process.exitCode = 1 } else console.log('ok:', name) }

const events = [];
const fight = createFight({ diff: 5 });
fight.on = (ev, d) => events.push([ev, d]);

// 1. Defaults
ok(fight.pl.hp === 100 && fight.en.hp === 100, 'HP 100');
ok(fight.pl.idle && fight.en.idle, 'beide idle');

// 2. Angriff -> wind -> strike -> Treffer (Verteidiger idle)
attack(fight, fight.pl, 0);
ok(fight.pl.st === 'wind', 'Spieler holt aus');
tick(fight, fight.pl, fight.en, T.wind * fight.pl.wp.wind + 1);
ok(fight.pl.st === 'strike', 'Schlag löst aus');
const hpBefore = 100;
tick(fight, fight.pl, fight.en, T.strike + 1);
ok(fight.en.hp === hpBefore - WEAPONS.Kurzschwert.dmg, 'Schaden angerechnet');
ok(events.some(e => e[0] === 'hit'), 'hit-Event');

// 3. Guard blockt (t >= raise, gleiche Zone)
resetFight(fight); events.length = 0;
block(fight, fight.en, 1);
fight.en.t = T.raise + T.parry + 50; // plain block (kein Parade-Fenster)
attack(fight, fight.pl, 1);
tick(fight, fight.pl, fight.en, 5000);
ok(fight.en.hp === 100, 'kein Schaden bei Block');
ok(fight.pl.st === 'stagger', 'Angreifer taumelt');
ok(events.some(e => e[0] === 'block'), 'block-Event');

// 4. Tod -> over + end
resetFight(fight); events.length = 0;
fight.en.hp = 5;
attack(fight, fight.pl, 0);
tick(fight, fight.pl, fight.en, 5000);
ok(fight.over && fight.win, 'Sieg bei HP 0');
ok(events.some(e => e[0] === 'end'), 'end-Event');

// 5. tickFight-Loop 600 Ticks ohne Crash (KI mit Randomness — nur Stabilität)
resetFight(fight);
const f2 = createFight({ diff: 9 });
for (let i = 0; i < 600; i++) {
  if (i % 30 === 0 && !f2.over) attack(f2, f2.pl, i % 2);
  tickFight(f2, 16);
  for (const f of [f2.pl, f2.en]) if (!['idle','wind','strike','guard','rec','stagger'].includes(f.st)) throw new Error('illegaler State ' + f.st);
}
ok(true, '600 Ticks stabil');

// 6. reset + poseOf
resetFight(f2);
ok(f2.pl.hp === 100 && f2.pl.idle && !f2.over, 'reset ok');
const IDLE_TAB = { idle: { x: 1, y: 2, a: 3 } };
ok(JSON.stringify(poseOf(IDLE_TAB, f2.pl)) === JSON.stringify({ x: 1, y: 2, a: 3 }), 'poseOf idle');

console.log(n + ' Checks durch, exit ' + (process.exitCode || 0));
