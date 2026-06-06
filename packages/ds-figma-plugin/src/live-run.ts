// FIGMA-LIVE-MATERIALIZATION-IDEMPOTENCY-01
//
// Injectable entry for the live run. Bundled (esbuild) and executed inside a
// logged-in Figma tab via chrome-devtools `evaluate_script`. It CONSUMES plans
// produced by planFigmaStateSurface (the boundary is preserved); it never
// classifies descriptor state here.

import { liveMaterializeComponent, FSDS_NS, type LiveFigmaLike } from "./live-materialize.js";
import { projectLiveAudit, auditDigest, type ComponentAudit } from "./live-audit.js";
import type { FigmaStatePlan } from "./planner.js";
import {
  ensureVariableSurface,
  projectStyleCarriers,
  styleDigest,
  NS,
  STYLE_OWNER,
  type StyleApi,
  type StyleNode,
  type VarsApi,
  type FigmaVariable,
  type VariableSurfaceSpec,
  type RGB,
} from "./live-style.js";
import type { ResolvedBinding } from "./live-token-resolve.js";

const OWNED = "live.owned";

export interface LiveRunResult {
  pageId: string | null;
  ownedNodeCount: number;
  audits: ComponentAudit[];
  digest: string;
}

/** Run the live materialization for a set of plans, then project the audit. */
export function runLiveMaterialization(
  figma: LiveFigmaLike & { currentPage: { id?: string } },
  plans: FigmaStatePlan[],
): LiveRunResult {
  for (const plan of plans) {
    liveMaterializeComponent(figma, plan);
  }
  const names = plans.map((p) => p.component);
  const audits = projectLiveAudit(figma, names);
  const ownedNodeCount = figma.currentPage.children.filter(
    (c) => c.getSharedPluginData(FSDS_NS, OWNED) === "1",
  ).length;
  return {
    pageId: figma.currentPage.id ?? null,
    ownedNodeCount,
    audits,
    digest: auditDigest(audits),
  };
}

// Expose for evaluate_script injection (the bundle assigns this global).
(globalThis as unknown as { runFsdsLiveMaterialization?: unknown }).runFsdsLiveMaterialization =
  runLiveMaterialization;

// --- Live style spike (runs inside the native plugin sandbox) ---
//
// Proves, on a real Figma file, the bounded style-projection path the mocked
// tests cover structurally: an FSDS variable collection (Light/Dark) whose
// semantic var aliases two core palette vars per mode, plus ONE style-owned
// anatomy carrier (Checkbox.indicator) whose stroke binds to that semantic
// variable. Runs twice and reports digest stability + carrier-duplication count.
// It does NOT touch the state materializer/planner — carriers are style-owned.

const SEMANTIC_BORDER = "semantic/color/border/default";
const SPIKE_HOST = "style.spike.host";

