import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import {
  deriveControls,
  tokenOverridesToCss,
  tokenOverridesToStyle,
  slotToCssVar,
  resolvesToCssVar,
  resolveBoxModel,
  deriveBoxConstraints,
  boxModelRolePathPattern,
  resolveFillColor,
  resolveTypography,
} from "./control-derivation";
import type { ComponentContract, TokenDefinition } from "../../types/data";

// Load real corpus contracts (+ their token sidecars) exactly as the showcase
// bundle does — contract JSON with the flat <Name>.tokens.json attached as
// contract.tokens (see vite-plugin-fsds-data.ts:382). Asserting against real
// contracts, not hand-built fixtures, keeps these tests honest: if the corpus
// shape drifts, the derivation contract is re-checked.
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CONTRACTS = path.resolve(
  __dirname,
  "../../../packages/ds-contracts/components",
);

function loadContract(name: string): ComponentContract {
  const contract = JSON.parse(
    readFileSync(path.join(CONTRACTS, name, `${name}.contract.json`), "utf-8"),
  ) as ComponentContract;
  try {
    const tokens = JSON.parse(
      readFileSync(path.join(CONTRACTS, name, `${name}.tokens.json`), "utf-8"),
    ) as Record<string, TokenDefinition>;
    (contract as { tokens?: unknown }).tokens = tokens;
  } catch {
    // No sidecar — component has zero tokens (a supported state).
  }
  return contract;
}

describe("deriveControls — variant axes", () => {
  it("derives Button's size and variant axes as selects with the contract's options + defaults", () => {
    const { variantAxes } = deriveControls(loadContract("Button"));
    const byName = Object.fromEntries(variantAxes.map((a) => [a.name, a]));

    expect(Object.keys(byName).sort()).toEqual(["size", "variant"]);

    const size = byName.size;
    expect(size.kind).toBe("select");
    expect(size).toMatchObject({
      name: "size",
      options: ["small", "medium", "large"],
      defaultValue: "medium", // from props.designed member default
      isVariantAxis: true,
    });

    const variant = byName.variant;
    expect(variant).toMatchObject({
      options: [
        "primary",
        "secondary",
        "tertiary",
        "ghost",
        "destructive",
        "outline",
      ],
      defaultValue: "primary",
      isVariantAxis: true,
    });
    // Artifact: print the derived axes so the runtime evidence is concrete.
    console.log("Button variantAxes:", JSON.stringify(variantAxes, null, 2));
  });
});

describe("deriveControls — props (typed, de-duplicated against axes)", () => {
  it("maps Button's boolean/string props to toggle/text controls and does NOT repeat variant axes", () => {
    const { props } = deriveControls(loadContract("Button"));
    const byName = Object.fromEntries(props.map((p) => [p.name, p]));

    // size/variant/type are variant axes or enum refs handled in their own
    // section — they must not appear in props.
    expect(byName.size).toBeUndefined();
    expect(byName.variant).toBeUndefined();

    expect(byName.loading?.kind).toBe("boolean");
    expect(byName.disabled?.kind).toBe("boolean");
    expect(byName.ariaLabel?.kind).toBe("text");
    expect(byName.ariaPressed?.kind).toBe("boolean");

    // callbacks/arrays are omitted — Button has none, so just assert no
    // unexpected non-editable control leaked in.
    for (const p of props) {
      expect(["select", "boolean", "number", "text"]).toContain(p.kind);
    }
    console.log(
      "Button props:",
      JSON.stringify(props.map((p) => ({ name: p.name, kind: p.kind })), null, 2),
    );
  });

  it("maps Truncate's number prop to a number control and omits its callback", () => {
    const { props } = deriveControls(loadContract("Truncate"));
    const byName = Object.fromEntries(props.map((p) => [p.name, p]));

    expect(byName.lines?.kind).toBe("number");
    expect(byName.expandable?.kind).toBe("boolean");
    expect(byName.expandText).toMatchObject({
      kind: "text",
      defaultValue: "Show more",
    });
    // onExpandedChange is a callback → must be omitted (no inline editor).
    expect(byName.onExpandedChange).toBeUndefined();
    console.log(
      "Truncate props:",
      JSON.stringify(props.map((p) => ({ name: p.name, kind: p.kind })), null, 2),
    );
  });
});

