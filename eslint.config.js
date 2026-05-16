// @ts-check
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import globals from "globals";

/**
 * Flat ESLint configuration for the full-stack-ds monorepo.
 *
 * Scope decisions:
 *   - Lint TypeScript, TSX, and the small JS surface (eslint config, scripts).
 *   - Skip `dist/`, build outputs, lockfiles, and Vue/Svelte/Angular/Lit
 *     framework packages (their own toolchains lint their templates).
 *   - Skip `packages/ds-contracts/portfolio-original/` (untranslated upstream).
 *   - Skip generated test files (`__tests__/`) so the contract-driven test
 *     output isn't penalized for stylistic choices the generator makes.
 *
 * Rule philosophy: focus on rules that catch real bugs (unused vars,
 * unreachable code, hooks misuse) rather than stylistic preferences. The
 * generated React code uses patterns (closures around setters, `as` casts
 * for Booleanish coercion) that are intentional and would be noisy to flag.
 */
export default tseslint.config(
  {
    ignores: [
      "**/dist/**",
      "**/node_modules/**",
      "**/.vite/**",
      "**/.vitest-cache/**",
      "**/coverage/**",
      "**/tmp/**",
      "packages/ds-contracts/portfolio-original/**",
      "packages/ds-vue/**",
      "packages/ds-svelte/**",
      "packages/ds-angular/**",
      "packages/ds-lit/**",
      "packages/ds-contracts/tokens/**",
      "**/__tests__/**",
      "**/*.test.ts",
      "**/*.test.tsx",
      "e2e/**",
      "playwright-report/**",
      "test-results/**",
      "pnpm-lock.yaml",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{ts,tsx,mts,cts,js,mjs,cjs}"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    plugins: {
      react,
      "react-hooks": reactHooks,
    },
    settings: {
      react: { version: "detect" },
    },
    rules: {
      // React hooks correctness — catches missing deps and bad hook order.
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      // JSX-specific niceties — keep on but lenient.
      "react/jsx-key": "error",
      "react/jsx-no-duplicate-props": "error",
      "react/no-unknown-property": "error",
      // React 19+ no longer requires JSX-in-scope; modern JSX runtime handles it.
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
      // TypeScript handles unused-var detection more accurately than the JS
      // rule; mute the latter and configure the former.
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
      // The generator emits `as "true" | "false"` casts and other narrow
      // assertions on purpose; flag truly any-typed lapses with a warning.
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-empty-object-type": "off",
      // Prefer `import type` to keep emit clean — warning so the generator
      // output isn't broken by a strict gate.
      "@typescript-eslint/consistent-type-imports": [
        "warn",
        { prefer: "type-imports", disallowTypeAnnotations: false },
      ],
    },
  },
  {
    // Generated component sources rely on patterns ESLint flags as warnings
    // (deep destructure with rename, unused destructured props for spread).
    // Suppress the noise — these files are mechanically produced.
    files: [
      "packages/ds-react/src/components/**/*.tsx",
      "packages/ds-react/src/components/**/*.ts",
    ],
    rules: {
      "@typescript-eslint/no-unused-vars": "off",
    },
  },
);
