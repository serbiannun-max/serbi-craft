// Prevents an additional console window from opening on Windows in release
// builds. Do not remove — this is standard Tauri boilerplate.
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    miniature_painter_lib::run();
}
