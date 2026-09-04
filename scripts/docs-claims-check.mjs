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
 *   word — <!-- coverage-vs-target:vue -->below          (above|below)
 *
 * Parametric claims carry their argument after a colon:
 *   <!-- target-component-count:swiftui -->49
 *   (the `components` allowlist length for that target in
 *   fsds.targets.json; a target with no allowlist derives the full
 *   loader-discovered corpus count instead.)
 *
 *   <!-- coverage-floor-lines:react -->79
 *   <!-- coverage-floor-branches:react -->77
 *   <!-- coverage-floor-functions:react -->70
 *   <!-- coverage-vs-target:react -->below
 *   (per-package coverage floors and 80%-target status, derived from
 *   coverage-floors.json — the same authority every runner config
 *   enforces as its coverage thresholds.)
 *
 * Showcase-structure claims derive from the src/ tree itself:
 *   <!-- src-view-count -->15          (top-level non-test .tsx modules in src/views/)
 *   <!-- src-view-list -->ActivityView (those module names, sorted)
 *   <!-- src-top-level-dir-count -->10 (directories directly under src/)
 *   <!-- showcase-route-count -->12    (the `kind:` union members of Route in src/router.tsx)
 *
 * The SECOND thing this gate checks is stamp freshness. Docs that carry a
 * `verified_at_commit` frontmatter stamp vouch that their prose was verified
 * against the tree at that commit; the doc's `governs:` globs declare which
 * paths that verification covers. A stamp whose governs surface has changed
 * since is stale — the marker numbers inside the doc may still derive clean
 * while the narrative around them rots (normal-form.md sat 1208 commits past
 * its stamp with the swift/ and jetpack-compose/ emitters landing inside its
 * own governs globs, and nothing failed). Stale stamps fail unless ledgered
 * at their exact current value in doc-freshness-baseline.json — a
 * two-directional ratchet: entries can only shrink away as docs are
 * refreshed, and a dangling or overtaken entry fails until the ledger does.
 *
 * Usage:
 *   node scripts/docs-claims-check.mjs            # check, exit 1 on drift
 *   node scripts/docs-claims-check.mjs --fix      # rewrite marked values in place
 *                                                 # (never verified_at_commit —
 *                                                 # verification is not auto-mintable)
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
const COVERAGE_FLOORS_FILE = join(REPO_ROOT, "coverage-floors.json");
const SHOWCASE_SRC_DIR = join(REPO_ROOT, "src");
const SHOWCASE_VIEWS_DIR = join(SHOWCASE_SRC_DIR, "views");
const SHOWCASE_ROUTER = join(SHOWCASE_SRC_DIR, "router.tsx");
const FRESHNESS_BASELINE_FILE = join(REPO_ROOT, "doc-freshness-baseline.json");

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
  "src-view-count": { derive: deriveShowcaseViewCount },
  "src-view-list": { derive: deriveShowcaseViewList, format: "list" },
  "src-top-level-dir-count": { derive: deriveShowcaseTopLevelDirCount },
  "showcase-route-count": { derive: deriveShowcaseRouteCount },
};

const TARGET_COMPONENT_COUNT_PREFIX = "target-component-count:";
const COVERAGE_FLOOR_LINES_PREFIX = "coverage-floor-lines:";
const COVERAGE_FLOOR_BRANCHES_PREFIX = "coverage-floor-branches:";
const COVERAGE_FLOOR_FUNCTIONS_PREFIX = "coverage-floor-functions:";
const COVERAGE_VS_TARGET_PREFIX = "coverage-vs-target:";

/**
 * Coverage floors — the single authority consumed by every runner config
 * (vitest `coverage.thresholds` / jest `coverageThreshold`) and derived
 * from here for the coverage-* doc markers. Loaded lazily so a claim-less
 * run never reads the file.
 */
let coverageFloorsJson;
function coverageFloors() {
  if (!coverageFloorsJson) {
    try {
      coverageFloorsJson = JSON.parse(readFileSync(COVERAGE_FLOORS_FILE, "utf8"));
    } catch (err) {
      console.error(
        `docs-claims-check: cannot read coverage floors at ${COVERAGE_FLOORS_FILE} — ${err.message}`,
      );
      process.exit(2);
    }
  }
  return coverageFloorsJson;
}

/** Per-package floor record, or loud exit for a marker naming an unknown id. */
function coverageFloorsFor(id) {
  const pkg = coverageFloors().packages?.[id];
  if (!pkg) {
    console.error(`docs-claims-check: unknown coverage package id "${id}" in coverage-floors.json`);
    process.exit(2);
  }
  return pkg;
}

