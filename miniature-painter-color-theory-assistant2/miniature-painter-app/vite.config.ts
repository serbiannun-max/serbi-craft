import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Tauri expects a fixed, predictable dev server port and needs the file
// watcher to ignore its own Rust build output, or `tauri dev` and Vite's
// HMR fight each other. See: https://tauri.app/start/frontend/vite/
const host = process.env.TAURI_DEV_HOST

export default defineConfig({
  plugins: [react()],

  // Tauri needs a consistent, non-interactive dev server.
  clearScreen: false,
  server: {
    port: 1420,
    strictPort: true,
    host: host || false,
    hmr: host ? { protocol: 'ws', host, port: 1421 } : undefined,
    watch: {
      // Ignore the Rust project so Cargo rebuilds don't trigger Vite reloads.
      ignored: ['**/src-tauri/**'],
    },
  },

  // Keep relative asset paths so the built `dist/` folder loads correctly
  // from Tauri's `tauri://localhost` origin as well as a plain static host.
  base: './',
})
