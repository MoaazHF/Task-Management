import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const apiTarget = process.env.VITE_API_TARGET || "http://localhost:3000";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: apiTarget,
        changeOrigin: true,
      },
    },
  },

  build: {
    target: "es2018",
    minify: "esbuild",
    sourcemap: false,
    cssCodeSplit: true,
    chunkSizeWarningLimit: 1000,
  },

  cacheDir: "node_modules/.vite",

  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/setupTests.ts",
  },
});
