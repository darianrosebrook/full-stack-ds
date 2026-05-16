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

export interface ContractPartDetails {
  description?: string;
  role?: string;
  multiple?: boolean;
  focusable?: boolean | 'roving';
  interactive?: boolean;
  portalTarget?: boolean;
  aria?: { role?: string; attributes?: string[] };
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
   * Truthy-prop guard. When set, the node renders only if the named prop
   * resolves truthy at runtime. Special values:
   * - `"children"` — render only when consumer-provided children exist.
   */
  if?: string;
}

/**
 * Structured token value. Required for codegen to emit `var(--<name>, <fallback>)`
 * declarations rather than blank comment placeholders.
 */
export interface TokenResolution {
  /** Semantic token name without the leading `--` (e.g. `btn.color.primary-bg`). */
  resolvesTo: string;
  /** Hardcoded fallback value used when the custom property is unset. */
  fallback: string;
  /** CSS property this token binds to (e.g. `background-color`, `padding`). */
  property?: string;
  /** Token tier; defaults to `semantic`. */
  layer?: 'core' | 'semantic' | 'brand' | 'density';
}

/**
 * A token leaf is either a flat list of names (legacy) or a structured map.
 * In the structured form each value is either a `TokenResolution` (drives a
 * real `var()` declaration) or a plain string (legacy entry, still rendered
 * as a comment shim). Mixed maps are allowed so partial migration doesn't
 * force whole leaves to stay flat.
 */
export type TokenLeaf =
  | string[]
  | Record<string, TokenResolution | string>;

/** Recursive token tree: a leaf, or a map keyed by part/variant of more leaves/trees. */
export type TokenTree = TokenLeaf | { [key: string]: TokenLeaf | TokenTree };

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
  tokens?: Record<string, TokenLeaf | TokenTree>;
  styles?: Record<string, Record<string, string>>;
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
