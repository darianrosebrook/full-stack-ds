// FIGMA-LIVE-MATERIALIZATION-IDEMPOTENCY-01
//
// Audit projector + plan-vs-live comparison + stable digest. Projects the LIVE
// Figma file state into a deterministic, machine-readable shape so two runs can
// be compared for idempotency without human inspection.

import type { FigmaStatePlan } from "./planner.js";
import { FSDS_NS, type LiveFigmaLike, type LiveNode } from "./live-materialize.js";

const OWNED = "live.owned";

export interface ComponentAudit {
  component: string;
  found: boolean;
  variantProperties: string[];
  booleanProperties: string[];
  loweringByDim: Record<string, string>;
  suppressions: unknown;
  residuals: unknown;
}

function ownedNode(figma: LiveFigmaLike, name: string): LiveNode | null {
  for (const c of figma.currentPage.children) {
    if (c.name === name && c.getSharedPluginData(FSDS_NS, OWNED) === "1") return c;
  }
  return null;
}

export function projectComponentAudit(node: LiveNode, name: string): ComponentAudit {
  const defs = node.componentPropertyDefinitions ?? {};
  // Normalize Figma's "#<id>" property-key suffix so the audit is clean and the
  // digest is stable across runs (the id is node-specific, not semantic).
  const base = (k: string): string => k.replace(/#.*$/, "");
  const variantProperties = Object.entries(defs)
    .filter(([, d]) => d.type === "VARIANT")
    .map(([k]) => base(k))
    .sort();
  const booleanProperties = Object.entries(defs)
    .filter(([, d]) => d.type === "BOOLEAN")
    .map(([k]) => base(k))
    .sort();
  const loweringByDim: Record<string, string> = {};
  const keys = node.getSharedPluginDataKeys ? node.getSharedPluginDataKeys(FSDS_NS) : [];
  for (const key of keys) {
    const m = /^state\.dim\.(.+)\.lowering$/.exec(key);
    if (m) loweringByDim[m[1]] = node.getSharedPluginData(FSDS_NS, key);
  }
  const supRaw = node.getSharedPluginData(FSDS_NS, "state.suppressions");
  const resRaw = node.getSharedPluginData(FSDS_NS, "state.residuals");
  return {
    component: name,
    found: true,
    variantProperties,
    booleanProperties,
    loweringByDim,
    suppressions: supRaw ? JSON.parse(supRaw) : null,
    residuals: resRaw ? JSON.parse(resRaw) : null,
  };
}

export function projectLiveAudit(figma: LiveFigmaLike, componentNames: string[]): ComponentAudit[] {
  return componentNames.map((name) => {
    const node = ownedNode(figma, name);
    if (!node) {
      return {
        component: name,
        found: false,
        variantProperties: [],
        booleanProperties: [],
        loweringByDim: {},
        suppressions: null,
        residuals: null,
      };
    }
    return projectComponentAudit(node, name);
  });
}

/** Deterministic digest of the full audit (stable key order). */
export function auditDigest(audits: ComponentAudit[]): string {
  return stableStringify(audits);
}

function stableStringify(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
  if (value && typeof value === "object") {
    const keys = Object.keys(value as Record<string, unknown>).sort();
    return `{${keys.map((k) => `${JSON.stringify(k)}:${stableStringify((value as Record<string, unknown>)[k])}`).join(",")}}`;
  }
  return JSON.stringify(value) ?? "null";
}

export interface PlanLiveDiff {
  component: string;
  ok: boolean;
  mismatches: string[];
}

/**
 * Compare a plan to the projected live audit. Asserts each dimension lowered to
 * the right live surface: variant-axis -> VARIANT property; boolean-property ->
 * BOOLEAN property; interaction/channel/metadata -> no public property +
 * recorded lowering. Suppressions and residuals must be preserved.
 */
export function comparePlanToLive(plan: FigmaStatePlan, audit: ComponentAudit): PlanLiveDiff {
  const mismatches: string[] = [];
  if (!audit.found) {
    return { component: plan.component, ok: false, mismatches: ["node not found in live file"] };
  }
  for (const d of plan.dimensions) {
    const propName = `State/${d.name}`;
    if (audit.loweringByDim[d.name] !== d.lowering.kind) {
      mismatches.push(`${d.name}: lowering ${audit.loweringByDim[d.name] ?? "—"} != plan ${d.lowering.kind}`);
    }
    if (d.lowering.kind === "variant-axis" && !audit.variantProperties.includes(propName)) {
      mismatches.push(`${d.name}: expected VARIANT property ${propName}`);
    }
    if (d.lowering.kind === "boolean-property" && !audit.booleanProperties.includes(propName)) {
      mismatches.push(`${d.name}: expected BOOLEAN property ${propName}`);
    }
    if (
      (d.lowering.kind === "channel-bound" ||
        d.lowering.kind === "interaction-axis" ||
        d.lowering.kind === "metadata-only") &&
      (audit.variantProperties.includes(propName) || audit.booleanProperties.includes(propName))
    ) {
      mismatches.push(`${d.name}: ${d.lowering.kind} must NOT create a component property`);
    }
  }
  if (JSON.stringify(audit.suppressions) !== JSON.stringify(plan.suppressions)) {
    mismatches.push("suppressions metadata differs from plan");
  }
  if (JSON.stringify(audit.residuals) !== JSON.stringify(plan.residuals)) {
    mismatches.push("residuals metadata differs from plan");
  }
  return { component: plan.component, ok: mismatches.length === 0, mismatches };
}
