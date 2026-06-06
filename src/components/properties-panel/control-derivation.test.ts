import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import {
  deriveControls,
  tokenOverridesToCss,
  slotToCssVar,
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
});
