// combat-engine.js — pure Kampflogik (DOM-frei, M1 aus Duell-Prototyp).
// Keine Canvas-, DOM- oder Audio-Zugriffe. SFX/FX als injizierbare Callbacks.
// Läuft in Browser (ESM) und Node (Test). Verhalten = Prototyp 1:1.
const T = { wind: 260, strike: 110, recover: 300, guard: 520, guardRec: 240, stagger: 650, raise: 50, parry: 160 };

const WEAPONS = { // wind = Tempo-Faktor (höher = langsamer), dmg = Schaden
  Kurzschwert:   { len: 84,  w: 5, blade: '#c9d3e6', guard: '#d8a02a', grip: '#6b3a1e', dmg: 10, wind: 1.0 },
  Langschwert:   { len: 105, w: 6, blade: '#e2e9f7', guard: '#d8a02a', grip: '#5a2d18', dmg: 13, wind: 1.2 },
  Rostklinge:    { len: 92,  w: 5, blade: '#a0674a', guard: '#666',    grip: '#333',    dmg: 9,  wind: 0.9 },
  Flammenschwert:{ len: 100, w: 6, blade: '#ff8a1f', guard: '#ffd23f', grip: '#4a1a1a', dmg: 15, wind: 1.35 }
};

const DIFF_NAMES = ['REKRUT','REKRUT','REKRUT','SÖLDNER','SÖLDNER','SÖLDNER','VETERAN','VETERAN','MEISTER','MEISTER'];

const lerp = (a, b, t) => a + (b - a) * t;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const ease = t => t * t * (3 - 2 * t);
const mix = (a, b, t) => ({ x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t), a: lerp(a.a, b.a, t) });

function poseOf(tab, f) {
  const t = f.dur ? clamp(f.t / f.dur, 0, 1) : 0;
  switch (f.st) {
    case 'wind': return mix(tab.idle, tab['w' + f.z], ease(t));
    case 'strike': return mix(tab['w' + f.z], tab['s' + f.z], ease(t));
    case 'guard': return mix(tab.idle, tab['g' + f.z], ease(clamp(f.t / 90, 0, 1)));
    case 'rec': return mix(tab[f.from] || tab.idle, tab.idle, ease(t));
    case 'stagger': return mix(tab.idle, tab.st, ease(clamp(f.t / 120, 0, 1)));
    default: return tab.idle;
  }
}

class Fighter {
  constructor(isEnemy) { this.e = isEnemy; this.wp = WEAPONS.Kurzschwert; this.reset(); }
  reset() { this.hp = 100; this.go('idle', 0, 0); this.flash = 0; this.from = 'idle'; }
  go(st, z, dur) { this.st = st; this.z = z; this.t = 0; this.dur = dur; }
  get idle() { return this.st === 'idle'; }
}

const NOOP_SFX = { swing() {}, block() {}, parry() {}, hit() {}, win() {}, lose() {} };

function createFight({ diff = 5, playerWeapon = 'Kurzschwert', enemyWeapon = 'Langschwert', sfx = NOOP_SFX, onSpark = null } = {}) {
  const fight = {
    pl: new Fighter(false), en: new Fighter(true),
    over: false, win: false, diff,
    msg: '', msgT: 0, shake: 0, hurt: 0, fall: 0, atkId: 0,
    ai: { rt: -1, seen: 0, think: 700, pAtk: [1, 1], pBlk: [1, 1] },
    sfx, onSpark, on: null
  };
  fight.pl.wp = WEAPONS[playerWeapon] ?? WEAPONS.Kurzschwert;
  fight.en.wp = WEAPONS[enemyWeapon] ?? WEAPONS.Langschwert;
  return fight;
}

function resetFight(fight) {
  fight.pl.reset(); fight.en.reset();
  Object.assign(fight, { over: false, win: false, fall: 0, msgT: 0, hurt: 0, atkId: 0 });
  Object.assign(fight.ai, { rt: -1, think: 900, pAtk: [1, 1], pBlk: [1, 1] });
}

const emit = (fight, ev, d) => fight.on && fight.on(ev, d);
const say = (fight, s) => { fight.msg = s; fight.msgT = 700; };
const spark = (fight, x, y, n, c) => fight.onSpark && fight.onSpark(x, y, n, c);

const P = (fight) => { const d = (fight.diff - 1) / 9; return { react: lerp(650, 110, d), acc: lerp(.3, .92, d), aggr: lerp(.35, .85, d), tele: lerp(850, 380, d), smart: lerp(.05, .85, d), think: lerp(900, 320, d) } };

