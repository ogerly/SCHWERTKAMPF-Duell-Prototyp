import { cpSync, mkdirSync, rmSync } from 'node:fs';
import path from 'node:path';

const dist = path.resolve('dist');
rmSync(dist, { recursive: true, force: true });
mkdirSync(path.join(dist, 'assets'), { recursive: true });

cpSync('duell-prototyp.html', path.join(dist, 'index.html'));
cpSync('demo.html', path.join(dist, 'demo.html'));
cpSync('combat-engine.js', path.join(dist, 'combat-engine.js'));
cpSync('combat-render.js', path.join(dist, 'combat-render.js'));
cpSync('assets/chars-legacy.json', path.join(dist, 'assets', 'chars-legacy.json'));
cpSync('assets/sheet-legacy.png', path.join(dist, 'assets', 'sheet-legacy.png'));

console.log('Build fertig: dist/');
