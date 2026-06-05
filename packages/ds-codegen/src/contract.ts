/**
 * Normalized view of a component contract JSON file (validated separately via Ajv).
 */

/**
 * One parameter of a `callback` PropTypeIR (PropTypeIR V2). Mirrors a TS
 * function parameter: a name, a (recursive) PropTypeIR, and optionality.
 */
export interface PropCallbackParam {
  name: string;
  type: AuthoredPropType;
  optional?: boolean;
}

/**
 * Framework-neutral structured prop type, authored on `designed`/`constrained`
 * members. When present it supersedes the legacy TS-string `type` as the
 * agnostic source the IR normalizes and emitters lower.
 *
 * V1 (the closed pilot vocabulary, CODEGEN-PROP-TYPE-IR-PILOT-01):
 *   string | number | boolean | enum | node | ref
 * V2 (observed-corpus extension, CODEGEN-PROP-TYPE-IR-OBSERVED-TYPES-01):
 *   callback | array | union | literal | void | promise
 *
 * V2 adds exactly the shapes the real corpus uses (function/collection/union
 * props on controlled components). It deliberately does NOT add an inline
 * anonymous-object kind — named object-ish types stay `ref` to a contract
 * alias; a genuinely anonymous object type remains a declared residual.
 * See docs/a2ui-projection.md.
 */
export type AuthoredPropType =
  // --- V1 ---
  | { kind: 'string' }
  | { kind: 'number' }
  | { kind: 'boolean' }
  | { kind: 'enum'; values: string[] }
  | { kind: 'node'; of?: 'content' | 'icon' }
  | { kind: 'ref'; to: string }
  // --- V2 (observed-corpus extension) ---
  | { kind: 'callback'; params: PropCallbackParam[]; returns: AuthoredPropType }
  | { kind: 'array'; items: AuthoredPropType }
  | { kind: 'union'; of: AuthoredPropType[] }
  | { kind: 'literal'; value: string | number | boolean | null }
  | { kind: 'void' }
  | { kind: 'promise'; of: AuthoredPropType };

export interface StyledPropMember {
  name: string;
  /**
   * Legacy TypeScript type string (the React-first source). Optional now that
   * `designed`/`constrained` members may author a structured `propType` instead.
   * Exactly one of `type` / `propType` is present (schema-enforced).
   */
  type?: string;
  /** Structured, framework-neutral type. Present on migrated members. */
  propType?: AuthoredPropType;
  description?: string;
  required?: boolean;
  default?: unknown;
  /** A2UI disambiguation hint for ReactNode-typed props. */
  nodeKind?: 'node-ref' | 'icon-ref';
}

export interface ContractTypeDef {
  kind: string;
  values?: string[];
  alias?: string;
}

export interface ContractChannel {
  description?: string;
  value: string;
  defaultValue?: string;
  onChange: string;
  valueType?: string;
  /**
   * Shape of the change-handler callback. "value" (default) means the
   * handler receives the channel value directly; "event" means the
   * handler receives a framework-native event object. Declared by the
   * contract so the IR does not have to infer this from React/DOM
   * type-name heuristics — see ir.ts `buildChannelsIR`.
   */
  callbackKind?: "value" | "event";
  enabledBy?: string;
  notes?: string;
  omitWhen?: string;
}

export interface ContractEventPayloadField {
  name: string;
  type: string;
  description?: string;
  optional?: boolean;
}

export interface ContractEventSignature {
  description?: string;
  emittedVia?: string[];
  payload?: ContractEventPayloadField[];
  returns?: string;
  cancelable?: boolean;
  triggeredBy?: string[];
}

export interface ContractStateDimension {
  description?: string;
  values: string[];
  initial?: string;
  exclusive?: boolean;
}

