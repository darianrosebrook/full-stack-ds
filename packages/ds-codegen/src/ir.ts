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
   * Native HTML tag declared by the contract for this part. Derivation order:
   *
   *   1. `anatomy.details[name].tag` if present (primary authority).
   *   2. `anatomy.dom` node tag if the part appears in the dom tree
   *      (secondary; equality with details.tag is validated upstream).
   *   3. undefined — emitters fall back to `semanticElement` /
   *      `SEMANTIC_ELEMENTS` behavior.
   *
   * Emitters consult `nativeTag` when deciding whether to wrap a compound
   * subcomponent in Stack vs render the native tag directly. When the tag
   * is in `TABLE_COMPOSITION_TAGS` (table, thead, tbody, tfoot, tr, th, td,
   * caption), the subcomponent emits the native element directly:
   *   - React/Vue/Svelte: <tag className="...">{children}</tag>, no Stack.
   *   - Angular: attribute selector (e.g. tr[fsdsTableRow]); host element
   *     IS the native tag, supplied by the consumer's template.
   *   - Lit: NOT registered as a sub-element custom element (autonomous
   *     custom elements cannot be valid native table children); the root
   *     Lit class owns the full native template via shadow-DOM slots.
   *
   * For parts not in the table composition set, nativeTag is still
   * populated when declared, but emitters MAY ignore it (no general
   * native-leaf policy is implied by this slice).
   */
  nativeTag?: string;
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
 * Tags that participate in the HTML table content model. Subcomponents
 * whose `nativeTag` is in this set render the native element directly
 * (no Stack wrapper) per the table realization doctrine. Scoped
 * intentionally to the table set — extending to other native elements
 * (list/select/details) is a separate slice
 * (CODEGEN-NATIVE-LEAF-EXTENSION-LIST-01 etc.).
 *
 * Source fact: HTML5 table content model.
 * Applies by: tag (not component name).
 * Removable when: never (HTML spec constant).
 */
export const TABLE_COMPOSITION_TAGS: ReadonlySet<string> = new Set([
  "table",
  "thead",
  "tbody",
  "tfoot",
  "tr",
  "th",
  "td",
  "caption",
]);

/**
 * Parsed binding expression. The contract author writes a string form
 * (`"prop:disabled"`, `"channel:checked.value"`, `"channel:checked.onChange"`,
 * `"iter:index"`, `"iter:item"`) which the IR builder normalizes into this
 * discriminated union so emitters don't reparse.
 *
 * `iterationLocal` carries the semantic *role* of the iteration variable —
 * either the loop index or the current item — not its emitted lexical name.
 * Emitters resolve the role to whatever `indexVar` / `itemVar` the enclosing
 * `IterationIR` declared (`index` by default; contract authors can override).
 * This is what stops the V1 grammar from lying about iteration locals: a
 * contract author who wrote `prop:index` was previously relying on the
 * emitter to silently decide whether `index` meant "the component prop named
 * index" or "the loop-callback parameter named index", with the answer
 * depending on whether the binding sat inside an iteration scope. With
 * `iterationLocal`, that resolution lives in the IR build, not in five
 * separately-duplicated emitter heuristics.
 *
 * `path` is an optional dotted projection appended to `prop`/`channel`/
 * `iterationLocal` roots, e.g. `"iter:item.value"` parses to
 * `{ kind: "iterationLocal", local: "item", path: ["value"] }`. The grammar
 * is bounded to object-field reads (BINDING-EXPRESSION-V2-PATH-01):
 *   - No transforms (`upper`, `length`, ...)
 *   - No comparisons (`===`, `==`)
 *   - No optional chaining (`?.`)
 *   - No array indexing (`[0]`)
 *   - No function calls (`()`)
 *   - No boolean / arithmetic expressions
 *   - No set-membership / contains predicates
 *   - No fallback expressions (`?? x`)
 * Each segment must match `[A-Za-z_$][\w$]*`. `literal:` carries no path.
 * Paths on `channel:` apply *after* the field, so the only well-formed
 * channel-with-path is `channel:X.value.<seg>(.<seg>)*` (paths on
 * `.onChange`/`.defaultValue` are syntactically rejected — they're
 * callbacks/defaults, not value-shaped reads).
 *
 * Out of scope this slice: `iterate.source` paths (the iteration root must
 * still be `prop:X` or `channel:X.value` with no tail).
 *
 * `predicate` is a closed boolean-shaped binding form
 * (BINDING-EXPRESSION-V2-PREDICATE-01). It carries an operator name and two
 * operand sub-expressions, each itself a value-shaped `BindingExpression`.
 * The grammar is *closed* — there is a finite set of operators, no
 * arbitrary JS, no nested predicates, no boolean composition. Operators:
 *
 *   - `eq(L, R)`         — `L === R`. Use when both operands are scalar.
 *   - `contains(C, I)`   — `C.includes(I)`. Use when `C` is array-shaped
 *                          and the comparison is set membership.
 *   - `memberOf(X, S)`   — adapts to `S`'s runtime shape:
 *                          `Array.isArray(S) ? S.includes(X) : X === S`.
 *                          Use when the channel/prop declares a `T | T[]`
 *                          union (e.g. Select's `value: string | string[]`).
 *
 * Predicates are only legal in boolean attribute-binding contexts in this
 * slice (the canonical witness is `aria-selected`). They are rejected in
 * `content`, `events`, and `iterate.source` — those positions consume
 * value-shaped expressions, not boolean ones. Predicates may not nest:
 * the operand positions must be value-shaped (`prop`, `channel`, `literal`,
 * `iterationLocal`), never another `predicate`. Boolean composition
 * (AND / OR / NOT) and arbitrary comparison operators are explicitly held
 * for a future grammar extension.
 */
export type BindingExpression =
  | { kind: "prop"; prop: string; path?: string[] }
  | { kind: "channel"; channel: string; field: "value" | "onChange" | "defaultValue"; path?: string[] }
  | { kind: "literal"; value: string }
  | { kind: "iterationLocal"; local: "index" | "item"; path?: string[] }
  | {
      kind: "predicate";
      op: BindingPredicateOp;
      left: BindingExpression;
      right: BindingExpression;
    };

/**
 * Closed set of predicate operators (BINDING-EXPRESSION-V2-PREDICATE-01).
 * Adding a new operator requires extending this type AND the lowering in
 * every framework emitter. There is intentionally no escape hatch for
 * arbitrary expressions — the grammar is the contract.
 */
export type BindingPredicateOp = "eq" | "contains" | "memberOf";

/**
 * Iteration directive on a `DomNodeIR`. Resolved from the contract's
 * `anatomy.dom[].iterate` block. When set on a node, framework emitters
 * render that node and its subtree N times — once per item (kind=array) or
 * N copies (kind=count).
 *
 * `indexVar` and `itemVar` name render-context variables that nested
 * `bindings`/`attrs`/`content` expressions can reference via the
 * `iterationLocal` binding kind. Contract authors do not name the variables
 * directly in their bindings — they write `iter:index` / `iter:item` and the
 * IR resolves the role to whichever lexical name this iteration declared.
 */
export interface IterationIR {
  kind: "count" | "array";
  /** Always normalized to `{ kind: "prop" }`; the source-prop name is on `sourceProp`. */
  source: BindingExpression;
  /** Extracted prop name (mirror of `source.prop`) for fast emitter access. */
  sourceProp: string;
  /** Render-context variable name for the zero-based loop index. */
  indexVar: string;
  /** Render-context variable name for the current item (kind="array" only). */
  itemVar?: string;
  /** TypeScript type of each item (kind="array" only). */
  itemType?: string;
}

/**
 * One CSS custom-property binding on a DOM node's runtime `style` attribute.
 * Authored under `anatomy.dom[].cssVariableBindings` in the contract:
 *   { "--fsds-progress-fill-width": "prop:value" }
 *
 * Names are validated against `^--fsds-<cssPrefix>(-[a-z0-9]+)+$` at
 * IR-build time. The contract-wide `cssPrefix` is derived from the
 * component name (see `getCssPrefix`) and namespaces design-system surface
 * away from consumer CSS variables.
 */
export interface CssVarBindingIR {
  /** Full CSS custom-property name, including the --fsds- prefix. */
  varName: string;
  /** Binding expression resolved from the prop:/channel:/literal: grammar. */
  value: BindingExpression;
}

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
  /**
   * Iteration directive. When set, the framework emitter wraps this node and
   * its subtree in its idiomatic iteration construct (React `Array.from(...).map`,
   * Vue `v-for`, Svelte `{#each}`, Angular `*ngFor`, Lit `repeat()`/`.map`).
   * `undefined` means render once (the default).
   */
  iteration: IterationIR | undefined;
  /**
   * CSS custom-property bindings. Empty array when no `cssVariableBindings`
   * block is authored on the contract node. Order preserved from the
   * contract for deterministic emission.
   */
  cssVarBindings: CssVarBindingIR[];
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
 * One ARIA-obligation gap acknowledged by the contract via
 * `a11y.obligations.suppress`. Carried on the IR so downstream tooling
 * (admission rail, doc generator, future audit pipelines) can inspect
 * the gap without re-parsing the contract.
 *
 * A11Y-CONTRACT-OBLIGATION-VALIDATOR-01: the obligation walker throws
 * when it finds a static role with a missing required ARIA attribute
 * AND no matching suppression entry. When a matching suppression is
 * found, the entry is recorded here instead — the IR builds normally,
 * but the gap remains visible.
 */
