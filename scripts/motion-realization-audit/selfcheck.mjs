/**
 * Falsification probe for the motion-realization rail (RAIL-REDUCED-MOTION-01).
 *
 * The class this rail exists for — REDUCED_MOTION_UNHONOURED — currently sits
 * at ZERO, which is the most dangerous state a gate can be in: a rail that
 * reports nothing is indistinguishable from a rail that sees nothing. So the
 * checks below drive it with stylesheets that MUST fire it, and with ones that
 * must not.
 *
 * The `stripReducedMotion` cases carry the most weight. The neutralising block
 * this slice emits sets `animation-duration`, so a naive "does this animate?"
 * scan answers its own question: a component would read as animating BECAUSE
 * it honours reduced motion, and the unhonoured class could never fire at all.
 * That is a rail that passes forever while the corpus rots.
 *
 * Standalone Node, matching the sibling audits' probes.
 */
import assert from "node:assert/strict";

import {
  animatedProperties,
  animates,
  declaredTokenNames,
  hasReducedMotionBlock,
  motionId,
  stripReducedMotion,
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

const REDUCED_BLOCK = `@media (prefers-reduced-motion: reduce) {
  .thing {
    animation-duration: 0.01ms;
    animation-iteration-count: 1;
    transition-duration: 0.01ms;
  }
}`;

console.log("RAIL-REDUCED-MOTION-01 selfcheck\n");

// --- the self-answering-question trap --------------------------------------

check("the reduced-motion block alone does NOT read as animation", () => {
  // If this regresses, REDUCED_MOTION_UNHONOURED can never fire: every
  // component that honours reduced motion would look like it animates, and
  // it would also have the block, so the finding is unreachable.
  assert.equal(animates(REDUCED_BLOCK), false);
});

check("stripping removes the whole media block, not just its first rule", () => {
  const css = `.a { color: red; }\n${REDUCED_BLOCK}\n.b { color: blue; }`;
  const stripped = stripReducedMotion(css);
  assert.doesNotMatch(stripped, /animation-duration/);
  assert.match(stripped, /\.a \{/);
  assert.match(stripped, /\.b \{/, "content after the block must survive");
});

// --- does it animate? ------------------------------------------------------

check("a real animation reads as animating", () => {
  assert.equal(animates(".thing { animation: spin 1s linear infinite; }"), true);
});

check("a real transition reads as animating", () => {
  assert.equal(animates(".thing { transition: transform 200ms ease; }"), true);
});

check("`animation: none` does NOT read as animating", () => {
  // Skeleton's --wipe and --none variants; counting them would overstate the
  // set of selectors the derived block claims to neutralise.
  assert.equal(animates(".thing { animation: none; }"), false);
});

check("a stylesheet with no motion reads as not animating", () => {
  assert.equal(animates(".thing { color: red; padding: 4px; }"), false);
});

// --- the unhonoured obligation ---------------------------------------------

check("an animating stylesheet without the block is the finding this rail exists for", () => {
  const css = ".thing { animation: spin 1s linear infinite; }";
  assert.equal(animates(css), true);
  assert.equal(hasReducedMotionBlock(css), false, "-> REDUCED_MOTION_UNHONOURED fires");
});

check("an animating stylesheet WITH the block is silent", () => {
  const css = `.thing { animation: spin 1s linear infinite; }\n${REDUCED_BLOCK}`;
  assert.equal(animates(css), true);
  assert.equal(hasReducedMotionBlock(css), true, "-> no finding");
});

// --- token resolvability ---------------------------------------------------

check("declared token names are read from the graph", () => {
  const names = declaredTokenNames(
    ":root {\n  --fsds-core-motion-duration-short: 150ms;\n  --fsds-other: 1px;\n}",
  );
  assert.ok(names.has("--fsds-core-motion-duration-short"));
  assert.equal(names.has("--fsds-nonexistent"), false);
});

check("a var() READ is not mistaken for a declaration", () => {
  // Only the left of a colon declares. Counting reads would make every
  // dangling reference resolve to itself.
  const names = declaredTokenNames(".a { color: var(--fsds-not-declared, red); }");
  assert.equal(names.has("--fsds-not-declared"), false);
});

// --- realized properties ---------------------------------------------------

check("transition shorthand properties are collected", () => {
  const props = animatedProperties(".a { transition: opacity 1s ease, transform 2s ease; }");
  assert.deepEqual([...props].sort(), ["opacity", "transform"]);
});

check("keyframe-declared properties count as animated", () => {
  const props = animatedProperties(
    "@keyframes popover-enter {\n  from {\n    opacity: 0;\n    transform: scale(0.96);\n  }\n  to {\n    opacity: 1;\n    transform: scale(1);\n  }\n}",
  );
  assert.ok(props.has("opacity"));
  assert.ok(props.has("transform"), "a keyframed property is realized, not unrealized");
});

check("`transition: none` contributes no realized property", () => {
  assert.deepEqual([...animatedProperties(".a { transition: none; }")], []);
});

check("properties inside the reduced-motion block are not counted as realized", () => {
  // Otherwise honouring reduced motion would itself satisfy the
  // MOTION_PROPERTY_UNREALIZED obligation it is unrelated to.
  assert.deepEqual([...animatedProperties(REDUCED_BLOCK)], []);
});

// --- identity --------------------------------------------------------------

check("finding identity separates the three obligation classes", () => {
  const base = { component: "Dialog", detail: "open declares opacity" };
  assert.notEqual(
    motionId({ ...base, kind: "MOTION_PROPERTY_UNREALIZED" }),
    motionId({ ...base, kind: "MOTION_TOKEN_UNRESOLVABLE" }),
  );
});

check("two transitions of one component stay distinct findings", () => {
  const base = { component: "Dialog", kind: "MOTION_PROPERTY_UNREALIZED" };
  assert.notEqual(
    motionId({ ...base, detail: "open declares opacity" }),
    motionId({ ...base, detail: "close declares opacity" }),
  );
});

console.log(
  failures === 0
    ? "\nselfcheck PASS — every check held"
    : `\nselfcheck FAIL — ${failures} check(s) failed`,
);
if (failures > 0) process.exit(1);