describe("deriveControls — component tokens", () => {
  it("derives Button token rows with cssVar, fallback, resolvesTo, and color detection", () => {
    const { tokens } = deriveControls(loadContract("Button"));
    expect(tokens.length).toBeGreaterThan(0);

    const bySlot = Object.fromEntries(tokens.map((t) => [t.slot, t]));

    // A color token: fallback is a hex → isColor true, cssVar derived.
    const bg = bySlot["button.color.background.default"];
    expect(bg).toBeDefined();
    expect(bg.cssVar).toBe("--fsds-button-color-background-default");
    expect(bg.isColor).toBe(true);
    expect(bg.fallback?.startsWith("#")).toBe(true);
    expect(bg.resolvesTo).toBe(
      "semantic.color.action.background.primary.default",
    );

    // A dimensional token: fallback like "8px" → not a color.
    const gap = bySlot["box-model.gap"];
    expect(gap).toBeDefined();
    expect(gap.cssVar).toBe("--fsds-box-model-gap");
    expect(gap.isColor).toBe(false);
    expect(gap.fallback).toBe("8px");

    console.log(
      "Button token rows (first 4):",
      JSON.stringify(tokens.slice(0, 4), null, 2),
    );
  });
});

describe("slotToCssVar", () => {
  it("lowers dotted slots to --fsds- dashed custom properties", () => {
    expect(slotToCssVar("button.color.background.default")).toBe(
      "--fsds-button-color-background-default",
    );
    expect(slotToCssVar("box-model.gap")).toBe("--fsds-box-model-gap");
  });
});

describe("resolveBoxModel", () => {
  it("maps padding sides + gap + min-width + radius + border from Button's real tokens, and omits margins", () => {
    const { tokens } = deriveControls(loadContract("Button"));
    const bindings = resolveBoxModel(tokens);
    const byRole = Object.fromEntries(bindings.map((b) => [b.role, b.row.slot]));

    expect(byRole["padding-top"]).toBe("box-model.padding-block-start");
    expect(byRole["padding-bottom"]).toBe("box-model.padding-block-end");
    expect(byRole["padding-left"]).toBe("box-model.padding-inline-start");
    expect(byRole["padding-right"]).toBe("box-model.padding-inline-end");
    expect(byRole["gap"]).toBe("box-model.gap");
    expect(byRole["min-width"]).toBe("box-model.min-width");
    // Button has a component-prefixed radius + border (not box-model.*).
    expect(byRole["radius"]).toBe("button.size.radius");
    expect(byRole["border"]).toBe("button.size.border");
    // No margin role exists at all — components don't own outer margin.
    expect(bindings.find((b) => String(b.role).includes("margin"))).toBeUndefined();

    console.log("Button box-model bindings:", JSON.stringify(byRole, null, 2));
  });

  it("resolves Dialog's component-prefixed radius (dialog.size.radius.default)", () => {
    const { tokens } = deriveControls(loadContract("Dialog"));
    const byRole = Object.fromEntries(
      resolveBoxModel(tokens).map((b) => [b.role, b.row.slot]),
    );
    expect(byRole["padding-top"]).toBe("box-model.padding-block-start");
    expect(byRole["radius"]).toBe("dialog.size.radius.default");
    console.log("Dialog box-model bindings:", JSON.stringify(byRole, null, 2));
  });

  it("does not reuse one slot for two roles", () => {
    const { tokens } = deriveControls(loadContract("Button"));
    const slots = resolveBoxModel(tokens).map((b) => b.row.slot);
    expect(new Set(slots).size).toBe(slots.length);
  });

  it("resolves min-height for the Layout H field", () => {
    const { tokens } = deriveControls(loadContract("Button"));
    const byRole = Object.fromEntries(
      resolveBoxModel(tokens).map((b) => [b.role, b.row.slot]),
    );
    expect(byRole["min-height"]).toBe("box-model.min-height");
    expect(byRole["min-width"]).toBe("box-model.min-width");
  });
});

