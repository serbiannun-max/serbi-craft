// Application bootstrap. Kept deliberately minimal for the Phase 1 desktop
// foundation: the window just loads the existing React/Vite frontend from
// `../dist`, and localStorage/IndexedDB work exactly as they do in a normal
// browser because the OS webview (WebView2 on Windows) provides them.
//
// Extending this for later phases:
//   - Native file dialogs (Paint Analyzer image upload, Workbench Card
//     export) -> add the `tauri-plugin-dialog` crate + `@tauri-apps/plugin-dialog`
//     npm package, register it with `.plugin(tauri_plugin_dialog::init())`
//     below, and grant it in `capabilities/default.json`.
//   - Native "Save as PDF" (Workbench Card) -> either keep using the
//     browser's print dialog (works as-is in the webview) or add
//     `tauri-plugin-fs` + a Rust command that writes the generated PDF bytes
//     to disk.
//   - Any new Rust command: add it to the `commands` module below, then
//     register it in the `invoke_handler!` list and call it from the
//     frontend with `@tauri-apps/api`'s `invoke("command_name")`.

mod commands;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![commands::app_info])
        .run(tauri::generate_context!())
        .expect("error while running the Miniature Painter Color Theory Assistant");
}
