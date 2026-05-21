/**
 * Required-mode verifier
 * (CODEGEN-RAIL-ARTIFACT-MANIFEST-REQUIRED-CI-01).
 *
 * Doctrine: Once artifact attribution is available, governed
 * admission must not silently degrade to unattributed workspace
 * admission in CI.
 *
 * This module verifies the manifest's claims about emitted
 * artifacts against the actual on-disk state, producing typed
 * RailDiagnostic records. The verifier itself never throws and
 * never fails the rail directly; it returns a list of diagnostics
 * for the caller (validate-cli) to act on according to the
 * invocation mode.
 *
 * Eight distinct failure modes are surfaced as distinct codes so
 * CI pipelines can grep by code:
 *
 *   1. RAIL_REQUIRE_MANIFEST_MISSING
 *      No manifest file on disk. Other checks meaningless;
 *      short-circuits.
 *
 *   2. RAIL_REQUIRE_MANIFEST_MALFORMED
 *      Manifest exists but cannot be consumed: JSON parse
 *      failure, read error, or structurally-broken body even
 *      when schemaVersion matches. Other checks meaningless;
 *      short-circuits. Operator repair is the same as MISSING
 *      (regenerate) but the evidence state is distinct.
 *
 *   3. RAIL_REQUIRE_MANIFEST_SCHEMA_MISMATCH
 *      Manifest's `schemaVersion` is not the version this rail
 *      consumes. Other checks meaningless; short-circuits.
 *
 *   4. RAIL_REQUIRE_MANIFEST_MISSING_PATHS
 *      Manifest claims paths that do not exist on disk.
 *
 *   5. RAIL_REQUIRE_MANIFEST_UNTRACKED_GENERATED_PATHS
 *      On-disk files containing the `@generated:start` marker
 *      under any `packages/ds-{framework}/src/components/**` tree
 *      are NOT in the manifest. Catches partial-target manifests.
 *
 *   6. RAIL_REQUIRE_MANIFEST_HASH_MISMATCH
 *      Paths exist in both manifest and on-disk, but the on-disk
 *      sha256 differs from the manifest's recorded digest.
 *
 *   7. RAIL_REQUIRE_MANIFEST_CONTRACT_MISSING
 *      (CODEGEN-RAIL-CONTRACT-PROVENANCE-01) A manifest group
 *      names a contract file that does not exist on disk.
 *
 *   8. RAIL_REQUIRE_MANIFEST_CONTRACT_HASH_MISMATCH
 *      (CODEGEN-RAIL-CONTRACT-PROVENANCE-01) A manifest group's
 *      contract is on disk but its sha256 has drifted — the
 *      contract was edited without a regenerate.
 *
 * Hash and path checks run together; one failure mode does not
 * suppress the others (unless MISSING / MALFORMED / SCHEMA_MISMATCH
 * already short-circuited). Contract integrity is checked
 * independently of output integrity so a closure note can cite
 * which side of the source→artifact attribution drifted.
 */
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import {
  EMISSION_MANIFEST_SCHEMA_VERSION,
  type EmissionManifest,
  type FrameworkId,
  type RailDiagnostic,
} from "./types.js";

/** What `readEmissionManifestIfPresent` may return. */
export type ManifestReadResult =
  | { kind: "absent" }
  | { kind: "schema_mismatch"; foundVersion: unknown }
  | { kind: "parse_error"; message: string }
  | { kind: "ok"; manifest: EmissionManifest };

/**
 * Frameworks whose `src/components` tree is walked for the
 * untracked-generated check. Mirrors the FrameworkId union; kept
 * here as data so a future framework addition flows through both
 * the rail and the verifier.
 */
const COMPONENT_TREES: ReadonlyArray<{ framework: FrameworkId; relPath: string }> = [
  { framework: "react", relPath: "packages/ds-react/src/components" },
  { framework: "vue", relPath: "packages/ds-vue/src/components" },
  { framework: "svelte", relPath: "packages/ds-svelte/src/components" },
  { framework: "lit", relPath: "packages/ds-lit/src/components" },
  { framework: "angular", relPath: "packages/ds-angular/src/components" },
];

