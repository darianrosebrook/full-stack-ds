/**
 * Falsification probe for the token-resolvability rail
 * (RAIL-TOKEN-REFERENCE-RESOLVABILITY-01).
 *
 * This rail replaced a blocking gate. That raises the bar on proving it can
 * fail: a replacement that is merely quieter than what it displaced is a
 * weakened guard wearing a new name. So each check below pins one way the rail
 * must fire, and — equally — one way it must stay silent, because a rail that
 * reported every reference would be as useless as one that reported none.
 *
 * The value-comparison checks matter most. An earlier revision of this audit
 * compared a token's AUTHORED value against a component's fallback literal
 * without resolving the alias chain, and so reported 20 of 23 findings as
 * "changes value" when they were byte-identical after resolution — a false
 * positive manufactured entirely by the oracle. `resolveChain` exists because
 * of that, and these checks exist so it cannot silently regress.
 *
 * Standalone Node, matching the sibling audits' probes.
 */
import assert from "node:assert/strict";

import {
  buildGraph,
  declaredNames,
  declaredValue,
  kebabCandidate,
  normalizeValue,
  readReferences,
  resolveChain,
  runtimeSetNames,
  unresolvableId,
} from "./audit.mjs";

let failures = 0;
function check(name, fn) {
  try {
    fn();
    console.log(`  ok   ${name}`);
  } catch (err) {
    failures += 1;
    console.error(`  FAIL ${name}\n       ${err.message}`);
  }
}

console.log("token-resolvability rail falsification probe");

// --- the two primitives the verdict rests on -------------------------------

check("declaredNames reads a custom property from the left of a colon", () => {
  assert.deepEqual([...declaredNames(".a { --fsds-x: 1px; color: red; }")], ["--fsds-x"]);
});

check("declaredNames does not mistake a READ for a declaration", () => {
  // The whole rail turns on this distinction: `var(--fsds-x)` on the right of a
  // colon is a consumer, not a declaration. Conflating them would make every
  // broken reference declare itself and the rail would report nothing, ever.
  assert.deepEqual([...declaredNames(".a { color: var(--fsds-x, red); }")], []);
});

check("readReferences captures the name and the silently-rendered fallback", () => {
  assert.deepEqual(readReferences(".a { color: var(--fsds-x, #fff); }"), [
    { name: "--fsds-x", fallback: "#fff" },
  ]);
});

check("readReferences records a null fallback when there is none", () => {
  assert.deepEqual(readReferences(".a { color: var(--fsds-x); }"), [
    { name: "--fsds-x", fallback: null },
  ]);
});

// --- the casing seam this rail was built to surface ------------------------

check("kebabCandidate names the declared spelling of a camelCase miss", () => {
  const declared = new Set(["--fsds-semantic-shape-control-border-default-width"]);
  assert.equal(
    kebabCandidate("--fsds-semantic-shape-control-border-defaultWidth", declared),
    "--fsds-semantic-shape-control-border-default-width",
  );
});

check("kebabCandidate returns null when kebab-casing does not explain the miss", () => {
  // A name that is already kebab and still undeclared has some other cause and
  // must not be reported as a casing seam — the two need different fixes.
  assert.equal(kebabCandidate("--fsds-totally-invented", new Set(["--fsds-real"])), null);
});

// --- value comparison: the check that must resolve, not compare text --------

const GRAPH = buildGraph(`
:root {
  --fsds-core-spacing-size-04: 8px;
  --fsds-semantic-gap: var(--fsds-core-spacing-size-04);
  --fsds-semantic-alias-of-alias: var(--fsds-semantic-gap);
  --fsds-cycle-a: var(--fsds-cycle-b);
  --fsds-cycle-b: var(--fsds-cycle-a);
  --fsds-color: #111111;
}
[data-theme="dark"] {
  --fsds-color: #eeeeee;
}
`);

check("resolveChain follows an alias to its literal", () => {
  assert.equal(resolveChain(GRAPH, "--fsds-semantic-gap"), "8px");
});

check("resolveChain follows a multi-hop alias chain", () => {
  assert.equal(resolveChain(GRAPH, "--fsds-semantic-alias-of-alias"), "8px");
});

check("resolveChain reports no value for a theme-varying name rather than picking one", () => {
  // This is the honest-ambiguity case. --fsds-color is #111 in light and #eee
  // in dark; there is no single value to compare a fallback against. Returning
  // either would manufacture a confident verdict from an ambiguous graph, and
  // would wrongly bless repairing a binding that currently pins one theme.
  assert.equal(resolveChain(GRAPH, "--fsds-color"), null);
  assert.equal(declaredValue(GRAPH, "--fsds-color").ambiguous, 2);
});

check("resolveChain terminates on a cycle instead of recursing forever", () => {
  assert.equal(resolveChain(GRAPH, "--fsds-cycle-a"), null);
});

check("resolveChain reports no value for a name the graph never declares", () => {
  assert.equal(resolveChain(GRAPH, "--fsds-absent"), null);
});

check("normalizeValue equates values that differ only in case or whitespace", () => {
  assert.equal(normalizeValue("  #FAFAFA "), normalizeValue("#fafafa"));
});

check("normalizeValue does NOT equate genuinely different values", () => {
  assert.notEqual(normalizeValue("8px"), normalizeValue("12px"));
});

// --- the runtime-var exemption, which must stay derived --------------------

check("runtimeSetNames finds a custom property set from JS as an inline style", () => {
  const source = `<span style={{ "--fsds-progress-fill-width": value } as CSSProperties} />`;
  assert.deepEqual([...runtimeSetNames(source)], ["--fsds-progress-fill-width"]);
});

check("runtimeSetNames exempts nothing when the JS that set it is gone", () => {
  // The exemption is derived from the component's own source precisely so that
  // deleting the JS re-arms the rail. A hardcoded allowlist would keep
  // exempting the var forever — the same rot this rail exists to catch.
  assert.deepEqual([...runtimeSetNames("<span />")], []);
});

// --- identity ---------------------------------------------------------------

check("a finding is identified by component and name together", () => {
  // Per-component, not per-name: the same broken reference in two components is
  // two repairs to verify, and collapsing them would let one component's fix
  // mark the other's as burned.
  assert.equal(unresolvableId({ component: "Button", name: "--fsds-x" }), "Button --fsds-x");
});

console.log(
  failures === 0
    ? "token-resolvability probe: all checks passed"
    : `token-resolvability probe: ${failures} FAILED`,
);
process.exit(failures === 0 ? 0 : 1);
