// FIGMA-LIVE-MATERIALIZATION-IDEMPOTENCY-01
//
// Live adapter: materializes a FigmaStatePlan onto a REAL Figma node via the
// figma.* API, IDEMPOTENTLY. It consumes the plan only — never re-classifies
// descriptor state, never branches on component/state-value names. The adapter
// owns Figma API quirks (variant axes come from a component SET's named
// variants; booleans from addComponentProperty); the planner owns semantics.
//
// Idempotency is by stable key: one node per component (marked with plugin
// data), and component properties are guarded against re-creation.

import type { FigmaStatePlan } from "./planner.js";

// Minimal structural subset of the Figma node/api surface we touch. Satisfied
// by the real figma global and by the test's stateful mock.
// Shared plugin data (namespaced) is used instead of private plugin data: the
// chrome-devtools evaluate_script context has no plugin ID, so getPluginData /
// setPluginData throw. setSharedPluginData works with or without an ID.
export const FSDS_NS = "fsds";

export interface LiveNode {
  name: string;
  remove(): void;
  setSharedPluginData(namespace: string, key: string, value: string): void;
  getSharedPluginData(namespace: string, key: string): string;
  getSharedPluginDataKeys?(namespace: string): string[];
  componentPropertyDefinitions?: Record<
    string,
    { type: string; variantOptions?: string[]; defaultValue?: unknown }
  >;
  addComponentProperty?(name: string, type: string, defaultValue: unknown): string;
}
export interface LivePage {
  children: LiveNode[];
  appendChild(node: LiveNode): void;
}
export interface LiveFigmaLike {
  currentPage: LivePage;
  createComponent(): LiveNode;
  combineAsVariants(components: LiveNode[], parent: LivePage): LiveNode;
}

const OWNED = "live.owned"; // shared-plugin-data key marking a node we own
const PROP_PREFIX = "State";

function cartesian(axes: Array<{ name: string; values: string[] }>): Array<Record<string, string>> {
  let rows: Array<Record<string, string>> = [{}];
  for (const axis of axes) {
    const next: Array<Record<string, string>> = [];
    for (const row of rows) {
      for (const v of axis.values) next.push({ ...row, [axis.name]: v });
    }
    rows = next;
  }
  return rows;
}

/** Find this adapter's existing node for a component (idempotency key). */
function findOwned(figma: LiveFigmaLike, name: string): LiveNode | null {
  for (const child of figma.currentPage.children) {
    if (child.name === name && child.getSharedPluginData(FSDS_NS, OWNED) === "1") return child;
  }
  return null;
}

/** Variant axes the plan asks for: [initial, ...active] per variant-axis dim. */
function variantAxes(plan: FigmaStatePlan): Array<{ name: string; values: string[] }> {
  return plan.dimensions
    .filter((d) => d.lowering.kind === "variant-axis")
    .map((d) => ({
      name: d.name,
      values: [d.initial, ...(d.lowering.kind === "variant-axis" ? d.lowering.activeValues : [])].filter(
        (v): v is string => typeof v === "string",
      ),
    }));
}

function createNode(figma: LiveFigmaLike, plan: FigmaStatePlan): LiveNode {
  const axes = variantAxes(plan);
  if (axes.length === 0) {
    const c = figma.createComponent();
    figma.currentPage.appendChild(c);
    return c;
  }
  // Variant property/ies come from a component SET of named variants.
  const rows = cartesian(axes);
  const variants = rows.map((row) => {
    const c = figma.createComponent();
    c.name = Object.entries(row)
      .map(([k, v]) => `${PROP_PREFIX}/${k}=${v}`)
      .join(", ");
    return c;
  });
  return figma.combineAsVariants(variants, figma.currentPage);
}

/**
 * Materialize one plan onto a live node, idempotently. Returns the node.
 */
export function liveMaterializeComponent(figma: LiveFigmaLike, plan: FigmaStatePlan): LiveNode {
  let node = findOwned(figma, plan.component);
  if (!node) {
    node = createNode(figma, plan);
    node.name = plan.component;
    node.setSharedPluginData(FSDS_NS, OWNED, "1");
  }

  // Boolean properties — create-or-skip (addComponentProperty throws on dup).
  for (const d of plan.dimensions) {
    if (d.lowering.kind !== "boolean-property") continue;
    const propName = `${PROP_PREFIX}/${d.name}`;
    const defs = node.componentPropertyDefinitions ?? {};
    // Figma appends a "#<id>" suffix to component-property keys; match on the
    // base name so a rerun doesn't create a duplicate property.
    const exists = Object.keys(defs).some((k) => k.replace(/#.*$/, "") === propName);
    if (!exists && typeof node.addComponentProperty === "function") {
      node.addComponentProperty(propName, "BOOLEAN", false);
    }
  }

  // Plan metadata — shared plugin data is idempotent (overwrites same key).
  for (const d of plan.dimensions) {
    node.setSharedPluginData(FSDS_NS, `state.dim.${d.name}.lowering`, d.lowering.kind);
    if (d.a11y) node.setSharedPluginData(FSDS_NS, `state.dim.${d.name}.a11y`, JSON.stringify(d.a11y));
  }
  node.setSharedPluginData(FSDS_NS, "state.suppressions", JSON.stringify(plan.suppressions));
  node.setSharedPluginData(FSDS_NS, "state.residuals", JSON.stringify(plan.residuals));

  return node;
}
