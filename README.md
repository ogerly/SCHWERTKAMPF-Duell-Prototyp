# Black Manor Combat — Duell-Microservice (Canvas)

Rundenbasiertes 1-gegen-1-Schwertduell (oben/unten-Zonen, Block/Parade-Fenster, KI-Gegner),
gebaut als **einbettbarer Microservice** für Story-Editor + Frontend des
[Black-Manor-Adventures](../elvira-clone) (Horror-Adventure im Stil von 1990).

- `duell-prototyp.html` — spielbarer Single-File-Prototyp (Referenz-Verhalten, Stand 29.09.)
- `assets/kampf-posen.png` — Sprite-Sheet: 3 Gegner × (Portrait + 9 Posen)
- `combat-engine.js` / `combat-render.js` — **geplant (M1)**: Engine/Render-Trennung
- Editor-Harness (Pose-Tester → `encounters[].combat`) + `EncounterView.vue` — **geplant (M3/M4)**

## Demo

`duell-prototyp.html` im Browser öffnen. Steuerung: Tastatur (Angriff oben/unten, Block oben/unten).

## Push-Anleitung (maintainer)

```bash
gh repo create ogerly/black-manor-combat --public --source=. --push
# ohne gh: Repo auf github.com/ogerly anlegen, dann:
# git remote add origin git@github.com:ogerly/black-manor-combat.git && git push -u origin main
```

## Lizenz

MIT — s. LICENSE.
