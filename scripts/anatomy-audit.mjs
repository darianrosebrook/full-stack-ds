#!/usr/bin/env node
/**
 * Anatomy audit — dual-metric coverage report.
 *
 * Tracks two independent metrics per component:
 *
 *   contract-anatomy coverage: declared parts (from contract.anatomy)
 *     that have authored entries in <Component>.styles.json. Strict
 *     ceiling: a component is "fully styled" only when every declared
 *     non-infrastructural part has a selector authored for it.
 *
 *   rendered-DOM coverage: BEM classes actually emitted by the React
 *     TSX that have a matching authored selector. This is the
 *     "functionally styled" metric — a component can be fully covered
 *     here while failing the strict anatomy metric, because the
 *     generator doesn't render every declared part. That isn't a
 *     styling failure; it's a realization mismatch.
 *
 * Why two metrics: the convergence's "contract is source of truth"
 * doctrine puts the declared anatomy in the lead role, but `styles.json`
 * can only meaningfully target classes that the framework emitters
 * actually project. Round 3 surfaced this gap (Breadcrumbs declares
 * link/current/separator/overflow but the TSX renders only nav+ol).
 * Reporting both metrics keeps the recon honest.
 *
 * Usage:
 *   node scripts/anatomy-audit.mjs [--verbose]
 *
 *   Default output is one row per component plus a summary. --verbose
 *   adds the per-component list of (declared, rendered, authored) sets.
 */

import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, "..");
const COMPONENTS_DIR = join(REPO_ROOT, "packages", "ds-contracts", "components");
const REACT_DIR = join(REPO_ROOT, "packages", "ds-react", "src", "components");
const VUE_DIR = join(REPO_ROOT, "packages", "ds-vue", "src", "components");
const SVELTE_DIR = join(REPO_ROOT, "packages", "ds-svelte", "src", "components");
const ANGULAR_DIR = join(REPO_ROOT, "packages", "ds-angular", "src", "components");
const LIT_DIR = join(REPO_ROOT, "packages", "ds-lit", "src", "components");

const VERBOSE = process.argv.includes("--verbose");
const SELF_TEST = process.argv.includes("--self-test");

/**
 * AUDIT-TAG-REALIZATION-GENERALIZATION-01
 *
 * Tags that participate in the HTML table content model. Subcomponents
 * whose `anatomy.details.<part>.tag` is in this set MUST be realized
 * as the native element (no Stack wrapper, no custom-element substitute).
 *
 * This set is intentionally identical to TABLE_COMPOSITION_TAGS in
 * packages/ds-codegen/src/ir.ts. The codegen and the audit move
 * together: extending native-realization to lists/select/details
 * (CODEGEN-NATIVE-LEAF-EXTENSION-LIST-01) updates both sides.
 *
 * Why scoped: a contract declaring `tag: "li"` today gives an
 * expectation the codegen cannot yet honor. Auditing against tags
 * outside this set would produce false-positive failures for slices
 * that haven't shipped. The audit only claims realization gaps when
 * the codegen has the capability to realize them.
 */
const TABLE_COMPOSITION_TAGS = new Set([
  "table", "thead", "tbody", "tfoot", "tr", "th", "td", "caption",
]);

/**
 * Tags whose realized class targeting we know how to inspect with the
 * regex strategy. A subset of TABLE_COMPOSITION_TAGS until the audit
 * is extended; broader sets are no-ops on parts the audit can't yet
 * verify (returns tag-status: n/a). Currently identical, but kept as
 * a separate constant so a future "we know about li but the codegen
 * doesn't realize it yet" state is expressible.
 */
const AUDITABLE_NATIVE_TAGS = new Set([...TABLE_COMPOSITION_TAGS]);

const INFRASTRUCTURAL_PARTS = new Set(["root", "focus", "context", "provider"]);
const STATE_KEYS = new Set([
  "hover", "focus", "focus-visible", "focus-within", "active", "disabled",
  "checked", "expanded", "pressed", "selected",
]);

function listComponents() {
  return readdirSync(COMPONENTS_DIR).filter((entry) => {
    return statSync(join(COMPONENTS_DIR, entry)).isDirectory();
  }).sort();
}

function readJson(p) {
  try { return JSON.parse(readFileSync(p, "utf8")); } catch { return null; }
}

function getDeclaredParts(contract) {
  const a = contract?.anatomy;
  if (!a) return [];
  if (Array.isArray(a)) return a;
  return a.parts || [];
}

/**
 * Read the contract-declared native HTML tag for each part.
 *
 * Two sources, identical to the IR's derivation order:
 *   1. anatomy.details.<part>.tag (primary authority).
 *   2. anatomy.dom node tag for the same part (secondary).
 *
 * Returns a map of part-name -> tag. Parts without a declared tag
 * are absent from the map (downstream: tag-realization is n/a).
 */
function getExpectedTagsByPart(contract) {
  const out = {};
  const a = contract?.anatomy;
  if (!a || Array.isArray(a)) return out;

  // Primary: anatomy.details.<part>.tag
  if (a.details && typeof a.details === "object") {
    for (const [part, details] of Object.entries(a.details)) {
      if (details && typeof details === "object" && typeof details.tag === "string") {
        out[part] = details.tag;
      }
    }
  }

  // Secondary: walk anatomy.dom tree. If a part appears in the tree
  // with a tag, and we don't have details.tag for it, use the dom
  // tag. (Disagreement between the two is enforced by the IR builder
  // at generate time; the audit doesn't need to re-check it.)
  if (a.dom) {
    const stack = [a.dom];
    while (stack.length > 0) {
      const node = stack.pop();
      if (!node) continue;
      if (node.part && typeof node.tag === "string" && !(node.part in out)) {
        out[node.part] = node.tag;
      }
      if (Array.isArray(node.children)) {
        for (const c of node.children) stack.push(c);
      }
    }
  }

  return out;
}

function getCssPrefix(contract) {
  if (contract?.cssPrefix) return contract.cssPrefix;
  return (contract?.name || "")
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .toLowerCase();
}

/**
 * Extract BEM classes from the React TSX. Matches `<prefix>__<part>` and
 * `<prefix>--<value>` patterns inside quoted strings (className literals).
 * Not perfect — won't catch dynamically-composed class names — but covers
 * the 99% case where emitters write `"prefix__part"` literally.
 *
 * Part names in this codebase are camelCase, never hyphenated. The BEM
 * modifier separator `--` would otherwise let `tab--active` match as a
 * part with capture `tab` and then re-match as `tab--active` — that's
 * how `tab--active` ended up classified as a rendered part in Round 5A.
 * Refuse `-` in the captured suffix to keep parts and modifiers disjoint.
 */