/**
 * Closed vocabulary of native-primitive intents a part may collapse into.
 * Seeded with only the intents actually consumed by emitters; widen in
 * lockstep with new emitter mappings.
 *
 * - `native-toggle-affordance`: collapses to a native on/off control
 *   (SwiftUI Toggle, Android Switch) — see Switch.
 * - `native-disclosure`: collapses to a native disclosure primitive that
 *   holds both the summary/trigger and the collapsible content (SwiftUI
 *   DisclosureGroup, Android expandable) — see Details. The C1 candidate
 *   from MOBILE-COLLAPSE-INTENT-TRIAGE-01.
 */
export type ContractCollapseIntent =
  | 'native-toggle-affordance'
  | 'native-disclosure';

export interface ContractPartDetails {
  description?: string;
  /**
   * Native HTML tag this part is realized as. When set on a part whose
   * tag is in the table composition set (TABLE_COMPOSITION_TAGS in ir.ts),
   * the codegen emits the native element directly (no Stack wrapper).
   * When the part also appears in anatomy.dom, the two tag declarations
   * must agree — the IR builder throws on disagreement.
   *
   * Source fact: contract-authored native realization. Avoids coupling
   * realization to global name-based classifiers (the legacy
   * COMPOUND_PARTS set in semantics.ts), which would bleed into other
   * components that happen to share part names.
   */
  tag?: string;
  role?: string;
  multiple?: boolean;
  focusable?: boolean | 'roving';
  interactive?: boolean;
  portalTarget?: boolean;
  aria?: { role?: string; attributes?: string[] };
  /**
   * Declares that this part's purpose is fully served by a target's native
   * primitive on platforms that ship one. Emitters consult a per-target
   * intent→primitive table; targets without a mapping render the full
   * multi-part anatomy. Web emitters ignore this field.
   */
  collapsibleTo?: ContractCollapseIntent;
}

/**
 * Single DOM node in a contract's `anatomy.dom` tree. Mirrors the shape
 * of a rendered HTML element with optional attribute and event bindings.
 *
 * Special tag values:
 * - `"slot"` — placeholder where consumer-provided children render. In
 *   React/Vue/Angular this becomes `{children}` / `<slot />` / `<ng-content>`;
 *   in Svelte it becomes `{@render children?.()}`. Lit emits `<slot></slot>`.
 * - `"children"` — alias for `"slot"`. Either may be used.
 *
 * Binding expressions (string form, parsed by the IR builder):
 * - `"prop:<name>"` — read a top-level prop value.
 * - `"channel:<name>.value"` — read the channel's current value.
 * - `"channel:<name>.onChange"` — invoke the channel's setter from a DOM event.
 *   Each framework wraps native events idiomatically (e.g. React's onChange
 *   handler reads `event.target.checked` for boolean channels).
 * - `"channel:<name>.defaultValue"` — read the uncontrolled initial value.
 * - `"literal:<text>"` — emit the text verbatim (rare; usually use `attrs`).
 */
