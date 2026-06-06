#!/usr/bin/env node
/**
 * VARIANT-STYLE-REALIZATION-AUDIT-01 — variant/style realization audit.
 *
 * READ-ONLY. For every component, it cross-checks the variant AXES declared in
 * the contract (`variants`) against the CSS that actually realizes them, and
 * flags the "declared variant axis → no visual realization" defect class
 * (Spinner being the canary: 3 axes declared, the classes emitted, but no
 * consuming selector exists).
 *
 * Realization mechanism in this design system: the base `.<prefix>` rule
 * consumes CSS vars (e.g. `var(--fsds-button-color-background-default)`); a
 * variant class re-scopes those vars in `<Name>.tokens.css`
 * (`.button--primary { --fsds-button-color-background-default: …; }`) or sets
 * properties directly in `<Name>.css`. So a variant VALUE is REALIZED iff a
 * `.<prefix>--<value>` selector exists in EITHER generated CSS file.
 *
 * Default-awareness (false-positive control): the DEFAULT value of an axis is
 * realized by the base `.<prefix>` rule and needs no per-value selector. Only a
 * NON-DEFAULT value with no consuming selector is a genuine gap.
 *
 * Out of scope: pseudo-state styling (:hover/:focus/disabled/invalid/checked) —
 * that is the separate state/pseudo-styling rail. This audit covers `variants`.
 *
 * Usage: node scripts/variant-style-audit/audit.mjs
 * Output: docs/variant-style-audit/variant-style-matrix.{json,md}
 */
