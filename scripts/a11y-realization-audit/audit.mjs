#!/usr/bin/env node
/**
 * RAIL-A11Y-REALIZATION-01 — accessibility-realization audit rail.
 *
 * READ-ONLY over source. Derives, for every component, the ACCESSIBILITY
 * obligations IMPLIED BY THE LIVE CONTRACT CORPUS (never a committed frozen
 * classification), then verifies each is REALIZED in the committed generated
 * output of every rail-admitted family. It classifies and reports; it fixes
 * nothing and writes only under docs/internal/a11y-realization-audit/
 * (gitignored machine-local state). The only committed input it consumes
 * besides source is the known-gaps ledger beside this script.
 *
 * Why this rail exists: a contract can declare an ARIA relationship
 * (label.for -> control.id), a keyboard surface (arrow-key navigation), or a
 * focus strategy (roving/trap) that NO emitter realizes — and every existing
 * gate stays green. Schema checks the declaration's shape; typecheck and the
 * governed rail check the bytes; per-component axe tests cannot see keyboard
 * at all and miss relationship gaps that only manifest in composed usage.
 * Field's label association was declared (with a described context mechanism)
 * and realized NOWHERE — this rail makes that class of fiction fail loud.
 *
 * -- Obligation classes (each derived from a contract FACT, falsifiable) -----
 *
 *   RELATIONSHIP — every `relationships[]` entry demands its `attribute`
 *                  (for, aria-labelledby, aria-describedby, aria-controls,
 *                  aria-expanded, aria-sort, aria-activedescendant,
 *                  aria-hidden, aria-label) be present in the component's
 *                  generated sources, per family, through that family's
 *                  accessibility surface (web DOM attrs; react-native
 *                  accessibility props). A family with no surface for an
 *                  attribute is an EXPLICIT documented exclusion in the
 *                  report — never a silent skip.
 *
 *   KEYBOARD     — every `a11y.keyboard` entry demands a realization:
 *                  NATIVE   (the interactive part is a native element whose
 *                            platform behavior provides the declared keys —
 *                            Enter/Space on button/summary, Space on
 *                            checkbox input, text entry on input),
 *                  PRIMITIVE (an imported behavior primitive owns the keys —
 *                            focus trap: Tab/Shift+Tab; dismissal/anchor
 *                            toggle: Escape), or
 *                  EXPLICIT  (a keydown handler in the emitted source).
 *                  Arrow/Home/End/PageUp/PageDown composite navigation is
 *                  NEVER native — it requires PRIMITIVE or EXPLICIT.
 *
 *   FOCUS        — `focus.strategy: "trap"` demands the focus-trap primitive;
 *                  `focus.strategy: "roving"` demands explicit key handling
 *                  (roving cannot be native).
 *
 * Families are iterated from the compiled AdmissionDescriptor registry — the
 * SINGLE SOURCE for rail-admitted targets (react, vue, svelte, lit, angular,
 * react-native today; figma is not a FrameworkId and is excluded by
 * construction). This script never hardcodes a web-only family list; a new
 * admitted target joins this rail automatically and its gaps must be either
 * realized or ledgered. Build codegen first
 * (`pnpm exec turbo run build --filter=@full-stack-ds/codegen`).
 *
 * -- Ledger semantics (two-directional failure) ------------------------------
 * known-gaps.json enumerates the PRE-EXISTING unrealized obligations, each
 * naming the campaign spec that owns its burn-down. The rail FAILS when an
 * unrealized obligation is absent from the ledger (new gap — fix it or ledger
 * it in review) AND when a ledger entry no longer reproduces (stale debt —
 * delete the entry). The ledger can only shrink truthfully; it cannot rot.
 *
 * NON-CLAIMS: this is a STATIC SOURCE-LEVEL check. A present aria attribute
 * does not prove the id it references resolves at runtime; a keydown handler
 * does not prove correct focus order; native realization does not prove AT
 * announces well. Runtime truth stays with the Playwright rails and axe
 * checks. This rail is drift-protection for the accessibility surface the
 * contracts promise — the "declared but realized nowhere" class.
 *
 * Usage:  node scripts/a11y-realization-audit/audit.mjs
 * Output: docs/internal/a11y-realization-audit/a11y-matrix.{json,md}
 * Exit:   nonzero on unledgered gap OR stale ledger entry.
 */
