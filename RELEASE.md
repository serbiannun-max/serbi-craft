# Release Process

## Versioning

Semantic versioning (`MAJOR.MINOR.PATCH`). The version string must be kept in
sync in **three** places — Tauri does not read it from `package.json`
automatically:

1. `package.json` → `"version"`
2. `src-tauri/Cargo.toml` → `[package] version`
3. `src-tauri/tauri.conf.json` → `"version"`

A future improvement (Phase 2+) could script this with a one-liner, but for
now it's a manual three-file edit per release — small enough not to need
tooling yet.

## Cutting a release

1. Bump the version in all three files listed above (e.g. `1.0.0` → `1.1.0`).
2. Commit: `git commit -am "Release v1.1.0"`
3. Tag and push:
   ```bash
   git tag v1.1.0
   git push origin main --tags
   ```
4. Pushing the tag triggers `.github/workflows/build-windows.yml`, which:
   - Builds the frontend and the Rust/Tauri shell on a Windows runner.
   - Produces `MiniaturePainterColorTheoryAssistant_1.1.0_x64-setup.exe` (NSIS)
     and the equivalent `.msi`.
   - Creates a **draft** GitHub Release named `Miniature Painter v1.1.0` with
     both installers attached.
5. Open the draft release on GitHub, add release notes, and publish it.
6. Share the `.exe` link. End users download and run it — no Node, npm, or
   terminal required on their side.

## Ad hoc / test builds

Use **Run workflow** on the Actions tab (`workflow_dispatch`) instead of
pushing a tag when you just want an installer to test, without cutting a
public release. It builds the same way but only uploads a workflow artifact,
not a GitHub Release.

## Code signing (not yet configured)

The installer produced today is **unsigned**. Windows SmartScreen will show
an "Unknown Publisher" warning the first time someone runs it — expected and
not a build error. To remove that warning later:

1. Obtain a code signing certificate (an EV certificate avoids the SmartScreen
   reputation delay; a standard OV certificate works but takes longer to
   build trust).
2. Add the certificate as encrypted GitHub Actions secrets.
3. Add a signing step to `build-windows.yml` per
   [Tauri's Windows code-signing guide](https://tauri.app/distribute/sign/windows/).

Left out of this Phase 1 foundation since it requires a purchased
certificate the project doesn't have yet, not because of any technical
blocker — the workflow is structured so this is an additive step later.

## Compatibility with future modules (Phase 2+)

Nothing about this desktop conversion is Phase-2-module-specific:

- The frontend is loaded as-is from `dist/`; new panels/components ship the
  same way existing ones do, no Tauri-specific changes needed for pure-UI
  features.
- Features that need native OS access (file dialogs for the Paint Analyzer's
  image upload, saving the Workbench Card as a PDF to a chosen folder, etc.)
  can be added incrementally as Tauri plugins/commands — see the comments in
  `src-tauri/src/lib.rs` for the exact extension pattern, and
  `src-tauri/capabilities/default.json` for where new permissions get
  granted.
- This same GitHub Actions workflow keeps working unchanged as those modules
  are added; it always builds whatever `npm run build` currently produces.
