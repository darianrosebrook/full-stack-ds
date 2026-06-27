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
// DESCRIPTOR-DRIVEN: the site no longer holds a per-framework literal — it
// derives from the admission-descriptor registry (single source of truth). The
// coupling did not vanish (the registry is still a TS file binding pnpm plans),
// but it is consolidated to ONE edit-site instead of spread across N modules.
// RAIL-ADMISSION-DESCRIPTOR-INTERFACE-01 added this bucket; sites move out of
// TS_COUPLED into it as parallel literals collapse into the registry.
const DESCRIPTOR_DRIVEN = "DESCRIPTOR-DRIVEN";
// NON-TS-TOOLCHAIN-LANE: a rail participant whose compile command is NOT pnpm —
// the first proof the rail admits a non-TS toolchain. Added by
// RAIL-NATIVE-COMPILE-LANE-COMPOSE-SMOKE-03 (the ds-compose-smoke Kotlin lane).
const NATIVE_LANE = "NON-TS-TOOLCHAIN-LANE";
const UNCLASSIFIED = "unclassified";

/** True if a constant is assigned from an admission-descriptor helper call
 *  (e.g. `= admissionPlansById()`), i.e. derived rather than hand-listed. */
function isDescriptorDerived(text, constName) {
  const re = new RegExp(
    `${constName}[^=]*=\\s*admission[A-Za-z]*\\(\\)|${constName}[^=]*=\\s*ADMITTED_FRAMEWORKS`,
  );
  return re.test(text);
}

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

