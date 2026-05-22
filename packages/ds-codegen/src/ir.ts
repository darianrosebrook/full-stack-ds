/**
 * Component IR: the framework-neutral derivation of a validated contract.
 *
 * The IR is built once per contract by `buildComponentIR`. Emitters consume
 * the IR rather than the raw contract so that:
 *
 *   1. Per-target code stays free of contract field interpretation; adding
 *      Vue/Lit/Svelte does not require duplicating semantics like "which
 *      props become BEM value modifiers" or "which role is implicit on the
 *      chosen root element".
 *   2. Diagnostics (e.g. unresolved type references) are computed in one
 *      place and surfaced to the CLI, not buried in target-specific output.
 *   3. CSS, class recipes, and a11y facts are stable across targets — only
 *      surface syntax differs.
 */

import type {
  ComponentContract,
  ContractChannel,
  ContractCollapseIntent,
  ContractDismissal,
  ContractDismissalTrigger,
  ContractDomNode,
  ContractEventPayloadField,
  ContractEventSignature,
  ContractFocus,
  ContractForm,
  ContractPartDetails,
  ContractPortal,
  ContractSurfaceAnchorRelation,
  ContractSurfaceCollision,
  ContractSurfaceDismissalMode,
  ContractSurfaceKind,
  ContractSurfaceModality,
  ContractSurfaceOpenTrigger,
  ContractSurfacePositioningStrategy,
  ContractSurfacePresence,
  ContractTypeDef,
  StyledPropMember,
  StyleEntry,
  StylePlatform,
  TokenResolution,
  NormalizedStates,
} from "./contract.js";
import {
  getCssPrefix,
  getPartDetails,
  getParts,
  getStyledProps,
  normalizeStates,
} from "./contract.js";
import {
  IMPLICIT_ROLES_BY_ELEMENT,
  ROOT_ONLY_PARTS,
  SEMANTIC_ELEMENTS,
  getRootElement,
  isCompoundPart,
} from "./semantics.js";

// ---------------------------------------------------------------------------
// IR types
// ---------------------------------------------------------------------------

export interface PartIR {
  name: string;
  /** The HTML element this part maps to, when a known semantic is recognized. */
  semanticElement: string | undefined;
  /** True when the codegen treats this part as a separate sub-component. */
  isCompound: boolean;
  /** True when the part is rendered only as part of the root render tree. */
  isRootOnly: boolean;
  /** Optional layout hint used by emitters for horizontal vs vertical stacks. */
  layoutVariant?: "horizontal" | "vertical";
  /**
   * Per-part metadata copied verbatim from `contract.anatomy.details[name]`.
   * Emitters read `details.role`, `details.interactive`, `details.focusable`,
   * `details.aria` etc. to wire up compound-part behavior (e.g. Tabs's tab
   * registers with a context, panel renders conditionally, list hosts the
   * keyboard handler). Absent for components whose contract doesn't declare
   * per-part metadata.
   */
  details?: ContractPartDetails;
}

/**
 * Parsed binding expression. The contract author writes a string form
 * (`"prop:disabled"`, `"channel:checked.value"`, `"channel:checked.onChange"`)
 * which the IR builder normalizes into this discriminated union so emitters
 * don't reparse.
 */
export type BindingExpression =
  | { kind: "prop"; prop: string }
  | { kind: "channel"; channel: string; field: "value" | "onChange" | "defaultValue" }
  | { kind: "literal"; value: string };

/**
 * A node in the rendered DOM tree, derived from `contract.anatomy.dom`.
 * Optional — components without a `dom` block on their contract continue to
 * emit single-root output. When present, framework component-source emitters
 * walk the tree and produce idiomatic output:
 *
 * - React: JSX (`<label className="..."><input onChange={...}/></label>`)
 * - Vue: SFC `<template>` with `@change="..."` and `<slot />`
 * - Svelte: `.svelte` block with `onchange={...}` and `{@render children?.()}`
 * - Angular: component template string with `(change)="..."` and `<ng-content>`
 * - Lit: tagged `html` template with `@change=${...}` and `<slot></slot>`
 *
 * Slot/children placement: `tag === "slot"` or `tag === "children"` marks the
 * node as a placeholder for consumer-provided content. Each framework chooses
 * its idiomatic representation.
 */
export interface DomNodeIR {
  /** HTML tag, or `"slot"`/`"children"` placeholder. */
  tag: string;
  /**
   * Named-slot identifier — only set when `tag === "slot"` and the contract
   * declared a `name` for the slot. Each framework emitter maps this to its
   * idiom (Vue/Lit `<slot name=...>`, React `slots.<name>`, etc.). Absent
   * means the slot is the default/unnamed slot.
   */
  slotName: string | undefined;
  /** Reference to `anatomy.parts` entry; emitters derive the `__part` BEM class. */
  part: string | undefined;
  /** Static attribute values (e.g. `{ type: "checkbox", "aria-hidden": "true" }`). */
  attrs: Record<string, string>;
  /**
   * Dynamic *attribute* bindings keyed by attribute name (`aria-label`,
   * `disabled`, `src`). Each emitter lowers to its attribute syntax.
   * Events and content are deliberately NOT mixed in here — see `events`
   * and `content` fields. The old practice of writing `bindings.onClick`
   * or `bindings.children` was never portable across all five emitters.
   */
  bindings: Record<string, BindingExpression>;
  /**
   * Event bindings keyed by unprefixed event name (`click`, `input`,
   * `change`, ...). Emitters lower per framework idiom. Distinct from
   * attribute bindings because every framework spells events differently
   * (React `onX`, Vue `@x`, Svelte `on:x`, Angular `(x)`, Lit `@x`) and
   * because Angular's template parser actively rejects event-shaped
   * attribute bindings.
   */
  events: Record<string, BindingExpression>;
  /**
   * Single inner-content binding. When set, the element renders the
   * resolved value as its content (interpolation/expression, not a
   * `children`-prop attribute). Mutually exclusive with `children` on
   * the same node — `parseDomNode` rejects nodes that set both.
   */
  content: BindingExpression | undefined;
  children: DomNodeIR[];
  /** Prop guard. `"children"` is special: renders only when consumer-provided children exist. */
  ifProp: string | undefined;
  /** When true, the guard fires when `ifProp` is FALSY (i.e. `if: "!src"`). Emitters render `!prop && ...`. */
  ifNegated: boolean;
}

export interface ResolvedPropIR {
  /** Original prop name as authored. */
  name: string;
  /** Identifier-safe name (kebab-case prop names get camelCased for binding). */
  safeName: string;
  /** Target-neutral type expression (still a TypeScript type string). */
  type: string;
  /** Type alias names referenced by this prop's type expression. */
  typeRefs: string[];
  required: boolean;
  description?: string;
  /** Default literal as a code expression, e.g. `"primary"` or `false`. */
  defaultExpr?: string;
  nodeKind?: StyledPropMember["nodeKind"];
}

/**
 * Class recipe: the purely declarative description of how prop values turn
 * into BEM modifier class names. Emitters convert this into framework syntax.
 */
