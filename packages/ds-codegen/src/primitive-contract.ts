import fs from "node:fs";
import path from "node:path";

/**
 * Reader + IR for the shared layout primitive (Stack).
 *
 * The primitive contract at `primitives/Stack.primitive.json` is the single
 * source of truth for the five web-framework Stack primitives. This module
 * parses it into a framework-neutral `PrimitiveIR`; each web emitter lowers
 * that IR into its idiomatic primitive source. Emitters carry no Stack-specific
 * lore — the class prefix, display map, axis map, and token-driven gap all
 * live in the contract and flow through this IR.
 *
 * The figma target reads the raw contract via its own factory; it does not
 * consume `PrimitiveIR`.
 */

type PropKind =
  | "elementType"
  | "layoutVariant"
  | "layoutMode"
  | "string"
  | "boolean"
  | "children"
  | "record";

interface RawPrimitiveProp {
  name: string;
  kind: PropKind;
  default?: unknown;
  notes?: string;
}

interface RawPrimitiveContract {
  name?: string;
  description?: string;
  props?: RawPrimitiveProp[];
  layout?: {
    classPrefix?: string;
    displayByMode?: Record<string, string | null>;
    axisByVariant?: Record<string, string>;
    gap?: { token?: string; cssVar?: string };
  };
  implementation?: {
    targets?: Record<
      string,
      {
        relativeFromComponents?: string;
        module?: string;
        export?: string;
      }
    >;
  };
}

/** Back-compat narrow shape kept for the registry's react-import lookup. */
export interface StackPrimitiveFile {
  implementation?: {
    targets?: {
      react?: {
        relativeFromComponents?: string;
        module?: string;
        export?: string;
      };
    };
  };
}

export interface PrimitiveProp {
  name: string;
  kind: PropKind;
  default?: unknown;
  notes?: string;
}

export interface PrimitiveLayout {
  /** BEM block name for the primitive's layout classes (e.g. "stack"). */
  classPrefix: string;
  /** layoutMode value -> CSS display value; null keeps the host's own display. */
  displayByMode: Record<string, string | null>;
  /** layoutVariant value -> CSS flex-direction under axis-bearing modes. */
  axisByVariant: Record<string, string>;
  /** Token-driven inter-child gap, or null when the primitive declares none. */
  gap: { token?: string; cssVar: string } | null;
}

/** Framework-neutral facts every web emitter lowers into a Stack primitive. */
export interface PrimitiveIR {
  name: string;
  description: string;
  props: PrimitiveProp[];
  layout: PrimitiveLayout;
  /** layoutMode values that carry a flex axis (display flex / inline-flex). */
  axisModes: string[];
}

function primitivePath(contractsRoot: string): string {
  return path.join(contractsRoot, "primitives", "Stack.primitive.json");
}

function readRaw(contractsRoot: string): RawPrimitiveContract {
  const p = primitivePath(contractsRoot);
  return JSON.parse(fs.readFileSync(p, "utf-8")) as RawPrimitiveContract;
}

/**
 * Parse the primitive contract into the framework-neutral IR. Throws with a
 * pointed message if a required layout fact is missing — the schema is the
 * first gate, this is defense in depth so an emitter never silently drops a
 * fact.
 */
export function readPrimitiveIR(contractsRoot: string): PrimitiveIR {
  const p = primitivePath(contractsRoot);
  const raw = readRaw(contractsRoot);
  if (!raw.name) throw new Error(`Missing name in ${p}`);
  if (!raw.layout) throw new Error(`Missing layout facts in ${p}`);
  const { classPrefix, displayByMode, axisByVariant, gap } = raw.layout;
  if (!classPrefix) throw new Error(`Missing layout.classPrefix in ${p}`);
  if (!displayByMode) throw new Error(`Missing layout.displayByMode in ${p}`);
  if (!axisByVariant) throw new Error(`Missing layout.axisByVariant in ${p}`);
  if (gap && !gap.cssVar) {
    throw new Error(`layout.gap present but missing cssVar in ${p}`);
  }

  // Axis-bearing modes are the display modes that lay out on a flex axis, so
  // flex-direction only applies there (a `block`/`native` Stack has no axis).
  const axisModes = Object.entries(displayByMode)
    .filter(([, display]) => display === "flex" || display === "inline-flex")
    .map(([mode]) => mode);

  return {
    name: raw.name,
    description: raw.description ?? "",
    props: (raw.props ?? []).map((prop) => ({
      name: prop.name,
      kind: prop.kind,
      default: prop.default,
      notes: prop.notes,
    })),
    layout: {
      classPrefix,
      displayByMode,
      axisByVariant,
      gap:
        gap && gap.cssVar
          ? { token: gap.token, cssVar: gap.cssVar }
          : null,
    },
    axisModes,
  };
}

/** Resolved relative import path from each generated component folder to the Stack module. */
export function readReactStackImportFromPrimitiveContract(
  contractsRoot: string,
): string {
  const p = primitivePath(contractsRoot);
  const raw = readRaw(contractsRoot);
  const rel = raw.implementation?.targets?.react?.relativeFromComponents;
  if (!rel || typeof rel !== "string") {
    throw new Error(
      `Missing implementation.targets.react.relativeFromComponents in ${p}`,
    );
  }
  return rel;
}
