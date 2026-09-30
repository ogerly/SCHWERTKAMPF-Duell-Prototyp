// combat-render.js — Canvas-Renderer zum Engine-Modul (M1, Browser only: document/canvas).
// Importiert reine Pose-Mathematik aus combat-engine.js. Verhalten = Prototyp 1:1.
import { poseOf } from './combat-engine.js';

const W = 320, H = 200;

const POSE_PL = { idle:{x:255,y:178,a:-.28}, w0:{x:275,y:122,a:.15}, s0:{x:215,y:165,a:-1.3}, w1:{x:290,y:190,a:1.25}, s1:{x:200,y:190,a:-1},
  g0:{x:200,y:105,a:-1.35}, g1:{x:215,y:120,a:2.85}, st:{x:285,y:195,a:.6} };
const POSE_EN = { idle:{x:122,y:112,a:.25}, w0:{x:135,y:62,a:-.5}, s0:{x:172,y:118,a:2}, w1:{x:105,y:132,a:-1.55}, s1:{x:150,y:140,a:1.5},
  g0:{x:155,y:66,a:1.45}, g1:{x:150,y:118,a:3}, st:{x:100,y:100,a:-1} };

const SKINS = { // Platzhalter-Charaktere; später durch Sprites ersetzen (M2: kampf-posen.png)
  Ritter:   { name: 'RITTER',   skin: '#e0b48a', armor: '#7a86a8', dark: '#454f70', cloth: '#a02828', helm: 1 },
  Skelett:  { name: 'SKELETT',  skin: '#e8e4d0', armor: '#bdb8a0', dark: '#6e6a58', cloth: '#2c2c38', helm: 0 },
  Ork:      { name: 'ORK',      skin: '#5f9a3c', armor: '#6b4a2a', dark: '#3b2814', cloth: '#7a1f1f', helm: 2 }
};

// Pose-Rechtecke [x0,y0,x1,y1] im Legacy-Sheet (M2: neu vermessen für kampf-posen.png → poses.json).
// Reihenfolge: Bereit, Ausholen oben/unten, Angriff oben/unten, Block oben/unten, Ducken, Tod
const CHARS = null; // wird per setChars() gesetzt (Default s. Demo)
const PI = { idle: 0, w0: 1, w1: 2, s0: 3, s1: 4, g0: 5, g1: 6, hit: 7, dead: 8 };
let sheet = null;
let charTable = null;

function setSheet(img) { sheet = img; }
function setChars(table) { charTable = table; }

function keyOut(im, say) { // entfernt ein eingebranntes Schachbrett; Sheets mit echtem Alpha bleiben unberührt
  const w = im.width, h = im.height, c = document.createElement('canvas'); c.width = w; c.height = h;
  const x = c.getContext('2d', { willReadFrequently: true }); x.drawImage(im, 0, 0);
  let d; try { d = x.getImageData(0, 0, w, h) } catch { say && say('LOKALEN SERVER NUTZEN'); return im }
  const p = d.data; if (p[3] < 255) return im;
  const N = w * h, seen = new Uint8Array(N), stk = new Int32Array(N), reg = new Int32Array(N);
  const chk = i => { const r = p[i * 4], g2 = p[i * 4 + 1], b = p[i * 4 + 2]; return Math.min(r, g2, b) >= 200 && Math.max(r, g2, b) - Math.min(r, g2, b) <= 12 };
  for (let s = 0; s < N; s++) {
    if (seen[s] || !chk(s)) continue;
    let sp = 0, n = 0, edge = false; stk[sp++] = s; seen[s] = 1;
    while (sp) {
      const i = stk[--sp], px = i % w, py = (i / w) | 0; reg[n++] = i; if (!px || !py || px === w - 1 || py === h - 1) edge = true;
      for (const j of [px > 0 ? i - 1 : -1, px < w - 1 ? i + 1 : -1, py > 0 ? i - w : -1, py < h - 1 ? i + w : -1]) if (j >= 0 && !seen[j] && chk(j)) { seen[j] = 1; stk[sp++] = j }
    }
    if (n > 200 || edge) for (let k = 0; k < n; k++) p[reg[k] * 4 + 3] = 0;
  }
  for (let pass = 0; pass < 2; pass++) {
    const kill = [];
    for (let i = w; i < N - w; i++) {
      if (!p[i * 4 + 3] || (p[(i - 1) * 4 + 3] && p[(i + 1) * 4 + 3] && p[(i - w) * 4 + 3] && p[(i + w) * 4 + 3])) continue;
      const r = p[i * 4], g2 = p[i * 4 + 1], b = p[i * 4 + 2]; if (r + g2 + b > 420 && Math.max(r, g2, b) - Math.min(r, g2, b) < 40) kill.push(i);
    }
    for (const i of kill) p[i * 4 + 3] = 0;
  }
  x.putImageData(d, 0, 0); return c;
}

