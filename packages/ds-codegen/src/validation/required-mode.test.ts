/**
 * Tests for the required-mode verifier
 * (CODEGEN-RAIL-ARTIFACT-MANIFEST-REQUIRED-CI-01).
 *
 * Each test pins one diagnostic code. The codes are public API
 * for CI scripts grepping the rail report by code; renaming any
 * of them is a breaking change.
 *
 * Fixtures use a tmpdir "workspace" with synthetic
 * `packages/ds-react/src/components/Foo/Foo.tsx` files. Each
 * generated file contains the literal `@generated:start` marker
 * so it's picked up by the verifier's marker scan.
 */
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  readManifestForVerification,
  verifyManifestAgainstDisk,
  type ManifestReadResult,
} from "./required-mode.js";
import {
  EMISSION_MANIFEST_SCHEMA_VERSION,
  type EmissionManifest,
  type EmitterSourceSet,
  type EnvironmentProvenance,
  type FrameworkId,
} from "./types.js";

/**
 * Empty source sets for verifier-only tests that go through
 * `verifyManifestAgainstDisk({ kind: "ok", manifest })` directly
 * — bypassing the reader. The reader rejects empty sources
 * (CODEGEN-RAIL-EMITTER-PROVENANCE-SCHEMA-HARDEN-01), so any
 * reader-exercising test must use STUB_VALID_EMITTER_SOURCE_SETS
 * instead.
 */
const EMPTY_EMITTER_SOURCE_SETS: Record<FrameworkId, EmitterSourceSet> = {
  react: { framework: "react", sources: [] },
  vue: { framework: "vue", sources: [] },
  svelte: { framework: "svelte", sources: [] },
  lit: { framework: "lit", sources: [] },
  angular: { framework: "angular", sources: [] },
};

/**
 * Reader-acceptable stub source sets. Each set has exactly one
 * synthetic source so the structural invariants
 * (non-empty + matching self-identifier + string fields) pass.
 * The verifier later treats these synthetic paths as MISSING
 * unless tests separately write them to disk.
 */
const STUB_VALID_EMITTER_SOURCE_SETS: Record<FrameworkId, EmitterSourceSet> = {
  react: {
    framework: "react",
    sources: [{ path: "packages/ds-codegen/src/stub-react.ts", sha256: "a".repeat(64) }],
  },
  vue: {
    framework: "vue",
    sources: [{ path: "packages/ds-codegen/src/stub-vue.ts", sha256: "a".repeat(64) }],
  },
  svelte: {
    framework: "svelte",
    sources: [{ path: "packages/ds-codegen/src/stub-svelte.ts", sha256: "a".repeat(64) }],
  },
  lit: {
    framework: "lit",
    sources: [{ path: "packages/ds-codegen/src/stub-lit.ts", sha256: "a".repeat(64) }],
  },
  angular: {
    framework: "angular",
    sources: [{ path: "packages/ds-codegen/src/stub-angular.ts", sha256: "a".repeat(64) }],
  },
};

/**
 * Reader-acceptable stub environment. Mirrors the producer's
 * fingerprint: positive integer Node major, non-empty version
 * string, lockfile with a digest-grammar-valid sha256. Verifier-
 * only tests can use this without engaging environment integrity
 * checks (those compare against the live process, so a stub
 * digest will trigger LOCKFILE_HASH_MISMATCH unless tests
 * separately write a matching lockfile).
 */
const STUB_VALID_ENVIRONMENT: EnvironmentProvenance = {
  nodeMajor: 22,
  codegenPackageVersion: "1.0.0",
  lockfile: { path: "pnpm-lock.yaml", sha256: "a".repeat(64) },
};

function sha256OfString(s: string): string {
  return crypto.createHash("sha256").update(Buffer.from(s, "utf8")).digest("hex");
}

const GENERATED_HEADER = "// @generated:start\nexport const x = 1;\n// @generated:end\n";
const GENERATED_HEADER_DIGEST = sha256OfString(GENERATED_HEADER);
const CONTRACT_BODY = '{"name":"Foo"}';
const DEFAULT_CONTRACT_PATH = "packages/ds-contracts/Foo.contract.json";

interface Fixture {
  workspaceRoot: string;
  cleanup: () => void;
  /** Write a synthetic generated file under the components tree. */
  writeGeneratedFile: (relPath: string, contents?: string) => string;
  /** Write a synthetic contract file (defaults to Foo.contract.json). */
  writeContractFile: (relPath?: string, contents?: string) => string;
  /** Build a v3 manifest matching the current on-disk state. */
  manifestFor: (paths: string[], contractPath?: string) => EmissionManifest;
  /** Override the manifest's recorded digest for a path (to simulate hash drift). */
  manifestWithBadDigest: (paths: string[], badPath: string) => EmissionManifest;
  /**
   * Build an EnvironmentProvenance matching the fixture's
   * tmpdir state (live Node major + the synthetic lockfile +
   * codegen package version `beforeEach` wrote). Verifier
   * tests building inline manifests use this to avoid
   * spurious environment-drift diagnostics on tests that
   * aren't about environment.
   */
  liveEnvironment: () => EnvironmentProvenance;
}

function makeFixture(): Fixture {
  const workspaceRoot = fs.mkdtempSync(path.join(os.tmpdir(), "rail-required-"));
  return {
    workspaceRoot,
    cleanup: () => fs.rmSync(workspaceRoot, { recursive: true, force: true }),
    writeGeneratedFile(relPath, contents = GENERATED_HEADER) {
      const abs = path.join(workspaceRoot, relPath);
      fs.mkdirSync(path.dirname(abs), { recursive: true });
      fs.writeFileSync(abs, contents);
      return relPath;
    },
    writeContractFile(relPath = DEFAULT_CONTRACT_PATH, contents = CONTRACT_BODY) {
      const abs = path.join(workspaceRoot, relPath);
      fs.mkdirSync(path.dirname(abs), { recursive: true });
      fs.writeFileSync(abs, contents);
      return relPath;
    },
    manifestFor(paths, contractPath = DEFAULT_CONTRACT_PATH) {
      const contractAbs = path.join(workspaceRoot, contractPath);
      const contractSha = sha256OfString(
        fs.existsSync(contractAbs)
          ? fs.readFileSync(contractAbs, "utf8")
          : "(absent)",
      );
      // Build an environment that the verifier will accept
      // against the live test process: live Node major, the
      // codegen version that the test's beforeEach wrote into
      // the tmpdir's package.json, and the digest of the
      // synthetic lockfile that was also written there.
      const lockfileAbs = path.join(workspaceRoot, "pnpm-lock.yaml");
      const lockfileSha = fs.existsSync(lockfileAbs)
        ? sha256OfString(fs.readFileSync(lockfileAbs, "utf8"))
        : "0".repeat(64);
      return {
        schemaVersion: EMISSION_MANIFEST_SCHEMA_VERSION,
        generatedAt: "2026-05-21T00:00:00.000Z",
        environment: {
          nodeMajor: parseInt(process.versions.node.split(".")[0]!, 10),
          codegenPackageVersion: "1.0.0",
          lockfile: { path: "pnpm-lock.yaml", sha256: lockfileSha },
        },
        emitterSourceSets: EMPTY_EMITTER_SOURCE_SETS,
        groups: [
          {
            framework: "react",
            component: "Foo",
            contract: { path: contractPath, sha256: contractSha },
            files: paths.map((p) => ({
              path: p,
              sha256: sha256OfString(
                fs.existsSync(path.join(workspaceRoot, p))
                  ? fs.readFileSync(path.join(workspaceRoot, p), "utf8")
                  : "(absent)",
              ),
            })),
          },
        ],
      };
    },
    manifestWithBadDigest(paths, badPath) {
      const m = this.manifestFor(paths);
      return {
        ...m,
        groups: m.groups.map((g) => ({
          ...g,
          files: g.files.map((f) =>
            f.path === badPath ? { ...f, sha256: "deadbeef".repeat(8) } : f,
          ),
        })),
      };
    },
    liveEnvironment() {
      const lockfileAbs = path.join(workspaceRoot, "pnpm-lock.yaml");
      const lockfileSha = fs.existsSync(lockfileAbs)
        ? sha256OfString(fs.readFileSync(lockfileAbs, "utf8"))
        : "0".repeat(64);
      return {
        nodeMajor: parseInt(process.versions.node.split(".")[0]!, 10),
        codegenPackageVersion: "1.0.0",
        lockfile: { path: "pnpm-lock.yaml", sha256: lockfileSha },
      };
    },
  };
}

