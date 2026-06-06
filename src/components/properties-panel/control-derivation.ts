// Pure contract → control-descriptor derivation for the scratch Properties panel.
//
// This module turns a component contract into the three control groups the
// Figma-style panel renders — variant axes, designed props, and component
// tokens — plus the `tokenOverridesToCss` helper that lowers an override map
// into a CSS custom-property block the preview iframe applies live.
//
// It is deliberately DOM-free and side-effect-free so it can be unit-tested in
// isolation (no React, no jsdom). The panel component consumes these
// descriptors; the scratch view sends the resulting override maps over the
// `fsds:config` wire to the preview.
//
// Accessors are the ones the rest of the app already uses:
//   - variant axes:   contract.variants            (Record<string,string[]>)
//   - props:          contract.props.designed.members
//   - prop enums:     contract.types[ref].values   (union → select options)
//   - component tokens: contract.tokens             (FLAT Record<slot, TokenDefinition>;
//                       the showcase bundle attaches the raw <Name>.tokens.json
//                       sidecar verbatim — see vite-plugin-fsds-data.ts)

import type {
  ComponentContract,
  TokenDefinition,
} from "../../types/data";

/** A single editable control rendered as a row in the panel. */
export type ControlDescriptor =
  | {
      kind: "select";
      /** Prop / variant-axis name, also the key in the props override map. */
      name: string;
      label: string;
      description?: string;
      options: string[];
      /** Default from the contract, used as the control's initial value. */
      defaultValue?: string;
      /** True when this select is also a declared variant axis. */
      isVariantAxis: boolean;
    }
  | {
      kind: "boolean";
      name: string;
      label: string;
      description?: string;
      defaultValue?: boolean;
    }
  | {
      kind: "number";
      name: string;
      label: string;
      description?: string;
      defaultValue?: number;
    }
  | {
      kind: "text";
      name: string;
      label: string;
      description?: string;
      defaultValue?: string;
    };

/** A component-scoped token row (one entry of the flat tokens sidecar). */
export interface TokenRowDescriptor {
  /** Dotted slot name, e.g. "button.color.background.default". */
  slot: string;
  /** The semantic/core token this slot resolves to, if any (the binding). */
  resolvesTo?: string;
  /** The literal fallback value (what we show + seed the editor with). */
  fallback?: string;
  /** Which token layer the binding targets (semantic/core), if declared. */
  layer?: string;
  /** Whether the literal looks like a color (drives swatch rendering). */
  isColor: boolean;
  /**
   * The CSS custom property this slot drives, derived from the slot name.
   * e.g. "button.color.background.default" → "--fsds-button-color-background-default".
   * This is the variable the preview override block sets.
   */
  cssVar: string;
}

/** The full derived control surface for one component. */
export interface DerivedControls {
  variantAxes: ControlDescriptor[];
  props: ControlDescriptor[];
  tokens: TokenRowDescriptor[];
}