describe("deriveBoxConstraints", () => {
  it("reports Button's block axis floored by min-height", () => {
    const { tokens } = deriveControls(loadContract("Button"));
    const constraints = deriveBoxConstraints(resolveBoxModel(tokens));
    const byAxis = Object.fromEntries(constraints.map((c) => [c.axis, c]));

    const block = byAxis.block;
    expect(block).toBeDefined();
    expect(block.label).toBe("Height");
    expect(block.floor?.slot).toBe("box-model.min-height");
    expect(block.paddingRoles).toEqual(["padding-top", "padding-bottom"]);

    const inline = byAxis.inline;
    expect(inline?.floor?.slot).toBe("box-model.min-width");
    console.log("Button constraints:", JSON.stringify(constraints, null, 2));
  });

  it("omits an axis that has padding but no floor/cap token", () => {
    // Synthetic padding-only rows: an edit can't be absorbed by anything, so
    // there is nothing to caption.
    const rows = [
      {
        slot: "box-model.padding-block-start",
        fallback: "8px",
        isColor: false,
        cssVar: "--x1",
      },
      {
        slot: "box-model.padding-inline-start",
        fallback: "12px",
        isColor: false,
        cssVar: "--x2",
      },
    ] as Parameters<typeof resolveBoxModel>[0];
    expect(deriveBoxConstraints(resolveBoxModel(rows))).toEqual([]);
  });
});

describe("resolveFillColor", () => {
  it("resolves Button's primary background color token (background.default)", () => {
    const { tokens } = deriveControls(loadContract("Button"));
    const fill = resolveFillColor(tokens);
    expect(fill?.slot).toBe("button.color.background.default");
    expect(fill?.isColor).toBe(true);
    expect(fill?.fallback?.startsWith("#")).toBe(true);
    console.log("Button fill:", JSON.stringify(fill, null, 2));
  });

  it("returns null for a component with no color tokens", () => {
    // A synthetic token set with only dimensions → no fill.
    const dims = [
      { slot: "box-model.gap", fallback: "8px", isColor: false, cssVar: "--x" },
    ] as Parameters<typeof resolveFillColor>[0];
    expect(resolveFillColor(dims)).toBeNull();
  });
});

describe("resolveTypography", () => {
  it("resolves Button's font-size + font-weight tokens", () => {
    const { tokens } = deriveControls(loadContract("Button"));
    const byRole = Object.fromEntries(
      resolveTypography(tokens).map((b) => [b.role, b.row.slot]),
    );
    expect(byRole["font-size"]).toBe("button.size.fontSize.medium");
    expect(byRole["font-weight"]).toBe("button.text.weight");
    console.log("Button typography:", JSON.stringify(byRole, null, 2));
  });

  it("omits roles a component has no token for (no font-family on Button)", () => {
    const { tokens } = deriveControls(loadContract("Button"));
    const roles = resolveTypography(tokens).map((b) => b.role);
    expect(roles).not.toContain("font-family");
  });
});

describe("boxModelRolePathPattern — rebind picker offers the right token family", () => {
  // Real resolved-token paths (carry the core./semantic. layer prefix), so the
  // pattern is tested against the actual shape of bundle.foundationTokens.
  const RADIUS = "core.shape.radius.04"; // 16px
  const SPACING = "core.spacing.size.04"; // 8px
  const BORDER_W = "core.shape.border.width.hairline"; // 1px
  const DENSITY = "core.density.scale.comfortable";
  const COLOR = "core.color.palette.red.500";

  it("radius role matches shape.radius tokens and NOT density/color/spacing/border", () => {
    const re = boxModelRolePathPattern("radius");
    expect(re.test(RADIUS)).toBe(true);
    expect(re.test(DENSITY)).toBe(false);
    expect(re.test(COLOR)).toBe(false);
    expect(re.test(SPACING)).toBe(false);
    expect(re.test(BORDER_W)).toBe(false);
  });

  it("padding/gap roles match spacing tokens and NOT radius/color", () => {
    for (const role of ["padding-top", "padding-left", "gap"] as const) {
      const re = boxModelRolePathPattern(role);
      expect(re.test(SPACING)).toBe(true);
      expect(re.test(RADIUS)).toBe(false);
      expect(re.test(COLOR)).toBe(false);
    }
  });

  it("border role matches border.width tokens only", () => {
    const re = boxModelRolePathPattern("border");
    expect(re.test(BORDER_W)).toBe(true);
    expect(re.test(RADIUS)).toBe(false);
    expect(re.test(SPACING)).toBe(false);
  });
});