export interface A11yObligationIR {
  /** ARIA role from the offending DOM node (matched against the obligation table). */
  role: string;
  /** Required attribute that was not provided as a static attr or binding. */
  attr: string;
  /** The contract author's documented reason for the suppression. */
  reason: string;
  /** Part name (from anatomy.parts), if the offending node carries one. */
  part: string | undefined;
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
   * - `"event"`: handler signature carries a framework-native event. Use
   *   only when the consumer genuinely needs the event object itself.
   *
   * Sourced from `ContractChannel.callbackKind`; defaults to `"value"`.
   * The IR no longer infers this from React/DOM type-name patterns —
   * see `resolveCallbackKind`.
   */
  callbackKind: "value" | "event";
  /**
   * True when this channel controls visibility / open-closed state of an
   * overlay or disclosure surface (dialog, popover, drawer, accordion
   * panel, …). Disclosure channels are what drive `useAnchorToggle`,
   * dismissal wiring, scroll lock, and similar overlay behavior in every
   * framework emitter.
   *
   * Derived structurally at IR build time: a channel is a disclosure
   * channel iff its `valueType === "boolean"` OR its contract name is
   * `"open"`. The rule lives in the IR so emitters do not each maintain
   * the same `c.name === "open"` string predicate (which historically
   * leaked the same channel-name lore across five framework files).
   */
  isDisclosureChannel: boolean;
  /**
   * Priority for ranking disclosure channels when more than one exists.
   * Lower = higher priority. Used by emitters to pick the "primary"
   * disclosure channel for anchor-toggle / dismissal wiring.
   *
   *   0 — channel named `"open"`
   *   1 — channel named `"expanded"`
   *   2 — any other disclosure channel
   *   Number.MAX_SAFE_INTEGER — non-disclosure channels
   *
   * The IR also exposes a precomputed `primaryDisclosureChannel` on
   * `BehaviorIR` so emitters do not have to sort or filter themselves.
   */
  disclosurePriority: number;
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
  /**
   * Precomputed primary disclosure channel for overlay/anchor/dismissal
   * wiring (priority: `open` → `expanded` → first other disclosure
   * channel). Emitters read this instead of filtering channels by
   * `c.name === "open"` themselves. Undefined when no disclosure channel
   * is declared.
   */
  primaryDisclosureChannel: NormalizedChannelIR | undefined;
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

  /**
   * ARIA-obligation gaps acknowledged via `a11y.obligations.suppress`.
   * Each entry is point-in-time evidence that a static role in
   * `anatomy.dom` carries a known-missing required attribute. Unmet
   * obligations WITHOUT a matching suppression entry throw at IR-build;
   * suppressed ones land here. A11Y-CONTRACT-OBLIGATION-VALIDATOR-01.
   */
  unresolvedA11yObligations: A11yObligationIR[];

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
export interface BuildComponentIROptions {
  /**
   * Extra type names the unresolved-ref diagnostic should treat as known.
   * Use to admit per-emitter type vocabularies (e.g. a React-only consumer
   * passes `REACT_ADMITTED_TYPES`) without dragging realization-specific
   * names into the framework-neutral builtin set. Omitting this means the
   * IR will surface any non-builtin, non-contract-defined reference as
   * unresolved — including React-shaped names — which is the desired
   * default for framework-neutral validation.
   */
  extraKnownTypes?: ReadonlySet<string>;
}

export function buildComponentIR(
  contract: ComponentContract,
  options?: BuildComponentIROptions,
): ComponentIR {
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
    validateDomBindings(
      dom,
      behavior.normalizedChannels,
      styledProps,
      contract.name,
      cssPrefix,
    );
  }

