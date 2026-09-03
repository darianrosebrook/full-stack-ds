/**
 * Pins the cascade contract between `@layer theme` and `@layer brand`.
 *
 * The layer order is `core, semantic, components, theme, brand, density`, so
 * ANY rule in the brand layer beats EVERY rule in the theme layer regardless
 * of selector specificity. The default brand is emitted unscoped at `:root`
 * (so an unbranded page still gets the project's canonical look), which means
 * its `@media (prefers-color-scheme: dark) { :root { … } }` block outranks the
 * theme layer's own `[data-theme="light"]` rule.
 *
 * Without an unscoped light guard inside that same media query, a page that
 * explicitly selects the light theme on a dark-preference OS resolves every
 * default-brand-overridden token to its DARK value. The brand-scoped guard the
 * generator already emits cannot cover it, because that guard requires
 * `[data-brand="default"]` and an unbranded page carries no such attribute.
 */
import { describe, expect, it } from "vitest";
import {
  generateBrandLayerCSS,
  type BrandId,
  type BrandOverrides,
} from "./global.js";

const LIGHT = "--fsds-semantic-color-border-light";

function brand(
  id: string,
  lightVars: Record<string, string>,
  darkVars: Record<string, string>,
): [BrandId, BrandOverrides] {
  return [
    id as BrandId,
    {
      metadata: { id, name: id } as BrandOverrides["metadata"],
      lightVars,
      darkVars,
      componentVars: new Map(),
    },
  ];
}

function defaultBrandCss(): string {
  return generateBrandLayerCSS(
    new Map([
      brand(
        "default",
        { [LIGHT]: "var(--fsds-core-color-palette-neutral-200)" },
        { [LIGHT]: "var(--fsds-core-color-palette-neutral-700)" },
      ),
    ]),
  );
}

/** The body of the `@media (prefers-color-scheme: dark)` block that contains an unscoped `:root`. */
function unscopedDarkMediaBlock(css: string): string {
  const marker = "@media (prefers-color-scheme: dark) {";
  for (let i = css.indexOf(marker); i !== -1; i = css.indexOf(marker, i + 1)) {
    // Take the media block's text up to the next media block (or end).
    const next = css.indexOf(marker, i + 1);
    const chunk = css.slice(i, next === -1 ? undefined : next);
    // Only the unscoped one — the per-brand blocks select [data-brand=…].
    if (/\n\s*:root\s*\{/.test(chunk)) return chunk;
  }
  return "";
}

describe("default brand :root emission vs an explicit light theme", () => {
  it("emits the unscoped :root blocks that make an unbranded page inherit the default brand", () => {
    const css = defaultBrandCss();
    // Guards the premise: if this stops being unscoped, the rest of the
    // contract below is moot rather than silently vacuous.
    expect(css).toMatch(/\n\s*:root\s*\{/);
    expect(unscopedDarkMediaBlock(css)).not.toBe("");
  });

  it("pairs the unscoped dark :root with an unscoped light guard in the same media query", () => {
    const block = unscopedDarkMediaBlock(defaultBrandCss());
    // The guard must be unscoped. A [data-brand="default"] guard does not
    // match an unbranded page and would leave the bug in place.
    expect(block).toMatch(/\.light,\s*\[data-theme="light"\]\s*\{/);
  });

  it("gives the light guard the LIGHT value, not the dark one", () => {
    const block = unscopedDarkMediaBlock(defaultBrandCss());
    const guardStart = block.search(/\.light,\s*\[data-theme="light"\]\s*\{/);
    expect(guardStart).toBeGreaterThan(-1);
    // Bound the slice to the guard's OWN braces. Reading to the end of the
    // chunk would sweep in the sibling `.dark, [data-theme="dark"]` block,
    // which legitimately carries the dark value and would make the negative
    // assertion below fail for the wrong reason.
    const afterGuard = block.slice(guardStart);
    const guardBody = afterGuard.slice(0, afterGuard.indexOf("}") + 1);
    expect(guardBody).toContain(
      `${LIGHT}: var(--fsds-core-color-palette-neutral-200);`,
    );
    expect(guardBody).not.toContain(
      `${LIGHT}: var(--fsds-core-color-palette-neutral-700);`,
    );
  });

  it("orders the light guard AFTER the dark :root so it wins at equal specificity", () => {
    const block = unscopedDarkMediaBlock(defaultBrandCss());
    const rootIdx = block.search(/\n\s*:root\s*\{/);
    const guardIdx = block.search(/\.light,\s*\[data-theme="light"\]\s*\{/);
    expect(rootIdx).toBeGreaterThan(-1);
    expect(guardIdx).toBeGreaterThan(rootIdx);
  });

  it("still emits the dark value for an explicitly dark-themed page", () => {
    // The inverse guard: the fix must not trade the light bug for a dark one.
    const css = defaultBrandCss();
    expect(css).toMatch(
      /\.dark,\s*\[data-theme="dark"\]\s*\{[^}]*--fsds-semantic-color-border-light:\s*var\(--fsds-core-color-palette-neutral-700\);/,
    );
  });

  it("does not add an unscoped light guard for a NON-default brand", () => {
    // Only the default brand is emitted unscoped; adding an unscoped guard for
    // another brand would leak that brand's values onto unbranded pages.
    const css = generateBrandLayerCSS(
      new Map([
        brand(
          "corporate",
          { [LIGHT]: "var(--fsds-core-color-palette-blue-100)" },
          { [LIGHT]: "var(--fsds-core-color-palette-blue-700)" },
        ),
      ]),
    );
    expect(unscopedDarkMediaBlock(css)).toBe("");
    expect(css).not.toMatch(/\n\s*:root\s*\{/);
  });
});
