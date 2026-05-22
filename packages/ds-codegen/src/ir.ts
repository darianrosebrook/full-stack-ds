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
  /** Dynamic bindings keyed by attribute or event name (e.g. `onChange`, `disabled`). */
  bindings: Record<string, BindingExpression>;
  children: DomNodeIR[];
  /** Truthy-prop guard. `"children"` is special: renders only when consumer-provided children exist. */
  ifProp: string | undefined;
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
  const bindings: Record<string, BindingExpression> = {};
  if (node.bindings) {
    for (const [attr, expr] of Object.entries(node.bindings)) {
      bindings[attr] = parseBindingExpression(expr);
    }
  }
  return {
    tag: node.tag,
    // `name` is meaningful only for slot placeholders. Carry it through the
    // IR so each framework emitter can render the matching named-slot idiom.
    slotName: node.tag === "slot" ? node.name : undefined,
    part: node.part,
    attrs: node.attrs ?? {},
    bindings,
    children: (node.children ?? []).map(parseDomNode),
    ifProp: node.if,
  };
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
): CssBlockIR[] {
  const styles = contract.styles || {};
  const variants = contract.variants || {};
  const flatStates = normalizeStates(contract.states).flat;
  const tokens = contract.tokens || {};
  const parts = getParts(contract.anatomy);

  const blocks: CssBlockIR[] = [];
  const emitted = new Set<string>();

  // Variant-keyed token routing (Gap 1b fix, TOKENS-WORKSTREAM-STEP-06A-I).
  //
  // Contracts authored in the flat shape put variant-conditional tokens
  // under tokens.root with keys like "switch.size.md.track.width". Naively
  // walking tokens.root would emit those on the base `.switch` selector,
  // which is wrong for two reasons: (a) they only apply when the size
  // variant is the named value, and (b) emitting them on root means
  // size=md tokens leak onto size=sm/lg instances at runtime.
  //
  // The partition recognizes keys of the form
  //   <cssPrefix>.<variantName>.<variantValue>.<rest>
  // where variantName ∈ Object.keys(contract.variants) and variantValue ∈
  // contract.variants[variantName]. Those entries are routed away from
  // root and into per-variant buckets, then merged into the
  // `.<cssPrefix>--<variantValue>` block below. Entries that don't match
  // any variant stay at root. We also surface the default variant value
  // (per contract.props.styled.members[name=variantName].default) so
  // its tokens emit on `.<cssPrefix>` in addition to `.<cssPrefix>--<default>`
  // — the base selector should reflect the default-variant rendering.
  const rootTokensRaw =
    ((tokens as Record<string, unknown>).root as Record<string, unknown>) ?? {};
  const { variantBuckets } = partitionVariantKeyedRootTokens({
    rootTokens: rootTokensRaw,
    cssPrefix,
    variants,
  });
  const variantDefaults = collectVariantDefaults(contract);

  // Build the set of (dim, value) pairs that count as "default" — those are
  // the entries that should appear on the base selector in addition to
  // their `.<prefix>--<value>` modifier.
  const defaultVariantPairs = new Set<string>();
  for (const [dim, defaultValue] of Object.entries(variantDefaults)) {
    if (defaultValue) defaultVariantPairs.add(`${dim}:${defaultValue}`);
  }

  // Decide per-key whether it belongs on the root selector. Preserves
  // tokens.root insertion order so the emitted CSS doesn't shuffle on
  // contract authoring just because variant-keyed entries are now routed
  // differently. A key is on root if:
  //   - it's not variant-keyed at all, OR
  //   - it IS variant-keyed and the third segment matches the dim's default.
  function rootIncludes(key: string): boolean {
    const segments = key.split(".");
    if (segments.length < 4 || segments[0] !== cssPrefix) return true;
    const candidateDim = segments[1];
    const candidateValue = segments[2];
    if (
      !variants[candidateDim] ||
      !variants[candidateDim].includes(candidateValue)
    ) {
      return true;
    }
    return defaultVariantPairs.has(`${candidateDim}:${candidateValue}`);
  }

  const rootMergedTokens: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(rootTokensRaw)) {
    if (rootIncludes(key)) rootMergedTokens[key] = value;
  }

  // Root block first; always emitted (even if empty) for stable ordering.
  // Token declarations are merged BEFORE styled values so authored styles
  // win when both target the same property (intentional: codegen output
  // should not erase explicit design decisions in the contract's `styles`).
  const rootTokenRender = renderTokens(rootMergedTokens);
  blocks.push({
    selector: `.${cssPrefix}`,
    declarations: { ...rootTokenRender.declarations, ...(styles.root ?? {}) },
    comments: rootTokenRender.comments,
  });

  for (const [key, declarations] of Object.entries(styles)) {
    if (key === "root") continue;
    const selector = expandStylesKey(key, cssPrefix);
    blocks.push({ selector, declarations });
    emitted.add(selector);
  }

  for (const [dim, values] of Object.entries(variants)) {
    for (const val of values) {
      const sel = `.${cssPrefix}--${val}`;
      if (emitted.has(sel)) continue;
      // Per-variant tokens authored under tokens.<dim>.<val> (legacy nested
      // shape) merge with tokens routed from root via variant-keyed names
      // (flat shape). Flat-shape entries win on key collision — they're
      // the more precise authoring form.
      const nestedVariantTokens = (
        tokens as Record<string, Record<string, unknown>>
      )[dim]?.[val];
      const partitionedVariantTokens = variantBuckets[dim]?.[val];
      const mergedVariantTokens: Record<string, unknown> = {
        ...(nestedVariantTokens ?? {}),
        ...(partitionedVariantTokens ?? {}),
      };
      const { declarations, comments } = renderTokens(mergedVariantTokens);
      blocks.push({ selector: sel, declarations, comments });
      emitted.add(sel);
    }
  }

  for (const state of flatStates) {
    if (state === "default") continue;
    const pseudo = DERIVABLE_STATE_TO_PSEUDO[state];
    const sel = pseudo
      ? `.${cssPrefix}${pseudo}`
      : `.${cssPrefix}--${state}`;
    if (emitted.has(sel)) continue;
    // Allow `tokens.<state>` to populate declarations on the state selector
    // (mirrors how variants and parts pick up their own token block).
    const stateTokens = (tokens as Record<string, unknown>)[state];
    const { declarations, comments } = renderTokens(stateTokens);
    blocks.push({ selector: sel, declarations, comments });
    emitted.add(sel);
  }

  for (const part of parts) {
    if (ROOT_ONLY_PARTS_FOR_CSS.has(part)) continue;
    const sel = `.${cssPrefix}__${part}`;
    if (emitted.has(sel)) continue;
    const partTokens = (tokens as Record<string, unknown>)[part];
    const { declarations, comments } = renderTokens(partTokens);
    blocks.push({ selector: sel, declarations, comments });
  }

  const focusSel = `.${cssPrefix}:focus-visible`;
  if (!emitted.has(focusSel)) {
    const focusTokens = (tokens as Record<string, unknown>).focus;
    const { declarations, comments } = renderTokens(focusTokens);
    if (Object.keys(declarations).length > 0 || comments.length > 0) {
      blocks.push({ selector: focusSel, declarations, comments });
    }
  }

  return blocks;
}