import {
  readFileSync,
  readdirSync,
  existsSync,
  statSync,
  mkdirSync,
  writeFileSync,
} from "node:fs";
import { resolve, join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = resolve(HERE, "../..");
const CONTRACTS = resolve(REPO, "packages/ds-contracts/components");
const OUT_DIR = resolve(REPO, "docs/internal/a11y-realization-audit");
const LEDGER_PATH = resolve(HERE, "known-gaps.json");
const DIST = resolve(REPO, "packages/ds-codegen/dist");

// ---- family registry (single source of truth: AdmissionDescriptor) ---------
let descriptors;
try {
  const mod = await import(resolve(DIST, "validation/admission-descriptor.js"));
  descriptors = Object.values(mod.ADMISSION_DESCRIPTORS).sort(
    (a, b) => a.reportRank - b.reportRank,
  );
} catch (err) {
  console.error(
    "FATAL: could not import compiled admission-descriptor registry from",
    DIST,
    "\nBuild codegen first: pnpm exec turbo run build --filter=@full-stack-ds/codegen",
  );
  console.error(String(err));
  process.exit(2);
}

/** Family kind: how this family expresses accessibility. Derived, not authored
 * per component: react-native is the one non-DOM family in the registry. */
function familyKind(id) {
  return id === "react-native" ? "native-mobile" : "web-dom";
}

// ---- per-family realization surfaces ---------------------------------------
/**
 * RELATIONSHIP attribute -> any-of source tokens, per family kind.
 * web-dom: the literal attribute substring matches every web framework's
 * spelling (react JSX attr, vue :attr, svelte attr, lit attr=${}, angular
 * [attr.x]) — except `for`, which react spells htmlFor and angular binds as
 * attr.for; the any-of list covers each spelling.
 * native-mobile: the react-native accessibility-prop mapping where one
 * exists; `null` means the family has NO surface for this attribute and the
 * obligation is family-excluded (reported with reason, not counted).
 */
const RELATIONSHIP_SURFACE = {
  "web-dom": {
    for: ["htmlFor", 'for="', "for=${", ":for", "attr.for", "for={"],
    // default: the attribute name itself (see relationshipTokens()).
  },
  "native-mobile": {
    "aria-label": ["accessibilityLabel", "aria-label"],
    "aria-labelledby": ["accessibilityLabelledBy", "aria-labelledby"],
    "aria-hidden": [
      "accessibilityElementsHidden",
      "importantForAccessibility",
      "aria-hidden",
    ],
    "aria-expanded": ["accessibilityState", "aria-expanded"],
    for: null,
    "aria-describedby": null,
    "aria-controls": null,
    "aria-sort": null,
    "aria-activedescendant": null,
  },
};

const NATIVE_MOBILE_EXCLUSION_REASONS = {
  for: "no react-native idref label-for surface (labelling is accessibilityLabel/LabelledBy)",
  "aria-describedby":
    "no react-native idref describedby surface (accessibilityHint is prose, not an idref)",
  "aria-controls": "no react-native controls-idref surface",
  "aria-sort": "no react-native sort-state surface",
  "aria-activedescendant": "no react-native activedescendant surface",
};

/** Keyboard/focus are DOM concepts; the native-mobile family realizes
 * activation/focus through the host platform (screen reader / dpad), so those
 * obligation classes are family-excluded there with this reason. */
const NATIVE_MOBILE_KEYBOARD_REASON =
  "DOM keyboard/focus semantics do not apply to react-native; activation and focus are host-platform concerns";

/** Explicit keydown handling across the web frameworks' event spellings. */
const EXPLICIT_KEY_RE =
  /onKeyDown|onkeydown|@keydown|on:keydown|\(keydown\)|addEventListener\(["']keydown/;

/** Behavior-primitive imports that own specific keys. The primitive set is
 * mirrored across frameworks under different names (useX / createX / XController). */
const TRAP_RE = /useFocusTrap|createFocusTrap|FocusTrapController|focus-trap/;
const DISMISS_RE =
  /useDismissal|createDismissal|DismissalController|useAnchorToggle|createAnchorToggle|AnchorToggleController|useAnchoredSurface|createAnchoredSurface|AnchoredSurfaceController/;

/** Keys the platform provides on native interactive elements. */
const NATIVE_KEYS = new Set(["Enter", "Space", "Tab"]);
/** Native text-entry keys an <input> provides (per-character entry, caret). */
const NATIVE_TEXT_KEYS = new Set(["0-9", "Backspace"]);
const NATIVE_INTERACTIVE_TAGS = new Set([
  "button",
  "input",
  "select",
  "textarea",
  "a",
  "summary",
  "details",
]);

// ---- contract corpus --------------------------------------------------------
function loadContracts() {
  const out = [];
  for (const name of readdirSync(CONTRACTS).sort()) {
    const p = join(CONTRACTS, name, `${name}.contract.json`);
    if (!existsSync(p)) continue;
    out.push({ name, contract: JSON.parse(readFileSync(p, "utf-8")) });
  }
  return out;
}

/** All tags appearing in the contract's anatomy dom tree. */
function domTags(node, acc = new Set()) {
  if (!node || typeof node !== "object") return acc;
  if (typeof node.tag === "string") acc.add(node.tag);
  for (const child of node.children ?? []) domTags(child, acc);
  return acc;
}

/** All componentRef targets ("fsds.Button" -> "Button") in the dom tree. */
function domComponentRefs(node, acc = new Set()) {
  if (!node || typeof node !== "object") return acc;
  if (typeof node.componentRef === "string") {
    acc.add(node.componentRef.replace(/^fsds\./, ""));
  }
  for (const child of node.children ?? []) domComponentRefs(child, acc);
  return acc;
}

/**
 * The full set of element tags a component's contract implies: its own dom
 * tree, its anatomy.details part tags, and — resolved against the corpus —
 * the root tags of components it owns by-reference (Chip's dismiss/action are
 * fsds.Button, so `button` is implied). Derived, never hand-listed.
 */
function impliedTags(contract, contractByName) {
  const tags = domTags(contract.anatomy?.dom);
  for (const detail of Object.values(contract.anatomy?.details ?? {})) {
    if (typeof detail?.tag === "string") tags.add(detail.tag);
  }
  for (const ref of domComponentRefs(contract.anatomy?.dom)) {
    const target = contractByName.get(ref);
    const rootTag = target?.anatomy?.dom?.tag;
    if (typeof rootTag === "string") tags.add(rootTag);
  }
  return tags;
}

/** Native interactive element present in the EMITTED source — the strongest
 * evidence a family realized keyboard natively (covers surface compounds
 * whose trigger element exists only in the emitter's lowering, not the
 * contract dom tree). */
const NATIVE_ELEMENT_IN_SOURCE_RE = /<(button|input|select|textarea|summary|a)\b/;

// ---- obligation derivation --------------------------------------------------
/** Split a declared key spec ("Enter|Space", "Shift+Tab") into atomic keys. */
export function atomicKeys(keySpec) {
  return String(keySpec)
    .split("|")
    .map((k) => k.trim())
    .map((k) => (k === "Shift+Tab" ? "Tab" : k));
}

export function deriveObligations(contracts) {
  const obligations = [];
  for (const { name, contract } of contracts) {
    for (const rel of contract.relationships ?? []) {
      if (!rel.attribute) continue;
      obligations.push({
        component: name,
        class: "relationship",
        key: rel.attribute,
      });
    }
    const kb = contract.a11y?.keyboard ?? [];
    for (const entry of kb) {
      const keySpec =
        typeof entry === "string" ? entry : (entry.key ?? entry.keys ?? "");
      if (!keySpec) continue;
      obligations.push({ component: name, class: "keyboard", key: keySpec });
    }
    const strategy = contract.focus?.strategy;
    if (strategy === "trap" || strategy === "roving") {
      obligations.push({ component: name, class: "focus", key: strategy });
    }
  }
  // Dedupe (a contract may declare the same attribute in several relationships).
  const seen = new Set();
  return obligations.filter((o) => {
    const id = `${o.component} ${o.class} ${o.key}`;
    if (seen.has(id)) return false;
    seen.add(id);
    return true;
  });
}

// ---- realization checking ---------------------------------------------------
function readComponentSource(treeAbs, component, sourceExtensions) {
  const dir = join(treeAbs, component);
  if (!existsSync(dir) || !statSync(dir).isDirectory()) return null;
  let src = "";
  const walk = (d) => {
    for (const entry of readdirSync(d).sort()) {
      const p = join(d, entry);
      const st = statSync(p);
      if (st.isDirectory()) {
        if (entry === "__tests__") continue;
        walk(p);
        continue;
      }
      if (/\.test\.[a-z]+$/.test(entry)) continue;
      if (!sourceExtensions.some((ext) => entry.endsWith(ext))) continue;
      src += readFileSync(p, "utf-8");
    }
  };
  walk(dir);
  return src;
}

export function relationshipTokens(kind, attribute) {
  const table = RELATIONSHIP_SURFACE[kind];
  if (attribute in table) return table[attribute]; // may be null (excluded)
  return kind === "web-dom" ? [attribute] : null;
}

/** Classify one obligation against one family's committed source.
 * Returns { verdict: "realized"|"unrealized"|"excluded", via?, reason? }. */
export function classify(obligation, kind, src, contractTags) {
  if (kind === "native-mobile" && obligation.class !== "relationship") {
    return { verdict: "excluded", reason: NATIVE_MOBILE_KEYBOARD_REASON };
  }
  if (obligation.class === "relationship") {
    const tokens = relationshipTokens(kind, obligation.key);
    if (tokens === null) {
      return {
        verdict: "excluded",
        reason:
          NATIVE_MOBILE_EXCLUSION_REASONS[obligation.key] ??
          `no ${kind} surface for ${obligation.key}`,
      };
    }
    return tokens.some((t) => src.includes(t))
      ? { verdict: "realized", via: "attribute" }
      : { verdict: "unrealized" };
  }
  if (obligation.class === "keyboard") {
    if (EXPLICIT_KEY_RE.test(src)) return { verdict: "realized", via: "explicit" };
    const keys = atomicKeys(obligation.key);
    const trapKeys = keys.every((k) => k === "Tab");
    const dismissKeys = keys.every((k) => k === "Escape");
    if (trapKeys && TRAP_RE.test(src)) return { verdict: "realized", via: "primitive" };
    if (dismissKeys && DISMISS_RE.test(src)) return { verdict: "realized", via: "primitive" };
    if ((trapKeys || dismissKeys) && (TRAP_RE.test(src) || DISMISS_RE.test(src)))
      return { verdict: "realized", via: "primitive" };
    const hasNativeTag =
      [...contractTags].some((t) => NATIVE_INTERACTIVE_TAGS.has(t)) ||
      NATIVE_ELEMENT_IN_SOURCE_RE.test(src);
    const nativeKeys = keys.every(
      (k) =>
        NATIVE_KEYS.has(k) ||
        (contractTags.has("input") && NATIVE_TEXT_KEYS.has(k)),
    );
    if (hasNativeTag && nativeKeys) return { verdict: "realized", via: "native" };
    return { verdict: "unrealized" };
  }
  // focus
  if (obligation.key === "trap") {
    return TRAP_RE.test(src)
      ? { verdict: "realized", via: "primitive" }
      : { verdict: "unrealized" };
  }
  // roving cannot be native — demands explicit key handling.
  return EXPLICIT_KEY_RE.test(src)
    ? { verdict: "realized", via: "explicit" }
    : { verdict: "unrealized" };
}

// ---- main -------------------------------------------------------------------
function gapId(row) {
  return `${row.component} ${row.family} ${row.class} ${row.key}`;
}

export function runAudit({ repoRoot = REPO } = {}) {
  const contracts = loadContracts();
  const obligations = deriveObligations(contracts);
  const contractByName = new Map(contracts.map(({ name, contract }) => [name, contract]));
  const tagsByComponent = new Map(
    contracts.map(({ name, contract }) => [name, impliedTags(contract, contractByName)]),
  );

  const rows = [];
  for (const d of descriptors) {
    const kind = familyKind(d.id);
    const treeAbs = resolve(repoRoot, d.outputTreeRelPath);
    for (const ob of obligations) {
      const src = readComponentSource(treeAbs, ob.component, d.sourceExtensions);
      if (src === null) {
        // Component not emitted for this family (e.g. not yet admitted there):
        // nothing to check — record for visibility, not as a gap.
        rows.push({ ...ob, family: d.id, verdict: "not-emitted" });
        continue;
      }
      const res = classify(ob, kind, src, tagsByComponent.get(ob.component) ?? new Set());
      rows.push({ ...ob, family: d.id, ...res });
    }
  }
  return { obligations, rows };
}

function loadLedger() {
  if (!existsSync(LEDGER_PATH)) return [];
  const parsed = JSON.parse(readFileSync(LEDGER_PATH, "utf-8"));
  if (!Array.isArray(parsed.gaps)) {
    throw new Error("known-gaps.json must be { gaps: [...] }");
  }
  for (const g of parsed.gaps) {
    for (const field of ["component", "family", "class", "key", "spec"]) {
      if (typeof g[field] !== "string" || g[field].length === 0) {
        throw new Error(
          `known-gaps.json entry missing required "${field}": ${JSON.stringify(g)}`,
        );
      }
    }
  }
  return parsed.gaps;
}

function markdownReport(rows, unledgered, stale) {
  const lines = [
    "# A11y-realization matrix",
    "",
    "Derived from the live contract corpus; verified against committed generated output per admitted family.",
    "Machine-local report — regenerate with `pnpm run audit:a11y-realization`.",
    "",
    `| component | family | class | key | verdict | via/reason |`,
    `|---|---|---|---|---|---|`,
  ];
  for (const r of rows) {
    if (r.verdict === "realized" || r.verdict === "not-emitted") continue;
    lines.push(
      `| ${r.component} | ${r.family} | ${r.class} | ${r.key} | ${r.verdict} | ${r.via ?? r.reason ?? ""} |`,
    );
  }
  lines.push("", `Unledgered gaps: ${unledgered.length}`, `Stale ledger entries: ${stale.length}`);
  return lines.join("\n") + "\n";
}

const isMain =
  process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const { obligations, rows } = runAudit();
  const unrealized = rows.filter((r) => r.verdict === "unrealized");
  const excluded = rows.filter((r) => r.verdict === "excluded");
  const realized = rows.filter((r) => r.verdict === "realized");

  const ledger = loadLedger();
  const ledgerIds = new Set(ledger.map(gapId));
  const unrealizedIds = new Set(unrealized.map(gapId));
  const unledgered = unrealized.filter((r) => !ledgerIds.has(gapId(r)));
  const stale = ledger.filter((g) => !unrealizedIds.has(gapId(g)));

  mkdirSync(OUT_DIR, { recursive: true });
  writeFileSync(
    join(OUT_DIR, "a11y-matrix.json"),
    JSON.stringify({ obligations, rows, unledgered, stale }, null, 2),
  );
  writeFileSync(join(OUT_DIR, "a11y-matrix.md"), markdownReport(rows, unledgered, stale));

  console.log(
    `[a11y-rail] obligations=${obligations.length} checks=${rows.length} realized=${realized.length} unrealized=${unrealized.length} (ledgered=${unrealized.length - unledgered.length}) excluded=${excluded.length}`,
  );
  if (unledgered.length > 0) {
    console.error(`\n[a11y-rail] FAIL — ${unledgered.length} UNLEDGERED gap(s):`);
    for (const r of unledgered) {
      console.error(`  ${r.component} [${r.family}] ${r.class}:${r.key}`);
    }
    console.error(
      "\nFix the realization, or (in review) add a ledger entry naming the owning spec.",
    );
  }
  if (stale.length > 0) {
    console.error(`\n[a11y-rail] FAIL — ${stale.length} STALE ledger entr(ies) (now realized — delete them):`);
    for (const g of stale) {
      console.error(`  ${g.component} [${g.family}] ${g.class}:${g.key} (spec ${g.spec})`);
    }
  }
  if (unledgered.length > 0 || stale.length > 0) process.exit(1);
  console.log("[a11y-rail] PASS — all unrealized obligations are ledgered; no stale entries.");
}
