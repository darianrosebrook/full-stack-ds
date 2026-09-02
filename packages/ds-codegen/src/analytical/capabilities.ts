/**
 * D6: the eight scale labels as derived aliases over the kernel's capability
 * coordinates (REL-FIELD-ALGEBRA-02, invariant 11).
 *
 * Precommitted basis: admissible-transformation class (`transformation`),
 * cyclicity (`cyclic`), bounded whole (`proportion`), reference/base
 * (`index`), discreteness (no stage-1 witness: `count` decodes to `ratio`).
 * `decodeScale` is the migration the stage-1 fixtures went through; the
 * Phase-A ledger reproduced byte-for-byte (modulo removed key parameters) is
 * the proof that the labels carried no information the capabilities do not.
 */
import type { FieldDecl } from "./relation-model.js";

export type ScaleLabel = "nominal" | "ordinal" | "cyclic" | "interval" | "ratio" | "count" | "proportion" | "index";

export type Capabilities = Pick<FieldDecl, "transformation" | "cyclic" | "proportion" | "index">;

const TABLE: Record<ScaleLabel, Capabilities> = {
  nominal: { transformation: "nominal" },
  ordinal: { transformation: "ordinal" },
  cyclic: { transformation: "ordinal", cyclic: true },
  interval: { transformation: "interval" },
  ratio: { transformation: "ratio" },
  count: { transformation: "ratio" },
  proportion: { transformation: "ratio", proportion: true },
  index: { transformation: "ratio", index: true },
};

/** Label -> capability state. */
export function decodeScale(label: ScaleLabel): Capabilities {
  return { ...TABLE[label] };
}

/** Labels that decode to the same capability state are aliases of each other. */
export function scaleAliases(): Record<string, ScaleLabel[]> {
  const byState = new Map<string, ScaleLabel[]>();
  for (const label of Object.keys(TABLE) as ScaleLabel[]) {
    const k = JSON.stringify(TABLE[label]);
    byState.set(k, [...(byState.get(k) ?? []), label]);
  }
  return Object.fromEntries([...byState.entries()].map(([k, labels]) => [k, labels]));
}

/** The label a capability state is known by, or undefined for an unnamed state. */
export function encodeScale(caps: Capabilities): ScaleLabel | undefined {
  const norm = JSON.stringify({ transformation: caps.transformation, ...(caps.cyclic ? { cyclic: true } : {}), ...(caps.proportion ? { proportion: true } : {}), ...(caps.index ? { index: true } : {}) });
  for (const label of Object.keys(TABLE) as ScaleLabel[]) {
    if (JSON.stringify(TABLE[label]) === norm && label !== "count") return label;
  }
  return undefined;
}
