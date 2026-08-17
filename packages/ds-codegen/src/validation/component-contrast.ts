/**
 * Component-derived WCAG contrast gate (RAIL-COMPONENT-CONTRAST-01).
 *
 * The curated-pair gate in ds-tokens (`pnpm tokens:check-contrast`)
 * enforces the system-level pair contract. This validator is the
 * component-level complement: it derives the foreground × background
 * pairs MECHANICALLY from each contract's `styles.json` / `tokens.json`
 * binding chains — never from a hand-maintained per-component list —
 * and gates every derived pair at WCAG AA (4.5:1) in both light and
 * dark themes of `resolved.tokens.json`.
 *
 * Derivation model:
 *
 *   - Element blocks (styles.json keys whose entries are CSS property
 *     declarations) contribute `color` (fg) and `background-color` (bg)
 *     declarations. A declaration's `resolvesTo` is chased through
 *     component-local slots (first dotted segment === cssPrefix) —
 *     tokens.json base bindings, overlaid by scope redirections — until
 *     it terminates at a global token path or a hex literal.
 *
 *   - Scope blocks (styles.json keys containing slot-path redefinitions)
 *     redirect slots for their selector subtree. A ROOT scope (variant
 *     classes like `--info` / `.alert--info`) overlays every element
 *     block. A PART scope (a key naming an anatomy part, e.g. Dialog's
 *     `backdrop`) overlays only element blocks targeting that part —
 *     a sibling part's declarations are untouched, because a custom
 *     property redefinition only reaches the redefining selector's own
 *     subtree. Applying every scope to every block produced phantom
 *     pairs (Dialog modal fg against the backdrop scrim) at scan time.
 *
 * Exemptions and non-claims:
 *
 *   - DISABLED pairs are exempt: any scope or element block whose key
 *     matches /disabled/i. WCAG 1.4.3 Note 5 explicitly exempts
 *     disabled controls from contrast minimums; the curated gate takes
 *     the same stance.
 *   - Non-text contrast (border-color vs surface, WCAG 2.2 SC 1.4.11)
 *     is NOT gated here; the curated gate covers focus rings as the
 *     3:1 proxy.
 *   - Fallback literals on `resolvesTo` entries are not checked; they
 *     render only when the token sheet is absent.
 *   - FOREGROUND inherited across blocks (a title reading root's `color`
 *     without declaring its own) is still not modeled — only declared
 *     color declarations contribute fg. BACKGROUND inheritance IS
 *     modeled (RAIL-COMPONENT-CONTRAST-ANCESTRY-01): an element block
 *     that declares `color` without a same-block `background-color`
 *     pairs against the nearest declared ANCESTOR background, because
 *     that is what renders behind the text. Ancestry is mechanical —
 *     the anatomy.dom parent chain, with a transform-generated part
 *     (content.tokenPart) hanging off its container node — never a
 *     component name. Sibling selector variants are not ancestors: a
 *     background declared on one `[data-token=…]` block never pairs
 *     another variant's text.
 *   - Blocks that mix slot redefinitions with CSS properties are read
 *     as scopes only; their own property declarations are ignored.
 *
 * Pre-existing debt is ledgered in `component-contrast-known-gaps.json`
 * as a two-directional ratchet (same doctrine as the a11y-realization
 * audit's known-gaps.json): an unledgered failing pair is DRIFT, and a
 * ledger entry that no longer reproduces is DRIFT (stale), so the
 * ledger can only shrink truthfully.
 *
 * Doctrinal stance, matching the sibling validators: never modifies
 * anything. Reads the contract and the resolved-token-graph cache,
 * returns one ValidationIssue per problem.
 */

import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import type { ComponentContract, StyleEntry } from "../contract.js";
import { getCssPrefix } from "../contract.js";
import type { ValidationIssue } from "../validate.js";

/** WCAG 2.1 AA minimum contrast ratio for normal-size text. */
const WCAG_AA_NORMAL = 4.5;

/** Slot-chain hop budget; guards malformed chains without hanging. */
const MAX_CHAIN_DEPTH = 8;

