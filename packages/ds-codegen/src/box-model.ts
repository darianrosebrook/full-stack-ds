/**
 * Box-model primitive: the closed slot pool that every component contract
 * inherits as a stable, themable surface for padding, gap, and intrinsic
 * sizing.
 *
 * The pool is defined by two artifacts under `packages/ds-contracts/`:
 *
 *   - `box-model.primitive.schema.json` — enumerates the legal slot names
 *     (closed `additionalProperties: false`) and constrains each slot's
 *     resolution to either a token reference or a CSS literal drawn from
 *     the box-model value vocabulary. New slots can only be added by
 *     extending this schema. Contract authors cannot sneak new slot
 *     names in via a component sidecar.
 *
 *   - `primitives/BoxModel.primitive.json` — the canonical defaults for
 *     every slot (`0`, `auto`, `none`). Components inherit these as
 *     `var(--fsds-box-model-<slot>, <default-literal>)` so consumers can
 *     always read a slot without checking whether it's been overridden.
 *
 * At codegen time, the validated primitive is merged UNDER each
 * component's tokens sidecar — component-authored `box-model.*` keys win
 * — and the resulting slot declarations emit alongside the component's
 * own slots in `<Name>.tokens.css`. The component-tokens validator that
 * checks `resolvesTo` paths against the global token graph ignores keys
 * in this pool: a box-model slot's resolution is governed by THIS
 * schema, not by the cssPrefix-namespaced rule that applies to
 * component slots.
 *
 * Portal-enabled components keep box-model slots scoped to `.<cssPrefix>`
 * even when other slots hoist to `:root`. Unscoped CSS variables on
 * `:root` would leak across components and lose the per-instance
 * override discipline the box-model surface depends on.
 */

import fs from "node:fs";
import path from "node:path";
import { Ajv, type ValidateFunction } from "ajv";

import type { TokenResolution } from "./contract.js";

/**
 * Loaded, validated box-model primitive: the closed slot-name set plus
 * the canonical defaults. Both are immutable after `loadBoxModelPrimitive`
 * resolves; downstream code treats this as a read-only fact.
 */
export interface BoxModelPrimitive {
  /** Slot names declared by `box-model.primitive.schema.json`. */
  readonly slotNames: ReadonlySet<string>;
  /** Default resolution per slot, from `BoxModel.primitive.json`. */
  readonly defaults: Readonly<Record<string, TokenResolution>>;
}

let cached: BoxModelPrimitive | null = null;
let cachedFromRoot: string | null = null;

/**
 * Locate the ds-contracts root by walking up from this module's directory
 * until a `box-model.primitive.schema.json` is found. Mirrors the discovery
 * pattern used by `validation/contract-tokens.ts` so the codegen runs from
 * any cwd.
 */
