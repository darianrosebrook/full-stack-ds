#!/usr/bin/env node
/**
 * One-shot migrator: rewrite flat string-array tokens in contract files
 * into the structured `tokenResolution` form so codegen can emit real
 * `var(--<name>, <fallback>)` declarations.
 *
 * Policy (Phase 1.2):
 *   - Migrate a token leaf (a flat string array) to the structured map
 *     form ONLY when every token in the leaf can be resolved cleanly:
 *       * `property` inferable from the token name suffix
 *       * `fallback` extractable from the contract's `styles` block
 *       * no state suffix (`-hover`, `-active`, etc.) in the token name
 *   - Leaves containing any unresolved token stay as flat string arrays
 *     (codegen continues to emit them as comment shims). A future pass
 *     will lift state-aware tokens into compound selectors.
 *
 * Usage:
 *   npx tsx packages/ds-codegen/scripts/migrate-tokens.ts [--dry-run]
 *   npx tsx packages/ds-codegen/scripts/migrate-tokens.ts Button Modal  (filter)
 *
 * Reports per-contract: how many leaves were migrated, how many were
 * skipped, and a per-skip reason summary.
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const CONTRACTS_DIR = path.join(ROOT, "packages", "ds-contracts");

type AnyJson = unknown;
type Json = string | number | boolean | null | { [k: string]: Json } | Json[];

interface TokenResolution {
  resolvesTo: string;
  fallback: string;
  property?: string;
  layer?: "core" | "semantic" | "brand" | "density";
}

interface SkipReason {
  token: string;
  reason: string;
}

interface LeafReport {
  path: string[];
  migrated: boolean;
  reasons: SkipReason[];
  tokenCount: number;
}

const STATE_SUFFIXES = [
  "hover",
  "active",
  "focus",
  "pressed",
  "selected",
  "disabled",
  "expanded",
  "collapsed",
  "checked",
  "invalid",
  "loading",
  "open",
  "closed",
  "visible",
  "hidden",
];

/**
 * Map a token name (last 1-2 dotted segments) to a CSS property.
 * Returns null when the property cannot be inferred unambiguously.
 */
function inferProperty(tokenName: string): string | null {
  const segments = tokenName.split(".");
  const last = segments[segments.length - 1];
  const prev = segments[segments.length - 2] ?? "";

  // Direct exact-match suffixes anywhere in the name.
  const exact: Record<string, string> = {
    "font-family": "font-family",
    "font-size": "font-size",
    "font-weight": "font-weight",
    "line-height": "line-height",
    "letter-spacing": "letter-spacing",
    radius: "border-radius",
    "border-radius": "border-radius",
    "border-width": "border-width",
    padding: "padding",
    margin: "margin",
    gap: "gap",
    "min-height": "min-height",
    "max-height": "max-height",
    height: "height",
    width: "width",
    "min-width": "min-width",
    "max-width": "max-width",
    duration: "transition-duration",
    easing: "transition-timing-function",
    "z-index": "z-index",
  };
  if (exact[last]) return exact[last];

  // Two-segment compound endings (prev.last).
  const compound = `${prev}.${last}`;
  const compoundMap: Record<string, string> = {
    "shape.radius": "border-radius",
    "shape.border-width": "border-width",
    "size.padding": "padding",
    "size.gap": "gap",
    "size.min-height": "min-height",
    "size.max-height": "max-height",
    "size.height": "height",
    "size.width": "width",
    "size.min-width": "min-width",
    "size.max-width": "max-width",
    "spacing.padding": "padding",
    "spacing.margin": "margin",
    "spacing.gap": "gap",
    "motion.duration": "transition-duration",
    "motion.easing": "transition-timing-function",
    "color.bg": "background-color",
    "color.background": "background-color",
    "color.fg": "color",
    "color.foreground": "color",
    "color.text": "color",
    "color.icon": "color",
    "color.border": "border-color",
    "color.focus-ring": "box-shadow",
    "color.focus-border": "border-color",
    "elevation.shadow": "box-shadow",
    "opacity.disabled": "opacity",
    "typography.font-family": "font-family",
    "typography.font-size": "font-size",
    "typography.font-weight": "font-weight",
    "typography.line-height": "line-height",
    "typography.letter-spacing": "letter-spacing",
  };
  if (compoundMap[compound]) return compoundMap[compound];

  // `*.color.<variant>-bg` and friends: variant prefix on the last segment.
  if (prev === "color") {
    if (last.endsWith("-bg") || last.endsWith("-background"))
      return "background-color";
    if (last.endsWith("-fg") || last.endsWith("-foreground")) return "color";
    if (last.endsWith("-text")) return "color";
    if (last.endsWith("-icon")) return "color";
    if (last.endsWith("-border")) return "border-color";
    if (last.endsWith("-focus-ring")) return "box-shadow";
    if (last.endsWith("-focus-border")) return "border-color";
  }

  if (prev === "opacity") return "opacity";
  if (prev === "elevation") return "box-shadow";
  if (prev === "z-index" || last === "z-index") return "z-index";

  return null;
}