export interface ContractDomNode {
  /** HTML tag name, or special `"slot"`/`"children"` placeholder. */
  tag: string;
  /**
   * Named-slot identifier — only meaningful when `tag === "slot"`. Maps to
   * framework idioms: Vue/Lit `<slot name="<name>">`, React `slots.<name>`,
   * Svelte `{@render <name>?.()}`, Angular `<ng-content select="[slot=<name>]">`.
   * Absent means the slot is the default/unnamed slot.
   */
  name?: string;
  /**
   * Optional reference to an `anatomy.parts` entry. The framework emitter
   * derives a BEM `__part` class from this name.
   */
  part?: string;
  /** Static attribute values that appear verbatim in the rendered output. */
  attrs?: Record<string, string>;
  /**
   * Dynamic attribute bindings. Keyed by attribute name (e.g. `aria-label`,
   * `disabled`, `src`). Lower to framework-idiomatic attribute syntax
   * (React JSX prop, Vue `:attr="..."`, Angular `[attr]="..."`, Lit
   * `?attr=${...}`, Svelte `attr={...}`).
   *
   * Event handlers and content/children do NOT belong here — use the
   * sibling `events` and `content` fields. Older contracts that smuggled
   * `onClick` or `children` through `bindings` were never portable: they
   * happened to work on React/Vue (because JSX/Vue accept arbitrary
   * props) but Angular's template parser and Lit's binding model reject
   * them. Authoring them as separate fields gives each emitter the
   * information it needs to lower into the right idiom.
   */
  bindings?: Record<string, string>;
  /**
   * Event bindings keyed by *unprefixed* event name (`"click"`, `"input"`,
   * `"change"`, ...). Each emitter lowers to its framework idiom:
   *   React  → `onClick={prop}`
   *   Vue    → `@click="prop?.()"`
   *   Svelte → `on:click={prop}`
   *   Angular→ `(click)="prop && prop()"`
   *   Lit    → `@click=${this.prop}`
   * Values use the same `prop:`/`channel:`/`literal:` grammar as `bindings`.
   * Channel value strategies for event handlers reuse the existing
   * `channel:<name>.onChange` semantics.
   */
  events?: Record<string, string>;
  /**
   * Single inner-content binding. Emitters lower to the framework's
   * "render this value as the element's content" idiom:
   *   React  → `<span>{prop}</span>`
   *   Vue    → `<span>{{ prop }}</span>` (interpolation; safe for ReactNode-typed props that resolve to renderable values)
   *   Svelte → `<span>{prop}</span>`
   *   Angular→ `<span>{{ prop }}</span>`
   *   Lit    → `<span>${this.prop}</span>`
   * Mutually exclusive with `children` on the same node: if you want a
   * prop's value to appear *between* other children, wrap it in its own
   * `tag: "span" content: "prop:..."` child.
   */
  content?: string;
  /**
   * Optional child nodes. Empty/absent for leaf elements. Mutually
   * exclusive with `content` on the same node — see `content` field.
   */
  children?: ContractDomNode[];
  /**
   * Render guard. Two shapes:
   * - `"<prop>"`  — render only when the named prop is truthy
   * - `"!<prop>"` — render only when the named prop is FALSY (e.g. for
   *   fallback elements that show when an optional input is absent)
   * - `"children"` — special: render only when consumer-provided
   *   children exist.
   */
  if?: string;
  /**
   * Iteration directive — renders this node N times, driven by a prop.
   * Index-keyed iteration only; not suitable for sortable/reorderable lists.
   * See `IterationIR` in `ir.ts` for the resolved form.
   */
  iterate?: ContractDomNodeIterate;
  /**
   * CSS custom-property bindings on this element's runtime `style` attribute.
   * Keys must match `--fsds-<component>-<name>` (validated at IR-build).
   * Values use the same `prop:`/`channel:`/`literal:` grammar as `bindings`.
   * Lowers to framework-idiomatic style bindings (React/Vue/Lit object-style;
   * Svelte `style:--x={v}`; Angular `[style.--x]`). Mutually exclusive with
   * a literal `style` attribute on the same node.
   */
  cssVariableBindings?: Record<string, string>;
}

/**
 * Iteration directive on a DOM node. Authored under
 * `anatomy.dom[].iterate` in the contract; parsed into `IterationIR` by the
 * IR builder.
 */
export interface ContractDomNodeIterate {
  /** Binding expression naming the iteration source prop. e.g. `"prop:length"`. */
  source: string;
  /** `"count"` for N-copy iteration over a number prop; `"array"` for per-item iteration. */
  kind: 'count' | 'array';
  /** Render-context variable name for the loop index. Defaults to `"index"`. */
  indexVar?: string;
  /** Render-context variable name for the current item (kind=array only). Defaults to `"item"`. */
  itemVar?: string;
  /** TypeScript type of each item. Required when kind=array. */
  itemType?: string;
}

/**
 * Resolution for a single slot in `<Name>.tokens.json` — either a graph-backed
 * `resolvesTo` + `fallback` pair, or an intentional `literal` hardcode.
 *
 * No `property` field: slots are pure indirection; which CSS property reads
 * which slot is the concern of `<Name>.styles.json`.
 */