/**
 * Resolve a marker name to its derivation. Static CLAIMS rows first; the
 * parametric families (target-component-count:<id> and the four
 * coverage-*:<id> claims) derive from their registries for any well-formed
 * id. Anything else is a typo'd claim that would otherwise sit here
 * silently unchecked — loud exit.
 */
function resolveClaim(name) {
  if (Object.prototype.hasOwnProperty.call(CLAIMS, name)) return CLAIMS[name];
  if (name.startsWith(TARGET_COMPONENT_COUNT_PREFIX)) {
    const id = name.slice(TARGET_COMPONENT_COUNT_PREFIX.length);
    if (/^[a-z][a-z0-9-]*$/.test(id)) {
      return { derive: () => deriveTargetComponentCount(id) };
    }
  }
  const parametric = [
    [COVERAGE_FLOOR_LINES_PREFIX, (id) => ({ derive: () => coverageFloorsFor(id).lines })],
    [COVERAGE_FLOOR_BRANCHES_PREFIX, (id) => ({ derive: () => coverageFloorsFor(id).branches })],
    [
      COVERAGE_FLOOR_FUNCTIONS_PREFIX,
      (id) => ({ derive: () => coverageFloorsFor(id).functions }),
    ],
    [
      COVERAGE_VS_TARGET_PREFIX,
      (id) => ({
        derive: () =>
          coverageFloorsFor(id).lines >= (coverageFloors().target?.lines ?? 80)
            ? "above"
            : "below",
        format: "word",
      }),
    ],
  ];
  for (const [prefix, make] of parametric) {
    if (name.startsWith(prefix)) {
      const id = name.slice(prefix.length);
      if (/^[a-z][a-z0-9-]*$/.test(id)) return make(id);
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

/**
 * Showcase app structure — the src/ layout blocks in AGENTS.md/README.md
 * derive from the tree the same way the corpus count derives from the
 * loader. They rotted once already: views/ was described as
 * "DesignView + DeveloperView + sections/" while the 2026-08-17 router
 * slice grew it to 15 routed modules, and the enumeration sat unchecked
 * because no gate could see it. These claims make the tree authoritative.
 */

/** Top-level, non-test view modules under src/views/ — sorted for determinism. */
function showcaseViewModules() {
  if (!existsSync(SHOWCASE_VIEWS_DIR)) {
    console.error(`docs-claims-check: showcase views dir not found at ${SHOWCASE_VIEWS_DIR}`);
    process.exit(2);
  }
  return readdirSync(SHOWCASE_VIEWS_DIR)
    .filter((name) => name.endsWith(".tsx") && !name.includes(".test."))
    .map((name) => name.slice(0, -".tsx".length))
    .sort();
}

function deriveShowcaseViewCount() {
  return showcaseViewModules().length;
}

function deriveShowcaseViewList() {
  return showcaseViewModules().join(", ");
}

/** Directories directly under src/ — a tripwire for subsystem add/remove. */
function deriveShowcaseTopLevelDirCount() {
  if (!existsSync(SHOWCASE_SRC_DIR)) {
    console.error(`docs-claims-check: showcase src/ dir not found at ${SHOWCASE_SRC_DIR}`);
    process.exit(2);
  }
  let count = 0;
  for (const name of readdirSync(SHOWCASE_SRC_DIR)) {
    if (statSync(join(SHOWCASE_SRC_DIR, name)).isDirectory()) count += 1;
  }
  return count;
}

/**
 * Hash routes — the `| { kind: "..." }` members of the `Route` union in
 * src/router.tsx. Scoped to the union-member shape on purpose: the other
 * unions in that file are bare string literals, and object returns carry
 * no leading `|` — mirroring how scanRailAdmittedIds matches the
 * descriptor export shape rather than a bare type mention.
 */
function deriveShowcaseRouteCount() {
  if (!existsSync(SHOWCASE_ROUTER)) {
    console.error(`docs-claims-check: showcase router not found at ${SHOWCASE_ROUTER}`);
    process.exit(2);
  }
  const text = readFileSync(SHOWCASE_ROUTER, "utf8");
  return (text.match(/\|\s*\{\s*kind:\s*"/g) ?? []).length;
}

// Claim names are lowercase-with-hyphens, optionally parametric through a
// single `:argument` (e.g. target-component-count:swiftui).
const MARKER = /<!--\s*([a-z][a-z0-9-]*(?::[a-z][a-z0-9-]*)?)\s*-->/g;

/**
 * verified_at_commit freshness — the second thing this gate checks.
 *
 * A doc that stamps `verified_at_commit` vouches its prose was verified
 * against the tree at that commit, over the paths its `governs:` globs
 * declare. Marked values inside the doc re-derive on every run; the stamp
 * itself used to be presence-checked only, which let normal-form.md sit
 * 1208 commits past verification with its own governs globs (including the
 * swift/ and jetpack-compose/ emitters) changed underneath it. A stamp that
 * never ages vouches for nothing.
 *
 * The check is git-derived, per doc: the last commit touching any governs
 * glob must be an ancestor of (or equal to) the stamped commit. A stale
 * stamp is a violation UNLESS ledgered at its exact current value in
 * doc-freshness-baseline.json — a two-directional ratchet in the shape of
 * the derived-obligation ledgers: known-stale docs are named deliberately,
 * can only leave the ledger by being refreshed, and an entry whose doc has
 * gone fresh (or away) fails until the ledger shrinks. An unresolvable
 * stamp is never ledgerable. `--fix` never rewrites a stamp: verification
 * cannot be auto-minted.
 */

/** Minimal frontmatter reader — flat scalars plus `governs:` list shapes. */
function parseDocFrontmatter(text) {
  const fence = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!fence) return null;
  const fields = {};
  const lines = fence[1].split(/\r?\n/);
  for (let i = 0; i < lines.length; i += 1) {
    const field = lines[i].match(/^([A-Za-z_]+):\s*(.*)$/);
    if (!field) continue;
    const [, key, raw] = field;
    const value = raw.trim();
    if (value === "") {
      // Block list (`governs:` followed by `  - path` lines).
      const items = [];
      let j = i + 1;
      for (; j < lines.length; j += 1) {
        const item = lines[j].match(/^\s+-\s+(.+?)\s*$/);
        if (!item) break;
        items.push(item[1].replace(/^["']|["']$/g, ""));
      }
      if (items.length > 0) {
        fields[key] = items;
        i = j - 1;
      } else {
        fields[key] = "";
      }
    } else if (value.startsWith("[") && value.endsWith("]")) {
      fields[key] = value
        .slice(1, -1)
        .split(",")
        .map((s) => s.trim().replace(/^["']|["']$/g, ""))
        .filter(Boolean);
    } else {
      fields[key] = value.replace(/^["']|["']$/g, "");
    }
  }
  return fields;
}

/**
 * A bare governs entry (no metacharacters) uses git's path-prefix semantics
 * — everything beneath a directory; an entry with wildcards needs :(glob)
 * magic so `**` crosses directory boundaries as the doc author meant.
 */
function governsPathspecs(globs) {
  return globs.map((g) => (/[*?]/.test(g) ? `:(glob)${g}` : g));
}

function shortSha(sha) {
  return sha.slice(0, 8);
}

/**
 * Freshness verdict for one doc: "fresh", "stale", or "unresolvable".
 * Null when the doc has not opted in — no stamp, or nothing it declares to
 * govern (the doc-governance V3 hook owns requiring `governs:`; a stamp
 * with no surface is simply not freshness-checkable here).
 */
function docFreshness(file, text) {
  const fm = parseDocFrontmatter(text);
  if (!fm || !fm.verified_at_commit) return null;
  const verified = String(fm.verified_at_commit);
  const globs = Array.isArray(fm.governs) ? fm.governs : fm.governs ? [String(fm.governs)] : [];
  if (globs.length === 0) return null;
  let last = "";
  try {
    last = execFileSync("git", ["log", "-1", "--format=%H", "--", ...governsPathspecs(globs)], {
      cwd: REPO_ROOT,
      encoding: "utf8",
      maxBuffer: 8 * 1024 * 1024,
    }).trim();
  } catch (err) {
    console.error(`docs-claims-check: ${file}: governs pathspec failed — ${err.message}`);
    process.exit(2);
  }
  if (!last) return null;
  let resolved = "";
  try {
    resolved = execFileSync(
      "git",
      ["rev-parse", "--verify", "--quiet", `${verified}^{commit}`],
      { cwd: REPO_ROOT, encoding: "utf8" },
    ).trim();
  } catch {
    resolved = "";
  }
  if (!resolved) return { state: "unresolvable", verified, last };
  try {
    execFileSync("git", ["merge-base", "--is-ancestor", last, resolved], { cwd: REPO_ROOT });
  } catch {
    return { state: "stale", verified, last };
  }
  return { state: "fresh", verified, last };
}

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
  // Only the two tokens the coverage-vs-target claim ever emits — a bare
  // `[a-z-]+` would silently swallow prose words after a vocabulary marker.
  word: /^([ \t]*)(above|below)/,
};

let drift = 0;
let governedHits = 0;
const freshnessByDoc = new Map();

for (const file of governedDocs()) {
  const path = join(REPO_ROOT, file);
  // Tracked but not materialised (sparse checkout in a CAWS worktree) — the
  // canonical checkout still gates it, so skipping here is not a hole.
  if (!existsSync(path)) continue;
  const text = readFileSync(path, "utf8");
  const freshness = docFreshness(file, text);
  if (freshness) freshnessByDoc.set(file, freshness);
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

/** The freshness ledger — known-stale stamps recorded at their exact value. */
let freshnessBaseline = null;
if (existsSync(FRESHNESS_BASELINE_FILE)) {
  try {
    const parsed = JSON.parse(readFileSync(FRESHNESS_BASELINE_FILE, "utf8"));
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      console.error(`docs-claims-check: ${FRESHNESS_BASELINE_FILE} is not a JSON object`);
      process.exit(2);
    }
    freshnessBaseline = parsed;
  } catch (err) {
    console.error(`docs-claims-check: cannot parse ${FRESHNESS_BASELINE_FILE} — ${err.message}`);
    process.exit(2);
  }
}
const ledgerFor = (file) =>
  freshnessBaseline && typeof freshnessBaseline[file] === "string" ? freshnessBaseline[file] : null;

let freshnessViolations = 0;
for (const [file, f] of freshnessByDoc) {
  const ledgered = ledgerFor(file);
  if (f.state === "fresh") {
    if (ledgered === null) continue; // fresh and unledgered — the good case
    freshnessViolations += 1;
    console.error(
      `docs-claims-check: ${file}: ledgered as stale but now fresh at ${JSON.stringify(f.verified)} — ` +
        `remove the entry from doc-freshness-baseline.json`,
    );
    continue;
  }
  if (f.state === "stale" && ledgered === f.verified) continue; // the one known-stale pass
  freshnessViolations += 1;
  if (f.state === "stale" && ledgered === null) {
    console.error(
      `docs-claims-check: ${file}: "verified_at_commit" ${JSON.stringify(f.verified)} is stale — ` +
        `its governs globs last changed at ${shortSha(f.last)}; re-verify and restamp, or ledger it ` +
        `deliberately in doc-freshness-baseline.json`,
    );
  } else if (f.state === "stale") {
    console.error(
      `docs-claims-check: ${file}: stale at ${JSON.stringify(f.verified)} but ledgered at ` +
        `${JSON.stringify(ledgered)} — refresh the doc or move the ledger entry deliberately`,
    );
  } else {
    console.error(
      `docs-claims-check: ${file}: "verified_at_commit" ${JSON.stringify(f.verified)} does not ` +
        `resolve to a commit`,
    );
  }
}
if (freshnessBaseline) {
  for (const file of Object.keys(freshnessBaseline)) {
    if (freshnessByDoc.has(file)) continue;
    freshnessViolations += 1;
    console.error(
      `docs-claims-check: doc-freshness-baseline.json: entry for ${JSON.stringify(file)} dangles — ` +
        `no tracked doc carries a verified_at_commit; remove it`,
    );
  }
}

if (drift === 0 && freshnessViolations === 0) {
  const ledgeredStale = [...freshnessByDoc.entries()].filter(
    ([file, f]) => f.state === "stale" && ledgerFor(file) === f.verified,
  ).length;
  console.log(
    `docs-claims-check: OK — ${governedHits} marked claim(s) match derived values; ` +
      `${freshnessByDoc.size} verified stamp(s) fresh or ledgered (${ledgeredStale} ledgered stale).`,
  );
  process.exit(0);
}

if (FIX) {
  if (drift > 0) console.log(`docs-claims-check: fixed ${drift} stale claim(s).`);
  if (freshnessViolations > 0) {
    console.error(
      `docs-claims-check: ${freshnessViolations} freshness violation(s) remain — ` +
        `verified_at_commit stamps are not auto-fixable; refresh the doc and restamp deliberately.`,
    );
  }
  if (drift > 0 && freshnessViolations === 0) process.exit(0);
}

console.error(
  `\ndocs-claims-check: ${drift + freshnessViolations} stale claim(s)/stamp(s). ` +
    `Run \`node scripts/docs-claims-check.mjs --fix\` for marked values, or edit the doc.`,
);
process.exit(1);