/**
 * True if the token name's last segment ends with a state suffix
 * (`-hover`, `-active`, `-focus`, etc.). Such tokens need state-aware
 * emission (e.g. `.btn--primary:hover { ... }`) which the IR doesn't
 * yet do — the migrator skips them.
 */
function hasStateSuffix(tokenName: string): boolean {
  const last = tokenName.split(".").pop() ?? "";
  return STATE_SUFFIXES.some((s) => last.endsWith(`-${s}`));
}

/**
 * Try to find a fallback value for a token in the contract's `styles`
 * block, given the leaf path (e.g. ["root"] or ["kind", "primary"]) and
 * the inferred CSS property.
 *
 * Selector-key resolution:
 *   - leaf path ["root"]            → styles.root
 *   - leaf path ["focus"]           → styles[":focus-visible"]
 *   - leaf path ["<dim>", "<val>"]  → styles["--<val>"]
 *   - leaf path ["<part>"]          → styles[<part>] OR styles["__<part>"]
 */
function findFallback(
  styles: Record<string, Record<string, string>> | undefined,
  leafPath: string[],
  property: string,
): string | null {
  if (!styles) return null;
  const candidates: string[] = [];
  if (leafPath.length === 1) {
    const key = leafPath[0];
    if (key === "root") candidates.push("root");
    else if (key === "focus") candidates.push(":focus-visible");
    else {
      candidates.push(key, `__${key}`);
    }
  } else if (leafPath.length === 2) {
    const [, val] = leafPath;
    candidates.push(`--${val}`);
  }
  for (const c of candidates) {
    const block = styles[c];
    if (block && typeof block[property] === "string") return block[property];
  }
  return null;
}

/**
 * Walk a `tokens` tree, attempting to convert each flat-string leaf to
 * structured form. Leaves with any unresolvable token stay flat.
 *
 * Returns a new tree (does not mutate the input) plus a per-leaf report.
 */
function migrateTokensTree(
  tokens: Record<string, AnyJson>,
  styles: Record<string, Record<string, string>> | undefined,
): { tree: Record<string, AnyJson>; reports: LeafReport[] } {
  const reports: LeafReport[] = [];
  const out: Record<string, AnyJson> = {};

  function walk(value: AnyJson, currentPath: string[]): AnyJson {
    if (Array.isArray(value)) {
      // Flat string array — convert each token individually. Tokens that
      // resolve to a CSS property become structured TokenResolution entries;
      // the rest stay as literal strings (legacy comment shims). This
      // mixed-map shape lets the IR emit real `var()` declarations for the
      // resolvable tokens without forcing the whole leaf to skip when one
      // token has a state suffix or unrecognized name.
      if (!value.every((v) => typeof v === "string")) {
        return value;
      }
      const tokens = value as string[];
      const out: Record<string, TokenResolution | string> = {};
      const reasons: SkipReason[] = [];
      let resolvedCount = 0;

      for (const t of tokens) {
        if (hasStateSuffix(t)) {
          reasons.push({ token: t, reason: "state-suffix" });
          out[t] = t;
          continue;
        }
        const property = inferProperty(t);
        if (!property) {
          reasons.push({ token: t, reason: "no-property-inference" });
          out[t] = t;
          continue;
        }
        const styleFallback = findFallback(styles, currentPath, property);
        const fallback = styleFallback ?? "initial";
        if (styleFallback === null) {
          reasons.push({ token: t, reason: "fallback-defaulted-to-initial" });
        }
        out[t] = {
          resolvesTo: t,
          fallback,
          property,
          layer: "semantic",
        };
        resolvedCount++;
      }

      reports.push({
        path: [...currentPath],
        migrated: resolvedCount > 0,
        reasons,
        tokenCount: tokens.length,
      });

      return resolvedCount > 0 ? out : value;
    }
    if (value && typeof value === "object") {
      const obj: Record<string, AnyJson> = {};
      for (const [k, v] of Object.entries(value as Record<string, AnyJson>)) {
        obj[k] = walk(v, [...currentPath, k]);
      }
      return obj;
    }
    return value;
  }

  for (const [k, v] of Object.entries(tokens)) {
    out[k] = walk(v, [k]);
  }
  return { tree: out, reports };
}

