// FIGMA-LIVE-MATERIALIZATION-IDEMPOTENCY-01
//
// Injectable entry for the live run. Bundled (esbuild) and executed inside a
// logged-in Figma tab via chrome-devtools `evaluate_script`. It CONSUMES plans
// produced by planFigmaStateSurface (the boundary is preserved); it never
// classifies descriptor state here.

import { liveMaterializeComponent, FSDS_NS, type LiveFigmaLike } from "./live-materialize.js";
import { projectLiveAudit, auditDigest, type ComponentAudit } from "./live-audit.js";
import type { FigmaStatePlan } from "./planner.js";

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
