#!/usr/bin/env node
/**
 * Docs-claims check — fail-loud guard against authored drift in prose.
 *
 * The corpus count ("N components") appears in narrative docs as a
 * hand-maintained number. It has drifted before (42 -> 53 in prose while
 * the corpus was actually 47), which is exactly the failure mode CLAUDE.md
 * warns about: "never trust hand-written counts in prose; the loader is
 * authoritative." This script makes the loader authoritative mechanically.
 *
 * Design: opt-in marker, not pattern-matching. A bare regex for "N
 * components" produces false positives — e.g. normal-form.md's open
 * question "will the contract hold past 100 components" is a hypothetical
 * threshold, not the corpus count. So the doc author marks the governed
 * value explicitly with an HTML comment:
 *
 *     <!-- component-count --> 47 component contracts ...
 *
 * Only the value immediately following a marker is checked. Unmarked
 * numbers are ignored, and a marker followed by nothing shape-compatible
 * is ignored too — that is what lets a doc mention the marker vocabulary
 * itself (in code spans or tables) without governing the prose around it.
 * This keeps the gate's scope exactly what the author declared governed.
 *
 * Governed value shapes (per claim, see CLAIMS below):
 *   int  — <!-- component-count -->47                    (the default)
 *   list — <!-- web-framework-list -->React, Vue, Svelte, Angular, Lit
 *          (bare comma list, no terminal "and" — the canonical form)
 *   date — <!-- snapshot-updated -->2026-08-17
 *
 * Parametric claims carry their argument after a colon:
 *   <!-- target-component-count:swiftui -->49
 *   (the `components` allowlist length for that target in
 *   fsds.targets.json; a target with no allowlist derives the full
 *   loader-discovered corpus count instead.)
 *
 * Usage:
 *   node scripts/docs-claims-check.mjs            # check, exit 1 on drift
 *   node scripts/docs-claims-check.mjs --fix      # rewrite marked values in place
 */

import { readFileSync, writeFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, "..");
const COMPONENTS_DIR = join(REPO_ROOT, "packages", "ds-contracts", "components");
const RAIL_FRAMEWORKS_DIR = join(
  REPO_ROOT, "packages", "ds-codegen", "src", "validation", "frameworks",
);
const TARGET_REGISTRY = join(REPO_ROOT, "fsds.targets.json");
const ICONS_DIR = join(REPO_ROOT, "packages", "ds-iconography", "icons");
const SNAPSHOT_DOC = join(REPO_ROOT, "docs", "current-implementation-snapshot.md");

const FIX = process.argv.includes("--fix");

/** Marker -> { derive, format? }. Add a row when a new claim is governed. */
const CLAIMS = {
  "component-count": { derive: deriveComponentCount },
  "rail-admitted-target-count": { derive: deriveRailAdmittedTargetCount },
  "registered-target-count": { derive: deriveRegisteredTargetCount },
  "icon-count": { derive: deriveIconCount },
  "web-framework-list": { derive: deriveWebFrameworkList, format: "list" },
  "web-framework-count": { derive: deriveWebFrameworkCount },
  "snapshot-updated": { derive: deriveSnapshotUpdated, format: "date" },
};

const TARGET_COMPONENT_COUNT_PREFIX = "target-component-count:";

/**
 * Resolve a marker name to its derivation. Static CLAIMS rows first; the
 * one parametric family (target-component-count:<id>) derives from the
 * target registry for any well-formed id. Anything else is a typo'd claim
 * that would otherwise sit here silently unchecked — loud exit.
 */
function resolveClaim(name) {
  if (Object.prototype.hasOwnProperty.call(CLAIMS, name)) return CLAIMS[name];
  if (name.startsWith(TARGET_COMPONENT_COUNT_PREFIX)) {
    const id = name.slice(TARGET_COMPONENT_COUNT_PREFIX.length);
    if (/^[a-z][a-z0-9-]*$/.test(id)) {
      return { derive: () => deriveTargetComponentCount(id) };
    }
  }
  console.error(`docs-claims-check: unknown claim marker "${name}"`);
  process.exit(2);
}