/** The marker token an emitted file must contain to be considered "generated". */
const GENERATED_MARKER = "@generated:start";

/**
 * Run all required-mode checks. Returns diagnostics in declaration
 * order; an empty list means the manifest is consistent with
 * on-disk state under the current schema version.
 *
 * `workspaceRoot` is the directory the manifest's POSIX paths are
 * relative to (the repo root for validate-cli invocations).
 */
export function verifyManifestAgainstDisk(
  manifestRead: ManifestReadResult,
  workspaceRoot: string,
): RailDiagnostic[] {
  // Short-circuit cases: manifest missing or schema-mismatched
  // make all other checks meaningless.
  if (manifestRead.kind === "absent") {
    return [
      {
        code: "RAIL_REQUIRE_MANIFEST_MISSING",
        message:
          "The emission manifest is required in this mode but was not found on disk. " +
          "Repair: run `pnpm run generate -- --target=all` before `validate:generated --require-artifact-manifest`.",
      },
    ];
  }
  if (manifestRead.kind === "schema_mismatch") {
    return [
      {
        code: "RAIL_REQUIRE_MANIFEST_SCHEMA_MISMATCH",
        message:
          `The manifest's schemaVersion (${String(manifestRead.foundVersion)}) does not match the rail's expected version (${EMISSION_MANIFEST_SCHEMA_VERSION}). ` +
          "Repair: regenerate to produce a manifest at the current schema version.",
      },
    ];
  }
  if (manifestRead.kind === "parse_error") {
    // The manifest exists but cannot be consumed. Distinct from
    // MISSING (no file at all) and SCHEMA_MISMATCH (file
    // structurally valid but producer/consumer versions diverge):
    // MALFORMED is the structurally-broken-or-unreadable state.
    // Operator repair is the same — regenerate — but CI can grep
    // on the distinct code to tell file-not-there from
    // file-but-broken.
    return [
      {
        code: "RAIL_REQUIRE_MANIFEST_MALFORMED",
        message:
          `The emission manifest exists but could not be consumed: ${manifestRead.message}. ` +
          "Repair: regenerate (`pnpm run generate -- --target=all`); the manifest will be rewritten.",
      },
    ];
  }

  const { manifest } = manifestRead;
  const diagnostics: RailDiagnostic[] = [];

  // Check 1: manifest paths that don't exist on disk.
  const missingPaths: string[] = [];
  const manifestPathSet = new Set<string>();
  for (const group of manifest.groups) {
    for (const file of group.files) {
      manifestPathSet.add(file.path);
      const abs = path.join(workspaceRoot, file.path);
      if (!fs.existsSync(abs)) {
        missingPaths.push(file.path);
      }
    }
  }
  if (missingPaths.length > 0) {
    diagnostics.push({
      code: "RAIL_REQUIRE_MANIFEST_MISSING_PATHS",
      message:
        `${missingPaths.length} path(s) in the manifest do not exist on disk. ` +
        "Most common cause: a generated file was deleted, or the manifest is stale. " +
        "Repair: regenerate (`pnpm run generate -- --target=all`).",
      paths: missingPaths,
    });
  }

  // Check 2: on-disk generated files (containing the
  // @generated:start marker) not in the manifest. Walks each
  // framework's components tree and tests every regular file.
  const onDiskGenerated = collectOnDiskGeneratedPaths(workspaceRoot);
  const untrackedPaths = onDiskGenerated.filter((p) => !manifestPathSet.has(p));
  if (untrackedPaths.length > 0) {
    diagnostics.push({
      code: "RAIL_REQUIRE_MANIFEST_UNTRACKED_GENERATED_PATHS",
      message:
        `${untrackedPaths.length} on-disk generated file(s) are NOT in the manifest. ` +
        "Most common cause: the manifest was produced by a partial-target generate run. " +
        "Repair: regenerate with `--target=all`.",
      paths: untrackedPaths,
    });
  }

  // Check 3: hash mismatches between manifest entries and on-disk
  // content. Only check paths that exist in BOTH places — paths
  // already flagged as MISSING_PATHS would noisily re-flag here
  // otherwise.
  const mismatchPaths: string[] = [];
  for (const group of manifest.groups) {
    for (const file of group.files) {
      const abs = path.join(workspaceRoot, file.path);
      if (!fs.existsSync(abs)) continue; // already reported above
      const onDiskDigest = sha256OfFile(abs);
      if (onDiskDigest !== file.sha256) {
        mismatchPaths.push(file.path);
      }
    }
  }
  if (mismatchPaths.length > 0) {
    diagnostics.push({
      code: "RAIL_REQUIRE_MANIFEST_HASH_MISMATCH",
      message:
        `${mismatchPaths.length} file(s) have on-disk content that does not match the manifest's recorded digest. ` +
        "Most common causes: `--force` overwrite without a fresh manifest write, hand-edits inside @generated regions, or external tooling mutating the file. " +
        "Repair: regenerate, or revert the unintended edit.",
      paths: mismatchPaths,
    });
  }

  // Check 4: contract integrity. Each manifest group names a
  // source contract; verify the contract still exists and its
  // on-disk bytes still hash to the manifest's recorded digest.
  // Reported independently of the output-integrity checks above
  // because a contract edit without regenerate produces clean
  // generated output on disk (HASH_MISMATCH does not fire) but
  // stale attribution — only CONTRACT_HASH_MISMATCH catches it.
  //
  // Dedupe per contract path: multiple groups (different
  // frameworks for the same component) share one contract, and
  // a missing/drifted contract should surface once with all
  // affected paths, not five times.
  const contractMissing = new Set<string>();
  const contractMismatch = new Set<string>();
  for (const group of manifest.groups) {
    const c = group.contract;
    const abs = path.join(workspaceRoot, c.path);
    if (!fs.existsSync(abs)) {
      contractMissing.add(c.path);
      continue;
    }
    const onDiskDigest = sha256OfFile(abs);
    if (onDiskDigest !== c.sha256) {
      contractMismatch.add(c.path);
    }
  }
  if (contractMissing.size > 0) {
    const sorted = [...contractMissing].sort();
    diagnostics.push({
      code: "RAIL_REQUIRE_MANIFEST_CONTRACT_MISSING",
      message:
        `${sorted.length} contract path(s) named by the manifest do not exist on disk. ` +
        "Most common cause: a contract was deleted or renamed after generation. " +
        "Repair: restore the contract or regenerate (`pnpm run generate -- --target=all`).",
      paths: sorted,
    });
  }
  if (contractMismatch.size > 0) {
    const sorted = [...contractMismatch].sort();
    diagnostics.push({
      code: "RAIL_REQUIRE_MANIFEST_CONTRACT_HASH_MISMATCH",
      message:
        `${sorted.length} contract(s) have on-disk bytes that do not match the manifest's recorded digest. ` +
        "The contract was edited after the generated output was produced; the checked-in generated files reflect the previous contract revision. " +
        "Repair: regenerate (`pnpm run generate -- --target=all`).",
      paths: sorted,
    });
  }

  return diagnostics;
}

