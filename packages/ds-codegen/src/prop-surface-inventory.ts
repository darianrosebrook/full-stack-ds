// Prop-surface inventory — the corpus scoreboard for the PropTypeIR migration
// (CONTRACT-PROP-SURFACE-CORPUS-INVENTORY-01).
//
// A static, read-only scan over the contract corpus. It derives every fact from
// the SAME authority the IR uses (getPropMembers + normalizePropType +
// contract.types) so the scoreboard cannot disagree with what codegen actually
// lowers. It migrates nothing and emits nothing — it just tells every migration
// agent, per component, where that component stands relative to "Button quality".
//
// "Migrated" (Button quality, prop-surface dimension) means: no production
// dependency on props.styled, every consumer prop authors a structured propType
// (no legacy TS-string type), and every propType.ref resolves to a contract type
// alias. A2UI then derives from the structured source rather than the styled
// fallback. Components that are still legacy are reported, NOT failed — the hard
// corpus gate is the later CERTIFY spec.

import { readFileSync } from "node:fs";
import { listComponentContracts } from "./contracts-fs.js";
import { getPropMembers, type ComponentContract } from "./contract.js";
import { normalizePropType, type PropTypeIR } from "./ir.js";

/** All type-alias names a PropTypeIR references, recursing through V2 kinds. */
function collectRefNames(pt: PropTypeIR): string[] {
  switch (pt.kind) {
    case "ref":
      return [pt.to];
    case "array":
      return collectRefNames(pt.items);
    case "promise":
      return collectRefNames(pt.of);
    case "union":
      return pt.of.flatMap(collectRefNames);
    case "callback":
      return [...pt.params.flatMap((p) => collectRefNames(p.type)), ...collectRefNames(pt.returns)];
    default:
      return [];
  }
}

/** All prop buckets the six-bucket schema admits (designed/constrained are the durable surface). */
export const PROP_BUCKETS = [
  "designed",
  "constrained",
  "restricted",
  "passthrough",
  "styled",
  "hook",
] as const;

export interface RefResolution {
  prop: string;
  to: string;
  /** Whether `to` resolves to a contract.types alias. */
  resolves: boolean;
}

export interface PropSurfaceReport {
  component: string;
  /** Which prop buckets the contract actually authors. */
  buckets: string[];
  /** Prop count over the consumer surface (designed + constrained + styled, deduped). */
  propCount: number;
  propNames: string[];
  /** Members authoring a structured `propType`. */
  propTypeCoverage: number;
  /** Members authoring only a legacy TS-string `type`. */
  legacyTypeCoverage: number;
  /** Members authoring BOTH type and propType — a schema violation if present. */
  doubleAuthored: string[];
  /** styled-bucket members that (illegally) carry a propType. */
  styledWithPropType: string[];
  refs: RefResolution[];
  /** propName -> enum domain (from an enum propType or a ref to a union alias). */
  enumDomains: Record<string, string[]>;
  /** Props whose structured type is a renderable node (`node`). */
  nodeProps: string[];
  /** Members normalizing to fallback{raw} (legacy / un-modeled types). */
  fallbackCount: number;
  /**
   * Whether A2UI derives this component's prop surface from the structured
   * source (true) vs the legacy styled/TS-string fallback (false). True iff every
   * consumer prop authors a structured propType.
   */
  a2uiStructuredSource: boolean;
  /** Button-quality on the prop-surface dimension (see module header). */
  migrated: boolean;
}

/** Build the inventory report for a single parsed contract. */
export function inventoryContract(name: string, contract: ComponentContract): PropSurfaceReport {
  const props = (contract.props ?? {}) as Record<string, { members?: unknown[] } | undefined>;
  const buckets = PROP_BUCKETS.filter((b) => props[b] !== undefined);
  const members = getPropMembers(contract);
  const types = contract.types ?? {};

  let propTypeCoverage = 0;
  let legacyTypeCoverage = 0;
  let fallbackCount = 0;
  const doubleAuthored: string[] = [];
  const refs: RefResolution[] = [];
  const enumDomains: Record<string, string[]> = {};
  const nodeProps: string[] = [];

  for (const m of members) {
    if (m.propType && m.type !== undefined) doubleAuthored.push(m.name);
    if (m.propType) propTypeCoverage++;
    else legacyTypeCoverage++;

    const pt = normalizePropType(m);
    if (pt.kind === "fallback") fallbackCount++;
    // Every ref this prop references — top-level OR nested inside a V2
    // callback/array/union/promise — so the scoreboard's resolution check
    // matches what generate:check enforces over the canonical type string.
    for (const to of collectRefNames(pt)) {
      refs.push({ prop: m.name, to, resolves: Boolean(types[to]) });
    }
    // The prop's PRIMARY enum domain (a top-level enum, or a ref to a union alias).
    if (pt.kind === "ref") {
      const def = types[pt.to];
      if (def && (def.kind === "union" || def.kind === "enum") && Array.isArray(def.values)) {
        enumDomains[m.name] = def.values;
      }
    }
    if (pt.kind === "enum") enumDomains[m.name] = [...pt.values];
    if (pt.kind === "node") nodeProps.push(m.name);
  }

  // styled members must never author a propType (schema forbids it via propMember;
  // surface any drift here as an explicit inconsistency rather than trusting the schema).
  const styledMembers = (contract.props?.styled?.members ?? []) as Array<{ name: string; propType?: unknown }>;
  const styledWithPropType = styledMembers.filter((m) => m.propType !== undefined).map((m) => m.name);

  const hasStyledProduction = (contract.props?.styled?.members?.length ?? 0) > 0;
  const migrated = members.length > 0 && !hasStyledProduction && legacyTypeCoverage === 0;
  const a2uiStructuredSource = members.length > 0 && fallbackCount === 0;

  return {
    component: name,
    buckets,
    propCount: members.length,
    propNames: members.map((m) => m.name),
    propTypeCoverage,
    legacyTypeCoverage,
    doubleAuthored,
    styledWithPropType,
    refs,
    enumDomains,
    nodeProps,
    fallbackCount,
    a2uiStructuredSource,
    migrated,
  };
}

/** Scan the whole component corpus under `contractsRoot`, sorted by component name. */
export function inventoryCorpus(contractsRoot: string): PropSurfaceReport[] {
  return listComponentContracts(contractsRoot)
    .map((d) => {
      const contract = JSON.parse(readFileSync(d.absPath, "utf8")) as ComponentContract;
      return inventoryContract(contract.name ?? d.name, contract);
    })
    .sort((a, b) => a.component.localeCompare(b.component));
}

/** Corpus-level rollup for a quick scoreboard line. */
export function summarize(reports: readonly PropSurfaceReport[]): {
  total: number;
  migrated: number;
  legacy: number;
  unresolvedRefs: number;
  doubleAuthored: number;
  styledWithPropType: number;
} {
  return {
    total: reports.length,
    migrated: reports.filter((r) => r.migrated).length,
    legacy: reports.filter((r) => !r.migrated).length,
    unresolvedRefs: reports.reduce((n, r) => n + r.refs.filter((x) => !x.resolves).length, 0),
    doubleAuthored: reports.reduce((n, r) => n + r.doubleAuthored.length, 0),
    styledWithPropType: reports.reduce((n, r) => n + r.styledWithPropType.length, 0),
  };
}
