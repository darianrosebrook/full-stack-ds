/**
 * A2UI descriptor shape produced by `deriveA2UIDescriptor`.
 *
 * The descriptor is a runtime projection of a component contract onto the
 * agent-facing surface. It is never written to disk by the library — callers
 * invoke `deriveA2UIDescriptor` with the parsed contract at call time.
 */

export type A2UIValueKind =
  | 'string'
  | 'number'
  | 'boolean'
  | 'enum'
  | 'node-ref'
  | 'icon-ref';

export interface A2UIProp {
  /** TS type expression carried verbatim for reference / debugging. */
  type: string;
  /** Dev-facing description from the contract (agents read this). */
  description?: string;
  /** Ordered list of value kinds an agent may supply. */
  accepts: A2UIValueKind[];
  /** Closed value set when `accepts` includes "enum". */
  enum?: string[];
  /** Whether an agent must supply this prop. */
  required?: boolean;
}

export interface A2UIEvent {
  /** Which contract block this event came from. */
  source: 'channel' | 'event';
  /** Canonical key in the contract's `channels`/`events` block. */
  key: string;
  /** Short description of when the event fires. */
  description?: string;
  /** Agent-visible payload type (e.g. "string", "{ value: string }"). */
  valueType?: string;
  /** Name of the controlled value prop (channel source only). */
  valueProp?: string;
  /** Name of the change handler prop (channel source only). */
  onChangeProp?: string;
}

export interface A2UIChildrenPolicy {
  allowed: boolean;
  slot?: string;
  accepts?: string[];
  min?: number;
  max?: number;
}

export interface A2UIDescriptor {
  name: string;
  /** `primitive` | `styled` | `composite` | etc., copied from contract. */
  layer?: string;
  category: string;
  description?: string;
  usageHints?: string[];
  children?: A2UIChildrenPolicy;
  props: Record<string, A2UIProp>;
  events: Record<string, A2UIEvent>;
  /** Form participation carried through unchanged when present. */
  form?: unknown;
}