const COLOR_RE = /^(#|rgb|hsl|oklch|color\()/i;

/**
 * Map a dotted token slot to its CSS custom-property name. The token CSS the
 * components consume uses the `--fsds-` prefix with dots and dot-segments
 * lowered to dashes; this mirrors that convention so an override here patches
 * the same variable the generated component CSS reads.
 */
export function slotToCssVar(slot: string): string {
  return "--fsds-" + slot.replace(/\./g, "-");
}

/**
 * Map a token's `resolvesTo` path (e.g. "semantic.color.action.background.
 * primary.default") to the CSS custom property the generated component CSS
 * ultimately READS. This matters because variant rules re-derive a component's
 * slot var FROM its semantic token at closer cascade proximity than a :root
 * slot override — e.g. `.button--primary { --fsds-button-color-background-default:
 * var(--fsds-semantic-color-action-background-primary-default); }`. Overriding
 * the semantic var is what actually re-skins a variant-styled component live.
 * Same dot→dash lowering as slotToCssVar; the path already carries its
 * semantic/core layer prefix.
 */
export function resolvesToCssVar(resolvesTo: string): string {
  return "--fsds-" + resolvesTo.replace(/\./g, "-");
}

/** A literal value that reads as a CSS color (drives swatch vs. text input). */
function looksLikeColor(value: string | undefined): boolean {
  if (!value) return false;
  return COLOR_RE.test(value.trim());
}

/**
 * Resolve a prop's `ref` propType to its union option list, if the referenced
 * type is a union. Returns null for refs to non-union types (e.g. builtin
 * refs) so the caller can fall back to a text control rather than inventing
 * options.
 */
function refUnionOptions(
  contract: ComponentContract,
  refName: string,
): string[] | null {
  const types = (contract.types ?? {}) as Record<string, unknown>;
  const t = types[refName];
  if (
    t &&
    typeof t === "object" &&
    (t as { kind?: string }).kind === "union" &&
    Array.isArray((t as { values?: unknown }).values)
  ) {
    return ((t as { values: unknown[] }).values).map(String);
  }
  return null;
}

interface PropMemberLike {
  name: string;
  propType?: { kind?: string; to?: string };
  default?: unknown;
  description?: string;
}

/**
 * Derive a single control descriptor for one designed-prop member. Returns
 * null for prop kinds that have no meaningful inline editor on this panel
 * (callbacks, arrays, etc.) — those are not part of the visual configuration
 * surface, so we omit them rather than render a dead control.
 */
function derivePropControl(
  contract: ComponentContract,
  member: PropMemberLike,
  variantAxisNames: Set<string>,
): ControlDescriptor | null {
  const kind = member.propType?.kind;
  const base = {
    name: member.name,
    label: member.name,
    description: member.description,
  };

  switch (kind) {
    case "boolean":
      return {
        kind: "boolean",
        ...base,
        defaultValue:
          typeof member.default === "boolean" ? member.default : undefined,
      };
    case "number":
      return {
        kind: "number",
        ...base,
        defaultValue:
          typeof member.default === "number" ? member.default : undefined,
      };
    case "string":
      return {
        kind: "text",
        ...base,
        defaultValue:
          typeof member.default === "string" ? member.default : undefined,
      };
    case "ref": {
      const refName = member.propType?.to;
      const options = refName ? refUnionOptions(contract, refName) : null;
      if (options && options.length > 0) {
        return {
          kind: "select",
          ...base,
          options,
          defaultValue:
            typeof member.default === "string" ? member.default : undefined,
          // A prop that shares a name with a declared variant axis IS that
          // axis — flag it so the panel can render it once, in the Variants
          // section, instead of duplicating it under Properties.
          isVariantAxis: variantAxisNames.has(member.name),
        };
      }
      // ref to a non-union type (builtin etc.): no enumerable options, fall
      // back to a free-text control rather than guessing.
      return { kind: "text", ...base };
    }
    default:
      // callback / array / union-literal / void / promise: not an inline
      // visual control on this panel.
      return null;
  }
}

/**
 * Derive the full control surface for a component contract: variant axes
 * (rendered as selects), designed props (typed controls, with the variant-axis
 * duplicates removed), and component-token rows.
 *
 * Variant axes come from `contract.variants`. When a variant axis also appears
 * as a designed prop (the common case — `size`/`variant` are both), the prop's
 * options/default/description enrich the axis; the prop is NOT repeated under
 * Properties.
 */
export function deriveControls(contract: ComponentContract): DerivedControls {
  const variants = contract.variants ?? {};
  const variantAxisNames = new Set(Object.keys(variants));

  const members =
    (contract.props?.designed?.members as PropMemberLike[] | undefined) ?? [];
  const memberByName = new Map(members.map((m) => [m.name, m]));

  // Variant axes first, enriched by the matching designed prop when present.
  const variantAxes: ControlDescriptor[] = Object.entries(variants).map(
    ([axis, values]) => {
      const member = memberByName.get(axis);
      return {
        kind: "select",
        name: axis,
        label: axis,
        description: member?.description,
        options: values,
        defaultValue:
          typeof member?.default === "string" ? member.default : values[0],
        isVariantAxis: true,
      };
    },
  );

  // Designed props, excluding any that are themselves variant axes (rendered
  // above) and any kind with no inline editor.
  const props: ControlDescriptor[] = [];
  for (const member of members) {
    if (variantAxisNames.has(member.name)) continue;
    const control = derivePropControl(contract, member, variantAxisNames);
    if (control) props.push(control);
  }

  // Component tokens: the flat sidecar map attached as contract.tokens.
  const tokenMap =
    (contract.tokens as Record<string, TokenDefinition> | undefined) ?? {};
  const tokens: TokenRowDescriptor[] = Object.entries(tokenMap).map(
    ([slot, def]) => ({
      slot,
      resolvesTo: def.resolvesTo,
      fallback: def.fallback,
      layer: def.layer,
      isColor: looksLikeColor(def.fallback),
      cssVar: slotToCssVar(slot),
    }),
  );

  return { variantAxes, props, tokens };
}

/**
 * Lower a token-override map (slot → literal value) into a CSS custom-property
 * block scoped to `:root`. The preview iframe writes this into a
 * `<style data-fsds="overrides">` element; because the generated component CSS
 * reads the same `--fsds-<slot>` variables, setting them here re-skins the
 * component live with no rebuild.
 *
 * Keys are slot names (NOT already-prefixed css vars) so callers pass the
 * TokenRowDescriptor.slot directly. Empty / blank values are dropped so a
 * cleared field reverts to the component default rather than emitting an empty
 * declaration. Output is deterministic (insertion order preserved by the
 * caller's map) and ends each declaration with a newline for readability in
 * devtools.
 *
 * When `rows` is supplied, each overridden slot that has a `resolvesTo` ALSO
 * emits a declaration for its semantic/core var. This is what makes the live
 * override win for variant-styled components: a variant rule re-derives the
 * component slot var from the semantic token at closer cascade proximity, so a
 * :root override of the SLOT var alone is masked — but overriding the SEMANTIC
 * var (the leaf the variant rule itself reads) re-skins it. Dimensional tokens
 * with no variant re-derivation still apply via the slot var, so emitting both
 * is safe and strictly more effective. Without `rows`, behavior is unchanged
 * (slot var only) — preserved for callers/tests that pass a bare map.
 */
export function tokenOverridesToCss(
  overrides: Record<string, string>,
  rows?: TokenRowDescriptor[],
): string {
  const resolvesBySlot = new Map(
    (rows ?? []).map((r) => [r.slot, r.resolvesTo]),
  );
  // Use a Map so a slot var and its semantic var don't duplicate, and so the
  // last write wins deterministically.
  const decls = new Map<string, string>();
  for (const [slot, value] of Object.entries(overrides)) {
    if (value == null || String(value).trim() === "") continue;
    decls.set(slotToCssVar(slot), value);
    const resolvesTo = resolvesBySlot.get(slot);
    if (resolvesTo) decls.set(resolvesToCssVar(resolvesTo), value);
  }
  if (decls.size === 0) return "";
  const body = [...decls.entries()]
    .map(([cssVar, value]) => `  ${cssVar}: ${value};`)
    .join("\n");
  return `:root {\n${body}\n}\n`;
}

// ---- Box-model role resolution -------------------------------------------
//
// The BoxModelEditor edits semantic roles (padding sides, gap, min/max width,
// radius, border) but token SLOT NAMES vary per component: padding/gap/min-width
// are conventionally `box-model.*`, while radius/border/width live under a
// component-prefixed slot (`button.size.radius`, `dialog.size.radius.default`,
// `button.size.border`, `dialog.size.md.width`). Rather than special-case
// component names (which the repo's core invariant forbids), we DISCOVER the
// slot for each role from the component's token map by matching slot-name
// patterns. A role with no matching slot is simply absent (e.g. margins never
// map — components don't own outer margin).

export type BoxModelRole =
  | "padding-top"
  | "padding-right"
  | "padding-bottom"
  | "padding-left"
  | "gap"
  | "min-width"
  | "max-width"
  | "radius"
  | "border";

/** A box-model role resolved to a concrete token row, or absent. */
export interface BoxModelBinding {
  role: BoxModelRole;
  row: TokenRowDescriptor;
}

// Ordered matchers per role. The first slot whose name matches wins, so more
// specific patterns are listed first. Patterns are tested against the lowercased
// slot name. `box-model.*` is preferred; component-prefixed fallbacks follow.
const ROLE_MATCHERS: Record<BoxModelRole, RegExp[]> = {
  "padding-top": [/(^|\.)padding-block-start$/, /(^|\.)padding-top$/],
  "padding-bottom": [/(^|\.)padding-block-end$/, /(^|\.)padding-bottom$/],
  "padding-left": [/(^|\.)padding-inline-start$/, /(^|\.)padding-left$/],
  "padding-right": [/(^|\.)padding-inline-end$/, /(^|\.)padding-right$/],
  gap: [/(^|\.)gap$/, /(^|\.)gap\./],
  "min-width": [/(^|\.)min-width$/, /(^|\.)minwidth/],
  "max-width": [/(^|\.)max-width$/, /(^|\.)maxwidth/, /\.size\..*\.width$/],
  radius: [/(^|\.)radius$/, /(^|\.)radius\b/, /\.radius\./],
  border: [/(^|\.)border$/, /\.size\.border$/, /\.border\.width$/],
};

/**
 * Resolve box-model roles to the component's token rows. Returns one binding
 * per role that has a matching slot — roles without a slot are omitted. Used by
 * the BoxModelEditor to know which positions are editable and which token each
 * drives. Pure projection over deriveControls(contract).tokens.
 */
export function resolveBoxModel(tokens: TokenRowDescriptor[]): BoxModelBinding[] {
  const out: BoxModelBinding[] = [];
  const used = new Set<string>();
  for (const role of Object.keys(ROLE_MATCHERS) as BoxModelRole[]) {
    const matchers = ROLE_MATCHERS[role];
    let found: TokenRowDescriptor | undefined;
    for (const re of matchers) {
      found = tokens.find(
        (t) => !used.has(t.slot) && re.test(t.slot.toLowerCase()),
      );
      if (found) break;
    }
    if (found) {
      used.add(found.slot);
      out.push({ role, row: found });
    }
  }
  return out;
}