export interface ClassRecipeIR {
  /** Always present; the root BEM class. */
  base: string;
  /**
   * Props whose *value* becomes the modifier suffix:
   *   class = `${base}--${value}` when `value` is truthy.
   */
  valueModifiers: Array<{
    propName: string;
    safeName: string;
    /** Default expression, copied from the resolved prop when present. */
    defaultExpr?: string;
  }>;
  /**
   * Props whose *presence* (truthy boolean) adds a fixed modifier class:
   *   class = `${base}--${propName}` when `propName` is truthy.
   */
  booleanModifiers: Array<{
    propName: string;
    safeName: string;
  }>;
}

export interface CssBlockIR {
  selector: string;
  declarations: Record<string, string>;
  /**
   * Non-declaration lines (e.g. token placeholder comments) emitted inside
   * the block, after declarations, in stable order.
   */
  comments?: string[];
}

export interface KeyframeIR {
  name: string;
  frames: Array<{
    selector: string;
    declarations: Record<string, string>;
  }>;
}

export interface RootSemanticsIR {
  /** Resolved root HTML element for the component. */
  element: string;
  /** Role explicitly declared on the contract. */
  explicitRole: string | undefined;
  /** Role implied by the chosen root element (e.g. button -> "button"). */
  implicitRole: string | undefined;
  /**
   * The role emitters should render, after eliding implicit/none/compound.
   * `undefined` when no role attribute is needed.
   */
  effectiveRole: string | undefined;
  /** Required labeling attributes from the contract. */
  labeling: string[];
  /** Keyboard interactions declared in the a11y block. */
  keyboard: NonNullable<ComponentContract["a11y"]>["keyboard"];
  /**
   * When set, the root tag is driven at runtime by a styled prop whose value
   * is one of the allowed HTML tag names. Derived when a styled prop's type
   * is a `union` alias and every value is a recognized HTML tag name (so
   * `as: "ul" | "ol" | "dl"` qualifies but `variant: "primary" | "ghost"`
   * does not).
   *
   * Emitters consume this to render a polymorphic root element (React:
   * `const RootTag = as ?? "<default>"; <RootTag>`; Vue: `<component :is>`;
   * etc.) instead of a hardcoded tag from `element`.
   */
  polymorphicTagProp:
    | {
        /** Styled prop name driving the root tag. */
        propName: string;
        /** HTML tags allowed by the prop's union type. */
        allowedTags: string[];
        /** Default tag (from `element`) used when the prop is undefined. */
        defaultTag: string;
      }
    | undefined;
}

export interface UnresolvedTypeRefIR {
  /** The unknown type identifier referenced by a prop. */
  ref: string;
  /** Comma-separated prop names that reference this type. */
  fromProps: string[];
}

/**
 * One controlled/uncontrolled prop trio (value/defaultValue/onChange).
 * Hook generators map each channel to a `useControllableState` call.
 */
export interface NormalizedChannelIR {
  /** Logical channel name (`value`, `open`, `selected`, …). */
  name: string;
  /** Prop carrying the controlled value. */
  valueProp: string;
  /** Prop carrying the uncontrolled initial value, when present. */
  defaultValueProp?: string;
  /** Prop carrying the change handler. */
  changeHandlerProp: string;
  /** Short cross-language type for the channel value. */
  valueType?: string;
  /** Sibling prop that gates the channel (truthy = enabled). */
  enabledByProp?: string;
  description?: string;
  /**
   * Whether the change handler receives a plain value or a DOM event.
   *
   * - `"value"` (default): handler signature is `(value: T) => void`. Each
   *   framework idiomatically wraps native events to extract the value
   *   (e.g. `event.target.checked` for checkboxes) before invoking the
   *   handler. This keeps the contract framework-neutral.
   * - `"event"`: handler signature carries a DOM event (e.g.
   *   `(event: ChangeEvent<HTMLInputElement>) => void`). Framework
   *   emitters preserve the event shape rather than unwrapping. Use
   *   only when the consumer genuinely needs `event.preventDefault()`,
   *   `event.target` access beyond a single value, etc.
   *
   * Inferred from the prop's TypeScript type when not declared explicitly:
   * if the type contains `Event`, `EventHandler`, `ChangeEvent`, etc., the
   * heuristic returns `"event"`; otherwise `"value"`.
   */
  callbackKind: "value" | "event";
}

/**
 * One dismissal trigger (e.g. Escape closes the panel) plus the prop that
 * gates it. Hook generators iterate this to wire keydown/click listeners.
 */
export interface NormalizedDismissalTriggerIR {
  event: ContractDismissalTrigger["event"];
  /** Prop name controlling whether the trigger is active. */
  enabledByProp?: string;
  defaultEnabled: boolean;
  description?: string;
}

/**
 * One emitted event signature (independent of the prop name(s) that fire it).
 * Hook generators expose these in the returned getter object.
 */
export interface NormalizedEventIR {
  /** Event name (not prop name) — `change`, `open`, `dismiss`, etc. */
  name: string;
  /** Prop names that emit this event. */
  emittedViaProps: string[];
  payload: ContractEventPayloadField[];
  returns?: string;
  cancelable: boolean;
  triggeredByActions: string[];
  description?: string;
}

export interface BehaviorIR {
  /** Channels keyed by name (raw contract data, kept for reference). */
  channels: Record<string, ContractChannel> | undefined;
  /** Events keyed by name (raw contract data, kept for reference). */
  events: Record<string, ContractEventSignature> | undefined;
  stateMachine: ComponentContract["stateMachine"];
  form: ContractForm | undefined;
  focus: ContractFocus | undefined;
  portal: ContractPortal | undefined;
  dismissal: ContractDismissal | undefined;
  relationships: ComponentContract["relationships"];

  /** Normalized channel trios for direct use by hook generators. */
  normalizedChannels: NormalizedChannelIR[];
  /** Normalized dismissal triggers, with prop names already resolved. */
  normalizedDismissalTriggers: NormalizedDismissalTriggerIR[];
  /** Normalized event signatures. */
  normalizedEvents: NormalizedEventIR[];
}

/**
 * IR for the presence-surface family (see docs/presence-surfaces.md).
 * Built only when `contract.surface` is present. Resolves the
 * `anchor.part` and `content.part` strings against `PartIR[]` so
 * emitters do not re-resolve. Validates that the referenced parts'
 * `details.role` matches the surface contract's expectations
 * ('trigger' for anchor; one of 'content' | 'region' | 'overlay'
 * for content).
 */
export interface SurfaceAnchorIR {
  /** Resolved PartIR — caller already validated details.role === 'trigger'. */
  part: PartIR;
  relation: ContractSurfaceAnchorRelation;
}

export interface SurfaceContentIR {
  /** Resolved PartIR — caller already validated details.role is one of
   * 'content' | 'region' | 'overlay'. */
  part: PartIR;
  interactive: boolean;
}

export interface SurfacePositioningIR {
  strategy: ContractSurfacePositioningStrategy;
  placementProp: string | undefined;
  collision: ContractSurfaceCollision | undefined;
}

export interface SurfaceTimingIR {
  openDelayProp: string | undefined;
  closeDelayProp: string | undefined;
  autoDismissProp: string | undefined;
}