export interface TokenResolution {
  /** Dotted path into the global token graph (e.g. `semantic.color.background.tertiary`). */
  resolvesTo?: string;
  /** Hardcoded fallback used as the second argument to `var()`. */
  fallback?: string;
  /** Intentional literal value, mutually exclusive with `resolvesTo`+`fallback`. */
  literal?: string;
  /** Token tier; defaults to `semantic`. */
  layer?: 'core' | 'semantic' | 'brand' | 'density';
}

/**
 * Targets a styleEntry literal can render to. Defaults to all three when
 * omitted on a `resolvesTo` entry; required on `literal` entries.
 */
export type StylePlatform = 'web' | 'ios' | 'android';

/**
 * Resolution for a single CSS declaration inside a styles.json selector
 * block. Either references a slot / global token (`resolvesTo`) or carries
 * an intentional literal (`literal` + `platforms`).
 */
export interface StyleEntry {
  /**
   * Dotted path. If the first segment matches the contract's `cssPrefix`,
   * the path refers to a slot declared in this contract's tokens.json
   * (component-local). Otherwise the path refers to the global token graph
   * (`core.*` / `semantic.*`) — only legal when authored by the IR as a
   * direct global passthrough; the validator catches improper uses.
   */
  resolvesTo?: string;
  /** Optional consumer-site fallback. Usually unneeded; the slot's own fallback chains via the cascade. */
  fallback?: string;
  /** Hardcoded CSS value, emitted verbatim when the build target is in `platforms`. */
  literal?: string;
  /** Build targets that honor this entry. Required on `literal`, optional on `resolvesTo`. */
  platforms?: StylePlatform[];
}

// ---------------------------------------------------------------------------
// Behavior contract types — previously `unknown` in ComponentContract.
// ---------------------------------------------------------------------------

export interface ContractFocus {
  description?: string;
  /** `trap` for modal-class containers, `roving` for menus/lists, `auto` defers to the platform. */
  strategy?: 'trap' | 'roving' | 'auto' | 'manual' | 'none';
  orientation?: 'horizontal' | 'vertical' | 'both';
  /** Anatomy part name receiving initial focus, or `prop:<name>` to source from a prop. */
  initialFocus?: string;
  /** Where focus returns when the component closes/unmounts. */
  returnFocus?: string;
  /** Whether roving navigation wraps at the ends. */
  wrap?: boolean;
  /** Whether body scroll is locked while the component is mounted/open. */
  scrollLock?: boolean;
}

export interface ContractPortal {
  enabled?: boolean;
  /** Default DOM mount point (e.g. `body`, `<element-id>`). */
  defaultTarget?: string;
  /** Prop name allowing the consumer to override the mount point. */
  targetProp?: string;
  positioning?: 'anchored' | 'centered' | 'fixed' | 'none';
  layering?: 'modal' | 'popover' | 'tooltip' | 'menu' | 'toast' | 'none';
  backdrop?: boolean;
  collision?: 'flip' | 'shift' | 'flip-shift' | 'none';
}

export type DismissalEvent =
  | 'escape'
  | 'overlayClick'
  | 'outsideClick'
  | 'blur'
  | 'routeChange'
  | 'triggerReclick'
  | 'userDismiss'
  | 'selection';

export interface ContractDismissalTrigger {
  event: DismissalEvent;
  /** Prop whose truthy value enables this trigger; absent means always-on. */
  enabledBy?: string;
  defaultEnabled?: boolean;
  description?: string;
}

export interface ContractDismissal {
  triggers?: ContractDismissalTrigger[];
}

/**
 * Presence-surface family (see docs/presence-surfaces.md).
 * Semantic classifier + controller-selection descriptor. Coordinates
 * anatomy part roles with presence, modality, anchoring, positioning,
 * and dismissal mode list. Does NOT duplicate the existing portal,
 * dismissal, or focus blocks — those remain the detailed policy knobs.
 */
