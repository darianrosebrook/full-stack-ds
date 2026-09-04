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
 *   RELATIONSHIP — every `relationships[]` entry demands its `attribute` on
 *                  the emitted `from` part. IDREF attributes additionally
 *                  demand an id on the emitted `to` part and a matching
 *                  target-id token in the source attribute. Merely finding
 *                  `aria-labelledby` elsewhere in the file is not evidence.
 *                  A family with no surface for an attribute is an EXPLICIT
 *                  documented exclusion in the report — never a silent skip.
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
 * NON-CLAIMS: this is a STATIC SOURCE-LEVEL check. Matching emitted source
 * ownership does not prove the contract chose the semantically correct part,
 * runtime branch, or accessible name; a keydown handler does not prove correct
 * focus order; native realization does not prove AT announces well. Runtime
 * truth stays with the Playwright rails and axe checks. This rail is
 * drift-protection for the accessibility surface the contracts promise — the
 * "declared but not emitted on its declared carrier" class.
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
import { resolve, join, dirname, basename } from "node:path";
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

const IDREF_ATTRIBUTES = new Set([
  "for",
  "aria-labelledby",
  "aria-describedby",
  "aria-controls",
  "aria-activedescendant",
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
      const target = findPartNode(contract.anatomy?.dom, rel.to);
      obligations.push({
        component: name,
        class: "relationship",
        key: rel.attribute,
        from: rel.from,
        to: rel.to,
        cssPrefix: contract.cssPrefix ?? toKebab(name),
        targetId: target?.attrs?.id,
        ...(isConsumerSlotPart(target) ? { targetSlotted: true } : {}),
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
    const id = tupleId(o.component, o.class, o.key, o.from, o.to);
    if (seen.has(id)) return false;
    seen.add(id);
    return true;
  });
}

function findPartNode(node, part) {
  if (!node || typeof node !== "object") return undefined;
  if (node.part === part) return node;
  for (const child of node.children ?? []) {
    const found = findPartNode(child, part);
    if (found) return found;
  }
  return undefined;
}

function isConsumerSlotPart(node) {
  return Boolean(
    node &&
      (node.tag === "slot" ||
        (node.children?.length === 1 && node.children[0]?.tag === "slot")),
  );
}

function toKebab(value) {
  return String(value)
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/[_\s]+/g, "-")
    .toLowerCase();
}

function tupleId(...values) {
  return JSON.stringify(values.map((value) => value ?? ""));
}

// ---- realization checking ---------------------------------------------------
/**
 * Relative import specifiers in `src` that resolve INTO this package's
 * `src/primitives/` tree. A component may realize a relationship attribute in
 * a shared primitive it imports (Svelte's anchored-surface primitives set
 * aria-controls/aria-expanded/aria-describedby in
 * primitives/surfaces/createAnchoredSurface, not inline in the component) —
 * those must be scanned too, or the rail false-negatives on a genuinely
 * realized wire. Only imports the component ACTUALLY declares are followed,
 * so the falsification property holds: drop the import (or the primitive's
 * wiring) and the attribute token disappears from the scanned set.
 */
function resolvePrimitiveImports(src, fromDir, packageSrc) {
  const primitivesRoot = join(packageSrc, "primitives");
  const files = new Set();
  const re = /(?:from|import)\s+["']([^"']+)["']/g;
  let m;
  while ((m = re.exec(src)) !== null) {
    const spec = m[1];
    if (!spec.startsWith(".")) continue; // only relative, same-package imports
    const resolvedNoExt = resolve(fromDir, spec).replace(/\.js$/, "");
    if (!resolvedNoExt.startsWith(primitivesRoot + "/")) continue;
    // Do NOT follow barrel re-exports (primitives/index, surfaces/index …):
    // a barrel pulls the WHOLE primitive surface into scope, so an unrelated
    // primitive's token would count as realization for any component that
    // imports the barrel — eroding falsification (Field imports the barrel for
    // provideFieldAssociation; its aria-describedby is delivered cross-COMPONENT
    // to a slotted control, a genuinely different gap the per-component rail
    // cannot see, and must NOT be spuriously realized via the barrel). Only a
    // DIRECT import of a specific primitive module is followed.
    if (/(^|\/)index$/.test(resolvedNoExt)) continue;
    // Generated imports use runtime `.js`/`.svelte.js`; map back to source.
    for (const cand of [
      `${resolvedNoExt}.ts`,
      `${resolvedNoExt}.svelte.ts`,
      resolvedNoExt, // already had an extension (e.g. a bare .svelte)
    ]) {
      if (existsSync(cand) && statSync(cand).isFile()) {
        files.add(cand);
        break;
      }
    }
  }
  return files;
}

