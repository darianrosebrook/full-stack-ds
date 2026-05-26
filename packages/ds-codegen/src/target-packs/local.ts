import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import type { TargetRegistryConfigTargetV1 } from "./config.js";
import {
  assertTargetPackManifestV1,
  type TargetPackManifestV1,
} from "./manifest.js";

export const LOCAL_TARGET_PACK_EXECUTION_STATUS = "metadata-only" as const;
export const LOCAL_TARGET_PACK_EXECUTION_REASON =
  "local_emitter_execution_not_implemented" as const;

export interface LocalTargetPackManifestLoadResultV1 {
  id: string;
  packageRoot: string;
  packageRootRelative: string;
  manifestPath: string;
  manifestRelative: string;
  manifestSha256: string;
  entrypointPath: string;
  entrypointRelative: string;
  targetPack: TargetPackManifestV1;
  execution: {
    status: typeof LOCAL_TARGET_PACK_EXECUTION_STATUS;
    reason: typeof LOCAL_TARGET_PACK_EXECUTION_REASON;
  };
}

/**
 * Load and validate a local target-pack manifest without executing its emitter.
 *
 * This is the governed metadata-loading seam. Local packs may be declared,
 * resolved, hashed, and described, but their entrypoints remain non-executable
 * until a later adapter/sandbox slice admits that behavior explicitly.
 */
export function loadLocalTargetPackManifestV1(
  workspaceRoot: string,
  target: TargetRegistryConfigTargetV1,
): LocalTargetPackManifestLoadResultV1 {
  if (target.source.kind !== "local") {
    throw new Error(`Target "${target.id}" does not use local source kind.`);
  }

  const workspaceRootAbsolute = path.resolve(workspaceRoot);
  const packageRoot = resolveUnderRoot(
    workspaceRootAbsolute,
    target.source.packageRoot,
    `Target "${target.id}" source.packageRoot`,
  );

  assertExistingDirectory(
    packageRoot,
    `Target "${target.id}" local packageRoot does not exist: ${target.source.packageRoot}.`,
  );

  const manifestPath = resolveUnderRoot(
    packageRoot,
    target.source.manifest,
    `Target "${target.id}" source.manifest`,
  );
  assertExistingFile(
    manifestPath,
    `Target "${target.id}" local manifest does not exist: ${target.source.manifest}.`,
  );

  const manifestContents = fs.readFileSync(manifestPath, "utf-8");
  const parsed = JSON.parse(manifestContents) as unknown;
  assertTargetPackManifestV1(parsed);

  if (parsed.target.id !== target.id) {
    throw new Error(
      `Target "${target.id}" local manifest id mismatch: manifest declares "${parsed.target.id}".`,
    );
  }

  const entrypointPath = resolveUnderRoot(
    packageRoot,
    parsed.entrypoints.emitter,
    `Target "${target.id}" entrypoints.emitter`,
  );
  assertExistingFile(
    entrypointPath,
    `Target "${target.id}" local emitter entrypoint does not exist: ${parsed.entrypoints.emitter}.`,
  );

  return {
    id: target.id,
    packageRoot,
    packageRootRelative: toPosixRelative(workspaceRootAbsolute, packageRoot),
    manifestPath,
    manifestRelative: toPosixRelative(packageRoot, manifestPath),
    manifestSha256: sha256(manifestContents),
    entrypointPath,
    entrypointRelative: toPosixRelative(packageRoot, entrypointPath),
    targetPack: parsed,
    execution: {
      status: LOCAL_TARGET_PACK_EXECUTION_STATUS,
      reason: LOCAL_TARGET_PACK_EXECUTION_REASON,
    },
  };
}

function resolveUnderRoot(root: string, relativePath: string, fieldPath: string): string {
  if (path.isAbsolute(relativePath)) {
    throw new Error(`${fieldPath} must be a relative path.`);
  }
  const resolved = path.resolve(root, relativePath);
  const relative = path.relative(root, resolved);
  if (relative === "" || (relative !== ".." && !relative.startsWith(`..${path.sep}`) && !path.isAbsolute(relative))) {
    return resolved;
  }
  throw new Error(`${fieldPath} must not escape its root.`);
}

function assertExistingDirectory(value: string, message: string): void {
  if (!fs.existsSync(value) || !fs.statSync(value).isDirectory()) {
    throw new Error(message);
  }
}

function assertExistingFile(value: string, message: string): void {
  if (!fs.existsSync(value) || !fs.statSync(value).isFile()) {
    throw new Error(message);
  }
}

function sha256(contents: string): string {
  return createHash("sha256").update(contents).digest("hex");
}

function toPosixRelative(from: string, to: string): string {
  return path.relative(from, to).replace(/\\/g, "/");
}