/** Recursively walk a components tree, returning POSIX-relative paths of generated files. */
function collectOnDiskGeneratedPaths(workspaceRoot: string): string[] {
  const out: string[] = [];
  for (const { relPath } of COMPONENT_TREES) {
    const treeAbs = path.join(workspaceRoot, relPath);
    if (!fs.existsSync(treeAbs)) continue;
    walkTree(treeAbs, workspaceRoot, out);
  }
  return out;
}

function walkTree(absDir: string, workspaceRoot: string, out: string[]): void {
  for (const entry of fs.readdirSync(absDir, { withFileTypes: true })) {
    const absEntry = path.join(absDir, entry.name);
    if (entry.isDirectory()) {
      walkTree(absEntry, workspaceRoot, out);
      continue;
    }
    if (!entry.isFile()) continue;
    // Cheap pre-filter by name — barrel files emitted by codegen
    // ARE generated but live in the manifest's group records, so
    // they go through the same content-marker check below.
    if (isGeneratedFile(absEntry)) {
      const relPosix = path
        .relative(workspaceRoot, absEntry)
        .split(path.sep)
        .join("/");
      out.push(relPosix);
    }
  }
}

/**
 * True iff the file contains the `@generated:start` marker that
 * codegen writes into every generated file. Reads the file (cheap
 * for the sizes we deal with). False for hand-authored utilities
 * that happen to live in the same tree.
 *
 * Legacy snapshots (`*.legacy.*`) are deliberately included if
 * they contain the marker, but in practice they don't — the
 * snapshot is a copy of the pre-marker hand-authored source.
 */
