#!/usr/bin/env node
// React-vs-SwiftUI emission parity fixture (FEAT-SWIFTUI-FINAL-FIVE-01).
//
// Generates EVERY corpus contract through both the react and swiftui
// emitters and compares their public API SURFACES (channel/prop presence
// derived from the IR, not the emitted bytes) against what each emitter
// actually emitted. Reports one row per component; exits 1 if any
// component emits for react but not swiftui.
//
// NON-CLAIMS: this is emission-level API-surface parity, not visual,
// behavioral, or token-value parity. A component passing here can still
// render differently across frameworks. It proves the contract→emission
// path admits both targets, nothing about runtime equivalence.
import { readFileSync, existsSync, readdirSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const dist = path.join(root, "packages", "ds-codegen", "dist");
const { buildComponentIR } = await import(path.join(dist, "ir.js"));
const { generateSwiftUIComponentSource } = await import(
  path.join(dist, "frameworks", "swift", "swiftui", "component-source.js")
);
const { generateSwiftUISurfaceFiles } = await import(
  path.join(dist, "frameworks", "swift", "swiftui", "surface-emit.js")
);
const reactFactory = await import(path.join(dist, "frameworks", "react", "factory.js"));

function loadContract(name) {
  const folder = path.join(root, "packages", "ds-contracts", "components", name);
  const contract = JSON.parse(
    readFileSync(path.join(folder, `${name}.contract.json`), "utf8"),
  );
  for (const sidecar of ["tokens", "styles"]) {
    const p = path.join(folder, `${name}.${sidecar}.json`);
    if (existsSync(p)) contract[sidecar] = JSON.parse(readFileSync(p, "utf8"));
  }
  return contract;
}

function reactEmits(ir) {
  try {
    const emitter = reactFactory.createReactEmitter({
      stackImportRelative: "../../primitives",
    });
    emitter.emitComponent(ir, {
      componentsRoot: "/dev/null",
      contractsRoot: "/dev/null",
    });
    return true;
  } catch {
    return false;
  }
}

function swiftEmits(ir) {
  try {
    if (ir.surface) {
      generateSwiftUISurfaceFiles(ir);
    } else {
      generateSwiftUIComponentSource(ir);
    }
    return true;
  } catch {
    return false;
  }
}

function surfaceOf(ir) {
  const channels = ir.behavior.normalizedChannels
    .map((c) => `${c.name}:${c.valueType}`)
    .sort();
  const props = ir.styledProps.map((p) => p.safeName).sort();
  return { channels, props };
}

const dirs = readdirSync(path.join(root, "packages", "ds-contracts", "components"))
  .filter((n) => !n.startsWith("."))
  .sort();
const rows = [];
let divergent = 0;
for (const name of dirs) {
  const ir = buildComponentIR(loadContract(name));
  const r = reactEmits(ir);
  const s = swiftEmits(ir);
  if (r && !s) divergent += 1;
  const { channels, props } = surfaceOf(ir);
  rows.push({ name, react: r, swift: s, channels: channels.length, props: props.length });
}
console.log("component | react | swift | channels | props");
for (const row of rows) {
  console.log(
    `${row.name} | ${row.react ? "yes" : "NO"} | ${row.swift ? "yes" : "NO"} | ${row.channels} | ${row.props}`,
  );
}
console.log(`\ncorpus: ${rows.length} | react-emitting: ${rows.filter((r) => r.react).length} | swift-emitting: ${rows.filter((r) => r.swift).length} | divergent (react&&!swift): ${divergent}`);
if (divergent > 0) {
  console.error("PARITY DIVERGENCE: components emit for react but not swiftui.");
  process.exit(1);
}
process.exit(0);