export interface SurfaceIR {
  kind: ContractSurfaceKind;
  presence: ContractSurfacePresence;
  modality: ContractSurfaceModality;
  anchor: SurfaceAnchorIR | undefined;
  content: SurfaceContentIR | undefined;
  positioning: SurfacePositioningIR | undefined;
  /** Semantic dismissal mode list — composes with BehaviorIR's
   * normalizedDismissalTriggers (which carries enabledBy prop wiring). */
  dismissal: ContractSurfaceDismissalMode[];
  /**
   * Anchor-element interactions that open the surface. Always an array
   * (possibly empty for non-anchored surfaces). Validated fail-loud in
   * buildSurfaceIR: anchored surfaces and tooltips must declare at least
   * one trigger; non-anchored surfaces may omit.
   */
  openTriggers: ContractSurfaceOpenTrigger[];
  timing: SurfaceTimingIR | undefined;
}

export interface ComponentIR {
  /** Identity */
  name: string;
  cssPrefix: string;

  /** Anatomy */
  parts: PartIR[];
  /** Convenience: parts that emit as separate sub-components. */
  compoundParts: PartIR[];

  /** Props / types */
  styledProps: ResolvedPropIR[];
  definedTypes: Record<string, ContractTypeDef>;
  unresolvedTypeRefs: UnresolvedTypeRefIR[];

  /** Variants and states */
  variants: Record<string, string[]>;
  states: NormalizedStates;

  /** Computed BEM class recipe. */
  classRecipe: ClassRecipeIR;

  /** Root semantics + a11y facts. */
  root: RootSemanticsIR;

  /** CSS facts (target-neutral). */
  cssBlocks: CssBlockIR[];
  keyframes: KeyframeIR[];

  /** Higher-level behavior metadata. Emitters can ignore for now. */
  behavior: BehaviorIR;

  /**
   * Presence-surface IR — present only when `contract.surface` is set
   * (see docs/presence-surfaces.md). Emitters MUST NOT read this in
   * Phase F-1; the field is plumbed for forward compatibility and is
   * consumed starting with Phase F-2 (Tooltip migration).
   */
  surface: SurfaceIR | undefined;

  /**
   * Optional DOM tree derived from `contract.anatomy.dom`. When present,
   * framework component-source emitters walk this to produce idiomatic
   * templates with attribute/event bindings. When absent (most contracts
   * today), emitters fall back to existing single-root output.
   */
  dom: DomNodeIR | undefined;

  /** Codegen options. */
  generateTests: boolean;
}

// ---------------------------------------------------------------------------
// Polymorphic-root detection
// ---------------------------------------------------------------------------

/**
 * HTML tag names a polymorphic-root prop is allowed to take. Not exhaustive —
 * just the tags we'd reasonably expect in `as` unions today (list elements,
 * sectioning, phrasing). Adding to this set is safe; emitters only branch
 * on whether *all* of a union's values are members.
 */
const POLYMORPHIC_ROOT_TAGS = new Set<string>([
  "div",
  "span",
  "p",
  "section",
  "article",
  "aside",
  "header",
  "footer",
  "main",
  "nav",
  "ul",
  "ol",
  "dl",
  "li",
  "dt",
  "dd",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "blockquote",
  "figure",
  "figcaption",
]);

/**
 * Derive the polymorphic-tag prop, if any. Authority is structural: a
 * styled prop whose type alias is a string-union of recognized HTML tag
 * names qualifies. The rule does NOT branch on prop name — a prop called
 * `variant: "primary" | "ghost"` correctly returns undefined because its
 * values aren't HTML tags.
 */
function derivePolymorphicTagProp(
  styledProps: ResolvedPropIR[],
  types: Record<string, ContractTypeDef> | undefined,
  defaultTag: string,
): RootSemanticsIR["polymorphicTagProp"] {
  if (!types) return undefined;
  for (const prop of styledProps) {
    const def = types[prop.type];
    if (!def || def.kind !== "union") continue;
    const values = def.values;
    if (!Array.isArray(values) || values.length === 0) continue;
    if (!values.every((v): v is string => typeof v === "string")) continue;
    if (!values.every((v) => POLYMORPHIC_ROOT_TAGS.has(v))) continue;
    return {
      propName: prop.name,
      allowedTags: values,
      defaultTag,
    };
  }
  return undefined;
}

// ---------------------------------------------------------------------------
// Builders
// ---------------------------------------------------------------------------

/**
 * Build a `ComponentIR` from a validated contract. Pure function; no I/O.
 *
 * Validation must happen before this call — `buildComponentIR` assumes the
 * contract conforms to the schema.
 */
export function buildComponentIR(contract: ComponentContract): ComponentIR {
  const cssPrefix = getCssPrefix(contract);
  const styledProps = resolveProps(contract);
  const parts = buildParts(contract);
  const compoundParts = parts.filter(
    (p) => p.isCompound && p.name !== "root",
  );

  const variants = contract.variants || {};
  const states = normalizeStates(contract.states);

  const classRecipe = buildClassRecipe({
    cssPrefix,
    styledProps,
    variants,
    flatStates: states.flat,
  });

  const rootElement = getRootElement(contract);
  const explicitRole = contract.a11y?.role;
  const implicitRole = IMPLICIT_ROLES_BY_ELEMENT[rootElement];
  const effectiveRole =
    explicitRole &&
    explicitRole !== "none" &&
    explicitRole !== "compound" &&
    explicitRole !== implicitRole
      ? explicitRole
      : undefined;

  const cssBlocks = buildCssBlocks(contract, cssPrefix);
  const keyframes = buildKeyframes(contract);

  const behavior = buildBehaviorIR(contract, styledProps);
  const surface = buildSurfaceIR(contract, parts);
  const dom = buildDomTree(contract);

  if (dom) {
    validateDomBindings(dom, behavior.normalizedChannels, styledProps, contract.name);
  }

  // The polymorphic-as default tag comes from the contract's dom-tree root
  // (when present) rather than the a11y-role-derived rootElement, because
  // contracts like List declare the semantic tag via anatomy.dom.tag without
  // setting a role. Falls back to rootElement when no dom tree is authored.
  const polymorphicDefaultTag = dom?.tag ?? rootElement;
  const polymorphicTagProp = derivePolymorphicTagProp(
    styledProps,
    contract.types,
    polymorphicDefaultTag,
  );

  return {
    name: contract.name,
    cssPrefix,
    parts,
    compoundParts,
    styledProps,
    definedTypes: contract.types || {},
    unresolvedTypeRefs: collectUnresolvedTypes(styledProps, contract.types),
    variants,
    states,
    classRecipe,
    root: {
      element: rootElement,
      explicitRole,
      implicitRole,
      effectiveRole,
      labeling: contract.a11y?.labeling ?? [],
      keyboard: contract.a11y?.keyboard,
      polymorphicTagProp,
    },
    cssBlocks,
    keyframes,
    behavior,
    surface,
    dom,
    generateTests: contract.codegen?.tests !== false,
  };
}

/**
 * Walk the IR's dom tree and return true iff it contains a `{ tag: "children" }`
 * placeholder. Used by framework emitters to gate the `children` prop on the
 * generated component's public API: if the contract anatomy doesn't declare
 * a children placement, the component does not accept children and the prop
 * should not appear in the typed interface.
 *
 * Named slots (`{ tag: "slot", name: "X" }`) are NOT counted — they're a
 * separate, named API surface via the `slots` prop.
 */
