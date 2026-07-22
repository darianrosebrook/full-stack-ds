#!/usr/bin/env node
/**
 * Self-check for the a11y-realization classifier (runs before audit.mjs in
 * the npm script, mirroring the behavior rail's realization.test.mjs).
 *
 * Pins the classifier's load-bearing behaviors with inline fixtures so a
 * classifier regression fails HERE, with a named assertion, before the audit
 * produces a misleading matrix. Each assertion states the behavior pinned.
 */
import {
  atomicKeys,
  classify,
  deriveObligations,
  relationshipTokens,
} from "./audit.mjs";

let failures = 0;
function check(name, actual, expected) {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  if (a !== e) {
    failures += 1;
    console.error(`FAIL ${name}\n  expected ${e}\n  actual   ${a}`);
  }
}

// -- key parsing --------------------------------------------------------------
// "Enter|Space" is two atomic keys; Shift+Tab collapses to Tab (the trap owns both).
check("atomicKeys splits alternatives", atomicKeys("Enter|Space"), ["Enter", "Space"]);
check("atomicKeys folds Shift+Tab", atomicKeys("Shift+Tab"), ["Tab"]);

// -- obligation derivation ----------------------------------------------------
const derived = deriveObligations([
  {
    name: "Fixture",
    contract: {
      relationships: [
        { from: "label", to: "control", attribute: "for" },
        { from: "label", to: "control", attribute: "for" }, // duplicate — deduped
      ],
      a11y: { keyboard: [{ key: "ArrowDown" }] },
      focus: { strategy: "roving" },
    },
  },
]);
check(
  "derives relationship+keyboard+focus, deduped",
  derived,
  [
    { component: "Fixture", class: "relationship", key: "for" },
    { component: "Fixture", class: "keyboard", key: "ArrowDown" },
    { component: "Fixture", class: "focus", key: "roving" },
  ],
);

// -- relationship surfaces ----------------------------------------------------
// web-dom: `for` has framework spellings; other attrs match their own name.
check(
  "web-dom for tokens include htmlFor",
  relationshipTokens("web-dom", "for").includes("htmlFor"),
  true,
);
check(
  "web-dom default token is the attribute",
  relationshipTokens("web-dom", "aria-labelledby"),
  ["aria-labelledby"],
);
// native-mobile: labelledby maps to the RN prop; describedby has NO surface.
check(
  "native-mobile labelledby maps to accessibilityLabelledBy",
  relationshipTokens("native-mobile", "aria-labelledby").includes("accessibilityLabelledBy"),
  true,
);
check("native-mobile describedby excluded", relationshipTokens("native-mobile", "aria-describedby"), null);

// -- classification -----------------------------------------------------------
const rel = { component: "X", class: "relationship", key: "aria-labelledby" };
check(
  "relationship realized when attribute present",
  classify(rel, "web-dom", 'x = <div aria-labelledby="y">', new Set()).verdict,
  "realized",
);
check(
  "relationship unrealized when attribute absent",
  classify(rel, "web-dom", "<div>", new Set()).verdict,
  "unrealized",
);
check(
  "native-mobile keyboard obligations are excluded, not unrealized",
  classify({ component: "X", class: "keyboard", key: "Enter" }, "native-mobile", "", new Set())
    .verdict,
  "excluded",
);

const kbEnterSpace = { component: "X", class: "keyboard", key: "Enter|Space" };
check(
  "Enter|Space realized natively on a contract button",
  classify(kbEnterSpace, "web-dom", "", new Set(["button"])).verdict,
  "realized",
);
check(
  "Enter|Space realized natively via native element in emitted source",
  classify(kbEnterSpace, "web-dom", "<button type=\"button\">", new Set()).verdict,
  "realized",
);
// Arrow keys are NEVER native: a native tag must not satisfy composite navigation.
check(
  "ArrowDown NOT satisfied by native button",
  classify({ component: "X", class: "keyboard", key: "ArrowDown" }, "web-dom", "<button>", new Set(["button"]))
    .verdict,
  "unrealized",
);
check(
  "ArrowDown realized by explicit keydown handler",
  classify({ component: "X", class: "keyboard", key: "ArrowDown" }, "web-dom", "onKeyDown={h}", new Set())
    .verdict,
  "realized",
);
check(
  "Escape realized by dismissal primitive import",
  classify({ component: "X", class: "keyboard", key: "Escape" }, "web-dom", "import { useDismissal }", new Set())
    .verdict,
  "realized",
);
check(
  "Escape NOT realized by focus-trap alone... unless trap present counts only for Tab",
  classify({ component: "X", class: "keyboard", key: "Escape" }, "web-dom", "plain source", new Set())
    .verdict,
  "unrealized",
);

// focus strategies
check(
  "trap realized by focus-trap primitive",
  classify({ component: "X", class: "focus", key: "trap" }, "web-dom", "useFocusTrap(", new Set()).verdict,
  "realized",
);
check(
  "roving demands explicit key handling (never native)",
  classify({ component: "X", class: "focus", key: "roving" }, "web-dom", "<button>", new Set(["button"]))
    .verdict,
  "unrealized",
);

if (failures > 0) {
  console.error(`\n[a11y-rail selfcheck] ${failures} assertion(s) failed`);
  process.exit(1);
}
console.log("[a11y-rail selfcheck] all classifier assertions pass");