describe("verifyManifestAgainstDisk", () => {
  let fx: Fixture;
  beforeEach(() => {
    fx = makeFixture();
    // Every fixture starts with the default contract file
    // present on disk so the new contract-provenance checks
    // (CONTRACT_MISSING / CONTRACT_HASH_MISMATCH) do not fire
    // on tests that aren't about contract drift. Tests that
    // ARE about contract drift override or delete this file.
    fx.writeContractFile();
    // Same idea for environment-provenance checks: write a
    // synthetic lockfile and codegen package.json so
    // LOCKFILE_MISSING / LOCKFILE_HASH_MISMATCH /
    // CODEGEN_VERSION_MISMATCH do not fire on tests that
    // aren't about environment drift. Tests that ARE about
    // environment drift override or delete these files.
    fs.writeFileSync(
      path.join(fx.workspaceRoot, "pnpm-lock.yaml"),
      "lockfileVersion: 9.0\npackages: {}\n",
    );
    fs.mkdirSync(
      path.join(fx.workspaceRoot, "packages/ds-codegen"),
      { recursive: true },
    );
    fs.writeFileSync(
      path.join(fx.workspaceRoot, "packages/ds-codegen/package.json"),
      JSON.stringify({ name: "@full-stack-ds/codegen", version: "1.0.0" }),
    );
  });
  afterEach(() => {
    fx.cleanup();
  });

  it("emits RAIL_REQUIRE_MANIFEST_MISSING when no manifest is provided", () => {
    const out = verifyManifestAgainstDisk({ kind: "absent" }, fx.workspaceRoot);
    expect(out).toHaveLength(1);
    expect(out[0]!.code).toBe("RAIL_REQUIRE_MANIFEST_MISSING");
    expect(out[0]!.message).toMatch(/Repair: run/);
  });

  it("emits RAIL_REQUIRE_MANIFEST_SCHEMA_MISMATCH for wrong schemaVersion", () => {
    const read: ManifestReadResult = { kind: "schema_mismatch", foundVersion: 99 };
    const out = verifyManifestAgainstDisk(read, fx.workspaceRoot);
    expect(out).toHaveLength(1);
    expect(out[0]!.code).toBe("RAIL_REQUIRE_MANIFEST_SCHEMA_MISMATCH");
    expect(out[0]!.message).toContain("99");
  });

  it("emits RAIL_REQUIRE_MANIFEST_MALFORMED for an unreadable manifest", () => {
    // parse_error covers JSON-parse failure, filesystem read
    // error, and "schemaVersion matched but groups not an array".
    // All three flow through the same MALFORMED code (operator
    // repair is identical, evidence state is materially different
    // from MISSING/SCHEMA_MISMATCH).
    const read: ManifestReadResult = {
      kind: "parse_error",
      message: "Unexpected token",
    };
    const out = verifyManifestAgainstDisk(read, fx.workspaceRoot);
    expect(out).toHaveLength(1);
    expect(out[0]!.code).toBe("RAIL_REQUIRE_MANIFEST_MALFORMED");
    expect(out[0]!.message).toContain("Unexpected token");
  });

  it("distinguishes MALFORMED from MISSING — both fail required mode but with different codes", () => {
    // Pinning the contract that CI scripts can rely on: these
    // codes do NOT collapse into one another. A grep for
    // RAIL_REQUIRE_MANIFEST_MISSING must NOT match malformed
    // manifests, and vice versa.
    const missing = verifyManifestAgainstDisk(
      { kind: "absent" },
      fx.workspaceRoot,
    );
    const malformed = verifyManifestAgainstDisk(
      { kind: "parse_error", message: "x" },
      fx.workspaceRoot,
    );
    expect(missing[0]!.code).toBe("RAIL_REQUIRE_MANIFEST_MISSING");
    expect(malformed[0]!.code).toBe("RAIL_REQUIRE_MANIFEST_MALFORMED");
    expect(missing[0]!.code).not.toBe(malformed[0]!.code);
  });

  it("returns empty diagnostics when on-disk state matches the manifest", () => {
    const fooPath = fx.writeGeneratedFile(
      "packages/ds-react/src/components/Foo/Foo.tsx",
    );
    const manifest = fx.manifestFor([fooPath]);
    const out = verifyManifestAgainstDisk(
      { kind: "ok", manifest },
      fx.workspaceRoot,
    );
    expect(out).toEqual([]);
  });

  it("emits MISSING_PATHS for paths the manifest claims but disk does not have", () => {
    // Do NOT write the file — the manifest's claim is the only
    // record of it. We construct the manifest manually so the
    // digest doesn't depend on a file.
    const manifest: EmissionManifest = {
      schemaVersion: EMISSION_MANIFEST_SCHEMA_VERSION,
      generatedAt: "2026-05-21T00:00:00.000Z",
      environment: fx.liveEnvironment(),
      emitterSourceSets: EMPTY_EMITTER_SOURCE_SETS,
      groups: [
        {
          framework: "react",
          component: "Foo",
          contract: {
            path: DEFAULT_CONTRACT_PATH,
            sha256: sha256OfString(CONTRACT_BODY),
          },
          files: [
            {
              path: "packages/ds-react/src/components/Foo/Foo.tsx",
              sha256: GENERATED_HEADER_DIGEST,
            },
          ],
        },
      ],
    };
    const out = verifyManifestAgainstDisk(
      { kind: "ok", manifest },
      fx.workspaceRoot,
    );
    expect(out).toHaveLength(1);
    expect(out[0]!.code).toBe("RAIL_REQUIRE_MANIFEST_MISSING_PATHS");
    expect(out[0]!.paths).toEqual([
      "packages/ds-react/src/components/Foo/Foo.tsx",
    ]);
  });

  it("emits UNTRACKED_GENERATED_PATHS for on-disk generated files not in the manifest", () => {
    fx.writeGeneratedFile("packages/ds-react/src/components/Foo/Foo.tsx");
    fx.writeGeneratedFile("packages/ds-react/src/components/Bar/Bar.tsx");
    // Manifest only knows about Foo; Bar is on disk with the
    // marker, so it must surface as untracked.
    const manifest = fx.manifestFor([
      "packages/ds-react/src/components/Foo/Foo.tsx",
    ]);
    const out = verifyManifestAgainstDisk(
      { kind: "ok", manifest },
      fx.workspaceRoot,
    );
    expect(out).toHaveLength(1);
    expect(out[0]!.code).toBe("RAIL_REQUIRE_MANIFEST_UNTRACKED_GENERATED_PATHS");
    expect(out[0]!.paths).toEqual([
      "packages/ds-react/src/components/Bar/Bar.tsx",
    ]);
  });

  it("does NOT flag hand-authored files (no @generated marker) as untracked", () => {
    fx.writeGeneratedFile("packages/ds-react/src/components/Foo/Foo.tsx");
    // A hand-authored sibling utility — no marker.
    fx.writeGeneratedFile(
      "packages/ds-react/src/components/Foo/handAuthored.ts",
      "export const x = 1;\n",
    );
    const manifest = fx.manifestFor([
      "packages/ds-react/src/components/Foo/Foo.tsx",
    ]);
    const out = verifyManifestAgainstDisk(
      { kind: "ok", manifest },
      fx.workspaceRoot,
    );
    expect(out).toEqual([]);
  });

  it("emits HASH_MISMATCH when on-disk content diverges from manifest digest", () => {
    const fooPath = fx.writeGeneratedFile(
      "packages/ds-react/src/components/Foo/Foo.tsx",
    );
    const manifest = fx.manifestWithBadDigest([fooPath], fooPath);
    const out = verifyManifestAgainstDisk(
      { kind: "ok", manifest },
      fx.workspaceRoot,
    );
    expect(out).toHaveLength(1);
    expect(out[0]!.code).toBe("RAIL_REQUIRE_MANIFEST_HASH_MISMATCH");
    expect(out[0]!.paths).toEqual([fooPath]);
  });

  it("does NOT double-report a missing path as also hash-mismatched", () => {
    // Build a manifest claiming TWO files but write only one to
    // disk: the missing one should appear in MISSING_PATHS only,
    // not in HASH_MISMATCH.
    const fooPath = fx.writeGeneratedFile(
      "packages/ds-react/src/components/Foo/Foo.tsx",
    );
    const ghostPath = "packages/ds-react/src/components/Foo/Ghost.tsx";
    const manifest: EmissionManifest = {
      schemaVersion: EMISSION_MANIFEST_SCHEMA_VERSION,
      generatedAt: "2026-05-21T00:00:00.000Z",
      environment: fx.liveEnvironment(),
      emitterSourceSets: EMPTY_EMITTER_SOURCE_SETS,
      groups: [
        {
          framework: "react",
          component: "Foo",
          contract: {
            path: DEFAULT_CONTRACT_PATH,
            sha256: sha256OfString(CONTRACT_BODY),
          },
          files: [
            { path: fooPath, sha256: sha256OfString(GENERATED_HEADER) },
            { path: ghostPath, sha256: GENERATED_HEADER_DIGEST },
          ],
        },
      ],
    };
    const out = verifyManifestAgainstDisk(
      { kind: "ok", manifest },
      fx.workspaceRoot,
    );
    expect(out).toHaveLength(1);
    expect(out[0]!.code).toBe("RAIL_REQUIRE_MANIFEST_MISSING_PATHS");
    expect(out[0]!.paths).toEqual([ghostPath]);
  });

  it("emits RAIL_REQUIRE_MANIFEST_CONTRACT_MISSING when the source contract is gone", () => {
    const fooPath = fx.writeGeneratedFile(
      "packages/ds-react/src/components/Foo/Foo.tsx",
    );
    const manifest = fx.manifestFor([fooPath]);
    // Delete the contract that beforeEach() wrote — the
    // generated file is fine, but the source claim in the
    // manifest no longer resolves.
    fs.rmSync(path.join(fx.workspaceRoot, DEFAULT_CONTRACT_PATH));
    const out = verifyManifestAgainstDisk(
      { kind: "ok", manifest },
      fx.workspaceRoot,
    );
    const codes = out.map((d) => d.code);
    expect(codes).toContain("RAIL_REQUIRE_MANIFEST_CONTRACT_MISSING");
    expect(codes).not.toContain("RAIL_REQUIRE_MANIFEST_HASH_MISMATCH");
    const cd = out.find((d) => d.code === "RAIL_REQUIRE_MANIFEST_CONTRACT_MISSING");
    expect(cd!.paths).toEqual([DEFAULT_CONTRACT_PATH]);
  });

  it("emits RAIL_REQUIRE_MANIFEST_CONTRACT_HASH_MISMATCH when contract bytes drift", () => {
    const fooPath = fx.writeGeneratedFile(
      "packages/ds-react/src/components/Foo/Foo.tsx",
    );
    const manifest = fx.manifestFor([fooPath]);
    // Rewrite the contract — manifest's recorded digest no
    // longer matches.
    fs.writeFileSync(
      path.join(fx.workspaceRoot, DEFAULT_CONTRACT_PATH),
      '{"name":"Foo","edited":true}',
    );
    const out = verifyManifestAgainstDisk(
      { kind: "ok", manifest },
      fx.workspaceRoot,
    );
    const codes = out.map((d) => d.code);
    expect(codes).toContain("RAIL_REQUIRE_MANIFEST_CONTRACT_HASH_MISMATCH");
    // The generated output is still untouched; do NOT fire
    // HASH_MISMATCH on output bytes.
    expect(codes).not.toContain("RAIL_REQUIRE_MANIFEST_HASH_MISMATCH");
    const cd = out.find(
      (d) => d.code === "RAIL_REQUIRE_MANIFEST_CONTRACT_HASH_MISMATCH",
    );
    expect(cd!.paths).toEqual([DEFAULT_CONTRACT_PATH]);
  });

  it("dedupes contract diagnostics across multiple groups sharing one contract", () => {
    // Two framework groups for one component share a single
    // contract file. A missing contract should surface ONCE
    // with the single contract path, not twice (one per group).
    const fooPath = fx.writeGeneratedFile(
      "packages/ds-react/src/components/Foo/Foo.tsx",
    );
    const fooVuePath = fx.writeGeneratedFile(
      "packages/ds-vue/src/components/Foo/Foo.vue",
    );
    const contractSha = sha256OfString(CONTRACT_BODY);
    const manifest: EmissionManifest = {
      schemaVersion: EMISSION_MANIFEST_SCHEMA_VERSION,
      generatedAt: "2026-05-21T00:00:00.000Z",
      environment: fx.liveEnvironment(),
      emitterSourceSets: EMPTY_EMITTER_SOURCE_SETS,
      groups: [
        {
          framework: "react",
          component: "Foo",
          contract: { path: DEFAULT_CONTRACT_PATH, sha256: contractSha },
          files: [{ path: fooPath, sha256: sha256OfString(GENERATED_HEADER) }],
        },
        {
          framework: "vue",
          component: "Foo",
          contract: { path: DEFAULT_CONTRACT_PATH, sha256: contractSha },
          files: [{ path: fooVuePath, sha256: sha256OfString(GENERATED_HEADER) }],
        },
      ],
    };
    fs.rmSync(path.join(fx.workspaceRoot, DEFAULT_CONTRACT_PATH));
    const out = verifyManifestAgainstDisk(
      { kind: "ok", manifest },
      fx.workspaceRoot,
    );
    const cd = out.filter(
      (d) => d.code === "RAIL_REQUIRE_MANIFEST_CONTRACT_MISSING",
    );
    expect(cd).toHaveLength(1);
    expect(cd[0]!.paths).toEqual([DEFAULT_CONTRACT_PATH]);
  });

  it("emits RAIL_REQUIRE_MANIFEST_EMITTER_SOURCE_MISSING when an emitter source is gone", () => {
    const fooPath = fx.writeGeneratedFile(
      "packages/ds-react/src/components/Foo/Foo.tsx",
    );
    const m = fx.manifestFor([fooPath]);
    // Manifest claims an emitter source that's not on disk.
    const manifest: EmissionManifest = {
      ...m,
      emitterSourceSets: {
        ...EMPTY_EMITTER_SOURCE_SETS,
        react: {
          framework: "react",
          sources: [
            {
              path: "packages/ds-codegen/src/never-existed.ts",
              sha256: "0".repeat(64),
            },
          ],
        },
      },
    };
    const out = verifyManifestAgainstDisk(
      { kind: "ok", manifest },
      fx.workspaceRoot,
    );
    const cd = out.find(
      (d) => d.code === "RAIL_REQUIRE_MANIFEST_EMITTER_SOURCE_MISSING",
    );
    expect(cd).toBeDefined();
    expect(cd!.paths).toEqual([
      "packages/ds-codegen/src/never-existed.ts",
    ]);
  });

  it("emits RAIL_REQUIRE_MANIFEST_EMITTER_SOURCE_HASH_MISMATCH on emitter byte drift", () => {
    const fooPath = fx.writeGeneratedFile(
      "packages/ds-react/src/components/Foo/Foo.tsx",
    );
    // Write an emitter source file on disk; record a bad
    // digest in the manifest so the hash compare fails.
    const emitterPath = "packages/ds-codegen/src/ir.ts";
    fx.writeContractFile(emitterPath, "export const x = 1;\n");
    const m = fx.manifestFor([fooPath]);
    const manifest: EmissionManifest = {
      ...m,
      emitterSourceSets: {
        ...EMPTY_EMITTER_SOURCE_SETS,
        react: {
          framework: "react",
          sources: [
            { path: emitterPath, sha256: "deadbeef".repeat(8) },
          ],
        },
      },
    };
    const out = verifyManifestAgainstDisk(
      { kind: "ok", manifest },
      fx.workspaceRoot,
    );
    const cd = out.find(
      (d) => d.code === "RAIL_REQUIRE_MANIFEST_EMITTER_SOURCE_HASH_MISMATCH",
    );
    expect(cd).toBeDefined();
    expect(cd!.paths).toEqual([emitterPath]);
    // Contract and output integrity untouched in this scenario.
    const otherCodes = out
      .map((d) => d.code)
      .filter((c) => c.includes("HASH_MISMATCH") && !c.includes("EMITTER"));
    expect(otherCodes).toEqual([]);
  });

  it("dedupes emitter diagnostics across framework sets sharing one source file", () => {
    // Two framework sets (react + vue) both declare the same
    // file (mirrors the cross-framework borrow of
    // react/hook-source.ts). A drift on that file should fire
    // ONCE with one path, not twice (one per claiming set).
    const fooPath = fx.writeGeneratedFile(
      "packages/ds-react/src/components/Foo/Foo.tsx",
    );
    const sharedPath = "packages/ds-codegen/src/frameworks/react/hook-source.ts";
    fx.writeContractFile(sharedPath, "export const x = 1;\n");
    const m = fx.manifestFor([fooPath]);
    const manifest: EmissionManifest = {
      ...m,
      emitterSourceSets: {
        ...EMPTY_EMITTER_SOURCE_SETS,
        react: {
          framework: "react",
          sources: [{ path: sharedPath, sha256: "deadbeef".repeat(8) }],
        },
        vue: {
          framework: "vue",
          sources: [{ path: sharedPath, sha256: "deadbeef".repeat(8) }],
        },
      },
    };
    const out = verifyManifestAgainstDisk(
      { kind: "ok", manifest },
      fx.workspaceRoot,
    );
    const cds = out.filter(
      (d) => d.code === "RAIL_REQUIRE_MANIFEST_EMITTER_SOURCE_HASH_MISMATCH",
    );
    expect(cds).toHaveLength(1);
    expect(cds[0]!.paths).toEqual([sharedPath]);
  });

  it("emits RAIL_REQUIRE_MANIFEST_NODE_MAJOR_MISMATCH on Node major drift", () => {
    const fooPath = fx.writeGeneratedFile(
      "packages/ds-react/src/components/Foo/Foo.tsx",
    );
    const m = fx.manifestFor([fooPath]);
    // Manifest claims a Node major that doesn't match the live
    // process. Verifier rejects with overall fail.
    const manifest: EmissionManifest = {
      ...m,
      environment: { ...m.environment, nodeMajor: 999 },
    };
    const out = verifyManifestAgainstDisk(
      { kind: "ok", manifest },
      fx.workspaceRoot,
    );
    const cd = out.find(
      (d) => d.code === "RAIL_REQUIRE_MANIFEST_NODE_MAJOR_MISMATCH",
    );
    expect(cd).toBeDefined();
    expect(cd!.message).toContain("Node major 999");
  });

  it("emits RAIL_REQUIRE_MANIFEST_CODEGEN_VERSION_MISMATCH on package version drift", () => {
    const fooPath = fx.writeGeneratedFile(
      "packages/ds-react/src/components/Foo/Foo.tsx",
    );
    const m = fx.manifestFor([fooPath]);
    const manifest: EmissionManifest = {
      ...m,
      environment: { ...m.environment, codegenPackageVersion: "9.9.9" },
    };
    const out = verifyManifestAgainstDisk(
      { kind: "ok", manifest },
      fx.workspaceRoot,
    );
    const cd = out.find(
      (d) => d.code === "RAIL_REQUIRE_MANIFEST_CODEGEN_VERSION_MISMATCH",
    );
    expect(cd).toBeDefined();
    expect(cd!.message).toContain("9.9.9");
  });

  it("emits RAIL_REQUIRE_MANIFEST_LOCKFILE_MISSING when the manifest's lockfile is gone", () => {
    const fooPath = fx.writeGeneratedFile(
      "packages/ds-react/src/components/Foo/Foo.tsx",
    );
    const m = fx.manifestFor([fooPath]);
    // Delete the synthetic lockfile beforeEach() wrote.
    fs.rmSync(path.join(fx.workspaceRoot, "pnpm-lock.yaml"));
    const out = verifyManifestAgainstDisk(
      { kind: "ok", manifest: m },
      fx.workspaceRoot,
    );
    const cd = out.find(
      (d) => d.code === "RAIL_REQUIRE_MANIFEST_LOCKFILE_MISSING",
    );
    expect(cd).toBeDefined();
    expect(cd!.paths).toEqual(["pnpm-lock.yaml"]);
  });

  it("emits RAIL_REQUIRE_MANIFEST_LOCKFILE_HASH_MISMATCH on lockfile drift", () => {
    const fooPath = fx.writeGeneratedFile(
      "packages/ds-react/src/components/Foo/Foo.tsx",
    );
    const m = fx.manifestFor([fooPath]);
    // Mutate the lockfile after the manifest was built.
    fs.writeFileSync(
      path.join(fx.workspaceRoot, "pnpm-lock.yaml"),
      "lockfileVersion: 9.0\npackages: { drifted: true }\n",
    );
    const out = verifyManifestAgainstDisk(
      { kind: "ok", manifest: m },
      fx.workspaceRoot,
    );
    const cd = out.find(
      (d) => d.code === "RAIL_REQUIRE_MANIFEST_LOCKFILE_HASH_MISMATCH",
    );
    expect(cd).toBeDefined();
    // The HASH_MISMATCH (output bytes) code is NOT triggered;
    // environment drift is a separate evidence class.
    expect(out.map((d) => d.code)).not.toContain(
      "RAIL_REQUIRE_MANIFEST_HASH_MISMATCH",
    );
  });

  it("environment drift is independent of output/contract/emitter drift", () => {
    // Mutate the lockfile AND the generated output; both
    // codes fire as separate diagnostics — environment drift
    // is its own evidence class.
    const fooPath = fx.writeGeneratedFile(
      "packages/ds-react/src/components/Foo/Foo.tsx",
    );
    const m = fx.manifestWithBadDigest([fooPath], fooPath);
    fs.writeFileSync(
      path.join(fx.workspaceRoot, "pnpm-lock.yaml"),
      "lockfileVersion: 9.0\npackages: { drifted: true }\n",
    );
    const out = verifyManifestAgainstDisk(
      { kind: "ok", manifest: m },
      fx.workspaceRoot,
    );
    const codes = new Set(out.map((d) => d.code));
    expect(codes.has("RAIL_REQUIRE_MANIFEST_HASH_MISMATCH")).toBe(true);
    expect(codes.has("RAIL_REQUIRE_MANIFEST_LOCKFILE_HASH_MISMATCH")).toBe(
      true,
    );
  });

  it("contract drift is independent of output drift (both can co-occur cleanly)", () => {
    const fooPath = fx.writeGeneratedFile(
      "packages/ds-react/src/components/Foo/Foo.tsx",
    );
    const manifest = fx.manifestWithBadDigest([fooPath], fooPath);
    // Drift the contract too — both sides of the source→
    // artifact attribution have moved.
    fs.writeFileSync(
      path.join(fx.workspaceRoot, DEFAULT_CONTRACT_PATH),
      '{"name":"Foo","edited":true}',
    );
    const out = verifyManifestAgainstDisk(
      { kind: "ok", manifest },
      fx.workspaceRoot,
    );
    const codes = new Set(out.map((d) => d.code));
    expect(codes.has("RAIL_REQUIRE_MANIFEST_HASH_MISMATCH")).toBe(true);
    expect(codes.has("RAIL_REQUIRE_MANIFEST_CONTRACT_HASH_MISMATCH")).toBe(
      true,
    );
  });

  it("emits multiple distinct diagnostics when several drift modes coexist", () => {
    // Manifest references two files; one exists (Foo), one
    // doesn't (Ghost). Disk also has an untracked Bar file.
    const fooPath = fx.writeGeneratedFile(
      "packages/ds-react/src/components/Foo/Foo.tsx",
    );
    fx.writeGeneratedFile("packages/ds-react/src/components/Bar/Bar.tsx");
    const manifest: EmissionManifest = {
      schemaVersion: EMISSION_MANIFEST_SCHEMA_VERSION,
      generatedAt: "2026-05-21T00:00:00.000Z",
      environment: fx.liveEnvironment(),
      emitterSourceSets: EMPTY_EMITTER_SOURCE_SETS,
      groups: [
        {
          framework: "react",
          component: "Foo",
          contract: {
            path: DEFAULT_CONTRACT_PATH,
            sha256: sha256OfString(CONTRACT_BODY),
          },
          files: [
            // Wrong digest for Foo (hash mismatch).
            { path: fooPath, sha256: "deadbeef".repeat(8) },
            // Ghost file not on disk (missing path).
            {
              path: "packages/ds-react/src/components/Foo/Ghost.tsx",
              sha256: GENERATED_HEADER_DIGEST,
            },
          ],
        },
      ],
    };
    const out = verifyManifestAgainstDisk(
      { kind: "ok", manifest },
      fx.workspaceRoot,
    );
    const codes = out.map((d) => d.code).sort();
    expect(codes).toEqual([
      "RAIL_REQUIRE_MANIFEST_HASH_MISMATCH",
      "RAIL_REQUIRE_MANIFEST_MISSING_PATHS",
      "RAIL_REQUIRE_MANIFEST_UNTRACKED_GENERATED_PATHS",
    ]);
  });
});