export type ContractSurfaceKind =
  | 'tooltip'
  | 'popover'
  | 'dialog'
  | 'menu'
  | 'select'
  | 'toast'
  | 'coachmark'
  | 'sheet';

export type ContractSurfacePresence = 'ephemeral' | 'persistent';

export type ContractSurfaceModality = 'blocking' | 'non-blocking';

export type ContractSurfaceAnchorRelation =
  | 'describedby'
  | 'controls-expanded'
  | 'labelledby'
  | 'activedescendant'
  | 'none';

export type ContractSurfacePositioningStrategy =
  | 'anchored'
  | 'centered'
  | 'viewport-edge'
  | 'inline';

export type ContractSurfaceCollision = 'none' | 'flip' | 'shift' | 'flip-shift';

export type ContractSurfaceDismissalMode =
  | 'escape'
  | 'outside-click'
  | 'blur'
  | 'pointer-leave'
  | 'close-button'
  | 'timeout';

export type ContractSurfaceOpenTrigger = 'hover' | 'focus' | 'click';

export interface ContractSurfaceAnchor {
  part: string;
  relation: ContractSurfaceAnchorRelation;
}

export interface ContractSurfaceContent {
  part: string;
  interactive: boolean;
}

export interface ContractSurfacePositioning {
  strategy: ContractSurfacePositioningStrategy;
  placementProp?: string;
  collision?: ContractSurfaceCollision;
}

export interface ContractSurfaceTiming {
  openDelayProp?: string;
  closeDelayProp?: string;
  autoDismissProp?: string;
}

export interface ContractSurface {
  kind: ContractSurfaceKind;
  presence: ContractSurfacePresence;
  modality: ContractSurfaceModality;
  anchor?: ContractSurfaceAnchor;
  content?: ContractSurfaceContent;
  positioning?: ContractSurfacePositioning;
  dismissal?: ContractSurfaceDismissalMode[];
  /**
   * Anchor-element interactions that open the surface. Required by IR
   * validation when kind === 'tooltip' OR positioning.strategy === 'anchored';
   * otherwise optional. Surfaces like Toast (viewport-edge) and centered
   * Dialog have no anchor-driven open trigger and omit this field.
   */
  openTriggers?: ContractSurfaceOpenTrigger[];
  timing?: ContractSurfaceTiming;
}

export interface ContractFormSerialization {
  valueType: string;
  valueSource: string;
  omitWhen?: 'unchecked' | 'empty' | 'disabled' | 'never';
  multiple?: boolean;
}

export interface ContractFormValidity {
  model?: 'native' | 'props' | 'hybrid';
  invalidProp?: string;
  errorMessageProp?: string;
  errorSurface?: 'aria-describedby' | 'aria-errormessage' | 'live-region' | 'none';
  ariaAttributes?: string[];
}

export interface ContractFormLabeling {
  strategy?: 'associated-label' | 'self-labeling' | 'wrapped-label';
  required?: boolean;
  via?: string[];
}

export interface ContractFormAutofill {
  autocomplete?: string;
  hints?: string[];
}

export interface ContractFormPropRef {
  prop: string;
  description?: string;
  constraintValidation?: boolean;
}

export interface ContractForm {
  participates: boolean;
  inputType?:
    | 'text' | 'number' | 'email' | 'password' | 'search' | 'tel' | 'url'
    | 'date' | 'time' | 'datetime-local' | 'month' | 'week' | 'color'
    | 'file' | 'checkbox' | 'radio' | 'select' | 'hidden' | 'combobox' | 'custom';
  name?: ContractFormPropRef;
  formProp?: ContractFormPropRef;
  required?: ContractFormPropRef;
  serialization?: ContractFormSerialization;
  validity?: ContractFormValidity;
  labeling?: ContractFormLabeling;
  autofill?: ContractFormAutofill;
}