export function hasChildrenPlaceholder(ir: ComponentIR): boolean {
  if (!ir.dom) return false;
  const stack: DomNodeIR[] = [ir.dom];
  while (stack.length > 0) {
    const node = stack.pop()!;
    if (node.tag === "children") return true;
    if (node.children) stack.push(...node.children);
  }
  return false;
}

/**
 * Group anatomy parts by their declared collapse intent.
 *
 * Returns a map keyed by `ContractCollapseIntent` (e.g.
 * `native-toggle-affordance`) whose values are the part names that share
 * that intent. Parts without `details.collapsibleTo` are omitted.
 *
 * Each non-web emitter consults this map plus its own intent→primitive
 * table to decide whether to collapse the multi-part anatomy into a
 * single native primitive. Web emitters can ignore the result — the
 * `anatomy.dom` tree is the authoritative shape for them.
 */
export function collectCollapseIntents(
  ir: ComponentIR,
): Map<ContractCollapseIntent, string[]> {
  const result = new Map<ContractCollapseIntent, string[]>();
  for (const part of ir.parts) {
    const intent = part.details?.collapsibleTo;
    if (!intent) continue;
    const existing = result.get(intent) ?? [];
    existing.push(part.name);
    result.set(intent, existing);
  }
  return result;
}

// ---------------------------------------------------------------------------
// Binding validation
// ---------------------------------------------------------------------------

/**
 * Walk all bindings in a `DomNodeIR` tree and assert that every
 * `channel:X` reference names a known normalized channel and every
 * `prop:Y` reference names a known styled prop.
 *
 * Throws a descriptive error on the first violation so contract authors
 * see exactly what went wrong (e.g. a misspelled channel name) rather than
 * silently emitting a literal string in the generated output.
 */
function validateDomBindings(
  node: DomNodeIR,
  channels: NormalizedChannelIR[],
  styledProps: ResolvedPropIR[],
  componentName: string,
): void {
  const knownChannels = new Set(channels.map((c) => c.name));
  const channelValueProps = new Set(channels.map((c) => c.valueProp));
  const knownProps = new Set(styledProps.map((p) => p.name));
  validateDomNode(
    node,
    knownChannels,
    channelValueProps,
    knownProps,
    componentName,
  );
}

function validateDomNode(
  node: DomNodeIR,
  knownChannels: Set<string>,
  channelValueProps: Set<string>,
  knownProps: Set<string>,
  componentName: string,
): void {
  for (const [attr, binding] of Object.entries(node.bindings)) {
    if (binding.kind === "channel") {
      if (!knownChannels.has(binding.channel)) {
        throw new Error(
          `[${componentName}] DOM binding "${attr}" references unknown channel ` +
          `'${binding.channel}' (known: [${[...knownChannels].join(", ")}])`,
        );
      }
    } else if (binding.kind === "prop") {
      if (!knownProps.has(binding.prop)) {
        throw new Error(
          `[${componentName}] DOM binding "${attr}" references unknown prop ` +
          `'${binding.prop}' (known: [${[...knownProps].join(", ")}])`,
        );
      }
    }
  }
  // `if: "<name>"` must resolve to a declared prop, a channel name, a
  // channel's value-prop, or the special literal "children". The React
  // emitter falls back to emitting the raw identifier when this fails —
  // producing JS ReferenceErrors at runtime. Catch the issue at IR-build.
  if (node.ifProp && node.ifProp !== "children") {
    const resolves =
      knownProps.has(node.ifProp) ||
      knownChannels.has(node.ifProp) ||
      channelValueProps.has(node.ifProp);
    if (!resolves) {
      throw new Error(
        `[${componentName}] DOM node 'if: "${node.ifProp}"' does not resolve ` +
        `to a declared prop, channel name, or channel value-prop. ` +
        `Declared props: [${[...knownProps].join(", ")}]. ` +
        `Declared channels: [${[...knownChannels].join(", ")}].`,
      );
    }
  }
  for (const child of node.children) {
    validateDomNode(
      child,
      knownChannels,
      channelValueProps,
      knownProps,
      componentName,
    );
  }
}

// ---------------------------------------------------------------------------
// DOM tree
// ---------------------------------------------------------------------------

/**
 * Parse the contract's optional `anatomy.dom` block into a `DomNodeIR` tree.
 * Returns `undefined` for contracts that omit the field — emitters fall back
 * to their existing single-root output in that case.
 */
function buildDomTree(contract: ComponentContract): DomNodeIR | undefined {
  if (!contract.anatomy || Array.isArray(contract.anatomy)) return undefined;
  const dom = contract.anatomy.dom;
  if (!dom) return undefined;
  return parseDomNode(dom);
}

function parseDomNode(node: ContractDomNode): DomNodeIR {
  // Authors interact with three sibling fields:
  //   bindings — attribute bindings (aria-label, disabled, src, …)
  //   events   — event-handler bindings (keyed by unprefixed event name)
  //   content  — single inner-content binding
  //
  // `bindings.textContent` and `bindings.children` are historical sugar for
  // content bindings; translate them into the new `content` field so old
  // contracts keep working without per-emitter special cases. Event-shaped
  // keys in `bindings` are an authoring bug — they appear to work on React
  // (JSX accepts arbitrary props) but break Angular and Lit. Reject them
  // here with a clear message rather than let the bad shape leak into
  // per-framework output.
  const bindings: Record<string, BindingExpression> = {};
  const eventsFromBindings: Record<string, BindingExpression> = {};
  let contentFromBindings: BindingExpression | undefined;
  if (node.bindings) {
    for (const [attr, expr] of Object.entries(node.bindings)) {
      if (/^on[A-Z]/.test(attr)) {
        // Legacy authoring path: contracts that wrote `bindings.onClick`
        // get auto-translated to `events.click` so existing fixtures and
        // older contracts keep working. The raw binding entry is also
        // retained on `bindings` so emitters still reading the legacy
        // location see the same value during the step-4 migration.
        // Once every emitter reads from `events`, drop the bindings copy.
        const eventName = attr.slice(2).toLowerCase();
        eventsFromBindings[eventName] = parseBindingExpression(expr);
        bindings[attr] = parseBindingExpression(expr);
        continue;
      }
      if (attr === "children" || attr === "textContent") {
        // Same dual-pathway pattern for content bindings. Translate to
        // the new content field but keep the raw entry until every
        // emitter migrates to reading `content`.
        contentFromBindings = parseBindingExpression(expr);
        bindings[attr] = parseBindingExpression(expr);
        continue;
      }
      bindings[attr] = parseBindingExpression(expr);
    }
  }
  const events: Record<string, BindingExpression> = { ...eventsFromBindings };
  if (node.events) {
    for (const [evt, expr] of Object.entries(node.events)) {
      events[evt] = parseBindingExpression(expr);
    }
  }
  const children = (node.children ?? []).map(parseDomNode);
  const explicitContent =
    node.content !== undefined ? parseBindingExpression(node.content) : undefined;
  if (explicitContent !== undefined && contentFromBindings !== undefined) {
    throw new Error(
      `anatomy.dom node (tag="${node.tag}", part="${node.part ?? "?"}"): ` +
        `\`content\` is set both as a top-level field and as bindings.{children,textContent}. ` +
        `Pick one — prefer the top-level \`content\`.`,
    );
  }
  const content = explicitContent ?? contentFromBindings;
  if (content !== undefined && children.length > 0) {
    throw new Error(
      `anatomy.dom node (tag="${node.tag}", part="${node.part ?? "?"}"): ` +
        `\`content\` and \`children\` are mutually exclusive on the same node. ` +
        `Wrap the content value in its own child node if you need both.`,
    );
  }
  return {
    tag: node.tag,
    // `name` is meaningful only for slot placeholders. Carry it through the
    // IR so each framework emitter can render the matching named-slot idiom.
    slotName: node.tag === "slot" ? node.name : undefined,
    part: node.part,
    attrs: node.attrs ?? {},
    bindings,
    events,
    content,
    children,
    ...parseIfGuard(node.if),
  };
}

