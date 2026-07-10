import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import type { ComponentContract } from "../../contract.js";
import { buildComponentIR } from "../../ir.js";
import { generateAngularComponentSource } from "./component-source.js";

/**
 * ICON-CATALOG-RUNTIME-DELIVERY-01: the Angular emitter must lower an
 * `iconGlyph` directive (declared on Icon's `svg` DOM node) to a catalog
 * lookup — a `resolveIcon` import, class getters resolving the requested
 * pixel size and the catalog record, and a template that null-guards the
 * svg and renders one `<path>` per glyph path record via `*ngFor`. Loads
 * the real Icon contract off disk (mirroring ir.test.ts's loadContract
 * pattern) so this pins the emitter against the authored contract shape,
 * not a hand-rolled fixture that could drift from it.
 */

const CONTRACTS_ROOT = resolve(__dirname, "../../../../ds-contracts");

function loadContract(name: string): ComponentContract {
  const raw = readFileSync(
    resolve(CONTRACTS_ROOT, "components", name, `${name}.contract.json`),
    "utf8",
  );
  return JSON.parse(raw) as ComponentContract;
}

describe("Angular emitter: iconGlyph lowering (Icon contract)", () => {
  const source = generateAngularComponentSource(buildComponentIR(loadContract("Icon")));

  it("imports resolveIcon from the committed iconography package-root module", () => {
    expect(source).toContain(
      'import { resolveIcon } from "@full-stack-ds/iconography";',
    );
  });

  it("exposes a class getter resolving the catalog lookup with a Number.NaN size fallback", () => {
    // Unknown icon name resolves to undefined; Number.NaN deliberately
    // matches no authored size so resolveIcon falls back to the smallest
    // authored variant when no size const is available.
    expect(source).toMatch(/get iconGlyph\(\) \{\s*\n\s*return resolveIcon\(this\.name, this\.iconGlyphPx \?\? Number\.NaN\);/);
  });

  it("null-guards the svg with *ngIf aliasing the resolved glyph", () => {
    expect(source).toContain('*ngIf="iconGlyph as glyph"');
  });

  it("stamps data-fsds-icon from the aliased glyph local", () => {
    expect(source).toContain('[attr.data-fsds-icon]="glyph.name"');
  });

  it("binds viewBox from the aliased glyph local", () => {
    expect(source).toContain('[attr.viewBox]="glyph.viewBox"');
  });

  it("renders one <path> per glyph path record via *ngFor with kebab attribute bindings", () => {
    expect(source).toContain('*ngFor="let glyphPath of glyph.paths"');
    expect(source).toContain('[attr.d]="glyphPath.d"');
    expect(source).toContain('[attr.stroke-linecap]="glyphPath.strokeLineCap"');
    expect(source).toContain('[attr.stroke-linejoin]="glyphPath.strokeLineJoin"');
    expect(source).toContain('[attr.stroke-dasharray]="glyphPath.strokeDasharray"');
    expect(source).toContain('[attr.fill-rule]="glyphPath.fillRule"');
    expect(source).toContain('[attr.clip-rule]="glyphPath.clipRule"');
  });

  it("declares the size-hints map from the contract's authored sizeHints", () => {
    expect(source).toContain(
      'const ICON_GLYPH_SIZE_HINTS: Record<string, number> = { "sm": 16, "md": 20, "lg": 24, "xl": 32 };',
    );
  });

  it("does not lower iconGlyph on a component whose contract declares none", () => {
    // Negative control: a plain Stack-only component (no anatomy.dom at
    // all) must not pick up any iconGlyph scaffolding. Guards against the
    // structural check firing unconditionally.
    const plainContract: ComponentContract = {
      name: "PlainProbe",
      cssPrefix: "plain-probe",
      anatomy: { parts: ["root"] },
    } as ComponentContract;
    const plainSource = generateAngularComponentSource(
      buildComponentIR(plainContract),
    );
    expect(plainSource).not.toContain("resolveIcon");
    expect(plainSource).not.toContain("iconGlyph");
  });
});
