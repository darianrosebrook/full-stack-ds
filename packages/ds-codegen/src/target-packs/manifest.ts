import path from "node:path";

export const TARGET_PACK_MANIFEST_SCHEMA_VERSION = "fsds.target-pack.v1" as const;

export type TargetFamily =
  | "web-dom"
  | "native-view"
  | "design-tool"
  | "agent-schema"
  | "docs"
  | "test-plan";

export type TargetPackMaturity = "builtin" | "stable" | "experimental" | "research";

export type TargetPackFilesystemPermission = "package-output-only" | "none";

export type TargetPackTokenStrategy =
  | "css-custom-properties"
  | "native-theme-module"
  | "descriptor-only"
  | "none";

export interface TargetPackIdentityV1 {
  id: string;
  family: TargetFamily;
  label: string;
  maturity: TargetPackMaturity;
}

export interface TargetPackCompatibilityV1 {
  codegenProtocol: string;
  componentIR: string;
  targetFamilyIR?: string;
}

export interface TargetPackEntrypointsV1 {
  /** ESM module exporting the target emitter. Relative to the package root. */
  emitter: string;
}

export interface TargetPackOutputsV1 {
  /** Component output root relative to the target package root. */
  componentsRoot: string;
  /** Barrel file relative to componentsRoot. */
  barrelFile: string;
  /** Declared artifact classes this target pack may emit. */
  fileKinds: readonly string[];
}

export interface TargetPackCapabilitiesV1 {
  components: boolean;
  tests: boolean;
  behavior: boolean;
  compoundParts: boolean;
  surface: boolean;
  tokens: TargetPackTokenStrategy;
  customRegions: boolean;
}

export interface TargetPackPermissionsV1 {
  filesystem: TargetPackFilesystemPermission;
  network: boolean;
  postinstall: boolean;
}

export interface TargetPackAdmissionCommandScopeV1 {
  packageRoot: string;
  extensions?: readonly string[];
  coverage:
    | "covered_by_workspace_check"
    | "covered_by_package_check"
    | "covered_by_direct_template_check"
    | "not_selected"
    | "not_checkable_by_this_lane";
}

export interface TargetPackAdmissionCommandV1 {
  check: string;
  command: readonly [string, ...string[]];
  scope?: TargetPackAdmissionCommandScopeV1;
  knownRuleNarrowings?: readonly string[];
}

export interface TargetPackAdmissionV1 {
  commands: readonly TargetPackAdmissionCommandV1[];
  knownGaps?: readonly string[];
}

export interface TargetPackManifestV1 {
  schemaVersion: typeof TARGET_PACK_MANIFEST_SCHEMA_VERSION;
  target: TargetPackIdentityV1;
  compatibility: TargetPackCompatibilityV1;
  entrypoints: TargetPackEntrypointsV1;
  outputs: TargetPackOutputsV1;
  capabilities: TargetPackCapabilitiesV1;
  permissions: TargetPackPermissionsV1;
  admission?: TargetPackAdmissionV1;
}

const VALID_TARGET_FAMILIES: readonly TargetFamily[] = [
  "web-dom",
  "native-view",
  "design-tool",
  "agent-schema",
  "docs",
  "test-plan",
];

const VALID_MATURITY: readonly TargetPackMaturity[] = [
  "builtin",
  "stable",
  "experimental",
  "research",
];

const VALID_TOKEN_STRATEGIES: readonly TargetPackTokenStrategy[] = [
  "css-custom-properties",
  "native-theme-module",
  "descriptor-only",
  "none",
];

export function assertTargetPackManifestV1(
  value: unknown,
): asserts value is TargetPackManifestV1 {
  const manifest = asRecord(value, "manifest");
  assertEqual(
    manifest.schemaVersion,
    TARGET_PACK_MANIFEST_SCHEMA_VERSION,
    "schemaVersion",
  );

  const target = asRecord(manifest.target, "target");
  const targetId = assertNonEmptyString(target.id, "target.id");
  assertTargetId(targetId, "target.id");
  assertOneOf(target.family, VALID_TARGET_FAMILIES, "target.family");
  assertNonEmptyString(target.label, "target.label");
  assertOneOf(target.maturity, VALID_MATURITY, "target.maturity");

  const compatibility = asRecord(manifest.compatibility, "compatibility");
  assertNonEmptyString(compatibility.codegenProtocol, "compatibility.codegenProtocol");
  assertNonEmptyString(compatibility.componentIR, "compatibility.componentIR");
  if (compatibility.targetFamilyIR !== undefined) {
    assertNonEmptyString(compatibility.targetFamilyIR, "compatibility.targetFamilyIR");
  }

  const entrypoints = asRecord(manifest.entrypoints, "entrypoints");
  assertRelativePath(
    assertNonEmptyString(entrypoints.emitter, "entrypoints.emitter"),
    "entrypoints.emitter",
  );

  const outputs = asRecord(manifest.outputs, "outputs");
  assertRelativePath(
    assertNonEmptyString(outputs.componentsRoot, "outputs.componentsRoot"),
    "outputs.componentsRoot",
  );
  assertRelativePath(
    assertNonEmptyString(outputs.barrelFile, "outputs.barrelFile"),
    "outputs.barrelFile",
  );
  const fileKinds = assertArray(outputs.fileKinds, "outputs.fileKinds");
  if (fileKinds.length === 0) {
    throw new Error("outputs.fileKinds must include at least one file kind.");
  }
  for (const [index, kind] of fileKinds.entries()) {
    assertNonEmptyString(kind, `outputs.fileKinds[${index}]`);
  }

  const capabilities = asRecord(manifest.capabilities, "capabilities");
  assertBoolean(capabilities.components, "capabilities.components");
  assertBoolean(capabilities.tests, "capabilities.tests");
  assertBoolean(capabilities.behavior, "capabilities.behavior");
  assertBoolean(capabilities.compoundParts, "capabilities.compoundParts");
  assertBoolean(capabilities.surface, "capabilities.surface");
  assertOneOf(capabilities.tokens, VALID_TOKEN_STRATEGIES, "capabilities.tokens");
  assertBoolean(capabilities.customRegions, "capabilities.customRegions");

  const permissions = asRecord(manifest.permissions, "permissions");
  assertOneOf(
    permissions.filesystem,
    ["package-output-only", "none"] as const,
    "permissions.filesystem",
  );
  assertBoolean(permissions.network, "permissions.network");
  assertBoolean(permissions.postinstall, "permissions.postinstall");
  if (permissions.network || permissions.postinstall) {
    throw new Error(
      "Target packs default to no network and no postinstall execution in governed mode.",
    );
  }

  if (manifest.admission !== undefined) {
    const admission = asRecord(manifest.admission, "admission");
    const commands = assertArray(admission.commands, "admission.commands");
    for (const [index, command] of commands.entries()) {
      assertAdmissionCommand(command, `admission.commands[${index}]`);
    }
    if (admission.knownGaps !== undefined) {
      const knownGaps = assertArray(admission.knownGaps, "admission.knownGaps");
      for (const [index, gap] of knownGaps.entries()) {
        assertNonEmptyString(gap, `admission.knownGaps[${index}]`);
      }
    }
  }
}