function readComponentSource(treeAbs, component, sourceExtensions) {
  const dir = join(treeAbs, component);
  if (!existsSync(dir) || !statSync(dir).isDirectory()) return null;
  // `treeAbs` is <pkg>/src/components; the package source root is its parent,
  // where the shared `primitives/` tree lives.
  const packageSrc = dirname(treeAbs);
  let src = "";
  const ownFiles = [];
  const primitiveFiles = new Set();
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
      const fileSrc = readFileSync(p, "utf-8");
      src += fileSrc;
      ownFiles.push({ path: p, source: fileSrc });
      for (const f of resolvePrimitiveImports(fileSrc, d, packageSrc)) {
        primitiveFiles.add(f);
      }
    }
  };
  walk(dir);
  // Transitively include primitives the imported primitives themselves import
  // (a controller re-exported through an index), bounded by the same
  // same-package-primitives constraint. Collected SEPARATELY from `src`: the
  // primitive-extended body is used ONLY for relationship (idref) checks, never
  // for keyboard/focus — a shared roving/focus-trap primitive's arrow-key or
  // keydown tokens must not count as realization for every component that
  // imports it (that would hide the very composite-keyboard gaps another lane
  // is chartered to burn). Relationship idref attributes (aria-controls/
  // -expanded/-describedby set in an anchored-surface primitive) are the only
  // class legitimately realized in a shared primitive.
  let primitiveSrc = "";
  const seen = new Set();
  const queue = [...primitiveFiles];
  while (queue.length > 0) {
    const f = queue.shift();
    if (seen.has(f)) continue;
    seen.add(f);
    const fileSrc = readFileSync(f, "utf-8");
    primitiveSrc += fileSrc;
    for (const next of resolvePrimitiveImports(fileSrc, dirname(f), packageSrc)) {
      if (!seen.has(next)) queue.push(next);
    }
  }
  return { own: src, ownFiles, relationship: src + primitiveSrc };
}

export function relationshipTokens(kind, attribute) {
  const table = RELATIONSHIP_SURFACE[kind];
  if (attribute in table) return table[attribute]; // may be null (excluded)
  return kind === "web-dom" ? [attribute] : null;
}

/**
 * Extract source-level opening tags without being confused by `=>` inside a
 * Lit/React event expression. This is intentionally a small scanner rather
 * than an HTML parser: the input is framework source, not HTML, but braces
 * and quoted attributes still give us enough structure to identify which
 * emitted element owns an attribute.
 */
export function openingTags(src) {
  const tags = [];
  for (let start = 0; start < src.length; start += 1) {
    if (src[start] !== "<" || !/[A-Za-z]/.test(src[start + 1] ?? "")) continue;
    let quote = null;
    let braces = 0;
    for (let i = start + 1; i < src.length; i += 1) {
      const ch = src[i];
      const prev = src[i - 1];
      if (quote) {
        if (ch === quote && prev !== "\\") quote = null;
        continue;
      }
      if (ch === '"' || ch === "'" || ch === "`") {
        quote = ch;
        continue;
      }
      if (ch === "{") braces += 1;
      else if (ch === "}" && braces > 0) braces -= 1;
      else if (ch === ">" && braces === 0) {
        tags.push(src.slice(start, i + 1));
        start = i;
        break;
      }
    }
  }
  return tags;
}

