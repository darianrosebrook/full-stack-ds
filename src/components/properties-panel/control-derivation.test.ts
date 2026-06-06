import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import {
  deriveControls,
  tokenOverridesToCss,
  slotToCssVar,
  resolvesToCssVar,
  resolveBoxModel,
  boxModelRolePathPattern,
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
