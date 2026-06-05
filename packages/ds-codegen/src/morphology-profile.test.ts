/**
 * Morphology style-profile coverage (MORPHOLOGY-GEOMETRY-PROFILE-01).
 *
 * These are the LOCKING tests for the geometry mechanism: they prove the
 * merge precedence, the schema-validity of every profile's box-model defaults,
 * and the per-profile CSS facts — so migrating the seven scoped contracts is a
 * contract-fact change governed by tests, not a manual visual exercise.
 *
 * The invariants under test:
 *   1. Every profile's `boxModelDefaults` passes the SAME box-model schema the
 *      component sidecars validate against (keys ∈ closed slot pool, values in
 *      the literal vocabulary). Profile defaults are authored in TypeScript, so
 *      without this test a bad slot key / out-of-vocab literal would slip past
 *      the validation discipline that catches the same mistake in a sidecar.
 *   2. resolveStyleProfile branches on the morphology FACT only: absent /
 *      unrecognized → null (legacy behavior), known → the registered profile.
 *   3. Merge precedence is primitive < profile < sidecar. The profile fills
 *      only slots the author left unset; an authored sidecar entry always wins.
 *      Absent morphology is byte-identical to the prior two-way merge.
 *   4. computeCssBlocks emits each profile's structure (display / box-sizing /
 *      flow) and box-model slot values onto the component root, and emits
 *      NOTHING extra when morphology is absent.
 */
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import {
  STYLE_PROFILES,
  loadBoxModelPrimitive,
  mergeBoxModelDefaults,
  resolveStyleProfile,
  _resetBoxModelCache,
} from "./box-model.js";
import { computeCssBlocks } from "./ir.js";
import { createContractValidator } from "./validate.js";
import type {
  ComponentContract,
  ContractMorphology,
  TokenResolution,
} from "./contract.js";

const CONTRACTS_ROOT = resolve(__dirname, "../../ds-contracts");
const validator = createContractValidator({ contractsRoot: CONTRACTS_ROOT });

// The six morphology values declared by the schema + ComponentContract type.
const ALL_PROFILES: ContractMorphology[] = [
  "fixed-square",
  "content-inline",
  "identity-inline",
  "linear-meter",
  "loading-block",
  "replaced-media",
];

/** Minimal synthetic contract carrying a morphology, merged like cli.ts does. */
function makeContract(
  morphology: ContractMorphology | undefined,
  authored: Record<string, TokenResolution> = {},
): ComponentContract {
  return {
    name: "Probe",
    layer: "primitive",
    morphology,
    anatomy: { parts: ["root"] },
    tokens: mergeBoxModelDefaults(authored, undefined, morphology),
  } as ComponentContract;
}

/** Root-selector declaration map produced by computeCssBlocks. */
function rootDeclarations(
  contract: ComponentContract,
): Record<string, string> {
  const blocks = computeCssBlocks(contract, "probe");
  const root = blocks.find((b) => b.selector === ".probe");
  if (!root) throw new Error("no root block emitted");
  return root.declarations;
}

describe("STYLE_PROFILES registry shape", () => {
  it("registers exactly the six declared morphology values", () => {
    expect(Object.keys(STYLE_PROFILES).sort()).toEqual(
      [...ALL_PROFILES].sort(),
    );
  });

  it("every profile's boxModelDefaults passes the box-model schema", () => {
    // Footgun: profile defaults are authored in TS and would otherwise skip the
    // validation that component sidecars pass through. A bad slot name or an
    // out-of-vocabulary literal must fail HERE, not silently emit broken CSS.
    for (const morphology of ALL_PROFILES) {
      const profile = STYLE_PROFILES[morphology];
      const result = validator.validateBoxModelTokens(profile.boxModelDefaults);
      expect(result.ok, `profile ${morphology} boxModelDefaults invalid`).toBe(
        true,
      );
    }
  });

  it("every profile slot key is a member of the closed box-model pool", () => {
    _resetBoxModelCache();
    const { slotNames } = loadBoxModelPrimitive();
    for (const morphology of ALL_PROFILES) {
      for (const key of Object.keys(STYLE_PROFILES[morphology].boxModelDefaults)) {
        expect(slotNames.has(key), `${morphology}: ${key} not a box-model slot`).toBe(
          true,
        );
      }
    }
  });

  it("every profile contributes non-empty structural CSS", () => {
    for (const morphology of ALL_PROFILES) {
      const structure = STYLE_PROFILES[morphology].structure;
      expect(Object.keys(structure).length).toBeGreaterThan(0);
      for (const [prop, value] of Object.entries(structure)) {
        expect(prop).toMatch(/^[a-z-]+$/);
        expect(typeof value).toBe("string");
        expect(value.length).toBeGreaterThan(0);
      }
    }
  });
});

