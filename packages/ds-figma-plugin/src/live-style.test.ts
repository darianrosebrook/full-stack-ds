import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  resolveDescriptorStyles,
  flattenResolvedTokens,
  type ResolverDescriptor,
} from "./live-token-resolve.js";
import {
  projectStyleCarriers,
  styleDigest,
  ensureVariableSurface,
  variableDigest,
  type StyleNode,
  type StyleApi,
  type VarsApi,
  type VarCollection,
  type FigmaVariable,
  type VariableSurfaceSpec,
} from "./live-style.js";
import { runStyleSpike, type SpikeFigma } from "./live-run.js";
import type { ResolvedBinding } from "./live-token-resolve.js";

interface MockNode extends StyleNode {
  pd: Record<string, string>;
  children: StyleNode[];
}
function mockNode(): MockNode {
  const pd: Record<string, string> = {};
  const children: StyleNode[] = [];
  return {
    name: "",
    pd,
    children,
    appendChild(n) { children.push(n); },
    setSharedPluginData(ns, k, v) { pd[`${ns}:${k}`] = v; },
    getSharedPluginData(ns, k) { return pd[`${ns}:${k}`] ?? ""; },
  };
}
const api: StyleApi = { createFrame: () => mockNode() };

const RESOLVED = flattenResolvedTokens(
  JSON.parse(
    readFileSync(resolve(__dirname, "../../ds-tokens/generated/resolved.tokens.json"), "utf8"),
  ),
);
function loadDescriptor(name: string): ResolverDescriptor {
  return JSON.parse(
    readFileSync(resolve(__dirname, `generated/components/${name}/${name}.figma.json`), "utf8"),
  ) as ResolverDescriptor;
}

describe("live-style: carrier idempotency (mock)", () => {
  it("A6: find-or-create — rerun yields no duplicate carriers + equal style digest; state untouched", () => {
    const shell = mockNode();
    // Seed pre-existing STATE-owned plugin data (as the state slice would have).
    shell.setSharedPluginData("fsds", "live.owned", "1");
    shell.setSharedPluginData("fsds", "state.dim.selection.lowering", "variant-axis");
    const stateBefore = JSON.stringify(shell.pd);

    const bindings = resolveDescriptorStyles(loadDescriptor("Checkbox"), RESOLVED);
    const run1 = projectStyleCarriers(shell, bindings, api);
    const run2 = projectStyleCarriers(shell, bindings, api);

    // No duplicate carriers: rerun reuses by stable plugin data, not name.
    expect(run2.length).toBe(run1.length);
    const owned = shell.children.filter((c) => c.getSharedPluginData("fsds", "style.owner") === "style");
    expect(owned.length).toBe(run1.length);
    // Style digest stable across runs.
    expect(styleDigest(run2)).toBe(styleDigest(run1));
    // Checkbox indicator carrier created (with its resolved binding).
    expect(run1.map((c) => c.part)).toContain("indicator");
    const indicator = run1.find((c) => c.part === "indicator")!;
    expect(indicator.bindings.map((b) => b.tokenPath)).toContain("semantic.color.border.default");
    // State plugin data on the shell is byte-identical — the style layer never moved it.
    expect(JSON.stringify(shell.pd)).toBe(stateBefore);
  });

  it("creates carriers only for resolvable part bindings — root + transparent residuals create none", () => {
    const shell = mockNode();
    const bindings = resolveDescriptorStyles(loadDescriptor("Sheet"), RESOLVED);
    const carriers = projectStyleCarriers(shell, bindings, api);
    const parts = carriers.map((c) => c.part);
    // overlay/content/title/... are carriers; `close` background is transparent (residual)
    // but `close` color resolves, so a close carrier exists with only the color binding.
    expect(parts).toContain("overlay");
    expect(parts).toContain("content");
    const close = carriers.find((c) => c.part === "close");
    if (close) {
      expect(close.bindings.some((b) => b.property === "background-color")).toBe(false); // transparent residual
    }
  });
});

function makeVarsMock(): VarsApi & { collections: VarCollection[]; vars: FigmaVariable[] } {
  let mid = 0;
  let cid = 0;
  let vid = 0;
  const collections: VarCollection[] = [];
  const vars: FigmaVariable[] = [];
  function makeCollection(name: string): VarCollection {
    const id = `coll${cid++}`;
    const modes = [{ modeId: `mode${mid++}`, name: "Mode 1" }];
    const coll: VarCollection = {
      id,
      name,
      modes,
      defaultModeId: modes[0].modeId,
      addMode(modeName) {
        const m = { modeId: `mode${mid++}`, name: modeName };
        modes.push(m);
        return m.modeId;
      },
      renameMode(modeId, modeName) {
        const m = modes.find((x) => x.modeId === modeId);
        if (m) m.name = modeName;
      },
    };
    return coll;
  }
  return {
    collections,
    vars,
    getLocalVariableCollections: () => collections,
    createVariableCollection(name) {
      const c = makeCollection(name);
      collections.push(c);
      return c;
    },
    getLocalVariables: () => vars,
    createVariable(name, collection) {
      const values: Record<string, unknown> = {};
      const v: FigmaVariable = {
        id: `var${vid++}`,
        name,
        variableCollectionId: collection.id,
        setValueForMode(modeId, value) {
          values[modeId] = value;
        },
      };
      vars.push(v);
      return v;
    },
  };
}