function partCarriers(srcBundle, obligation, part, { target = false } = {}) {
  if (!part) return [];
  const ownSrc = typeof srcBundle === "string" ? srcBundle : srcBundle.own;
  const files =
    typeof srcBundle === "string" || !srcBundle.ownFiles?.length
      ? [{ path: "", source: ownSrc }]
      : srcBundle.ownFiles;
  const candidates = [];

  // Compound/surface emitters give each part a framework-native source
  // boundary: AccordionTrigger.tsx, TabsPanel.vue, or a
  // `TabsTabElement`/`PopoverTriggerDirective` class. Prefer that boundary
  // over markup heuristics. It lets the audit prove an attribute belongs to
  // the declared part even when the framework applies it programmatically to
  // a custom-element host rather than writing an opening tag.
  const symbol =
    part === "root"
      ? obligation.component
      : `${obligation.component}${toPascal(part)}`;
  for (const file of files) {
    const region = symbolRegion(file.source, symbol);
    if (region) candidates.push(region);
  }
  for (const file of files) {
    if (sourceStem(file.path) !== symbol.toLowerCase()) continue;
    const containsOnlySubpartDeclarations =
      part === "root" &&
      new RegExp(
        `(?:^|\\n)export\\s+(?:class|function)\\s+${escapeRegExp(obligation.component)}[A-Z]`,
      ).test(file.source);
    if (!containsOnlySubpartDeclarations) candidates.push(file.source);
  }

  const tags = openingTags(ownSrc);
  if (part === "root") {
    const rootTag = tags.find(
      (tag) =>
        (tag.includes("data-fsds-component") && tag.includes(obligation.cssPrefix)) ||
        (target && hasIdAttribute(tag) && targetReferenceTokens(obligation).some((t) => tag.includes(t))),
    );
    if (rootTag) candidates.push(rootTag);
    return [...new Set(candidates)];
  }
  const marker = `${obligation.cssPrefix}__${part}`;
  const exactMarker = new RegExp(`${escapeRegExp(marker)}(?=[^A-Za-z0-9_-]|$)`);
  const markedTag = tags.find((tag) => exactMarker.test(tag));
  if (markedTag) candidates.push(markedTag);
  return [...new Set(candidates)];
}

function toPascal(value) {
  return String(value)
    .replace(/(^|[-_\s]+)([a-zA-Z0-9])/g, (_match, _sep, ch) => ch.toUpperCase());
}

function sourceStem(path) {
  return basename(path)
    .replace(/\.(?:component|directive)(?=\.)/g, "")
    .split(".")[0]
    .replace(/[^A-Za-z0-9]/g, "")
    .toLowerCase();
}