describe("resolveStyleProfile branches on the morphology fact", () => {
  it("returns null for absent morphology (legacy two-way merge)", () => {
    expect(resolveStyleProfile(undefined)).toBeNull();
  });

  it("returns null for an unrecognized morphology", () => {
    expect(resolveStyleProfile("not-a-real-morphology")).toBeNull();
  });

  it("returns the registered profile for each known morphology", () => {
    for (const morphology of ALL_PROFILES) {
      expect(resolveStyleProfile(morphology)).toBe(STYLE_PROFILES[morphology]);
    }
  });
});

describe("merge precedence: primitive < profile < sidecar", () => {
  it("absent morphology leaves the primitive default in place (back-compat)", () => {
    _resetBoxModelCache();
    const merged = mergeBoxModelDefaults(undefined, undefined, undefined);
    // fixed-square WOULD set width to the glyph extent; with no morphology the
    // primitive default (auto) must survive untouched.
    expect((merged["box-model.width"] as TokenResolution).literal).toBe("auto");
    expect((merged["box-model.height"] as TokenResolution).literal).toBe("auto");
  });

  it("profile defaults override the primitive default", () => {
    const merged = mergeBoxModelDefaults(undefined, undefined, "fixed-square");
    expect(merged["box-model.width"]).toEqual(
      STYLE_PROFILES["fixed-square"].boxModelDefaults["box-model.width"],
    );
    // A slot the profile does NOT set keeps the primitive default.
    expect((merged["box-model.gap"] as TokenResolution).literal).toBe("0");
  });

  it("authored sidecar wins over the profile default", () => {
    const authored: Record<string, TokenResolution> = {
      "box-model.width": { literal: "24px" },
    };
    const merged = mergeBoxModelDefaults(authored, undefined, "fixed-square");
    // Sidecar beats the profile's glyph-extent width.
    expect(merged["box-model.width"]).toEqual({ literal: "24px" });
    // The profile still fills the slot the sidecar left unset.
    expect(merged["box-model.height"]).toEqual(
      STYLE_PROFILES["fixed-square"].boxModelDefaults["box-model.height"],
    );
  });

  it("profile fills only slots the author left unset (content-inline)", () => {
    const authored: Record<string, TokenResolution> = {
      "box-model.padding-inline-start": { literal: "12px" },
    };
    const merged = mergeBoxModelDefaults(authored, undefined, "content-inline");
    expect(merged["box-model.padding-inline-start"]).toEqual({ literal: "12px" });
    // The profile's other padding slot is unaffected by the author override.
    expect(merged["box-model.padding-inline-end"]).toEqual({ literal: "8px" });
  });
});