function hexToRgb(hex: string): RGB {
  const h = hex.replace(/^#/, "");
  return {
    r: parseInt(h.slice(0, 2), 16) / 255,
    g: parseInt(h.slice(2, 4), 16) / 255,
    b: parseInt(h.slice(4, 6), 16) / 255,
  };
}

/** The bounded variable surface for the spike (2 core palette vars + 1 semantic alias). */
export const SPIKE_SPEC: VariableSurfaceSpec = {
  collection: "FSDS",
  cores: [
    { name: "core/color/palette/neutral/300", value: hexToRgb("#aeaeae") }, // Light border
    { name: "core/color/palette/neutral/600", value: hexToRgb("#555555") }, // Dark border
  ],
  semantics: [
    {
      name: SEMANTIC_BORDER,
      lightCore: "core/color/palette/neutral/300",
      darkCore: "core/color/palette/neutral/600",
    },
  ],
};

// The native figma surface the spike touches (structural subset; satisfied by
// the real `figma` global). The boundary adapter owns the Figma API quirks.
export interface SpikeFigma {
  variables: VarsApi & {
    setBoundVariableForPaint(paint: unknown, field: string, variable: FigmaVariable): unknown;
  };
  currentPage: { children: StyleNode[]; appendChild(n: StyleNode): void };
  createFrame(): StyleNode;
  root: { setSharedPluginData(namespace: string, key: string, value: string): void };
}

export interface StyleSpikeEvidence {
  collection: string;
  modes: string[];
  semanticVariable: string;
  lightAlias: string;
  darkAlias: string;
  carrier: { component: string; part: string; property: string; boundVariable: string };
  run1Digest: string;
  run2Digest: string;
  digestEqual: boolean;
  carrierCountStable: boolean;
  duplicateCarriers: number;
}

function findOrCreateHost(figma: SpikeFigma): StyleNode {
  for (const c of figma.currentPage.children) {
    if (c.getSharedPluginData(NS, SPIKE_HOST) === "1") return c;
  }
  const f = figma.createFrame();
  f.name = "FSDS Style Spike";
  f.setSharedPluginData(NS, SPIKE_HOST, "1");
  figma.currentPage.appendChild(f);
  return f;
}

function findLocalVar(figma: SpikeFigma, name: string): FigmaVariable | null {
  return figma.variables.getLocalVariables("COLOR").find((v) => v.name === name) ?? null;
}

/**
 * Execute the bounded style spike against a real Figma document. `bindings`
 * are the resolved Checkbox.indicator bindings (computed by the resolver at
 * build time and embedded into the plugin bundle).
 */
export function runStyleSpike(figma: SpikeFigma, bindings: ResolvedBinding[]): StyleSpikeEvidence {
  // 1. Variable surface — find-or-create FSDS collection + Light/Dark + alias.
  const vars = ensureVariableSurface(figma.variables, SPIKE_SPEC);

  // 2. One style-owned carrier under a spike host, run TWICE (find-or-create).
  const shell = findOrCreateHost(figma);
  const api: StyleApi = { createFrame: () => figma.createFrame() };
  const run1 = projectStyleCarriers(shell, bindings, api);

  // 3. Bind the indicator carrier's STROKE to the semantic variable.
  let boundVariable = "";
  const indicator = run1.find((c) => c.part === "indicator");
  const semVar = findLocalVar(figma, SEMANTIC_BORDER);
  if (indicator && semVar) {
    const paint = { type: "SOLID", color: { r: 0, g: 0, b: 0 } };
    const bound = figma.variables.setBoundVariableForPaint(paint, "color", semVar);
    (indicator.node as { strokes?: unknown[] }).strokes = [bound];
    boundVariable = SEMANTIC_BORDER;
  }

  // 4. Re-run: must reuse the carrier, not duplicate it.
  const run2 = projectStyleCarriers(shell, bindings, api);
  const owned = (shell.children ?? []).filter(
    (c) => c.getSharedPluginData(NS, "style.owner") === STYLE_OWNER,
  );
  const uniqueParts = new Set(owned.map((c) => c.getSharedPluginData(NS, "style.part")));

  const d1 = styleDigest(run1);
  const d2 = styleDigest(run2);
  return {
    collection: vars.collection,
    modes: ["Light", "Dark"],
    semanticVariable: SEMANTIC_BORDER,
    lightAlias: "core/color/palette/neutral/300",
    darkAlias: "core/color/palette/neutral/600",
    carrier: { component: "Checkbox", part: "indicator", property: "border-color", boundVariable },
    run1Digest: d1,
    run2Digest: d2,
    digestEqual: d1 === d2,
    carrierCountStable: run2.length === run1.length,
    duplicateCarriers: owned.length - uniqueParts.size,
  };
}

// Expose for plugin-entry / evaluate_script read-back.
(globalThis as unknown as { runFsdsStyleSpike?: unknown }).runFsdsStyleSpike = runStyleSpike;
