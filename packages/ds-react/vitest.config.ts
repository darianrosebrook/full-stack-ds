import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const floors = JSON.parse(
  readFileSync(path.resolve(__dirname, "../../coverage-floors.json"), "utf8"),
).packages.react;

// Scoped runner for the ds-react package. The root vitest.config.ts also
// runs these tests (React-focused jsdom setup), so this config mirrors the
// root environment for the coverage-scoped command
// (`pnpm --filter @full-stack-ds/react exec vitest run --coverage`).
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@full-stack-ds/react": path.resolve(__dirname, "src/index.ts"),
    },
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
      reportsDirectory: "tmp/coverage-react",
      thresholds: {
        statements: floors.statements,
        branches: floors.branches,
        functions: floors.functions,
        lines: floors.lines,
      },
    },
  },
});