describe("resolvesToCssVar", () => {
  it("maps a resolvesTo path to the semantic/core var the component reads", () => {
    expect(
      resolvesToCssVar("semantic.color.action.background.primary.default"),
    ).toBe("--fsds-semantic-color-action-background-primary-default");
    expect(resolvesToCssVar("core.spacing.size.04")).toBe(
      "--fsds-core-spacing-size-04",
    );
  });
});

describe("tokenOverridesToCss", () => {
  it("emits exact :root custom-property declarations for non-blank overrides", () => {
    const css = tokenOverridesToCss({
      "button.color.background.default": "#0a7",
      "box-model.gap": "12px",
    });
    expect(css).toBe(
      ":root {\n" +
        "  --fsds-button-color-background-default: #0a7;\n" +
        "  --fsds-box-model-gap: 12px;\n" +
        "}\n",
    );
    console.log("tokenOverridesToCss output:\n" + css);
  });

  it("drops blank/empty values (cleared field reverts to default) and returns '' when nothing remains", () => {
    expect(
      tokenOverridesToCss({
        "button.color.background.default": "  ",
        "box-model.gap": "",
      }),
    ).toBe("");
    // A mix: only the non-blank one survives.
    expect(
      tokenOverridesToCss({
        "button.color.background.default": "#fff",
        "box-model.gap": "",
      }),
    ).toBe(":root {\n  --fsds-button-color-background-default: #fff;\n}\n");
  });

  it("ALSO overrides the semantic var (resolvesTo) when rows are supplied, so the override wins over variant rules", () => {
    // Regression guard for the cascade bug found in live verification: a :root
    // override of the slot var alone is masked by `.button--primary` re-deriving
    // it from the semantic token. Emitting the semantic var too fixes it.
    const { tokens } = deriveControls(loadContract("Button"));
    const css = tokenOverridesToCss(
      { "button.color.background.default": "#0a7d4f" },
      tokens,
    );
    // Slot var (for non-variant components) AND the semantic var the variant
    // rule reads (button.color.background.default resolvesTo
    // semantic.color.action.background.primary.default).
    expect(css).toContain("--fsds-button-color-background-default: #0a7d4f;");
    expect(css).toContain(
      "--fsds-semantic-color-action-background-primary-default: #0a7d4f;",
    );
    console.log("tokenOverridesToCss (with rows) output:\n" + css);
  });

  it("emits only the slot var for a token with no resolvesTo, even with rows", () => {
    const rows = [
      { slot: "custom.thing", cssVar: "--fsds-custom-thing", isColor: false },
    ] as Parameters<typeof tokenOverridesToCss>[1];
    expect(tokenOverridesToCss({ "custom.thing": "4px" }, rows)).toBe(
      ":root {\n  --fsds-custom-thing: 4px;\n}\n",
    );
  });
});

describe("tokenOverridesToStyle", () => {
  it("lowers overrides to scoped custom-property pairs, expanding resolvesTo", () => {
    const { tokens } = deriveControls(loadContract("Button"));
    const style = tokenOverridesToStyle(
      { "button.color.background.default": "#0a7d4f", "box-model.gap": "" },
      tokens,
    );
    // Blank gap dropped; slot var AND its semantic leaf both set, same
    // semantics as tokenOverridesToCss but as an inline-style object.
    expect(style).toEqual({
      "--fsds-button-color-background-default": "#0a7d4f",
      "--fsds-semantic-color-action-background-primary-default": "#0a7d4f",
    });
    console.log("tokenOverridesToStyle output:", JSON.stringify(style, null, 2));
  });
});

// ---- Material-surface projection (MATERIAL-SURFACE-PROJECTION-AUTHORITY-01) --
//
// The editor must read the normalized primitive < morphology-profile <
// authored-sidecar surface, with provenance — not raw sidecar presence.

import { materialTokenRows } from "./control-derivation";
import { buildBoxModelSurface } from "../../../material-surface";
import { mergeBoxModelDefaults } from "../../../packages/ds-codegen/src/box-model.js";

