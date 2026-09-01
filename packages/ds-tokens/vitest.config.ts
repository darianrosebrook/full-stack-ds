import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const floors = JSON.parse(
  readFileSync(path.resolve(__dirname, "../../coverage-floors.json"), "utf8"),
).packages.tokens;

// Scoped runner for ds-tokens. The package's executable surface is the
// build/ pipeline (token graph composition, resolution, validators); the
// src/ tree is DTCG JSON data, not code, so coverage scopes to build/**.
export default defineConfig({
  test: {
    environment: "node",
    include: ["build/**/*.{test,spec}.{ts,tsx}"],
    exclude: ["**/node_modules/**", "**/dist/**"],
    coverage: {
      provider: "v8",
      include: ["build/**/*.{ts,mjs}"],
      reporter: ["text", "json-summary"],
      reportsDirectory: "tmp/coverage-tokens",
      thresholds: {
        statements: floors.statements,
        branches: floors.branches,
        functions: floors.functions,
        lines: floors.lines,
      },
    },
  },
});