function symbolRegion(source, symbol) {
  const declaration = new RegExp(
    `(?:^|\\n)(?:export\\s+(?:class|function)\\s+${escapeRegExp(symbol)}(?:Element|Component|Directive)?\\b|[A-Za-z0-9_]+\\.[A-Za-z0-9_]+\\s*=\\s*function\\s+${escapeRegExp(symbol)}\\b)`,
  );
  const match = declaration.exec(source);
  if (!match) return undefined;
  const declarationStart = match.index;
  const declarationEnd = declarationStart + match[0].length;

  // Angular keeps a component's template (and therefore most DOM carriers)
  // in the @Component metadata immediately before the exported class. Keep
  // that decorator inside the exact symbol region, but never borrow the next
  // component/directive decorator in a compound source file.
  const before = source.slice(0, declarationStart);
  const previousExport = before.lastIndexOf("\nexport ");
  const decorators = [
    ...before.matchAll(/(?:^|\n)@(?:Component|Directive)\s*\(\{/g),
  ];
  const decorator = decorators.at(-1);
  const start =
    decorator && decorator.index !== undefined && decorator.index > previousExport
      ? decorator.index
      : declarationStart;
  const remainder = source.slice(declarationEnd);
  const next = /\n(?:@(?:Component|Directive)\s*\(|export\s+(?:class|function|interface|type|const)\s+)/.exec(
    remainder,
  );
  return source.slice(start, next ? declarationEnd + next.index : undefined);
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function hasIdAttribute(tag) {
  return (
    /(?:\bid|:id|\[attr\.id\]|\.id)=/.test(tag) ||
    /setAttribute\(\s*["']id["']/.test(tag) ||
    /HostBinding\(\s*["']attr\.id["']/.test(tag)
  );
}

function targetReferenceTokens(obligation) {
  return obligation.targetId
    ? [obligation.targetId]
    : [
        `-${obligation.to}`,
        `${obligation.to}Id`,
        `${obligation.to}ID`,
        `${obligation.to}_id`,
      ];
}

function occurrenceCount(source, token) {
  if (!token) return 0;
  let count = 0;
  let offset = 0;
  while ((offset = source.indexOf(token, offset)) !== -1) {
    count += 1;
    offset += token.length;
  }
  return count;
}

function classifyWebRelationship(obligation, srcBundle, tokens) {
  const ownSrc = typeof srcBundle === "string" ? srcBundle : srcBundle.own;
  const relationshipSrc =
    typeof srcBundle === "string"
      ? srcBundle
      : srcBundle.relationship ?? srcBundle.own;
  const sourceCandidates = partCarriers(srcBundle, obligation, obligation.from);
  if (sourceCandidates.length === 0) {
    return { verdict: "unrealized", reason: `from part ${obligation.from} not found` };
  }

  const source = sourceCandidates.find((candidate) =>
    tokens.some((token) => candidate.includes(token)),
  );
  const ownsAttribute = source !== undefined;
  let attributeSource = source ?? sourceCandidates[0];
  let via = "owned attribute";
  if (!ownsAttribute) {
    const primitiveOnly = relationshipSrc.slice(ownSrc.length);
    if (tokens.some((token) => primitiveOnly.includes(token))) {
      attributeSource = primitiveOnly;
      via = "directly-imported primitive";
    } else {
      return {
        verdict: "unrealized",
        reason: `${obligation.key} is not on from part ${obligation.from}`,
      };
    }
  }

  if (!IDREF_ATTRIBUTES.has(obligation.key)) {
    return { verdict: "realized", via };
  }

  const targetCandidates = partCarriers(srcBundle, obligation, obligation.to, { target: true });
  if (targetCandidates.length === 0) {
    return { verdict: "unrealized", reason: `to part ${obligation.to} not found` };
  }
  const refTokens = targetReferenceTokens(obligation);
  const sourceReferences = (token) =>
    attributeSource.includes(token) ||
    boundAttributeReferencesTarget(
      attributeSource,
      obligation.key,
      token,
      relationshipSrc,
    ) ||
    (forwardsRelationshipAttribute(attributeSource, obligation.key) &&
      occurrenceCount(relationshipSrc, token) >= 2);
  if (obligation.targetSlotted) {
    const providedReference = refTokens.find(
      (token) => sourceReferences(token) && occurrenceCount(relationshipSrc, token) >= 2,
    );
    if (providedReference) {
      return { verdict: "realized", via: "consumer-slot association provider" };
    }
  }
  const target = targetCandidates.find((candidate) =>
    hasIdAttribute(candidate) &&
    refTokens.some(
      (token) =>
        sourceReferences(token) &&
        candidate.includes(token) &&
        occurrenceCount(relationshipSrc, token) >= 2,
    ),
  );
  const matchingReference = refTokens.find(
    (token) =>
      sourceReferences(token) &&
      target?.includes(token) &&
      occurrenceCount(relationshipSrc, token) >= 2,
  );
  if (!target || !hasIdAttribute(target) || !matchingReference) {
    return {
      verdict: "unrealized",
      reason: `to part ${obligation.to} has no matching id`,
    };
  }
  return { verdict: "realized", via: via === "owned attribute" ? "owned idref" : via };
}

function forwardsRelationshipAttribute(source, attribute) {
  const escaped = escapeRegExp(attribute);
  return (
    new RegExp(`(?:rest|attrs|triggerProps)(?:\\.value)?\\s*\\[\\s*["']${escaped}["']\\s*\\]`).test(source) ||
    /\.\.\.(?:ariaProps|triggerProps|attrs|rest)\b/.test(source)
  );
}

function boundAttributeReferencesTarget(carrier, attribute, targetToken, source) {
  const binding = new RegExp(
    `\\[attr\\.${escapeRegExp(attribute)}\\]\\s*=\\s*["']([^"']+)["']`,
  ).exec(carrier);
  if (!binding) return false;
  const expression = binding[1].trim();
  if (expression.includes(targetToken)) return true;
  if (!/^[A-Za-z_$][A-Za-z0-9_$]*$/.test(expression)) return false;

  // Angular commonly keeps the composed IDREF in a getter so consumer
  // overrides and generated defaults share one binding. Follow only that
  // exact getter body; a nearby sibling getter must not lend it an unrelated
  // endpoint token.
  const getter = new RegExp(
    `get\\s+${escapeRegExp(expression)}\\b[^\\{]*\\{([\\s\\S]*?)\\n\\s*\\}`,
  ).exec(source);
  return Boolean(getter?.[1].includes(targetToken));
}

/** Classify one obligation against one family's committed source.
 * `srcBundle` is { own, relationship }: `own` is the component's own source;
 * `relationship` additionally includes same-package primitives the component
 * imports (used ONLY for idref relationship checks — see readComponentSource).
 * A bare string is accepted for callers/tests that don't split the two.
 * Returns { verdict: "realized"|"unrealized"|"excluded", via?, reason? }. */
export function classify(obligation, kind, srcBundle, contractTags) {
  const ownSrc = typeof srcBundle === "string" ? srcBundle : srcBundle.own;
  const relationshipSrc =
    typeof srcBundle === "string"
      ? srcBundle
      : srcBundle.relationship ?? srcBundle.own;
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
    if (kind === "web-dom" && obligation.from && obligation.to && obligation.cssPrefix) {
      return classifyWebRelationship(obligation, srcBundle, tokens);
    }
    return tokens.some((t) => relationshipSrc.includes(t))
      ? { verdict: "realized", via: "attribute" }
      : { verdict: "unrealized" };
  }
  if (obligation.class === "keyboard") {
    if (EXPLICIT_KEY_RE.test(ownSrc)) return { verdict: "realized", via: "explicit" };
    const keys = atomicKeys(obligation.key);
    const trapKeys = keys.every((k) => k === "Tab");
    const dismissKeys = keys.every((k) => k === "Escape");
    if (trapKeys && TRAP_RE.test(ownSrc)) return { verdict: "realized", via: "primitive" };
    if (dismissKeys && DISMISS_RE.test(ownSrc)) return { verdict: "realized", via: "primitive" };
    if ((trapKeys || dismissKeys) && (TRAP_RE.test(ownSrc) || DISMISS_RE.test(ownSrc)))
      return { verdict: "realized", via: "primitive" };
    const hasNativeTag =
      [...contractTags].some((t) => NATIVE_INTERACTIVE_TAGS.has(t)) ||
      NATIVE_ELEMENT_IN_SOURCE_RE.test(ownSrc);
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
    return TRAP_RE.test(ownSrc)
      ? { verdict: "realized", via: "primitive" }
      : { verdict: "unrealized" };
  }
  // roving cannot be native — demands explicit key handling.
  return EXPLICIT_KEY_RE.test(ownSrc)
    ? { verdict: "realized", via: "explicit" }
    : { verdict: "unrealized" };
}

// ---- main -------------------------------------------------------------------
function gapId(row) {
  return tupleId(
    row.component,
    row.family,
    row.class,
    row.key,
    row.class === "relationship" ? row.from : undefined,
    row.class === "relationship" ? row.to : undefined,
  );
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
      const srcBundle = readComponentSource(treeAbs, ob.component, d.sourceExtensions);
      if (srcBundle === null) {
        // Component not emitted for this family (e.g. not yet admitted there):
        // nothing to check — record for visibility, not as a gap.
        rows.push({ ...ob, family: d.id, verdict: "not-emitted" });
        continue;
      }
      const res = classify(ob, kind, srcBundle, tagsByComponent.get(ob.component) ?? new Set());
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
    if (
      g.class === "relationship" &&
      (typeof g.from !== "string" ||
        g.from.length === 0 ||
        typeof g.to !== "string" ||
        g.to.length === 0)
    ) {
      throw new Error(
        `known-gaps.json relationship entry must name from/to: ${JSON.stringify(g)}`,
      );
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
    `| component | family | class | key | endpoints | verdict | via/reason |`,
    `|---|---|---|---|---|---|---|`,
  ];
  for (const r of rows) {
    if (r.verdict === "realized" || r.verdict === "not-emitted") continue;
    lines.push(
      `| ${r.component} | ${r.family} | ${r.class} | ${r.key} | ${r.from && r.to ? `${r.from} → ${r.to}` : ""} | ${r.verdict} | ${r.via ?? r.reason ?? ""} |`,
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
