/**
 * Normalized view of a component contract JSON file (validated separately via Ajv).
 */

export interface StyledPropMember {
  name: string;
  type: string;
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
  notes?: string;
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
 */
export type ContractCollapseIntent = 'native-toggle-affordance';

export interface ContractPartDetails {
  description?: string;
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
   * Dynamic bindings keyed by attribute or event name. Framework emitters
   * map these into idiomatic syntax (React `onChange={...}`, Vue
   * `@change="..."`, Angular `(change)="..."`, Lit `@change=${...}`,
   * Svelte `onchange={...}`).
   */
  bindings?: Record<string, string>;
  /**
   * Optional child nodes. Empty/absent for leaf elements.
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

export interface ComponentContract {
  name: string;
  layer?: string;
  cssPrefix?: string;
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