describe("readManifestForVerification", () => {
  let workspaceRoot: string;
  let manifestPath: string;
  beforeEach(() => {
    workspaceRoot = fs.mkdtempSync(path.join(os.tmpdir(), "rail-read-"));
    manifestPath = path.join(workspaceRoot, "manifest.json");
  });
  afterEach(() => {
    fs.rmSync(workspaceRoot, { recursive: true, force: true });
  });

  it("returns absent when the file does not exist", () => {
    const out = readManifestForVerification(manifestPath);
    expect(out.kind).toBe("absent");
  });

  it("returns ok when the manifest matches the current schema", () => {
    const manifest: EmissionManifest = {
      schemaVersion: EMISSION_MANIFEST_SCHEMA_VERSION,
      generatedAt: "2026-05-21T00:00:00.000Z",
      environment: STUB_VALID_ENVIRONMENT,
      emitterSourceSets: STUB_VALID_EMITTER_SOURCE_SETS,
      groups: [],
    };
    fs.writeFileSync(manifestPath, JSON.stringify(manifest));
    const out = readManifestForVerification(manifestPath);
    expect(out.kind).toBe("ok");
  });

  it("returns schema_mismatch when schemaVersion is wrong", () => {
    fs.writeFileSync(
      manifestPath,
      JSON.stringify({ schemaVersion: 99, generatedAt: "x", groups: [] }),
    );
    const out = readManifestForVerification(manifestPath);
    expect(out.kind).toBe("schema_mismatch");
    if (out.kind === "schema_mismatch") {
      expect(out.foundVersion).toBe(99);
    }
  });

  it("returns schema_mismatch when schemaVersion is missing (legacy v1)", () => {
    // Pre-REQUIRED-CI-01 manifests had no schemaVersion field at
    // all. The reader treats this as a mismatch with foundVersion
    // === undefined.
    fs.writeFileSync(
      manifestPath,
      JSON.stringify({ generatedAt: "x", groups: [] }),
    );
    const out = readManifestForVerification(manifestPath);
    expect(out.kind).toBe("schema_mismatch");
    if (out.kind === "schema_mismatch") {
      expect(out.foundVersion).toBeUndefined();
    }
  });

  it("returns parse_error for invalid JSON", () => {
    fs.writeFileSync(manifestPath, "not json");
    const out = readManifestForVerification(manifestPath);
    expect(out.kind).toBe("parse_error");
  });

  it("returns parse_error when groups is not an array", () => {
    fs.writeFileSync(
      manifestPath,
      JSON.stringify({
        schemaVersion: EMISSION_MANIFEST_SCHEMA_VERSION,
        generatedAt: "x",
        groups: "broken",
      }),
    );
    const out = readManifestForVerification(manifestPath);
    expect(out.kind).toBe("parse_error");
  });

  it("returns parse_error when a v4 group is missing contract provenance", () => {
    // Schema-stamped v4 but group lacks the required
    // `contract` field. Distinguished from SCHEMA_MISMATCH —
    // the producer wrote the right version but a structurally
    // incomplete body. CI grep on MALFORMED captures both this
    // and other body-shape failures.
    //
    // Uses STUB_VALID_EMITTER_SOURCE_SETS so the v4 emitter
    // coverage check passes; the test isolates the contract
    // check by making it the only failing invariant.
    fs.writeFileSync(
      manifestPath,
      JSON.stringify({
        schemaVersion: EMISSION_MANIFEST_SCHEMA_VERSION,
        generatedAt: "x",
        emitterSourceSets: STUB_VALID_EMITTER_SOURCE_SETS,
        groups: [
          {
            framework: "react",
            component: "Foo",
            files: [{ path: "x.tsx", sha256: "a".repeat(64) }],
          },
        ],
      }),
    );
    const out = readManifestForVerification(manifestPath);
    expect(out.kind).toBe("parse_error");
    if (out.kind === "parse_error") {
      expect(out.message).toMatch(/contract provenance/);
    }
  });

  it("returns parse_error when a v4 manifest is missing emitterSourceSets", () => {
    // Schema-stamped v4 but the new top-level field is absent.
    // Same MALFORMED surfacing as the v3-without-contract case;
    // CI can grep on MALFORMED for both, message string carries
    // the specific cause.
    fs.writeFileSync(
      manifestPath,
      JSON.stringify({
        schemaVersion: EMISSION_MANIFEST_SCHEMA_VERSION,
        generatedAt: "x",
        groups: [],
      }),
    );
    const out = readManifestForVerification(manifestPath);
    expect(out.kind).toBe("parse_error");
    if (out.kind === "parse_error") {
      expect(out.message).toMatch(/emitterSourceSets/);
    }
  });

  it("returns parse_error when a v4 emitterSourceSets entry has malformed sources", () => {
    // The set object is present but `sources` is not an array.
    // Catches a producer that wrote v4 with a broken inner
    // shape — still MALFORMED, message names the offending key.
    fs.writeFileSync(
      manifestPath,
      JSON.stringify({
        schemaVersion: EMISSION_MANIFEST_SCHEMA_VERSION,
        generatedAt: "x",
        emitterSourceSets: { react: { framework: "react", sources: "nope" } },
        groups: [],
      }),
    );
    const out = readManifestForVerification(manifestPath);
    expect(out.kind).toBe("parse_error");
    if (out.kind === "parse_error") {
      expect(out.message).toMatch(/emitterSourceSets\["react"\]/);
    }
  });

  // CODEGEN-RAIL-EMITTER-PROVENANCE-SCHEMA-HARDEN-01:
  // The reader must require non-empty, framework-aligned source
  // sets for every FrameworkId — not merely for the frameworks
  // present in `groups`. A manifest missing a key would let the
  // verifier silently skip emitter-source integrity for that
  // framework, undercutting the slice's claim that "each generated
  // artifact group is covered by a framework emitter source set."
  it("returns parse_error when a v4 manifest omits a framework key in emitterSourceSets", () => {
    // Manifest with only react+vue+svelte+lit keys — missing
    // angular. Verifier-loop would have happily skipped angular
    // emitter integrity; reader must refuse the manifest first.
    fs.writeFileSync(
      manifestPath,
      JSON.stringify({
        schemaVersion: EMISSION_MANIFEST_SCHEMA_VERSION,
        generatedAt: "x",
        emitterSourceSets: {
          react: { framework: "react", sources: [{ path: "x", sha256: "a".repeat(64) }] },
          vue: { framework: "vue", sources: [{ path: "x", sha256: "a".repeat(64) }] },
          svelte: { framework: "svelte", sources: [{ path: "x", sha256: "a".repeat(64) }] },
          lit: { framework: "lit", sources: [{ path: "x", sha256: "a".repeat(64) }] },
        },
        groups: [],
      }),
    );
    const out = readManifestForVerification(manifestPath);
    expect(out.kind).toBe("parse_error");
    if (out.kind === "parse_error") {
      expect(out.message).toMatch(/emitterSourceSets\["angular"\] is missing/);
    }
  });

  it("returns parse_error when an emitterSourceSets entry has a mismatched framework self-identifier", () => {
    // The set under `react` claims framework: "vue" — a producer
    // bug or hand-edit. Reader must reject because the verifier
    // joins by key, not by self-identifier, and a mismatch would
    // silently misattribute the source set.
    fs.writeFileSync(
      manifestPath,
      JSON.stringify({
        schemaVersion: EMISSION_MANIFEST_SCHEMA_VERSION,
        generatedAt: "x",
        emitterSourceSets: {
          react: { framework: "vue", sources: [{ path: "x", sha256: "a".repeat(64) }] },
          vue: { framework: "vue", sources: [{ path: "x", sha256: "a".repeat(64) }] },
          svelte: { framework: "svelte", sources: [{ path: "x", sha256: "a".repeat(64) }] },
          lit: { framework: "lit", sources: [{ path: "x", sha256: "a".repeat(64) }] },
          angular: { framework: "angular", sources: [{ path: "x", sha256: "a".repeat(64) }] },
        },
        groups: [],
      }),
    );
    const out = readManifestForVerification(manifestPath);
    expect(out.kind).toBe("parse_error");
    if (out.kind === "parse_error") {
      expect(out.message).toMatch(/mismatched self-identifier/);
    }
  });

  it("returns parse_error when an emitterSourceSets entry has an empty sources array", () => {
    fs.writeFileSync(
      manifestPath,
      JSON.stringify({
        schemaVersion: EMISSION_MANIFEST_SCHEMA_VERSION,
        generatedAt: "x",
        emitterSourceSets: {
          react: { framework: "react", sources: [] },
          vue: { framework: "vue", sources: [{ path: "x", sha256: "a".repeat(64) }] },
          svelte: { framework: "svelte", sources: [{ path: "x", sha256: "a".repeat(64) }] },
          lit: { framework: "lit", sources: [{ path: "x", sha256: "a".repeat(64) }] },
          angular: { framework: "angular", sources: [{ path: "x", sha256: "a".repeat(64) }] },
        },
        groups: [],
      }),
    );
    const out = readManifestForVerification(manifestPath);
    expect(out.kind).toBe("parse_error");
    if (out.kind === "parse_error") {
      expect(out.message).toMatch(/emitterSourceSets\["react"\]\.sources is empty/);
    }
  });

  // CODEGEN-RAIL-MANIFEST-DIGEST-GRAMMAR-01:
  // Every sha256-shaped field must be lowercase 64-char hex.
  // The producer writes via `crypto.createHash().digest("hex")`
  // which always produces this shape, so anything else on disk
  // is hand-edited / externally-mutated — surface as MALFORMED
  // at the reader, not as a later content-drift HASH_MISMATCH.
  it("returns parse_error when a group.files[] entry has a non-hex sha256", () => {
    fs.writeFileSync(
      manifestPath,
      JSON.stringify({
        schemaVersion: EMISSION_MANIFEST_SCHEMA_VERSION,
        generatedAt: "x",
        emitterSourceSets: STUB_VALID_EMITTER_SOURCE_SETS,
        groups: [
          {
            framework: "react",
            component: "Foo",
            contract: {
              path: "packages/ds-contracts/Foo.contract.json",
              sha256: "a".repeat(64),
            },
            files: [
              { path: "x.tsx", sha256: "ZZZZ".repeat(16) }, // non-hex
            ],
          },
        ],
      }),
    );
    const out = readManifestForVerification(manifestPath);
    expect(out.kind).toBe("parse_error");
    if (out.kind === "parse_error") {
      expect(out.message).toMatch(/group\[0\]\.files\[0\]\.sha256 is not lowercase 64-char hex/);
    }
  });

  it("returns parse_error when a contract sha256 is uppercase hex (grammar is lowercase-only)", () => {
    // Uppercase is structurally hex but Node's
    // `crypto.createHash().digest("hex")` always emits
    // lowercase. Tolerating uppercase would let a hand-edit
    // slip through that the producer would never have written.
    fs.writeFileSync(
      manifestPath,
      JSON.stringify({
        schemaVersion: EMISSION_MANIFEST_SCHEMA_VERSION,
        generatedAt: "x",
        emitterSourceSets: STUB_VALID_EMITTER_SOURCE_SETS,
        groups: [
          {
            framework: "react",
            component: "Foo",
            contract: {
              path: "packages/ds-contracts/Foo.contract.json",
              sha256: "A".repeat(64), // uppercase
            },
            files: [{ path: "x.tsx", sha256: "a".repeat(64) }],
          },
        ],
      }),
    );
    const out = readManifestForVerification(manifestPath);
    expect(out.kind).toBe("parse_error");
    if (out.kind === "parse_error") {
      expect(out.message).toMatch(/group\[0\]\.contract\.sha256 is not lowercase 64-char hex/);
    }
  });

  it("returns parse_error when an emitter source sha256 is the wrong length", () => {
    fs.writeFileSync(
      manifestPath,
      JSON.stringify({
        schemaVersion: EMISSION_MANIFEST_SCHEMA_VERSION,
        generatedAt: "x",
        emitterSourceSets: {
          react: {
            framework: "react",
            sources: [
              { path: "packages/ds-codegen/src/stub.ts", sha256: "abc123" }, // too short
            ],
          },
          vue: { framework: "vue", sources: [{ path: "x", sha256: "a".repeat(64) }] },
          svelte: { framework: "svelte", sources: [{ path: "x", sha256: "a".repeat(64) }] },
          lit: { framework: "lit", sources: [{ path: "x", sha256: "a".repeat(64) }] },
          angular: { framework: "angular", sources: [{ path: "x", sha256: "a".repeat(64) }] },
        },
        groups: [],
      }),
    );
    const out = readManifestForVerification(manifestPath);
    expect(out.kind).toBe("parse_error");
    if (out.kind === "parse_error") {
      expect(out.message).toMatch(/emitterSourceSets\["react"\]\.sources\[0\]\.sha256 is not lowercase 64-char hex/);
    }
  });

  it("returns parse_error when a sha256 is empty string", () => {
    // Empty string is type-correct (it's a string) so the
    // existing item-shape check passes, but it fails the digest
    // grammar. Verifies the two checks are independent.
    fs.writeFileSync(
      manifestPath,
      JSON.stringify({
        schemaVersion: EMISSION_MANIFEST_SCHEMA_VERSION,
        generatedAt: "x",
        emitterSourceSets: STUB_VALID_EMITTER_SOURCE_SETS,
        groups: [
          {
            framework: "react",
            component: "Foo",
            contract: {
              path: "packages/ds-contracts/Foo.contract.json",
              sha256: "", // empty
            },
            files: [{ path: "x.tsx", sha256: "a".repeat(64) }],
          },
        ],
      }),
    );
    const out = readManifestForVerification(manifestPath);
    expect(out.kind).toBe("parse_error");
    if (out.kind === "parse_error") {
      expect(out.message).toMatch(/sha256 is not lowercase 64-char hex/);
    }
  });

  it("returns parse_error when group.files is missing entirely", () => {
    // Producer always writes `files: [...]` (possibly empty);
    // a v4 manifest with `files` absent or non-array is a
    // hand-edit. MALFORMED, not SCHEMA_MISMATCH.
    fs.writeFileSync(
      manifestPath,
      JSON.stringify({
        schemaVersion: EMISSION_MANIFEST_SCHEMA_VERSION,
        generatedAt: "x",
        emitterSourceSets: STUB_VALID_EMITTER_SOURCE_SETS,
        groups: [
          {
            framework: "react",
            component: "Foo",
            contract: {
              path: "packages/ds-contracts/Foo.contract.json",
              sha256: "a".repeat(64),
            },
            // files omitted entirely.
          },
        ],
      }),
    );
    const out = readManifestForVerification(manifestPath);
    expect(out.kind).toBe("parse_error");
    if (out.kind === "parse_error") {
      expect(out.message).toMatch(/group\[0\]\.files is missing or not an array/);
    }
  });

  it("returns parse_error when a group.files entry has non-string fields", () => {
    // Mirror of the emitter-source item-shape test on the
    // artifact-files side. Closes the same "verifier never
    // throws" boundary: path.join would crash on path: 42.
    fs.writeFileSync(
      manifestPath,
      JSON.stringify({
        schemaVersion: EMISSION_MANIFEST_SCHEMA_VERSION,
        generatedAt: "x",
        emitterSourceSets: STUB_VALID_EMITTER_SOURCE_SETS,
        groups: [
          {
            framework: "react",
            component: "Foo",
            contract: {
              path: "packages/ds-contracts/Foo.contract.json",
              sha256: "a".repeat(64),
            },
            files: [{ path: 42, sha256: "a".repeat(64) }], // non-string path
          },
        ],
      }),
    );
    const out = readManifestForVerification(manifestPath);
    expect(out.kind).toBe("parse_error");
    if (out.kind === "parse_error") {
      expect(out.message).toMatch(/group\[0\]\.files\[0\] is missing path\/sha256 or has non-string fields/);
    }
  });

  it("returns parse_error when a sources[] item has non-string path or sha256", () => {
    // The verifier later does path.join(workspaceRoot, src.path)
    // and would throw on a non-string path, violating the
    // "verifier never throws" doctrine. Reader catches this.
    fs.writeFileSync(
      manifestPath,
      JSON.stringify({
        schemaVersion: EMISSION_MANIFEST_SCHEMA_VERSION,
        generatedAt: "x",
        emitterSourceSets: {
          react: {
            framework: "react",
            sources: [{ path: 42, sha256: "a" }], // non-string path
          },
          vue: { framework: "vue", sources: [{ path: "x", sha256: "a".repeat(64) }] },
          svelte: { framework: "svelte", sources: [{ path: "x", sha256: "a".repeat(64) }] },
          lit: { framework: "lit", sources: [{ path: "x", sha256: "a".repeat(64) }] },
          angular: { framework: "angular", sources: [{ path: "x", sha256: "a".repeat(64) }] },
        },
        groups: [],
      }),
    );
    const out = readManifestForVerification(manifestPath);
    expect(out.kind).toBe("parse_error");
    if (out.kind === "parse_error") {
      expect(out.message).toMatch(/emitterSourceSets\["react"\]\.sources\[0\]/);
    }
  });

  it("returns schema_mismatch when a v3 manifest is encountered (no compat bridge)", () => {
    // v3 manifests now fall through SCHEMA_MISMATCH for the
    // same reason v2 manifests did at the v2→v3 boundary:
    // the manifest is gitignored runtime state, the migration
    // is a regenerate, no compat shim.
    fs.writeFileSync(
      manifestPath,
      JSON.stringify({
        schemaVersion: 3,
        generatedAt: "x",
        groups: [],
      }),
    );
    const out = readManifestForVerification(manifestPath);
    expect(out.kind).toBe("schema_mismatch");
    if (out.kind === "schema_mismatch") {
      expect(out.foundVersion).toBe(3);
    }
  });

  it("returns schema_mismatch when a v4 manifest is encountered (no compat bridge)", () => {
    // Mirrors the v3 case at the v4→v5 boundary.
    fs.writeFileSync(
      manifestPath,
      JSON.stringify({ schemaVersion: 4, generatedAt: "x", groups: [] }),
    );
    const out = readManifestForVerification(manifestPath);
    expect(out.kind).toBe("schema_mismatch");
    if (out.kind === "schema_mismatch") {
      expect(out.foundVersion).toBe(4);
    }
  });

  it("returns parse_error when a v5 manifest is missing environment", () => {
    fs.writeFileSync(
      manifestPath,
      JSON.stringify({
        schemaVersion: EMISSION_MANIFEST_SCHEMA_VERSION,
        generatedAt: "x",
        emitterSourceSets: STUB_VALID_EMITTER_SOURCE_SETS,
        groups: [],
      }),
    );
    const out = readManifestForVerification(manifestPath);
    expect(out.kind).toBe("parse_error");
    if (out.kind === "parse_error") {
      expect(out.message).toMatch(/`environment` is missing/);
    }
  });

  it("returns parse_error when environment.nodeMajor is not a non-negative integer", () => {
    fs.writeFileSync(
      manifestPath,
      JSON.stringify({
        schemaVersion: EMISSION_MANIFEST_SCHEMA_VERSION,
        generatedAt: "x",
        environment: {
          nodeMajor: "22", // string, not number
          codegenPackageVersion: "1.0.0",
          lockfile: { path: "pnpm-lock.yaml", sha256: "a".repeat(64) },
        },
        emitterSourceSets: STUB_VALID_EMITTER_SOURCE_SETS,
        groups: [],
      }),
    );
    const out = readManifestForVerification(manifestPath);
    expect(out.kind).toBe("parse_error");
    if (out.kind === "parse_error") {
      expect(out.message).toMatch(/`environment\.nodeMajor`/);
    }
  });

  it("returns parse_error when environment.lockfile.sha256 fails the digest grammar", () => {
    fs.writeFileSync(
      manifestPath,
      JSON.stringify({
        schemaVersion: EMISSION_MANIFEST_SCHEMA_VERSION,
        generatedAt: "x",
        environment: {
          nodeMajor: 22,
          codegenPackageVersion: "1.0.0",
          // uppercase hex — fails the lowercase-only grammar.
          lockfile: { path: "pnpm-lock.yaml", sha256: "A".repeat(64) },
        },
        emitterSourceSets: STUB_VALID_EMITTER_SOURCE_SETS,
        groups: [],
      }),
    );
    const out = readManifestForVerification(manifestPath);
    expect(out.kind).toBe("parse_error");
    if (out.kind === "parse_error") {
      expect(out.message).toMatch(/`environment\.lockfile\.sha256`/);
    }
  });

  it("returns schema_mismatch when a v2 manifest is encountered (no compat bridge)", () => {
    // v2 manifests are gitignored runtime state; the slice
    // doctrine is to fail honestly and require a regenerate
    // rather than carry a compatibility shim. foundVersion
    // surfaces the actual on-disk value.
    fs.writeFileSync(
      manifestPath,
      JSON.stringify({
        schemaVersion: 2,
        generatedAt: "x",
        groups: [],
      }),
    );
    const out = readManifestForVerification(manifestPath);
    expect(out.kind).toBe("schema_mismatch");
    if (out.kind === "schema_mismatch") {
      expect(out.foundVersion).toBe(2);
    }
  });
});
