// Detects whether the app is currently running inside the Tauri desktop
// shell (vs. a normal browser tab) and, if so, calls the example `app_info`
// Rust command. In a plain browser this resolves to `null` immediately and
// does nothing — the whole web app continues to work standalone.
//
// This file is the reference pattern for any future frontend<->Rust calls:
// add a `#[tauri::command]` in src-tauri/src/commands.rs, register it in
// src-tauri/src/lib.rs, then call it here with `invoke('your_command_name')`.

export interface DesktopAppInfo {
  name: string
  version: string
  tauriVersion: string
}

export function isDesktopRuntime(): boolean {
  return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window
}

export async function getDesktopAppInfo(): Promise<DesktopAppInfo | null> {
  if (!isDesktopRuntime()) return null
  try {
    const { invoke } = await import('@tauri-apps/api/core')
    const info = await invoke<{ name: string; version: string; tauri_version: string }>('app_info')
    return { name: info.name, version: info.version, tauriVersion: info.tauri_version }
  } catch {
    // Command unavailable or the bridge failed for some reason — degrade
    // silently rather than break the rest of the app.
    return null
  }
}
