// FIGMA-STYLE-RESOLUTION-PROJECTION-01
//
// Style-owned anatomy CARRIERS. For each resolved style fact that targets a
// known descriptor anatomy part, the style layer find-or-creates a
// representational child node under the already-materialized state shell and
// records the binding. The state surface is never touched: carriers are tagged
// with a `style`-namespaced plugin-data marker so the two audits stay separable
// ("additive" = state authority did not move, not "no extra nodes").
//
// A carrier is created ONLY for a resolved binding on root/part — never for
// unmapped selectors or transparent/unresolved values (those residualize).

import type { ResolvedBinding } from "./live-token-resolve.js";

export const NS = "fsds";
export const STYLE_OWNER = "style";

// Structural subset (satisfied by real figma nodes + the test mock).
export interface StyleNode {
  name: string;
  children?: StyleNode[];
  appendChild(n: StyleNode): void;
  setSharedPluginData(namespace: string, key: string, value: string): void;
  getSharedPluginData(namespace: string, key: string): string;
}
export interface StyleApi {
  createFrame(): StyleNode;
}

export interface StyleCarrier {
  part: string;
  node: StyleNode;
  bindings: Array<{ property: string; tokenPath: string }>;
}

function findCarrier(shell: StyleNode, part: string): StyleNode | null {
  for (const c of shell.children ?? []) {
    if (
      c.getSharedPluginData(NS, "style.owner") === STYLE_OWNER &&
      c.getSharedPluginData(NS, "style.part") === part
    ) {
      return c;
    }
  }
  return null;
}

/**
 * Find-or-create style carriers under a shell from resolved bindings.
 * Idempotent: carriers are keyed by stable plugin data (style.owner +
 * style.part), NOT display name. Root bindings attach to the shell directly
 * (no carrier node). Residual bindings create no carrier.
 */
export function projectStyleCarriers(
  shell: StyleNode,
  bindings: ResolvedBinding[],
  api: StyleApi,
): StyleCarrier[] {
  const byPart = new Map<string, ResolvedBinding[]>();
  for (const b of bindings) {
    if (b.carrier.kind !== "part") continue; // root -> shell; residual -> skip
    if (!("tokenPath" in b.result)) continue; // residual value -> no carrier
    const arr = byPart.get(b.carrier.part) ?? [];
    arr.push(b);
    byPart.set(b.carrier.part, arr);
  }

  const carriers: StyleCarrier[] = [];
  for (const [part, partBindings] of [...byPart.entries()].sort()) {
    let node = findCarrier(shell, part);
    if (!node) {
      node = api.createFrame();
      node.name = `part:${part}`;
      node.setSharedPluginData(NS, "style.owner", STYLE_OWNER);
      node.setSharedPluginData(NS, "style.part", part);
      node.setSharedPluginData(NS, "style.source", "token-chain-resolver");
      shell.appendChild(node);
    }
    const recorded = partBindings
      .map((b) => ({
        property: b.property,
        tokenPath: (b.result as { tokenPath: string }).tokenPath,
      }))
      .sort((a, z) => (a.property < z.property ? -1 : 1));
    node.setSharedPluginData(NS, "style.bindings", JSON.stringify(recorded));
    node.setSharedPluginData(NS, "style.selector", partBindings[0].selector);
    carriers.push({ part, node, bindings: recorded });
  }
  return carriers;
}

/** Deterministic style digest (carriers + their bindings) — separable from state. */
export function styleDigest(carriers: StyleCarrier[]): string {
  const shape = carriers
    .map((c) => ({ part: c.part, bindings: c.bindings }))
    .sort((a, z) => (a.part < z.part ? -1 : 1));
  return JSON.stringify(shape);
}

// --- Figma variable surface (the token graph as a Figma variable collection) ---

export type RGB = { r: number; g: number; b: number; a?: number };