/**
 * Parse the contract's `if` field into `{ ifProp, ifNegated }`. Supports two
 * shapes:
 *   - `"src"`      → `{ ifProp: "src",      ifNegated: false }`  (existing)
 *   - `"!src"`     → `{ ifProp: "src",      ifNegated: true  }`  (new)
 *   - `"children"` → `{ ifProp: "children", ifNegated: false }`  (special placeholder)
 *   - undefined    → `{ ifProp: undefined,  ifNegated: false }`
 *
 * Why negation lives here, not as a general expression: the contract's
 * render-guard grammar is deliberately minimal so all five emitter ports
 * (React, Vue, Svelte, Angular, Lit) share one trivial code path. `!` is
 * symmetric — every framework knows how to negate a boolean. Going further
 * (`&&`, `||`, equality) would force the IR to carry an expression tree
 * and each emitter to walk it. Not worth it for current contract needs.
 */
function parseIfGuard(value: string | undefined): { ifProp: string | undefined; ifNegated: boolean } {
  if (!value) return { ifProp: undefined, ifNegated: false };
  if (value.startsWith("!")) {
    return { ifProp: value.slice(1), ifNegated: true };
  }
  return { ifProp: value, ifNegated: false };
}

/**
 * Parse a binding expression string into its structured form.
 *
 * Grammar (regex-friendly):
 *   binding := "prop:" name
 *            | "channel:" name "." field
 *            | "literal:" value
 *   field   := "value" | "onChange" | "defaultValue"
 *
 * Anything not matching falls through as a literal so contracts that
 * misspell don't silently produce empty output. Consumers should still
 * treat parse errors as authoring bugs.
 */
export function parseBindingExpression(expr: string): BindingExpression {
  const propMatch = expr.match(/^prop:([A-Za-z_$][\w$-]*)$/);
  if (propMatch) {
    return { kind: "prop", prop: propMatch[1] };
  }
  const channelMatch = expr.match(/^channel:([A-Za-z_$][\w$-]*)\.(value|onChange|defaultValue)$/);
  if (channelMatch) {
    return {
      kind: "channel",
      channel: channelMatch[1],
      field: channelMatch[2] as "value" | "onChange" | "defaultValue",
    };
  }
  const literalMatch = expr.match(/^literal:(.*)$/);
  if (literalMatch) {
    return { kind: "literal", value: literalMatch[1] };
  }
  // Unrecognized — treat the whole expression as a literal so the contract's
  // intent (whatever it was) appears in output for visible failure.
  return { kind: "literal", value: expr };
}

/**
 * Normalize the contract's behavior fields into the shapes hook generators
 * actually want to consume. Raw fields are kept on the IR for emitters
 * that need full fidelity; the normalized ones are pre-shaped for the
 * common hook patterns (`useControllableState`, dismissal listeners, event
 * exposure).
 */
function buildBehaviorIR(
  contract: ComponentContract,
  styledProps: ResolvedPropIR[],
): BehaviorIR {
  return {
    channels: contract.channels,
    events: contract.events,
    stateMachine: contract.stateMachine,
    form: contract.form,
    focus: contract.focus,
    portal: contract.portal,
    dismissal: contract.dismissal,
    relationships: contract.relationships,
    normalizedChannels: buildChannelsIR(contract.channels, styledProps),
    normalizedDismissalTriggers: buildDismissalTriggersIR(contract.dismissal),
    normalizedEvents: buildEventsIR(contract.events),
  };
}

const SURFACE_CONTENT_PART_ROLES = new Set<string>([
  "content",
  "region",
  "overlay",
]);

/**
 * Build the presence-surface IR (see docs/presence-surfaces.md). Returns
 * `undefined` when the contract declares no `surface` block. Resolves
 * `anchor.part` and `content.part` strings against the already-built
 * `PartIR[]`, and fails loud when the referenced part is missing or
 * carries the wrong `details.role`.
 *
 * This is the boundary that prevents future contracts from declaring
 * `surface.anchor.part: "trigger"` when no trigger part exists, or
 * pointing `surface.content.part` at an item / decoration / list part.
 */
export function buildSurfaceIR(
  contract: ComponentContract,
  parts: PartIR[],
): SurfaceIR | undefined {
  const surface = contract.surface;
  if (!surface) return undefined;

  const partByName = new Map(parts.map((p) => [p.name, p]));

  let anchor: SurfaceAnchorIR | undefined;
  if (surface.anchor) {
    const part = partByName.get(surface.anchor.part);
    if (!part) {
      throw new Error(
        `Contract "${contract.name}": surface.anchor.part "${surface.anchor.part}" is not declared in anatomy.parts.`,
      );
    }
    if (part.details?.role !== "trigger") {
      throw new Error(
        `Contract "${contract.name}": surface.anchor.part "${surface.anchor.part}" must have details.role === "trigger" (got ${part.details?.role ?? "undefined"}).`,
      );
    }
    anchor = { part, relation: surface.anchor.relation };
  }

  let content: SurfaceContentIR | undefined;
  if (surface.content) {
    const part = partByName.get(surface.content.part);
    if (!part) {
      throw new Error(
        `Contract "${contract.name}": surface.content.part "${surface.content.part}" is not declared in anatomy.parts.`,
      );
    }
    const role = part.details?.role;
    if (!role || !SURFACE_CONTENT_PART_ROLES.has(role)) {
      throw new Error(
        `Contract "${contract.name}": surface.content.part "${surface.content.part}" must have details.role of "content", "region", or "overlay" (got ${role ?? "undefined"}).`,
      );
    }
    content = { part, interactive: surface.content.interactive };
  }

  const positioning: SurfacePositioningIR | undefined = surface.positioning
    ? {
        strategy: surface.positioning.strategy,
        placementProp: surface.positioning.placementProp,
        collision: surface.positioning.collision,
      }
    : undefined;

  const timing: SurfaceTimingIR | undefined = surface.timing
    ? {
        openDelayProp: surface.timing.openDelayProp,
        closeDelayProp: surface.timing.closeDelayProp,
        autoDismissProp: surface.timing.autoDismissProp,
      }
    : undefined;

  const openTriggers = surface.openTriggers ?? [];
  const requiresOpenTriggers =
    surface.kind === "tooltip" ||
    surface.positioning?.strategy === "anchored";
  if (requiresOpenTriggers && openTriggers.length === 0) {
    throw new Error(
      `Contract "${contract.name}": surface.openTriggers must declare at least one of "hover" | "focus" | "click" when surface.kind === "tooltip" or surface.positioning.strategy === "anchored".`,
    );
  }

  return {
    kind: surface.kind,
    presence: surface.presence,
    modality: surface.modality,
    anchor,
    content,
    positioning,
    dismissal: surface.dismissal ?? [],
    openTriggers,
    timing,
  };
}

