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
    on(r, "RUN_TOKEN_BUILD", "RUN_TOKEN_GATES", "RUN_GENERATE_CHECK", "RUN_DOCS_CLAIMS", "RUN_LINT", "RUN_TYPECHECK", "RUN_TESTS", "RUN_RAIL"),
  );
});

test("empty range (no files): nothing runs", () => {
  const r = classify([]);
  assert.ok(
    off(r, "RUN_TOKEN_BUILD", "RUN_TOKEN_GATES", "RUN_GENERATE_CHECK", "RUN_DOCS_CLAIMS", "RUN_LINT", "RUN_TYPECHECK", "RUN_TESTS", "RUN_RAIL"),
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