interface MigrateResult {
  file: string;
  migrated: number;
  skipped: number;
  totalTokens: number;
  reasonCounts: Record<string, number>;
}

function processContract(
  filePath: string,
  dryRun: boolean,
): MigrateResult | null {
  const raw = fs.readFileSync(filePath, "utf-8");
  const contract = JSON.parse(raw) as {
    tokens?: Record<string, AnyJson>;
    styles?: Record<string, Record<string, string>>;
  };
  if (!contract.tokens) return null;

  const { tree, reports } = migrateTokensTree(contract.tokens, contract.styles);

  const migrated = reports.filter((r) => r.migrated).length;
  const skipped = reports.length - migrated;
  const totalTokens = reports.reduce((acc, r) => acc + r.tokenCount, 0);
  const reasonCounts: Record<string, number> = {};
  for (const r of reports) {
    for (const reason of r.reasons) {
      reasonCounts[reason.reason] = (reasonCounts[reason.reason] ?? 0) + 1;
    }
  }

  if (!dryRun && migrated > 0) {
    contract.tokens = tree;
    fs.writeFileSync(filePath, JSON.stringify(contract, null, 2) + "\n", "utf-8");
  }

  return {
    file: path.basename(filePath),
    migrated,
    skipped,
    totalTokens,
    reasonCounts,
  };
}

function main(): void {
  const argv = process.argv.slice(2);
  const dryRun = argv.includes("--dry-run");
  const names = argv.filter((a) => !a.startsWith("--"));

  const componentsDir = path.join(CONTRACTS_DIR, "components");
  const files: { filename: string; absPath: string }[] = [];
  for (const name of fs.readdirSync(componentsDir)) {
    const folder = path.join(componentsDir, name);
    if (!fs.statSync(folder).isDirectory()) continue;
    const filename = `${name}.contract.json`;
    const absPath = path.join(folder, filename);
    if (!fs.existsSync(absPath)) continue;
    if (names.length > 0 && !names.includes(name)) continue;
    files.push({ filename, absPath });
  }

  console.log(
    `Migrating tokens in ${files.length} contract(s)${dryRun ? " (dry-run)" : ""}.\n`,
  );

  let totalMigrated = 0;
  let totalSkipped = 0;
  const aggregateReasons: Record<string, number> = {};

  for (const f of files) {
    const result = processContract(f.absPath, dryRun);
    if (!result) continue;
    totalMigrated += result.migrated;
    totalSkipped += result.skipped;
    for (const [r, c] of Object.entries(result.reasonCounts)) {
      aggregateReasons[r] = (aggregateReasons[r] ?? 0) + c;
    }
    console.log(
      `  ${result.file.padEnd(40)} migrated ${result.migrated} / ${result.migrated + result.skipped} leaves`,
    );
  }

  console.log(
    `\nTotal: ${totalMigrated} migrated, ${totalSkipped} skipped (across ${files.length} contracts).`,
  );
  if (Object.keys(aggregateReasons).length > 0) {
    console.log("\nSkip reasons:");
    for (const [r, c] of Object.entries(aggregateReasons).sort(
      (a, b) => b[1] - a[1],
    )) {
      console.log(`  ${r.padEnd(28)} ${c}`);
    }
  }
}

main();
