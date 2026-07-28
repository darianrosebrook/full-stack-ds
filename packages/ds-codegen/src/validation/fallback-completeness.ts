/**
 * Fallback-completeness and fallback-staleness validation.
 *
 * Two invariants over the same surface, in order of dependency:
 *
 * 1. PRESENCE — every contract slot that declares `resolvesTo` MUST also
 *    declare `fallback`. The codegen emits `var(--ref, fallback)` only when
 *    `fallback` is present (ir.ts renders the declaration string from the
 *    sidecar fields verbatim — `var(--ref)` when fallback is absent). Without
 *    a fallback, the property silently drops to its initial value the moment
 *    the referenced token is unavailable (tokens.css absent, brand override
 *    removes it, density layer doesn't define it).
 *
 * 2. CORRECTNESS — a present fallback MUST equal the value the ref actually
 *    resolves to. A fallback is not a free-form safe default; it is a cached
 *    copy of a value that lives in the token graph, and like any cache it goes
 *    stale. Presence without correctness is worse than absence: an unguarded
 *    `var(--ref)` drops the property visibly, while a confidently-wrong
 *    fallback renders the wrong value and looks intentional.
 *
 * Scope: wide. Both rules apply to every `resolvesTo` entry in BOTH
 * `contract.tokens` (TokenResolution) and `contract.styles` (StyleEntry,
 * across every selector block). Component-local slot redirections are NOT
 * exempt — the cascade-chain argument ("the slot's own fallback in
 * tokens.json covers it") does not hold at a variant scope where the slot
 * has been re-pointed at a different global token.
 *
 * Why correctness needs a graph and not a vote: an earlier advisory
 * (FALLBACK-DIVERGENCE-01, now removed) flagged tokens whose fallback
 * literals *disagreed* across sites. Disagreement is a weak proxy for
 * wrongness in both directions. It is blind to a literal that is uniformly
 * wrong everywhere (the dominant case in this corpus), and where it does
 * fire it offers no way to pick a winner — `semantic.shape.control.radius.
 * default` was authored `8px` at 25 sites and `6px` at 1, and the graph says
 * `6px`, so the majority was the defect. Truth is read from the graph, never
 * inferred from frequency.
 *
 * Resolution is a chain. A styles.json declaration may point at a
 * component-layer slot (`accordion.border.color`) rather than a global token;
 * that slot is defined in the same contract's tokens.json with its own
 * `resolvesTo` into the semantic/core graph. Truth is the terminal `$value`
 * of that walk. The chain is always intra-contract — cross-component slot
 * references do not exist in this corpus and are rejected by
 * validateContractStyles — so this validator needs no corpus context.
 *
 * Non-claim: a fallback is a single static literal and the graph carries a
 * value per theme mode. Fallback correctness is therefore a LIGHT-MODE claim
 * only. A component rendered dark without tokens.css still falls back to the
 * light value; that is a limitation of the mechanism, not a defect this gate
 * can close.
 *
 * Failure shape: one `[FALLBACK_MISSING]` or `[FALLBACK_STALE]`-prefixed
 * ValidationIssue per offending slot, with a JSON pointer to the entry. The
 * CLI treats every issue as a hard error (cli.ts sets hasErrors on any
 * non-empty drift array).
 */

import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import type { ComponentContract } from "../contract.js";
import type { ValidationIssue } from "../validate.js";

/**
 * Validate that every `resolvesTo` slot in `contract.tokens` and
 * `contract.styles` carries a `fallback`. Returns one issue per offender.
 *
 * Pure-shape: no I/O, no token-graph dependency. Runs before the
 * token-graph validators (validateContractTokens / validateContractStyles)
 * so a missing fallback is reported independently of whether the ref path
 * itself is valid — two distinct defect classes.
 */