export function validateTargetPackManifestV1(value: unknown): {
  ok: boolean;
  errors: string[];
} {
  try {
    assertTargetPackManifestV1(value);
    return { ok: true, errors: [] };
  } catch (error) {
    return { ok: false, errors: [(error as Error).message] };
  }
}

function assertAdmissionCommand(value: unknown, fieldPath: string): void {
  const command = asRecord(value, fieldPath);
  assertNonEmptyString(command.check, `${fieldPath}.check`);
  const argv = assertArray(command.command, `${fieldPath}.command`);
  if (argv.length === 0) {
    throw new Error(`${fieldPath}.command must include executable argv.`);
  }
  for (const [index, arg] of argv.entries()) {
    assertNonEmptyString(arg, `${fieldPath}.command[${index}]`);
  }
  if (command.scope !== undefined) {
    const scope = asRecord(command.scope, `${fieldPath}.scope`);
    assertRelativePath(
      assertNonEmptyString(scope.packageRoot, `${fieldPath}.scope.packageRoot`),
      `${fieldPath}.scope.packageRoot`,
    );
    if (scope.extensions !== undefined) {
      const extensions = assertArray(scope.extensions, `${fieldPath}.scope.extensions`);
      for (const [index, ext] of extensions.entries()) {
        const value = assertNonEmptyString(ext, `${fieldPath}.scope.extensions[${index}]`);
        if (!value.startsWith(".")) {
          throw new Error(`${fieldPath}.scope.extensions[${index}] must start with '.'.`);
        }
      }
    }
    assertOneOf(
      scope.coverage,
      [
        "covered_by_workspace_check",
        "covered_by_package_check",
        "covered_by_direct_template_check",
        "not_selected",
        "not_checkable_by_this_lane",
      ] as const,
      `${fieldPath}.scope.coverage`,
    );
  }
}

function assertTargetId(value: string, fieldPath: string): void {
  if (!/^[a-z0-9][a-z0-9._-]*$/.test(value)) {
    throw new Error(
      `${fieldPath} must be lowercase identifier text: letters, numbers, '.', '_', '-'.`,
    );
  }
}

function assertRelativePath(value: string, fieldPath: string): void {
  if (path.isAbsolute(value)) {
    throw new Error(`${fieldPath} must be a relative path.`);
  }
  const normalized = path.posix.normalize(value.replaceAll(path.sep, "/"));
  if (normalized === ".." || normalized.startsWith("../")) {
    throw new Error(`${fieldPath} must not escape its package root.`);
  }
}

function asRecord(value: unknown, fieldPath: string): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new Error(`${fieldPath} must be an object.`);
  }
  return value as Record<string, unknown>;
}

function assertArray(value: unknown, fieldPath: string): unknown[] {
  if (!Array.isArray(value)) {
    throw new Error(`${fieldPath} must be an array.`);
  }
  return value;
}

function assertNonEmptyString(value: unknown, fieldPath: string): string {
  if (typeof value !== "string" || value.length === 0) {
    throw new Error(`${fieldPath} must be a non-empty string.`);
  }
  return value;
}

function assertBoolean(value: unknown, fieldPath: string): void {
  if (typeof value !== "boolean") {
    throw new Error(`${fieldPath} must be a boolean.`);
  }
}

function assertEqual(value: unknown, expected: unknown, fieldPath: string): void {
  if (value !== expected) {
    throw new Error(`${fieldPath} must be ${JSON.stringify(expected)}.`);
  }
}

function assertOneOf<T extends string>(
  value: unknown,
  allowed: readonly T[],
  fieldPath: string,
): asserts value is T {
  if (typeof value !== "string" || !(allowed as readonly string[]).includes(value)) {
    throw new Error(`${fieldPath} must be one of: ${allowed.join(", ")}.`);
  }
}
