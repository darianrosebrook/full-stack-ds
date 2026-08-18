/**
 * PREPUSH-SCOPED-GATE-01 A1 — contract test for the pre-push diff classifier.
 * Pure (no deps); run with: node --test scripts/prepush-scope.test.mjs
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { classify } from "./prepush-scope.mjs";

const on = (r, ...k) => k.every((key) => r[key] === true);
const off = (r, ...k) => k.every((key) => r[key] === false);

test("docs-only push: docs-claims only — no token/generate/rail/lint/typecheck/tests", () => {
  const r = classify(["docs/foo.md", "docs/component-audit/README.md"]);
  assert.equal(r.RUN_DOCS_CLAIMS, true);
  assert.ok(
    off(r, "RUN_TOKEN_BUILD", "RUN_TOKEN_GATES", "RUN_GENERATE_CHECK", "RUN_RAIL", "RUN_LINT", "RUN_TYPECHECK", "RUN_TESTS"),
  );
});

test("spec-only (.caws/*.yaml) push: nothing runs", () => {
  const r = classify([".caws/specs/FOO-01.yaml"]);
  assert.ok(
    off(r, "RUN_TOKEN_BUILD", "RUN_TOKEN_GATES", "RUN_GENERATE_CHECK", "RUN_RAIL", "RUN_LINT", "RUN_TYPECHECK", "RUN_TESTS", "RUN_DOCS_CLAIMS"),
  );
});

test("scripts-only (.mjs) push: lint only — loose .mjs isn't typechecked/tested", () => {
  const r = classify(["scripts/component-audit/audit.mjs"]);
  assert.equal(r.RUN_LINT, true);
  assert.ok(off(r, "RUN_TYPECHECK", "RUN_TESTS", "RUN_RAIL", "RUN_TOKEN_GATES", "RUN_GENERATE_CHECK"));
});

test("token source change: token build + gates + generate:check + rail", () => {
  const r = classify(["packages/ds-tokens/src/core/color.json"]);
  assert.ok(on(r, "RUN_TOKEN_BUILD", "RUN_TOKEN_GATES", "RUN_GENERATE_CHECK", "RUN_RAIL"));
});

test("contract change (.json, no .ts): generate:check + rail + tests + docs-claims, no token gates", () => {
  const r = classify(["packages/ds-contracts/components/Button/Button.styles.json"]);
  assert.ok(on(r, "RUN_GENERATE_CHECK", "RUN_RAIL", "RUN_TESTS", "RUN_DOCS_CLAIMS", "RUN_TOKEN_BUILD"));
  assert.equal(r.RUN_TOKEN_GATES, false); // no ds-tokens source changed
});

test("codegen source (.ts): lint + typecheck + tests + generate:check + rail", () => {
  const r = classify(["packages/ds-codegen/src/ir.ts"]);
  assert.ok(on(r, "RUN_LINT", "RUN_TYPECHECK", "RUN_TESTS", "RUN_GENERATE_CHECK", "RUN_RAIL"));
});

test("showcase src (.tsx): lint + typecheck + tests, no rail/generate/token-gates", () => {
  const r = classify(["src/views/TokensView.tsx"]);
  assert.ok(on(r, "RUN_LINT", "RUN_TYPECHECK", "RUN_TESTS"));
  assert.ok(off(r, "RUN_RAIL", "RUN_GENERATE_CHECK", "RUN_TOKEN_GATES"));
});

test("generated framework change (.tsx): rail + generate:check + tests + typecheck + lint", () => {
  const r = classify(["packages/ds-react/src/components/Table/Table.tsx"]);
  assert.ok(on(r, "RUN_RAIL", "RUN_GENERATE_CHECK", "RUN_TESTS", "RUN_TYPECHECK", "RUN_LINT"));
});

test("--full / indeterminate range: every group runs", () => {
  const r = classify([], { full: true });
  assert.ok(
    on(r, "RUN_TOKEN_BUILD", "RUN_TOKEN_GATES", "RUN_GENERATE_CHECK", "RUN_DOCS_CLAIMS", "RUN_LINT", "RUN_TYPECHECK", "RUN_TESTS", "RUN_RAIL", "RUN_BEHAVIOR_AUDIT", "RUN_A11Y_AUDIT"),
  );
});

test("empty range (no files): nothing runs", () => {
  const r = classify([]);
  assert.ok(
    off(r, "RUN_TOKEN_BUILD", "RUN_TOKEN_GATES", "RUN_GENERATE_CHECK", "RUN_DOCS_CLAIMS", "RUN_LINT", "RUN_TYPECHECK", "RUN_TESTS", "RUN_RAIL", "RUN_BEHAVIOR_AUDIT", "RUN_A11Y_AUDIT"),
  );
});

test("mixed docs + contract: union (rail + generate + docs-claims + tests)", () => {
  const r = classify(["docs/x.md", "packages/ds-contracts/components/Card/Card.contract.json"]);
  assert.ok(on(r, "RUN_DOCS_CLAIMS", "RUN_GENERATE_CHECK", "RUN_RAIL", "RUN_TESTS"));
});

// --- styling-realization ledgers (RAIL-STYLING-REALIZATION-LEDGERS-01) -------
// The ledgers classify contracts against committed generated React output, so
// each of those inputs must trigger them; unrelated pushes must not.

test("a contract change runs the styling-realization ledgers", () => {
  const r = classify(["packages/ds-contracts/components/Chip/Chip.styles.json"]);
  assert.equal(r.RUN_STYLING_AUDITS, true);
});

test("a generated ds-react change runs the styling-realization ledgers", () => {
  // A regenerated <C>.css can move a slot from consumed to dead without any
  // contract edit — the classified bytes changed, so the verdict can too.
  const r = classify(["packages/ds-react/src/components/Chip/Chip.css"]);
  assert.equal(r.RUN_STYLING_AUDITS, true);
});

test("editing the state-suppression rail runs the styling-realization ledgers", () => {
  assert.equal(
    classify(["scripts/state-suppression-audit/audit.mjs"]).RUN_STYLING_AUDITS,
    true,
  );
});

test("editing an audit or the shared ratchet runs the styling-realization ledgers", () => {
  assert.equal(classify(["scripts/dead-slot-audit/disposition.mjs"]).RUN_STYLING_AUDITS, true);
  assert.equal(classify(["scripts/pseudo-state-audit/audit.mjs"]).RUN_STYLING_AUDITS, true);
  assert.equal(classify(["scripts/lib/ledger-ratchet.mjs"]).RUN_STYLING_AUDITS, true);
});

test("a docs-only push does NOT run the styling-realization ledgers", () => {
  assert.equal(classify(["docs/x.md"]).RUN_STYLING_AUDITS, false);
});

test("an unrelated package change does NOT run the styling-realization ledgers", () => {
  // ds-vue is not the reference framework the audits classify against.
  assert.equal(
    classify(["packages/ds-vue/src/components/Chip/Chip.vue"]).RUN_STYLING_AUDITS,
    false,
  );
});

// --- token-reference resolvability (RAIL-TOKEN-REFERENCE-RESOLVABILITY-01) ---
// This audit's verdict is a diff between two name spaces, so both sides are
// inputs. These pin that BOTH sides trigger it — a rail wired to only one side
// of a diff goes quietly blind whenever the other side moves.

test("changing generated React CSS runs the token-resolvability ledger", () => {
  assert.equal(
    classify(["packages/ds-react/src/components/Button/Button.tokens.css"])
      .RUN_TOKEN_RESOLVABILITY,
    true,
  );
});

test("changing a token source runs the token-resolvability ledger", () => {
  // Renaming a token is exactly how a previously-resolving reference goes
  // dangling, so ds-tokens must trigger it even though the finding surfaces in
  // ds-react.
  assert.equal(
    classify(["packages/ds-tokens/src/color/semantic/foreground.tokens.json"])
      .RUN_TOKEN_RESOLVABILITY,
    true,
  );
});

test("editing the resolvability audit runs it, and builds the graph it needs", () => {
  // A scripts-only change is outside genGroup, so without the explicit
  // `|| resolvability` on RUN_TOKEN_BUILD the audit would run against a missing
  // composed graph — failing for the wrong reason.
  const flags = classify(["scripts/token-resolvability-audit/audit.mjs"]);
  assert.equal(flags.RUN_TOKEN_RESOLVABILITY, true);
  assert.equal(flags.RUN_TOKEN_BUILD, true);
});

test("a docs-only push does NOT run the token-resolvability ledger", () => {
  assert.equal(classify(["docs/x.md"]).RUN_TOKEN_RESOLVABILITY, false);
});

// --- native token realization (FEAT-TOKEN-REALIZATION-AUDIT-001) ---
// The scoreboard diffs contract-declared slots against native carrier
// realization, so sidecars, carrier trees, AND the allowlists in
// fsds.targets.json (admission is a verdict input) all trigger it.

test("changing a contract sidecar runs the token-realization ledger", () => {
  assert.equal(
    classify(["packages/ds-contracts/components/Button/Button.tokens.json"])
      .RUN_TOKEN_REALIZATION,
    true,
  );
});

test("changing a native carrier tree runs the token-realization ledger", () => {
  assert.equal(
    classify([
      "packages/ds-swiftui/Sources/DsSwiftUI/Components/Switch/SwitchTokens.swift",
    ]).RUN_TOKEN_REALIZATION,
    true,
  );
  assert.equal(
    classify([
      "packages/ds-jetpack-compose/library/src/main/kotlin/com/fullstackds/components/Switch/SwitchTokens.kt",
    ]).RUN_TOKEN_REALIZATION,
    true,
  );
});

test("changing the targets allowlist runs the token-realization ledger", () => {
  // Admission IS a verdict input: growing the jetpack-compose allowlist
  // converts admission gaps into carrier/slot obligations.
  assert.equal(classify(["fsds.targets.json"]).RUN_TOKEN_REALIZATION, true);
});

test("editing the realization audit runs it", () => {
  assert.equal(
    classify(["scripts/token-realization-audit/audit.mjs"]).RUN_TOKEN_REALIZATION,
    true,
  );
});

test("a web-tree-only push does NOT run the token-realization ledger", () => {
  assert.equal(
    classify(["packages/ds-react/src/components/Button/Button.tsx"])
      .RUN_TOKEN_REALIZATION,
    false,
  );
});

// --- behavior/a11y realization audits (PREPUSH-LOCKSTEP-01) ------------------
// ci.yml's gate job runs audit:behavior-realization + audit:a11y-realization;
// the hook must run them on the SAME input surfaces, or a push gets its
// verdict only from CI, after the fact. Behavior classifies the five WEB
// trees (its FRAMEWORKS list excludes react-native) and imports the compiled
// codegen IR; a11y iterates the AdmissionDescriptor registry — all six admitted
// families INCLUDING react-native — and keeps its known-gaps ledger in its own
// directory.

test("a contract change runs both realization audits", () => {
  const r = classify(["packages/ds-contracts/components/Chip/Chip.contract.json"]);
  assert.equal(r.RUN_BEHAVIOR_AUDIT, true);
  assert.equal(r.RUN_A11Y_AUDIT, true);
});

test("a codegen change runs both realization audits (IR + registry inputs)", () => {
  // The behavior audit imports the compiled IR; the a11y audit imports the
  // compiled AdmissionDescriptor registry. Both live in ds-codegen.
  const r = classify(["packages/ds-codegen/src/validation/admission-descriptor.ts"]);
  assert.equal(r.RUN_BEHAVIOR_AUDIT, true);
  assert.equal(r.RUN_A11Y_AUDIT, true);
});

test("a generated web tree change runs both realization audits", () => {
  const r = classify(["packages/ds-vue/src/components/Chip/Chip.vue"]);
  assert.equal(r.RUN_BEHAVIOR_AUDIT, true);
  assert.equal(r.RUN_A11Y_AUDIT, true);
});

test("a react-native change runs the a11y audit but NOT the behavior audit", () => {
  // The behavior audit's FRAMEWORKS list is the five web trees only; the a11y
  // audit iterates the full AdmissionDescriptor registry, which admits
  // react-native. A rail wired to the wrong family surface either over-fires
  // or goes quietly blind — this pins the asymmetry on both sides.
  const r = classify(["packages/ds-react-native/src/components/Chip/Chip.tsx"]);
  assert.equal(r.RUN_A11Y_AUDIT, true);
  assert.equal(r.RUN_BEHAVIOR_AUDIT, false);
});

test("editing a realization audit runs it (and only it)", () => {
  const b = classify(["scripts/behavior-realization-audit/realization.test.mjs"]);
  assert.equal(b.RUN_BEHAVIOR_AUDIT, true);
  assert.equal(b.RUN_A11Y_AUDIT, false);
  const a = classify(["scripts/a11y-realization-audit/selfcheck.mjs"]);
  assert.equal(a.RUN_A11Y_AUDIT, true);
  assert.equal(a.RUN_BEHAVIOR_AUDIT, false);
});

test("editing the a11y known-gaps ledger runs the a11y audit", () => {
  // Adding or removing a ledger entry moves the verdict even when no contract
  // or generated byte changes.
  assert.equal(
    classify(["scripts/a11y-realization-audit/known-gaps.json"]).RUN_A11Y_AUDIT,
    true,
  );
});

test("a tokens-only push runs NEITHER realization audit", () => {
  // Tokens move no interactivity and no ARIA bytes (styling-audit precedent:
  // ds-tokens is not an input there either). The rail still runs via genGroup,
  // and any regenerated bytes that DO matter arrive as generated-tree changes.
  const r = classify(["packages/ds-tokens/src/core/color.json"]);
  assert.equal(r.RUN_BEHAVIOR_AUDIT, false);
  assert.equal(r.RUN_A11Y_AUDIT, false);
});

test("a docs-only push does NOT run the realization audits", () => {
  const r = classify(["docs/x.md"]);
  assert.equal(r.RUN_BEHAVIOR_AUDIT, false);
  assert.equal(r.RUN_A11Y_AUDIT, false);
});

test("token-consumption rail: fires on token graph, contracts, generated trees, and its own scripts", () => {
  for (const f of [
    "packages/ds-tokens/src/color/semantic/foreground.tokens.json",
    "packages/ds-contracts/components/CodeBlock/CodeBlock.tokens.json",
    "packages/ds-react/src/components/CodeBlock/CodeBlock.tokens.css",
    "packages/ds-vue/src/components/CodeBlock/CodeBlock.css",
    "scripts/token-consumption-audit/audit.mjs",
    "scripts/token-consumption-audit/known-dead-namespaces.json",
    "scripts/lib/ledger-ratchet.mjs",
  ]) {
    const r = classify([f]);
    assert.equal(r.RUN_TOKEN_CONSUMPTION, true, f);
    assert.equal(r.RUN_TOKEN_BUILD, true, f); // the scan reads the composed graph
  }
});

test("token-consumption rail: NOT fired by docs or the resolvability audit's own scripts", () => {
  const d = classify(["docs/some-doc.md", "docs/token-resolvability-audit/resolvability-matrix.md"]);
  assert.equal(d.RUN_TOKEN_CONSUMPTION, false);
  const r = classify(["scripts/token-resolvability-audit/audit.mjs"]);
  assert.equal(r.RUN_TOKEN_CONSUMPTION, false);
});