/**
 * Partition tokens.root entries into "stays at root" and "belongs to a
 * specific variant value." Variant-keyed entries match the pattern
 *   <cssPrefix>.<variantName>.<variantValue>.<rest>
 * where variantName ∈ Object.keys(variants) and variantValue ∈
 * variants[variantName]. Anything else (different prefix, different
 * variant name, an unknown variant value, or a key with no variant
 * segment at all) is treated as base-selector content and stays at root.
 *
 * The split is order-independent — partitioning N tokens.root entries
 * is O(N) and never reorders within a bucket, so downstream rendering
 * stays deterministic.
 *
 * Exported for unit testing the partition logic in isolation. Production
 * use is internal to computeCssBlocks.
 */
export function partitionVariantKeyedRootTokens(input: {
  rootTokens: Record<string, unknown>;
  cssPrefix: string;
  variants: Record<string, string[]>;
}): {
  rootRemainder: Record<string, unknown>;
  variantBuckets: Record<string, Record<string, Record<string, unknown>>>;
} {
  const { rootTokens, cssPrefix, variants } = input;
  const rootRemainder: Record<string, unknown> = {};
  const variantBuckets: Record<
    string,
    Record<string, Record<string, unknown>>
  > = {};

  // Index variant values for O(1) lookup per variant name.
  const variantValueSets: Record<string, Set<string>> = {};
  for (const [dim, values] of Object.entries(variants)) {
    variantValueSets[dim] = new Set(values);
  }

  for (const [key, value] of Object.entries(rootTokens)) {
    const segments = key.split(".");
    // Need at minimum: <cssPrefix>.<variantName>.<variantValue>.<rest>
    // i.e. 4 segments. Shorter keys can't be variant-keyed.
    if (segments.length < 4 || segments[0] !== cssPrefix) {
      rootRemainder[key] = value;
      continue;
    }
    const candidateDim = segments[1];
    const candidateValue = segments[2];
    const valueSet = variantValueSets[candidateDim];
    if (!valueSet || !valueSet.has(candidateValue)) {
      // Either the second segment doesn't name a variant dimension, or
      // the third segment isn't one of its declared values. Could still
      // be a legit root token like "switch.color.thumb.background.default"
      // — `color` is not a variant. Stays at root.
      rootRemainder[key] = value;
      continue;
    }
    if (!variantBuckets[candidateDim]) {
      variantBuckets[candidateDim] = {};
    }
    if (!variantBuckets[candidateDim][candidateValue]) {
      variantBuckets[candidateDim][candidateValue] = {};
    }
    variantBuckets[candidateDim][candidateValue][key] = value;
  }

  return { rootRemainder, variantBuckets };
}