function resolveContractsRoot(): string {
  let here: string;
  try {
    here = path.dirname(new URL(import.meta.url).pathname);
  } catch {
    here = process.cwd();
  }
  let dir = here;
  for (let i = 0; i < 16; i += 1) {
    const candidate = path.join(dir, "packages", "ds-contracts");
    if (fs.existsSync(path.join(candidate, "box-model.primitive.schema.json"))) {
      return candidate;
    }
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  throw new Error(
    "Could not locate packages/ds-contracts/box-model.primitive.schema.json — " +
      "are you running outside the monorepo?",
  );
}

/**
 * Load and validate the box-model primitive. Cached per contracts root; the
 * primitive does not change between contract emits within one process.
 *
 * Throws when either the schema or the primitive JSON is missing or fails
 * validation — both are codegen invariants, not user-fixable contract bugs.
 */
export function loadBoxModelPrimitive(
  contractsRoot: string = resolveContractsRoot(),
): BoxModelPrimitive {
  if (cached && cachedFromRoot === contractsRoot) return cached;

  const schemaPath = path.join(
    contractsRoot,
    "box-model.primitive.schema.json",
  );
  const primitivePath = path.join(
    contractsRoot,
    "primitives",
    "BoxModel.primitive.json",
  );

  if (!fs.existsSync(schemaPath)) {
    throw new Error(`Schema file not found: ${schemaPath}`);
  }
  if (!fs.existsSync(primitivePath)) {
    throw new Error(`Primitive file not found: ${primitivePath}`);
  }

  const schema = JSON.parse(fs.readFileSync(schemaPath, "utf-8"));
  const primitive = JSON.parse(fs.readFileSync(primitivePath, "utf-8"));

  const ajv = new Ajv({ allErrors: true, strict: false });
  const validate: ValidateFunction = ajv.compile(schema);
  if (!validate(primitive)) {
    const issues = (validate.errors ?? [])
      .map((err) => `  ${err.instancePath || "/"}: ${err.message ?? "invalid"}`)
      .join("\n");
    throw new Error(
      `BoxModel.primitive.json failed schema validation:\n${issues}`,
    );
  }

  // The schema's `properties` block IS the enumeration of legal slot
  // names — same source of truth as the contract sidecars validate
  // against. Skip the `$schema` property (JSON Schema metadata, not a
  // box-model slot).
  const slotNames = new Set<string>(
    Object.keys((schema.properties ?? {}) as Record<string, unknown>).filter(
      (k) => k !== "$schema",
    ),
  );

  // Drop the `$schema` key (JSON Schema convention) before treating the
  // file as a token-resolution map.
  const defaults: Record<string, TokenResolution> = {};
  for (const [name, value] of Object.entries(
    primitive as Record<string, unknown>,
  )) {
    if (name === "$schema") continue;
    defaults[name] = value as TokenResolution;
  }

  cached = { slotNames, defaults };
  cachedFromRoot = contractsRoot;
  return cached;
}

/**
 * Test-only: discard the cached primitive so a subsequent load picks up
 * an updated schema or primitive file. Not exposed to production code —
 * the primitive is immutable within a process.
 *
 * @internal
 */
export function _resetBoxModelCache(): void {
  cached = null;
  cachedFromRoot = null;
}

/**
 * Return true when a tokens-sidecar key belongs to the box-model pool
 * (i.e., its first dotted segment is `box-model`). The component-tokens
 * graph-check validator uses this to skip box-model keys — their
 * resolution is governed by the box-model primitive schema, not by the
 * cssPrefix-namespaced rule that applies to component-local slots.
 */
export function isBoxModelKey(name: string): boolean {
  return name.startsWith("box-model.");
}

/**
 * Split a tokens sidecar into its box-model partition (strict schema) and
 * component-local partition (existing component.tokens schema). Used at
 * sidecar load time so the box-model partition can be validated against
 * `box-model.primitive.schema.json` even though the parent file already
 * passed `component.tokens.schema.json`.
 */
export function partitionBoxModelTokens(
  tokens: Record<string, TokenResolution>,
): {
  boxModel: Record<string, TokenResolution>;
  component: Record<string, TokenResolution>;
} {
  const boxModel: Record<string, TokenResolution> = {};
  const component: Record<string, TokenResolution> = {};
  for (const [name, value] of Object.entries(tokens)) {
    if (isBoxModelKey(name)) {
      boxModel[name] = value;
    } else {
      component[name] = value;
    }
  }
  return { boxModel, component };
}

/**
 * Merge box-model defaults under a component's authored token sidecar.
 * Author-supplied `box-model.*` keys win; missing slots fall back to the
 * primitive's defaults. Non-box-model keys pass through untouched.
 *
 * The merge happens at sidecar-load time (cli.ts) so the contract that
 * reaches buildComponentIR already carries the full slot pool. Downstream
 * code does not need to know about the primitive.
 */
export function mergeBoxModelDefaults(
  authoredTokens: Record<string, TokenResolution> | undefined,
  primitive: BoxModelPrimitive = loadBoxModelPrimitive(),
): Record<string, TokenResolution> {
  const merged: Record<string, TokenResolution> = {};
  // Defaults first so authored entries overwrite by key on insert.
  for (const slot of primitive.slotNames) {
    const def = primitive.defaults[slot];
    if (def) merged[slot] = def;
  }
  if (authoredTokens) {
    for (const [name, value] of Object.entries(authoredTokens)) {
      merged[name] = value;
    }
  }
  return merged;
}