/**
 * Inspect a TypeScript type string and decide whether the corresponding
 * change handler should be treated as a value-callback or an event-callback.
 *
 * Only treats `Event` as event-shaped when it appears inside a parenthesized
 * function-signature parameter (e.g. `(e: Event) => void`,
 * `(event: ChangeEvent<HTMLInputElement>) => void`). Identifiers like
 * `EventEmitter<T>`, `EventBus`, or `EventPayload` will not match because
 * they appear outside a parameter slot.
 */
export function inferCallbackKind(typeStr: string | undefined): "value" | "event" {
  if (!typeStr) return "value";
  // Look at parenthesized parameter lists (anything before `=>`). Multiple
  // parameter lists are uncommon in handler types, so a single match is fine.
  const paramMatch = typeStr.match(/\(([^()]*)\)\s*=>/);
  const paramList = paramMatch?.[1] ?? "";
  if (!paramList) return "value";
  if (
    /:\s*(?:[\w.]+\s*<[^<>]*>|[\w.]+)\s*\)/.test(`${paramList})`) === false &&
    !paramList.includes(":")
  ) {
    return "value";
  }
  // DOM-event-shaped identifiers in the parameter type position.
  if (
    /:\s*(?:Mouse|Keyboard|Change|Focus|Form|Synthetic|Pointer|Drag|Touch|Wheel|Composition|Animation|Transition|Clipboard|Input|Submit|Reset|Select)Event\b/.test(
      paramList,
    )
  ) {
    return "event";
  }
  if (/:\s*(?:EventHandler|SyntheticEvent)\b/.test(paramList)) return "event";
  // Bare `Event` in parameter position (e.g. `(e: Event) => void`).
  if (/:\s*Event\b/.test(paramList)) return "event";
  return "value";
}

function buildChannelsIR(
  channels: Record<string, ContractChannel> | undefined,
  styledProps: ResolvedPropIR[],
): NormalizedChannelIR[] {
  if (!channels) return [];
  const propsByName = new Map(styledProps.map((p) => [p.name, p]));
  const out: NormalizedChannelIR[] = [];
  for (const [name, c] of Object.entries(channels)) {
    const handlerProp = propsByName.get(c.onChange);
    const callbackKind = inferCallbackKind(handlerProp?.type);
    out.push({
      name,
      valueProp: c.value,
      defaultValueProp: c.defaultValue,
      changeHandlerProp: c.onChange,
      valueType: c.valueType,
      enabledByProp: (c as { enabledBy?: string }).enabledBy,
      description: c.description,
      callbackKind,
    });
  }
  return out;
}

function buildDismissalTriggersIR(
  dismissal: ContractDismissal | undefined,
): NormalizedDismissalTriggerIR[] {
  if (!dismissal?.triggers) return [];
  return dismissal.triggers.map((t) => ({
    event: t.event,
    enabledByProp: t.enabledBy,
    defaultEnabled: t.defaultEnabled !== false,
    description: t.description,
  }));
}

function buildEventsIR(
  events: Record<string, ContractEventSignature> | undefined,
): NormalizedEventIR[] {
  if (!events) return [];
  const out: NormalizedEventIR[] = [];
  for (const [name, e] of Object.entries(events)) {
    out.push({
      name,
      emittedViaProps: e.emittedVia ?? [],
      payload: e.payload ?? [],
      returns: e.returns,
      cancelable: e.cancelable === true,
      triggeredByActions: e.triggeredBy ?? [],
      description: e.description,
    });
  }
  return out;
}

// ---------------------------------------------------------------------------
// Anatomy
// ---------------------------------------------------------------------------

function buildParts(contract: ComponentContract): PartIR[] {
  const allDetails = getPartDetails(contract.anatomy);
  return getParts(contract.anatomy).map((name) => {
    const semanticElement = SEMANTIC_ELEMENTS[name];
    const details = allDetails[name];
    return {
      name,
      semanticElement,
      isCompound: isCompoundPart(name),
      isRootOnly: ROOT_ONLY_PARTS.has(name),
      layoutVariant:
        name === "footer" || name === "list" ? "horizontal" : undefined,
      details,
    };
  });
}

// ---------------------------------------------------------------------------
// Props / type resolution
// ---------------------------------------------------------------------------

const BUILTIN_TYPE_NAMES = new Set([
  "string",
  "number",
  "boolean",
  "void",
  "undefined",
  "null",
  "never",
  "any",
  "unknown",
  "object",
  "Function",
  "Promise",
  "Array",
  "Map",
  "Set",
  "Record",
  "Omit",
  "Partial",
  "ReactNode",
  "ReactElement",
  "ComponentType",
  "CSSProperties",
  "Ref",
  "RefObject",
  "MouseEvent",
  "KeyboardEvent",
  "ChangeEvent",
  "FocusEvent",
  "FormEvent",
  "MouseEventHandler",
  "KeyboardEventHandler",
  "ChangeEventHandler",
  "FocusEventHandler",
  "FormEventHandler",
  "EventHandler",
  "SyntheticEvent",
  "HTMLElement",
  "HTMLButtonElement",
  "HTMLInputElement",
  "HTMLSpanElement",
  "HTMLDivElement",
  "HTMLAnchorElement",
  "HTMLFormElement",
  "HTMLTextAreaElement",
  "HTMLSelectElement",
  "HTMLLabelElement",
  "HTMLTableElement",
  "Element",
  "Node",
  "AllHTMLAttributes",
  "AriaRole",
  "React",
]);

function resolveProps(contract: ComponentContract): ResolvedPropIR[] {
  return getStyledProps(contract).map((p) => ({
    name: p.name,
    safeName: toSafeIdentifier(p.name),
    type: p.type,
    typeRefs: extractTypeRefs(p.type),
    required: p.required ?? false,
    description: p.description,
    defaultExpr: defaultExpr(p),
    nodeKind: p.nodeKind,
  }));
}

function defaultExpr(prop: StyledPropMember): string | undefined {
  if (prop.default === undefined) return undefined;
  if (typeof prop.default === "string") return `"${prop.default}"`;
  if (typeof prop.default === "boolean") return String(prop.default);
  return String(prop.default);
}

function extractTypeRefs(typeStr: string): string[] {
  const refs = typeStr
    .replace(/"[^"]*"/g, "")
    .replace(/'[^']*'/g, "")
    .split(/[|&<>,\s()[\]{}]+/)
    .map((t) => t.trim())
    .filter((t) => t && /^[A-Z]/.test(t));
  return Array.from(new Set(refs));
}