/**
 * Docs scanned for markers: every tracked markdown file...
 *
 * This used to be a hardcoded one-entry list (`docs/normal-form.md`), which
 * made the gate structurally unable to catch what it was built for. Prose
 * counts rotted every OTHER doc precisely because they were unreachable:
 * admission-rail.md claimed "53 components ... 265 artifact groups, 1024
 * generated files" while the corpus was 49 and the manifest said 294/1422.
 * A marker is now honoured wherever an author puts it, so opting a claim in
 * is a one-line doc edit with no list to keep in sync.
 *
 * One class sits OUTSIDE `git ls-files` and still rots: machine-local agent
 * docs that are gitignored on purpose (CLAUDE.md, .gitignore:69). They look
 * like repo documentation, they carry the same counts, and no tracked-file
 * gate can see them — which is exactly how CLAUDE.md drifted from AGENTS.md
 * undetected. LOCAL_AGENT_DOCS admits them explicitly: gated on every clone
 * where present, silently skipped where absent (the existsSync guard below).
 */
const LOCAL_AGENT_DOCS = ["CLAUDE.md"];

function governedDocs() {
  let tracked;
  try {
    tracked = execFileSync("git", ["ls-files", "-z", "*.md"], {
      cwd: REPO_ROOT,
      encoding: "utf8",
      maxBuffer: 32 * 1024 * 1024,
    })
      .split("\0")
      .filter(Boolean);
  } catch (err) {
    console.error(`docs-claims-check: could not list tracked docs — ${err.message}`);
    process.exit(2);
  }
  const seen = new Set(tracked);
  return [...tracked, ...LOCAL_AGENT_DOCS.filter((doc) => !seen.has(doc))];
}

/**
 * Authoritative count — mirrors contracts-fs.ts: walk components/* and
 * count dirs that contain their canonical <Name>.contract.json.
 */
function deriveComponentCount() {
  if (!existsSync(COMPONENTS_DIR)) {
    console.error(`docs-claims-check: components dir not found at ${COMPONENTS_DIR}`);
    process.exit(2);
  }
  let count = 0;
  for (const name of readdirSync(COMPONENTS_DIR)) {
    const dir = join(COMPONENTS_DIR, name);
    if (!statSync(dir).isDirectory()) continue;
    if (existsSync(join(dir, `${name}.contract.json`))) count += 1;
  }
  return count;
}

/**
 * Rail-admitted target ids: framework modules that SELF-DECLARE an
 * AdmissionDescriptor. This mirrors how the registry is actually built —
 * `validation/admission-descriptor.ts` aggregates one descriptor per module —
 * so the set self-corrects when a target is added or withdrawn.
 *
 * Matching `export const <name>AdmissionDescriptor` (not a bare mention of
 * the type) is deliberate: `figma.ts` imports rail types but declares no
 * descriptor, because figma is generate-admitted and rail-EXCLUDED. A looser
 * grep would silently count it and inflate the claims this gate exists to pin.
 */
function scanRailAdmittedIds() {
  if (!existsSync(RAIL_FRAMEWORKS_DIR)) {
    console.error(`docs-claims-check: rail frameworks dir not found at ${RAIL_FRAMEWORKS_DIR}`);
    process.exit(2);
  }
  const declares = /export\s+const\s+[A-Za-z0-9_]*AdmissionDescriptor\b/;
  const ids = [];
  for (const name of readdirSync(RAIL_FRAMEWORKS_DIR)) {
    if (!name.endsWith(".ts") || name.endsWith(".test.ts")) continue;
    if (declares.test(readFileSync(join(RAIL_FRAMEWORKS_DIR, name), "utf8"))) {
      ids.push(name.slice(0, -".ts".length));
    }
  }
  return ids;
}

function deriveRailAdmittedTargetCount() {
  return scanRailAdmittedIds().length;
}

/**
 * Web DOM framework family — the rail-admitted descriptor ids minus the
 * non-web members. Membership is DERIVED from the same self-declaring
 * descriptor modules the rail-admitted count reads, so admitting or
 * withdrawing a target re-derives this list and fails every doc that
 * still states the old one. DISPLAY_ORDER only fixes prose ordering; a
 * rail-admitted id unknown to either table exits loudly so the next
 * admission is classified deliberately, never silently absorbed.
 */