// ── Source 2.5: the admission-descriptor registry (now aggregator/validator) ─
// Slice 1 collapsed five parallel literals into one central registry. Slice 2
// (RAIL-TARGET-SELF-DECLARED-DESCRIPTOR-02) moved AUTHORSHIP out of that
// registry into each target module: the registry now imports the six
// self-declared descriptors and only aggregates + validates them. The
// authorship sites are the six frameworks/<fw>.ts modules (Source 4b below);
// the registry is an adjudicator, not an author.
const RAIL_TARGETS = ["react", "vue", "svelte", "lit", "angular", "react-native"];
const descSrc = read("packages/ds-codegen/src/validation/admission-descriptor.ts");
// The registry aggregates a list of self-declared descriptors. Its ids are the
// imported `<fw>AdmissionDescriptor` symbols, not an inline object literal.
const descriptorIds = (() => {
  const m = descSrc.match(/SELF_DECLARED_DESCRIPTORS[^=]*=\s*\[([\s\S]*?)\];/);
  if (!m) return [];
  // import symbols like `reactAdmissionDescriptor`, `reactNativeAdmissionDescriptor`
  const syms = [...m[1].matchAll(/(\w+)AdmissionDescriptor/g)].map((x) => x[1]);
  // Map camelCase symbol stems back to ids (reactNative -> react-native).
  return syms.map((s) => s.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`));
})();
const plansById = descriptorIds;
// The registry holds NO inline target facts now. Confirm that — if it does,
// authorship leaked back to the center (an ownership-regression).
// Inline fact-authoring ANYWHERE in the registry module is an ownership leak,
// regardless of where it sits relative to ADMISSION_DESCRIPTORS. The type
// DEFINITION uses `outputTreeRelPath: string` / `reportRank: number` (no value
// literal), so matching a STRING/NUMBER VALUE literal (`: "packages/..."`,
// `reportRank: 0`) catches authored facts without false-positiving the type.
const registryHasInlineFacts =
  /outputTreeRelPath:\s*"/.test(descSrc) ||
  /reportRank:\s*\d/.test(descSrc) ||
  /sourceExtensions:\s*\[\s*"/.test(descSrc);
site({
  surface: "AdmissionDescriptor registry (aggregator/validator)",
  file: "packages/ds-codegen/src/validation/admission-descriptor.ts",
  line: lineOf(descSrc, /ADMISSION_DESCRIPTORS/),
  detail: registryHasInlineFacts
    ? `STILL AUTHORS inline target facts (ownership regression) — ${descriptorIds.length} ids`
    : `aggregates ${descriptorIds.length} self-declared descriptors: ${descriptorIds.join(", ")}; authors no per-target facts (validates id↔plan, coverage, contiguous ranks)`,
  classification: registryHasInlineFacts ? TS_COUPLED : DESCRIPTOR_DRIVEN,
  why: registryHasInlineFacts
    ? "The registry re-authored target facts inline — slice-2 ownership migration regressed."
    : "Post-slice-2: the registry imports the six target-declared descriptors and only aggregates/validates them. It is no longer an authorship site; it is the rail's adjudicator. The pnpm-bound plans now live in each target module.",
});

// ── Source 3: PLANS_BY_ID + DEFAULT_FRAMEWORKS (validate-cli.ts) ─────────────
const cliSrc = read("packages/ds-codegen/src/validation/validate-cli.ts");
const plansDerived = isDescriptorDerived(cliSrc, "PLANS_BY_ID");
site({
  surface: "PLANS_BY_ID + DEFAULT_FRAMEWORKS (validate-cli)",
  file: "packages/ds-codegen/src/validation/validate-cli.ts",
  line: lineOf(cliSrc, /PLANS_BY_ID/),
  detail: plansDerived
    ? "derived from the descriptor registry (admissionPlansById() / ADMITTED_FRAMEWORKS) — no parallel literal"
    : "hardcoded Record<FrameworkId, plan> literal",
  classification: plansDerived ? DESCRIPTOR_DRIVEN : TS_COUPLED,
  why: plansDerived
    ? "No longer a parallel literal; the per-framework binding lives once in the descriptor registry. This module just consumes the derivation."
    : "Hardcoded Record<FrameworkId, plan>. New targets require a code edit here; no data-driven plan discovery exists.",
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

// ── Source 4b: self-declared descriptor authorship (one per target module) ───
// Slice 2 ownership oracle: each rail target must author its admission facts in
// its OWN module (outputTreeRelPath / sourceExtensions / reportRank on a
// `<fw>AdmissionDescriptor`), and figma must NOT. This is the property the slice
// is judged by — authorship location, not a count.
const ownershipFindings = [];
for (const fw of [...RAIL_TARGETS, "figma"]) {
  const rel = `packages/ds-codegen/src/validation/frameworks/${fw}.ts`;
  const src = read(rel);
  const declaresDescriptor = /export const \w+AdmissionDescriptor\s*:/.test(src);
  const authorsFacts =
    /AdmissionDescriptor\s*=\s*{[\s\S]*?outputTreeRelPath:\s*"/.test(src) &&
    /reportRank:\s*\d/.test(src);
  if (fw === "figma") {
    // figma is the rail-excluded precedent: it must NOT self-declare an admitted descriptor.
    ownershipFindings.push({ fw, declaresDescriptor, authorsFacts, expectedToDeclare: false });
    continue;
  }
  ownershipFindings.push({ fw, declaresDescriptor, authorsFacts, expectedToDeclare: true });
  site({
    surface: `${fw} self-declared admission descriptor`,
    file: rel,
    line: lineOf(src, /AdmissionDescriptor\s*=/),
    detail: declaresDescriptor && authorsFacts
      ? "authors its own outputTreeRelPath/sourceExtensions/reportRank beside its plan"
      : "MISSING self-declared descriptor (ownership not migrated to the target module)",
    classification: declaresDescriptor && authorsFacts ? DESCRIPTOR_DRIVEN : TS_COUPLED,
    why: declaresDescriptor && authorsFacts
      ? "Slice-2 end state: the target module is the single authorship site for its admission facts. The central registry only aggregates this."
      : "Target facts are not authored in the target module — ownership migration incomplete.",
  });
}

// ── Source 4c: native compile lane (the first non-pnpm rail compile command) ─
// Slice 3 (RAIL-NATIVE-COMPILE-LANE-COMPOSE-SMOKE-03): the ds-compose-smoke
// lane proves the rail can admit a non-TS toolchain. Its compile command is run
// by run-native-compile-lane.mjs and provisioned in the native-compile-rail CI
// job. This is the one site that is admitted to the rail WITHOUT a pnpm command.
const laneJson = read("packages/ds-compose-smoke/compile-lane.json");
const laneRunner = read("scripts/run-native-compile-lane.mjs");
const ciYml = read(".github/workflows/ci.yml");
const nativeLanePresent = laneJson.length > 0 && laneRunner.length > 0;
const laneToolchain = (() => {
  const m = laneJson.match(/"toolchain":\s*"([^"]+)"/);
  return m ? m[1] : "unknown";
})();
// The lane's compile command must NOT be pnpm. The runner spawns a compiler
// (kotlinc); a pnpm reintroduction here would mean the "non-TS lane" collapsed
// back to the TS toolchain.
const laneUsesPnpm = /spawnSync\(\s*["']pnpm/.test(laneRunner) || /command\s*=\s*\[\s*["']pnpm/.test(laneRunner);
const laneInCi = /native-compile-rail/.test(ciYml) && /run-native-compile-lane\.mjs/.test(ciYml);
if (nativeLanePresent) {
  site({
    surface: "ds-compose-smoke native compile lane",
    file: "scripts/run-native-compile-lane.mjs",
    line: lineOf(laneRunner, /spawnSync/),
    detail: laneUsesPnpm
      ? "REGRESSION: native lane reintroduced a pnpm command"
      : `non-pnpm ${laneToolchain} compile command; CI-wired=${laneInCi}; positive+negative passes`,
    classification: laneUsesPnpm ? TS_COUPLED : NATIVE_LANE,
    why: laneUsesPnpm
      ? "The native lane is supposed to run a non-pnpm compiler; a pnpm command here means the non-TS lane collapsed back to the TS toolchain."
      : "First non-pnpm rail compile command. The rail runner spawns a Kotlin compiler and binds its exit code — proving toolchain-polymorphic admission without a pnpm/tsc assumption. It is a RailTargetId, NOT a FrameworkId, and admits no component.",
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
const rankDerived = isDescriptorDerived(mdSrc, "FRAMEWORK_RANK");
site({
  surface: "FRAMEWORK_RANK (report ordering)",
  file: "packages/ds-codegen/src/validation/markdown-report.ts",
  line: lineOf(mdSrc, /FRAMEWORK_RANK/),
  detail: rankDerived
    ? "derived from the descriptor registry (admissionFrameworkRank()) — no parallel literal"
    : "Record<FrameworkId, number>; every FrameworkId needs a rank or report ordering throws",
  classification: rankDerived ? DESCRIPTOR_DRIVEN : TS_COUPLED,
  why: rankDerived
    ? "No longer a parallel literal; each target's reportRank lives once on its descriptor. This module consumes the derivation."
    : "Keyed by FrameworkId. Cosmetic, but a non-member target with no rank entry breaks the sort — another edit-site gated on union membership.",
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
  [DESCRIPTOR_DRIVEN]: sites.filter((s) => s.classification === DESCRIPTOR_DRIVEN).length,
  [NATIVE_LANE]: sites.filter((s) => s.classification === NATIVE_LANE).length,
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
  // figma must be rail-EXCLUDED: its plan file exists but it is NOT in the
  // descriptor registry (the post-slice-1 source of the admitted plan set).
  const figmaPlanExists = read("packages/ds-codegen/src/validation/frameworks/figma.ts").length > 0;
  if (!figmaPlanExists) problems.push("figma plan file missing — expected it to exist as the rail-excluded precedent");
  if (plansById.includes("figma")) problems.push("figma unexpectedly in the admission-descriptor registry — the generate-admitted-but-rail-excluded asymmetry changed");
  if (frameworkIdMembers.includes("figma")) problems.push("figma unexpectedly a FrameworkId member");
  for (const native of ["jetpack-compose", "swiftui"]) {
    if (frameworkIdMembers.includes(native)) problems.push(`${native} unexpectedly admitted to the rail (FrameworkId) — recon premise (no non-TS toolchain) changed`);
  }
  if (summary[UNCLASSIFIED] > 0) {
    problems.push(`${summary[UNCLASSIFIED]} site(s) unclassified — every admission site must land in a bucket`);
  }
  // ── Slice-2 ownership invariants (the property this slice is judged by) ────
  // 1. Every rail target self-declares its facts in its own module; figma must not.
  for (const f of ownershipFindings) {
    if (f.expectedToDeclare && !(f.declaresDescriptor && f.authorsFacts)) {
      problems.push(`${f.fw} does not self-declare its admission descriptor in its own module — ownership not migrated`);
    }
    if (!f.expectedToDeclare && f.declaresDescriptor) {
      problems.push(`figma self-declares an admission descriptor — it must stay the rail-excluded precedent`);
    }
  }
  // 2. Each target fact has exactly ONE authorship site: the central registry
  //    must NOT re-author inline facts (that would be ownership leaking back).
  if (registryHasInlineFacts) {
    problems.push("admission-descriptor.ts still authors inline per-target facts — authorship leaked back to the center (slice-2 regression)");
  }
  // 3. The consumer modules must NOT re-author a target fact (e.g. a path
  //    prefix or rank literal). They derive; they do not author.
  for (const [name, rel] of [
    ["required-mode", "packages/ds-codegen/src/validation/required-mode.ts"],
    ["git-range-scope", "packages/ds-codegen/src/validation/git-range-scope.ts"],
    ["markdown-report", "packages/ds-codegen/src/validation/markdown-report.ts"],
    ["validate-cli", "packages/ds-codegen/src/validation/validate-cli.ts"],
  ]) {
    const csrc = read(rel);
    // A re-authored generated-tree path literal in a consumer is the smell.
    if (/(?:relPath|prefix):\s*"packages\/ds-/.test(csrc)) {
      problems.push(`${name} re-authors a generated-tree path literal — target facts must live only in the target module`);
    }
  }
  // ── Slice-3 native-lane invariants (compile-admission, not framework admission) ─
  if (nativeLanePresent) {
    // 1. The native lane must run a NON-pnpm compile command.
    if (laneUsesPnpm) {
      problems.push("native compile lane reintroduced a pnpm command — the non-TS lane collapsed back to the TS toolchain");
    }
    // 2. It must be CI-wired (the compile only earns admission if CI runs it).
    if (!laneInCi) {
      problems.push("native compile lane is not wired into CI (native-compile-rail job missing) — an un-run compile proves nothing");
    }
    // 3. It must NOT have become an admitted framework: no FrameworkId, not in
    //    the descriptor registry, no fsds.targets.json entry. compose-smoke is a
    //    RailTargetId compile lane, not a generated Compose target.
    if (frameworkIdMembers.includes("compose-smoke")) {
      problems.push("compose-smoke leaked into FrameworkId — it must stay a RailTargetId compile lane, not an admitted framework");
    }
    if (plansById.includes("compose-smoke")) {
      problems.push("compose-smoke leaked into the admission-descriptor registry — the smoke lane must not be an admitted framework");
    }
    const targetsJson = read("fsds.targets.json");
    if (/jetpack-compose|compose-smoke/.test(targetsJson)) {
      problems.push("fsds.targets.json gained a Compose entry — slice 3 admits a compile lane, NOT a generated Compose target");
    }
  }
  if (problems.length) {
    console.error("rail-toolchain-coupling-audit --check FAILED:");
    for (const p of problems) console.error("  - " + p);
    process.exit(1);
  }
  const laneNote = nativeLanePresent
    ? ` one non-pnpm ${laneToolchain} compile lane admitted (compose-smoke, not a framework);`
    : "";
  console.error(
    `rail-toolchain-coupling-audit --check OK: 6 rail-admitted FrameworkIds self-declare; figma rail-excluded; registry aggregates without authoring; consumers derive;${laneNote} no native FRAMEWORK target admitted; all sites classified.`,
  );
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
lines.push(`Admission descriptors registered:    ${plansById.join(", ")}`);
lines.push(`figma:                               generate-admitted but rail-EXCLUDED (plan file exists, not in the descriptor registry)`);
lines.push("");
lines.push(`Summary: ${summary[TS_COUPLED]} TS-coupled | ${summary[DESCRIPTOR_DRIVEN]} descriptor-driven | ${summary[NATIVE_LANE]} non-TS-toolchain-lane | ${summary[AGNOSTIC]} language-agnostic | ${summary[POLYMORPHIC]} already-polymorphic | ${summary[UNCLASSIFIED]} unclassified`);
lines.push("");
for (const bucket of [TS_COUPLED, UNCLASSIFIED, NATIVE_LANE, DESCRIPTOR_DRIVEN, AGNOSTIC, POLYMORPHIC]) {
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
