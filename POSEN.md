# POSEN.md — Sprite-Spec für Kampf-Gegner (verbindlich)

Jeder Gegner (inkl. Bosse) liefert **1 Zeile × 10 Spalten** in fester Reihenfolge:

`Portrait, bereit, ausholen_oben, ausholen_unten, angriff_oben, angriff_unten, blocken_oben, blocken_unten, ducken, tod`

## Figur

- **Ab Taille aufwärts, KEINE Beine.** Hüfte unten angeschnitten, Kopf oben mit Luft.
- Frontal (leichte ¾-Drehung ok), Waffe in den Kampfposen sichtbar.
- Alle Zellen gleich groß, Figur zentriert.

## Technik

- PNG mit **echtem Alpha** (kein Schachbrett-Muster!).
- **Keine Labels einbrennen** — Mapping = Reihenfolge (s. oben) + `poses.json`.
- Stil: düster, painterly, gedeckte Farben (B0-Äquivalent), keine modernen Objekte.

## Bosse

Gleiche Spec + eigene Waffe sichtbar + Schwäche-Merkmal sichtbar:
Executioner-Axt, Cook-Haken, Archivist-Bücher, Widow-Schleier, Bone-Rüstung,
Experiment-Gestaltwandel, Morgana-Spiegelmotiv. Boss-Zeile darf 1,25× Zellhöhe.
