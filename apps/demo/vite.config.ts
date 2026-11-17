import { defineConfig } from "vite";

// GitHub Pages serves project sites under /<repo>/, so only scope the base path for production builds — the dev server should still serve at /.
export default defineConfig(({ command }) => ({
  base: command === "build" ? "/interactive-canvas-engine/" : "/",
  server: {
    port: 5173,
  },
}));
