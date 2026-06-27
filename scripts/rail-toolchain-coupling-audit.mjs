#!/usr/bin/env node
// RAIL-NATIVE-TOOLCHAIN-RECON-01 — MEASUREMENT ONLY.
//
// Enumerates every admission-rail / CI site that decides whether a generated
// target is "admitted", and classifies each by how coupled it is to the
// TypeScript toolchain (tsc / vitest / pnpm package scripts). The point of the
// recon is to find what a non-TS target (Kotlin/Compose, Swift) cannot satisfy
// today, so the rail can be made toolchain-polymorphic — a target supplies its
// own admission descriptor through a stable interface instead of the rail
// hardcoding each target's idiosyncrasies.
//
// This script is a PURE READ-ONLY FUNCTION of the repo: filesystem reads only,
// no clock, no network, no randomness. Re-running it on the same tree produces
// byte-identical output. It derives its facts by reading the live rail/CI
// sources (not a hardcoded copy), so it stays honest as those sources change.
//
//   node scripts/rail-toolchain-coupling-audit.mjs           # human report
//   node scripts/rail-toolchain-coupling-audit.mjs --json    # machine output
//   node scripts/rail-toolchain-coupling-audit.mjs --check    # self-consistency gate (exit 1 on drift)

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

// Classification buckets.
const TS_COUPLED = "TS-TOOLCHAIN-COUPLED";
const AGNOSTIC = "LANGUAGE-AGNOSTIC";
const POLYMORPHIC = "ALREADY-POLYMORPHIC";
const UNCLASSIFIED = "unclassified";

/** Read a repo-relative file; never throws — returns "" so an absent file
 *  surfaces as a missing site rather than crashing the audit. */
function read(rel) {
  try {
    return readFileSync(join(REPO_ROOT, rel), "utf8");
  } catch {
    return "";
  }
}

/** 1-based line number of the first line matching `re`, or null. */
function lineOf(text, re) {
  const lines = text.split("\n");
  for (let i = 0; i < lines.length; i++) {
    if (re.test(lines[i])) return i + 1;
  }
  return null;
}

/** Every 1-based line number whose content matches `re`. */
function linesMatching(text, re) {
  const out = [];
  const lines = text.split("\n");
  for (let i = 0; i < lines.length; i++) {
    if (re.test(lines[i])) out.push(i + 1);
  }
  return out;
}

const sites = [];
function site(entry) {
  sites.push({ classification: UNCLASSIFIED, ...entry });
}

// ── Source 1: the FrameworkId union (validation/types.ts) ───────────────────
// Rail membership gate. A target must be a FrameworkId to be tracked by
// PLANS_BY_ID, the manifest record, and required-mode iteration. This is a
// closed string-literal union — a Kotlin target cannot join without editing it.
const typesSrc = read("packages/ds-codegen/src/validation/types.ts");
const frameworkIdMembers = (() => {
  const m = typesSrc.match(/export type FrameworkId =([\s\S]*?);/);
  if (!m) return [];
  return [...m[1].matchAll(/"([^"]+)"/g)].map((x) => x[1]);
})();
site({
  surface: "FrameworkId union",
  file: "packages/ds-codegen/src/validation/types.ts",
  line: lineOf(typesSrc, /export type FrameworkId =/),
  detail: `closed string-literal union of ${frameworkIdMembers.length} members: ${frameworkIdMembers.join(", ")}`,
  classification: TS_COUPLED,
  why: "Closed union; non-member targets are invisible to every rail surface keyed by FrameworkId (PLANS_BY_ID, COMPONENT_TREES, manifest Record, FRAMEWORK_RANK). figma is deliberately NOT a member — the rail-excluded precedent.",
});