export interface VarMode {
  modeId: string;
  name: string;
}
export interface VarCollection {
  id: string;
  name: string;
  modes: VarMode[];
  defaultModeId: string;
  addMode(name: string): string;
  renameMode(modeId: string, name: string): void;
}
export interface FigmaVariable {
  id: string;
  name: string;
  variableCollectionId: string;
  setValueForMode(modeId: string, value: RGB | { type: "VARIABLE_ALIAS"; id: string }): void;
}
export interface VarsApi {
  getLocalVariableCollections(): VarCollection[];
  createVariableCollection(name: string): VarCollection;
  getLocalVariables(type?: string): FigmaVariable[];
  createVariable(name: string, collection: VarCollection, type: "COLOR"): FigmaVariable;
}

export interface CoreVarSpec { name: string; value: RGB }
export interface SemanticVarSpec { name: string; lightCore: string; darkCore: string }
export interface VariableSurfaceSpec {
  collection: string; // "FSDS"
  cores: CoreVarSpec[];
  semantics: SemanticVarSpec[];
}

function findCollection(api: VarsApi, name: string): VarCollection | null {
  return api.getLocalVariableCollections().find((c) => c.name === name) ?? null;
}
function findVar(api: VarsApi, name: string, collectionId: string): FigmaVariable | null {
  return (
    api.getLocalVariables("COLOR").find((v) => v.name === name && v.variableCollectionId === collectionId) ??
    null
  );
}
function ensureMode(coll: VarCollection, name: string): string {
  const existing = coll.modes.find((m) => m.name === name);
  if (existing) return existing.modeId;
  return coll.addMode(name);
}

export interface VariableSurfaceResult {
  collection: string;
  modes: string[];
  coreByName: Record<string, string>; // name -> id
  semanticByName: Record<string, string>;
}

/**
 * Find-or-create the FSDS variable collection: Light/Dark modes, core variables
 * (concrete per mode), and semantic variables aliasing cores per mode. Fully
 * idempotent — no duplicate collections, modes, or variables on rerun.
 */
export function ensureVariableSurface(api: VarsApi, spec: VariableSurfaceSpec): VariableSurfaceResult {
  let coll = findCollection(api, spec.collection);
  if (!coll) coll = api.createVariableCollection(spec.collection);
  // Default mode -> Light; ensure a Dark mode.
  const lightId = coll.modes[0].name === "Light" ? coll.modes[0].modeId : (coll.renameMode(coll.modes[0].modeId, "Light"), coll.modes[0].modeId);
  const darkId = ensureMode(coll, "Dark");

  const coreByName: Record<string, string> = {};
  for (const core of spec.cores) {
    let v = findVar(api, core.name, coll.id);
    if (!v) v = api.createVariable(core.name, coll, "COLOR");
    v.setValueForMode(lightId, core.value);
    v.setValueForMode(darkId, core.value); // palette is mode-independent
    coreByName[core.name] = v.id;
  }
  const semanticByName: Record<string, string> = {};
  for (const sem of spec.semantics) {
    let v = findVar(api, sem.name, coll.id);
    if (!v) v = api.createVariable(sem.name, coll, "COLOR");
    v.setValueForMode(lightId, { type: "VARIABLE_ALIAS", id: coreByName[sem.lightCore] });
    v.setValueForMode(darkId, { type: "VARIABLE_ALIAS", id: coreByName[sem.darkCore] });
    semanticByName[sem.name] = v.id;
  }
  return {
    collection: coll.name,
    modes: coll.modes.map((m) => m.name).sort(),
    coreByName,
    semanticByName,
  };
}

/** Deterministic variable-surface digest. */
export function variableDigest(r: VariableSurfaceResult): string {
  return JSON.stringify({
    collection: r.collection,
    modes: [...r.modes].sort(),
    cores: Object.keys(r.coreByName).sort(),
    semantics: Object.keys(r.semanticByName).sort(),
  });
}
