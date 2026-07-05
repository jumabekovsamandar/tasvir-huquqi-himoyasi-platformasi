import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Tauri expects a fixed dev server port (see src-tauri/tauri.conf.json).
export default defineConfig({
  plugins: [react()],
  clearScreen: false,
  server: {
    port: 5173,
    strictPort: true,
  },
  // Only variables with this prefix are exposed to the frontend bundle.
  // AI provider keys and other secrets must never use this prefix.
  envPrefix: ["VITE_"],
  build: {
    target: "es2022",
    sourcemap: false,
  },
});