function attack(fight, f, z) {
  if (fight.over || !(f.idle || f.st === 'guard')) return;
  const q = P(fight); f.go('wind', z, (f.e ? q.tele : T.wind) * f.wp.wind);
  if (!f.e) { fight.atkId++; fight.ai.pAtk[z]++; fight.ai.pAtk[1 - z] *= .85 }
  fight.sfx.swing(); emit(fight, 'attack', { by: f.e ? 'enemy' : 'player', zone: z });
}

function block(fight, f, z) {
  if (fight.over || !(f.idle || (f.st === 'guard' && f.z !== z))) return;
  f.go('guard', z, T.guard); if (!f.e) { fight.ai.pBlk[z]++; fight.ai.pBlk[1 - z] *= .85 }
}

function resolve(fight, a, d) { // Schlag trifft: geblockt, pariert oder Treffer
  a.from = 's' + a.z; a.go('strike', a.z, T.strike);
  if (d.st === 'guard' && d.t >= T.raise && d.z === a.z) {
    const perfect = d.t < T.raise + T.parry;
    a.go('stagger', a.z, perfect ? 1150 : T.stagger); say(fight, perfect ? 'PARADE!' : 'GEBLOCKT');
    (perfect ? fight.sfx.parry : fight.sfx.block)(); spark(fight, d.e ? 150 : 200, a.z ? 140 : 90, perfect ? 16 : 9); emit(fight, perfect ? 'parry' : 'block', { by: d.e ? 'enemy' : 'player' });
  } else {
    d.hp = Math.max(0, d.hp - a.wp.dmg); d.flash = 180; fight.shake = 6; fight.sfx.hit(); if (!d.e) fight.hurt = 220;
    if (d.st === 'wind') d.go('stagger', 0, 420); spark(fight, d.e ? 150 : 200, a.z ? 140 : 90, 14, '#ff4b3b'); emit(fight, 'hit', { target: d.e ? 'enemy' : 'player', hp: d.hp });
    if (d.hp <= 0) { fight.over = true; fight.win = d.e; (fight.win ? fight.sfx.win : fight.sfx.lose)(); emit(fight, 'end', { win: fight.win }); }
  }
}

function tick(fight, f, o, dt) {
  f.t += dt; if (f.flash > 0) f.flash -= dt;
  if (f.t < f.dur) return;
  if (f.st === 'wind') resolve(fight, f, o);
  else if (f.st === 'strike') { f.go('rec', f.z, T.recover * f.wp.wind); }
  else if (f.st === 'guard') { f.from = 'g' + f.z; f.go('rec', f.z, T.guardRec); }
  else if (f.st !== 'idle') f.go('idle', 0, 0);
}

function ai(fight, dt) {
  const e = fight.en, p = fight.pl, q = P(fight), AI = fight.ai;
  if (p.st === 'wind' && AI.seen !== fight.atkId) { AI.seen = fight.atkId; AI.rt = q.react * (.8 + Math.random() * .4) }
  if (AI.rt >= 0) {
    AI.rt -= dt;
    if (p.st !== 'wind') AI.rt = -1;
    else if (AI.rt < 0 && (e.idle || e.st === 'guard')) block(fight, e, Math.random() < q.acc ? p.z : 1 - p.z);
  }
  if (!(e.idle || e.st === 'guard') || p.st === 'wind' || fight.over) return;
  AI.think -= dt; if (AI.think > 0) return;
  AI.think = q.think * (.6 + Math.random() * .8);
  const punish = (p.st === 'stagger' || p.st === 'rec') && Math.random() < .4 + q.smart * .6;
  if (punish || (e.idle && Math.random() < q.aggr)) {
    const weak = AI.pBlk[0] < AI.pBlk[1] ? 0 : 1;
    attack(fight, e, Math.random() < q.smart ? weak : (Math.random() < .5 ? 0 : 1));
  } else if (e.idle) block(fight, e, Math.random() < q.smart ? (AI.pAtk[0] > AI.pAtk[1] ? 0 : 1) : (Math.random() < .5 ? 0 : 1));
}

function tickFight(fight, dt) {
  if (!fight.over) { tick(fight, fight.pl, fight.en, dt); tick(fight, fight.en, fight.pl, dt); ai(fight, dt); }
  else { fight.pl.flash -= dt; fight.en.flash -= dt; if (fight.win) fight.fall = Math.min(70, fight.fall + dt * .04) }
  if (fight.msgT > 0) fight.msgT -= dt;
  if (fight.shake > 0) fight.shake = Math.max(0, fight.shake - dt * .03);
  if (fight.hurt > 0) fight.hurt -= dt;
}

export { T, WEAPONS, DIFF_NAMES, lerp, clamp, ease, mix, poseOf, Fighter, createFight, resetFight, attack, block, resolve, tick, ai, tickFight, P };
