# Miniature Painter Color Theory Assistant

A local-first color theory assistant for miniature painters (Warhammer 40K, Age of
Sigmar, D&D minis, bust and display painting, Golden Demon-style competition work).
Pick a color and get a full underpainting-to-highlight recipe, grounded in the
traditional pigment color wheel painters are taught, not just a raw digital
complement.

Everything runs entirely in the browser (or, as a desktop build, in a native
window). There is no backend, no database, and no network calls — presets and
the paint database are local JSON, and your paint collection is saved to
`localStorage` on your own machine.

## Desktop app (Windows)

This project is also packaged as a native Windows desktop app using
[Tauri](https://tauri.app) — same React frontend, same architecture, same
functionality, just running in a lightweight native window instead of a
browser tab, distributed as a standalone `.exe`/`.msi` installer that needs no
Node.js, npm, or terminal to run. See **`BUILD.md`** for how to build the
installer and **`RELEASE.md`** for the release/versioning process.

## Getting started (web dev)

```bash
npm install
npm run dev
```

Then open the printed local URL (typically `http://localhost:5173`).

To build a static production bundle:

```bash
npm run build
npm run preview
```

## Phase 1 + Phase 2 (this build)

**Core modules (Phase 1):**
- **Color Wheel** — click/drag an HSL wheel, or type exact HEX/RGB/HSL values.
  Shows complementary, analogous, split-complementary, and triadic harmonies on
  the standard digital color wheel.
- **Miniature Advisor** — turns any selected color into a full six-step paint
  ladder (Deep Shadow → Shadow → Transition → Base → Highlight → Extreme
  Highlight), plus a warm/cool temperature gauge and a plain-language
  explanation of why each step was chosen.
- **Underpainting** — Best / Good / Experimental underpainting recommendations,
  ranked from safest high-contrast choice to a bolder alternative.
- **Skin Tones** — four flesh-tone presets (Light, Dark, Olive, Fantasy).
- **NMM Gold** — a ready-made non-metallic-metal gold ladder with painting-order
  notes.
- **Paint Brands** — matches every step of the current ladder to the nearest
  real paint across five brands, with a match-confidence score.
- **Collection Manager** — mark which real paints you own; owned paints are
  highlighted wherever they're recommended. Persisted locally via `localStorage`.

**Phase 2 modules (this update):**
- **NMM Steel** — the cool-metal counterpart to NMM Gold: a blue-grey contrast
  ladder with its own painting-order notes.
- **Paint Analyzer** — drag-and-drop a box-art or reference photo (JPG/PNG/WEBP)
  and it extracts the dominant colors entirely on-device via canvas + a small
  k-means clustering implementation — nothing is uploaded anywhere, works fully
  offline. Click any extracted swatch to send it to the Color Wheel, which
  updates every other module.
- **Workbench Card** — a one-page A4 printable reference card (current color,
  paint ladder, underpainting options, a mini color wheel). Print it via the OS
  print dialog, or download a real PDF with one click (via `jsPDF` +
  `html2canvas`, both running client-side).
- **Knowledge Base** — searchable theory write-ups explaining why each module
  recommends what it does (traditional pigment wheel vs. RGB wheel, why skin
  shadows go through purple, how NMM contrast works, etc.).

All ten modules are reachable from the sidebar; nothing is stubbed anymore.

## Why the color math isn't a straight complement

Painters are taught a pigment-based wheel where Red↔Green, Yellow↔Violet, and
Blue↔Orange are complements — different from a digital RGB wheel, where red's
complement is cyan. `src/utils/colorMath.ts` implements a small piecewise remap
(`artisticComplementHue`) between the two wheels so every shadow/underpainting
recommendation lines up with what a painter actually expects, while the Color
Wheel tab's harmony display still uses the standard digital wheel, since that's
the literal math most people expect from a "color wheel" feature.

## Project structure

```
src/
  utils/
    colorMath.ts          hex/rgb/hsl conversions, harmonies, artistic wheel
    miniatureAdvisor.ts    the paint-ladder / underpainting / temperature rule engine
    paintMatch.ts           nearest-paint lookup + match confidence
    collection.ts            localStorage-backed owned/custom paint store
    tauriBridge.ts            detects the desktop runtime, calls the example Rust command
    colorExtraction.ts         on-device k-means dominant-color extraction (Paint Analyzer)
  data/
    paintDatabase.json     brand paint names per color-theory category
    skinPresets.json         skin tone ladders
    nmmGold.json               NMM gold ladder + notes
    nmmSteel.json                NMM steel ladder + notes
    knowledgeBase.json             searchable theory write-ups
  components/
    ColorWheel.tsx, ColorInputs.tsx, HarmonyDisplay.tsx, LadderStrip.tsx,
    SwatchCard.tsx, TemperatureBlock.tsx, MiniColorWheel.tsx
    panels/                one component per nav module (10 modules total)
  App.tsx                   sidebar nav + shared selected-color state

src-tauri/                  native desktop shell (Rust, Tauri v2)
  src/main.rs, lib.rs, commands.rs   app bootstrap + example command
  tauri.conf.json                       window, build hooks, Windows installer config
  capabilities/default.json               permission grants for the main window
  icons/                                     app icon set (incl. Windows .ico)

.github/workflows/build-windows.yml   CI: builds the real .exe/.msi on windows-latest

BUILD.md      how to build the desktop installer (local + CI)
RELEASE.md    versioning and release steps
```

## Notes on the paint database

Paint names and hex approximations in `paintDatabase.json` are a community
reference for matching color-theory positions to plausible real paints, not an
official catalog. Always check against a physical paint chip or the brand's
official swatch before committing a scheme. Extend the JSON file to add more
categories, brands, or exact hex values from your own reference photos.
