#!/usr/bin/env node
/**
 * RENDER-PROP-BINDING-BLAST-RADIUS-01 — render-obligation blast-radius audit.
 *
 * READ-ONLY. Derives, for every declared prop of every component, the render
 * obligation IMPLIED BY THE CONTRACT'S OWN DECLARED STRUCTURE (anatomy.dom
 * bindings/events/content, channels, variants, propType, form) plus a
 * host-capability map, then reports whether the obligation is satisfied —
 * per framework. It classifies; it does NOT fix and writes nothing outside
 * docs/render-binding-audit/.
 *
 * Obligation buckets (the realization kind a prop demands):
 *   native-attr  bind directly to a host element attribute (type, name, src, value-ish)
 *   aria-attr    produce an accessibility attribute, often DERIVED (invalid -> aria-invalid)
 *   class-state  drive a class / data-state selector (variants, boolean states)
 *   content      render visible text / node content (label, description, children)
 *   behavior     wire event/channel logic, NOT a DOM attribute (value, onChange, open)
 *   no-render    legitimate surface with no direct DOM projection (hook/controller)
 *
 * Status per framework:
 *   bound | derived | consumed | missing | not-applicable
 *
 * Usage: node scripts/render-binding-audit/audit.mjs
 * Output: docs/render-binding-audit/render-binding-matrix.{json,md}
 */