function collectUnresolvedTypes(
  props: ResolvedPropIR[],
  types: ComponentContract["types"],
): UnresolvedTypeRefIR[] {
  const definedTypes = new Set(Object.keys(types || {}));
  const unresolved = new Map<string, Set<string>>();
  for (const p of props) {
    for (const ref of p.typeRefs) {
      if (
        definedTypes.has(ref) ||
        BUILTIN_TYPE_NAMES.has(ref) ||
        ref.startsWith("React")
      )
        continue;
      let bucket = unresolved.get(ref);
      if (!bucket) {
        bucket = new Set();
        unresolved.set(ref, bucket);
      }
      bucket.add(p.name);
    }
  }
  return Array.from(unresolved.entries()).map(([ref, props]) => ({
    ref,
    fromProps: Array.from(props).sort(),
  }));
}

function toSafeIdentifier(name: string): string {
  return name.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
}

// ---------------------------------------------------------------------------
// Class recipe
// ---------------------------------------------------------------------------

/**
 * Boolean props that are *implicitly* state modifiers when not listed in
 * the explicit `states` block. Kept narrow to preserve current behavior.
 */
const IMPLICIT_BOOLEAN_STATE_PROPS = new Set(["disabled", "full", "small"]);

interface ClassRecipeInputs {
  cssPrefix: string;
  styledProps: ResolvedPropIR[];
  variants: Record<string, string[]>;
  flatStates: string[];
}

function buildClassRecipe(inputs: ClassRecipeInputs): ClassRecipeIR {
  const { cssPrefix, styledProps, variants, flatStates } = inputs;
  const propNames = new Set(styledProps.map((p) => p.name));

  const valueModifiers: ClassRecipeIR["valueModifiers"] = [];
  const seenValueProps = new Set<string>();

  // A styled prop becomes a value modifier ONLY if it is the carrier for a
  // declared variant dimension. Free-form-string and channel-state props
  // (`checked`, `value`, `title`, etc.) are not visual variants — emitting
  // `${prefix}--${booleanProp}` produces nonsense classes like
  // `switch--true` and is what the prior `VALUE_MODIFIER_PROPS` shortcut
  // produced.
  for (const p of styledProps) {
    if (variants[p.name]) {
      valueModifiers.push({
        propName: p.name,
        safeName: p.safeName,
        defaultExpr: p.defaultExpr,
      });
      seenValueProps.add(p.name);
    }
  }

  for (const dim of Object.keys(variants)) {
    if (!propNames.has(dim) && !seenValueProps.has(dim)) {
      valueModifiers.push({
        propName: dim,
        safeName: toSafeIdentifier(dim),
      });
      seenValueProps.add(dim);
    }
  }

  const booleanModifiers: ClassRecipeIR["booleanModifiers"] = [];
  for (const p of styledProps) {
    if (seenValueProps.has(p.name)) continue;
    if (p.type !== "boolean" && p.type !== "boolean | undefined") continue;
    const isStateProp =
      flatStates.includes(p.name) || IMPLICIT_BOOLEAN_STATE_PROPS.has(p.name);
    if (!isStateProp) continue;
    booleanModifiers.push({
      propName: p.name,
      // The historical generator strips dashes (so "data-loading" -> "dataloading"),
      // not camelCases them. Preserve to keep generated CSS class names stable.
      safeName: p.name.replace(/-/g, ""),
    });
  }

  return {
    base: cssPrefix,
    valueModifiers,
    booleanModifiers,
  };
}

// ---------------------------------------------------------------------------
// CSS
// ---------------------------------------------------------------------------

function buildKeyframes(contract: ComponentContract): KeyframeIR[] {
  const keyframes = contract.keyframes || {};
  return Object.entries(keyframes).map(([name, frames]) => ({
    name,
    frames: Object.entries(frames).map(([selector, declarations]) => ({
      selector,
      declarations,
    })),
  }));
}

function buildCssBlocks(
  contract: ComponentContract,
  cssPrefix: string,
): CssBlockIR[] {
  return computeCssBlocks(contract, cssPrefix);
}

/**
 * Compute the framework-neutral list of CSS blocks for a contract.
 *
 * This is the single source of truth for selector expansion (BEM blocks,
 * variant modifiers, state modifiers, part-level placeholders, focus,
 * tokens). `css.ts#generateCSS` formats this output as a CSS string;
 * the IR carries the same blocks so non-string consumers (Vue's
 * `<style>`, doc generators, design tokens) can inspect them directly.
 */
export function computeCssBlocks(
  contract: ComponentContract,
  cssPrefix: string,
  options: { platformTarget?: StylePlatform } = {},
): CssBlockIR[] {
  const platformTarget: StylePlatform = options.platformTarget ?? "web";
  const styles = contract.styles ?? {};
  const tokens = contract.tokens ?? {};

  const blocks: CssBlockIR[] = [];
  const emitted = new Set<string>();

  // Root block: slot declarations from tokens.json (always; even when
  // styles.root is absent), then styles.root consumers. Slot declarations
  // live ONLY on root and inherit through the CSS cascade to every
  // descendant selector that reads them via var(--<slug>).
  const rootSelector = `.${cssPrefix}`;
  const slotDeclarations = renderTokenSlots(tokens);
  const rootStyleDeclarations = renderStyleBlock(
    styles.root,
    cssPrefix,
    platformTarget,
  );
  blocks.push({
    selector: rootSelector,
    declarations: { ...slotDeclarations, ...rootStyleDeclarations },
  });
  emitted.add(rootSelector);

  // Every other selector key in styles.json gets its own block. The
  // selector key is interpreted by expandStylesKey:
  //   - "root"          → already handled above; skip.
  //   - bare state name (hover, checked, disabled, ...) → pseudo-class
  //     via DERIVABLE_STATE_TO_PSEUDO.
  //   - "--<value>"     → BEM variant modifier.
  //   - "__<part>"      → BEM anatomy part.
  //   - ":..." / "[..." → pseudo-class / attribute selector on root.
  //   - bare part name  → BEM anatomy part.
  //   - compound (whitespace, +, >, ~, or mixed __/: selectors) →
  //     expanded verbatim with bare parts qualified.
  for (const [key, rawBlock] of Object.entries(styles)) {
    if (key === "root") continue;
    const selector = expandStylesKey(key, cssPrefix);
    if (emitted.has(selector)) continue;
    const declarations = renderStyleBlock(rawBlock, cssPrefix, platformTarget);
    if (Object.keys(declarations).length === 0) continue;
    blocks.push({ selector, declarations });
    emitted.add(selector);
  }

  return blocks;
}

/**
 * Selector keys in `styles` use a compact authoring notation (e.g.
 * `__header`, `--primary`, `:hover`, or compound `__header > .x`). This
 * function expands those into fully-qualified selectors.
 *
 * Resolution order for a bare key (no prefix sigils):
 *   1. State-name lookup in DERIVABLE_STATE_TO_PSEUDO — `hover` → `:hover`.
 *      State semantics are universal; anatomy parts wouldn't share names
 *      with state pseudo-classes.
 *   2. Anatomy-part fallback — `track` → `.{prefix}__track`.
 *
 * Exported so validation/styles.ts can detect selector-aliasing
 * collisions between two distinct keys that resolve to the same selector.
 */