function makeBg() {
  const bg = document.createElement('canvas'); bg.width = W; bg.height = H;
  const b = bg.getContext('2d'), cols = ['#2b2145', '#2f2549', '#282040', '#33284d', '#2c2246'];
  b.fillStyle = '#120d22'; b.fillRect(0, 0, W, H);
  for (let y = 0; y < 150; y += 10) for (let x = -((y / 10) % 2) * 16; x < W; x += 32) { b.fillStyle = cols[(x * 7 + y * 13 + 99) % 5]; b.fillRect(x + 1, y + 1, 30, 8) }
  b.fillStyle = '#0b0814'; b.fillRect(0, 0, W, 14); b.fillStyle = '#3a2a20'; b.fillRect(0, 150, W, 50);
  b.fillStyle = '#241812'; for (const y of [153, 159, 168, 179, 192]) b.fillRect(0, y, W, 1);
  for (let i = -8; i <= 8; i++) { b.strokeStyle = '#241812'; b.beginPath(); b.moveTo(160 + i * 12, 150); b.lineTo(160 + i * 55, 200); b.stroke() }
  b.fillStyle = '#555'; b.fillRect(38, 72, 4, 20); b.fillRect(278, 72, 4, 20);
  return bg;
}

function makeFx() {
  return { parts: Array.from({ length: 48 }, () => ({ l: 0, x: 0, y: 0, vx: 0, vy: 0, c: '#fff' })) };
}
function pushSpark(fx, x, y, n, c = '#ffd23f') {
  for (const s of fx.parts) { if (s.l > 0) continue; s.l = 300 + Math.random() * 200; s.x = x; s.y = y; s.vx = (Math.random() - .5) * .12 * n; s.vy = -Math.random() * .09 * n; s.c = c }
}

function sword(g, p, wp, sc) {
  const L = wp.len * sc, w = wp.w * sc;
  g.save(); g.translate(p.x | 0, p.y | 0); g.rotate(p.a);
  g.fillStyle = wp.grip; g.fillRect(-2, 0, 4, 14 * sc);
  g.fillStyle = wp.guard; g.fillRect(-w - 3, -3, 2 * w + 6, 4);
  g.fillStyle = wp.blade; g.fillRect(-w / 2, -L, w, L - 3);
  g.beginPath(); g.moveTo(-w / 2, -L); g.lineTo(0, -L - 9 * sc); g.lineTo(w / 2, -L); g.fill();
  g.fillStyle = 'rgba(255,255,255,.55)'; g.fillRect(-w / 2, -L, 1, L - 3);
  g.restore();
}

function drawSprite(g, fight, now, skinKey) {
  const e = fight.en, rs = charTable[skinKey], st = e.st;
  const k = fight.over && fight.win ? 'dead' : st === 'wind' ? 'w' + e.z : st === 'strike' ? 's' + e.z : st === 'guard' ? 'g' + e.z : st === 'stagger' ? 'hit' : 'idle';
  const r = rs[PI[k]], b = rs[0], sc = 108 / (b[3] - b[1]), dw = (r[2] - r[0]) * sc, dh = (r[3] - r[1]) * sc;
  const bob = k === 'idle' ? Math.sin(now / 320) * 1.5 : 0;
  g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(120, 189, 80, 6);
  if (e.flash > 0) g.filter = 'brightness(3) saturate(0)';
  g.drawImage(sheet, r[0], r[1], r[2] - r[0], r[3] - r[1], 160 - dw / 2, 192 - dh + bob, dw, dh);
  g.filter = 'none';
}

