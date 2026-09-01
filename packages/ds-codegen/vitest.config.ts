import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const floors = JSON.parse(
  readFileSync(path.resolve(__dirname, "../../coverage-floors.json"), "utf8"),
).packages.codegen;

// Codegen tests run pure Node logic over contracts/IR/emitters — no DOM,
// no React. The root vitest.config.ts assumes a jsdom environment + a
// React-focused setup file resolved relative to the cwd, which breaks
// when this package's `test` script runs in isolation. This local config
// keeps the scoped command green without dragging in jsdom or
// @testing-library.
//
// CWD contract: paths below are repo-root-relative because the codegen
// suite (like the codegen CLI) is authored to run from the repo root —
// e.g. the swift emitter's loadResolvedGraph falls back to process.cwd()
// to find packages/ds-tokens/generated/resolved.tokens.json. The explicit
// `root` makes test matching cwd-independent, so both the package-scoped
// `pnpm --filter @full-stack-ds/codegen run test` and the repo-root
// coverage command run the same file set:
//   pnpm exec vitest run -c packages/ds-codegen/vitest.config.ts [--coverage]
// (The package-scoped invocation still runs with process.cwd() inside the
// package dir, so graph-dependent tests behave exactly as before this
// config change — pre-existing cwd sensitivity, not introduced here.)
export default defineConfig({
  root: path.resolve(__dirname, "../.."),
  test: {
    environment: "node",
    include: ["packages/ds-codegen/src/**/*.{test,spec}.{ts,tsx}"],
    exclude: ["**/node_modules/**", "**/dist/**"],
    coverage: {
      provider: "v8",
      include: ["packages/ds-codegen/src/**"],
      reporter: ["text", "json-summary"],
      reportsDirectory: "packages/ds-codegen/tmp/coverage-codegen",
      thresholds: {
        statements: floors.statements,
        branches: floors.branches,
        functions: floors.functions,
        lines: floors.lines,
      },
    },
  },
});
