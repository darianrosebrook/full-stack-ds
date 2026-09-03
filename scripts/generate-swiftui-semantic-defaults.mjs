#!/usr/bin/env node
/**
 * Generate the SwiftUI `FsdsSemanticDefaults.light` table from the committed
 * token graph plus the Swift corpus's emitted `ref:` values.
 *
 * The table lives inside the otherwise hand-maintained `FsdsTheme.swift`, so
 * this script owns only the `@generated:start semantic-defaults` /
 * `@generated:end` region — the exact same drift-gate pattern as the token
 * build's committed outputs. It exists because the table is the one
 * token-carrying surface that was still hand-maintained: commit ea722ad1
 * lifted the light-theme surface roles and regenerated every generated tree
 * but left this table stale, and CI's Swift test caught the drift
 * (FIX-SWIFTUI-SEMANTIC-DEFAULTS-DRIFT-01).
 *
 * Coverage is "the graph-resolvable refs the swift corpus emits": every
 * `ref:` value in packages/ds-swiftui/Sources/DsSwiftUI/Components that
 * resolves to a leaf `$value` in resolved.tokens.json. Scalars become
 * `.string`/`.number`; mode-bearing {light,dark} tokens become
 * `.adaptive(light:dark:)` pairs.
 *
 * Usage:
 *   node scripts/generate-swiftui-semantic-defaults.mjs           # write
 *   node scripts/generate-swiftui-semantic-defaults.mjs --check   # drift gate
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const GRAPH_PATH = path.join(ROOT, "packages/ds-tokens/generated/resolved.tokens.json");
const COMPONENTS_DIR = path.join(ROOT, "packages/ds-swiftui/Sources/DsSwiftUI/Components");
const THEME_PATH = path.join(ROOT, "packages/ds-swiftui/Sources/DsSwiftUI/Tokens/FsdsTheme.swift");

const START_MARKER = "    // @generated:start semantic-defaults";
const END_MARKER = "    // @generated:end";

/** Swift string literal with escaping (matches codegen's swiftLiteral). */
function swiftLiteral(value) {
  return `"${String(value).replaceAll("\\", "\\\\").replaceAll('"', '\\"')}"`;
}

function walk(node, segments) {
  let cur = node;
  for (const seg of segments) {
    if (cur == null || typeof cur !== "object" || Array.isArray(cur)) return undefined;
    cur = cur[seg];
  }
  return cur;
}

function collectRefs(dir, out = new Set()) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) collectRefs(p, out);
    else if (entry.name.endsWith(".swift")) {
      const text = fs.readFileSync(p, "utf8");
      for (const m of text.matchAll(/ref:\s*"([^"]+)"/g)) out.add(m[1]);
    }
  }
  return out;
}

function swiftEntry(graph, ref) {
  const node = walk(graph, ref.split("."));
  if (node == null || typeof node !== "object" || Array.isArray(node)) return null;
  const value = node.$value;
  if (typeof value === "string") return `.string(${swiftLiteral(value)})`;
  if (typeof value === "number") return `.number(${value})`;
  if (typeof value === "object" && value !== null) {
    const { light, dark } = value;
    if (typeof light === "string" && typeof dark === "string") {
      return `.adaptive(light: ${swiftLiteral(light)}, dark: ${swiftLiteral(dark)})`;
    }
  }
  return null;
}

function generateBlock() {
  const graph = JSON.parse(fs.readFileSync(GRAPH_PATH, "utf8"));
  const refs = [...collectRefs(COMPONENTS_DIR)].sort();

  const lines = [];
  for (const ref of refs) {
    const entry = swiftEntry(graph, ref);
    if (entry === null) continue; // non-graph or non-leaf ref (component-local)
    lines.push(`        ${swiftLiteral(ref)}: ${entry},`);
  }

  return [
    START_MARKER,
    "    public static let light: [String: FsdsTokenValue] = [",
    ...lines,
    "    ]",
    END_MARKER,
  ].join("\n");
}

function main() {
  const check = process.argv.includes("--check");
  const block = generateBlock();

  const source = fs.readFileSync(THEME_PATH, "utf8");
  const lines = source.split("\n");

  const startIdx = lines.findIndex((l) => l.trimStart() === START_MARKER.trimStart() || l === START_MARKER);
  const endIdx = lines.findIndex((l) => l.trimStart() === END_MARKER.trimStart() || l === END_MARKER);

  if (startIdx === -1 || endIdx === -1 || endIdx < startIdx) {
    // Bootstrap: the region has not been introduced yet. Locate the
    // `public static let light` declaration and its closing bracket.
    const openIdx = lines.findIndex((l) => l.trim() === "public static let light: [String: FsdsTokenValue] = [");
    if (openIdx === -1) {
      console.error("error: could not locate the FsdsSemanticDefaults.light declaration in FsdsTheme.swift");
      process.exit(1);
    }
    const closeIdx = lines.findIndex((l, i) => i > openIdx && l === "    ]");
    if (closeIdx === -1) {
      console.error("error: could not locate the closing bracket of FsdsSemanticDefaults.light");
      process.exit(1);
    }
    if (check) {
      const current = lines.slice(openIdx, closeIdx + 1).join("\n");
      if (current === block) {
        console.log("swiftui semantic-defaults: up to date");
        process.exit(0);
      }
      console.error("drift: FsdsSemanticDefaults.light is stale (region not yet marked generated).");
      console.error("regenerate with: pnpm run swiftui:semantic-defaults");
      process.exit(1);
    }
    const replaced = [...lines.slice(0, openIdx), ...block.split("\n"), ...lines.slice(closeIdx + 1)];
    fs.writeFileSync(THEME_PATH, replaced.join("\n"));
    console.log("swiftui semantic-defaults: bootstrapped generated region");
    return;
  }

  const current = lines.slice(startIdx, endIdx + 1).join("\n");
  if (check) {
    if (current === block) {
      console.log("swiftui semantic-defaults: up to date");
      process.exit(0);
    }
    console.error("drift: FsdsSemanticDefaults.light does not match the graph + Swift corpus.");
    console.error("regenerate with: pnpm run swiftui:semantic-defaults");
    // Print a compact per-line diff for diagnosis.
    const a = current.split("\n");
    const b = block.split("\n");
    const max = Math.max(a.length, b.length);
    for (let i = 0; i < max; i++) {
      if (a[i] !== b[i]) {
        console.error(`  - ${a[i] ?? "<missing>"}`);
        console.error(`  + ${b[i] ?? "<missing>"}`);
      }
    }
    process.exit(1);
  }

  if (current === block) {
    console.log("swiftui semantic-defaults: already up to date");
    return;
  }
  const replaced = [...lines.slice(0, startIdx), ...block.split("\n"), ...lines.slice(endIdx + 1)];
  fs.writeFileSync(THEME_PATH, replaced.join("\n"));
  console.log("swiftui semantic-defaults: regenerated");
}

main();