/** WCAG 1.4.3 Note 5 exempts disabled controls from contrast minimums. */
const DISABLED_RE = /disabled/i;

const HEX_RE = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;

// ---------------------------------------------------------------------------
// WCAG math — mirrors the canonical implementation in
// packages/ds-tokens/build/w3c/w3c-contrast-validator.ts. Kept inline so
// this validator has no cross-package import surface (ds-codegen reads
// ds-tokens OUTPUTS as files, matching validation/tokens.ts).
// ---------------------------------------------------------------------------

function sRgbChannelToLinear(channel: number): number {
  const c = channel / 255;
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

function relativeLuminanceOfHex(hex: string): number {
  const normalized =
    hex.length === 4
      ? `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}`
      : hex;
  const r = parseInt(normalized.slice(1, 3), 16);
  const g = parseInt(normalized.slice(3, 5), 16);
  const b = parseInt(normalized.slice(5, 7), 16);
  return (
    0.2126 * sRgbChannelToLinear(r) +
    0.7152 * sRgbChannelToLinear(g) +
    0.0722 * sRgbChannelToLinear(b)
  );
}

export function contrastRatioHex(foreground: string, background: string): number | null {
  if (!HEX_RE.test(foreground) || !HEX_RE.test(background)) return null;
  const l1 = relativeLuminanceOfHex(foreground);
  const l2 = relativeLuminanceOfHex(background);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

// ---------------------------------------------------------------------------
// Workspace-anchored paths (same pattern as validation/tokens.ts).
// ---------------------------------------------------------------------------

function findWorkspaceRoot(): string {
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
  return repoRoot;
}

function getResolvedTokensPath(): string {
  return join(
    findWorkspaceRoot(),
    "packages",
    "ds-tokens",
    "generated",
    "resolved.tokens.json",
  );
}

function getKnownGapsPath(): string {
  return join(
    findWorkspaceRoot(),
    "packages",
    "ds-codegen",
    "src",
    "validation",
    "component-contrast-known-gaps.json",
  );
}

// ---------------------------------------------------------------------------
// Resolved token graph + known-gaps caches (test-injectable).
// ---------------------------------------------------------------------------

let cachedResolvedTree: unknown | "missing" | null = null;

function loadResolvedTokensTree(): unknown | "missing" {
  if (cachedResolvedTree !== null) return cachedResolvedTree;
  const resolvedPath = getResolvedTokensPath();
  if (!existsSync(resolvedPath)) {
    cachedResolvedTree = "missing";
    return cachedResolvedTree;
  }
  try {
    cachedResolvedTree = JSON.parse(readFileSync(resolvedPath, "utf8"));
  } catch {
    cachedResolvedTree = "missing";
  }
  return cachedResolvedTree;
}

export function _resetResolvedTokensCacheForTests(
  tree?: unknown | "missing",
): void {
  cachedResolvedTree = tree === undefined ? null : tree;
}

export interface ContrastKnownGap {
  /** Contract name exactly as it appears in the corpus folder. */
  component: string;
  /** Terminal identity of the foreground: a global token path or a literal hex. */
  fg: string;
  /** Terminal identity of the background: a global token path or a literal hex. */
  bg: string;
  note?: string;
  spec?: string;
}

let cachedKnownGaps: ContrastKnownGap[] | "missing" | null = null;

function loadKnownGaps(): ContrastKnownGap[] | "missing" {
  if (cachedKnownGaps !== null) return cachedKnownGaps;
  const gapsPath = getKnownGapsPath();
  if (!existsSync(gapsPath)) {
    cachedKnownGaps = "missing";
    return cachedKnownGaps;
  }
  try {
    const parsed = JSON.parse(readFileSync(gapsPath, "utf8")) as {
      gaps?: ContrastKnownGap[];
    };
    cachedKnownGaps = Array.isArray(parsed.gaps) ? parsed.gaps : "missing";
  } catch {
    cachedKnownGaps = "missing";
  }
  return cachedKnownGaps;
}

export function _resetKnownGapsCacheForTests(
  gaps?: ContrastKnownGap[] | "missing",
): void {
  cachedKnownGaps = gaps === undefined ? null : gaps;
}

// ---------------------------------------------------------------------------
// Pair derivation.
// ---------------------------------------------------------------------------

export type ContrastTerminal =
  | { kind: "global"; path: string }
  | { kind: "hex"; hex: string };

export interface DerivedContrastPair {
  /** Element-block key whose declarations produced the pair. */
  block: string;
  /** Scope overlays (including "(base)") under which this pair arises. */
  scopes: string[];
  fg: ContrastTerminal;
  bg: ContrastTerminal;
}

function terminalKey(terminal: ContrastTerminal): string {
  return terminal.kind === "global" ? terminal.path : terminal.hex.toLowerCase();
}

function expandHexLiteral(literal: string): string | null {
  if (!HEX_RE.test(literal)) return null;
  return literal.length === 4
    ? `#${literal[1]}${literal[1]}${literal[2]}${literal[2]}${literal[3]}${literal[3]}`.toLowerCase()
    : literal.toLowerCase();
}

interface ResolutionContext {
  cssPrefix: string;
  slots: Record<string, StyleEntry>;
  overrides: Record<string, StyleEntry>;
}

/**
 * Chase a `resolvesTo` target to its terminal: a global token path or a
 * hex literal. Component-local slots consult the scope overlay first,
 * then the tokens.json base binding — mirroring how a custom-property
 * redefinition wins inside its selector subtree. Returns `null` for
 * anything unresolvable (undeclared slots, non-color literals, cycles,
 * box-model slots); the styles/token validators already report those
 * shapes as DRIFT, so this gate skips rather than double-reports.
 */
function resolveTerminal(
  target: string,
  ctx: ResolutionContext,
  trail: Set<string>,
  depth: number,
): ContrastTerminal | null {
  if (depth > MAX_CHAIN_DEPTH || trail.has(target)) return null;
  trail.add(target);

  if (target.startsWith(`${ctx.cssPrefix}.`)) {
    const entry = ctx.overrides[target] ?? ctx.slots[target];
    if (!entry) return null;
    if (typeof entry.resolvesTo === "string") {
      return resolveTerminal(entry.resolvesTo, ctx, trail, depth + 1);
    }
    if (typeof entry.literal === "string") {
      const hex = expandHexLiteral(entry.literal);
      return hex ? { kind: "hex", hex } : null;
    }
    return null;
  }

  if (target.startsWith("box-model.")) return null;

  return { kind: "global", path: target };
}

function declarationTerminal(
  entry: StyleEntry | undefined,
  ctx: ResolutionContext,
): ContrastTerminal | null {
  if (!entry || typeof entry !== "object") return null;
  if (typeof entry.literal === "string") {
    const hex = expandHexLiteral(entry.literal);
    return hex ? { kind: "hex", hex } : null;
  }
  if (typeof entry.resolvesTo === "string") {
    return resolveTerminal(entry.resolvesTo, ctx, new Set(), 0);
  }
  return null;
}

/**
 * A scope key targets a part (rather than the root) when it names an
 * anatomy part directly or through its BEM element selector. Root
 * scopes — `--variant`, `.prefix--variant`, state words — overlay every
 * element block; part scopes overlay only blocks targeting that part.
 */
function partScopeTarget(
  scopeKey: string,
  cssPrefix: string,
  partNames: string[],
): string | null {
  const normalized = scopeKey.replace(/^\./, "");
  for (const part of partNames) {
    const bem = `${cssPrefix}__${part}`;
    if (normalized === part || normalized.includes(bem)) return part;
  }
  const bemElement = normalized.match(/__([a-z0-9-]+)/i);
  if (bemElement) return bemElement[1];
  return null;
}

function blockTargetsPart(blockKey: string, cssPrefix: string, part: string): boolean {
  const normalized = blockKey.replace(/^\./, "");
  return (
    normalized === part ||
    normalized.includes(`${cssPrefix}__${part}`) ||
    normalized.includes(`__${part}`)
  );
}

// ---------------------------------------------------------------------------
// Ancestry (RAIL-COMPONENT-CONTRAST-ANCESTRY-01).
// ---------------------------------------------------------------------------

interface DomNodeLike {
  part?: string;
  children?: DomNodeLike[];
  content?: string | { tokenPart?: string };
}

/**
 * Map each anatomy part to its ancestor-part chain, ordered NEAREST-FIRST
 * (immediate parent, then grandparent, …, root). Derived mechanically from
 * `anatomy.dom`. A transform-generated part (an object-form
 * `content.tokenPart` — one span per token, never a dom node itself) hangs
 * off its container node: the container's part is the generated part's
 * parent. Parts absent from the dom tree have no entry — callers fall back
 * to no inheritance for them rather than guessing an ancestor.
 */
function buildPartAncestry(
  anatomy: ComponentContract["anatomy"],
): Map<string, string[]> {
  const chains = new Map<string, string[]>();
  const dom =
    anatomy && !Array.isArray(anatomy) && anatomy.dom && typeof anatomy.dom === "object"
      ? (anatomy.dom as DomNodeLike)
      : undefined;
  if (!dom) return chains;
  const walk = (node: DomNodeLike, ancestorsOutward: string[]): void => {
    const part = typeof node.part === "string" ? node.part : null;
    const here = part ? [...ancestorsOutward, part] : ancestorsOutward;
    if (part) chains.set(part, here.slice(0, -1).reverse());
    const content = node.content;
    if (
      part &&
      content &&
      typeof content === "object" &&
      typeof content.tokenPart === "string"
    ) {
      // The generated spans render inside this node: nearest ancestor is
      // the container part, then the container's ancestors.
      chains.set(content.tokenPart, [...here].reverse());
    }
    for (const child of node.children ?? []) walk(child, here);
  };
  walk(dom, []);
  return chains;
}

/**
 * Resolve the background a color-only element block renders against: the
 * nearest ancestor element block (per the part ancestry chain) that
 * declares `background-color`. Scope overlays apply to an ancestor block
 * only when the active scope targets it — a root scope overlays every
 * block, a part scope (A4) only blocks of its own part — mirroring the
 * custom-property-subtree rule the same-block pairing already follows.
 * Disabled ancestor blocks are skipped like disabled pair blocks.
 */
function inheritedBackgroundTerminal(args: {
  blockKey: string;
  scopePart: string | null;
  elementBlocks: Array<[string, Record<string, StyleEntry>]>;
  cssPrefix: string;
  slots: Record<string, StyleEntry>;
  overrides: Record<string, StyleEntry>;
  partNames: string[];
  partAncestry: Map<string, string[]>;
}): ContrastTerminal | null {
  const target =
    partScopeTarget(args.blockKey, args.cssPrefix, args.partNames) ?? "root";
  const nearestFirst = args.partAncestry.get(target);
  if (!nearestFirst) return null;
  for (const ancestor of nearestFirst) {
    for (const [otherKey, otherBlock] of args.elementBlocks) {
      if (otherKey === args.blockKey) continue;
      if (DISABLED_RE.test(otherKey)) continue;
      // Conditional ancestor blocks (pseudo-state like `:hover`,
      // attribute variants like `[data-open]`) are state overlays, not
      // the resting background a descendant renders against — only an
      // UNCONDITIONAL block on the ancestor part contributes. Accordion's
      // chevron exposed this: its trigger declares no resting
      // `background-color` (only the `background` shorthand, which the
      // same-block rule has never modeled), and the hover overlay must
      // not stand in for it.
      if (/[:[]/.test(otherKey)) continue;
      if (!blockTargetsPart(otherKey, args.cssPrefix, ancestor)) continue;
      const overridesForAncestor =
        args.scopePart && !blockTargetsPart(otherKey, args.cssPrefix, args.scopePart)
          ? {}
          : args.overrides;
      const bg = declarationTerminal(
        otherBlock["background-color"],
        {
          cssPrefix: args.cssPrefix,
          slots: args.slots,
          overrides: overridesForAncestor,
        },
      );
      if (bg) return bg;
    }
  }
  return null;
}

/**
 * Derive every fg × bg pair a contract's styles realize, across base
 * scope and every slot-redirecting scope. Pairs are deduplicated by
 * (block, fg terminal, bg terminal) — identical terminals check
 * identically regardless of which scope produced them — with the
 * producing scopes merged for provenance in failure messages.
 */
export function deriveComponentContrastPairs(
  contract: ComponentContract,
): DerivedContrastPair[] {
  const styles = contract.styles;
  if (!styles || typeof styles !== "object") return [];

  const cssPrefix = getCssPrefix(contract);
  const slots = (contract.tokens ?? {}) as Record<string, StyleEntry>;
  const anatomy = contract.anatomy;
  const partNames: string[] = Array.isArray(anatomy)
    ? anatomy
    : (anatomy?.parts ?? []);
  const partAncestry = buildPartAncestry(anatomy);

  const elementBlocks: Array<[string, Record<string, StyleEntry>]> = [];
  const scopeBlocks: Array<[string, Record<string, StyleEntry>]> = [];
  for (const [key, block] of Object.entries(styles)) {
    if (!block || typeof block !== "object") continue;
    const typed = block as Record<string, StyleEntry>;
    if (Object.keys(typed).some((k) => k.includes("."))) {
      scopeBlocks.push([key, typed]);
    } else {
      elementBlocks.push([key, typed]);
    }
  }

  const scopes: Array<[string, Record<string, StyleEntry>]> = [
    ["(base)", {}],
    ...scopeBlocks,
  ];

  const byKey = new Map<string, DerivedContrastPair>();

  for (const [scopeKey, overrides] of scopes) {
    const scopePart =
      scopeKey === "(base)" ? null : partScopeTarget(scopeKey, cssPrefix, partNames);
    for (const [blockKey, block] of elementBlocks) {
      if (scopePart && !blockTargetsPart(blockKey, cssPrefix, scopePart)) continue;
      if (DISABLED_RE.test(scopeKey) || DISABLED_RE.test(blockKey)) continue;

      const ctx: ResolutionContext = { cssPrefix, slots, overrides };
      const fg = declarationTerminal(block["color"], ctx);
      if (!fg) continue;
      // Same-block background wins; a color-only block inherits the
      // nearest declared ANCESTOR background (RAIL-COMPONENT-CONTRAST-
      // ANCESTRY-01) — that is what renders behind the text.
      const bg =
        declarationTerminal(block["background-color"], ctx) ??
        inheritedBackgroundTerminal({
          blockKey,
          scopePart,
          elementBlocks,
          cssPrefix,
          slots,
          overrides,
          partNames,
          partAncestry,
        });
      if (!bg) continue;

      const key = `${blockKey}|${terminalKey(fg)}|${terminalKey(bg)}`;
      const existing = byKey.get(key);
      if (existing) {
        if (!existing.scopes.includes(scopeKey)) existing.scopes.push(scopeKey);
      } else {
        byKey.set(key, { block: blockKey, scopes: [scopeKey], fg, bg });
      }
    }
  }

  return [...byKey.values()];
}

// ---------------------------------------------------------------------------
// Theme resolution + validation.
// ---------------------------------------------------------------------------

/**
 * Read a terminal's concrete hex for a theme from the resolved tree.
 * Global terminals walk the dotted path to a `$value` leaf (either a
 * plain hex string or a `{light, dark}` theme object). Hex terminals
 * are theme-invariant. `null` when the path doesn't resolve — treated
 * as skip, since reference integrity is validateContractStyles drift.
 */
function terminalHex(
  resolvedTree: unknown,
  terminal: ContrastTerminal,
  theme: "light" | "dark",
): string | null {
  if (terminal.kind === "hex") return terminal.hex;
  let cur: unknown = resolvedTree;
  for (const segment of terminal.path.split(".")) {
    if (typeof cur !== "object" || cur === null) return null;
    cur = (cur as Record<string, unknown>)[segment];
  }
  const value =
    cur && typeof cur === "object" && "$value" in (cur as Record<string, unknown>)
      ? (cur as Record<string, unknown>).$value
      : undefined;
  if (typeof value === "string") {
    return expandHexLiteral(value);
  }
  if (value && typeof value === "object") {
    const themed =
      (value as Record<string, unknown>)[theme] ??
      (value as Record<string, unknown>).light;
    return typeof themed === "string" ? expandHexLiteral(themed) : null;
  }
  return null;
}

function describeTerminal(terminal: ContrastTerminal): string {
  return terminal.kind === "global" ? terminal.path : `literal ${terminal.hex}`;
}

function gapMatchKey(component: string, fg: string, bg: string): string {
  return `${component}|${fg}|${bg}`;
}

function escapePointerSegment(seg: string): string {
  return seg.replace(/~/g, "~0").replace(/\//g, "~1");
}

export function validateComponentContrast(
  contract: ComponentContract,
): ValidationIssue[] {
  const styles = contract.styles;
  if (!styles || typeof styles !== "object") return [];

  const tree = loadResolvedTokensTree();
  if (tree === "missing") {
    return [
      {
        pointer: "/styles",
        message:
          "cannot validate component contrast — resolved.tokens.json not built. " +
          "Run `pnpm -F @full-stack-ds/tokens build` to emit " +
          "packages/ds-tokens/generated/resolved.tokens.json.",
      },
    ];
  }

  const gaps = loadKnownGaps();
  if (gaps === "missing") {
    return [
      {
        pointer: "/styles",
        message:
          "cannot validate component contrast — the known-gaps ledger is missing or " +
          "malformed at packages/ds-codegen/src/validation/component-contrast-known-gaps.json. " +
          "Restore it from git; the gate refuses to run without its ledger.",
      },
    ];
  }

  const pairs = deriveComponentContrastPairs(contract);
  const componentGaps = gaps.filter((g) => g.component === contract.name);
  const ledgeredKeys = new Set(
    componentGaps.map((g) => gapMatchKey(contract.name, g.fg, g.bg)),
  );

  interface Failure {
    pair: DerivedContrastPair;
    theme: "light" | "dark";
    ratio: number;
    fgHex: string;
    bgHex: string;
  }
  const failures: Failure[] = [];

  for (const pair of pairs) {
    for (const theme of ["light", "dark"] as const) {
      const fgHex = terminalHex(tree, pair.fg, theme);
      const bgHex = terminalHex(tree, pair.bg, theme);
      if (!fgHex || !bgHex) continue;
      const ratio = contrastRatioHex(fgHex, bgHex);
      if (ratio === null || ratio >= WCAG_AA_NORMAL) continue;
      failures.push({ pair, theme, ratio, fgHex, bgHex });
    }
  }

  const issues: ValidationIssue[] = [];
  const failingKeys = new Set<string>();

  for (const failure of failures) {
    const key = gapMatchKey(
      contract.name,
      terminalKey(failure.pair.fg),
      terminalKey(failure.pair.bg),
    );
    failingKeys.add(key);
    if (ledgeredKeys.has(key)) continue;
    issues.push({
      pointer: `/styles/${escapePointerSegment(failure.pair.block)}`,
      message:
        `${failure.theme} theme: contrast ${failure.ratio.toFixed(2)}:1 < required ` +
        `${WCAG_AA_NORMAL}:1 (WCAG AA, normal text) — fg ${describeTerminal(failure.pair.fg)} ` +
        `(${failure.fgHex}) on bg ${describeTerminal(failure.pair.bg)} (${failure.bgHex}); ` +
        `derived from block "${failure.pair.block}" under scopes: ` +
        `${failure.pair.scopes.join(", ")}. Fix the token values or the binding chain ` +
        `(pre-existing debt gets a ledger entry in component-contrast-known-gaps.json; ` +
        `new regressions do not).`,
    });
  }

  for (const gap of componentGaps) {
    const key = gapMatchKey(contract.name, gap.fg, gap.bg);
    if (failingKeys.has(key)) continue;
    issues.push({
      pointer: "/styles",
      message:
        `known-gaps ledger entry (fg ${gap.fg} on bg ${gap.bg}) no longer reproduces a ` +
        `failing pair for ${contract.name} — remove it from ` +
        `component-contrast-known-gaps.json. The ledger can only shrink truthfully.`,
    });
  }

  return issues;
}