function drawEnemy(g, fight, now, skin) {
  if (sheet && charTable) return drawSprite(g, fight, now, skin);
  const e = fight.en, s = skin, fl = e.flash > 0, C = c => fl ? '#fff' : c, cx = 160;
  const bob = Math.sin(now / 320) * 1.5 + fight.fall;
  g.save(); g.translate(0, bob); if (fight.over && fight.win) g.globalAlpha = 1 - fight.fall / 80;
  g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(cx - 40, 190 - bob, 80, 6);
  g.fillStyle = C(s.dark); g.fillRect(cx - 22, 150, 16, 46); g.fillRect(cx + 6, 150, 16, 46);
  g.fillStyle = C(s.armor); g.fillRect(cx - 30, 80, 60, 64); g.fillStyle = C(s.cloth); g.fillRect(cx - 30, 140, 60, 14);
  g.fillStyle = C(s.dark); g.fillRect(cx - 30, 134, 60, 6); g.fillRect(cx - 42, 78, 16, 20); g.fillRect(cx + 26, 78, 16, 20); g.fillRect(cx + 30, 96, 12, 36);
  g.fillStyle = C(s.skin); g.fillRect(cx - 14, 46, 28, 32); g.fillRect(cx + 29, 130, 14, 12);
  if (s.helm === 1) { g.fillStyle = C(s.armor); g.fillRect(cx - 17, 38, 34, 18); g.fillRect(cx - 2, 52, 4, 14) }
  if (s.helm === 2) { g.fillStyle = C(s.dark); g.fillRect(cx - 16, 40, 32, 10); g.fillRect(cx - 22, 34, 6, 12); g.fillRect(cx + 16, 34, 6, 12) }
  g.fillStyle = C('#150a0a'); g.fillRect(cx - 9, 60, 7, 6); g.fillRect(cx + 2, 60, 7, 6); g.fillRect(cx - 6, 72, 12, 2);
  g.fillStyle = C(e.st === 'wind' ? '#ff3b3b' : '#ff9f3b'); g.fillRect(cx - 7, 62, 3, 3); g.fillRect(cx + 4, 62, 3, 3);
  const p = poseOf(POSE_EN, e);
  g.strokeStyle = C(s.armor); g.lineWidth = 10; g.beginPath(); g.moveTo(cx - 34, 88); g.lineTo(p.x, p.y + 4); g.stroke();
  sword(g, p, e.wp, .85);
  g.fillStyle = C(s.skin); g.fillRect(p.x - 6, p.y - 4, 12, 13); g.fillStyle = 'rgba(0,0,0,.3)'; g.fillRect(p.x - 6, p.y + 2, 12, 1);
  g.restore();
}

function drawPlayer(g, fight, now) {
  const f = fight.pl, p = poseOf(POSE_PL, f), by = f.idle ? Math.sin(now / 400) * 1.5 : 0;
  p.y += by;
  g.fillStyle = '#3a2f6e'; g.beginPath(); g.moveTo(p.x - 8, p.y + 6); g.lineTo(p.x + 10, p.y + 6); g.lineTo(W + 30, H + 30); g.lineTo(p.x + 40, H + 30); g.fill();
  g.fillStyle = '#5a4fa0'; g.fillRect(p.x - 9, p.y + 8, 19, 5);
  sword(g, p, f.wp, 1);
  g.fillStyle = '#e0b48a'; g.fillRect(p.x - 6, p.y - 5, 13, 14); g.fillStyle = '#b98a62'; g.fillRect(p.x - 6, p.y + 1, 13, 1); g.fillRect(p.x - 6, p.y + 5, 13, 1);
}

function drawFrame(g, render, fight, now, dt, skin) {
  g.save(); if (fight.shake > 0) { g.translate((Math.random() - .5) * fight.shake, (Math.random() - .5) * fight.shake) }
  g.drawImage(render.bg, 0, 0);
  for (const x of [40, 280]) { const fl = 2 + (Math.random() * 3 | 0); g.fillStyle = 'rgba(255,140,30,.12)'; g.fillRect(x - 24, 50, 48, 44); g.fillStyle = '#ff8a1f'; g.fillRect(x - 2, 86 - fl * 4, 4, fl * 4) }
  drawEnemy(g, fight, now, skin); drawPlayer(g, fight, now);
  for (const s of render.fx.parts) if (s.l > 0) { s.l -= dt; s.x += s.vx * dt; s.y += s.vy * dt; s.vy += .0008 * dt; g.fillStyle = s.c; g.fillRect(s.x | 0, s.y | 0, 2, 2) }
  if (fight.hurt > 0) { g.fillStyle = 'rgba(255,0,0,.28)'; g.fillRect(0, 0, W, H) }
  if (fight.over && !fight.win) { g.fillStyle = 'rgba(120,0,0,.35)'; g.fillRect(0, 0, W, H) }
  if (fight.msgT > 0) { g.font = "12px monospace"; g.textAlign = 'center'; g.fillStyle = '#000'; g.fillText(fight.msg, 162, 32); g.fillStyle = '#ffd23f'; g.fillText(fight.msg, 160, 30) }
  g.restore();
}

function initRender(canvas) {
  const g = canvas.getContext('2d');
  g.imageSmoothingQuality = 'high';
  return { g, bg: makeBg(), fx: makeFx() };
}

export { W, H, POSE_PL, POSE_EN, SKINS, PI, setSheet, setChars, keyOut, makeFx, pushSpark, sword, drawFrame, initRender };