const WEB_FRAMEWORK_DISPLAY_ORDER = ["react", "vue", "svelte", "angular", "lit"];
const NON_WEB_RAIL_TARGETS = new Set(["react-native"]);

function webFrameworkIds() {
  const web = scanRailAdmittedIds().filter((id) => !NON_WEB_RAIL_TARGETS.has(id));
  const unclassified = web.filter((id) => !WEB_FRAMEWORK_DISPLAY_ORDER.includes(id));
  if (unclassified.length > 0) {
    console.error(
      `docs-claims-check: rail-admitted id(s) ${JSON.stringify(unclassified)} are neither ` +
        `web frameworks (WEB_FRAMEWORK_DISPLAY_ORDER) nor non-web (NON_WEB_RAIL_TARGETS) — ` +
        `classify the new admission before the docs can follow it.`,
    );
    process.exit(2);
  }
  return WEB_FRAMEWORK_DISPLAY_ORDER.filter((id) => web.includes(id));
}

function displayId(id) {
  return id
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function deriveWebFrameworkList() {
  return webFrameworkIds().map(displayId).join(", ");
}

function deriveWebFrameworkCount() {
  return webFrameworkIds().length;
}

/** Registered codegen targets — the `targets` array in fsds.targets.json. */
function readTargetRegistry() {
  if (!existsSync(TARGET_REGISTRY)) {
    console.error(`docs-claims-check: target registry not found at ${TARGET_REGISTRY}`);
    process.exit(2);
  }
  const registry = JSON.parse(readFileSync(TARGET_REGISTRY, "utf8"));
  if (!Array.isArray(registry.targets)) {
    console.error(`docs-claims-check: fsds.targets.json has no targets array`);
    process.exit(2);
  }
  return registry;
}

function deriveRegisteredTargetCount() {
  return readTargetRegistry().targets.length;
}

/**
 * Per-target emission scope — the `components` allowlist length for that
 * id in fsds.targets.json. A target with no allowlist emits the full
 * loader-discovered corpus, so that is what the marker derives.
 */
function deriveTargetComponentCount(id) {
  const target = readTargetRegistry().targets.find((t) => t && t.id === id);
  if (!target) {
    console.error(`docs-claims-check: target "${id}" is not registered in fsds.targets.json`);
    process.exit(2);
  }
  return Array.isArray(target.components) ? target.components.length : deriveComponentCount();
}

/** Icon corpus — directories under the iconography package's icons/ root. */
function deriveIconCount() {
  if (!existsSync(ICONS_DIR)) {
    console.error(`docs-claims-check: icons dir not found at ${ICONS_DIR}`);
    process.exit(2);
  }
  let count = 0;
  for (const name of readdirSync(ICONS_DIR)) {
    if (statSync(join(ICONS_DIR, name)).isDirectory()) count += 1;
  }
  return count;
}

/**
 * Freshness stamp — the `updated` frontmatter date of the claim ledger
 * itself. Derived, not authored, so an "as of" line in another doc cannot
 * outlive a ledger edit: the next snapshot update fails this gate until
 * every stamp follows. (Commit-SHA stamps were tried and rotted; the
 * ledger's own header already carries per-sweep commit provenance.)
 */
function deriveSnapshotUpdated() {
  if (!existsSync(SNAPSHOT_DOC)) {
    console.error(`docs-claims-check: snapshot doc not found at ${SNAPSHOT_DOC}`);
    process.exit(2);
  }
  const match = readFileSync(SNAPSHOT_DOC, "utf8").match(/^updated:\s*(\d{4}-\d{2}-\d{2})\s*$/m);
  if (!match) {
    console.error(
      `docs-claims-check: ${SNAPSHOT_DOC} has no \`updated: YYYY-MM-DD\` frontmatter date`,
    );
    process.exit(2);
  }
  return match[1];
}

// Claim names are lowercase-with-hyphens, optionally parametric through a
// single `:argument` (e.g. target-component-count:swiftui).
const MARKER = /<!--\s*([a-z][a-z0-9-]*(?::[a-z][a-z0-9-]*)?)\s*-->/g;

// Per-format value grammars, anchored at the text immediately after the
// marker. `int` keeps the historical (\s*)(\d+) shape so a count may sit
// on the next line, exactly as the previous single-regex scanner allowed.
// `list` and `date` stay on the marker's line ([ \t] gap only): a
// capitalized-word list allowed to span a newline would happily eat the
// following sentence, which is worse than a loud miss.
const VALUE_FORMATS = {
  int: /^(\s*)(\d+)/,
  list: /^([ \t]*)((?:[A-Z][A-Za-z0-9-]*)(?:,[ \t]*[A-Z][A-Za-z0-9-]*)*)/,
  date: /^([ \t]*)(\d{4}-\d{2}-\d{2})/,
};

let drift = 0;
let governedHits = 0;

for (const file of governedDocs()) {
  const path = join(REPO_ROOT, file);
  // Tracked but not materialised (sparse checkout in a CAWS worktree) — the
  // canonical checkout still gates it, so skipping here is not a hole.
  if (!existsSync(path)) continue;
  const text = readFileSync(path, "utf8");
  let out = "";
  let cursor = 0;
  let fileChanged = false;

  MARKER.lastIndex = 0;
  let m;
  while ((m = MARKER.exec(text)) !== null) {
    const claim = m[1];
    const markerEnd = m.index + m[0].length;
    const rest = text.slice(markerEnd);

    // Shape before resolution: a marker followed by NO value shape at all is
    // vocabulary (this table, code spans) and must not resolve the claim —
    // resolving would exit-2 on the deliberately-quoted `<!-- marker -->`.
    const hasGovernedShape = Object.values(VALUE_FORMATS).some((re) => re.test(rest));
    if (!hasGovernedShape) continue;

    const { derive, format = "int" } = resolveClaim(claim);
    const valueMatch = rest.match(VALUE_FORMATS[format]);

    // Something shape-like follows but not the claim's own format — e.g. a
    // date claim followed by a bare integer. Loud, not skipped: the author
    // clearly intended to govern a value here and got the shape wrong.
    if (!valueMatch) {
      console.error(
        `docs-claims-check: ${file}: "${claim}" expects a ${format} value, ` +
          `but the text after the marker matches no such shape`,
      );
      process.exit(2);
    }

    governedHits += 1;
    const stated = valueMatch[2];
    const gap = valueMatch[1];
    const expected = derive();
    const valueEnd = markerEnd + valueMatch[0].length;
    const ok = format === "int" ? Number(stated) === expected : stated === String(expected);

    if (ok) {
      out += text.slice(cursor, valueEnd);
    } else {
      drift += 1;
      console.error(
        `docs-claims-check: ${file}: "${claim}" stated ${JSON.stringify(stated)} ` +
          `but derived value is ${JSON.stringify(String(expected))}`,
      );
      if (FIX) {
        fileChanged = true;
        // slice(cursor, markerEnd) already carries the original marker bytes;
        // appending a re-rendered marker here would DUPLICATE it (the exact
        // artifact the first falsification round caught).
        out += text.slice(cursor, markerEnd) + gap + String(expected);
      } else {
        out += text.slice(cursor, valueEnd);
      }
    }
    cursor = valueEnd;
    MARKER.lastIndex = valueEnd;
  }

  out += text.slice(cursor);

  if (FIX && fileChanged) {
    writeFileSync(path, out);
    console.log(`docs-claims-check: rewrote stale claim(s) in ${file}`);
  }
}

if (governedHits === 0) {
  console.error(
    `docs-claims-check: no claim markers found in governed docs. ` +
      `Markers must be present (e.g. "<!-- component-count --> 47") or this gate guards nothing.`,
  );
  process.exit(2);
}

if (drift === 0) {
  console.log(`docs-claims-check: OK — ${governedHits} marked claim(s) match derived values.`);
  process.exit(0);
}

if (FIX) {
  console.log(`docs-claims-check: fixed ${drift} stale claim(s).`);
  process.exit(0);
}

console.error(
  `\ndocs-claims-check: ${drift} stale claim(s). ` +
    `Run \`node scripts/docs-claims-check.mjs --fix\` or edit the doc.`,
);
process.exit(1);
