import { describe, expect, it } from "vitest";
import {
  indexResolvedTree,
  overlayBrand,
  resolveBrandValue,
} from "./brand-overlay.js";

/**
 * A miniature resolved tree with the same shape as resolved.tokens.json:
 * leaves carry `$value`, which is either a hex string or a {light,dark} pair.
 */
function baseTree() {
  return {
    core: {
      color: {
        palette: {
          blue: { 500: { $type: "color", $value: "#0566fe" } },
          neutral: { 50: { $type: "color", $value: "#e9e9e9" } },
        },
        mode: { white: { $type: "color", $value: "#ffffff" } },
      },
    },
    semantic: {
      color: {
        foreground: {
          onColor: { $type: "color", $value: { light: "#ffffff", dark: "#ffffff" } },
        },
        background: {
          accent: { $type: "color", $value: { light: "#d92d2e", dark: "#d92d2e" } },
        },
      },
    },
  };
}

const V_ONCOLOR = "--fsds-semantic-color-foreground-on-color";
const V_ACCENT = "--fsds-semantic-color-background-accent";

function valueAt(tree: unknown, path: string[], theme: "light" | "dark") {
  let node = tree as Record<string, unknown>;
  for (const seg of path) node = node[seg] as Record<string, unknown>;
  const v = (node as Record<string, unknown>).$value;
  if (typeof v === "string") return v;
  return (v as Record<string, string>)[theme];
}

describe("indexResolvedTree", () => {
  it("maps every leaf's dotted path to its CSS variable name", () => {
    const { varToPath } = indexResolvedTree(baseTree(), "light");
    expect(varToPath.get(V_ONCOLOR)).toEqual([
      "semantic",
      "color",
      "foreground",
      "onColor",
    ]);
  });

  it("indexes the hex for the requested theme, not always light", () => {
    const tree = baseTree();
    tree.semantic.color.background.accent.$value = {
      light: "#111111",
      dark: "#222222",
    };
    expect(indexResolvedTree(tree, "dark").varToHex.get(V_ACCENT)).toBe("#222222");
    expect(indexResolvedTree(tree, "light").varToHex.get(V_ACCENT)).toBe("#111111");
  });
});

describe("resolveBrandValue", () => {
  const { varToHex } = indexResolvedTree(baseTree(), "light");

  it("dereferences a single var() into the indexed hex", () => {
    expect(
      resolveBrandValue("var(--fsds-core-color-palette-blue-500)", varToHex),
    ).toBe("#0566fe");
  });

  it("passes a literal hex through unchanged", () => {
    expect(resolveBrandValue("#abcdef", varToHex)).toBe("#abcdef");
  });

  it("honours a var() fallback form without mistaking the fallback for the value", () => {
    expect(
      resolveBrandValue(
        "var(--fsds-core-color-palette-blue-500, #000000)",
        varToHex,
      ),
    ).toBe("#0566fe");
  });

  it("returns null for a var() naming a token absent from the tree", () => {
    expect(resolveBrandValue("var(--fsds-not-a-token)", varToHex)).toBeNull();
  });

  it("returns null for a multi-part value that is not a single colour", () => {
    expect(
      resolveBrandValue("0 1px 2px var(--fsds-core-color-mode-white)", varToHex),
    ).toBeNull();
  });
});

describe("overlayBrand", () => {
  // Both override values differ from the base (#ffffff) and from each other,
  // so neither assertion can pass by coinciding with the un-overlaid tree.
  const brand = {
    lightVars: { [V_ONCOLOR]: "var(--fsds-core-color-palette-neutral-50)" },
    darkVars: { [V_ONCOLOR]: "var(--fsds-core-color-palette-blue-500)" },
  };

  it("applies the brand's light override in the light theme", () => {
    const out = overlayBrand(baseTree(), brand, "light");
    expect(
      valueAt(out, ["semantic", "color", "foreground", "onColor"], "light"),
    ).toBe("#e9e9e9");
  });

  it("layers dark vars over light vars in the dark theme", () => {
    const out = overlayBrand(baseTree(), brand, "dark");
    // #0566fe is the dark var; #e9e9e9 would mean dark never layered over
    // light, and #ffffff would mean no overlay happened at all.
    expect(
      valueAt(out, ["semantic", "color", "foreground", "onColor"], "dark"),
    ).toBe("#0566fe");
  });

  it("falls back to the brand's light value in dark when no dark var is declared", () => {
    const lightOnly = { lightVars: brand.lightVars, darkVars: {} };
    const out = overlayBrand(baseTree(), lightOnly, "dark");
    expect(
      valueAt(out, ["semantic", "color", "foreground", "onColor"], "dark"),
    ).toBe("#e9e9e9");
  });

  it("leaves tokens the brand does not override at their base value", () => {
    const out = overlayBrand(baseTree(), brand, "light");
    expect(
      valueAt(out, ["semantic", "color", "background", "accent"], "light"),
    ).toBe("#d92d2e");
  });

  it("does not mutate the base tree it was given", () => {
    const base = baseTree();
    overlayBrand(base, brand, "light");
    expect(base.semantic.color.foreground.onColor.$value).toEqual({
      light: "#ffffff",
      dark: "#ffffff",
    });
  });

  it("ignores a brand override naming a token the base layer does not define", () => {
    const rogue = {
      lightVars: { "--fsds-semantic-color-foreground-invented": "#123456" },
      darkVars: {},
    };
    expect(() => overlayBrand(baseTree(), rogue, "light")).not.toThrow();
  });

  it("skips an unresolvable override rather than writing a non-colour into the tree", () => {
    const bad = {
      lightVars: { [V_ONCOLOR]: "var(--fsds-does-not-exist)" },
      darkVars: {},
    };
    const out = overlayBrand(baseTree(), bad, "light");
    expect(
      valueAt(out, ["semantic", "color", "foreground", "onColor"], "light"),
    ).toBe("#ffffff");
  });
});

describe("the overlay is load-bearing for the gate", () => {
  /**
   * Guards the vacuous-pass failure mode: if overlayBrand silently returned
   * the base tree, the brand dimension of the contrast gate would evaluate the
   * same 44 pairs 10 extra times and never catch a brand-specific regression.
   * This pins that a brand override actually changes the value the gate reads.
   */
  it("changes the value a contrast check would read for an overridden token", () => {
    const brand = {
      lightVars: { [V_ACCENT]: "var(--fsds-core-color-palette-blue-500)" },
      darkVars: {},
    };
    const before = valueAt(
      baseTree(),
      ["semantic", "color", "background", "accent"],
      "light",
    );
    const after = valueAt(
      overlayBrand(baseTree(), brand, "light"),
      ["semantic", "color", "background", "accent"],
      "light",
    );
    expect(before).toBe("#d92d2e");
    expect(after).toBe("#0566fe");
    expect(after).not.toBe(before);
  });
});
