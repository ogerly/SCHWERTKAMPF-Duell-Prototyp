# AGENTS.md — Black Manor Combat

Kleines Open-Source-Repo (Microservice für Duell-Kampf im Black-Manor-Adventure).

- `duell-prototyp.html` = spielbare Referenz (Single-File, nicht aufteilen ohne Absprache).
- `assets/kampf-posen.png` = Sprite-Sheet (3 Gegner × Portrait + 9 Posen, Quelle der Wahrheit für Posen).
- Geplant: `combat-engine.js` (pure Logik) + `combat-render.js` (Canvas) — Trennung Engine/Render einhalten.
- Posen-Vokabular (verbindlich): bereit, ausholen_oben/unten, angriff_oben/unten,
  blocken_oben/unten, ducken, tod (+ Portrait).
- Keine Secrets committen. Tests: Prototyp im Browser spielen (oben/unten/blocken/parieren).
