#!/usr/bin/env node
/**
 * MOBILE-IR-FACT-PARITY-SWEEP-01 — measurement only.
 *
 * Builds the framework-neutral IR for every component contract and extracts
 * the facts that determine whether a minimal NATIVE realization (SwiftUI /
 * Jetpack Compose / React Native) is blocked by missing IR facts vs. by
 * emitter/runtime/package/rail work. Does NOT register targets, widen
 * TargetId, create packages, or implement emitters.
 *
 * The load-bearing measurement: role-fact loss. The IR's `root.effectiveRole`
 * elides roles that are implicit on the HTML element (e.g. <button>), because
 * on the DOM the element implies the role. A non-DOM target has no element to
 * imply from, so that elision destroys a fact it needs. We detect it
 * mechanically: implicitRole present, explicitRole absent, effectiveRole
 * undefined -> role fact lost.
 *
 * Output: JSON to stdout (one record per contract + summary), consumed by the
 * report generator. Build dist first: `pnpm exec turbo run build --filter=@full-stack-ds/codegen`.
 */

import { readFileSync, existsSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { buildComponentIR, collectCollapseIntents } from "../packages/ds-codegen/dist/ir.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, "..");
const COMPONENTS_DIR = join(REPO_ROOT, "packages", "ds-contracts", "components");

/** Mirror the CLI / swift-test load order: contract first, sidecars attached. */
function loadMergedContract(name) {
  const folder = join(COMPONENTS_DIR, name);
  const contract = JSON.parse(
    readFileSync(join(folder, `${name}.contract.json`), "utf8")
  );
  const tokensPath = join(folder, `${name}.tokens.json`);
  if (existsSync(tokensPath)) contract.tokens = JSON.parse(readFileSync(tokensPath, "utf8"));
  const stylesPath = join(folder, `${name}.styles.json`);
  if (existsSync(stylesPath)) contract.styles = JSON.parse(readFileSync(stylesPath, "utf8"));
  return contract;
}

function listComponents() {
  return readdirSync(COMPONENTS_DIR)
    .filter((n) => {
      const d = join(COMPONENTS_DIR, n);
      return statSync(d).isDirectory() && existsSync(join(d, `${n}.contract.json`));
    })
    .sort();
}

function classify(ir, contract) {
  const root = ir.root || {};
  const explicitRole = root.explicitRole;
  const implicitRole = root.implicitRole;
  const effectiveRole = root.effectiveRole;
  const element = root.element;

  // Role-loss detection (the Phase 0.1 measurement).
  // Lost = element implies a role, contract didn't restate it explicitly,
  // and the IR elided it (effectiveRole undefined). A native target reading
  // the IR cannot recover "this is a <role>".
  const roleImpliedByElement = !!implicitRole;
  const roleSurvivesExplicit = !!explicitRole;
  const roleElided = !effectiveRole && !explicitRole;
  const roleLost = roleImpliedByElement && roleElided && !roleSurvivesExplicit;

  // Part-level role (role lives on a compound part, not root).
  const partRoles = (ir.parts || [])
    .map((p) => p.details?.role)
    .filter(Boolean);
  const compoundPartRoles = (ir.compoundParts || [])
    .map((p) => p.details?.role)
    .filter(Boolean);
  const hasPartLevelRole = partRoles.length > 0 || compoundPartRoles.length > 0;

  // Role bucket for Phase 0.1 counting.
  let roleBucket;
  if (roleSurvivesExplicit) roleBucket = "1-explicit-survives";
  else if (roleLost) roleBucket = "2-implicit-elided-LOST";
  else if (hasPartLevelRole && !effectiveRole) roleBucket = "4-part-level-role";
  else roleBucket = "3-no-meaningful-native-role";

  // Collapse intents.
  let collapseIntents = [];
  try {
    const map = collectCollapseIntents(ir);
    collapseIntents = [...map.keys()];
  } catch {
    collapseIntents = [];
  }
  const hasNativeToggle = collapseIntents.includes("native-toggle-affordance");

  // Channel + a11y coverage.
  const channels = ir.behavior?.normalizedChannels || [];
  const channelCount = channels.length;
  const labeling = root.labeling || [];

  // Surface / controller dependency.
  // NOTE: behavior.portal is ALWAYS an object ({enabled:false} when off), so
  // test `.enabled`, not truthiness. focus.model "auto" defers to platform and
  // is NOT a controller blocker. Only an enabled portal, a real dismissal
  // trigger set, or a presence surface counts as runtime-controller work.
  const surfaceKind = ir.surface?.kind;
  const hasSurface = !!ir.surface;
  const focusModel = ir.behavior?.focus?.model;
  const hasRealFocus = focusModel === "trap" || focusModel === "roving";
  const portalEnabled = ir.behavior?.portal?.enabled === true;
  const hasDismissal = (ir.behavior?.dismissal?.triggers?.length ?? 0) > 0;
  const controllerDep = hasSurface || portalEnabled || hasDismissal || hasRealFocus;

  // Children / slot dependency (multi-part anatomy that isn't a collapse).
  const compoundCount = (ir.compoundParts || []).length;
  const multiPart = compoundCount > 0;

  // Token / style dependency.
  const cssBlockCount = (ir.cssBlocks || []).length;
  const tokenDep = cssBlockCount > 0;

  // ---- Category A–E classification (minimal native realization) ----
  // E: non-visual / form-serialization residual (no native view shape).
  // D: blocked by target-family/runtime controller work (surfaces, focus traps).
  // C: blocked by missing semantic/collapse intent (multi-part, native primitive
  //    candidate but no collapse intent and no part-role path).
  // B: renderable after known Phase 0 IR fact repair (role lost, or token-string
  //    mining required).
  // A: renderable from existing semantic IR facts now.
  let category, blockingMissingFact, upstreamHome, phaseBucket, nativeCandidate;

  const layer = contract.category || contract.layer || "(none)";
  const looksNonVisual =
    /form|field|hidden|serializ/i.test(String(layer)) && channelCount === 0 && !element;

  // native primitive candidate heuristic
  if (hasNativeToggle) nativeCandidate = "Toggle/Switch";
  else if (surfaceKind === "tooltip" || surfaceKind === "popover") nativeCandidate = "overlay/popover";
  else if (element === "button") nativeCandidate = "Button";
  else if (element === "input") nativeCandidate = "TextField";
  else if (element === "progress" || element === "meter") nativeCandidate = "ProgressView";
  else if (multiPart) nativeCandidate = "composite layout";
  else nativeCandidate = element ? `View(${element})` : "View";

  // Token-string mining (tokenDep) is UNIVERSAL (47/47 have cssBlocks), so it
  // is a flat cross-cutting tax recorded in its own column — NOT a category
  // driver. roleLost is empirically 0 for this corpus (contracts restate
  // implicit roles explicitly), so category B is essentially vacant; kept for
  // completeness. The real category drivers are: non-visual (E), runtime
  // controller / surface (D), multi-part-needs-collapse-or-layout (C),
  // IR-sufficient single shape (A).
  if (looksNonVisual) {
    category = "E";
    blockingMissingFact = "non-visual / form-serialization residual";
    upstreamHome = "n/a";
    phaseBucket = "out-of-scope";
  } else if (roleLost) {
    category = "B";
    blockingMissingFact = `role elided (element=${element} implies ${implicitRole}, not restated)`;
    upstreamHome = "Semantic IR";
    phaseBucket = "Phase 0.1";
  } else if (hasSurface || portalEnabled || hasDismissal) {
    category = "D";
    blockingMissingFact = `runtime controller: ${[
      hasSurface && `surface(${surfaceKind})`,
      portalEnabled && "portal",
      hasDismissal && "dismissal",
      hasRealFocus && `focus(${focusModel})`,
    ].filter(Boolean).join("+")}`;
    upstreamHome = "Native View IR + target emitter";
    phaseBucket = "Phase 1 (controller)";
  } else if (multiPart && !hasNativeToggle) {
    category = "C";
    blockingMissingFact = `multi-part anatomy (${compoundCount} compound parts), no collapse intent`;
    upstreamHome = "contract (collapsibleTo) or Semantic IR";
    phaseBucket = "Phase 0.3 (decide collapse vs native layout)";
  } else {
    category = "A";
    blockingMissingFact = "none — IR-sufficient";
    upstreamHome = "n/a";
    phaseBucket = "Phase 1 (emitter only)";
  }

  return {
    component: ir.name,
    layer,
    element: element || "",
    explicitRole: explicitRole || "",
    effectiveRole: effectiveRole || "",
    implicitRole: implicitRole || "",
    roleLost,
    roleBucket,
    hasPartLevelRole,
    collapseIntents: collapseIntents.join(",") || "",
    hasNativeToggle,
    nativeCandidate,
    channelCount,
    labelingCount: labeling.length,
    multiPart,
    compoundCount,
    surfaceKind: surfaceKind || "",
    controllerDep,
    tokenDep,
    cssBlockCount,
    blockingMissingFact,
    upstreamHome,
    category,
    phaseBucket,
  };
}

const components = listComponents();
const rows = [];
const errors = [];
for (const name of components) {
  try {
    const contract = loadMergedContract(name);
    const ir = buildComponentIR(contract);
    rows.push(classify(ir, contract));
  } catch (e) {
    errors.push({ component: name, error: String(e?.message || e) });
  }
}

// ---- Summaries ----
const byCategory = {};
for (const r of rows) byCategory[r.category] = (byCategory[r.category] || 0) + 1;

const roleBuckets = {};
for (const r of rows) roleBuckets[r.roleBucket] = (roleBuckets[r.roleBucket] || 0) + 1;

const collapseBuckets = {
  "1-existing-native-toggle": rows.filter((r) => r.hasNativeToggle).length,
  "2-primitive-candidate-no-intent": rows.filter(
    (r) => !r.hasNativeToggle && !r.multiPart && !r.controllerDep && r.element && r.category === "A"
  ).length,
  "3-multipart-needs-layout": rows.filter((r) => r.multiPart && !r.hasNativeToggle && !r.controllerDep).length,
  "4-surface-needs-controller": rows.filter((r) => r.controllerDep && r.surfaceKind).length,
};

const out = {
  meta: {
    sweep: "MOBILE-IR-FACT-PARITY-SWEEP-01",
    totalContracts: components.length,
    classified: rows.length,
    errors: errors.length,
  },
  summary: {
    byCategory,
    roleBuckets,
    collapseBuckets,
    roleLostCount: rows.filter((r) => r.roleLost).length,
  },
  errors,
  rows,
};

// Emit JSON to stdout; also write a CSV sibling if --csv <path> given.
process.stdout.write(JSON.stringify(out, null, 2));

const csvFlag = process.argv.indexOf("--csv");
if (csvFlag !== -1 && process.argv[csvFlag + 1]) {
  const cols = [
    "component", "category", "phaseBucket", "element", "explicitRole",
    "effectiveRole", "implicitRole", "roleLost", "collapseIntents",
    "nativeCandidate", "channelCount", "labelingCount", "compoundCount",
    "surfaceKind", "controllerDep", "tokenDep", "blockingMissingFact",
    "upstreamHome",
  ];
  const esc = (v) => {
    const s = v === undefined || v === null ? "" : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = [cols.join(",")];
  for (const r of rows) lines.push(cols.map((c) => esc(r[c])).join(","));
  writeFileSync(process.argv[csvFlag + 1], lines.join("\n") + "\n");
}