import { readFileSync, readdirSync, existsSync, statSync, mkdirSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = resolve(HERE, "../..");
const CONTRACTS = resolve(REPO, "packages/ds-contracts/components");
const REACT = resolve(REPO, "packages/ds-react/src/components");
const OUT_DIR = resolve(REPO, "docs/variant-style-audit");

const readJSON = (p) => (existsSync(p) ? JSON.parse(readFileSync(p, "utf8")) : null);
const readText = (p) => (existsSync(p) ? readFileSync(p, "utf8") : "");

export const ALL_COMPONENTS = () =>
  readdirSync(CONTRACTS)
    .filter((d) => statSync(resolve(CONTRACTS, d)).isDirectory())
    .filter((d) => existsSync(resolve(CONTRACTS, d, `${d}.contract.json`)))
    .sort();

const PROP_BUCKETS = ["designed", "constrained", "restricted", "styled", "hook"];

/** Default value for a variant axis = the keyed prop's declared default, if any. */
function variantDefault(contract, dim) {
  for (const b of PROP_BUCKETS) {
    for (const m of contract.props?.[b]?.members ?? []) {
      if (m?.name === dim && m.default !== undefined) return String(m.default);
    }
  }
  return null; // unknown — no value is treated as base-covered
}

/** cssPrefix = the first BEM root class in the generated tokens.css (authoritative). */
function cssPrefix(component) {
  const tokensCss = readText(resolve(REACT, component, `${component}.tokens.css`));
  const css = readText(resolve(REACT, component, `${component}.css`));
  const m = tokensCss.match(/\.([a-zA-Z][\w-]*)\s*\{/) || css.match(/\.([a-zA-Z][\w-]*)\s*\{/);
  return m ? m[1] : component.toLowerCase();
}

/** Does a `.<prefix>--<value>` selector exist (boundary-safe, so --sm ≠ --small)? */
function hasVariantSelector(cssText, prefix, value) {
  const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp(`\\.${esc(prefix)}--${esc(value)}(?![A-Za-z0-9_-])`);
  return re.test(cssText);
}

export function classify(component) {
  const contract = readJSON(resolve(CONTRACTS, component, `${component}.contract.json`)) ?? {};
  const variants = contract.variants ?? {};
  const prefix = cssPrefix(component);
  const css = readText(resolve(REACT, component, `${component}.css`));
  const tokensCss = readText(resolve(REACT, component, `${component}.tokens.css`));
  const both = css + "\n" + tokensCss;

  // Styling-intent inputs: component token-key path segments + styles.json
  // variant-selector names. An axis "should be CSS-realized" only when its
  // VALUES show styling intent — a per-value component token (e.g.
  // `spinner.thickness.hairline`) or a styles.json `--value` selector. Without
  // either, the axis is behavioral / DOM-structural (mode, type, orientation,
  // as, level, placement) and legitimately needs no `.prefix--value` rule, so
  // it is NOT a realization gap. This is the false-positive control.
  const tokensJson = readJSON(resolve(CONTRACTS, component, `${component}.tokens.json`)) ?? {};
  const tokenSegments = new Set();
  for (const key of Object.keys(tokensJson)) for (const seg of key.split(".")) tokenSegments.add(seg);
  const stylesJson = readJSON(resolve(CONTRACTS, component, `${component}.styles.json`)) ?? {};
  const styleVariantNames = new Set();
  for (const sel of Object.keys(stylesJson)) {
    const m = /^--(.+)$/.exec(sel);
    if (m) styleVariantNames.add(m[1]);
  }

  const dims = [];
  for (const [dim, values] of Object.entries(variants)) {
    if (!Array.isArray(values)) continue;
    const def = variantDefault(contract, dim);
    const stylingIntent = values.some((v) => tokenSegments.has(String(v)) || styleVariantNames.has(String(v)));
    const rows = values.map((value) => {
      const realized = hasVariantSelector(both, prefix, value);
      const isDefault = def !== null && String(value) === def;
      // a genuine gap: a non-default value with no consuming selector, on an
      // axis that has styling intent (token/styles per-value). The default is
      // realized by the base rule; no-styling-intent axes are behavioral.
      const gap = !realized && !isDefault && stylingIntent;
      return { value: String(value), class: `${prefix}--${value}`, realized, isDefault, gap };
    });
    const realizedCount = rows.filter((r) => r.realized).length;
    const gaps = rows.filter((r) => r.gap);
    dims.push({
      dim,
      default: def,
      stylingIntent,
      values: rows,
      realizedCount,
      total: rows.length,
      fullyUnrealized: realizedCount === 0,
      gaps: gaps.map((r) => r.value),
    });
  }
  return { component, prefix, dims };
}

// ---- run (only when executed directly; importable for the locked test) ----
const RUN_DIRECTLY = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (RUN_DIRECTLY) {
  const components = ALL_COMPONENTS().map(classify).filter((c) => c.dims.length > 0);

  const failing = []; // { component, dim, gaps, fullyUnrealized, default }
  for (const c of components) {
    for (const d of c.dims) {
      if (d.gaps.length > 0) failing.push({ component: c.component, dim: d.dim, gaps: d.gaps, fullyUnrealized: d.fullyUnrealized, default: d.default });
    }
  }

  const totalAxes = components.reduce((n, c) => n + c.dims.length, 0);
  const totalValues = components.reduce((n, c) => n + c.dims.reduce((m, d) => m + d.total, 0), 0);
  const gapValues = failing.reduce((n, f) => n + f.gaps.length, 0);
  const fullyDeadAxes = failing.filter((f) => f.fullyUnrealized);

  mkdirSync(OUT_DIR, { recursive: true });
  const json = {
    spec: "VARIANT-STYLE-REALIZATION-AUDIT-01",
    componentsWithVariants: components.length,
    totalAxes,
    totalValues,
    failing,
    fullyUnrealizedAxes: fullyDeadAxes,
    components,
  };
  writeFileSync(resolve(OUT_DIR, "variant-style-matrix.json"), JSON.stringify(json, null, 2) + "\n");

  const md = [];
  md.push("# Variant/style realization matrix");
  md.push("");
  md.push("`VARIANT-STYLE-REALIZATION-AUDIT-01` — read-only. A variant VALUE is realized iff a `.<prefix>--<value>` selector exists in `<Name>.css` or `<Name>.tokens.css` (var re-scoping or direct property). The DEFAULT value is realized by the base rule and needs no per-value selector; only NON-DEFAULT values without a consuming selector are genuine gaps.");
  md.push("");
  md.push(`Components with variants: **${components.length}** · variant axes: **${totalAxes}** · values: **${totalValues}** · unrealized non-default values: **${gapValues}** · fully-dead axes: **${fullyDeadAxes.length}**`);
  md.push("");
  md.push("## Failing — declared variant axis with no realization (fully-dead axes)");
  md.push("");
  if (fullyDeadAxes.length) {
    md.push("| component | axis | values (all unrealized) | default |");
    md.push("|---|---|---|---|");
    for (const f of fullyDeadAxes) md.push(`| ${f.component} | \`${f.dim}\` | ${f.gaps.join(", ")} | ${f.default ?? "—"} |`);
  } else md.push("_none_");
  md.push("");
  md.push("## Review — partially-realized axes (some non-default values lack a selector)");
  md.push("");
  const partial = failing.filter((f) => !f.fullyUnrealized);
  if (partial.length) {
    md.push("| component | axis | unrealized non-default values |");
    md.push("|---|---|---|");
    for (const f of partial) md.push(`| ${f.component} | \`${f.dim}\` | ${f.gaps.join(", ")} |`);
  } else md.push("_none_");
  md.push("");
  md.push("## Full matrix (per component)");
  md.push("");
  for (const c of components) {
    md.push(`### ${c.component}  \`.${c.prefix}\``);
    md.push("");
    md.push("| axis | default | values (✓ realized · ✗ gap · ·default) |");
    md.push("|---|---|---|");
    for (const d of c.dims) {
      const cells = d.values.map((v) => `${v.value}${v.realized ? "✓" : v.isDefault ? "·(default)" : "✗"}`).join(" ");
      md.push(`| \`${d.dim}\` | ${d.default ?? "—"} | ${cells} |`);
    }
    md.push("");
  }
  writeFileSync(resolve(OUT_DIR, "variant-style-matrix.md"), md.join("\n") + "\n");

  console.log(`\nVARIANT-STYLE-REALIZATION-AUDIT-01 — ${components.length} components with variants, ${totalAxes} axes, ${totalValues} values`);
  console.log(`\nFully-dead axes (declared, zero realization): ${fullyDeadAxes.length}`);
  for (const f of fullyDeadAxes) console.log(`  - ${f.component}.${f.dim}: ${f.gaps.join(", ")} (default ${f.default ?? "?"})`);
  console.log(`\nPartially-realized axes (non-default values without a selector): ${partial.length}`);
  for (const f of partial) console.log(`  - ${f.component}.${f.dim}: ${f.gaps.join(", ")}`);
  console.log(`\nReport: ${resolve(OUT_DIR, "variant-style-matrix.md")}`);
}
