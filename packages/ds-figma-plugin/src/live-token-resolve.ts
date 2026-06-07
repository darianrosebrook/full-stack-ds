// FIGMA-STYLE-RESOLUTION-PROJECTION-01
//
// Pure token-chain resolver. Walks a descriptor's css.blocks
// (property -> --component-token -> --semantic/core-token) to a DTCG token path
// and its resolved {light,dark} value — reading the token graph, NEVER the
// var() fallback. `transparent` and unresolved chains residualize (never
// scraped). Also classifies each selector into a STYLE CARRIER target
// (root | a known descriptor.anatomy part | residual).

export type StyleProp = "background-color" | "color" | "border-color";
export type ResolvedColor = string | { light: string; dark: string };

export type CarrierTarget =
  | { kind: "root" }
  | { kind: "part"; part: string }
  | { kind: "residual"; reason: string };

export type BindingResult =
  | { tokenPath: string; value: ResolvedColor }
  | { residual: string };

export interface ResolvedBinding {
  selector: string;
  carrier: CarrierTarget;
  property: StyleProp;
  result: BindingResult;
}

/** A flattened resolved-token map: "semantic.color.x.y" -> value. */
export type ResolvedTokenMap = Record<string, ResolvedColor>;

const COLOR_PROPS: StyleProp[] = ["background-color", "color", "border-color"];
const VAR_RE = /var\(\s*(--[\w-]+)\s*(?:,\s*([^)]*))?\)/;

function varToPath(varName: string): string {
  return varName.replace(/^--fsds-/, "").replace(/-/g, ".");
}

function resolveChain(
  raw: string | undefined,
  props: Record<string, string>,
  tokens: ResolvedTokenMap,
  seen = new Set<string>(),
): BindingResult {
  if (raw == null) return { residual: "unresolved-binding" };
  const v = raw.trim();
  if (v === "transparent") return { residual: "transparent" };
  const m = v.match(VAR_RE);
  if (!m) return { residual: "literal" }; // a baked literal is not token-graph authority
  const varName = m[1];
  if (/^--fsds-(semantic|core)-/.test(varName)) {
    const path = varToPath(varName);
    const value = tokens[path];
    return value !== undefined ? { tokenPath: path, value } : { residual: "unresolved-token" };
  }
  if (seen.has(varName)) return { residual: "cycle" };
  seen.add(varName);
  return resolveChain(props[varName], props, tokens, seen);
}

function classifyCarrier(selector: string, prefix: string, anatomyParts: string[]): CarrierTarget {
  const seg = selector.trim().split(/\s+/).pop() ?? "";
  const dot = `.${prefix}`;
  if (!seg.startsWith(dot)) return { kind: "residual", reason: "no-prefix" };
  const after = seg.slice(dot.length);
  if (!after.startsWith("__")) return { kind: "root" };
  const part = after.slice(2).split(/--|:/)[0];
  if (anatomyParts.includes(part)) return { kind: "part", part };
  return { kind: "residual", reason: `unknown-part:${part}` };
}

export interface ResolverDescriptor {
  component: { cssPrefix: string };
  anatomy?: Array<{ name: string }>;
  css?: { blocks?: Array<{ selector: string; declarations: Record<string, string> }> };
}

/** Resolve every color binding in a descriptor to a carrier + token result. */
export function resolveDescriptorStyles(
  descriptor: ResolverDescriptor,
  tokens: ResolvedTokenMap,
): ResolvedBinding[] {
  const prefix = descriptor.component.cssPrefix;
  const anatomyParts = (descriptor.anatomy ?? []).map((a) => a.name);
  const blocks = descriptor.css?.blocks ?? [];
  const base = blocks.find((b) => b.selector === `.${prefix}`);
  const baseProps: Record<string, string> = {};
  for (const [k, val] of Object.entries(base?.declarations ?? {})) {
    if (k.startsWith("--")) baseProps[k] = val;
  }

  const out: ResolvedBinding[] = [];
  for (const block of blocks) {
    const merged: Record<string, string> = { ...baseProps };
    const bindings: Partial<Record<StyleProp, string>> = {};
    for (const [k, val] of Object.entries(block.declarations ?? {})) {
      if (k.startsWith("--")) merged[k] = val;
      else if ((COLOR_PROPS as string[]).includes(k)) bindings[k as StyleProp] = val;
    }
    const carrier = classifyCarrier(block.selector, prefix, anatomyParts);
    for (const property of COLOR_PROPS) {
      const raw = bindings[property];
      if (raw === undefined) continue;
      out.push({ selector: block.selector, carrier, property, result: resolveChain(raw, merged, tokens) });
    }
  }
  return out;
}

/** Flatten resolved.tokens.json into the ResolvedTokenMap shape. */
export function flattenResolvedTokens(resolved: unknown): ResolvedTokenMap {
  const flat: ResolvedTokenMap = {};
  (function walk(node: unknown, path: string) {
    if (node && typeof node === "object") {
      if ("$value" in (node as Record<string, unknown>)) {
        flat[path] = (node as { $value: ResolvedColor }).$value;
        return;
      }
      for (const [k, v] of Object.entries(node as Record<string, unknown>)) {
        walk(v, path ? `${path}.${k}` : k);
      }
    }
  })(resolved, "");
  return flat;
}