function extractRenderedClasses(tsxPath, prefix) {
  if (!existsSync(tsxPath)) return { parts: new Set(), modifiers: new Set() };
  const source = readFileSync(tsxPath, "utf8");
  return matchRenderedClasses(source, prefix);
}

// ---------------------------------------------------------------------------
// AUDIT-TAG-REALIZATION-GENERALIZATION-01 — per-framework tag detection.
//
// Each detector takes (source, bemClass, expectedTag) and returns:
//   { match: "yes" | "no" | "absent", evidence: "matched-string" | null }
//
// "yes"     — the BEM class is realized on the expected native tag (or
//             on an attribute selector whose host is the expected tag).
// "no"      — the BEM class appears in the source but on a non-matching
//             tag (e.g. `<Stack as="header" className="table__header">`
//             when expectedTag is "th").
// "absent"  — the BEM class does not appear in the source at all. The
//             part is not realized in this framework. For Lit table-
//             composition parts this is the doctrinal "held" state;
//             for other frameworks it's a flat realization gap.
//
// Detectors are intentionally regex-based source inspection, matching
// the rest of the audit's strategy. They do NOT prove runtime DOM
// behavior — that's a Layer 2 concern owned by the per-framework
// test suites.
// ---------------------------------------------------------------------------

function detectReactTagRealization(source, bemClass, expectedTag) {
  // React patterns to recognize:
  //
  //   (a) Inline root-template binding (no classNames variable):
  //         <table className="table__container" aria-label={...}>
  //       This is how root-rendered parts (container, etc.) bind their
  //       BEM class via anatomy.dom emission.
  //
  //   (b) Subcomponent pattern with classNames variable:
  //         const classNames = ["table__row", className].filter(...).join(" ");
  //         return (<tr className={classNames} ...>{children}</tr>);
  //
  //   (c) Stack-wrapped (broken/legacy) — the falsehood we're catching:
  //         return (<Stack as="header" className={classNames}>...)
  //
  // Check (a) first — it's the simpler match and root-rendered parts
  // are common.

  // (a) Inline literal class on the expected tag.
  const inlineRe = new RegExp(
    `<${escapeRe(expectedTag)}\\b[^>]*className="[^"]*${escapeRe(bemClass)}[^"]*"`,
  );
  const inlineMatch = source.match(inlineRe);
  if (inlineMatch) {
    return { match: "yes", evidence: inlineMatch[0] };
  }
  // Inline literal class on a wrong tag — falsehood at root level.
  const inlineAnyTagRe = new RegExp(
    `<([a-zA-Z][a-zA-Z0-9-]*)\\b[^>]*className="[^"]*${escapeRe(bemClass)}[^"]*"`,
  );
  const inlineAnyMatch = source.match(inlineAnyTagRe);
  if (inlineAnyMatch && inlineAnyMatch[1] !== expectedTag) {
    return { match: "no", evidence: inlineAnyMatch[0] };
  }

  // (b)/(c) classNames variable pattern. Requires the BEM literal to
  // appear in a quoted-string context first (the classNames array).
  if (!source.includes(`"${bemClass}"`)) {
    return { match: "absent", evidence: null };
  }
  const literalRe = new RegExp(`["']${escapeRe(bemClass)}["']`, "g");
  let m;
  while ((m = literalRe.exec(source)) !== null) {
    const window = source.slice(m.index, m.index + 800);
    const nativeRe = new RegExp(
      `<${escapeRe(expectedTag)}\\b[^>]*className=\\{classNames\\}`,
    );
    const stackRe = /<Stack\b[^>]*className=\{classNames\}/;
    const nativeMatch = window.match(nativeRe);
    if (nativeMatch) {
      return { match: "yes", evidence: nativeMatch[0] };
    }
    const stackMatch = window.match(stackRe);
    if (stackMatch) {
      return { match: "no", evidence: stackMatch[0] };
    }
    const anyTagRe = /<([a-zA-Z][a-zA-Z0-9-]*)\b[^>]*className=\{classNames\}/;
    const anyMatch = window.match(anyTagRe);
    if (anyMatch && anyMatch[1] !== expectedTag) {
      return { match: "no", evidence: anyMatch[0] };
    }
  }
  // BEM literal present but no tag binding found — treat as absent
  // rather than guessing.
  return { match: "absent", evidence: null };
}

function detectVueTagRealization(source, bemClass, expectedTag) {
  // Vue patterns to recognize:
  //
  //   (a) Inline root-template binding:
  //         <table :class="'table__container'" :aria-label="...">
  //       Vue's emitter binds root-rendered parts with literal-string
  //       expressions inside :class.
  //
  //   (b) Subcomponent SFC:
  //         const classNames = computed(() => ["table__row", props.class]...);
  //         <template><tr :class="classNames" ...><slot /></tr></template>
  //
  //   (c) Stack-wrapped legacy:
  //         <template><Stack ... :class="classNames">...
  //
  // (a) Inline literal-string :class on the expected tag.
  const inlineRe = new RegExp(
    `<${escapeRe(expectedTag)}\\b[^>]*:class="'[^']*${escapeRe(bemClass)}[^']*'"`,
  );
  const inlineMatch = source.match(inlineRe);
  if (inlineMatch) return { match: "yes", evidence: inlineMatch[0] };
  const inlineAnyTagRe = new RegExp(
    `<([a-zA-Z][a-zA-Z0-9-]*)\\b[^>]*:class="'[^']*${escapeRe(bemClass)}[^']*'"`,
  );
  const inlineAnyMatch = source.match(inlineAnyTagRe);
  if (inlineAnyMatch && inlineAnyMatch[1] !== expectedTag) {
    return { match: "no", evidence: inlineAnyMatch[0] };
  }

  if (!source.includes(`"${bemClass}"`)) {
    return { match: "absent", evidence: null };
  }
  const nativeRe = new RegExp(
    `<${escapeRe(expectedTag)}\\b[^>]*:class="classNames"`,
  );
  const m = source.match(nativeRe);
  if (m) return { match: "yes", evidence: m[0] };
  if (/<Stack\b[^>]*:class="classNames"/.test(source)) {
    const sm = source.match(/<Stack\b[^>]*:class="classNames"/);
    return { match: "no", evidence: sm ? sm[0] : null };
  }
  const anyRe = /<([a-zA-Z][a-zA-Z0-9-]*)\b[^>]*:class="classNames"/;
  const am = source.match(anyRe);
  if (am && am[1] !== expectedTag) {
    return { match: "no", evidence: am[0] };
  }
  return { match: "absent", evidence: null };
}

