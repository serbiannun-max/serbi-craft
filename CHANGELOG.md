# Changelog

## v1.2.0 — Phase 3: Paint Database, Collection Intelligence, Analyzer Suite

**Highest priority — Paint Database:**
- Added three dedicated catalogs: Vallejo Model Color, Vallejo Game Color,
  Vallejo Xpress Color (`src/data/paints/`), each paint carrying name,
  manufacturer, hex, and computed Hue/Saturation/Value.
- Added HSV conversion (`hexToHsv`) to `colorMath.ts`, alongside the
  existing HSL utilities (not replacing them).
- New unified `paintCatalog.ts`: 7 total paint ranges (3 new Vallejo lines +
  the 4 existing brand-category ranges), with `findNearestInRange` for
  range-specific matching.
- New global setting: **Preferred Paint Range** (sidebar footer dropdown,
  persisted to `localStorage` via `SettingsContext.tsx`). Recipes in the
  Paint Brands and Workbench Card modules now resolve against it.

**Collection Manager:**
- Ownership tracking now covers the full 7-range catalog (was 5).
- New "Recipe in Your Preferred Range" section in Paint Brands: prefers and
  highlights owned paints; when nothing owned is close, suggests the
  closest owned substitute; when even that isn't close enough, suggests a
  two-paint mixing ratio (10%-step search across every owned pair).

**Paint Analyzer:**
- Click any pixel on an uploaded image for its exact HEX/RGB/HSL plus
  complementary/analogous/triadic/split-complementary harmonies.
- Palette extraction now toggles Top 3 / 5 / 8, labeled Dominant/Secondary/
  Accent by rank.
- Inline "Automatic Miniature Recipe" ladder for the last picked/extracted
  color.

**New modules:**
- **Box Art Analyzer** — tag points on a reference photo by material
  (Armor/Cloth/Skin/Leather/Gold/Steel); each gets a probable recipe from
  the matching existing engine (skin presets, NMM ladders, or the core
  advisor).
- **Recipe Comparison** — upload two photos, compare hue/saturation/
  brightness/contrast, get plain-language correction suggestions.

**Workbench Card:**
- Added a Paint Names row (nearest paint per ladder step in the Preferred
  Range).
- Added PNG export alongside the existing PDF/print.

**Knowledge Base:**
- Recategorized: Color Temperature, NMM Gold, and NMM Steel are now
  separate categories.
- Added Materials and Golden Demon style techniques entries.

**Architecture (see README's "Architecture notes" for detail):**
- Extracted `imageSampling.ts` and `ImageDropZone.tsx` so the three
  image-upload modules share one implementation instead of three copies —
  the only refactor made this pass, with no change to existing behavior.
- Version bumped to 1.2.0 in `package.json`, `src-tauri/Cargo.toml`, and
  `src-tauri/tauri.conf.json` per the process in `RELEASE.md`.

**Verification performed in this environment** (no Rust/network access —
see `BUILD.md`): `tsc --strict` clean across every pure utility module;
a full component-tree type-check against a minimal React type stub found
zero real defects (all flagged items were confirmed either offline-only
missing packages — `html2canvas`, `jspdf`, `@tauri-apps/api`, resolved by
`npm install` — or stub-fidelity artifacts, not real bugs); JSON/TOML
config validated. **Not verified here:** an actual `cargo build`/
`tauri build`/installer run — that remains the first real build/production
verification step, via `npm run desktop:build` locally or the GitHub
Actions workflow, same as previous releases.

## v1.1.0 — Phase 2: NMM Steel, Paint Analyzer, Workbench Card PDF, Knowledge Base
See README for details.

## v1.0.0 — Phase 1 + Tauri desktop foundation
See README, BUILD.md, and RELEASE.md for details.