/**
 * Geometry / default-affordance axis (MORPHOLOGY-GEOMETRY-PROFILE-01). Closed
 * enum mirroring `component.contract.schema.json#/properties/morphology`. When
 * present, selects a StyleProfile (box-model.ts#STYLE_PROFILES) layered BETWEEN
 * the BoxModel primitive defaults and the component token sidecar — the sidecar
 * still wins. Absent => the legacy two-way primitive-under-sidecar merge and no
 * structural CSS, so unclassified components are byte-unchanged. Distinct from
 * the behavioral `category` axis: morphology drives box-model geometry only.
 */
export type ContractMorphology =
  | "fixed-square"
  | "content-inline"
  | "identity-inline"
  | "linear-meter"
  | "loading-block"
  | "replaced-media";

export interface ComponentContract {
  name: string;
  layer?: string;
  cssPrefix?: string;
  /** See {@link ContractMorphology}. Optional; absent keeps legacy geometry. */
  morphology?: ContractMorphology;
  /** Anatomy as a flat name list, or the richer object form with optional `details` per part. */
  anatomy?:
    | string[]
    | {
        parts: string[];
        description?: string;
        details?: Record<string, ContractPartDetails>;
        /**
         * Optional explicit DOM tree describing how anatomy parts compose
         * into rendered elements with attribute and event bindings. When
         * present, framework component-source emitters walk this tree to
         * produce idiomatic templates (JSX / SFC / html`/ component
         * template / Svelte block). When absent, emitters fall back to the
         * existing single-root-with-slot output. See ContractDomNode.
         */
        dom?: ContractDomNode;
      };
  props?: {
    styled?: { description?: string; members?: StyledPropMember[] };
    hook?: { description?: string; members?: StyledPropMember[] };
    [key: string]: { description?: string; members?: StyledPropMember[] } | undefined;
  };
  types?: Record<string, ContractTypeDef>;
  channels?: Record<string, ContractChannel>;
  dataModel?: {
    entities?: Record<string, { description?: string; fields: Record<string, string> }>;
    semantics?: Record<string, string>;
  };
  variants?: Record<string, string[]>;
  /** States as a flat list (legacy) or dimensional form. */
  states?:
    | string[]
    | { dimensions: Record<string, ContractStateDimension>; description?: string };
  tokens?: Record<string, TokenResolution>;
  styles?: Record<string, Record<string, StyleEntry>>;
  keyframes?: Record<string, Record<string, Record<string, string>>>;
  events?: Record<string, ContractEventSignature>;
  stateMachine?: {
    description?: string;
    transitions?: Array<{
      event: string;
      from?: string;
      to: string;
      guard?: string;
      effect?: string;
      description?: string;
    }>;
  };
  form?: ContractForm;
  motion?: unknown;
  focus?: ContractFocus;
  portal?: ContractPortal;
  dismissal?: ContractDismissal;
  surface?: ContractSurface;
  relationships?: Array<{
    from: string;
    to: string;
    attribute: string;
    when?: string;
    description?: string;
  }>;
  a11y?: {
    role?: string;
    labeling?: string[];
    keyboard?: Array<string | { key: string; action: string; when?: string; mode?: string }>;
    screenReader?: string[];
    /**
     * Typed unresolved ARIA-obligation acknowledgements. The contract-side
     * a11y validator (A11Y-CONTRACT-OBLIGATION-VALIDATOR-01) walks
     * `anatomy.dom` and asserts that every static role with a required
     * ARIA state has it declared (as attr or binding). When a contract
     * cannot yet truthfully declare the required state — e.g. because
     * the underlying selection model needs a grammar that hasn't landed
     * — it acknowledges the gap here with a typed reason, and the
     * validator degrades to an advisory diagnostic instead of failing.
     *
     * Each entry is point-in-time documentation of a real technical
     * blocker; the reason should cite the slice/issue that would
     * unblock the fix. This is not a silencer for arbitrary a11y
     * complaints — it's the explicit "we know, this is held until X"
     * channel.
     */
    obligations?: {
      suppress?: Array<{
        /** ARIA role the suppression applies to (e.g. "option"). */
        role: string;
        /** Required attribute the contract cannot yet provide (e.g. "aria-selected"). */
        attr: string;
        /** Why the obligation can't be met today + what would unblock it. */
        reason: string;
      }>;
    };
  };
  usage?: { example?: string; hookExample?: string };
  a2ui?: {
    category: string;
    usageHints?: string[];
    children?: {
      allowed: boolean;
      slot?: string;
      accepts?: string[];
      min?: number;
      max?: number;
    };
  };
  codegen?: { tests?: boolean };
}