function detectSvelteTagRealization(source, bemClass, expectedTag) {
  // Svelte patterns:
  //
  //   (a) Inline root binding:
  //         <table class={'table__container'} aria-label={...}>
  //
  //   (b) Subcomponent:
  //         const classes = $derived(["table__row", className]...);
  //         <tr class={classes} ...>{@render children?.()}</tr>
  //
  //   (c) Stack legacy: <Stack class={classes}>
  //
  // (a) Inline literal-string class on the expected tag.
  const inlineRe = new RegExp(
    `<${escapeRe(expectedTag)}\\b[^>]*class=\\{'[^']*${escapeRe(bemClass)}[^']*'\\}`,
  );
  const inlineMatch = source.match(inlineRe);
  if (inlineMatch) return { match: "yes", evidence: inlineMatch[0] };
  const inlineAnyTagRe = new RegExp(
    `<([a-zA-Z][a-zA-Z0-9-]*)\\b[^>]*class=\\{'[^']*${escapeRe(bemClass)}[^']*'\\}`,
  );
  const inlineAnyMatch = source.match(inlineAnyTagRe);
  if (inlineAnyMatch && inlineAnyMatch[1] !== expectedTag) {
    return { match: "no", evidence: inlineAnyMatch[0] };
  }

  if (!source.includes(`"${bemClass}"`)) {
    return { match: "absent", evidence: null };
  }
  const nativeRe = new RegExp(
    `<${escapeRe(expectedTag)}\\b[^>]*class=\\{classes\\}`,
  );
  const m = source.match(nativeRe);
  if (m) return { match: "yes", evidence: m[0] };
  if (/<Stack\b[^>]*class=\{classes\}/.test(source)) {
    const sm = source.match(/<Stack\b[^>]*class=\{classes\}/);
    return { match: "no", evidence: sm ? sm[0] : null };
  }
  const anyRe = /<([a-zA-Z][a-zA-Z0-9-]*)\b[^>]*class=\{classes\}/;
  const am = source.match(anyRe);
  if (am && am[1] !== expectedTag) {
    return { match: "no", evidence: am[0] };
  }
  return { match: "absent", evidence: null };
}

