/**
 * Falsification probe for the state-suppression rail (RAIL-STATE-SUPPRESSION-01).
 *
 * The rail's whole value is that it fires on a real class of defect every other
 * gate is blind to, so the first thing to prove is that it CAN fire — and, just
 * as important, that each suppression mechanism actually silences it. A rail
 * that reported everything would be as useless as one that reported nothing.
 *
 * Standalone Node, matching the sibling audits' probes.
 */
import assert from "node:assert/strict";

import { guardsAgainstDisabled, propertiesUnder, suppressionLeakId } from "./audit.mjs";

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

console.log("state-suppression rail falsification probe");

// --- propertiesUnder: the primitive the whole verdict rests on --------------
const BUTTON_SHAPED = `
.button {
  color: var(--x);
  &:hover {
    background-color: var(--a);
    border-color: var(--b);
  }
  &:disabled {
    background-color: var(--c);
    color: var(--d);
  }
}`;

check("reads the properties declared under an interaction pseudo", () => {
  const props = propertiesUnder(BUTTON_SHAPED, ":hover");
  assert.deepEqual([...props].sort(), ["background-color", "border-color"]);
});

check("reads the properties declared under the suppressing state", () => {
  const props = propertiesUnder(BUTTON_SHAPED, ":disabled");
  assert.deepEqual([...props].sort(), ["background-color", "color"]);
});

check("the Button leak is visible in the primitive: hover sets a property disabled never resets", () => {
  // This is the defect in prose: :hover sets border-color, :disabled does not,
  // so nothing wins the border back at equal specificity.
  const hover = propertiesUnder(BUTTON_SHAPED, ":hover");
  const disabled = propertiesUnder(BUTTON_SHAPED, ":disabled");
  const leaked = [...hover].filter((p) => !disabled.has(p));
  assert.deepEqual(leaked, ["border-color"]);
});

check("a nested block inside the state block does not truncate the scan", () => {
  // Brace-matching, not first-`}` slicing: a media query or :has() inside the
  // block would otherwise hide every declaration after it.
  const css = `
.x {
  &:hover {
    color: red;
    @media (min-width: 10px) { outline: 1px; }
    border-color: blue;
  }
}`;
  const props = propertiesUnder(css, ":hover");
  assert.ok(props.has("color"), "declaration before the nested block");
  assert.ok(props.has("border-color"), "declaration AFTER the nested block must still be seen");
});

check("a property only inside a nested block is not attributed to the outer block", () => {
  const css = `.x { &:hover { @media screen { outline-color: red; } } }`;
  const props = propertiesUnder(css, ":hover");
  assert.ok(!props.has("outline-color"), "nested declarations belong to the nested block");
});

check("no interaction block yields no properties, not a crash", () => {
  assert.equal(propertiesUnder(".x { color: red; }", ":hover").size, 0);
});

// --- the guard silences the rail -------------------------------------------
check("a :not(:disabled) guard is recognised", () => {
  assert.equal(guardsAgainstDisabled(".x:not(:disabled):hover { color: red; }"), true);
});

check("an [aria-disabled] guard is recognised", () => {
  assert.equal(guardsAgainstDisabled('.x:not([aria-disabled="true"]):hover { color: red; }'), true);
});

check("an unguarded sheet is NOT reported as guarded", () => {
  // Control: if this returned true the rail would silently pass everything.
  assert.equal(guardsAgainstDisabled(".x:hover { color: red; }"), false);
});

// --- ledger identity -------------------------------------------------------
check("leak identity is component + pseudo + property", () => {
  const id = suppressionLeakId({ component: "Button", pseudo: ":hover", property: "border-color" });
  assert.equal(id, "Button :hover border-color");
});

check("two properties leaking under the same pseudo are distinct ledger entries", () => {
  // Otherwise fixing one would mark the other stale and the ratchet would lie.
  const a = suppressionLeakId({ component: "Links", pseudo: ":hover", property: "color" });
  const b = suppressionLeakId({ component: "Links", pseudo: ":hover", property: "outline-color" });
  assert.notEqual(a, b);
});

if (failures > 0) {
  console.error(`\nstate-suppression probe FAILED (${failures})`);
  process.exit(1);
}
console.log("state-suppression probe PASS");
