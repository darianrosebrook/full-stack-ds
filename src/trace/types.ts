import type { Framework } from "../types/data";

export interface TraceHit {
  /** Path inside the contract JSON, e.g. "anatomy.dom.bindings.aria-busy" */
  contractPath: string;
  /** Plain-English explanation of why this source region exists. */
  explanation: string;
  /** Source location (0-based line and column, length in characters). */
  start: { line: number; column: number };
  length: number;
  /** Category for styling and grouping. */
  kind:
    | "tag"
    | "binding"
    | "variant"
    | "state"
    | "token"
    | "prop"
    | "behavior"
    | "type";
}

export interface TraceIndex {
  framework: Framework;
  componentName: string;
  hits: TraceHit[];
}

export interface TraceSelection {
  hit: TraceHit;
  framework: Framework;
  componentName: string;
}
