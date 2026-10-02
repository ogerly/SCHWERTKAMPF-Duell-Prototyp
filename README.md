# Black Manor Combat — Duell-Microservice (Canvas)

Rundenbasiertes 1-gegen-1-Schwertduell (oben/unten-Zonen, Block/Parade-Fenster, KI-Gegner),
gebaut als **einbettbarer Microservice** für Story-Editor + Frontend des
Black-Manor-Adventures (Horror-Adventure im Stil von 1990).

- `duell-prototyp.html` — spielbarer Single-File-Prototyp (Referenz-Verhalten, Stand 29.09.)
- `assets/kampf-posen.png` — Sprite-Sheet: 3 Gegner × (Portrait + 9 Posen)
- `combat-engine.js` / `combat-render.js` — **geplant (M1)**: Engine/Render-Trennung
- Editor-Harness (Pose-Tester → `encounters[].combat`) + `EncounterView.vue` — **geplant (M3/M4)**

<img width="1025" height="895" alt="Screenshot 2026-10-02 080033" src="https://github.com/user-attachments/assets/cd93dad4-2eb4-4b8a-99f5-9ade799e1ae8" />


## Demo

`duell-prototyp.html` im Browser öffnen. Steuerung: Tastatur (Angriff oben/unten, Block oben/unten).

## Push (später, maintainer)

Remote: https://github.com/ogerly/SCHWERTKAMPF-Duell-Prototyp.git (bereits eingetragen).
Enthalten: **nur der Microservice** (Prototyp, Sheet, Engine/Render, Docs) — nichts anderes.

```bash
git push -u origin main
```

## Lizenz

MIT — s. LICENSE.