export function validateContractFallbackCompleteness(
  contract: ComponentContract,
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  // --- contract.tokens side (TokenResolution entries) ---
  const tokens = contract.tokens;
  if (tokens && typeof tokens === "object") {
    for (const [slotName, entry] of Object.entries(tokens)) {
      if (!entry || typeof entry !== "object") continue;
      const resolvesTo = (entry as { resolvesTo?: unknown }).resolvesTo;
      if (typeof resolvesTo !== "string") continue; // literal-only or empty: out of scope
      const fallback = (entry as { fallback?: unknown }).fallback;
      if (typeof fallback === "string" && fallback.length > 0) continue;
      issues.push({
        pointer: `/tokens/${escapePointerSegment(slotName)}`,
        message:
          `[FALLBACK_MISSING] slot "${slotName}" declares resolvesTo ` +
          `"${resolvesTo}" without a fallback. The codegen emits var(--ref) ` +
          `with no second argument, so the property drops to its initial ` +
          `value when the token is unavailable. Add a "fallback" field whose ` +
          `value is the real resolved literal.`,
      });
    }
  }

  // --- contract.styles side (StyleEntry entries, per selector block) ---
  const styles = contract.styles;
  if (styles && typeof styles === "object") {
    for (const [selectorKey, block] of Object.entries(styles)) {
      if (!block || typeof block !== "object") continue;
      for (const [property, entry] of Object.entries(
        block as Record<string, unknown>,
      )) {
        if (!entry || typeof entry !== "object") continue;
        const resolvesTo = (entry as { resolvesTo?: unknown }).resolvesTo;
        if (typeof resolvesTo !== "string") continue;
        const fallback = (entry as { fallback?: unknown }).fallback;
        if (typeof fallback === "string" && fallback.length > 0) continue;
        issues.push({
          pointer:
            `/styles/${escapePointerSegment(selectorKey)}/` +
            `${escapePointerSegment(property)}`,
          message:
            `[FALLBACK_MISSING] styles "${selectorKey}" redefines slot ` +
            `"${property}" with resolvesTo "${resolvesTo}" but no fallback. ` +
            `The variant/state scope does not inherit the slot's own fallback ` +
            `from tokens.json — the re-pointed ref is unguarded here. Add a ` +
            `"fallback" field whose value is the real resolved literal.`,
        });
      }
    }
  }

  return issues;
}