function materialRowsFor(name: string) {
  const contract = loadContract(name);
  return materialTokenRows({
    contract,
    boxModelSurface: buildBoxModelSurface(contract.tokens, contract.morphology),
  });
}

describe("material surface projection", () => {
  it("keeps Button's authored semantic floors intact (A4 regression)", () => {
    const rows = materialRowsFor("Button");
    const byRole = Object.fromEntries(
      resolveBoxModel(rows).map((b) => [b.role, b.row]),
    );
    expect(byRole["min-height"].slot).toBe("box-model.min-height");
    expect(byRole["min-height"].source).toBe("authored");
    expect(byRole["min-height"].resolvesTo).toBe(
      "semantic.action.size.medium.min-height",
    );
    // Constraint captions unchanged: block axis floored at the authored 36px.
    const constraints = deriveBoxConstraints(resolveBoxModel(rows));
    const block = constraints.find((c) => c.axis === "block");
    expect(block?.floor?.fallback).toBe("36px");
  });

  it("surfaces Badge's inherited slots without authored sidecar entries (A4)", () => {
    const rows = materialRowsFor("Badge");
    const byRole = Object.fromEntries(
      resolveBoxModel(rows).map((b) => [b.role, b.row]),
    );
    // content-inline morphology profile supplies padding + the min-height
    // floor; the primitive backstops min-width at 0.
    expect(byRole["padding-top"]).toMatchObject({
      slot: "box-model.padding-block-start",
      fallback: "2px",
      source: "morphology-profile",
    });
    expect(byRole["min-height"]).toMatchObject({
      resolvesTo: "semantic.glyph.size.medium.extent",
      source: "morphology-profile",
    });
    expect(byRole["min-width"]).toMatchObject({
      fallback: "0",
      source: "primitive-default",
    });
    console.log(
      "Badge material box-model:",
      JSON.stringify(
        Object.fromEntries(
          Object.entries(byRole).map(([role, r]) => [
            role,
            { slot: r.slot, value: r.fallback ?? "", source: r.source },
          ]),
        ),
        null,
        2,
      ),
    );
  });

  it("only captions meaningful floors: Badge gets a block constraint, not an inline one", () => {
    const constraints = deriveBoxConstraints(
      resolveBoxModel(materialRowsFor("Badge")),
    );
    const axes = constraints.map((c) => c.axis);
    expect(axes).toContain("block"); // glyph-extent floor from the profile
    expect(axes).not.toContain("inline"); // primitive 0 floors caption nothing
  });

  it("projects values byte-equal to codegen's mergeBoxModelDefaults (anti-drift)", () => {
    for (const name of ["Button", "Badge", "Avatar", "Progress", "Skeleton"]) {
      const contract = loadContract(name);
      const surface = buildBoxModelSurface(contract.tokens, contract.morphology);
      const merged = mergeBoxModelDefaults(
        Object.fromEntries(
          Object.entries(contract.tokens ?? {}).filter(([k]) =>
            k.startsWith("box-model."),
          ),
        ),
        undefined,
        contract.morphology,
      );
      for (const slot of surface) {
        const expected = merged[slot.slot];
        expect(
          { resolvesTo: slot.resolvesTo, fallback: slot.fallback, literal: slot.literal },
          `${name} ${slot.slot}`,
        ).toMatchObject({
          resolvesTo: expected.resolvesTo,
          fallback: expected.fallback,
          literal: expected.literal,
        });
      }
      expect(surface.length).toBe(Object.keys(merged).length);
    }
  });

  it("fixed-square / linear-meter extents resolve to width/height roles", () => {
    const avatar = Object.fromEntries(
      resolveBoxModel(materialRowsFor("Avatar")).map((b) => [b.role, b.row]),
    );
    expect(avatar["width"]).toMatchObject({
      slot: "box-model.width",
      resolvesTo: "semantic.glyph.size.medium.extent",
      source: "morphology-profile",
    });
    const progress = Object.fromEntries(
      resolveBoxModel(materialRowsFor("Progress")).map((b) => [b.role, b.row]),
    );
    expect(progress["height"]).toMatchObject({
      slot: "box-model.height",
      fallback: "8px",
      source: "morphology-profile",
    });
  });
});
