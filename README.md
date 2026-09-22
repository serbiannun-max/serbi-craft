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

## Phase 1 + Phase 2 + Phase 3 (this build)

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

All ten Phase 1/2 modules are reachable from the sidebar; nothing is stubbed.

**Phase 3 additions (this update) — highest priority first:**

- **Paint Database**: three new dedicated catalogs — Vallejo Model Color,
  Vallejo Game Color, Vallejo Xpress Color (`src/data/paints/`) — each paint
  carrying name, manufacturer, hex, and computed Hue/Saturation/**Value**
  (`hexToHsv` in `colorMath.ts`, distinct from the HSL used everywhere else
  in the app). A new **Preferred Paint Range** global setting (sidebar
  footer, persisted to `localStorage`) picks which of the 7 total ranges
  (the 3 new Vallejo lines, plus Citadel/Army Painter/AK Interactive/Two
  Thin Coats) recipes resolve against. **Honesty note:** these three new
  catalogs are curated, plausible reference data — this project has no
  internet access to verify every name against Vallejo's current official
  catalog, so each file says so explicitly and recommends checking against
  a physical chip or vallejocolor.com. Treat them the same way as the
  original `paintDatabase.json`'s existing disclaimer, just newer.
- **Collection Manager**: now tracks ownership across the full 7-range
  catalog (previously 5). The Paint Brands module's new "Recipe in Your
  Preferred Range" section prefers and highlights owned paints, falls back
  to the closest **owned substitute** when nothing owned is close, and
  beyond that suggests a **two-paint mixing ratio** (10%-step search across
  every pair of owned paints) when even the best single substitute isn't
  close enough.
- **Paint Analyzer**: click anywhere on an uploaded image to pick that exact
  pixel's HEX/RGB/HSL and see its complementary/analogous/triadic/split-
  complementary harmonies (reuses the existing `HarmonyDisplay`). Palette
  extraction now toggles between top 3/5/8 colors, labeled Dominant/
  Secondary/Accent by rank, and shows an inline "Automatic Miniature
  Recipe" ladder for whichever color you last picked or extracted.
- **Box Art Analyzer** (new module): click a point on a reference photo and
  tag it as Armor / Cloth / Skin / Leather / Gold / Steel. Skin routes
  through the Skin Tones presets, Gold/Steel through the NMM Gold/Steel
  ladders, everything else through the core Miniature Advisor engine —
  each tagged point gets its own expandable recipe.
- **Recipe Comparison** (new module): upload two photos and compare their
  average hue, saturation, brightness, and a contrast proxy (stddev of
  per-pixel lightness), with plain-language correction suggestions.
- **Workbench Card**: now also shows the nearest paint **name** per ladder
  step in your Preferred Range, and exports as **PNG** in addition to the
  existing PDF/print.
- **Knowledge Base**: recategorized (Color Temperature, NMM Gold, and NMM
  Steel are now separate categories) and extended with **Materials** and
  **Golden Demon style techniques** entries (edge highlighting, zenithal
  priming, glazing vs. layering).

**Architecture notes:**
- `src/utils/imageSampling.ts` and `src/components/ImageDropZone.tsx` were
  factored out of the original Paint Analyzer so Recipe Comparison, Box Art
  Analyzer, and Paint Analyzer itself all share one canvas-sampling
  implementation and one upload UI, rather than three copies of the same
  logic — the only refactor made in this pass, and it didn't change any
  existing module's behavior.
- Every new module reuses the existing engine rather than reimplementing
  it: `getPaintLadder`/`getUnderpaintingOptions` (Box Art Analyzer, Paint
  Analyzer's inline recipe), `findNearestPaints`/the new
  `findNearestInRange` (Paint Brands, Workbench Card), and the Collection
  Manager's owned-paint set (Paint Brands' substitute/mixing logic).

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
  context/
    SettingsContext.tsx        global Preferred Paint Range setting (localStorage-backed)

Phase 3 additions to src/:
  utils/
    paintCatalog.ts             unified 7-range paint catalog (3 Vallejo + 4 legacy brands)
    imageSampling.ts              shared canvas pixel sampling (factored out, reused by 3 modules)
    pixelPick.ts                    exact full-resolution single-pixel color picking
    imageAnalysis.ts                  per-image hue/sat/brightness/contrast stats (Recipe Comparison)
  data/paints/
    vallejoModelColor.json, vallejoGameColor.json, vallejoXpressColor.json
  components/
    ImageDropZone.tsx            shared drag-and-drop upload UI (Paint Analyzer, Box Art, Comparison)
    panels/BoxArtAnalyzerPanel.tsx, panels/RecipeComparisonPanel.tsx

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
