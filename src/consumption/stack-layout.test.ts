/**
 * Stack layout consumption guard (SHOWCASE-STACK-LAYOUT-01).
 *
 * The showcase app adopts the DS Stack primitive for its own flex-axis layout
 * (axis + display mode + semantic element), the same way the generated
 * components use it. Alignment, wrap, flex-sizing, grids, scroll containers
 * and sticky positioning legitimately remain CSS — Stack declares none of
 * them — so this guard pins exactly the invariants the adoption owns:
 *
 * 1. Stack is statically imported and used across a broad set of app surfaces
 *    (not one token import).
 * 2. Views/sections/layout contain no inline `display: "flex"` axis layout —
 *    if a row needs an axis, it is a `<Stack>`, and per-axis gap rides the
 *    stack-gap-* token-override utilities. Inline `inline-flex` on
 *    single-child centering chips (fixed-size icon/number badges) is exempt:
 *    that is a widget, not a layout container.
 * 3. app.css declares the stack-gap-* utilities against the semantic gap
 *    token, and the rules Stack absorbed no longer hand-roll `display: flex`.
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const HERE = dirname(fileURLToPath(import.meta.url));
const SRC = resolve(HERE, ".."); // src/consumption -> src

/** Strip template literals + comments so doc code samples never count. */
const stripCodeSamples = (src: string) =>
  src
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\/\/[^\n]*/g, "")
    .replace(/`(?:\\[\s\S]|[^`\\])*`/g, "``");

/** Inline hand-rolled flex axis in JSX. Matches `display: "flex"` /
 * `display: 'flex'` and any explicit `flexDirection:` — the axis decision
 * Stack owns. Does NOT match `display: "inline-flex"` (centering chips). */
export const INLINE_AXIS_FLEX =
  /display:\s*["']flex["']|flexDirection:\s*["'][a-z]+["']/g;

function collectSource(dir: string, acc: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = resolve(dir, entry);
    if (statSync(full).isDirectory()) {
      collectSource(full, acc);
    } else if (/\.(tsx|ts)$/.test(entry) && !/\.(test|spec)\.[jt]sx?$/.test(entry)) {
      acc.push(full);
    }
  }
  return acc;
}

const allSources = collectSource(SRC);
const rel = (f: string) => f.replace(SRC + "/", "");

const stackImporters = allSources.filter((f) => {
  const src = stripCodeSamples(readFileSync(f, "utf8"));
  return (
    /import\s*\{[^}]*\bStack\b[^}]*\}\s*from\s*["']@full-stack-ds\/react["']/.test(src) ||
    /<\w+\.Stack[\s>/]/.test(src)
  );
});

/** Surfaces that must keep their Stack adoption — the load-bearing chrome. */
const REQUIRED_STACK_SURFACES = [
  "layout/Header.tsx",
  "views/Home.tsx",
  "views/TokensView.tsx",
  "views/DeveloperView.tsx",
  "views/DisplayCaseView.tsx",
  "views/ComponentViewTabs.tsx",
  "views/sections/Anatomy.tsx",
  "components/CodeViewer.tsx",
  "runtime/FrameworkPreview.tsx",
] as const;

/** Views/sections/layout files the inline-flex sweep runs over. */
const layoutFiles = allSources.filter((f) =>
  /\/(views|layout|components|runtime)\//.test(f),
);

describe("Stack layout consumption guard (SHOWCASE-STACK-LAYOUT-01)", () => {
  it("A1: Stack is statically imported from @full-stack-ds/react across a broad surface", () => {
    expect(stackImporters.length).toBeGreaterThanOrEqual(8);
    const have = new Set(stackImporters.map(rel));
    const missing = REQUIRED_STACK_SURFACES.filter((s) => !have.has(s));
    expect(
      missing,
      `these surfaces lost their Stack import: ${missing.join(", ")}`,
    ).toEqual([]);
  });

  it("A2: no hand-rolled inline flex axis in views/sections/layout/components/runtime", () => {
    const offenders: string[] = [];
    for (const f of layoutFiles) {
      const src = stripCodeSamples(readFileSync(f, "utf8"));
      if (INLINE_AXIS_FLEX.test(src)) offenders.push(rel(f));
      INLINE_AXIS_FLEX.lastIndex = 0;
    }
    expect(
      offenders,
      `inline axis-flex found — use <Stack variant=…> (+ stack-gap-* for non-default gaps): ${offenders.join(", ")}`,
    ).toEqual([]);
  });

  it("A3: app.css remaps the Stack gap token via stack-gap-* utilities", () => {
    const css = readFileSync(join(SRC, "styles/app.css"), "utf8");
    for (const size of ["03", "04", "05", "06", "07"]) {
      expect(
        css,
        `.stack-gap-${size} utility must remap the semantic gap token`,
      ).toMatch(
        new RegExp(
          `\\.stack-gap-${size}\\s*\\{[^}]*--fsds-semantic-spacing-gap-stack:\\s*var\\(--fsds-core-spacing-size-${size}\\)`,
        ),
      );
    }
  });

  it("A4: rules Stack absorbed no longer declare display:flex (axis is Stack's job)", () => {
    const css = readFileSync(join(SRC, "styles/app.css"), "utf8").replace(
      /\/\*[\s\S]*?\*\//g,
      "",
    );
    const absorbed = [
      "section-header",
      "brand",
      "panel-toolbar",
      "preview-status",
      "tokens-controls",
      "anatomy-key",
      "display-case-header",
    ];
    for (const sel of absorbed) {
      expect(
        css,
        `.${sel} must not hand-roll display:flex — its axis rides on Stack`,
      ).not.toMatch(new RegExp(`\\.${sel}(?![-\\w])[^{}]*\\{[^{}]*display:\\s*(inline-)?flex`));
    }
  });

  it("negative control: the guards actually bite", () => {
    const bad = `const x = <div style={{ display: "flex" }}>x</div>;`;
    expect(stripCodeSamples(bad).match(INLINE_AXIS_FLEX)).not.toBeNull();
    // A <div style="flex"> shown inside a doc-sample template literal is not DOM.
    const docSample =
      "const sample = `" + '<div style={{ display: "flex" }}>x</div>' + "`;";
    expect(stripCodeSamples(docSample).match(INLINE_AXIS_FLEX)).toBeNull();
    // Single-child centering chips stay legal.
    expect(`style={{ display: "inline-flex" }}`.match(INLINE_AXIS_FLEX)).toBeNull();
  });
});
