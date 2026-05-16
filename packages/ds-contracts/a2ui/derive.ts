/**
 * Runtime A2UI descriptor deriver.
 *
 * `deriveA2UIDescriptor(contract)` returns the agent-facing projection of a
 * component contract. Nothing is read from disk and nothing is written —
 * callers pass the parsed contract in and use the result in place.
 *
 * The contract carries one slim authored block:
 *     contract.a2ui = { category, usageHints?, children? }
 * Everything else — prop allowlist, accepts, enum, required, events, form —
 * is derived from the existing contract fields at call time.
 */

import type {
  A2UIChildrenPolicy,
  A2UIDescriptor,
  A2UIEvent,
  A2UIProp,
  A2UIValueKind,
} from './types';

/** Minimal structural view of a component contract. Defensive against missing fields. */
export interface ComponentContractLike {
  name: string;
  layer?: string;
  description?: string;
  a2ui?: {
    category: string;
    usageHints?: string[];
    children?: A2UIChildrenPolicy;
  };
  props?: {
    styled?: { members?: ContractPropMember[] };
    [key: string]: { description?: string; members?: ContractPropMember[] } | undefined;
  };
  /** Named type aliases used by prop `type` strings (e.g. `ButtonKind`). */
  types?: Record<string, ContractTypeDef>;
  channels?: Record<string, ContractChannel>;
  events?: Record<string, ContractEvent>;
  form?: unknown;
}

export interface ContractTypeDef {
  kind: 'union' | 'enum' | 'alias';
  values?: string[];
  alias?: string;
}

export interface ContractPropMember {
  name: string;
  type: string;
  description?: string;
  required?: boolean;
  default?: string | number | boolean;
  /** Optional disambiguation for `ReactNode`-typed props. */
  nodeKind?: 'node-ref' | 'icon-ref';
}

export interface ContractChannel {
  description?: string;
  value: string;
  defaultValue?: string;
  onChange: string;
  valueType?: string;
  notes?: string;
}

export interface ContractEvent {
  description?: string;
  payload?: string;
  emittedVia?: string;
}

// ---------------------------------------------------------------------------
// Exclusions
// ---------------------------------------------------------------------------

const NAME_EXCLUDE_EXACT = new Set([
  'className',
  'style',
  'id',
  'inputProps',
  'nativeProps',
  'rootProps',
  'children',
]);

/** Prop is a render-only seam regardless of its type signature. */
function isExcludedByName(name: string): boolean {
  if (NAME_EXCLUDE_EXACT.has(name)) return true;
  if (name.startsWith('data-') || name.startsWith('aria-')) return true;
  if (name.endsWith('Ref')) return true;
  // Event handler props go through the channels/events blocks, not props.
  if (/^on[A-Z]/.test(name)) return true;
  return false;
}

/** TS type matches a renderer-internal / non-serializable pattern. */
function isExcludedByType(type: string): boolean {
  const t = type.trim();
  if (t.includes('=>')) return true;
  if (/\bCSSProperties\b/.test(t)) return true;
  if (/\bRecord\s*</.test(t)) return true;
  if (/\bRef\s*</.test(t)) return true;
  if (/\bRefObject\b/.test(t)) return true;
  if (/\bMutableRefObject\b/.test(t)) return true;
  if (/\bHTMLAttributes\b/.test(t)) return true;
  if (/\bHTML\w+Element\b/.test(t) && !/\bReact(Node|Element)\b/.test(t)) return true;
  return false;
}

// ---------------------------------------------------------------------------
// Type-string parsing
// ---------------------------------------------------------------------------

/**
 * Split a TS type expression by top-level `|`, respecting nested brackets and
 * string literals. Produces trimmed alternatives.
 */
function splitUnion(type: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let current = '';
  let inString: '"' | "'" | null = null;

  for (let i = 0; i < type.length; i++) {
    const c = type[i];
    if (inString) {
      current += c;
      if (c === '\\' && i + 1 < type.length) {
        current += type[i + 1];
        i++;
        continue;
      }
      if (c === inString) inString = null;
      continue;
    }
    if (c === '"' || c === "'") {
      inString = c as '"' | "'";
      current += c;
      continue;
    }
    if (c === '<' || c === '(' || c === '[' || c === '{') depth++;
    else if (c === '>' || c === ')' || c === ']' || c === '}') depth--;

    if (c === '|' && depth === 0) {
      parts.push(current.trim());
      current = '';
    } else {
      current += c;
    }
  }
  if (current.trim()) parts.push(current.trim());
  return parts;
}

function stripLiteralQuotes(alt: string): string | null {
  const m = alt.match(/^"([^"]*)"$|^'([^']*)'$/);
  if (!m) return null;
  return m[1] ?? m[2] ?? '';
}

interface ParsedType {
  accepts: A2UIValueKind[];
  enumValues?: string[];
}

/**
 * Parse a TS type string into a normalized `accepts` list and an optional enum
 * value set.
 *
 * - `"a" | "b"` → accepts=["enum"], enum=["a","b"]
 * - `string | number` → accepts=["string","number"]
 * - `ReactNode` → accepts=["node-ref"] by default; overridden by `nodeKind`
 * - `string | "a" | "b"` → accepts=["string","enum"], enum=["a","b"]
 */