const SPIKE_SPEC: VariableSurfaceSpec = {
  collection: "FSDS",
  cores: [
    { name: "core/color/palette/neutral/300", value: { r: 0.68, g: 0.68, b: 0.68 } },
    { name: "core/color/palette/neutral/600", value: { r: 0.33, g: 0.33, b: 0.33 } },
  ],
  semantics: [
    { name: "semantic/color/border/default", lightCore: "core/color/palette/neutral/300", darkCore: "core/color/palette/neutral/600" },
  ],
};

describe("live-style: variable surface idempotency (mock)", () => {
  it("ensureVariableSurface is find-or-create — rerun yields no duplicate collections/modes/variables", () => {
    const api = makeVarsMock();
    const r1 = ensureVariableSurface(api, SPIKE_SPEC);
    const r2 = ensureVariableSurface(api, SPIKE_SPEC);
    // One FSDS collection, Light+Dark modes, 3 variables — stable across runs.
    expect(api.collections.length).toBe(1);
    expect(api.collections[0].modes.map((m) => m.name).sort()).toEqual(["Dark", "Light"]);
    expect(api.vars.length).toBe(3);
    expect(variableDigest(r2)).toBe(variableDigest(r1));
    // semantic variable aliases the two cores.
    expect(Object.keys(r1.semanticByName)).toContain("semantic/color/border/default");
    expect(Object.keys(r1.coreByName)).toEqual([
      "core/color/palette/neutral/300",
      "core/color/palette/neutral/600",
    ]);
  });
});

// A faithful-but-fake `figma` for the spike runner: real variable collection
// semantics (modes, setValueForMode, setBoundVariableForPaint) + a page with
// frame children. Proves runStyleSpike end-to-end before it touches real Figma.
interface BoundPaint {
  type: string;
  color: { r: number; g: number; b: number };
  boundVariables?: Record<string, { type: string; id: string }>;
}
function makeSpikeFigma(): SpikeFigma & {
  vars: ReturnType<typeof makeVarsMock>;
  page: { children: (StyleNode & { strokes?: BoundPaint[] })[]; appendChild(n: StyleNode): void };
} {
  const vars = makeVarsMock();
  const children: (StyleNode & { strokes?: BoundPaint[] })[] = [];
  const page = { children, appendChild(n: StyleNode) { children.push(n as never); } };
  const root = { setSharedPluginData(_ns: string, _k: string, _v: string) {} };
  const figma: SpikeFigma = {
    variables: {
      ...vars,
      setBoundVariableForPaint(paint, field, variable) {
        const p = paint as BoundPaint;
        return { ...p, boundVariables: { [field]: { type: "VARIABLE_ALIAS", id: variable.id } } };
      },
    },
    currentPage: page,
    createFrame: () => mockNode() as StyleNode,
    root,
  };
  return Object.assign(figma, { vars, page });
}

function checkboxIndicatorBindings(): ResolvedBinding[] {
  return resolveDescriptorStyles(loadDescriptor("Checkbox"), RESOLVED).filter(
    (b) => b.carrier.kind === "part" && b.carrier.part === "indicator",
  );
}

describe("live-run: style spike runner (faithful figma mock)", () => {
  it("binds one carrier stroke to the aliased semantic variable; reruns are idempotent", () => {
    const figma = makeSpikeFigma();
    const bindings = checkboxIndicatorBindings();

    const ev1 = runStyleSpike(figma, bindings);
    // First run: FSDS collection, Light/Dark modes, semantic alias, indicator bound.
    expect(ev1.collection).toBe("FSDS");
    expect(ev1.modes).toEqual(["Light", "Dark"]);
    expect(ev1.semanticVariable).toBe("semantic/color/border/default");
    expect(ev1.carrier).toEqual({
      component: "Checkbox",
      part: "indicator",
      property: "border-color",
      boundVariable: "semantic/color/border/default",
    });
    expect(ev1.digestEqual).toBe(true);
    expect(ev1.carrierCountStable).toBe(true);
    expect(ev1.duplicateCarriers).toBe(0);

    // The indicator carrier's stroke is actually bound to the semantic variable.
    const host = figma.page.children.find(
      (c) => c.getSharedPluginData("fsds", "style.spike.host") === "1",
    )!;
    const indicator = (host.children ?? []).find(
      (c) => c.getSharedPluginData("fsds", "style.part") === "indicator",
    ) as (StyleNode & { strokes?: BoundPaint[] }) | undefined;
    const semVarId = figma.vars.vars.find((v) => v.name === "semantic/color/border/default")!.id;
    expect(indicator?.strokes?.[0].boundVariables?.color).toEqual({
      type: "VARIABLE_ALIAS",
      id: semVarId,
    });

    // Second plugin run against the same file: no duplicate collection/carrier.
    const ev2 = runStyleSpike(figma, bindings);
    expect(figma.vars.collections.length).toBe(1);
    expect(ev2.duplicateCarriers).toBe(0);
    expect(ev2.run2Digest).toBe(ev1.run2Digest);
    const hostCount = figma.page.children.filter(
      (c) => c.getSharedPluginData("fsds", "style.spike.host") === "1",
    ).length;
    expect(hostCount).toBe(1);
    const indicatorCount = (host.children ?? []).filter(
      (c) => c.getSharedPluginData("fsds", "style.part") === "indicator",
    ).length;
    expect(indicatorCount).toBe(1);
  });
});
