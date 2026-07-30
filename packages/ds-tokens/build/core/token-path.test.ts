/**
 * The codegen↔token-graph naming seam.
 *
 * Codegen emits a READ of `--fsds-<slug>`; the token build emits the
 * DECLARATION of `--fsds-<slug>`. If the two lower the same dotted path
 * differently, the read silently falls through to its `var()` fallback literal
 * and no compiler, linter, or type check notices — CSS has no undefined-variable
 * error. That is exactly the defect this suite exists to make impossible.
 *
 * The two suites below pin different things, and neither substitutes for the
 * other:
 *
 *   - The `lowerTokenPath` cases pin the transformation itself. They are the
 *     only tests here that fail if the shared function's behavior changes —
 *     verified by mutation: replacing `"-" + m.toLowerCase()` with
 *     `m.toLowerCase()` turns three of them red.
 *   - The corpus sweep pins NON-DIVERGENCE, not behavior. Because both sides
 *     now call the same function, a mutation to that function moves both sides
 *     together and the sweep stays green — it is deliberately blind to that,
 *     and would be misread as the load-bearing check. What it does catch is the
 *     defect that actually happened: someone re-inlining a second lowering in
 *     either site, so the emitted read and the declared name drift apart again.
 *
 * The end-to-end oracle for both is `scripts/token-resolvability-audit`, which
 * reads the built CSS rather than either function.
 *
 * It lives here rather than beside the codegen source because ds-codegen
 * compiles under `rootDir: "src"` and so cannot even reference this package;
 * ds-tokens runs on tsx and can import both sides.
 */
import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";

import {
  lowerTokenPath,
  tokenSlug,
} from "../../../ds-codegen/src/token-path.js";
import { tokenPathToCSSVar } from "./index.js";

const COMPONENTS_DIR = resolve(
  import.meta.dirname,
  "../../../ds-contracts/components",
);

/**
 * Every `core.*` / `semantic.*` `resolvesTo` declared anywhere in the corpus's
 * token and style sidecars — precisely the paths that must name a variable the
 * token graph declares, and therefore the population the seam can break.
 *
 * A `resolvesTo` may also name a sibling component slot (`accordion.text.size`,
 * the variant re-point idiom). Those are excluded deliberately: both the
 * declaration and the read are emitted by codegen from the same function, so
 * they cannot drift, and `tokenPathToCSSVar` is not their authority — its
 * namespace heuristics would mis-file some of them (`icon.size.md` matches its
 * core-token pattern and would gain a spurious `core-` prefix).
 */
function corpusResolvesToPaths(): string[] {
  const paths = new Set<string>();
  const walk = (value: unknown): void => {
    if (Array.isArray(value)) {
      for (const entry of value) walk(entry);
      return;
    }
    if (value === null || typeof value !== "object") return;
    const record = value as Record<string, unknown>;
    if (typeof record.resolvesTo === "string") paths.add(record.resolvesTo);
    for (const entry of Object.values(record)) walk(entry);
  };

  for (const component of readdirSync(COMPONENTS_DIR)) {
    const dir = resolve(COMPONENTS_DIR, component);
    let files: string[];
    try {
      files = readdirSync(dir);
    } catch {
      continue; // not a directory
    }
    for (const file of files) {
      if (!file.endsWith(".tokens.json") && !file.endsWith(".styles.json")) {
        continue;
      }
      walk(JSON.parse(readFileSync(resolve(dir, file), "utf8")));
    }
  }
  return [...paths].filter((p) => /^(core|semantic)\./.test(p)).sort();
}

describe("token path lowering", () => {
  it("hyphenates dots", () => {
    expect(lowerTokenPath("semantic.color.fg")).toBe("semantic-color-fg");
  });

  it("splits camelCase humps into hyphenated lowercase", () => {
    expect(lowerTokenPath("semantic.shape.control.border.defaultWidth")).toBe(
      "semantic-shape-control-border-default-width",
    );
  });

  it("splits a hump that starts a segment", () => {
    expect(lowerTokenPath("core.dimension.ActionMinHeight")).toBe(
      "core-dimension-action-min-height",
    );
  });

  it("collapses the runs a multi-capital acronym would otherwise produce", () => {
    expect(lowerTokenPath("semantic.color.fgRGBValue")).toBe(
      "semantic-color-fg-r-g-b-value",
    );
  });

  it("normalizes underscores and spaces to hyphens", () => {
    expect(lowerTokenPath("core.spacing.size_04")).toBe("core-spacing-size-04");
    expect(lowerTokenPath("core.spacing.size 04")).toBe("core-spacing-size-04");
  });

  it("drops characters a custom-property name cannot carry", () => {
    expect(lowerTokenPath("core.color.palette.red/500")).toBe(
      "core-color-palette-red500",
    );
  });

  it("prefixes the project namespace and no leading dashes", () => {
    expect(tokenSlug("semantic.color.fg")).toBe("fsds-semantic-color-fg");
  });
});

describe("codegen and the token build agree on every corpus resolvesTo", () => {
  const paths = corpusResolvesToPaths();

  it("finds a non-trivial corpus to sweep", () => {
    // Guards the sweep below against silently passing on an empty set — a
    // broken loader would otherwise read as agreement.
    expect(paths.length).toBeGreaterThan(100);
  });

  it("lowers each path to a byte-identical variable name", () => {
    const disagreements = paths
      .map((path) => ({
        path,
        codegen: `--${tokenSlug(path)}`,
        tokenGraph: tokenPathToCSSVar(path),
      }))
      .filter((row) => row.codegen !== row.tokenGraph);

    expect(disagreements).toEqual([]);
  });
});
