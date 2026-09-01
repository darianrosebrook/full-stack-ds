import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const floors = JSON.parse(
  readFileSync(path.resolve(__dirname, "../../coverage-floors.json"), "utf8"),
).packages.lit;

export default defineConfig({
  test: {
    environment: "jsdom",
    include: ["src/**/__tests__/**/*.test.ts"],
    coverage: {
      provider: "v8",
      include: ["src/**"],
      reporter: ["text", "json-summary"],
      reportsDirectory: "tmp/coverage-lit",
      thresholds: {
        statements: floors.statements,
        branches: floors.branches,
        functions: floors.functions,
        lines: floors.lines,
      },
    },
  },
});
