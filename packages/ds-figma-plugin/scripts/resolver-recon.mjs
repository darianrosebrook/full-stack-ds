// Risk-burning recon: pure CSS-chain -> token-graph resolver table for the 6
// live fixtures. Proves resolution lands on the token graph (not the var()
// fallback) and classifies transparent / unresolved chains as residuals.
// This is the prototype of live-token-resolve.ts.
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const repo = resolve(here, "..", "..", "..");
const resolved = JSON.parse(
  readFileSync(resolve(repo, "packages/ds-tokens/generated/resolved.tokens.json"), "utf8"),
);

// Flatten resolved.tokens.json -> { "semantic.color.....": {light,dark} | "value" }
const flat = {};
(function walk(node, path) {
  if (node && typeof node === "object") {
    if ("$value" in node) {
      flat[path] = node.$value;
      return;
    }
    for (const [k, v] of Object.entries(node)) walk(v, path ? `${path}.${k}` : k);
  }
})(resolved, "");

// --fsds-semantic-color-action-background-secondary-default -> semantic.color.action.background.secondary.default
function varToPath(varName) {
  const stripped = varName.replace(/^--fsds-/, "");
  return stripped.replace(/-/g, ".");
}

const VAR_RE = /var\(\s*(--[\w-]+)\s*(?:,\s*([^)]*))?\)/;

function resolveChain(rawValue, props, chain = [], seen = new Set()) {
  if (rawValue == null) return { residual: "unresolved-binding", chain };
  const v = rawValue.trim();
  if (v === "transparent") return { residual: "transparent", chain };
  const m = v.match(VAR_RE);
  if (!m) return { residual: "literal", literal: v, chain }; // a baked literal is NOT token-graph authority
  const varName = m[1];
  chain = [...chain, varName];
  if (/^--fsds-(semantic|core)-/.test(varName)) {
    const path = varToPath(varName);
    const val = flat[path];
    return val !== undefined
      ? { tokenPath: path, value: val, chain }
      : { residual: "unresolved-token", path, chain };
  }
  if (seen.has(varName)) return { residual: "cycle", chain };
  seen.add(varName);
  return resolveChain(props[varName], props, chain, seen);
}

const COLOR_PROPS = ["background-color", "color", "border-color"];
const FIXTURES = ["Button", "Checkbox", "Switch", "Dialog", "Sheet", "Tabs"];

// Classify a selector into a STYLE CARRIER target:
//   root            -> bind to the existing component/variant shell
//   part:<name>     -> a known descriptor anatomy part -> create/find a carrier
//   residual:<why>  -> unknown part / unmappable -> NEVER invent anatomy
function classifyCarrier(selector, prefix, anatomyParts) {
  const seg = selector.trim().split(/\s+/).pop(); // deepest compound segment
  const dot = `.${prefix}`;
  if (!seg.startsWith(dot)) return { carrier: "residual", why: "no-prefix" };
  const after = seg.slice(dot.length); // "", ":disabled", "--secondary", "__indicator", "__tab--active"
  if (!after.startsWith("__")) return { carrier: "root" }; // root + pseudo/variant
  const part = after.slice(2).split(/--|:/)[0]; // "indicator", "tab"
  if (anatomyParts.includes(part)) return { carrier: `part:${part}` };
  return { carrier: "residual", why: `unknown-part:${part}` };
}

const tally = { root: 0, part: 0, residual: 0 };
for (const name of FIXTURES) {
  const desc = JSON.parse(
    readFileSync(
      resolve(repo, `packages/ds-figma-plugin/src/generated/components/${name}/${name}.figma.json`),
      "utf8",
    ),
  );
  const blocks = desc.css?.blocks ?? [];
  const prefix = desc.component.cssPrefix;
  const anatomyParts = (desc.anatomy ?? []).map((a) => a.name);
  const base = blocks.find((b) => b.selector === `.${prefix}`);
  const baseProps = {};
  for (const [k, val] of Object.entries(base?.declarations ?? {})) {
    if (k.startsWith("--")) baseProps[k] = val;
  }
  console.log(`\n=== ${name} (.${prefix})  anatomy: [${anatomyParts.join(", ")}] ===`);
  for (const block of blocks) {
    const merged = { ...baseProps };
    const bindings = {};
    for (const [k, val] of Object.entries(block.declarations ?? {})) {
      if (k.startsWith("--")) merged[k] = val;
      else if (COLOR_PROPS.includes(k)) bindings[k] = val;
    }
    const cls = classifyCarrier(block.selector, prefix, anatomyParts);
    const carrier = cls.carrier === "residual" ? `RESIDUAL(${cls.why})` : cls.carrier;
    if (cls.carrier === "root") tally.root++;
    else if (cls.carrier.startsWith("part:")) tally.part++;
    else tally.residual++;
    for (const [prop, raw] of Object.entries(bindings)) {
      const r = resolveChain(raw, merged);
      const val = r.tokenPath
        ? `${r.tokenPath} = ${JSON.stringify(r.value)}`
        : `RESIDUAL[${r.residual}${r.literal ? ":" + r.literal : ""}]`;
      console.log(`  [${carrier}]  ${block.selector}  ${prop}  ->  ${val}`);
    }
  }
}
console.log(`\nCARRIER TALLY: root=${tally.root} part=${tally.part} residual=${tally.residual}`);
