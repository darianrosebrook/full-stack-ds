/**
 * Contract → token-graph drift validation.
 *
 * The semantic validator (semantic.ts) covers cross-field invariants
 * INSIDE a contract. This validator covers an invariant BETWEEN a
 * contract and the design-token graph: every `resolvesTo` path a
 * contract names must exist as a real `$value`-bearing leaf in the
 * composed token tree.
 *
 * The failure mode this catches: the byte-compare diagnostic from
 * TOKENS-WORKSTREAM-STEP-05 surfaced 6 contract paths the token graph
 * didn't satisfy. That diagnostic was a one-shot; this validator is
 * the permanent gate built into `pnpm run generate:check` so the
 * drift can't reappear silently. Future contract authors learn at
 * validate time, not at runtime when a `var(--fsds-..., fallback)`
 * never finds its target.
 *
 * Doctrinal stance: the validator never modifies anything. It loads
 * `packages/ds-tokens/generated/composed.tokens.json` (the post-compose
 * intermediate), walks every $value-bearing leaf to build the known-
 * paths set, and reports anything a contract references but the graph
 * doesn't provide. If composed.tokens.json is missing or empty the
 * validator returns a single instructional issue rather than silently
 * passing.
 */

import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import type { ComponentContract, TokenLeaf, TokenTree } from "../contract.js";
import type { ValidationIssue } from "../validate.js";

/**
 * Resolve the composed token JSON path. Lazy so module load doesn't depend
 * on `import.meta.url` being a `file://` URL — under vitest's Vite-style
 * loader it isn't, and an eager call here crashed the test runner.
 */
function getComposedTokensPath(): string {
  let here: string;
  try {
    here = fileURLToPath(new URL(".", import.meta.url));
  } catch {
    here = process.cwd();
  }
  // Walk up from this file until we find pnpm-workspace.yaml. Anchoring on a
  // workspace marker survives both `dist/` shipping and direct `tsx` runs.
  let dir = here;
  let repoRoot = process.cwd();
  for (let i = 0; i < 12; i += 1) {
    if (existsSync(join(dir, "pnpm-workspace.yaml"))) {
      repoRoot = dir;
      break;
    }
    const parent = dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return join(repoRoot, "packages", "ds-tokens", "generated", "composed.tokens.json");
}

/**
 * Load the composed token tree and project every $value-bearing leaf to a
 * dot-path. Memoized so a CLI pass over 45 contracts doesn't re-read and
 * re-walk the same 718-token tree 45 times.
 */
let cachedKnownPaths: Set<string> | "missing" | null = null;

export function loadKnownTokenPaths(): Set<string> | "missing" {
  if (cachedKnownPaths !== null) return cachedKnownPaths;

  const composedPath = getComposedTokensPath();
  if (!existsSync(composedPath)) {
    cachedKnownPaths = "missing";
    return "missing";
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(readFileSync(composedPath, "utf8"));
  } catch {
    cachedKnownPaths = "missing";
    return "missing";
  }

  if (!parsed || typeof parsed !== "object") {
    cachedKnownPaths = "missing";
    return "missing";
  }

  const out = new Set<string>();
  collectLeafPaths(parsed as Record<string, unknown>, [], out);
  cachedKnownPaths = out;
  return out;
}

/**
 * Test-only escape hatch — lets unit tests inject a fixture without writing
 * a real `composed.tokens.json` to disk. Production code never calls this.
 */
export function _resetKnownTokenPathsCacheForTests(
  override?: Set<string> | "missing",
): void {
  cachedKnownPaths = override === undefined ? null : override;
}

function collectLeafPaths(
  node: Record<string, unknown>,
  path: string[],
  out: Set<string>,
): void {
  // A node is a token leaf iff it has a $value field (DTCG semantics).
  if ("$value" in node) {
    out.add(path.join("."));
    return;
  }
  for (const [key, value] of Object.entries(node)) {
    if (key.startsWith("$")) continue; // DTCG metadata
    if (value && typeof value === "object" && !Array.isArray(value)) {
      collectLeafPaths(value as Record<string, unknown>, [...path, key], out);
    }
  }
}

/**
 * Validate that every `resolvesTo` path in `contract.tokens` exists in the
 * composed token graph. Returns one ValidationIssue per missing path with
 * the JSON-pointer to the failing TokenResolution.
 *
 * When the token graph hasn't been built (composed.tokens.json missing),
 * returns a single root-level issue with build instructions rather than
 * passing silently — silent-pass would defeat the gate's purpose.
 */
export function validateContractTokens(
  contract: ComponentContract,
): ValidationIssue[] {
  const known = loadKnownTokenPaths();
  if (known === "missing") {
    return [
      {
        pointer: "/tokens",
        message:
          "token graph not built — run `pnpm -F @full-stack-ds/tokens build` " +
          "to emit packages/ds-tokens/generated/composed.tokens.json before " +
          "running --check-semantics.",
      },
    ];
  }

  const issues: ValidationIssue[] = [];
  const tokens = contract.tokens;
  if (!tokens || typeof tokens !== "object") return issues;

  walkTokenTree(tokens as Record<string, TokenLeaf | TokenTree>, "/tokens", known, issues);
  return issues;
}

function walkTokenTree(
  node: Record<string, TokenLeaf | TokenTree>,
  pointer: string,
  known: Set<string>,
  issues: ValidationIssue[],
): void {
  for (const [key, value] of Object.entries(node)) {
    const childPointer = `${pointer}/${escapePointerSegment(key)}`;
    if (Array.isArray(value)) {
      // Legacy flat-list TokenLeaf — no resolvesTo to validate. Skip.
      continue;
    }
    if (!value || typeof value !== "object") continue;

    const obj = value as Record<string, unknown>;
    if (typeof obj.resolvesTo === "string") {
      // This is a TokenResolution leaf.
      if (!known.has(obj.resolvesTo)) {
        issues.push({
          pointer: `${childPointer}/resolvesTo`,
          message:
            `references token "${obj.resolvesTo}" which is not defined in ` +
            `the token graph (packages/ds-tokens/generated/composed.tokens.json). ` +
            `Add the token under packages/ds-tokens/src/ or change resolvesTo.`,
        });
      }
      continue;
    }
    // Otherwise it's a nested TokenTree / nested TokenLeaf map — recurse.
    walkTokenTree(
      obj as Record<string, TokenLeaf | TokenTree>,
      childPointer,
      known,
      issues,
    );
  }
}

/** RFC 6901 escape: `/` → `~1`, `~` → `~0`. */
function escapePointerSegment(seg: string): string {
  return seg.replace(/~/g, "~0").replace(/\//g, "~1");
}