// ── Source 2: PlanCommand argv shape (validation/types.ts) ──────────────────
// The one structurally-neutral seam: command is `readonly [string, ...string[]]`,
// so ["./gradlew","compileKotlin"] is already type-legal. The coupling is
// convention (every plan fills it with pnpm), not type.
site({
  surface: "PlanCommand.command argv tuple",
  file: "packages/ds-codegen/src/validation/types.ts",
  line: lineOf(typesSrc, /command:\s*readonly \[string, \.\.\.string\[\]\]/),
  detail: "argv is `readonly [string, ...string[]]` — accepts any executable, not just pnpm",
  classification: POLYMORPHIC,
  why: "Structurally toolchain-neutral. This is the existing seam to lean on: a Gradle/xcodebuild argv is already valid here. Only the convention (all six plans use pnpm) is TS-shaped.",
});

// ── Source 3: PLANS_BY_ID + DEFAULT_FRAMEWORKS (validate-cli.ts) ─────────────
const cliSrc = read("packages/ds-codegen/src/validation/validate-cli.ts");
const plansById = (() => {
  const m = cliSrc.match(/PLANS_BY_ID[^=]*=\s*{([\s\S]*?)};/);
  if (!m) return [];
  return [...m[1].matchAll(/(?:"([^"]+)"|(\w[\w-]*)):/g)].map((x) => x[1] || x[2]);
})();
site({
  surface: "PLANS_BY_ID registry",
  file: "packages/ds-codegen/src/validation/validate-cli.ts",
  line: lineOf(cliSrc, /PLANS_BY_ID/),
  detail: `${plansById.length} plans wired: ${plansById.join(", ")} (figma's plan file exists but is NOT imported here)`,
  classification: TS_COUPLED,
  why: "Hardcoded Record<FrameworkId, plan>. New targets require a code edit here; no data-driven plan discovery exists.",
});

// ── Source 4: each per-framework validation plan command argv ───────────────
// Read the live plan files and extract the executable each shells out to.
const planFiles = [
  "react", "vue", "svelte", "lit", "angular", "react-native", "figma",
].map((fw) => ({ fw, rel: `packages/ds-codegen/src/validation/frameworks/${fw}.ts` }));

for (const { fw, rel } of planFiles) {
  const src = read(rel);
  if (!src) continue;
  // Collect the executable (argv[0]) of every `command: [ ... ]`.
  const argv0s = [...src.matchAll(/command:\s*\[\s*"([^"]+)"/g)].map((m) => m[1]);
  const exts = [...src.matchAll(/extensions:\s*\[([^\]]*)\]/g)]
    .flatMap((m) => [...m[1].matchAll(/"([^"]+)"/g)].map((x) => x[1]));
  // A plan is TS-toolchain-coupled iff every command shells out to `pnpm`
  // (i.e. a pnpm-workspace package script: tsc / vitest / vue-tsc /
  // svelte-check). The scope extensions (.ts/.tsx/.vue/.svelte/.json) are all
  // TS-toolchain source/SFC extensions — none is a Kotlin/Swift source file, so
  // the .vue/.svelte cases are no less coupled than the plain-.ts ones. The
  // coupling is the `pnpm`-package-script invocation, not the exact extension.
  const allPnpm = argv0s.length > 0 && argv0s.every((a) => a === "pnpm");
  site({
    surface: `${fw} validation plan command(s)`,
    file: rel,
    line: lineOf(src, /command:/),
    detail: `argv[0]=${[...new Set(argv0s)].join("|") || "none"}; scope.extensions={${[...new Set(exts)].join(",") || "none"}}`,
    classification: allPnpm ? TS_COUPLED : (argv0s.length ? UNCLASSIFIED : AGNOSTIC),
    why: allPnpm
      ? "Every command shells out to `pnpm --filter <pkg> run <script>` (tsc/vitest/vue-tsc/svelte-check). The scope extensions are all TS-toolchain source/SFC extensions. A Kotlin/Swift package has no pnpm script and no such extension — this lane cannot run against it."
      : "No pnpm-shaped command detected; re-inspect.",
  });
}

// ── Source 5: COMPONENT_TREES (required-mode.ts) ────────────────────────────
const reqSrc = read("packages/ds-codegen/src/validation/required-mode.ts");
const componentTrees = [...reqSrc.matchAll(/framework:\s*"([^"]+)",\s*relPath:\s*"([^"]+)"/g)].map((m) => m[2]);
site({
  surface: "COMPONENT_TREES (untracked-generated walk)",
  file: "packages/ds-codegen/src/validation/required-mode.ts",
  line: lineOf(reqSrc, /COMPONENT_TREES/),
  detail: `${componentTrees.length} trees, all packages/ds-*/src/components; FrameworkId-typed`,
  classification: AGNOSTIC,
  why: "The WALK (presence + byte-stability of a generated tree) is language-agnostic — it works on .kt as well as .tsx. The only coupling is the FrameworkId TYPE on each entry, not the check itself. The in-code comment already frames it as data 'so a future framework addition flows through'.",
});

// ── Source 6: GENERATED_TREE_PREFIXES (git-range-scope.ts) ──────────────────
const grsSrc = read("packages/ds-codegen/src/validation/git-range-scope.ts");
const prefixes = [...grsSrc.matchAll(/prefix:\s*"([^"]+)"/g)].map((m) => m[1]);
site({
  surface: "GENERATED_TREE_PREFIXES (reviewer git-range projection)",
  file: "packages/ds-codegen/src/validation/git-range-scope.ts",
  line: lineOf(grsSrc, /GENERATED_TREE_PREFIXES/),
  detail: `${prefixes.length} prefixes; FrameworkId-typed`,
  classification: AGNOSTIC,
  why: "Path-prefix projection over a diff range; language-neutral. Coupling is the FrameworkId type only.",
});

// ── Source 7: FRAMEWORK_RANK (markdown-report.ts) ───────────────────────────
const mdSrc = read("packages/ds-codegen/src/validation/markdown-report.ts");
site({
  surface: "FRAMEWORK_RANK (report ordering)",
  file: "packages/ds-codegen/src/validation/markdown-report.ts",
  line: lineOf(mdSrc, /FRAMEWORK_RANK/),
  detail: "Record<FrameworkId, number>; every FrameworkId needs a rank or report ordering throws",
  classification: TS_COUPLED,
  why: "Keyed by FrameworkId. Cosmetic, but a non-member target with no rank entry breaks the sort — another edit-site gated on union membership.",
});

// ── Source 8: CI + pre-push generated-tree git-diff lists ───────────────────
for (const [label, rel] of [
  ["CI workflow", ".github/workflows/ci.yml"],
  ["pre-push hook", ".githooks/pre-push"],
]) {
  const src = read(rel);
  const diffLine = lineOf(src, /git diff --exit-code/);
  const treeLines = linesMatching(src, /packages\/ds-[a-z-]+\/src/);
  site({
    surface: `${label} generated-tree git-diff`,
    file: rel,
    line: diffLine,
    detail: `git diff --exit-code over ${treeLines.length} hardcoded ds-*/src paths`,
    classification: AGNOSTIC,
    why: "Byte-stability is language-agnostic: `git diff --exit-code` over a .kt tree works identically. Adding a Compose tree here is a one-line edit, not a toolchain problem. (Note: figma's generated tree is already absent from this list, so a non-listed generated target is not unprecedented.)",
  });
}

// ── Source 9: root package.json typecheck:* / test:* aggregators ────────────
const pkgSrc = read("package.json");
const pkg = JSON.parse(pkgSrc || "{}");
const scripts = pkg.scripts || {};
for (const aggregate of ["typecheck:all", "test:frameworks"]) {
  const body = scripts[aggregate] || "";
  const allTs = /pnpm run|pnpm --filter|tsc|vitest/.test(body) && !/gradle|xcodebuild|swift/.test(body);
  site({
    surface: `package.json scripts.${aggregate}`,
    file: "package.json",
    line: lineOf(pkgSrc, new RegExp(`"${aggregate.replace(/[:]/g, "[:]")}"`)),
    detail: `chains ${(body.match(/&&/g) || []).length + 1} TS package scripts via &&; body: ${body.slice(0, 80)}…`,
    classification: allTs ? TS_COUPLED : UNCLASSIFIED,
    why: "An `&&`-chain of pnpm TS package scripts (tsc/vitest). There is no slot for `./gradlew compileKotlin` — a Kotlin target's compile/test would need a parallel aggregator outside this chain.",
  });
}

// ── Report ──────────────────────────────────────────────────────────────────
const summary = {
  [TS_COUPLED]: sites.filter((s) => s.classification === TS_COUPLED).length,
  [AGNOSTIC]: sites.filter((s) => s.classification === AGNOSTIC).length,
  [POLYMORPHIC]: sites.filter((s) => s.classification === POLYMORPHIC).length,
  [UNCLASSIFIED]: sites.filter((s) => s.classification === UNCLASSIFIED).length,
};

const result = { frameworkIdMembers, plansById, summary, sites };

// ── --check self-consistency gate ───────────────────────────────────────────
if (process.argv.includes("--check")) {
  const problems = [];
  const RAIL_ADMITTED = ["react", "vue", "svelte", "lit", "angular", "react-native"];
  const got = [...frameworkIdMembers].sort();
  const want = [...RAIL_ADMITTED].sort();
  if (JSON.stringify(got) !== JSON.stringify(want)) {
    problems.push(`FrameworkId union drifted: expected ${want.join(",")}, got ${got.join(",")}`);
  }
  // figma must be rail-EXCLUDED: its plan file exists but it is NOT in PLANS_BY_ID.
  const figmaPlanExists = read("packages/ds-codegen/src/validation/frameworks/figma.ts").length > 0;
  if (!figmaPlanExists) problems.push("figma plan file missing — expected it to exist as the rail-excluded precedent");
  if (plansById.includes("figma")) problems.push("figma unexpectedly wired into PLANS_BY_ID — the generate-admitted-but-rail-excluded asymmetry changed");
  if (frameworkIdMembers.includes("figma")) problems.push("figma unexpectedly a FrameworkId member");
  for (const native of ["jetpack-compose", "swiftui"]) {
    if (frameworkIdMembers.includes(native)) problems.push(`${native} unexpectedly admitted to the rail (FrameworkId) — recon premise (no non-TS toolchain) changed`);
  }
  if (summary[UNCLASSIFIED] > 0) {
    problems.push(`${summary[UNCLASSIFIED]} site(s) unclassified — every admission site must land in a bucket`);
  }
  if (problems.length) {
    console.error("rail-toolchain-coupling-audit --check FAILED:");
    for (const p of problems) console.error("  - " + p);
    process.exit(1);
  }
  console.error("rail-toolchain-coupling-audit --check OK: 6 rail-admitted FrameworkIds, figma rail-excluded, no native target admitted, all sites classified.");
  process.exit(0);
}

if (process.argv.includes("--json")) {
  console.log(JSON.stringify(result, null, 2));
  process.exit(0);
}

// Human-readable report.
const lines = [];
lines.push("# Admission-rail toolchain-coupling audit (RAIL-NATIVE-TOOLCHAIN-RECON-01)");
lines.push("");
lines.push(`FrameworkId members (rail-admitted): ${frameworkIdMembers.join(", ")}`);
lines.push(`PLANS_BY_ID wired:                   ${plansById.join(", ")}`);
lines.push(`figma:                               generate-admitted but rail-EXCLUDED (plan file exists, not in PLANS_BY_ID)`);
lines.push("");
lines.push(`Summary: ${summary[TS_COUPLED]} TS-coupled | ${summary[AGNOSTIC]} language-agnostic | ${summary[POLYMORPHIC]} already-polymorphic | ${summary[UNCLASSIFIED]} unclassified`);
lines.push("");
for (const bucket of [TS_COUPLED, UNCLASSIFIED, AGNOSTIC, POLYMORPHIC]) {
  const inBucket = sites.filter((s) => s.classification === bucket);
  if (!inBucket.length) continue;
  lines.push(`## ${bucket} (${inBucket.length})`);
  for (const s of inBucket) {
    lines.push(`- ${s.surface}  [${s.file}:${s.line ?? "?"}]`);
    lines.push(`    ${s.detail}`);
    lines.push(`    why: ${s.why}`);
  }
  lines.push("");
}
console.log(lines.join("\n"));
