/**
 * Single source of truth for the EmissionManifest location.
 *
 * The codegen CLI writes this file after a successful generate run;
 * validate-cli reads it during a rail invocation to join emitted
 * artifacts against PlanCommand scopes.
 *
 * Path is workspace-root-relative so the writer and reader agree
 * regardless of CWD differences (the codegen CLI is invoked from
 * the workspace root; validate-cli runs the same way).
 */
import path from "node:path";

export const EMISSION_MANIFEST_RELATIVE_PATH =
  "packages/ds-codegen/.emission-manifest.json";

export function emissionManifestAbsolutePath(workspaceRoot: string): string {
  return path.join(workspaceRoot, EMISSION_MANIFEST_RELATIVE_PATH);
}