/** RFC 6901 escape: `/` → `~1`, `~` → `~0`. Slot names contain `.` (fine). */
function escapePointerSegment(seg: string): string {
  return seg.replace(/~/g, "~0").replace(/\//g, "~1");
}

// ---------------------------------------------------------------------------
// Fallback-staleness gate (FALLBACK-STALE-01)
// ---------------------------------------------------------------------------

/**
 * Canonicalize a literal so representation drift doesn't read as a value
 * difference. Applied to BOTH the authored fallback and the graph value, so
 * the comparison is representation-insensitive in a single direction:
 * - `1rem` ≡ `16px` (at the default 16px root)
 * - `6.0px` ≡ `6px`
 * - `#ABC` ≡ `#aabbcc`
 * - `0 2px 4px rgba(0, 0, 0, 0.1)` ≡ `0 2px 4px rgba(0,0,0,0.1)`
 *
 * Canonicalization only ever suppresses findings, never creates them, so an
 * over-broad rule here costs recall (a missed stale value), not precision.
 */
function canonicalizeFallback(literal: string): string {
  let v = literal.trim().toLowerCase().replace(/\s+/g, " ").replace(/,\s*/g, ",");
  const rem = v.match(/^(-?\d*\.?\d+)rem$/);
  if (rem) v = `${parseFloat(rem[1]!) * 16}px`;
  const px = v.match(/^(-?\d*\.?\d+)px$/);
  if (px) v = `${parseFloat(px[1]!)}px`;
  const hex3 = v.match(/^#([0-9a-f])([0-9a-f])([0-9a-f])$/);
  if (hex3) v = `#${hex3[1]!}${hex3[1]!}${hex3[2]!}${hex3[2]!}${hex3[3]!}${hex3[3]!}`;
  return v;
}

/**
 * Resolve the resolved-token-graph path. Lazy + workspace-anchored, mirroring
 * getComposedTokensPath in tokens.ts — under vitest's Vite-style loader
 * `import.meta.url` is not a `file://` URL and an eager call crashes the runner.
 *
 * NOTE this reads `resolved.tokens.json`, not `composed.tokens.json`. The
 * composed graph still carries unresolved refs (`{core.color.palette.red.500}`)
 * and cannot answer "what literal does this become".
 */
function getResolvedTokensPath(): string {
  let here: string;
  try {
    here = fileURLToPath(new URL(".", import.meta.url));
  } catch {
    here = process.cwd();
  }
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
  return join(repoRoot, "packages", "ds-tokens", "generated", "resolved.tokens.json");
}

type ResolvedGraph = Record<string, unknown>;

let cachedGraph: ResolvedGraph | "missing" | null = null;

/**
 * Load the resolved token tree. Memoized so a pass over the whole corpus
 * doesn't re-read and re-parse the same tree once per contract.
 */
export function loadResolvedTokenGraph(): ResolvedGraph | "missing" {
  if (cachedGraph !== null) return cachedGraph;
  const path = getResolvedTokensPath();
  if (!existsSync(path)) {
    cachedGraph = "missing";
    return "missing";
  }
  try {
    const parsed: unknown = JSON.parse(readFileSync(path, "utf8"));
    if (!parsed || typeof parsed !== "object") {
      cachedGraph = "missing";
      return "missing";
    }
    cachedGraph = parsed as ResolvedGraph;
  } catch {
    cachedGraph = "missing";
  }
  return cachedGraph;
}

/**
 * Test-only escape hatch — lets unit tests inject a fixture graph without
 * writing a real `resolved.tokens.json` to disk. Production never calls this.
 */
export function _resetResolvedGraphCacheForTests(
  override?: ResolvedGraph | "missing",
): void {
  cachedGraph = override === undefined ? null : override;
}

/**
 * Read a DTCG `$value` at a dot-path, or undefined when the path is absent or
 * is an interior node rather than a token leaf.
 */
function graphValueAt(graph: ResolvedGraph, path: string): unknown {
  let node: unknown = graph;
  for (const part of path.split(".")) {
    if (!node || typeof node !== "object") return undefined;
    node = (node as Record<string, unknown>)[part];
  }
  if (node && typeof node === "object" && "$value" in (node as object)) {
    return (node as { $value: unknown }).$value;
  }
  return undefined;
}

/**
 * Is this graph value a serialized composite rather than a CSS literal?
 *
 * DTCG composite types (`$type: shadow` and friends) are stored in
 * resolved.tokens.json as a JSON *string* holding the structured form —
 * `[{"offsetX":{"value":0,"unit":"px"},…}]` — not as the CSS `box-shadow`
 * text. The CSS lowering happens downstream in the tokens.css emitter, so the
 * graph cannot answer "what literal should the fallback be" for these 13
 * elevation tokens. Treating the serialization as a literal writes a JSON blob
 * into a `var(…, fallback)` and breaks the CSS parse outright — a real defect
 * caught by the Lit template rail on Calendar during this slice.
 *
 * We refuse to guess rather than reimplement the emitter's shadow lowering
 * here: a second lowering would be a second source of truth, and any drift
 * between the two would silently write wrong fallbacks.
 */
function isSerializedComposite(literal: string): boolean {
  const trimmed = literal.trim();
  if (trimmed[0] !== "[" && trimmed[0] !== "{") return false;
  try {
    const parsed: unknown = JSON.parse(trimmed);
    return typeof parsed === "object" && parsed !== null;
  } catch {
    return false;
  }
}

/**
 * Project a DTCG value to the literal a fallback should carry. Theme-mode
 * objects collapse to their `light` entry — see the light-mode non-claim in
 * the module header. Serialized composites yield undefined (unresolvable).
 */
function toLightLiteral(value: unknown): string | undefined {
  let scalar: string | undefined;
  if (typeof value === "string") scalar = value;
  else if (typeof value === "number") scalar = String(value);
  else if (value && typeof value === "object" && "light" in (value as object)) {
    const light = (value as { light: unknown }).light;
    if (typeof light === "string") scalar = light;
    else if (typeof light === "number") scalar = String(light);
  }
  if (scalar === undefined) return undefined;
  return isSerializedComposite(scalar) ? undefined : scalar;
}

/** Depth cap for chain resolution — guards a malformed self-referential slot. */
const MAX_CHAIN_HOPS = 8;

/**
 * Resolve a `resolvesTo` path to its terminal literal.
 *
 * Global tokens (`semantic.*`, `core.*`) hit the graph directly. A
 * component-layer path (`accordion.border.color`) is not in the graph; it is a
 * slot defined in this contract's own tokens.json, so we follow that slot's
 * `resolvesTo` and try again. Returns undefined when the chain dead-ends,
 * which is reported as unresolvable rather than stale — we cannot claim a
 * fallback is wrong when we cannot say what right is.
 */
function resolveTerminalLiteral(
  path: string,
  contract: ComponentContract,
  graph: ResolvedGraph,
  seen: Set<string> = new Set(),
): string | undefined {
  if (seen.has(path) || seen.size >= MAX_CHAIN_HOPS) return undefined;
  seen.add(path);

  const direct = graphValueAt(graph, path);
  if (direct !== undefined) return toLightLiteral(direct);

  const tokens = contract.tokens;
  if (tokens && typeof tokens === "object") {
    const slot = (tokens as Record<string, unknown>)[path];
    if (slot && typeof slot === "object") {
      const next = (slot as { resolvesTo?: unknown }).resolvesTo;
      if (typeof next === "string") {
        return resolveTerminalLiteral(next, contract, graph, seen);
      }
    }
  }
  return undefined;
}

/**
 * A fallback reading: one authored (resolvesTo, fallback) pair and where it
 * lives, so a finding can point at the exact sidecar entry.
 */
interface FallbackReading {
  resolvesTo: string;
  fallback: string;
  pointer: string;
  where: string;
}

/** Collect every authored fallback reading in a contract's two sidecars. */
function collectReadings(contract: ComponentContract): FallbackReading[] {
  const out: FallbackReading[] = [];

  const tokens = contract.tokens;
  if (tokens && typeof tokens === "object") {
    for (const [slot, entry] of Object.entries(tokens)) {
      if (!entry || typeof entry !== "object") continue;
      const resolvesTo = (entry as { resolvesTo?: unknown }).resolvesTo;
      const fallback = (entry as { fallback?: unknown }).fallback;
      if (typeof resolvesTo !== "string" || typeof fallback !== "string" || !fallback) {
        continue;
      }
      out.push({
        resolvesTo,
        fallback,
        pointer: `/tokens/${escapePointerSegment(slot)}`,
        where: `slot "${slot}"`,
      });
    }
  }

  const styles = contract.styles;
  if (styles && typeof styles === "object") {
    for (const [selectorKey, block] of Object.entries(styles)) {
      if (!block || typeof block !== "object") continue;
      for (const [property, entry] of Object.entries(block as Record<string, unknown>)) {
        if (!entry || typeof entry !== "object") continue;
        const resolvesTo = (entry as { resolvesTo?: unknown }).resolvesTo;
        const fallback = (entry as { fallback?: unknown }).fallback;
        if (typeof resolvesTo !== "string" || typeof fallback !== "string" || !fallback) {
          continue;
        }
        out.push({
          resolvesTo,
          fallback,
          pointer:
            `/styles/${escapePointerSegment(selectorKey)}/` +
            `${escapePointerSegment(property)}`,
          where: `styles "${selectorKey}" property "${property}"`,
        });
      }
    }
  }

  return out;
}

/**
 * Validate that every authored fallback equals the light-mode terminal value
 * of its `resolvesTo` chain. One `[FALLBACK_STALE]` issue per offending entry,
 * each naming the authored literal AND the graph-derived correct literal, so
 * the finding carries its own repair.
 *
 * Degrades loudly, not silently: when the token graph has not been built this
 * returns a single instructional issue rather than passing, mirroring
 * validateContractTokens.
 *
 * Readings whose chain dead-ends are skipped — see resolveTerminalLiteral.
 */
export function validateContractFallbackStale(
  contract: ComponentContract,
): ValidationIssue[] {
  const readings = collectReadings(contract);
  if (readings.length === 0) return [];

  const graph = loadResolvedTokenGraph();
  if (graph === "missing") {
    return [
      {
        pointer: "/tokens",
        message:
          `[FALLBACK_STALE] cannot verify fallback literals — token graph not ` +
          `built. Run \`pnpm -F @full-stack-ds/tokens build\` to emit ` +
          `packages/ds-tokens/generated/resolved.tokens.json before validating.`,
      },
    ];
  }

  const issues: ValidationIssue[] = [];
  for (const reading of readings) {
    const truth = resolveTerminalLiteral(reading.resolvesTo, contract, graph);
    if (truth === undefined) continue; // unresolvable: cannot claim wrongness
    if (canonicalizeFallback(reading.fallback) === canonicalizeFallback(truth)) {
      continue;
    }
    issues.push({
      pointer: reading.pointer,
      message:
        `[FALLBACK_STALE] ${reading.where} declares resolvesTo ` +
        `"${reading.resolvesTo}" with fallback "${reading.fallback}", but that ` +
        `token resolves to "${truth}". A fallback is a cached copy of the ` +
        `graph value; this one is stale, so the component renders "${reading.fallback}" ` +
        `whenever tokens.css is unavailable. Set the fallback to "${truth}".`,
    });
  }
  return issues;
}