/**
 * Collect each variant dimension's default value from the contract's
 * props bucket. The contract authoring shape is:
 *   props.styled.members[].name = "<dimension>"
 *   props.styled.members[].default = "<value>"
 * Missing defaults mean "no implicit default" and the caller treats the
 * dimension as having no preferred value for the base selector.
 */
function collectVariantDefaults(
  contract: ComponentContract,
): Record<string, string | undefined> {
  const out: Record<string, string | undefined> = {};
  const styledMembers = contract.props?.styled?.members ?? [];
  for (const member of styledMembers) {
    if (member && typeof member === "object" && typeof member.name === "string") {
      const def = (member as { default?: unknown }).default;
      if (typeof def === "string") {
        out[member.name] = def;
      }
    }
  }
  return out;
}

/**
 * Selector keys in `styles` use a compact authoring notation (e.g.
 * `__header`, `--primary`, `:hover`, or compound `__header > .x`). This
 * function expands those into fully-qualified selectors.
 */
function expandStylesKey(key: string, prefix: string): string {
  const isCompound =
    /[\s+~>]/.test(key) ||
    (key.includes(":") && key.includes("__")) ||
    (key.startsWith("--") && key.includes(" "));

  if (isCompound) return expandComplexSelector(key, prefix);
  if (key.startsWith("--")) return `.${prefix}${key}`;
  if (key.startsWith(":") || key.startsWith("[")) return `.${prefix}${key}`;
  if (key.startsWith("__")) return `.${prefix}${key}`;
  if (key.includes(":") || key.includes("[")) {
    return expandComplexSelector(key, prefix);
  }
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
 * Render a token leaf into CSS. Two shapes:
 *
 *   - Flat string array (legacy):
 *       ["btn.color.primary-bg", ...]
 *     emitted as commented placeholders that designers fill in by hand.
 *
 *   - Structured map (preferred):
 *       { "btn.color.primary-bg": { resolvesTo, fallback, property, layer } }
 *     emitted as `${property}: var(--<resolvesTo>, <fallback>);` declarations
 *     when `property` is set. Entries without `property` fall through to the
 *     comment shim.
 *
 * Returns both the declarations to merge into the block and any leftover
 * comment lines that should accompany them.
 */
function renderTokens(
  raw: unknown,
): { declarations: Record<string, string>; comments: string[] } {
  if (raw == null) return { declarations: {}, comments: [] };

  if (Array.isArray(raw)) {
    return { declarations: {}, comments: legacyTokenComments(raw) };
  }

  if (typeof raw === "object") {
    // Two-hop indirection (TOKENS-WORKSTREAM-STEP-06A-II):
    //   For each structured TokenResolution with a `property`, emit TWO
    //   declarations on the same block:
    //     1. `--fsds-{slug(name)}: var(--fsds-{slug(resolvesTo)}, {fallback});`
    //        The component-scoped indirection slot. Fallback inside the
    //        inner var() preserves the safety net at the slot boundary.
    //     2. `{property}: var(--fsds-{slug(name)});`
    //        The property consumes the slot, no second arg. A brand can
    //        override the slot or the global token; either way the
    //        consumer doesn't have to know.
    //
    // Two passes so ALL slot declarations precede the property references
    // in CSS output. A single pass would interleave slot/property/slot/...
    // and — for contracts that author two TokenResolutions onto the same
    // CSS property (e.g. switch.color.track.background and
    // switch.color.thumb.background both targeting `background-color`) —
    // would produce confusing output where the property reference shows
    // up textually before its slot's declaration. With two passes, the
    // CSS reads:
    //
    //   .switch {
    //     --fsds-switch-color-track-background-default: var(--fsds-..., #cecece);
    //     --fsds-switch-color-thumb-background-default: var(--fsds-..., #ffffff);
    //     background-color: var(--fsds-switch-color-thumb-background-default);  /* last-writer-wins */
    //   }
    //
    // The last-writer-wins on `background-color` is a contract-authoring
    // issue (two tokens fighting over one CSS property in one selector)
    // surfaced by the validator workstream — not something renderTokens
    // can resolve. Emitting both slots makes the loss visible: a brand
    // override on either slot still gets to declare its preference.
    //
    // Entries without `property` produce only a CSS comment shim. A slot
    // declaration with no consumer would be dead weight; we won't emit
    // one (6a-ii falsification clause).
    const declarations: Record<string, string> = {};
    const comments: string[] = [];
    const entries = Object.entries(raw as Record<string, unknown>);

    // Pass 1: slot declarations and legacy comments (no property refs yet).
    for (const [name, value] of entries) {
      if (typeof value === "string") {
        // Mixed-map shape: legacy entry that still needs migration.
        comments.push(`/* --${tokenSlug(value)}: ; */`);
        continue;
      }
      if (isTokenResolution(value)) {
        const slotProp = `--${tokenSlug(name)}`;
        const globalRef = `--${tokenSlug(value.resolvesTo)}`;
        if (value.property) {
          declarations[slotProp] = `var(${globalRef}, ${value.fallback})`;
        } else {
          // Without a `property`, slot has no consumer — keep the intent
          // as a comment that designers can promote later.
          comments.push(`/* ${globalRef}: ${value.fallback}; */`);
        }
      } else {
        comments.push(`/* --${tokenSlug(name)}: ; */`);
      }
    }

    // Pass 2: property references (last-writer-wins on conflict).
    for (const [name, value] of entries) {
      if (
        isTokenResolution(value) &&
        value.property &&
        typeof value.property === "string"
      ) {
        declarations[value.property] = `var(--${tokenSlug(name)})`;
      }
    }

    return { declarations, comments };
  }

  return { declarations: {}, comments: [] };
}

function legacyTokenComments(tokens: string[]): string[] {
  return tokens.map((t) => `/* --${tokenSlug(t)}: ; */`);
}

function isTokenResolution(v: unknown): v is {
  resolvesTo: string;
  fallback: string;
  property?: string;
  layer?: string;
} {
  if (!v || typeof v !== "object") return false;
  const o = v as Record<string, unknown>;
  return typeof o.resolvesTo === "string" && typeof o.fallback === "string";
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
 * Parts whose names are infrastructural (focus rings, providers, etc.) and
 * should not be emitted as standalone BEM placeholders.
 */
const ROOT_ONLY_PARTS_FOR_CSS = new Set([
  "root",
  "focus",
  "context",
  "provider",
]);

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
