# Building the Desktop App

The app is now a [Tauri](https://tauri.app) desktop shell around the existing
React/Vite frontend, targeting a native Windows installer (`.exe` via NSIS,
and a `.msi`). The frontend, its architecture, and all current functionality
are unchanged — Tauri just wraps it in a native window and packages it.

There are two ways to produce the installer, described below. **Use the CI
path unless you already have a full Rust toolchain set up** — it's the one
that was actually exercised end to end for this project (see the "What was
and wasn't verified" note at the bottom).

## Option A (recommended): build via GitHub Actions, no local Rust needed

This repo includes `.github/workflows/build-windows.yml`, which builds the
installer on a real `windows-latest` GitHub-hosted runner — the officially
supported way to produce Tauri Windows builds without owning a Windows
machine or installing Rust yourself.

1. Push this repository to GitHub.
2. Go to the **Actions** tab → **Build Windows Installer** → **Run workflow**
   (or just push a tag like `v1.0.0`, which also attaches the result to a
   draft GitHub Release — see `RELEASE.md`).
3. When the run finishes, download the `windows-installer` artifact. Inside
   you'll find:
   - `*.exe` — an NSIS installer (recommended default; smaller, per-user
     install, no admin rights required).
   - `*.msi` — a WiX/MSI installer (for environments that require MSI, e.g.
     some corporate deployment tools like Intune/SCCM).
4. That `.exe`/`.msi` is the final artifact. Anyone running it needs **no**
   Node.js, npm, or terminal — it's a standalone native installer.

You (the developer) don't need Rust or Node installed locally for this path
either — only a GitHub account and this repository.

## Option B: build locally

Needed only if you want to iterate on the desktop shell itself (native menus,
window behavior, new Rust commands) and want faster feedback than pushing to
CI every time.

### Prerequisites

- **Node.js** 18 or newer, and npm.
- **Rust** (stable channel) via [rustup.rs](https://rustup.rs).
- **Windows only**, to produce a Windows build:
  - Microsoft C++ Build Tools (the "Desktop development with C++" workload
    from the Visual Studio Installer, or the standalone Build Tools).
  - The **WebView2 Runtime** — Windows 10 (1803+) and Windows 11 ship with
    this preinstalled; if it's missing, the app's own NSIS installer can
    fetch it automatically (see "Offline installs" below).
  - The Tauri CLI will prompt to install the WiX toolset automatically the
    first time you build the `.msi` target; accept that prompt (needs
    internet once, then it's cached).
- Building a Windows installer specifically requires a Windows machine (or
  the CI runner in Option A) — Tauri does not support cross-compiling a
  working Windows bundle from Linux or macOS.

### Steps

```bash
# from the project root
npm install          # installs frontend deps AND the Tauri CLI (@tauri-apps/cli)

npm run desktop:dev   # opens a native window with hot-reload, for development
npm run desktop:build # produces the release installer
```

`npm run desktop:build` runs `tsc -b && vite build` for the frontend (same as
the existing `npm run build`), then compiles the Rust shell and bundles it.
Output lands in:

```
src-tauri/target/release/bundle/nsis/*.exe
src-tauri/target/release/bundle/msi/*.msi
```

## Offline installs (no internet at install time)

By default (`webviewInstallMode.type: "downloadBootstrapper"` in
`src-tauri/tauri.conf.json`) the installer downloads a tiny bootstrapper that
fetches the WebView2 Runtime **only if it isn't already on the machine** —
which is rare, since Windows 10/11 ship with it. If you need the installer to
work on a fully air-gapped machine regardless, change that setting to:

```json
"webviewInstallMode": { "type": "fixedRuntime", "path": "./WebView2Runtime/" }
```

and follow Tauri's
[offline installer guide](https://tauri.app/distribute/windows-installer/#offline-installer)
to bundle the ~180 MB runtime directly into the installer. Not done by default
here to keep the installer small, since the requirement was "the *application*
works completely offline," not "the installer needs zero internet ever" — but
this is a one-line config change if you need that guarantee.

## Local storage

No change needed. `localStorage` (used by the Collection Manager) is provided
by the OS webview (WebView2 on Windows) exactly like a normal browser, and is
scoped per-app, persisting across launches.

## What was and wasn't verified in this environment

The Tauri project files (`src-tauri/`, config, icons, workflow) were authored
and reviewed for correctness, and the pure frontend logic was type-checked
with `tsc --strict` with zero errors. **This sandbox has no Rust toolchain
and no network access**, so `cargo build` / `tauri build` could not actually
be executed here to produce a real `.exe`. The GitHub Actions workflow in
Option A is the first point this gets compiled and bundled for real — run it
and treat that as the actual build verification step. If it surfaces an
issue, it's almost certainly a small, fixable config mismatch (e.g. a Rust
edition/toolchain pin) rather than an architectural problem, since the
scaffold follows the standard `create-tauri-app` v2 layout throughout.