export function expandStylesKey(key: string, prefix: string): string {
  const isCompound =
    /[\s+~>]/.test(key) ||
    (key.includes(":") && key.includes("__")) ||
    (key.startsWith("--") && key.includes(" "));

  if (isCompound) return expandComplexSelector(key, prefix);
  // Already-qualified single-segment selectors (start with `.`, `#`, or
  // `*`) pass through verbatim. e.g. `.avatar--small` from the author
  // should emit as `.avatar--small`, NOT `.avatar__.avatar--small`.
  if (key.startsWith(".") || key.startsWith("#") || key.startsWith("*")) {
    return key;
  }
  if (key.startsWith("--")) return `.${prefix}${key}`;
  if (key.startsWith(":") || key.startsWith("[")) return `.${prefix}${key}`;
  if (key.startsWith("__")) return `.${prefix}${key}`;
  if (key.includes(":") || key.includes("[")) {
    return expandComplexSelector(key, prefix);
  }
  const statePseudo = DERIVABLE_STATE_TO_PSEUDO[key];
  if (statePseudo) return `.${prefix}${statePseudo}`;
  return `.${prefix}__${key}`;
}

/**
 * Expand a compound CSS selector key, qualifying bare part identifiers
 * with the BEM prefix.
 */
export function expandComplexSelector(key: string, prefix: string): string {
  const segments = key.split(/(\s*[+~>]\s*|\s+)/);
  return segments
    .map((segment) => {
      const trimmed = segment.trim();
      if (!trimmed || /^[+~>]$/.test(trimmed)) return segment;
      // Already-qualified or root-anchored selectors emit verbatim: a
      // segment that starts with `.`, `:`, `[`, `#`, or `*` is fully
      // specified by the author and must not be re-qualified with the
      // BEM prefix. This includes `:has(.x__input:checked)`, `.x__track`,
      // `[aria-pressed="true"]`, etc.
      if (/^[.:#*[]/.test(trimmed)) return segment;
      if (trimmed.startsWith("--")) return `.${prefix}${trimmed}`;
      if (trimmed.startsWith("__")) return `.${prefix}${trimmed}`;
      const match = trimmed.match(/^([a-zA-Z][\w-]*)([:[\s].*)?$/);
      if (match) {
        const [, name, suffix = ""] = match;
        return `.${prefix}__${name}${suffix}`;
      }
      return `.${prefix}__${trimmed}`;
    })
    .join("");
}

/**
 * Render the flat slot pool from `<Name>.tokens.json` into root-level CSS
 * custom-property declarations.
 *
 * For each entry in `tokens`:
 *   - `{ resolvesTo, fallback }` → `--<tokenSlug(name)>: var(--<tokenSlug(resolvesTo)>, <fallback>);`
 *   - `{ literal }`              → `--<tokenSlug(name)>: <literal>;`
 *
 * The result is merged onto the component's root selector — `.{cssPrefix}` —
 * so all descendant selectors read the slots through the CSS cascade by
 * name. Consumers (in `<Name>.styles.json`) reference the slot via
 * `var(--<tokenSlug(name)>)`; the fallback chains automatically.
 */
function renderTokenSlots(
  tokens: Record<string, TokenResolution>,
): Record<string, string> {
  const declarations: Record<string, string> = {};
  for (const [name, value] of Object.entries(tokens)) {
    if (!value || typeof value !== "object") continue;
    const slotProp = `--${tokenSlug(name)}`;
    if (typeof value.literal === "string") {
      declarations[slotProp] = value.literal;
      continue;
    }
    if (typeof value.resolvesTo === "string") {
      const globalRef = `--${tokenSlug(value.resolvesTo)}`;
      declarations[slotProp] =
        typeof value.fallback === "string"
          ? `var(${globalRef}, ${value.fallback})`
          : `var(${globalRef})`;
    }
  }
  return declarations;
}

/**
 * Render one selector's property → styleEntry map into CSS declarations.
 *
 * For each `(property, entry)` pair:
 *   - `entry.resolvesTo` → `<property>: var(--<tokenSlug(resolvesTo)>[, <fallback>]);`
 *     The slot is declared on root by `renderTokenSlots`; the cascade
 *     delivers it. Authoring a global-graph path (`core.*` / `semantic.*`)
 *     at a styles.json consumer site is unusual — supported but flagged
 *     by the validator (component-local slots are the doctrine).
 *   - `entry.literal` (+ `platforms`) → `<property>: <literal>;`, emitted
 *     only if `platformTarget` is in `platforms`. Required-array on
 *     literals: an entry that doesn't apply to the current target is
 *     silently dropped at this site (other emitters honor it).
 */
function renderStyleBlock(
  block: Record<string, StyleEntry> | undefined,
  _cssPrefix: string,
  platformTarget: StylePlatform,
): Record<string, string> {
  if (!block) return {};
  const declarations: Record<string, string> = {};
  for (const [property, entry] of Object.entries(block)) {
    if (!entry || typeof entry !== "object") continue;
    if (typeof entry.literal === "string") {
      const platforms = entry.platforms ?? [];
      if (!platforms.includes(platformTarget)) continue;
      declarations[property] = entry.literal;
      continue;
    }
    if (typeof entry.resolvesTo === "string") {
      const platforms = entry.platforms;
      if (platforms && !platforms.includes(platformTarget)) continue;
      const ref = `--${tokenSlug(entry.resolvesTo)}`;
      declarations[property] =
        typeof entry.fallback === "string"
          ? `var(${ref}, ${entry.fallback})`
          : `var(${ref})`;
    }
  }
  return declarations;
}

/**
 * Convert a dotted token path into its CSS custom-property slug,
 * prefixed with the project namespace.
 *
 *   "semantic.color.fg" → "fsds-semantic-color-fg"
 *
 * Caller prepends `--` (e.g. `--${tokenSlug(...)}`) so the IR never carries
 * the leading dashes — same convention as packages/ds-tokens/build/core/
 * index.ts:tokenPathToCSSVar (which is the authority for the prefix
 * choice; see docs/tokens-architecture.md §Decision 2).
 *
 * The prefix is identical on every call. Threading it as a parameter
 * would just push the constant up to every caller without unlocking
 * any meaningful configurability — if the prefix needs to change, this
 * is the one site to edit, and the token-graph emitter is the other.
 */
function tokenSlug(name: string): string {
  return `fsds-${name.replace(/\./g, "-")}`;
}

/**
 * States that are pseudo-class-derivable in CSS. When a contract declares
 * one of these in `states`, the emitter generates a pseudo-class selector
 * (e.g. `.spinner:hover { ... }`) rather than a BEM modifier class. This
 * keeps the generated stylesheets idiomatic — designers expect `:hover`,
 * not `.spinner--hover` — and means we don't need any JS to apply the
 * state class.
 *
 * Non-derivable states (`entering`, `leaving`, `loading`, etc.) still get
 * the legacy `.${cssPrefix}--state` BEM modifier so authors / hooks can
 * toggle them via class.
 */
const DERIVABLE_STATE_TO_PSEUDO: Record<string, string> = {
  hover: ":hover",
  focus: ":focus-visible",
  "focus-visible": ":focus-visible",
  "focus-within": ":focus-within",
  active: ":active",
  disabled: ":disabled",
  checked: ":checked",
  // ARIA-derived states map to attribute selectors so they cover both
  // React's `aria-*` attributes and any native equivalents.
  expanded: '[aria-expanded="true"]',
  pressed: '[aria-pressed="true"]',
  selected: '[aria-selected="true"]',
};