function detectAngularTagRealization(source, bemClass, expectedTag) {
  // Angular patterns:
  //
  //   (a) Inline root-template binding (root-rendered parts):
  //         <table [ngClass]="'table__container'" [attr.aria-label]="ariaLabel">
  //
  //   (b) Attribute-selector subcomponent (native realization):
  //         @Component({ selector: "tr[fsdsTableRow]", template: `<ng-content />`,
  //                      host: { "[class]": "classes()" } })
  //         classes(): string { return ["table__row", this.class].filter(...).join(" "); }
  //
  //   (c) Element-selector subcomponent (legacy/broken):
  //         @Component({ selector: "fsds-table-row", template: `<fsds-stack ...>` })

  // (a) Inline literal [ngClass]="'bem'" on the expected tag.
  const inlineRe = new RegExp(
    `<${escapeRe(expectedTag)}\\b[^>]*\\[ngClass\\]="'[^']*${escapeRe(bemClass)}[^']*'"`,
  );
  const inlineMatch = source.match(inlineRe);
  if (inlineMatch) return { match: "yes", evidence: inlineMatch[0] };
  const inlineAnyTagRe = new RegExp(
    `<([a-zA-Z][a-zA-Z0-9-]*)\\b[^>]*\\[ngClass\\]="'[^']*${escapeRe(bemClass)}[^']*'"`,
  );
  const inlineAnyMatch = source.match(inlineAnyTagRe);
  if (inlineAnyMatch && inlineAnyMatch[1] !== expectedTag) {
    return { match: "no", evidence: inlineAnyMatch[0] };
  }

  if (!source.includes(`"${bemClass}"`)) {
    return { match: "absent", evidence: null };
  }
  const attrSelectorRe = new RegExp(
    `selector:\\s*["']${escapeRe(expectedTag)}\\[[a-zA-Z][a-zA-Z0-9_]*\\]["']`,
  );
  // Bound each @Component block to its actual end. The source layout is
  //   @Component({...}) export class Foo { ... }
  // and the next @Component starts with another `@Component(`. Bound
  // each block to the start of the NEXT @Component (or end of file).
  // Without this bound, a 1200-char window would span into adjacent
  // components and produce false matches.
  const componentStartRe = /@Component\(\{/g;
  const starts = [];
  let sm;
  while ((sm = componentStartRe.exec(source)) !== null) {
    starts.push(sm.index);
  }
  starts.push(source.length);

  for (let i = 0; i < starts.length - 1; i++) {
    const componentBlock = source.slice(starts[i], starts[i + 1]);
    if (!componentBlock.includes(`"${bemClass}"`)) continue;
    const attrMatch = componentBlock.match(attrSelectorRe);
    if (attrMatch) {
      return { match: "yes", evidence: attrMatch[0] };
    }
    // Element selector for the wrong realization (legacy fsds-table-row).
    const elemSelectorRe = /selector:\s*["']fsds-[a-z][a-z0-9-]*["']/;
    const elemMatch = componentBlock.match(elemSelectorRe);
    if (elemMatch) {
      return { match: "no", evidence: elemMatch[0] };
    }
    // The component contains the BEM class but has neither a
    // matching attribute selector nor a forbidden element selector.
    // Look at what selector it DOES have to report wrong-tag
    // realization (e.g. attribute selector on a different native tag).
    const anyAttrRe = /selector:\s*["']([a-zA-Z][a-zA-Z0-9-]*)\[/;
    const anyAttrMatch = componentBlock.match(anyAttrRe);
    if (anyAttrMatch && anyAttrMatch[1] !== expectedTag) {
      return { match: "no", evidence: anyAttrMatch[0] };
    }
  }
  return { match: "absent", evidence: null };
}

function detectLitTagRealization(source, bemClass, expectedTag) {
  // Lit's table-leaf parts are intentionally NOT emitted as sub-element
  // custom elements (autonomous custom elements cannot be valid native
  // table children). The doctrinal status for these parts is "held"
  // -- the part has no Lit representation, by design.
  //
  // Detection: if the BEM class appears in the Lit source at all, that
  // is either (a) inside the root <fsds-table> shadow template (e.g.
  // `table__container`, which IS realized) or (b) a regression.
  //
  // We check whether the BEM class appears inside an `html\`...\``
  // template adjacent to the expected tag. If yes → realized.
  // If absent → held (for table-composition tags) or absent (for
  // others).
  if (!source.includes(`"${bemClass}"`) && !source.includes(`'${bemClass}'`)) {
    // BEM class doesn't appear anywhere. For table-composition parts,
    // this is the held state. The caller decides based on
    // TABLE_COMPOSITION_TAGS membership.
    return { match: "absent", evidence: null };
  }
  // Look for an html template that contains both the expected tag and
  // the BEM class within proximity. Lit's interpolation can render:
  //   html`<table class="table__container">...`
  //   html`<table class=${'table__container'}>...`
  const tagWithClassRe = new RegExp(
    `<${escapeRe(expectedTag)}\\b[^>]*class\\s*=\\s*(?:["']${escapeRe(bemClass)}["']|\\$\\{["']${escapeRe(bemClass)}["']\\})`,
  );
  const m = source.match(tagWithClassRe);
  if (m) return { match: "yes", evidence: m[0] };
  // BEM class present in source but not on the expected tag — wrong
  // realization. Could be on a different tag in the template.
  return { match: "no", evidence: null };
}

function escapeRe(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Roll up per-framework detection into a single tag-realization
 * verdict for a part. Inputs are detection records from each framework.
 *
 * Verdict precedence:
 *   - "no"   — any framework reports wrong-tag realization. The
 *              system is shipping a semantic falsehood somewhere.
 *   - "yes"  — at least one framework realizes the part correctly,
 *              and no framework reports "no". Frameworks reporting
 *              "absent" for table-composition tags are folded as
 *              "held" when they're Lit, else counted as gaps.
 *   - "held" — only Lit reports absent (table-composition parts are
 *              intentionally not emitted in Lit); other frameworks
 *              are either yes or absent.
 *   - "n/a"  — expectedTag is not declared by the contract.
 */
function rollupTagRealization(expectedTag, detections) {
  if (!expectedTag) return { verdict: "n/a", heldFrameworks: [] };

  const isTableComposition = TABLE_COMPOSITION_TAGS.has(expectedTag);
  const wrongFrameworks = [];
  const yesFrameworks = [];
  const heldFrameworks = [];
  const absentFrameworks = [];

  for (const [fw, det] of Object.entries(detections)) {
    if (det.match === "no") wrongFrameworks.push(fw);
    else if (det.match === "yes") yesFrameworks.push(fw);
    else if (det.match === "absent") {
      // Lit intentionally holds table-composition parts.
      if (fw === "lit" && isTableComposition) {
        heldFrameworks.push(fw);
      } else {
        absentFrameworks.push(fw);
      }
    }
  }

  if (wrongFrameworks.length > 0) {
    return { verdict: "no", wrongFrameworks, heldFrameworks };
  }
  // No "no" votes. If anyone realizes, the part is realized; held
  // frameworks are tracked separately. Absent (not held) frameworks
  // are realization gaps but not falsehoods.
  if (yesFrameworks.length > 0) {
    if (absentFrameworks.length > 0) {
      return {
        verdict: "partial",
        yesFrameworks,
        heldFrameworks,
        absentFrameworks,
      };
    }
    return { verdict: "yes", yesFrameworks, heldFrameworks };
  }
  // No yes, no wrong. If only held remain, it's held.
  if (heldFrameworks.length > 0 && absentFrameworks.length === 0) {
    return { verdict: "held", heldFrameworks };
  }
  // No yes, no wrong, no held — pure absent. Tag-realization isn't
  // happening anywhere.
  return { verdict: "absent", absentFrameworks };
}

function matchRenderedClasses(source, prefix) {
  // Escape regex metachars in the prefix
  const escaped = prefix.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  // Part: no hyphens — stops before the BEM modifier separator.
  const partRe = new RegExp(
    `['"\`]${escaped}__([a-zA-Z][a-zA-Z0-9_]*)(?![a-zA-Z0-9_-])`,
    "g",
  );
  // Modifier: hyphens allowed inside the value (e.g. focus-visible).
  const modRe = new RegExp(
    `['"\`]${escaped}--([a-zA-Z][a-zA-Z0-9_-]*)`,
    "g",
  );
  const parts = new Set();
  const modifiers = new Set();
  let m;
  while ((m = partRe.exec(source)) !== null) parts.add(m[1]);
  while ((m = modRe.exec(source)) !== null) modifiers.add(m[1]);
  return { parts, modifiers };
}

/**
 * Map a styles.json key to the anatomy part it targets, if any.
 * Returns null when the key doesn't correspond to a single anatomy part
 * (e.g. compound selectors, state shorthands, variant modifiers).
 */
function styleKeyToPart(key, declaredParts, prefix) {
  if (key === "root") return "root";
  if (STATE_KEYS.has(key)) return null;
  if (key.startsWith("--")) return null;
  if (key.startsWith(":") || key.startsWith("[")) return null;
  if (key.startsWith("__")) {
    const name = key.slice(2);
    return declaredParts.includes(name) ? name : null;
  }
  if (key.startsWith(".") || key.startsWith("#") || key.startsWith("*")) {
    // Compound selector — see if it mentions any anatomy part
    for (const part of declaredParts) {
      if (key.includes(`__${part}`)) return part;
    }
    return null;
  }
  // Compound with combinators?
  if (/[\s+~>]/.test(key) || (key.includes(":") && key.includes("__"))) {
    for (const part of declaredParts) {
      if (key.includes(`__${part}`)) return part;
    }
    return null;
  }
  // Bare anatomy part
  if (declaredParts.includes(key)) return key;
  return null;
}

function auditComponent(name) {
  const contractPath = join(COMPONENTS_DIR, name, `${name}.contract.json`);
  const stylesPath = join(COMPONENTS_DIR, name, `${name}.styles.json`);
  const tsxPath = join(REACT_DIR, name, `${name}.tsx`);

  const contract = readJson(contractPath);
  if (!contract) return null;
  const styles = readJson(stylesPath) || {};

  const declaredParts = getDeclaredParts(contract);
  const prefix = getCssPrefix(contract);
  const { parts: renderedParts, modifiers: renderedModifiers } = extractRenderedClasses(tsxPath, prefix);

  // AUDIT-TAG-REALIZATION-GENERALIZATION-01 — per-part tag realization.
  //
  // For every declared part with an expected native tag (from
  // anatomy.details.<part>.tag or anatomy.dom), check each framework
  // source for whether the BEM class is realized on that native tag.
  // Backward compat: parts without expectedTag get verdict "n/a"; the
  // existing class-only metric is unchanged.
  const expectedTags = getExpectedTagsByPart(contract);
  const tagRealization = computeTagRealization({
    componentName: name,
    prefix,
    declaredParts,
    expectedTags,
  });

  // Anatomy parts that should be styled (exclude infrastructural).
  const declaredStyleable = declaredParts.filter((p) => !INFRASTRUCTURAL_PARTS.has(p));

  // Which declared parts have a styles.json key that targets them.
  const authoredParts = new Set();
  for (const key of Object.keys(styles)) {
    const targeted = styleKeyToPart(key, declaredParts, prefix);
    if (targeted) authoredParts.add(targeted);
  }

  // Coverage metrics.
  const contractCovered = declaredStyleable.filter((p) => authoredParts.has(p)).length;
  const contractMissing = declaredStyleable.filter((p) => !authoredParts.has(p));
  const contractCoverage = declaredStyleable.length === 0
    ? 100
    : Math.round((contractCovered / declaredStyleable.length) * 100);

  const renderedStyleable = [...renderedParts]; // Excludes root (no __ class).
  const renderedCovered = renderedStyleable.filter((p) => authoredParts.has(p)).length;
  const renderedMissing = renderedStyleable.filter((p) => !authoredParts.has(p));
  const renderedCoverage = renderedStyleable.length === 0
    ? 100
    : Math.round((renderedCovered / renderedStyleable.length) * 100);

  // Realization mismatch: declared parts not rendered, or rendered parts not declared.
  const declaredNotRendered = declaredStyleable.filter((p) => !renderedParts.has(p));
  const renderedNotDeclared = renderedStyleable.filter((p) => !declaredParts.includes(p));

  return {
    name,
    declaredParts: declaredStyleable,
    renderedParts: renderedStyleable,
    authoredParts: [...authoredParts],
    contractCovered,
    contractMissing,
    contractCoverage,
    renderedCovered,
    renderedMissing,
    renderedCoverage,
    declaredNotRendered,
    renderedNotDeclared,
    selectorCount: Object.keys(styles).length,
    tagRealization,
  };
}

/**
 * Compute tag-realization per part for the component.
 *
 * For parts WITH expectedTag (anatomy.details.<part>.tag exists):
 *   • Read each framework source (React TSX, Vue SFC, Svelte SFC,
 *     Angular component .ts, Lit element .ts).
 *   • Run the framework-specific detector against the BEM class +
 *     expected tag.
 *   • Roll up into a single verdict: yes / no / partial / held / absent.
 *
 * For parts WITHOUT expectedTag: skipped. Verdict is "n/a"; appears
 * in the output only in verbose mode.
 *
 * Returns:
 *   {
 *     byPart: { partName: { expectedTag, verdict, frameworks, evidence } },
 *     summary: { yes, no, partial, held, absent, na }
 *   }
 */
function computeTagRealization({ componentName, prefix, declaredParts, expectedTags }) {
  // Pre-load framework sources once per component.
  const sources = loadFrameworkSources(componentName);

  const byPart = {};
  const summary = { yes: 0, no: 0, partial: 0, held: 0, absent: 0, na: 0 };

  for (const part of declaredParts) {
    const expectedTag = expectedTags[part];
    if (!expectedTag) {
      byPart[part] = { expectedTag: null, verdict: "n/a" };
      summary.na++;
      continue;
    }
    // Only audit tags the audit knows how to verify. Future native-
    // realization extensions will widen AUDITABLE_NATIVE_TAGS.
    if (!AUDITABLE_NATIVE_TAGS.has(expectedTag)) {
      byPart[part] = { expectedTag, verdict: "n/a" };
      summary.na++;
      continue;
    }

    const bemClass = `${prefix}__${part}`;

    // Root and container are root-owned by the codegen (not exported
    // as subcomponents). Tag-realization for these parts is verified
    // by inspecting the root component's emitted template instead of
    // a per-part subcomponent file. The detectors handle this
    // transparently — they search the same React TSX (root + inline
    // subcomponents), the same .vue (root), etc.
    const detections = {
      react: detectReactTagRealization(sources.react, bemClass, expectedTag),
      vue: detectVueTagRealization(
        selectVueSourceForPart(sources.vue, componentName, part),
        bemClass,
        expectedTag,
      ),
      svelte: detectSvelteTagRealization(
        selectSvelteSourceForPart(sources.svelte, componentName, part),
        bemClass,
        expectedTag,
      ),
      angular: detectAngularTagRealization(sources.angular, bemClass, expectedTag),
      lit: detectLitTagRealization(sources.lit, bemClass, expectedTag),
    };

    const rollup = rollupTagRealization(expectedTag, detections);
    byPart[part] = { expectedTag, ...rollup, detections };
    summary[rollup.verdict]++;
  }

  return { byPart, summary };
}

function loadFrameworkSources(componentName) {
  const result = {
    react: "",
    // Vue/Svelte emit per-part SFCs. The audit needs per-part scoping
    // to avoid cross-part false matches (e.g. a `<thead>` in
    // TableHead.svelte must not be counted as evidence that the
    // `body` part is realized as `<thead>`). The map is keyed by
    // PascalCase subcomponent name (matches `${component}${capitalize(part)}`).
    vue: { root: "", parts: {} },
    svelte: { root: "", parts: {} },
    angular: "",
    lit: "",
  };

  const reactPath = join(REACT_DIR, componentName, `${componentName}.tsx`);
  if (existsSync(reactPath)) result.react = readFileSync(reactPath, "utf8");

  const vueRoot = join(VUE_DIR, componentName, `${componentName}.vue`);
  if (existsSync(vueRoot)) result.vue.root = readFileSync(vueRoot, "utf8");
  const vueDir = join(VUE_DIR, componentName);
  if (existsSync(vueDir)) {
    const partFiles = readdirSync(vueDir).filter(
      (f) => f.endsWith(".vue") && f !== `${componentName}.vue`,
    );
    for (const f of partFiles) {
      const subName = f.replace(/\.vue$/, "");
      result.vue.parts[subName] = readFileSync(join(vueDir, f), "utf8");
    }
  }

  const svelteRoot = join(SVELTE_DIR, componentName, `${componentName}.svelte`);
  if (existsSync(svelteRoot)) result.svelte.root = readFileSync(svelteRoot, "utf8");
  const svelteDir = join(SVELTE_DIR, componentName);
  if (existsSync(svelteDir)) {
    const partFiles = readdirSync(svelteDir).filter(
      (f) => f.endsWith(".svelte") && f !== `${componentName}.svelte`,
    );
    for (const f of partFiles) {
      const subName = f.replace(/\.svelte$/, "");
      result.svelte.parts[subName] = readFileSync(join(svelteDir, f), "utf8");
    }
  }

  const angularPath = join(ANGULAR_DIR, componentName, `${componentName}.component.ts`);
  if (existsSync(angularPath)) result.angular = readFileSync(angularPath, "utf8");

  const litPath = join(LIT_DIR, componentName, `${componentName}.ts`);
  if (existsSync(litPath)) result.lit = readFileSync(litPath, "utf8");

  return result;
}

/**
 * Pick the relevant Vue/Svelte source for a part: the per-part SFC
 * if it exists, else the root SFC (for parts rendered inline in the
 * root, like `container`).
 *
 * Why isolating per-part: Vue and Svelte emit one file per
 * subcomponent. If we concatenated them all and ran a global regex,
 * a `<thead>` literal in TableHead.svelte would be falsely treated
 * as evidence that the `body` part is realized as `<thead>`. Scoping
 * detection to the specific part's file (or to the root when the
 * part is rendered inline) gives accurate per-framework verdicts.
 */
function selectVueSourceForPart(vue, componentName, partName) {
  const subName = `${componentName}${partName[0].toUpperCase()}${partName.slice(1)}`;
  if (vue.parts[subName]) return vue.parts[subName];
  return vue.root;
}

function selectSvelteSourceForPart(svelte, componentName, partName) {
  const subName = `${componentName}${partName[0].toUpperCase()}${partName.slice(1)}`;
  if (svelte.parts[subName]) return svelte.parts[subName];
  return svelte.root;
}

if (SELF_TEST) {
  runSelfTest();
  process.exit(0);
}

const rows = listComponents()
  .map(auditComponent)
  .filter(Boolean);

// Sort by combined coverage (worst first) to surface high-leverage work.
rows.sort((a, b) => {
  const aScore = (a.contractCoverage + a.renderedCoverage) / 2;
  const bScore = (b.contractCoverage + b.renderedCoverage) / 2;
  return aScore - bScore;
});

const COL = {
  name: 18,
  decl: 5,
  rend: 5,
  auth: 5,
  ctx: 7,
  rdr: 7,
  mismatch: 14,
  tag: 24,
};

function pad(s, n) {
  return (String(s) + " ".repeat(n)).slice(0, n);
}

/**
 * Compact tag-realization status for the table row.
 *
 *   "—"                  — no parts in this component declare a tag
 *                          (n/a everywhere; nothing to report).
 *   "ok"                 — all auditable parts are realized in all
 *                          frameworks. No held, no absent.
 *   "ok (1 held: lit)"   — realized in 4 frameworks; one is held
 *                          (typically Lit table internals).
 *   "BROKEN: <n>"        — at least one part has a wrong-tag
 *                          realization in at least one framework.
 *                          Highest-severity output.
 *   "partial: <n>"       — some frameworks realize, some are absent
 *                          (gap not held by design).
 */
function formatTagStatus(tagRealization) {
  const s = tagRealization?.summary;
  if (!s) return "—";
  const total = s.yes + s.no + s.partial + s.held + s.absent;
  if (total === 0) return "—";
  if (s.no > 0) return `BROKEN:${s.no}`;
  if (s.partial > 0) return `partial:${s.partial}`;
  // Distinguish "ok" from "ok with held parts" for honest reporting.
  if (s.held > 0 && s.absent === 0 && s.yes > 0) {
    return `ok (${s.held} held)`;
  }
  if (s.absent > 0 && s.yes === 0) return `absent:${s.absent}`;
  if (s.absent > 0) return `partial-absent:${s.absent}`;
  return "ok";
}

console.log(
  pad("component", COL.name),
  pad("decl", COL.decl),
  pad("rend", COL.rend),
  pad("auth", COL.auth),
  pad("c-cov%", COL.ctx),
  pad("r-cov%", COL.rdr),
  pad("d!=r", COL.mismatch),
  pad("tag-status", COL.tag),
);
console.log(
  pad("---------", COL.name),
  pad("----", COL.decl),
  pad("----", COL.rend),
  pad("----", COL.auth),
  pad("------", COL.ctx),
  pad("------", COL.rdr),
  pad("------------", COL.mismatch),
  pad("----------", COL.tag),
);

for (const r of rows) {
  const mismatch = r.declaredNotRendered.length > 0
    ? `dec>ren:${r.declaredNotRendered.length}`
    : (r.renderedNotDeclared.length > 0 ? `ren>dec:${r.renderedNotDeclared.length}` : "—");
  console.log(
    pad(r.name, COL.name),
    pad(r.declaredParts.length, COL.decl),
    pad(r.renderedParts.length, COL.rend),
    pad(r.authoredParts.length, COL.auth),
    pad(r.contractCoverage + "%", COL.ctx),
    pad(r.renderedCoverage + "%", COL.rdr),
    pad(mismatch, COL.mismatch),
    pad(formatTagStatus(r.tagRealization), COL.tag),
  );
}

const contractFull = rows.filter((r) => r.contractCoverage === 100).length;
const renderedFull = rows.filter((r) => r.renderedCoverage === 100).length;
const total = rows.length;
console.log(
  `\nContract-anatomy coverage: ${contractFull}/${total} fully styled.`,
);
console.log(
  `Rendered-DOM coverage:     ${renderedFull}/${total} fully styled.`,
);
console.log(
  `\nRealization mismatches: ${rows.filter((r) => r.declaredNotRendered.length > 0).length}` +
    ` components have declared parts not rendered;` +
    ` ${rows.filter((r) => r.renderedNotDeclared.length > 0).length} have rendered classes not declared.`,
);

if (VERBOSE) {
  console.log("\n=== Detail per component ===");
  for (const r of rows) {
    console.log(`\n${r.name}:`);
    console.log(`  declared (${r.declaredParts.length}): [${r.declaredParts.join(", ")}]`);
    console.log(`  rendered (${r.renderedParts.length}): [${r.renderedParts.join(", ")}]`);
    console.log(`  authored (${r.authoredParts.length}): [${r.authoredParts.join(", ")}]`);
    if (r.declaredNotRendered.length > 0) {
      console.log(`  declared-not-rendered (${r.declaredNotRendered.length}): [${r.declaredNotRendered.join(", ")}]`);
    }
    if (r.renderedNotDeclared.length > 0) {
      console.log(`  rendered-not-declared (${r.renderedNotDeclared.length}): [${r.renderedNotDeclared.join(", ")}]`);
    }
    // Tag realization detail. Only print when at least one part has
    // an expectedTag (avoids noise for the 46 components without
    // native-tag declarations).
    const tagParts = Object.entries(r.tagRealization?.byPart ?? {})
      .filter(([, info]) => info.expectedTag !== null && info.expectedTag !== undefined);
    if (tagParts.length > 0) {
      console.log(`  tag realization:`);
      for (const [part, info] of tagParts) {
        const tag = info.expectedTag;
        if (info.verdict === "n/a") {
          console.log(`    ${part} → ${tag}: n/a (tag not in auditable set)`);
          continue;
        }
        const evidence = formatTagEvidence(info);
        console.log(`    ${part} → ${tag}: ${info.verdict}${evidence ? "  " + evidence : ""}`);
      }
    }
  }
}

function formatTagEvidence(info) {
  if (!info.detections) return "";
  const fragments = [];
  for (const [fw, det] of Object.entries(info.detections)) {
    if (det.match === "yes") fragments.push(`${fw}=yes`);
    else if (det.match === "no") fragments.push(`${fw}=WRONG`);
    else if (det.match === "absent") {
      const held = info.heldFrameworks?.includes(fw);
      fragments.push(`${fw}=${held ? "held" : "absent"}`);
    }
  }
  return `(${fragments.join(", ")})`;
}

function runSelfTest() {
  // Realistic source fragments mirror how the audit reads React TSX:
  // BEM class literals appear inside quoted strings, often as ordered
  // siblings in a join() argument list. The audit tokenizes by quote
  // boundaries, so each literal is its own match site.
  const classCases = [
    {
      name: "element-modifier is dropped, sibling element survives",
      source: `"tabs__list", "tabs__tab", "tabs__tab--active"`,
      prefix: "tabs",
      expectParts: ["list", "tab"],
      // `--active` qualifies an element, not the block, so it is not
      // a block modifier and is intentionally not captured.
      expectModifiers: [],
    },
    {
      name: "block modifier on root is captured as a modifier",
      source: `"switch", "switch--md"`,
      prefix: "switch",
      expectParts: [],
      expectModifiers: ["md"],
    },
    {
      name: "camelCase part captures the whole name",
      source: `"command__inputWrapper"`,
      prefix: "command",
      expectParts: ["inputWrapper"],
      expectModifiers: [],
    },
    {
      name: "block modifier with internal hyphen survives",
      source: `"button", "button--focus-visible"`,
      prefix: "button",
      expectParts: [],
      expectModifiers: ["focus-visible"],
    },
  ];

  let failed = 0;
  for (const c of classCases) {
    const got = matchRenderedClasses(c.source, c.prefix);
    const parts = [...got.parts].sort();
    const mods = [...got.modifiers].sort();
    const expectParts = [...c.expectParts].sort();
    const expectMods = [...c.expectModifiers].sort();
    const ok =
      JSON.stringify(parts) === JSON.stringify(expectParts) &&
      JSON.stringify(mods) === JSON.stringify(expectMods);
    if (ok) {
      console.log(`ok   class-detect: ${c.name}`);
    } else {
      failed++;
      console.log(`FAIL class-detect: ${c.name}`);
      console.log(`     parts:     got ${JSON.stringify(parts)}  expected ${JSON.stringify(expectParts)}`);
      console.log(`     modifiers: got ${JSON.stringify(mods)}  expected ${JSON.stringify(expectMods)}`);
    }
  }

  // AUDIT-TAG-REALIZATION-GENERALIZATION-01 — tag-realization fixtures.
  //
  // These cases are the regression suite for the new audit dimension.
  // They model both the pre-fix Table (semantic lie) and the post-fix
  // Table (correct realization) for every framework. The "lie" cases
  // must report verdict "no"; the "correct" cases must report "yes".
  const tagCases = [
    {
      name: "React: pre-fix Table.TableBody wraps in Stack as 'div', expected tbody",
      detector: detectReactTagRealization,
      source: `
export function TableBody({ children, className }: TableBodyProps) {
  const classNames = ["table__body", className].filter(Boolean).join(" ");
  return (<Stack className={classNames}>{children}</Stack>);
}`,
      bemClass: "table__body",
      expectedTag: "tbody",
      expectMatch: "no",
    },
    {
      name: "React: post-fix Table.TableBody emits native <tbody> with classNames",
      detector: detectReactTagRealization,
      source: `
export function TableBody({ children, className }: TableBodyProps) {
  const classNames = ["table__body", className].filter(Boolean).join(" ");
  return (<tbody className={classNames}>{children}</tbody>);
}`,
      bemClass: "table__body",
      expectedTag: "tbody",
      expectMatch: "yes",
    },
    {
      name: "React: TableHeader pre-fix uses Stack as=\"header\" (wrong tag for column header)",
      detector: detectReactTagRealization,
      source: `
export function TableHeader({ children, className }: TableHeaderProps) {
  const classNames = ["table__header", className].filter(Boolean).join(" ");
  return (<Stack as="header" className={classNames}>{children}</Stack>);
}`,
      bemClass: "table__header",
      expectedTag: "th",
      expectMatch: "no",
    },
    {
      name: "Vue: pre-fix wraps in Stack",
      detector: detectVueTagRealization,
      source: `
<script setup>
const classNames = computed(() => ["table__body", props.class].filter(Boolean).join(" "));
</script>
<template><Stack :class="classNames"><slot /></Stack></template>`,
      bemClass: "table__body",
      expectedTag: "tbody",
      expectMatch: "no",
    },
    {
      name: "Vue: post-fix emits native <tbody>",
      detector: detectVueTagRealization,
      source: `
<script setup>
const classNames = computed(() => ["table__body", props.class].filter(Boolean).join(" "));
</script>
<template><tbody :class="classNames"><slot /></tbody></template>`,
      bemClass: "table__body",
      expectedTag: "tbody",
      expectMatch: "yes",
    },
    {
      name: "Svelte: post-fix emits native <tr>",
      detector: detectSvelteTagRealization,
      source: `
<script lang="ts">
const classes = $derived(["table__row", className].filter(Boolean).join(" "));
</script>
<tr class={classes}>{@render children?.()}</tr>`,
      bemClass: "table__row",
      expectedTag: "tr",
      expectMatch: "yes",
    },
    {
      name: "Svelte: pre-fix uses Stack",
      detector: detectSvelteTagRealization,
      source: `
<script lang="ts">
const classes = $derived(["table__row", className].filter(Boolean).join(" "));
</script>
<Stack class={classes}>{@render children?.()}</Stack>`,
      bemClass: "table__row",
      expectedTag: "tr",
      expectMatch: "no",
    },
    {
      name: "Angular: pre-fix uses element selector fsds-table-row (invalid table child)",
      detector: detectAngularTagRealization,
      source: `
@Component({
  selector: "fsds-table-row",
  template: \`<fsds-stack [ngClass]="classes()"><ng-content /></fsds-stack>\`,
})
export class TableRowComponent {
  classes(): string { return ["table__row", this.class].filter(Boolean).join(" "); }
}`,
      bemClass: "table__row",
      expectedTag: "tr",
      expectMatch: "no",
    },
    {
      name: "Angular: post-fix uses attribute selector tr[fsdsTableRow]",
      detector: detectAngularTagRealization,
      source: `
@Component({
  selector: "tr[fsdsTableRow]",
  template: \`<ng-content />\`,
  host: { "[class]": "classes()" },
})
export class TableRowComponent {
  classes(): string { return ["table__row", this.class].filter(Boolean).join(" "); }
}`,
      bemClass: "table__row",
      expectedTag: "tr",
      expectMatch: "yes",
    },
    {
      name: "Lit: held — table-leaf part not emitted (BEM class absent)",
      detector: detectLitTagRealization,
      source: `
export class TableElement extends LitElement {
  override render() { return html\`<div class="table"><table class="table__container"><slot></slot></table></div>\`; }
}
customElements.define('fsds-table', TableElement);`,
      bemClass: "table__row",
      expectedTag: "tr",
      expectMatch: "absent",
    },
    {
      name: "Lit: root container realized as <table class=\"table__container\">",
      detector: detectLitTagRealization,
      source: `
export class TableElement extends LitElement {
  override render() { return html\`<div class="table"><table class="table__container"><slot></slot></table></div>\`; }
}
customElements.define('fsds-table', TableElement);`,
      bemClass: "table__container",
      expectedTag: "table",
      expectMatch: "yes",
    },
    {
      name: "Lit: container realized via interpolated class binding",
      detector: detectLitTagRealization,
      source: `
override render() {
  return html\`<div class="table"><table class=\${'table__container'} aria-label=\${this.ariaLabel}><slot></slot></table></div>\`;
}`,
      bemClass: "table__container",
      expectedTag: "table",
      expectMatch: "yes",
    },
  ];

  for (const c of tagCases) {
    const got = c.detector(c.source, c.bemClass, c.expectedTag);
    if (got.match === c.expectMatch) {
      console.log(`ok   tag-detect: ${c.name}`);
    } else {
      failed++;
      console.log(`FAIL tag-detect: ${c.name}`);
      console.log(`     expected match=${c.expectMatch}, got match=${got.match}`);
      if (got.evidence) console.log(`     evidence: ${got.evidence}`);
    }
  }

  // Rollup self-tests: prove the verdict precedence is correct.
  const rollupCases = [
    {
      name: "rollup: all yes → yes",
      detections: {
        react: { match: "yes" }, vue: { match: "yes" },
        svelte: { match: "yes" }, angular: { match: "yes" },
        lit: { match: "yes" },
      },
      expectedTag: "tr",
      expectedVerdict: "yes",
    },
    {
      name: "rollup: 4 yes + lit absent on table tag → yes (with held)",
      detections: {
        react: { match: "yes" }, vue: { match: "yes" },
        svelte: { match: "yes" }, angular: { match: "yes" },
        lit: { match: "absent" },
      },
      expectedTag: "tr",
      expectedVerdict: "yes",
      expectHeld: ["lit"],
    },
    {
      name: "rollup: any wrong-tag → no (the falsehood case)",
      detections: {
        react: { match: "no" }, vue: { match: "yes" },
        svelte: { match: "yes" }, angular: { match: "yes" },
        lit: { match: "absent" },
      },
      expectedTag: "tr",
      expectedVerdict: "no",
    },
    {
      name: "rollup: only lit absent on non-table tag → partial-absent (not held)",
      detections: {
        react: { match: "yes" }, vue: { match: "yes" },
        svelte: { match: "yes" }, angular: { match: "yes" },
        lit: { match: "absent" },
      },
      expectedTag: "li", // not in TABLE_COMPOSITION_TAGS
      expectedVerdict: "partial",
    },
    {
      name: "rollup: undefined expectedTag → n/a",
      detections: {},
      expectedTag: undefined,
      expectedVerdict: "n/a",
    },
  ];
  for (const c of rollupCases) {
    const got = rollupTagRealization(c.expectedTag, c.detections);
    const verdictOk = got.verdict === c.expectedVerdict;
    let heldOk = true;
    if (c.expectHeld) {
      heldOk = JSON.stringify((got.heldFrameworks || []).sort()) ===
        JSON.stringify(c.expectHeld.sort());
    }
    if (verdictOk && heldOk) {
      console.log(`ok   rollup: ${c.name}`);
    } else {
      failed++;
      console.log(`FAIL rollup: ${c.name}`);
      console.log(`     got: ${JSON.stringify(got)}`);
    }
  }

  if (failed > 0) {
    console.log(`\n${failed} self-test case(s) failed.`);
    process.exit(1);
  }
  const total = classCases.length + tagCases.length + rollupCases.length;
  console.log(`\nAll ${total} self-test cases passed.`);
}
