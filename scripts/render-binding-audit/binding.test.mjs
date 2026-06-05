#!/usr/bin/env node
/**
 * RENDER-PROP-BINDING-BLAST-RADIUS-01 — locked obligation-classifier test.
 *
 * Asserts the render-obligation classifier against REAL contracts (deterministic):
 *   - a declared native form-control prop MUST classify native-attr, and when it
 *     is absent from anatomy.dom.bindings it MUST be reported missing;
 *   - behavior props (channel value/onChange) MUST NOT classify native-attr and
 *     MUST NOT be reported missing (typed false-positive control);
 *   - content props MUST NOT classify native-attr;
 *   - compound controls that bind native attrs on a NESTED input (TextField,
 *     Switch) MUST classify those native-attr as bound, not missing
 *     (no-false-negative control);
 *   - the global missing-native blast radius is EXACTLY the known set
 *     (regression lock).
 *
 * Standalone (named *.test.mjs so the shortcut-language guard treats it as a
 * test). Run: node scripts/render-binding-audit/binding.test.mjs
 */
import assert from "node:assert/strict";
import { classify, ALL_COMPONENTS } from "./audit.mjs";

let pass = 0;
let fail = 0;
const check = (name, fn) => {
  try {
    fn();
    console.log(`  ok  ${name}`);
    pass++;
  } catch (e) {
    console.error(`  XX  ${name}: ${e.message}`);
    fail++;
  }
};
const rowOf = (c, prop) => classify(c).rows.find((r) => r.prop === prop);

console.log("native form-control props declared but unbound -> native-attr + missing:");
for (const [c, prop] of [
  ["Input", "placeholder"],
  ["Input", "name"],
  ["Input", "required"],
  ["Checkbox", "name"],
  ["Checkbox", "value"],
]) {
  check(`${c}.${prop} is native-attr + missing`, () => {
    const r = rowOf(c, prop);
    assert.ok(r, `no row for ${c}.${prop}`);
    assert.equal(r.bucket, "native-attr", `bucket=${r.bucket}`);
    assert.equal(r.obligation, "missing", `obligation=${r.obligation}`);
  });
}

console.log("\nfalse-positive control — behavior/content props are NOT native-attr/missing:");
check("Input.onChange is behavior (not native-attr)", () => {
  const r = rowOf("Input", "onChange");
  assert.equal(r.bucket, "behavior", `bucket=${r.bucket}`);
});
check("Input.value is behavior (channel), not a missing native attr", () => {
  const r = rowOf("Input", "value");
  assert.equal(r.bucket, "behavior", `bucket=${r.bucket}`);
  assert.notEqual(r.obligation, "missing");
});
check("Checkbox.checked is behavior (channel), not native-attr", () => {
  const r = rowOf("Checkbox", "checked");
  assert.equal(r.bucket, "behavior", `bucket=${r.bucket}`);
});
check("TextField.label is NOT native-attr (content/structural, not a host attr)", () => {
  const r = rowOf("TextField", "label");
  assert.notEqual(r.bucket, "native-attr", `bucket=${r.bucket}`);
});

console.log("\nno-false-negative control — compound nested-input native attrs are BOUND:");
for (const [c, prop] of [
  ["TextField", "name"],
  ["TextField", "required"],
  ["TextField", "type"],
  ["Switch", "name"],
  ["Switch", "value"],
]) {
  check(`${c}.${prop} is native-attr + bound (nested input binding recognized)`, () => {
    const r = rowOf(c, prop);
    assert.ok(r, `no row for ${c}.${prop}`);
    assert.equal(r.bucket, "native-attr", `bucket=${r.bucket}`);
    assert.equal(r.obligation, "bound", `obligation=${r.obligation}`);
  });
}

console.log("\nmedia host control — Image binds its native attrs (no false negative):");
check("Image.src is native-attr + bound", () => {
  const r = rowOf("Image", "src");
  assert.equal(r.bucket, "native-attr", `bucket=${r.bucket}`);
  assert.equal(r.obligation, "bound", `obligation=${r.obligation}`);
});

console.log("\nblast-radius regression lock — the missing-native set is EXACTLY the known 5:");
check("global missing-native set equals the locked blast radius", () => {
  const missing = ALL_COMPONENTS()
    .flatMap((c) => classify(c).rows)
    .filter((r) => r.bucket === "native-attr" && r.obligation === "missing")
    .map((r) => `${r.component}.${r.prop}`)
    .sort();
  const expected = ["Checkbox.name", "Checkbox.value", "Input.name", "Input.placeholder", "Input.required"].sort();
  assert.deepEqual(missing, expected, `got: ${JSON.stringify(missing)}`);
});

console.log(`\nlocked test: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