import { readFileSync, readdirSync, existsSync, statSync, mkdirSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = resolve(HERE, "../..");
const CONTRACTS = resolve(REPO, "packages/ds-contracts/components");
const OUT_DIR = resolve(REPO, "docs/render-binding-audit");
const HOST_CAPS = JSON.parse(readFileSync(resolve(HERE, "fixtures/host-capabilities.json"), "utf8"));

export const FRAMEWORKS = [
  { id: "react", root: "packages/ds-react/src/components", ext: ".tsx" },
  { id: "vue", root: "packages/ds-vue/src/components", ext: ".vue" },
  { id: "svelte", root: "packages/ds-svelte/src/components", ext: ".svelte" },
  { id: "angular", root: "packages/ds-angular/src/components", ext: ".component.ts" },
  { id: "lit", root: "packages/ds-lit/src/components", ext: ".ts" },
];

const readJSON = (p) => (existsSync(p) ? JSON.parse(readFileSync(p, "utf8")) : null);

export const ALL_COMPONENTS = () =>
  readdirSync(CONTRACTS)
    .filter((d) => statSync(resolve(CONTRACTS, d)).isDirectory())
    .filter((d) => existsSync(resolve(CONTRACTS, d, `${d}.contract.json`)))
    .sort();

const PROP_BUCKETS = ["designed", "constrained", "restricted", "styled", "hook"];

// A binding expression is "prop:NAME" / "channel:NAME.value" / "literal:...".
const propRef = (expr) => {
  const m = typeof expr === "string" && expr.match(/^prop:([A-Za-z_$][\w$-]*)$/);
  return m ? m[1] : null;
};
/** Recursively collect, per prop name, every realization reference declared in anatomy.dom. */
function collectAnatomyRefs(node, refs, tags) {
  if (!node || typeof node !== "object") return;
  if (node.tag) tags.add(node.tag);
  const add = (prop, role, key) => {
    if (!prop) return;
    (refs[prop] ||= []).push({ role, key: key ?? null, tag: node.tag ?? null });
  };
  for (const [attr, expr] of Object.entries(node.bindings ?? {})) {
    const p = propRef(expr);
    if (p) add(p, attr.toLowerCase().startsWith("aria-") ? "aria" : "attr", attr);
  }
  for (const expr of Object.values(node.events ?? {})) add(propRef(expr), "event");
  if (node.content) add(propRef(node.content), "content");
  for (const expr of Object.values(node.cssVariableBindings ?? {})) add(propRef(expr), "cssvar");
  if (node.iteration?.source) add(propRef(node.iteration.source), "iteration");
  for (const child of node.children ?? []) collectAnatomyRefs(child, refs, tags);
}

function gatherProps(contract) {
  const props = {};
  for (const b of PROP_BUCKETS) {
    for (const m of contract.props?.[b]?.members ?? []) {
      if (m?.name) props[m.name] = { name: m.name, propType: m.propType ?? null, bucket: b };
    }
  }
  return props;
}

export function classify(component) {
  const contract = readJSON(resolve(CONTRACTS, component, `${component}.contract.json`)) ?? {};
  const props = gatherProps(contract);

  const refs = {};
  const tags = new Set();
  collectAnatomyRefs(contract.anatomy?.dom, refs, tags);
  const hostTag = contract.anatomy?.dom?.tag ?? null;

  // channel prop names -> behavior
  const channelProps = new Set();
  for (const ch of Object.values(contract.channels ?? {})) {
    for (const role of ["value", "defaultValue", "onChange"]) if (ch?.[role]) channelProps.add(ch[role]);
  }
  // variant keys -> class-state
  const variantProps = new Set(Object.keys(contract.variants ?? {}));
  // declared form native-attr obligations
  const formNativeProps = new Set(
    [contract.form?.name?.prop, contract.form?.required?.prop].filter(Boolean),
  );
  // passthrough forwarded host attrs (forwarded via {...rest}-style spread)
  const passthrough = contract.props?.passthrough ?? null;
  const passthroughAttrs = new Set((passthrough?.attributes ?? []).map((a) => a.toLowerCase()));
  const passthroughHost = passthrough?.extends ?? null;

  // Element-specific native attrs ONLY. Global attrs (title, id, role, lang, ...)
  // are deliberately EXCLUDED from native-attr inference: a prop named "title"
  // is far more often visible content (a heading) than the HTML title tooltip
  // attribute, and "id"/"role" are ambiguous. Inferring native-attr from a
  // global attr name is the overcorrection that mis-flags content props. Only
  // unambiguous element-specific attrs (placeholder/name/required/type/src/...)
  // drive the expected-native-attr rule. HOST_CAPS._global stays as reference
  // data but is not consulted here.
  const hostNativeAttrs = new Set(HOST_CAPS[hostTag] ?? []);

  const rows = [];
  for (const name of Object.keys(props).sort()) {
    const pt = props[name].propType?.kind ?? "?";
    const pr = refs[name] ?? [];
    const has = (role) => pr.some((r) => r.role === role);
    const attrKey = pr.find((r) => r.role === "attr")?.key ?? null;
    const ariaKey = pr.find((r) => r.role === "aria")?.key ?? null;

    let bucket;
    let obligation; // realized-or-expected status at the CONTRACT level
    let target = "-";

    if (channelProps.has(name) || pt === "callback" || has("event")) {
      bucket = "behavior";
      obligation = "consumed";
    } else if (pt === "node" || has("content") || has("iteration")) {
      bucket = "content";
      obligation = has("content") || has("iteration") ? "bound" : "consumed";
      target = "content";
    } else if (has("aria")) {
      bucket = "aria-attr";
      obligation = "derived";
      target = ariaKey;
    } else if (has("attr")) {
      bucket = "native-attr";
      obligation = "bound";
      target = `${hostTag}[${attrKey}]`;
    } else if (has("cssvar")) {
      bucket = "css-var";
      obligation = "bound";
      target = "style --var";
    } else if (variantProps.has(name)) {
      bucket = "class-state";
      obligation = "consumed";
      target = "class";
    } else {
      // unrealized designed prop: decide expected obligation from host capability / form
      const lname = name.toLowerCase();
      if (formNativeProps.has(name) || hostNativeAttrs.has(lname)) {
        bucket = "native-attr";
        obligation = "missing"; // expected to bind to host, but NOT in anatomy.dom.bindings
        target = `${hostTag}[${name}]`;
        // a non-designed passthrough attr would be forwarded; designed props are
        // destructured OUT of the spread, so being designed + native => still missing.
        if (passthroughAttrs.has(lname) && props[name].bucket !== "designed") obligation = "bound-passthrough";
      } else if (passthroughHost && (hostNativeAttrs.has(lname) || passthroughAttrs.has(lname))) {
        bucket = "native-attr";
        obligation = props[name].bucket === "designed" ? "missing" : "bound-passthrough";
        target = `${hostTag}[${name}]`;
      } else {
        bucket = "no-render";
        obligation = "not-applicable";
      }
    }

    rows.push({ component, prop: name, propBucket: props[name].bucket, propType: pt, bucket, obligation, target });
  }
  return { component, hostTag, tags: [...tags], rows };
}

// ---- per-framework verification (corroborates the contract-level status) ----
function frameworkFiles(fw, component) {
  const dir = resolve(REPO, fw.root, component);
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => f.endsWith(fw.ext) && !/\.(test|spec)\./.test(f))
    .map((f) => resolve(dir, f));
}
function attrBindRegex(fwId, key) {
  const k = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  switch (fwId) {
    case "react":
    case "svelte":
      return new RegExp(`\\b${k}=[{"]`);
    case "vue":
      return new RegExp(`:${k}=|\\s${k}=`);
    case "lit":
      return new RegExp(`[?.]?${k}=\\$\\{|\\s${k}=`);
    case "angular":
      return new RegExp(`\\[${k}\\]=|\\[attr\\.${k}\\]=`);
    default:
      return new RegExp(`\\b${k}=`);
  }
}
/** Is attribute `key` bound in any of the component's generated files for fw? */
export function isBoundInFramework(fw, component, key) {
  const re = attrBindRegex(fw.id, key);
  for (const file of frameworkFiles(fw, component)) {
    const src = readFileSync(file, "utf8");
    if (re.test(src)) return true;
  }
  return false;
}

