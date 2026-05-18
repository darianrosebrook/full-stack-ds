/**
 * Side-effect import that augments vitest's `Assertion<T>` interface
 * with the @testing-library/jest-dom matchers (toBeInTheDocument,
 * toHaveClass, toHaveAttribute, toHaveTextContent, toContainElement,
 * etc.).
 *
 * The runtime registration lives in src/test-setup.ts (root); this
 * declaration file ensures the @full-stack-ds/react workspace tsc
 * (packages/ds-react/tsconfig.json with `include: ["src/**\/*"]`)
 * picks up the augmentation. Without this, tests pass at runtime
 * but type-check red against `Assertion<HTMLElement>`.
 *
 * Surfaced by FRAMEWORK-EMIT-VALIDATE-01 (commit ffbae6a).
 */
import "@testing-library/jest-dom/vitest";