function isGeneratedFile(absPath: string): boolean {
  // Read only the first ~2KB to avoid hashing whole files just to
  // check for a marker — codegen writes the marker near the top.
  let buf: Buffer;
  try {
    const fd = fs.openSync(absPath, "r");
    buf = Buffer.alloc(2048);
    const bytesRead = fs.readSync(fd, buf, 0, 2048, 0);
    fs.closeSync(fd);
    buf = buf.subarray(0, bytesRead);
  } catch {
    return false;
  }
  return buf.toString("utf8").includes(GENERATED_MARKER);
}

function sha256OfFile(absPath: string): string {
  const bytes = fs.readFileSync(absPath);
  return crypto.createHash("sha256").update(bytes).digest("hex");
}

/**
 * Read the manifest file and classify the result. Distinct from
 * the prior slice's simple readEmissionManifestIfPresent (which
 * collapsed all error modes to `null`) because required-mode
 * needs to tell "absent" apart from "schema mismatched" apart
 * from "unparseable" to emit the right diagnostic code.
 */
export function readManifestForVerification(
  manifestAbsPath: string,
): ManifestReadResult {
  if (!fs.existsSync(manifestAbsPath)) return { kind: "absent" };
  let raw: string;
  try {
    raw = fs.readFileSync(manifestAbsPath, "utf8");
  } catch (err) {
    return { kind: "parse_error", message: (err as Error).message };
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    return { kind: "parse_error", message: (err as Error).message };
  }
  if (
    !parsed ||
    typeof parsed !== "object" ||
    !("schemaVersion" in parsed) ||
    (parsed as { schemaVersion: unknown }).schemaVersion !==
      EMISSION_MANIFEST_SCHEMA_VERSION
  ) {
    return {
      kind: "schema_mismatch",
      foundVersion:
        parsed && typeof parsed === "object" && "schemaVersion" in parsed
          ? (parsed as { schemaVersion: unknown }).schemaVersion
          : undefined,
    };
  }
  // Structural sanity: the prior slice checked groups is an
  // array; we add the same minimum check here so a manifest with
  // the right schemaVersion but a broken body is rejected
  // honestly rather than crashing the verifier.
  if (!Array.isArray((parsed as EmissionManifest).groups)) {
    return {
      kind: "parse_error",
      message: "manifest schemaVersion matched but `groups` is not an array",
    };
  }
  // v3 invariant: every group MUST carry contract provenance.
  // A v3-stamped manifest without `contract` on a group is a
  // structurally broken producer write, distinct from a
  // schemaVersion mismatch — surface it as MALFORMED so CI can
  // tell "wrote v3 incorrectly" from "wrote v2".
  const groups = (parsed as EmissionManifest).groups;
  for (let i = 0; i < groups.length; i += 1) {
    const g = groups[i] as Partial<EmissionManifest["groups"][number]>;
    if (
      !g ||
      typeof g !== "object" ||
      !g.contract ||
      typeof g.contract !== "object" ||
      typeof g.contract.path !== "string" ||
      typeof g.contract.sha256 !== "string"
    ) {
      return {
        kind: "parse_error",
        message: `manifest schemaVersion v${EMISSION_MANIFEST_SCHEMA_VERSION} but group[${i}] is missing contract provenance`,
      };
    }
  }
  return { kind: "ok", manifest: parsed as EmissionManifest };
}