  // A11Y-CONTRACT-OBLIGATION-VALIDATOR-01: throw on static ARIA roles
  // with required attributes that aren't satisfied by either attrs,
  // bindings, or an explicit `a11y.obligations.suppress` entry.
  // Suppressed obligations land on `unresolvedA11yObligations` for
  // downstream inspection without blocking IR build.
  const unresolvedA11yObligations: A11yObligationIR[] = [];
  if (dom) {
    const suppressed = contract.a11y?.obligations?.suppress ?? [];
    validateDomA11yObligations(dom, suppressed, contract.name, unresolvedA11yObligations);
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
    unresolvedTypeRefs: collectUnresolvedTypes(
      styledProps,
      contract.types,
      options?.extraKnownTypes,
    ),
    unresolvedA11yObligations,
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
  cssPrefix: string,
): void {
  const knownChannels = new Set(channels.map((c) => c.name));
  const channelValueProps = new Set(channels.map((c) => c.valueProp));
  const knownProps = new Set(styledProps.map((p) => p.name));
  const propTypes = new Map(styledProps.map((p) => [p.name, p.type]));
  const channelValuePropByName = new Map(channels.map((c) => [c.name, c.valueProp]));
  // Resolve iteration sources that arrived as `channel:X.value` to the
  // underlying styled prop name. This is done up-front so the recursive
  // validator can use the same `propTypes`/`knownProps` checks for both
  // sources (`prop:X` and `channel:X.value`). Mutates the IR in place; the
  // tree is fresh out of `buildDomTree` and not yet exposed externally.
  resolveChannelIterationSources(node, channelValuePropByName, componentName);
  validateDomNode(
    node,
    knownChannels,
    channelValueProps,
    knownProps,
    propTypes,
    componentName,
    cssPrefix,
  );
}

/**
 * Walk the IR tree and, for every `iteration` whose `source` is a
 * `channel:X.value` binding, resolve X to the channel's valueProp and
 * write it into `sourceProp`. `parseIterate` leaves `sourceProp = ""`
 * for channel sources because it lacks access to the channel registry.
 * Throws if X is not a known channel.
 *
 * PRODUCTION-ARRAY-ITERATION-CONSUMER-01: lets a contract author write
 * `iterate.source: "channel:selection.value"` and have the validator
 * still confirm the channel's underlying valueProp is the right shape
 * (array for `kind: "array"`, number for `kind: "count"`).
 */
function resolveChannelIterationSources(
  node: DomNodeIR,
  channelValuePropByName: Map<string, string>,
  componentName: string,
): void {
  if (node.iteration && node.iteration.source.kind === "channel") {
    const channelName = node.iteration.source.channel;
    const valueProp = channelValuePropByName.get(channelName);
    if (valueProp === undefined) {
      throw new Error(
        `[${componentName}] DOM iterate.source references unknown channel ` +
        `'${channelName}' (known: [${[...channelValuePropByName.keys()].join(", ")}])`,
      );
    }
    node.iteration.sourceProp = valueProp;
  }
  for (const child of node.children) {
    resolveChannelIterationSources(child, channelValuePropByName, componentName);
  }
}

/**
 * Match the loose form of an array type expression: `Foo[]`, `Array<Foo>`,
 * `ReadonlyArray<Foo>`, or a union that contains an array shape
 * (e.g. `Date[] | null`). The IR's prop type strings are TypeScript
 * expressions stored verbatim, so this is intentionally permissive — a
 * misformatted type is the contract-author's problem, not the codegen's.
 */
function looksLikeArrayType(type: string): boolean {
  const t = type.trim();
  return /\[\]/.test(t) || /\bArray</.test(t) || /\bReadonlyArray</.test(t);
}

function validateDomNode(
  node: DomNodeIR,
  knownChannels: Set<string>,
  channelValueProps: Set<string>,
  knownProps: Set<string>,
  propTypes: Map<string, string>,
  componentName: string,
  cssPrefix: string,
  enclosingIterations: IterationIR[] = [],
): void {
  // Iteration source must resolve in the OUTER scope (the iteration
  // variables it defines are not yet visible to itself). Validate it
  // before extending the in-scope name set for the rest of the node.
  // - kind="count" → prop type must be exactly `number`.
  // - kind="array" → prop type must look array-shaped (T[], Array<T>,
  //   ReadonlyArray<T>, or a union containing one of those).
  // Reject sub-typing surprises early so the emitter can assume the type.
  if (node.iteration) {
    const { sourceProp, kind } = node.iteration;
    if (!knownProps.has(sourceProp)) {
      throw new Error(
        `[${componentName}] DOM iterate.source references unknown prop ` +
        `'${sourceProp}' (known: [${[...knownProps].join(", ")}])`,
      );
    }
    const declaredType = (propTypes.get(sourceProp) ?? "").trim();
    if (kind === "count" && declaredType !== "number") {
      throw new Error(
        `[${componentName}] DOM iterate.kind="count" requires prop ` +
        `'${sourceProp}' to be typed 'number'; got '${declaredType}'. ` +
        `For array-typed iteration sources, use kind="array" with itemType.`,
      );
    }
    if (kind === "array" && !looksLikeArrayType(declaredType)) {
      throw new Error(
        `[${componentName}] DOM iterate.kind="array" requires prop ` +
        `'${sourceProp}' to be an array type (T[], Array<T>, ` +
        `ReadonlyArray<T>); got '${declaredType}'.`,
      );
    }
  }

  // After V2 (BINDING-EXPRESSION-V2-01), the validator distinguishes two
  // separate scope concepts:
  //
  //   1. `enclosingIteration` (nearest) — used to validate `iterationLocal`
  //      bindings. A binding of kind `iterationLocal` is only legal when
  //      *some* enclosing iteration exists, and `iterationLocal.local ===
  //      "item"` is only legal under an `array`-kind iteration (count has
  //      no item).
  //
  //   2. `inScopeForIf` (cumulative) — used to validate `if:` guards. The
  //      `if:` grammar predates V2 and still allows `if: "index"` inside
  //      iteration to resolve to the iteration's `indexVar`. Outer
  //      iteration locals remain visible inside nested iterations because
  //      `if:` doesn't have an `iter:` form yet.
  //
  // `prop:X` bindings, after V1 normalization, never legitimately refer to
  // iteration locals — so binding-side `prop:` validation uses the
  // un-extended `knownProps` set.
  const activeIterations = node.iteration
    ? [...enclosingIterations, node.iteration]
    : enclosingIterations;
  const enclosingIteration = activeIterations[activeIterations.length - 1];
  const inScopeForIf = new Set(knownProps);
  for (const it of activeIterations) {
    inScopeForIf.add(it.indexVar);
    if (it.itemVar !== undefined) inScopeForIf.add(it.itemVar);
  }

  for (const [attr, binding] of Object.entries(node.bindings)) {
    validateBindingAgainstScope(
      binding,
      `binding "${attr}"`,
      knownChannels,
      knownProps,
      enclosingIteration,
      componentName,
      // BINDING-EXPRESSION-V2-PREDICATE-01: attribute bindings are the
      // only callsite where predicate-kind expressions are admitted.
      // Event/content/iterate-source/css-var callsites pass the default
      // `false` and reject predicates with a typed error.
      true,
    );
  }
  for (const [evt, binding] of Object.entries(node.events)) {
    validateBindingAgainstScope(
      binding,
      `event "${evt}"`,
      knownChannels,
      knownProps,
      enclosingIteration,
      componentName,
    );
  }
  if (node.content !== undefined) {
    validateBindingAgainstScope(
      node.content,
      `content`,
      knownChannels,
      knownProps,
      enclosingIteration,
      componentName,
    );
  }
  // `if: "<name>"` must resolve to a declared prop, a channel name, a
  // channel's value-prop, or the special literal "children". The React
  // emitter falls back to emitting the raw identifier when this fails —
  // producing JS ReferenceErrors at runtime. Catch the issue at IR-build.
  if (node.ifProp && node.ifProp !== "children") {
    const resolves =
      inScopeForIf.has(node.ifProp) ||
      knownChannels.has(node.ifProp) ||
      channelValueProps.has(node.ifProp);
    if (!resolves) {
      throw new Error(
        `[${componentName}] DOM node 'if: "${node.ifProp}"' does not resolve ` +
        `to a declared prop, channel name, or channel value-prop. ` +
        `Declared props: [${[...inScopeForIf].join(", ")}]. ` +
        `Declared channels: [${[...knownChannels].join(", ")}].`,
      );
    }
  }
  // CSS-var bindings: the schema accepts the loose `--fsds-<anything>`
  // prefix; tighten it here to the component-specific form
  // `--fsds-<cssPrefix>(-…)+` so a Progress contract can't accidentally
  // bind a `--fsds-truncate-…` var (and so renames of one component's
  // prefix never silently collide with another's). Also confirm that
  // every binding's source resolves to a declared prop/channel/alias.
  if (node.cssVarBindings.length > 0) {
    const expected = new RegExp(`^--fsds-${cssPrefix}(-[a-z0-9]+)+$`);
    for (const { varName, value } of node.cssVarBindings) {
      if (!expected.test(varName)) {
        throw new Error(
          `[${componentName}] DOM cssVariableBindings name '${varName}' ` +
          `must match --fsds-${cssPrefix}-<name> (e.g. ` +
          `'--fsds-${cssPrefix}-value'). This namespacing prevents ` +
          `collision with consumer CSS variables and keeps the ` +
          `design-system surface auditable.`,
        );
      }
      validateBindingAgainstScope(
        value,
        `cssVariableBindings '${varName}'`,
        knownChannels,
        knownProps,
        enclosingIteration,
        componentName,
      );
    }
  }
  for (const child of node.children) {
    validateDomNode(
      child,
      knownChannels,
      channelValueProps,
      knownProps,
      propTypes,
      componentName,
      cssPrefix,
      activeIterations,
    );
  }
}

/**
 * Validate a single `BindingExpression` against the declared channel /
 * prop sets and the enclosing iteration. Used for `bindings`, `events`,
 * `content`, and `cssVarBindings.value` — every site where a contract
 * author writes a binding-expression string.
 *
 * Rejects:
 *   - `channel:X` where `X` is not declared
 *   - `prop:X` where `X` is not a declared prop (iteration locals do NOT
 *     count here; after V1 normalization, a `prop:` binding always refers
 *     to a real prop)
 *   - `iter:index` / `iter:item` with no enclosing iteration
 *   - `iter:item` when the enclosing iteration is `kind: "count"` (count
 *     iteration has no item)
 *
 * Accepts:
 *   - `literal:` (always opaque)
 *   - `iter:index` under any kind of iteration
 *   - `iter:item` under array iteration
 */
function validateBindingAgainstScope(
  binding: BindingExpression,
  siteLabel: string,
  knownChannels: Set<string>,
  knownProps: Set<string>,
  enclosingIteration: IterationIR | undefined,
  componentName: string,
  /**
   * Whether `predicate`-kind bindings are admitted at this callsite.
   * Defaults to `false`. Only attribute-binding contexts pass `true`
   * (and only because attribute bindings can be boolean-valued). For
   * `content`, `events`, `iterate.source`, and `cssVariableBindings`,
   * `predicate` is rejected with a typed message — those positions
   * consume value-shaped expressions, not boolean ones.
   * BINDING-EXPRESSION-V2-PREDICATE-01.
   */
  allowPredicates: boolean = false,
): void {
  if (binding.kind === "channel") {
    if (!knownChannels.has(binding.channel)) {
      throw new Error(
        `[${componentName}] DOM ${siteLabel} references unknown channel ` +
        `'${binding.channel}' (known: [${[...knownChannels].join(", ")}])`,
      );
    }
    return;
  }
  if (binding.kind === "prop") {
    if (!knownProps.has(binding.prop)) {
      throw new Error(
        `[${componentName}] DOM ${siteLabel} references unknown prop ` +
        `'${binding.prop}' (known: [${[...knownProps].join(", ")}]). ` +
        `If this is meant to be an iteration index/item, use 'iter:index' ` +
        `or 'iter:item' and ensure the binding sits inside an enclosing ` +
        `\`iterate\` block.`,
      );
    }
    return;
  }
  if (binding.kind === "iterationLocal") {
    if (!enclosingIteration) {
      throw new Error(
        `[${componentName}] DOM ${siteLabel} uses 'iter:${binding.local}' ` +
        `but the node is not inside any \`iterate\` block. ` +
        `Move the binding under an iterating ancestor, or use a real prop.`,
      );
    }
    if (binding.local === "item" && enclosingIteration.kind !== "array") {
      throw new Error(
        `[${componentName}] DOM ${siteLabel} uses 'iter:item' under a ` +
        `count-kind iteration (over '${enclosingIteration.sourceProp}'). ` +
        `'iter:item' requires \`iterate.kind: "array"\` with an item type; ` +
        `count iteration has no item value. Use 'iter:index' for the loop ` +
        `index, or change the iteration kind.`,
      );
    }
    // BINDING-EXPRESSION-V2-PATH-01: `iter:index` resolves to a `number`
    // and has no object-field projections. Paths are only valid on
    // `iter:item` (and only when the item type is object-shaped — that's
    // not checked here; the framework type-checker enforces it against
    // the iteration's declared `itemType`).
    if (binding.local === "index" && binding.path && binding.path.length > 0) {
      throw new Error(
        `[${componentName}] DOM ${siteLabel} uses ` +
        `'iter:index.${binding.path.join(".")}' but \`iter:index\` resolves ` +
        `to the loop index (a \`number\`); object-field paths are only ` +
        `valid on object-shaped iteration items. Use 'iter:item.${binding.path.join(".")}' ` +
        `if the array's items are objects, or drop the path.`,
      );
    }
    return;
  }
  if (binding.kind === "predicate") {
    // BINDING-EXPRESSION-V2-PREDICATE-01: predicates are boolean-valued.
    // They're admitted only at boolean attribute-binding callsites
    // (`bindings.<attr>`). `content`, `events`, `iterate.source`, and
    // `cssVariableBindings` consume value-shaped expressions; a predicate
    // there is a typed authoring error.
    if (!allowPredicates) {
      throw new Error(
        `[${componentName}] DOM ${siteLabel} uses a predicate:${binding.op} ` +
        `binding, but predicates are only legal in attribute-binding ` +
        `positions (\`bindings.<attr>\`). They produce boolean values and ` +
        `are not value-shaped — use a prop / channel / iter expression at ` +
        `this site, or move the predicate into an attribute binding.`,
      );
    }
    // Operand scope checks. Each operand inherits the enclosing iteration
    // and prop/channel sets; predicates do NOT introduce a new scope. Note
    // we pass `allowPredicates=false` to the recursive calls because
    // operand positions are value-shaped — nested predicates are explicitly
    // held for a future grammar extension.
    validateBindingAgainstScope(
      binding.left,
      `${siteLabel} predicate:${binding.op} left operand`,
      knownChannels,
      knownProps,
      enclosingIteration,
      componentName,
      false,
    );
    validateBindingAgainstScope(
      binding.right,
      `${siteLabel} predicate:${binding.op} right operand`,
      knownChannels,
      knownProps,
      enclosingIteration,
      componentName,
      false,
    );
    return;
  }
  // literal: always accepted.
}

// ---------------------------------------------------------------------------
// A11y obligation validation (A11Y-CONTRACT-OBLIGATION-VALIDATOR-01)
// ---------------------------------------------------------------------------

/**
 * Required ARIA attributes for static roles found in `anatomy.dom`.
 *
 * Source fact: WAI-ARIA spec — these attributes are required on the
 * named role and the spec considers their absence an authoring error.
 * Bounded to roles whose absence-of-required-state would mislead
 * assistive tech (e.g. axe / lit-analyzer / svelte-check would flag
 * the resulting rendered DOM as a violation).
 *
 * Applies by: static `attrs.role` value (or, future: a contract-level
 * `details.role` projection onto a DOM node). The walker does not
 * branch on component name. Roles whose required state is contextual
 * (require a containing-role check) are deliberately excluded from
 * this minimal first slice; they belong to a separate slice that
 * understands ARIA role inheritance.
 *
 * Removable when: the IR carries a richer ARIA semantics layer that
 * supersedes a static role/attr lookup (e.g. derives obligations from
 * `contract.a11y.apgPattern` + ancestry analysis).
 */
const ARIA_ROLE_REQUIRED_ATTRS: ReadonlyMap<string, readonly string[]> = new Map([
  // role="option" requires aria-selected to communicate selection state
  // (WAI-ARIA 1.2 §4.3.13). Without it, the option's selection is
  // ambiguous to AT; axe flags this as aria-required-attr.
  ["option", ["aria-selected"]],
]);

/**
 * Walk `anatomy.dom` and assert that every static role with a required
 * ARIA attribute has it declared — either as a static `attrs.X` or as
 * a dynamic `bindings.X`. Returns the suppressed-but-acknowledged
 * obligations as `A11yObligationIR[]` for inspection on the IR; throws
 * on the first unmet, unsuppressed obligation.
 *
 * The throw is descriptive: it names the component, the offending part,
 * the role, the missing attribute, and points the contract author to
 * the two remediation paths (declare the attr, or suppress with reason).
 *
 * No component-name branches. The walker reads `node.attrs.role`,
 * `node.attrs[attr]`, `node.bindings[attr]`, and the contract's
 * `a11y.obligations.suppress`. All decisions follow from those inputs.
 */
function validateDomA11yObligations(
  node: DomNodeIR,
  suppressed: ReadonlyArray<{ role: string; attr: string; reason: string }>,
  componentName: string,
  diagnostics: A11yObligationIR[],
): void {
  const role = node.attrs.role;
  if (role) {
    const requiredAttrs = ARIA_ROLE_REQUIRED_ATTRS.get(role);
    if (requiredAttrs) {
      for (const attr of requiredAttrs) {
        const hasStatic = Object.prototype.hasOwnProperty.call(node.attrs, attr);
        const hasBinding = Object.prototype.hasOwnProperty.call(node.bindings, attr);
        if (hasStatic || hasBinding) continue;
        const matchingSuppression = suppressed.find(
          (s) => s.role === role && s.attr === attr,
        );
        if (matchingSuppression) {
          diagnostics.push({
            role,
            attr,
            reason: matchingSuppression.reason,
            part: node.part,
          });
          continue;
        }
        const partLabel = node.part ? `part="${node.part}"` : `tag="${node.tag}"`;
        throw new Error(
          `[${componentName}] anatomy.dom node (${partLabel}) has ` +
          `\`role="${role}"\` but is missing the required ARIA attribute ` +
          `'${attr}'. WAI-ARIA requires this attribute on \`role="${role}"\`; ` +
          `assistive tech and a11y validators (axe, svelte-check, ` +
          `lit-analyzer) flag its absence. To resolve, either:\n` +
          `  1. Declare the attribute under \`attrs\` (static) or ` +
          `\`bindings\` (dynamic). Static is appropriate when every ` +
          `rendered instance carries the same state (e.g. a ` +
          `selected-items-only listbox).\n` +
          `  2. If the contract cannot yet truthfully declare the ` +
          `attribute (e.g. per-item selection state needs grammar that ` +
          `hasn't landed), add an explicit suppression under ` +
          `\`a11y.obligations.suppress\` with a reason citing the ` +
          `upstream blocker.`,
        );
      }
    }
  }
  for (const child of node.children) {
    validateDomA11yObligations(child, suppressed, componentName, diagnostics);
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
  const root = parseDomNode(dom);
  // Post-walk: rewrite legacy `prop:index` / `prop:item` references that sit
  // inside an iteration scope to their `iterationLocal` semantic equivalent.
  // Done as a separate pass because `parseDomNode` recurses bottom-up — a
  // child's bindings are constructed before the parent's `iterate` block is
  // resolved, so promotion cannot happen during the initial walk.
  promoteIterationLocalsInTree(root, undefined);
  return root;
}

/**
 * Walk the IR tree and promote `prop:X` bindings to `iterationLocal` when
 * `X` matches the enclosing iteration's declared `indexVar` or `itemVar`.
 * Nested iterations resolve to the nearest enclosing scope (the inner
 * iteration shadows the outer one's locals, just like JS closures).
 *
 * Mutates in place — the IR is fresh out of `parseDomNode` and not yet
 * exposed. Returning a new tree would cost an unnecessary copy.
 *
 * Scope rule, from the user's spec:
 * - `prop:index` / `prop:item` outside any iteration → left untouched
 *   (validation will catch it later if no such prop is declared).
 * - Inside iteration declaring `indexVar: "index"`, `prop:index` →
 *   `{ kind: "iterationLocal", local: "index" }`.
 * - Inside iteration declaring `indexVar: "dayIndex"`, `prop:dayIndex` →
 *   same. `prop:index` would NOT promote (the literal "index" doesn't
 *   match the iteration's declared name).
 * - Count iteration has no `itemVar`, so `prop:item` is never promoted
 *   under it. Authors who write `iter:item` under count get a typed
 *   error from `validateDomNode`.
 */
function promoteIterationLocalsInTree(
  node: DomNodeIR,
  enclosing: IterationIR | undefined,
): void {
  // The iterating node itself is part of the iteration scope: its own
  // bindings/events/content/cssVarBindings can reference the locals it
  // introduces. So we resolve the active scope BEFORE rewriting this
  // node's own fields.
  const active = node.iteration ?? enclosing;
  if (active) {
    for (const [attr, binding] of Object.entries(node.bindings)) {
      node.bindings[attr] = promoteIterationLocals(binding, active);
    }
    for (const [evt, binding] of Object.entries(node.events)) {
      node.events[evt] = promoteIterationLocals(binding, active);
    }
    if (node.content !== undefined) {
      node.content = promoteIterationLocals(node.content, active);
    }
    for (const css of node.cssVarBindings) {
      css.value = promoteIterationLocals(css.value, active);
    }
  }
  for (const child of node.children) {
    promoteIterationLocalsInTree(child, active);
  }
}

function parseDomNode(node: ContractDomNode): DomNodeIR {
  // Authors interact with three sibling fields, each with a distinct
  // semantic shape that the framework emitters lower idiomatically:
  //   bindings — attribute bindings (aria-label, disabled, src, …)
  //   events   — event-handler bindings (keyed by unprefixed event name)
  //   content  — single inner-content binding (BindingExpression)
  //
  // The IR-DOM-BINDING-CAPABILITY-01 capability stack was built to make
  // these three shapes the *only* portable authoring path. The previous
  // single-bag `bindings` field collapsed all three into one map — that
  // shape worked on React/Vue (JSX/templates accept arbitrary props) but
  // broke Angular (template parser rejects `[children]=` / `onClick=`)
  // and Lit (function-typed callbacks were silently dropped from
  // attribute decorators). Earlier steps shipped a back-compat
  // dual-pathway translation so the migration could land emitter-by-
  // emitter; step 4C removes it. Legacy shapes now hard-fail with an
  // actionable error message so contract authors get redirected
  // explicitly to the canonical field.
  const bindings: Record<string, BindingExpression> = {};
  if (node.bindings) {
    for (const [attr, expr] of Object.entries(node.bindings)) {
      if (/^on[A-Z]/.test(attr)) {
        const suggestedEvent = attr.slice(2).toLowerCase();
        throw new Error(
          `anatomy.dom node (tag="${node.tag}", part="${node.part ?? "?"}"): ` +
            `bindings.${attr} is an event-shaped key. Move it under the ` +
            `\`events\` field as { "${suggestedEvent}": "${expr}" }. Event ` +
            `handlers are not portable as attribute bindings across all five ` +
            `framework emitters (Angular rejects them, Lit drops the prop). ` +
            `This used to be auto-translated; the back-compat path was ` +
            `removed in IR-DOM-BINDING-CAPABILITY-01/4C.`,
        );
      }
      if (attr === "children" || attr === "textContent") {
        throw new Error(
          `anatomy.dom node (tag="${node.tag}", part="${node.part ?? "?"}"): ` +
            `bindings.${attr} smuggles inner content through an attribute ` +
            `slot. Use the top-level \`content\` field instead: ` +
            `{ "content": "${expr}" }. This used to be auto-translated; the ` +
            `back-compat path was removed in IR-DOM-BINDING-CAPABILITY-01/4C.`,
        );
      }
      bindings[attr] = parseBindingExpression(expr);
    }
  }
  const events: Record<string, BindingExpression> = {};
  if (node.events) {
    for (const [evt, expr] of Object.entries(node.events)) {
      events[evt] = parseBindingExpression(expr);
    }
  }
  const children = (node.children ?? []).map(parseDomNode);
  const content =
    node.content !== undefined ? parseBindingExpression(node.content) : undefined;
  if (content !== undefined && children.length > 0) {
    throw new Error(
      `anatomy.dom node (tag="${node.tag}", part="${node.part ?? "?"}"): ` +
        `\`content\` and \`children\` are mutually exclusive on the same node. ` +
        `Wrap the content value in its own child node if you need both.`,
    );
  }
  const iteration = parseIterate(node);
  if (iteration && content !== undefined) {
    throw new Error(
      `anatomy.dom node (tag="${node.tag}", part="${node.part ?? "?"}"): ` +
        `\`iterate\` and \`content\` are mutually exclusive on the same node. ` +
        `Wrap the content value in a child node and put \`iterate\` on the wrapper.`,
    );
  }
  const cssVarBindings = parseCssVarBindings(node);
  if (cssVarBindings.length > 0 && node.attrs?.style !== undefined) {
    throw new Error(
      `anatomy.dom node (tag="${node.tag}", part="${node.part ?? "?"}"): ` +
        `\`cssVariableBindings\` and a literal \`attrs.style\` cannot both be ` +
        `set on the same node — emitters cannot reconcile a literal style ` +
        `string with structured custom-property bindings. Move the literal ` +
        `style declarations into a CSS rule, or merge them into ` +
        `\`cssVariableBindings\`.`,
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
    iteration,
    cssVarBindings,
  };
}

/**
 * Parse an `iterate` block on a contract DOM node into `IterationIR`.
 * Returns `undefined` when no iteration is declared.
 *
 * Type validation (count → number prop; array → array-typed prop with
 * `itemType`) is deferred to `validateDomNode` where `styledProps` is
 * available. This function enforces only the structural rules: source must
 * be a `prop:` binding; kind must be 'count' or 'array'; array iteration
 * requires `itemType`.
 */
function parseIterate(node: ContractDomNode): IterationIR | undefined {
  if (!node.iterate) return undefined;
  const it = node.iterate;
  const source = parseBindingExpression(it.source);
  // Accepted sources:
  //   - `prop:X`        — raw prop reference (must exist; validated later)
  //   - `channel:X.value` — the resolved channel value (must be a known channel)
  // Other kinds are not meaningful for iteration:
  //   - `literal:` would iterate over a string constant, never useful
  //   - `iter:`    would refer to an outer iteration local (and require
  //                outer-scope addressing, which V2 explicitly excludes)
  //   - `channel:X.{onChange,defaultValue}` aren't iterable values
  // The IR's `sourceProp` denotes the *underlying styled prop name* — the
  // prop whose declared type (array vs number) the validator constrains.
  // For `prop:X` that's just X. For `channel:X.value` we resolve X to the
  // channel's `valueProp` at validation time, because the channel
  // registry isn't available here in `parseIterate`. We carry the channel
  // name on `source` and the validator looks it up — see `validateDomNode`.
  // The runtime identifier (post-channel-resolution; what each framework
  // actually emits in the loop wrapper) is NOT this string — emitters
  // route `source` through their binding-value renderer at emit time.
  let sourceProp: string;
  if (source.kind === "prop") {
    sourceProp = source.prop;
  } else if (source.kind === "channel" && source.field === "value") {
    // Placeholder; the validator resolves the channel to its valueProp.
    sourceProp = "";
  } else {
    throw new Error(
      `anatomy.dom node (tag="${node.tag}", part="${node.part ?? "?"}"): ` +
        `iterate.source must be a prop: or channel:<name>.value binding ` +
        `(got "${it.source}"). literal:, iter:, and predicate: sources, ` +
        `and the onChange/defaultValue fields of channels, are not ` +
        `iterable.`,
    );
  }
  // BINDING-EXPRESSION-V2-PATH-01 explicitly excludes paths on the
  // iteration root: the iterable must be the raw prop / channel value,
  // not a projection. A future slice may relax this (e.g. to iterate
  // over `prop:groups.items` once nested-array semantics are designed),
  // but until then a path-on-source is rejected so contract authors
  // don't unintentionally rely on path resolution at the iteration
  // boundary.
  if (source.path !== undefined && source.path.length > 0) {
    throw new Error(
      `anatomy.dom node (tag="${node.tag}", part="${node.part ?? "?"}"): ` +
        `iterate.source must be a bare prop:<name> or channel:<name>.value ` +
        `binding (got "${it.source}"). Property paths on the iteration ` +
        `source are not supported in this slice — they are reserved for ` +
        `a future nested-iteration grammar.`,
    );
  }
  if (it.kind === "array" && (it.itemType === undefined || it.itemType.trim() === "")) {
    throw new Error(
      `anatomy.dom node (tag="${node.tag}", part="${node.part ?? "?"}"): ` +
        `iterate.kind="array" requires \`itemType\` to be set. Each emitter ` +
        `needs the item's TypeScript type to generate typed loop variables.`,
    );
  }
  return {
    kind: it.kind,
    source,
    sourceProp,
    indexVar: it.indexVar ?? "index",
    itemVar: it.kind === "array" ? (it.itemVar ?? "item") : undefined,
    itemType: it.kind === "array" ? it.itemType : undefined,
  };
}

/**
 * Parse `cssVariableBindings` into an ordered array of `CssVarBindingIR`.
 * Loose schema-level checks (the `--fsds-…` prefix) are tightened to the
 * component-specific form `^--fsds-${cssPrefix}(-…)+$` in `validateDomNode`.
 */
function parseCssVarBindings(node: ContractDomNode): CssVarBindingIR[] {
  if (!node.cssVariableBindings) return [];
  return Object.entries(node.cssVariableBindings).map(([varName, expr]) => ({
    varName,
    value: parseBindingExpression(expr),
  }));
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
 *   binding := "prop:" name path?
 *            | "channel:" name "." field path?
 *            | "literal:" value
 *            | "iter:" local path?
 *   field   := "value" | "onChange" | "defaultValue"
 *   local   := "index" | "item"
 *   path    := ("." segment)+
 *   segment := identifier ([A-Za-z_$][\w$]*)
 *
 * Path constraint (BINDING-EXPRESSION-V2-PATH-01): path is object-field
 * projection only. Empty segments (`a..b`, `a.`), bracket access (`a[0]`),
 * optional chaining (`a?.b`), and any operator (`?? x`, `=== x`, `()`) are
 * syntactically rejected — the expression falls through to `literal` so
 * downstream emit shows the malformed string in output instead of
 * silently lowering to garbage. Validators (`validateBindingAgainstScope`,
 * `iter:index` typing) consume the parsed form and decide semantic
 * legality (e.g. `iter:index.foo` is a type error: index is `number`).
 *
 * Channel-path constraint: only `channel:X.value.<seg>+` is well-formed.
 * `channel:X.onChange.foo` and `channel:X.defaultValue.foo` parse-fail
 * because `.onChange` is a callback (no value-shaped projection) and
 * `.defaultValue` is the default itself (the *initial* value, not a
 * read-after-defaulting projection). Paths on those fields are reserved
 * for a future predicate slice if ever needed.
 *
 * Anything not matching falls through as a literal so contracts that
 * misspell don't silently produce empty output. Consumers should still
 * treat parse errors as authoring bugs.
 *
 * `iter:` resolution is semantic: `iter:index` always refers to the
 * enclosing iteration's loop-index role, regardless of whether that
 * iteration named its `indexVar` something other than the default
 * `"index"`. The lexical-variable lookup is the emitter's job —
 * `parseBindingExpression` only attaches the role.
 *
 * Scope validation (no enclosing iteration; `iter:item` under count
 * iteration) and typing (`iter:index` is `number`, not an object) happen
 * in `validateDomNode`, not here, because this function is context-free.
 */
export function parseBindingExpression(expr: string): BindingExpression {
  // Path: zero or more `.segment` tails. Anchored to consume the rest of
  // the string after the root so an unexpected suffix (operators, brackets,
  // optional chaining) falls through to `literal` instead of being
  // silently truncated.
  const pathTail = /(?:\.[A-Za-z_$][\w$]*)*/.source;
  const propMatch = expr.match(new RegExp(`^prop:([A-Za-z_$][\\w$-]*)(${pathTail})$`));
  if (propMatch) {
    return { kind: "prop", prop: propMatch[1], ...buildPathField(propMatch[2]) };
  }
  // Channel paths only apply to `.value`; `.onChange` and `.defaultValue`
  // refuse a tail by construction (the regex does not allow it).
  const channelValueMatch = expr.match(
    new RegExp(`^channel:([A-Za-z_$][\\w$-]*)\\.value(${pathTail})$`),
  );
  if (channelValueMatch) {
    return {
      kind: "channel",
      channel: channelValueMatch[1],
      field: "value",
      ...buildPathField(channelValueMatch[2]),
    };
  }
  const channelCallbackMatch = expr.match(
    /^channel:([A-Za-z_$][\w$-]*)\.(onChange|defaultValue)$/,
  );
  if (channelCallbackMatch) {
    return {
      kind: "channel",
      channel: channelCallbackMatch[1],
      field: channelCallbackMatch[2] as "onChange" | "defaultValue",
    };
  }
  const literalMatch = expr.match(/^literal:(.*)$/);
  if (literalMatch) {
    return { kind: "literal", value: literalMatch[1] };
  }
  const iterMatch = expr.match(new RegExp(`^iter:(index|item)(${pathTail})$`));
  if (iterMatch) {
    return {
      kind: "iterationLocal",
      local: iterMatch[1] as "index" | "item",
      ...buildPathField(iterMatch[2]),
    };
  }
  // BINDING-EXPRESSION-V2-PREDICATE-01: `predicate:<op>(LEFT, RIGHT)`.
  // The match below claims the entire string starting with `predicate:`;
  // any malformed form (missing parens, unknown op, single operand,
  // nested predicate, literal operand) falls through to `literal` so
  // the authoring error appears verbatim in output.
  const predicateMatch = expr.match(/^predicate:([a-zA-Z][a-zA-Z0-9]*)\((.*)\)$/);
  if (predicateMatch) {
    const opName = predicateMatch[1];
    const inner = predicateMatch[2];
    const parsed = tryParsePredicate(opName, inner);
    if (parsed) return parsed;
    // Malformed predicate form — fall through to literal below.
  }
  // Unrecognized — treat the whole expression as a literal so the contract's
  // intent (whatever it was) appears in output for visible failure.
  return { kind: "literal", value: expr };
}

/**
 * BINDING-EXPRESSION-V2-PREDICATE-01.
 *
 * Parse the inside of a `predicate:<op>(...)` form. Returns the
 * `predicate`-kind BindingExpression on success, or `null` on any
 * malformed shape so the caller can fall through to literal. Closed
 * grammar:
 *
 *   - Operator name must be one of: `eq`, `contains`, `memberOf`.
 *   - Exactly two comma-separated operands.
 *   - Each operand must parse to a value-shaped kind (`prop`,
 *     `channel`, `iterationLocal`). `literal` and `predicate` are
 *     rejected as operands — literals carry no comparison semantics
 *     in this grammar, and nested predicates are explicitly held.
 *
 * Comma splitting is naive (single comma + optional space). Operand
 * strings never contain commas in the V2 grammar (no function calls,
 * no array literals, no arbitrary JS), so naive split is sufficient.
 */
function tryParsePredicate(opName: string, inner: string): BindingExpression | null {
  if (opName !== "eq" && opName !== "contains" && opName !== "memberOf") {
    return null;
  }
  const op = opName as BindingPredicateOp;
  // Naive split — V2 operand grammar contains no commas. If a future
  // grammar adds commas inside operands, this must learn paren-aware
  // splitting; today it's a deliberate shortcut.
  const parts = inner.split(",").map((s) => s.trim());
  if (parts.length !== 2) return null;
  const [leftStr, rightStr] = parts;
  if (leftStr.length === 0 || rightStr.length === 0) return null;
  const left = parseBindingExpression(leftStr);
  const right = parseBindingExpression(rightStr);
  // Reject operand kinds that aren't value-shaped in this grammar.
  if (!isPredicateOperand(left) || !isPredicateOperand(right)) return null;
  return { kind: "predicate", op, left, right };
}

/**
 * Closed set of operand kinds legal inside a predicate. Predicates and
 * literals are rejected: nesting is explicitly held; literals carry no
 * useful comparison semantics in the V2 grammar.
 */
function isPredicateOperand(expr: BindingExpression): boolean {
  return (
    expr.kind === "prop" ||
    expr.kind === "channel" ||
    expr.kind === "iterationLocal"
  );
}

/**
 * Convert a leading-dot path tail like `".foo.bar"` (or `""`) into the
 * spread fragment used to attach a `path` field to a `BindingExpression`.
 * Returns `{}` when the tail is empty so the resulting binding stays
 * shape-compatible with V1 (no `path` key present at all).
 */
function buildPathField(pathTail: string): { path?: string[] } {
  if (pathTail.length === 0) return {};
  // Drop the leading "." then split. Each segment is already validated
  // by the regex.
  return { path: pathTail.slice(1).split(".") };
}

/**
 * In-place rewrite a `BindingExpression` so that `prop:index` / `prop:item`
 * references resolve to `iterationLocal` when their target name matches
 * the enclosing iteration's `indexVar` / `itemVar`. Returns the original
 * binding unchanged when no rewrite applies.
 *
 * Why this exists: V1 contracts (Calendar, OTP) wrote `prop:index` to mean
 * "the loop-index variable named index" — relying on the iteration scope
 * happening to declare a local of that name. New contracts SHOULD write
 * `iter:index`, but existing contracts must continue to emit byte-equivalent
 * output. The auto-promotion is bounded: it only fires when the prop name
 * exactly matches a declared iteration-local name in the *nearest* enclosing
 * iteration. Outside iteration scope, `prop:index` still requires a real
 * declared prop and `validateDomNode` will reject undeclared references.
 *
 * The promotion is local to the role of the matched variable: a `prop:index`
 * binding inside an iteration whose `indexVar` is `index` becomes
 * `{ kind: "iterationLocal", local: "index" }`, NOT a reference to the
 * literal identifier — so a future contract that overrides `indexVar` to
 * `"dayIndex"` still gets `iter:index` semantics at the emitter.
 */
export function promoteIterationLocals(
  binding: BindingExpression,
  iteration: { indexVar: string; itemVar?: string },
): BindingExpression {
  // BINDING-EXPRESSION-V2-PREDICATE-01: predicate operands are themselves
  // BindingExpressions. Walk into both sides so any V1-style
  // `prop:<indexVar>` / `prop:<itemVar>` reference inside an operand gets
  // promoted to `iterationLocal` just like a top-level binding would.
  // Nested predicates are not legal (the parser rejects them), but the
  // recursion shape is the same either way.
  if (binding.kind === "predicate") {
    const left = promoteIterationLocals(binding.left, iteration);
    const right = promoteIterationLocals(binding.right, iteration);
    if (left === binding.left && right === binding.right) return binding;
    return { kind: "predicate", op: binding.op, left, right };
  }
  if (binding.kind !== "prop") return binding;
  // Preserve the path field across promotion. V1 contracts never wrote
  // `prop:item.foo`, so in practice this branch is only hit when the
  // promotion runs on an already-pathed V2 binding (which itself never
  // happens — the parser routes `iter:item.foo` straight to
  // `iterationLocal` without ever being a `prop:` — but the carry is
  // semantically correct and trivial).
  const pathField = binding.path && binding.path.length > 0 ? { path: binding.path } : {};
  if (binding.prop === iteration.indexVar) {
    return { kind: "iterationLocal", local: "index", ...pathField };
  }
  if (iteration.itemVar !== undefined && binding.prop === iteration.itemVar) {
    return { kind: "iterationLocal", local: "item", ...pathField };
  }
  return binding;
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
  const normalizedChannelsForBuild = buildChannelsIR(
    contract.channels,
    styledProps,
  );
  return {
    channels: contract.channels,
    events: contract.events,
    stateMachine: contract.stateMachine,
    form: contract.form,
    focus: contract.focus,
    portal: contract.portal,
    dismissal: contract.dismissal,
    relationships: contract.relationships,
    normalizedChannels: normalizedChannelsForBuild,
    primaryDisclosureChannel: pickPrimaryDisclosureChannel(
      normalizedChannelsForBuild,
    ),
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
 * Resolve a channel's callback shape from its contract-declared
 * `callbackKind`. The IR is deliberately framework-neutral here: it does
 * not inspect handler TypeScript types looking for React/DOM event
 * identifiers, because that classification would leak React realization
 * knowledge into the IR as a fact published to all five framework
 * emitters. Contracts that need event-shaped callbacks must declare
 * `callbackKind: "event"` on the channel; absent declaration defaults to
 * `"value"`, which matches the entire current corpus.
 *
 * Exported so the parity tests and external consumers can call the same
 * resolution rather than reimplement it.
 */
export function resolveCallbackKind(
  channel: Pick<ContractChannel, "callbackKind">,
): "value" | "event" {
  return channel.callbackKind ?? "value";
}

function buildChannelsIR(
  channels: Record<string, ContractChannel> | undefined,
  styledProps: ResolvedPropIR[],
): NormalizedChannelIR[] {
  if (!channels) return [];
  // styledProps reserved for future channel-aware prop introspection;
  // intentionally not consumed today now that callbackKind is
  // contract-declared rather than handler-type-inferred.
  void styledProps;
  const out: NormalizedChannelIR[] = [];
  for (const [name, c] of Object.entries(channels)) {
    const callbackKind = resolveCallbackKind(c);
    const isDisclosureChannel = c.valueType === "boolean" || name === "open";
    const disclosurePriority = !isDisclosureChannel
      ? Number.MAX_SAFE_INTEGER
      : name === "open"
        ? 0
        : name === "expanded"
          ? 1
          : 2;
    out.push({
      name,
      valueProp: c.value,
      defaultValueProp: c.defaultValue,
      changeHandlerProp: c.onChange,
      valueType: c.valueType,
      enabledByProp: c.enabledBy,
      description: c.description,
      callbackKind,
      isDisclosureChannel,
      disclosurePriority,
    });
  }
  return out;
}

/**
 * Pick the primary disclosure channel from a normalized channel list, or
 * undefined when none exists. Emitters call this once when wiring
 * anchor-toggle / dismissal / focus-trap primitives so they do not each
 * reimplement the priority order (`open` → `expanded` → other boolean).
 */
export function pickPrimaryDisclosureChannel(
  channels: readonly NormalizedChannelIR[],
): NormalizedChannelIR | undefined {
  const disclosure = channels.filter((c) => c.isDisclosureChannel);
  if (disclosure.length === 0) return undefined;
  return disclosure.reduce((best, c) =>
    c.disclosurePriority < best.disclosurePriority ? c : best,
  );
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
  const domTagByPart = collectDomTagsByPart(contract);
  const partsInDomTree = new Set(Object.keys(domTagByPart));
  return getParts(contract.anatomy).map((name) => {
    const semanticElement = SEMANTIC_ELEMENTS[name];
    const details = allDetails[name];
    const nativeTag = resolveNativeTag({
      partName: name,
      detailsTag: details?.tag,
      domTag: domTagByPart[name],
      componentName: contract.name,
    });
    // A part becomes a native-realization compound subcomponent when:
    //   (a) it is declared in anatomy.parts (always true at this point),
    //   (b) it has a nativeTag in TABLE_COMPOSITION_TAGS,
    //   (c) it is not root and not container (root + container are owned
    //       by the root component's anatomy.dom render, not exported as
    //       subcomponents),
    //   (d) it is NOT already rendered by the root component's anatomy.dom
    //       tree (consumer-composed only — root-rendered parts must not
    //       double as subcomponents or the consumer gets duplicate /
    //       misplaced semantic nodes), AND
    //   (e) [framework-target-specific] the emitter can honestly host it.
    //
    // This rule moves compound-classification from name-based folklore
    // (the COMPOUND_PARTS set in semantics.ts) to contract-authored
    // native realization. Existing components with names in
    // COMPOUND_PARTS continue to be compound by the legacy rule;
    // new realization is layered on top.
    //
    // Rule (d) is the doctrinal guard against cross-contract bleed:
    // Calendar's contract declares <table>/<td> in its anatomy.dom
    // (calendar grid is a real <table>), but those nodes are
    // root-rendered, not consumer-composed. They must not become
    // separate CalendarGrid/CalendarCell subcomponents.
    const isTableCompositionPart =
      nativeTag !== undefined &&
      TABLE_COMPOSITION_TAGS.has(nativeTag) &&
      name !== "root" &&
      name !== "container" &&
      !partsInDomTree.has(name);
    return {
      name,
      semanticElement,
      isCompound: isCompoundPart(name) || isTableCompositionPart,
      isRootOnly: ROOT_ONLY_PARTS.has(name),
      layoutVariant:
        name === "footer" || name === "list" ? "horizontal" : undefined,
      nativeTag,
      details,
    };
  });
}

/**
 * Walk the contract's anatomy.dom tree and collect the HTML tag declared
 * for each part name. Used to derive PartIR.nativeTag when the contract
 * doesn't repeat the tag in anatomy.details.<part>.tag.
 *
 * Returns an empty map when the contract has no anatomy.dom tree.
 */
function collectDomTagsByPart(
  contract: ComponentContract,
): Record<string, string> {
  if (!contract.anatomy || Array.isArray(contract.anatomy)) return {};
  const dom = contract.anatomy.dom;
  if (!dom) return {};
  const out: Record<string, string> = {};
  const stack: typeof dom[] = [dom];
  while (stack.length > 0) {
    const node = stack.pop()!;
    if (node.part && typeof node.tag === "string") {
      out[node.part] = node.tag;
    }
    if (Array.isArray(node.children)) {
      for (const c of node.children) stack.push(c);
    }
  }
  return out;
}

/**
 * Resolve a part's native HTML tag from the contract.
 *
 *   1. anatomy.details.<part>.tag is the primary authority.
 *   2. anatomy.dom node tag is the secondary source.
 *   3. When both are present they must agree — disagreement throws
 *      a hard error here so the IR refuses to build a contract with
 *      split-brain authority over a part's native realization.
 *   4. When neither is present, returns undefined (emitters fall
 *      back to SEMANTIC_ELEMENTS).
 */
function resolveNativeTag(opts: {
  partName: string;
  detailsTag: string | undefined;
  domTag: string | undefined;
  componentName: string;
}): string | undefined {
  const { partName, detailsTag, domTag, componentName } = opts;
  if (detailsTag !== undefined && domTag !== undefined) {
    if (detailsTag !== domTag) {
      throw new Error(
        `[${componentName}] anatomy.details.${partName}.tag (${detailsTag}) ` +
          `disagrees with anatomy.dom node tag (${domTag}) for the same part. ` +
          `These declarations must be identical, or only one of them should ` +
          `be set. Contract validator rule.`,
      );
    }
    return detailsTag;
  }
  return detailsTag ?? domTag;
}

// ---------------------------------------------------------------------------
// Props / type resolution
// ---------------------------------------------------------------------------

// Framework-neutral type names the IR treats as "known" — primitives,
// generic TS utility types, and intrinsic JS globals only. React-specific
// names (ReactNode, SyntheticEvent, MouseEventHandler, HTMLButtonElement,
// React, …) deliberately do NOT live here: a contract reaching for those
// is leaking realization detail into the source-of-truth. The unresolved-
// ref diagnostic surfaces that leak so it can be paid down at the
// contract layer. Per-emitter type allowlists, if needed, live in the
// emitter's own translation surface (e.g. `non-react-types.ts` for the
// non-React emitters, where React-shaped contract types get rewritten
// before emission).
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
  "Pick",
  "Readonly",
  "Required",
  "Exclude",
  "Extract",
  "NonNullable",
  "ReturnType",
  "Parameters",
  "Date",
  "RegExp",
  "Error",
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
  if (Array.isArray(prop.default)) {
    // JSON-serialize array defaults so each emitter can splice them
    // verbatim into the destructure-or-binding site. PRODUCTION-ARRAY-
    // ITERATION-CONSUMER-01: enables Shuttle's `defaultValue` to seed a
    // demo with non-empty `value` for the runtime rail to assert against.
    return JSON.stringify(prop.default);
  }
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
  extraKnownTypes?: ReadonlySet<string>,
): UnresolvedTypeRefIR[] {
  const definedTypes = new Set(Object.keys(types || {}));
  const unresolved = new Map<string, Set<string>>();
  for (const p of props) {
    for (const ref of p.typeRefs) {
      if (
        definedTypes.has(ref) ||
        BUILTIN_TYPE_NAMES.has(ref) ||
        extraKnownTypes?.has(ref)
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
  // styles.root is absent), then box-model consumers, then styles.root
  // author rules. Slot declarations live ONLY on root and inherit through
  // the CSS cascade to every descendant selector that reads them via
  // var(--<slug>).
  //
  // Box-model consumers are auto-emitted on every component's root so the
  // primitive slot pool actually applies without each contract having to
  // re-declare `padding-inline-start: var(--fsds-box-model-...)` etc. in
  // its styles.json. Only the longhand properties auto-consume — the
  // shorthand slots (`box-model.padding`, `box-model.padding-block`, etc.)
  // remain available for app-level overrides but are NOT auto-consumed,
  // because setting both shorthand and longhand on the same rule produces
  // a confusing cascade. Authors who want shorthand-level control read
  // those slots explicitly in styles.json. Author-supplied properties in
  // `styles.root` still merge ON TOP of the consumer block, so any
  // explicit `padding: ...` from a contract wins over the box-model
  // longhand defaults.
  const rootSelector = `.${cssPrefix}`;
  const slotDeclarations = renderTokenSlots(tokens);
  const boxModelConsumers = renderBoxModelConsumers();
  const rootStyleDeclarations = renderStyleBlock(
    styles.root,
    cssPrefix,
    platformTarget,
  );
  blocks.push({
    selector: rootSelector,
    declarations: {
      ...slotDeclarations,
      ...boxModelConsumers,
      ...rootStyleDeclarations,
    },
  });
  emitted.add(rootSelector);

  // Portal-aware: when the contract opts into a portal for its
  // surface content, the content element is rendered at document.body
  // (escaping the .<cssPrefix> ancestor). Selectors that target the
  // content's data-attribute MUST emit at the top level, not nested
  // under the root, or they won't apply. Derive the content selector
  // from the cssPrefix to match what surface-emit.ts emits as the
  // data-<prefix>-content attribute.
  const portalEnabled = contract.portal?.enabled === true;
  const portalContentSelector = portalEnabled
    ? `[data-${cssPrefix}-content]`
    : undefined;
  const expandOptions = portalContentSelector
    ? { portalContentSelector }
    : undefined;

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
  //   - portal-content   → top-level verbatim (no BEM qualification).
  for (const [key, rawBlock] of Object.entries(styles)) {
    if (key === "root") continue;
    const selector = expandStylesKey(key, cssPrefix, expandOptions);
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
 *
 * Portal-aware selectors: when `options.portalContentSelector` is set
 * (the codegen passes it when the contract enables portal on its
 * surface — typically `[data-popover-content]`), any styles key that
 * equals that selector OR equals the legacy compound form
 * `.<prefix> [data-<prefix>-content]` is emitted at the TOP LEVEL
 * (verbatim, no BEM qualification). This is necessary because the
 * portaled element lives at `document.body`, escaping the
 * `.<prefix>` ancestor; styles nested under that ancestor never
 * apply to the portaled content.
 */
export interface ExpandStylesKeyOptions {
  /**
   * The bare attribute selector that identifies the portaled
   * content node, e.g. `[data-popover-content]`. When the styles key
   * matches it (either directly or as a compound `.popover [data-...]`),
   * the emitter returns the bare attribute selector at top level so
   * the rule actually targets the portaled element.
   */
  portalContentSelector?: string;
}

export function expandStylesKey(
  key: string,
  prefix: string,
  options: ExpandStylesKeyOptions = {},
): string {
  const { portalContentSelector } = options;

  // Portal-aware fast path: emit content-targeting selectors at top
  // level when portal is enabled, regardless of whether the author
  // wrote the bare form or the legacy compound form.
  if (portalContentSelector) {
    const trimmed = key.trim();
    if (trimmed === portalContentSelector) return trimmed;
    const compoundPrefix = `.${prefix} ${portalContentSelector}`;
    if (trimmed === compoundPrefix) return portalContentSelector;
  }

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
/**
 * Auto-consumer block for the box-model primitive slots. Every component
 * root gets these property declarations so the slot pool actually applies
 * without each contract having to wire `padding-inline-start: var(...)`
 * etc. in its styles.json. Longhand-only — see the docblock at the
 * computeCssBlocks callsite for the rationale on excluding the shorthand
 * slots.
 *
 * Author rules in styles.root merge on TOP of this map (object-spread
 * order in the callsite), so any explicit `padding-inline-start: ...`
 * from a contract overrides the consumer default.
 */
function renderBoxModelConsumers(): Record<string, string> {
  return {
    "padding-block-start": "var(--fsds-box-model-padding-block-start)",
    "padding-block-end": "var(--fsds-box-model-padding-block-end)",
    "padding-inline-start": "var(--fsds-box-model-padding-inline-start)",
    "padding-inline-end": "var(--fsds-box-model-padding-inline-end)",
    gap: "var(--fsds-box-model-gap)",
    width: "var(--fsds-box-model-width)",
    "min-width": "var(--fsds-box-model-min-width)",
    "max-width": "var(--fsds-box-model-max-width)",
    height: "var(--fsds-box-model-height)",
    "min-height": "var(--fsds-box-model-min-height)",
    "max-height": "var(--fsds-box-model-max-height)",
  };
}

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
 * Two key shapes are supported:
 *
 * 1. **CSS property keys** (no dot, e.g. `background-color`, `padding-block-start`).
 *    Emits a normal CSS declaration: `<property>: <resolved-value>;`. The
 *    resolved value is either `var(--<tokenSlug(resolvesTo)>[, <fallback>])`
 *    for `resolvesTo` entries or the verbatim literal for `literal` entries.
 *
 * 2. **Slot-path keys** (containing at least one `.`, e.g. `button.color.background.default`).
 *    Emits a CSS custom-property REDEFINITION at this selector's scope:
 *    `--<tokenSlug(slot-path)>: var(--<tokenSlug(resolvesTo)>[, <fallback>]);`.
 *    The slot's consumer site (`.button { background-color: var(--fsds-button-color-background-default) }`)
 *    is unchanged; only the resolution of the slot is re-pointed at this
 *    selector's scope. Used for variant/state redirection — e.g.
 *    `--primary` selector redefines `button.color.background.default` to
 *    point at the primary semantic token.
 *
 * Disambiguation: CSS property names never contain `.` while slot paths
 * always do (they're dotted by construction). The dot count IS the type
 * tag; no separate field is needed.
 *
 * Platform handling:
 *
 *  - `literal` entries: the contract schema requires `platforms` whenever
 *    `literal` is set. If `platforms` is missing we throw — the schema
 *    should have caught it, and silently dropping the declaration (the
 *    previous behavior) hid the contract bug. If `platforms` is present
 *    but excludes the current target, the entry is skipped normally.
 *  - `resolvesTo` entries: `platforms` is optional and defaults to "all
 *    platforms" when absent; explicit `platforms` filters as expected.
 *    This is the symmetry the user spec requires; both branches now
 *    interpret "no platforms array" deliberately rather than by accident.
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
    // Disambiguate property key vs slot-path key once per entry so both
    // the `literal` and `resolvesTo` branches honor the same emission rule.
    const isSlotKey = property.includes(".");
    const outputKey = isSlotKey ? `--${tokenSlug(property)}` : property;

    if (typeof entry.literal === "string") {
      if (!entry.platforms) {
        throw new Error(
          `Style entry "${property}" uses \`literal\` without a \`platforms\` array. ` +
            `The schema requires \`platforms\` on \`literal\` entries; if you see this ` +
            `error the entry bypassed schema validation. Add an explicit ` +
            `\`platforms\` array (e.g. ["web"]) and regenerate.`,
        );
      }
      if (!entry.platforms.includes(platformTarget)) continue;
      // Slot-path key with literal: redefine the slot at this scope to
      // a literal CSS value (e.g. `transparent` for ghost/tertiary
      // variants). The literal flows straight through as the custom-
      // property's value.
      declarations[outputKey] = entry.literal;
      continue;
    }
    if (typeof entry.resolvesTo === "string") {
      const platforms = entry.platforms;
      if (platforms && !platforms.includes(platformTarget)) continue;
      const ref = `--${tokenSlug(entry.resolvesTo)}`;
      const value =
        typeof entry.fallback === "string"
          ? `var(${ref}, ${entry.fallback})`
          : `var(${ref})`;
      declarations[outputKey] = value;
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
  visited: ":visited",
  disabled: ":disabled",
  "read-only": ":read-only",
  checked: ":checked",
  indeterminate: ":indeterminate",
  // ARIA-derived states map to attribute selectors so they cover both
  // React's `aria-*` attributes and any native equivalents.
  expanded: '[aria-expanded="true"]',
  pressed: '[aria-pressed="true"]',
  selected: '[aria-selected="true"]',
};
