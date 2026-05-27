import { defineConfig } from "vitest/config";

// Codegen tests run pure Node logic over contracts/IR/emitters — no DOM,
// no React. The root vitest.config.ts assumes a jsdom environment + a
// React-focused setup file resolved relative to the cwd, which breaks
// when this package's `test` script runs in isolation. This local config
// keeps the scoped command (`pnpm --filter @full-stack-ds/codegen run
// test`) green without dragging in jsdom or @testing-library.
export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    exclude: ["**/node_modules/**", "**/dist/**"],
  },
});
