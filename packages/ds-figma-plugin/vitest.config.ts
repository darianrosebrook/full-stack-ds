import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { defineConfig } from "vitest/config";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const floors = JSON.parse(
  readFileSync(path.resolve(__dirname, "../../coverage-floors.json"), "utf8"),
).packages["figma-plugin"];

// Scoped runner for the ds-figma-plugin package. Its tests also run under
// the root vitest config (jsdom + root test setup); this config gives the
// coverage-scoped command its own thresholds
// (`pnpm --filter @full-stack-ds/figma-plugin exec vitest run --coverage`).
// The svelte plugin compiles the FigmaPluginApp.svelte UI surface, which is
// part of the package's own source corpus.
export default defineConfig({
  plugins: [svelte()],
  resolve: {
    conditions: ["browser"],
  },
  test: {
    environment: "jsdom",
    setupFiles: [path.resolve(__dirname, "../../src/test-setup.ts")],
    css: true,
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    exclude: ["**/node_modules/**", "**/dist/**"],
    coverage: {
      provider: "v8",
      include: ["src/**"],
      reporter: ["text", "json-summary"],
      reportsDirectory: "tmp/coverage-figma-plugin",
      thresholds: {
        statements: floors.statements,
        branches: floors.branches,
        functions: floors.functions,
        lines: floors.lines,
      },
    },
  },
});