/** PascalCase to kebab-case */
export function toKebab(str: string): string {
  return str.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
}

export function getParts(anatomy: ComponentContract["anatomy"]): string[] {
  if (!anatomy) return [];
  if (Array.isArray(anatomy)) return anatomy;
  return anatomy.parts || [];
}

export function getPartDetails(
  anatomy: ComponentContract["anatomy"],
): Record<string, ContractPartDetails> {
  if (!anatomy || Array.isArray(anatomy)) return {};
  return anatomy.details || {};
}

export function getStyledProps(contract: ComponentContract): StyledPropMember[] {
  return contract.props?.styled?.members || [];
}

/**
 * The component's consumer-facing prop surface as the union of the durable
 * buckets — `designed` + `constrained` + legacy `styled` — deduped by name
 * (first wins; designed > constrained > styled). This is the non-breaking
 * sourcing path (CODEGEN-PROP-TYPE-IR-PILOT-01): contracts migrated to the
 * six-bucket form expose props via `designed`/`constrained`; unmigrated
 * contracts keep exposing them via legacy `styled`. The IR normalizes every
 * member (structured `propType` or legacy `type`) into PropTypeIR downstream.
 */
export function getPropMembers(contract: ComponentContract): StyledPropMember[] {
  const props = contract.props ?? {};
  const ordered = [
    ...(props.designed?.members ?? []),
    ...(props.constrained?.members ?? []),
    ...(props.styled?.members ?? []),
  ];
  const byName = new Map<string, StyledPropMember>();
  for (const m of ordered) {
    if (m && typeof m.name === 'string' && !byName.has(m.name)) byName.set(m.name, m);
  }
  return [...byName.values()];
}

export function getCssPrefix(contract: ComponentContract): string {
  return contract.cssPrefix || toKebab(contract.name);
}

/**
 * Normalized view of a contract's `states` field.
 *
 * Contracts may declare states as a flat list (legacy) or as orthogonal
 * dimensions (each with its own values). The shared codegen pipeline always
 * needs a flat list (for CSS modifier emission and React boolean-prop class
 * recipes), and emitters that care about the underlying axes can read
 * `dimensions` directly.
 */
export interface NormalizedStates {
  /**
   * Flat union of every state value across every dimension. Deduplicated and
   * preserves first-seen order. Empty array when the contract omits states.
   */
  flat: string[];
  /**
   * The dimensional form when the contract authored it that way. `null` when
   * the contract used the flat list form (or omitted states entirely).
   */
  dimensions: Record<string, ContractStateDimension> | null;
}

export function normalizeStates(
  states: ComponentContract["states"],
): NormalizedStates {
  if (!states) return { flat: [], dimensions: null };
  if (Array.isArray(states)) {
    return { flat: dedupe(states), dimensions: null };
  }
  const dims = states.dimensions;
  const flat: string[] = [];
  for (const dim of Object.values(dims)) {
    for (const v of dim.values) flat.push(v);
  }
  return { flat: dedupe(flat), dimensions: dims };
}

function dedupe(values: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const v of values) {
    if (seen.has(v)) continue;
    seen.add(v);
    out.push(v);
  }
  return out;
}
