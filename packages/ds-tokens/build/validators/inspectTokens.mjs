#!/usr/bin/env node

/**
 * Design Tokens Inspector
 *
 * Resolves token reference chains across core + semantic packs, including
 * mode-aware overrides (fsds.light|dark). Produces:
 *  - CLI inspection for a specific token path
 *  - Full report JSON mapping token paths → { chain, valueByMode, errors }
 *
 * @author Darian Rosebrook
 * @version 1.0.0
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, "..", "..");

const TOKENS_DIR = path.join(PROJECT_ROOT, "ui", "designTokens");
const CORE_PATH = path.join(TOKENS_DIR, "core.tokens.json");
const SEMANTIC_PATH = path.join(TOKENS_DIR, "semantic.tokens.json");
const COMPOSED_PATH = path.join(TOKENS_DIR, "designTokens.json");
const REPORT_PATH = path.join(TOKENS_DIR, "insights.json");

function readJSON(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    return undefined;
  }
}

// Prefer composed if available, otherwise merge core + semantic under roots
function loadTokenTree() {
  const composed = readJSON(COMPOSED_PATH);
  if (composed && (composed.core || composed.semantic)) return composed;
  const core = readJSON(CORE_PATH) ?? {};
  const semantic = readJSON(SEMANTIC_PATH) ?? {};
  return { core, semantic };
}

function getByPath(obj, tokenPath) {
  if (!obj) return undefined;
  const parts = tokenPath.split(".");
  let node = obj;
  for (const part of parts) {
    if (node && typeof node === "object" && part in node) {
      node = node[part];
    } else {
      return undefined;
    }
  }
  return node;
}

const REF_PATTERN = /\{([^}]+)\}/g; // captures inner token path

function isTokenNode(node) {
  return (
    node &&
    typeof node === "object" &&
    ("$value" in node || "$extensions" in node)
  );
}

function pickModeValue(node, mode) {
  const paths = node?.$extensions?.design?.paths;
  if (paths && typeof paths === "object") {
    if (mode === "light" && typeof paths.light === "string") return paths.light;
    if (mode === "dark" && typeof paths.dark === "string") return paths.dark;
  }
  return node?.$value;
}

function extractRefsFromString(str) {
  if (typeof str !== "string") return [];
  const refs = [];
  let match;
  while ((match = REF_PATTERN.exec(str)) !== null) refs.push(match[1]);
  return refs;
}

function replaceRefsInString(str, refToValueMap) {
  if (typeof str !== "string") return str;
  return str.replace(REF_PATTERN, (_, p1) => {
    const v = refToValueMap.get(p1);
    return v != null ? String(v) : `/* unresolved:${p1} */`;
  });
}

function extractTokenPaths(obj, prefix = "") {
  const paths = [];
  for (const [key, value] of Object.entries(obj || {})) {
    if (key.startsWith("$")) continue;
    const current = prefix ? `${prefix}.${key}` : key;
    if (isTokenNode(value) && value?.$value !== undefined) {
      paths.push(current);
    } else if (value && typeof value === "object") {
      paths.push(...extractTokenPaths(value, current));
    }
  }
  return paths;
}

/**
 * Resolve a token path to final values per mode, capturing the reference chain.
 */
function resolveToken(tree, tokenPath, { mode } = { mode: undefined }) {
  const contextNs = tokenPath.startsWith("core.")
    ? "core"
    : tokenPath.startsWith("semantic.")
      ? "semantic"
      : undefined;

  function qualify(refPath) {
    if (refPath.startsWith("core.") || refPath.startsWith("semantic."))
      return [refPath];
    // Prefer core for unqualified refs (semantic often aliases core)
    const candidates = [`core.${refPath}`, `semantic.${refPath}`];
    // If context is known, try that first by reordering
    if (contextNs === "semantic")
      return [`core.${refPath}`, `semantic.${refPath}`];
    if (contextNs === "core") return [`core.${refPath}`, `semantic.${refPath}`];
    return candidates;
  }

  function resolveForMode(modeArg) {
    const visited = new Set();
    const chain = [];
    const errors = [];

    function resolveValue(raw) {
      if (raw == null) return raw;
      if (Array.isArray(raw)) return raw.map((v) => resolveValue(v));
      if (typeof raw === "object") return raw;

      if (typeof raw === "string") {
        const refs = extractRefsFromString(raw);
        if (refs.length === 0) return raw;
        const map = new Map();
        for (const ref of refs) {
          const { value } = innerResolve(ref);
          map.set(ref, value);
        }
        return replaceRefsInString(raw, map);
      }
      return raw;
    }

    function innerResolve(pathStr) {
      // Qualify and find the first existing candidate
      const candidates = qualify(pathStr);
      let foundPath = undefined;
      let node = undefined;
      for (const cand of candidates) {
        node = getByPath(tree, cand);
        if (node) {
          foundPath = cand;
          break;
        }
      }
      const effectivePath = foundPath ?? candidates[0];

      if (visited.has(effectivePath)) {
        errors.push(`Cycle detected at ${effectivePath}`);
        return { value: undefined };
      }
      visited.add(effectivePath);
      chain.push(effectivePath);

      if (!node) {
        errors.push(`Missing token: ${pathStr}`);
        return { value: undefined };
      }

      const raw = pickModeValue(node, modeArg);
      const value = resolveValue(raw);
      return { value };
    }

    const { value } = innerResolve(tokenPath);
    return { value, chain, errors };
  }

  const light = resolveForMode("light");
  const dark = resolveForMode("dark");

  const preferred = mode === "dark" ? dark.value : light.value;

  const errors = [...light.errors, ...dark.errors];
  const chain = Array.from(new Set([...light.chain, ...dark.chain]));

  return {
    path: tokenPath,
    chain,
    value: preferred,
    valueByMode: { light: light.value, dark: dark.value },
    errors,
  };
}

function generateReport(tree) {
  const corePaths = extractTokenPaths(tree.core || {}).map((p) => `core.${p}`);
  const semanticPaths = extractTokenPaths(tree.semantic || {}).map(
    (p) => `semantic.${p}`,
  );
  const all = [...corePaths, ...semanticPaths].sort();
  const report = {};
  for (const p of all) {
    report[p] = resolveToken(tree, p);
  }
  return report;
}

function printResult(result) {
  const { path: p, chain, valueByMode, errors } = result;
  console.log(`\n[inspect] ${p}`);
  console.log(`  chain: ${chain.join(" → ")}`);
  console.log(`  light: ${JSON.stringify(valueByMode.light)}`);
  console.log(`  dark : ${JSON.stringify(valueByMode.dark)}`);
  if (errors.length) {
    console.log(`  errors:`);
    for (const e of errors) console.log(`   - ${e}`);
  }
}

function main() {
  const tree = loadTokenTree();
  if (!tree || (!tree.core && !tree.semantic)) {
    console.error(
      "[inspect] No tokens found. Run npm run tokens:compose first.",
    );
    process.exit(1);
  }

  const [, , maybePath, ...rest] = process.argv;
  if (maybePath) {
    const modeArg = rest.find((a) => a.startsWith("--mode="))?.split("=")[1];
    const result = resolveToken(tree, maybePath, { mode: modeArg });
    printResult(result);
    return;
  }

  console.log("[inspect] Generating full insights report...");
  const report = generateReport(tree);
  fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2));
  console.log(`[inspect] Wrote ${path.relative(PROJECT_ROOT, REPORT_PATH)}`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { generateReport, loadTokenTree, resolveToken };