describe("computeCssBlocks emits profile structure + slot values", () => {
  it("emits no structural defaults when morphology is absent", () => {
    const decls = rootDeclarations(makeContract(undefined));
    // The profile-only structural properties must not appear.
    expect(decls["display"]).toBeUndefined();
    expect(decls["box-sizing"]).toBeUndefined();
    expect(decls["align-items"]).toBeUndefined();
    // Box-model consumers + primitive slot values still flow (unchanged path).
    expect(decls["--fsds-box-model-width"]).toBe("auto");
  });

  it("content-inline: sizes to content with inline padding + min-height floor", () => {
    const decls = rootDeclarations(makeContract("content-inline"));
    expect(decls["display"]).toBe("inline-flex");
    expect(decls["align-items"]).toBe("center");
    expect(decls["box-sizing"]).toBe("border-box");
    // Width/height stay auto (no glyph-square clipping); min-height floors it.
    expect(decls["--fsds-box-model-width"]).toBe("auto");
    expect(decls["--fsds-box-model-height"]).toBe("auto");
    expect(decls["--fsds-box-model-min-height"]).toBe(
      "var(--fsds-semantic-glyph-size-medium-extent, 16px)",
    );
    expect(decls["--fsds-box-model-padding-inline-start"]).toBe("8px");
  });

  it("fixed-square: glyph-extent square, centered", () => {
    const decls = rootDeclarations(makeContract("fixed-square"));
    expect(decls["display"]).toBe("inline-flex");
    expect(decls["justify-content"]).toBe("center");
    expect(decls["--fsds-box-model-width"]).toBe(
      "var(--fsds-semantic-glyph-size-medium-extent, 16px)",
    );
    expect(decls["--fsds-box-model-height"]).toBe(
      "var(--fsds-semantic-glyph-size-medium-extent, 16px)",
    );
  });

  it("identity-inline: row flow, content width", () => {
    const decls = rootDeclarations(makeContract("identity-inline"));
    expect(decls["display"]).toBe("inline-flex");
    expect(decls["flex-direction"]).toBe("row");
    expect(decls["--fsds-box-model-width"]).toBe("auto");
    expect(decls["--fsds-box-model-padding-inline-start"]).toBe("4px");
  });

  it("linear-meter: full-width bar with explicit thickness, no padding", () => {
    const decls = rootDeclarations(makeContract("linear-meter"));
    expect(decls["display"]).toBe("block");
    expect(decls["--fsds-box-model-width"]).toBe("100%");
    expect(decls["--fsds-box-model-height"]).toBe("8px");
    // No generic feedback padding — stays at the primitive 0.
    expect(decls["--fsds-box-model-padding-inline-start"]).toBe("0");
  });

  it("loading-block: stretches to container width with a min-height floor", () => {
    const decls = rootDeclarations(makeContract("loading-block"));
    expect(decls["display"]).toBe("block");
    expect(decls["--fsds-box-model-width"]).toBe("100%");
    expect(decls["--fsds-box-model-min-height"]).toBe("1em");
    expect(decls["--fsds-box-model-padding-inline-start"]).toBe("0");
  });

  it("replaced-media: constrains to container, native replaced behavior", () => {
    const decls = rootDeclarations(makeContract("replaced-media"));
    expect(decls["display"]).toBe("block");
    expect(decls["--fsds-box-model-max-width"]).toBe("100%");
    // Width/height stay auto so the intrinsic aspect ratio is preserved.
    expect(decls["--fsds-box-model-width"]).toBe("auto");
    expect(decls["--fsds-box-model-height"]).toBe("auto");
  });
});

describe("profile code contains no component-name lore", () => {
  // The geometry mechanism must branch on the morphology FACT only — never on
  // a component name (the codegen-authority rule). A `name === "Badge"` or a
  // `case "Progress"` predicate in the profile module would re-introduce the
  // per-component lore this slice removes. Same predicate shapes the admitted-
  // emitter guard (frameworks/no-component-name-lore.test.ts) catches, applied
  // here to the shared profile module that guard does not scan.
  const LORE_PATTERNS: RegExp[] = [
    /\b(?:ir|component|contract)\.name\s*===\s*"[A-Z][a-zA-Z0-9]*"/,
    /(?<![\w.])name\s*===\s*"[A-Z][a-zA-Z0-9]*"/,
  ];
  // The seven scoped component names must not appear as branch predicates: the
  // STYLE_PROFILES registry keys on morphology, not on component identity.
  const SCOPED_NAMES = [
    "Badge",
    "ProfileFlag",
    "Progress",
    "Skeleton",
    "Image",
    "Icon",
    "Avatar",
  ];

  it("box-model.ts (profile registry + resolver + merge) has no name predicate", () => {
    const contents = readFileSync(resolve(__dirname, "box-model.ts"), "utf-8");
    const violations: string[] = [];
    contents.split("\n").forEach((line, i) => {
      // Strip line comments so illustrative prose ("True glyphs (Icon, Avatar)")
      // is never counted — only real code predicates are lore.
      const code = line.replace(/\/\/.*$/, "");
      const trimmed = code.trim();
      if (trimmed.startsWith("*") || trimmed.startsWith("/*")) return;
      for (const pat of LORE_PATTERNS) {
        if (pat.test(code)) violations.push(`box-model.ts:${i + 1}  ${line.trim()}`);
      }
      for (const nm of SCOPED_NAMES) {
        if (new RegExp(`===\\s*"${nm}"|case\\s+"${nm}"`).test(code)) {
          violations.push(`box-model.ts:${i + 1}  ${line.trim()}`);
        }
      }
    });
    expect(violations, violations.join("\n")).toHaveLength(0);
  });
});