function parseType(
  type: string,
  nodeKind: 'node-ref' | 'icon-ref' | undefined,
  types: Record<string, ContractTypeDef> | undefined,
  seen: Set<string> = new Set(),
): ParsedType | null {
  const alts = splitUnion(type);
  if (alts.length === 0) return null;

  const accepts: A2UIValueKind[] = [];
  const enumValues: string[] = [];

  const pushKind = (k: A2UIValueKind) => {
    if (!accepts.includes(k)) accepts.push(k);
  };
  const pushEnum = (v: string) => {
    pushKind('enum');
    if (!enumValues.includes(v)) enumValues.push(v);
  };

  for (const altRaw of alts) {
    const alt = altRaw.trim();
    if (!alt || alt === 'undefined' || alt === 'null' || alt === 'never') continue;

    const literal = stripLiteralQuotes(alt);
    if (literal !== null) {
      pushEnum(literal);
      continue;
    }

    if (alt === 'string') pushKind('string');
    else if (alt === 'number') pushKind('number');
    else if (alt === 'boolean' || alt === 'true' || alt === 'false') pushKind('boolean');
    else if (
      alt === 'ReactNode' ||
      alt === 'React.ReactNode' ||
      alt === 'ReactElement' ||
      alt === 'React.ReactElement' ||
      alt === 'ReactChild'
    ) {
      pushKind(nodeKind ?? 'node-ref');
    } else if (types && types[alt] && !seen.has(alt)) {
      const next = new Set(seen);
      next.add(alt);
      const def = types[alt];
      if ((def.kind === 'union' || def.kind === 'enum') && Array.isArray(def.values)) {
        for (const v of def.values) pushEnum(v);
      } else if (def.kind === 'alias' && typeof def.alias === 'string') {
        const sub = parseType(def.alias, nodeKind, types, next);
        if (sub) {
          for (const k of sub.accepts) pushKind(k);
          if (sub.enumValues) for (const v of sub.enumValues) pushEnum(v);
        }
      }
    } else {
      // Unknown named type (e.g. `DropdownValue`, `IconName`). Treat as string
      // — it still serializes as a scalar in A2UI payloads.
      pushKind('string');
    }
  }

  if (accepts.length === 0) return null;
  const parsed: ParsedType = { accepts };
  if (enumValues.length > 0) parsed.enumValues = enumValues;
  return parsed;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export function deriveA2UIDescriptor(contract: ComponentContractLike): A2UIDescriptor {
  if (!contract || typeof contract !== 'object') {
    throw new Error('deriveA2UIDescriptor: contract must be an object');
  }
  if (!contract.a2ui || typeof contract.a2ui.category !== 'string') {
    throw new Error(`deriveA2UIDescriptor: contract "${contract.name ?? '<unknown>'}" is missing a2ui.category`);
  }

  const props: Record<string, A2UIProp> = {};
  const members = contract.props?.styled?.members ?? [];
  for (const m of members) {
    if (!m || typeof m.name !== 'string' || typeof m.type !== 'string') continue;
    if (isExcludedByName(m.name)) continue;
    if (isExcludedByType(m.type)) continue;
    const parsed = parseType(m.type, m.nodeKind, contract.types);
    if (!parsed) continue;

    const prop: A2UIProp = {
      type: m.type,
      accepts: parsed.accepts,
    };
    if (m.description) prop.description = m.description;
    if (parsed.enumValues) prop.enum = parsed.enumValues;
    if (m.required === true) prop.required = true;
    props[m.name] = prop;
  }

  const events: Record<string, A2UIEvent> = {};
  if (contract.channels) {
    for (const [name, ch] of Object.entries(contract.channels)) {
      if (!ch) continue;
      const ev: A2UIEvent = { source: 'channel', key: name };
      if (ch.description) ev.description = ch.description;
      if (ch.valueType) ev.valueType = ch.valueType;
      if (ch.value) ev.valueProp = ch.value;
      if (ch.onChange) ev.onChangeProp = ch.onChange;
      events[name] = ev;
    }
  }
  if (contract.events) {
    for (const [name, evDef] of Object.entries(contract.events)) {
      if (!evDef) continue;
      const ev: A2UIEvent = { source: 'event', key: name };
      if (evDef.description) ev.description = evDef.description;
      if (evDef.payload) ev.valueType = evDef.payload;
      events[name] = ev;
    }
  }

  const descriptor: A2UIDescriptor = {
    name: contract.name,
    category: contract.a2ui.category,
    props,
    events,
  };
  if (contract.layer) descriptor.layer = contract.layer;
  if (contract.description) descriptor.description = contract.description;
  if (contract.a2ui.usageHints?.length) descriptor.usageHints = contract.a2ui.usageHints;
  if (contract.a2ui.children) descriptor.children = contract.a2ui.children;
  if (contract.form !== undefined) descriptor.form = contract.form;

  return descriptor;
}

/**
 * Convenience: derive descriptors for a list of contracts keyed by component name.
 */
export function deriveA2UIRegistry(
  contracts: ComponentContractLike[],
): Record<string, A2UIDescriptor> {
  const out: Record<string, A2UIDescriptor> = {};
  for (const c of contracts) {
    const d = deriveA2UIDescriptor(c);
    out[d.name] = d;
  }
  return out;
}
