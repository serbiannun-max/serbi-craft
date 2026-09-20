use serde::Serialize;

#[derive(Serialize)]
pub struct AppInfo {
    name: &'static str,
    version: &'static str,
    tauri_version: &'static str,
}

/// A minimal example command so the frontend<->Rust bridge can be verified
/// end to end, and so future modules have a working template to copy.
/// Call it from TypeScript with:
///
///   import { invoke } from '@tauri-apps/api/core'
///   const info = await invoke('app_info')
#[tauri::command]
pub fn app_info() -> AppInfo {
    AppInfo {
        name: env!("CARGO_PKG_NAME"),
        version: env!("CARGO_PKG_VERSION"),
        tauri_version: tauri::VERSION,
    }
}