// ---- run (only when executed directly; the module is importable for the
//      locked test and the future Playwright rail) ----
const RUN_DIRECTLY = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (RUN_DIRECTLY) {
const components = ALL_COMPONENTS();
const all = components.map(classify);

// Verify native-attr / aria-attr rows against the generated artifacts.
for (const c of all) {
  for (const row of c.rows) {
    if (row.bucket !== "native-attr" && row.bucket !== "aria-attr") {
      row.perFramework = null;
      continue;
    }
    const key = row.bucket === "aria-attr" ? row.target : row.prop;
    const pf = {};
    for (const fw of FRAMEWORKS) pf[fw.id] = isBoundInFramework(fw, c.component, key) ? "bound" : "absent";
    row.perFramework = pf;
  }
}

// ---- classify failing rows ----
const flat = all.flatMap((c) => c.rows);
const missingNative = flat.filter((r) => r.bucket === "native-attr" && r.obligation === "missing");
const missingAria = flat.filter((r) => r.bucket === "aria-attr" && r.perFramework && Object.values(r.perFramework).every((v) => v === "absent"));
// confirmation: a missing native row should be absent across all five frameworks
const confirmedMissing = missingNative.filter((r) => r.perFramework && Object.values(r.perFramework).every((v) => v === "absent"));
const unconfirmedMissing = missingNative.filter((r) => !r.perFramework || !Object.values(r.perFramework).every((v) => v === "absent"));

const bucketCounts = {};
for (const r of flat) bucketCounts[r.bucket] = (bucketCounts[r.bucket] ?? 0) + 1;

// ---- emit JSON ----
mkdirSync(OUT_DIR, { recursive: true });
const json = {
  spec: "RENDER-PROP-BINDING-BLAST-RADIUS-01",
  generatedFromCommit: process.env.AUDIT_COMMIT ?? null,
  componentCount: components.length,
  frameworks: FRAMEWORKS.map((f) => f.id),
  bucketCounts,
  failingClasses: {
    missingNativeAttr: confirmedMissing.map((r) => ({ component: r.component, prop: r.prop, target: r.target })),
    unconfirmedMissingNativeAttr: unconfirmedMissing.map((r) => ({ component: r.component, prop: r.prop, perFramework: r.perFramework })),
    missingAriaAttr: missingAria.map((r) => ({ component: r.component, prop: r.prop, target: r.target })),
  },
  components: all,
};
writeFileSync(resolve(OUT_DIR, "render-binding-matrix.json"), JSON.stringify(json, null, 2) + "\n");

// ---- emit Markdown ----
const md = [];
md.push("# Render prop->DOM binding obligation matrix");
md.push("");
md.push("`RENDER-PROP-BINDING-BLAST-RADIUS-01` — read-only. Each declared prop's render obligation is derived from the contract's own declared structure (anatomy.dom bindings/events/content, channels, variants, propType, form) plus a host-capability map; per-framework status is verified against the generated artifacts. No fixes are made here.");
md.push("");
md.push(`Components: **${components.length}** · Frameworks: ${FRAMEWORKS.map((f) => f.id).join(", ")} · Total declared prop rows: **${flat.length}**`);
md.push("");
md.push("## Obligation bucket distribution");
md.push("");
md.push("| bucket | count |");
md.push("|---|---|");
for (const [b, n] of Object.entries(bucketCounts).sort((a, b2) => b2[1] - a[1])) md.push(`| ${b} | ${n} |`);
md.push("");
md.push("## Failing class A — native-attr declared but NOT bound (confirmed absent in all 5 frameworks)");
md.push("");
if (confirmedMissing.length) {
  md.push("| component | prop | expected host binding |");
  md.push("|---|---|---|");
  for (const r of confirmedMissing) md.push(`| ${r.component} | \`${r.prop}\` | ${r.target} |`);
} else md.push("_none_");
md.push("");
if (unconfirmedMissing.length) {
  md.push("## Review — native-attr expected, contract-missing but found bound somewhere (passthrough/manual)");
  md.push("");
  md.push("| component | prop | per-framework |");
  md.push("|---|---|---|");
  for (const r of unconfirmedMissing) md.push(`| ${r.component} | \`${r.prop}\` | ${JSON.stringify(r.perFramework)} |`);
  md.push("");
}
md.push("## Failing class B — aria-attr expected but absent in all 5 frameworks");
md.push("");
if (missingAria.length) {
  md.push("| component | prop | expected aria |");
  md.push("|---|---|---|");
  for (const r of missingAria) md.push(`| ${r.component} | \`${r.prop}\` | ${r.target} |`);
} else md.push("_none_");
md.push("");
md.push("## Full matrix (per component)");
md.push("");
for (const c of all) {
  md.push(`### ${c.component}  <${c.hostTag ?? "?"}>`);
  md.push("");
  md.push("| prop | propBucket | type | obligation bucket | status | target | react | vue | svelte | angular | lit |");
  md.push("|---|---|---|---|---|---|---|---|---|---|---|");
  for (const r of c.rows) {
    const pf = r.perFramework ?? {};
    const cell = (k) => pf[k] ?? "-";
    md.push(
      `| \`${r.prop}\` | ${r.propBucket} | ${r.propType} | ${r.bucket} | ${r.obligation} | ${r.target} | ${cell("react")} | ${cell("vue")} | ${cell("svelte")} | ${cell("angular")} | ${cell("lit")} |`,
    );
  }
  md.push("");
}
writeFileSync(resolve(OUT_DIR, "render-binding-matrix.md"), md.join("\n") + "\n");

// ---- console summary ----
console.log(`\nRENDER-PROP-BINDING-BLAST-RADIUS-01 — ${components.length} components, ${flat.length} prop rows`);
console.log(`bucket distribution: ${JSON.stringify(bucketCounts)}`);
console.log(`\nFailing class A (native-attr declared but NOT bound, confirmed absent in all 5 frameworks): ${confirmedMissing.length}`);
for (const r of confirmedMissing) console.log(`  - ${r.component}.${r.prop} -> ${r.target}`);
if (unconfirmedMissing.length) {
  console.log(`\nReview (contract-missing but found bound somewhere): ${unconfirmedMissing.length}`);
  for (const r of unconfirmedMissing) console.log(`  - ${r.component}.${r.prop} ${JSON.stringify(r.perFramework)}`);
}
console.log(`\nFailing class B (aria-attr expected but absent in all 5): ${missingAria.length}`);
for (const r of missingAria) console.log(`  - ${r.component}.${r.prop} -> ${r.target}`);
console.log(`\nReport: ${resolve(OUT_DIR, "render-binding-matrix.md")}`);
} // end RUN_DIRECTLY
