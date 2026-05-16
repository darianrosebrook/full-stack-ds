import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@full-stack-ds/react": path.resolve(
        __dirname,
        "packages/ds-react/src/index.ts",
      ),
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test-setup.ts"],
    css: true,
    include: [
      "packages/**/*.{test,spec}.{ts,tsx}",
      "src/**/*.{test,spec}.{ts,tsx}",
    ],
    // Per-framework packages own their own test runners (each needs its
    // own Vite plugin). Skip them here so root vitest can stay React-only.
    exclude: [
      "**/node_modules/**",
      "**/dist/**",
      "packages/ds-vue/**",
      "packages/ds-angular/**",
      "packages/ds-lit/**",
      "packages/ds-svelte/**",
    ],
  },
});
