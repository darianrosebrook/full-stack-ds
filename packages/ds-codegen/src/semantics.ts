import type {
  ComponentContract,
  ContractSurfaceDismissalMode,
  ContractSurfaceKind,
} from "./contract.js";
import { getParts } from "./contract.js";

/** Map well-known anatomy parts to semantic HTML elements */
export const SEMANTIC_ELEMENTS: Record<string, string | undefined> = {
  root: undefined,
  header: "header",
  footer: "footer",
  title: "h3",
  label: "label",
  body: "div",
  content: "div",
  description: "p",
  icon: "span",
  overlay: "div",
  container: "div",
  list: "ul",
  item: "li",
  option: "li",
  panel: "div",
  section: "section",
  track: "div",
  thumb: "div",
  fill: "div",
  trigger: "button",
  input: "input",
  button: "button",
};

/** Map a11y roles to root HTML elements */
export const ROLE_TO_ELEMENT: Record<string, string> = {
  button: "button",
  link: "a",
  navigation: "nav",
  complementary: "aside",
  region: "section",
  article: "article",
  table: "table",
  dialog: "div",
  tooltip: "div",
  textbox: "div",
  searchbox: "div",
  slider: "div",
  switch: "div",
  checkbox: "div",
  radio: "div",
  menu: "div",
  menuitem: "div",
  listbox: "div",
  combobox: "div",
  tablist: "div",
  group: "div",
  toolbar: "div",
  status: "div",
  spinbutton: "div",
  none: "div",
  compound: "div",
};

/** Parts that never render as standalone sub-components. */
export const ROOT_ONLY_PARTS = new Set([
  "root",
  "focus",
  "context",
  "provider",
  "section",
  "groupContext",
  "contextProvider",
  "field",
]);

/**
 * Roles implied by a given root HTML element. When the contract's
 * `a11y.role` matches the implicit role, emitters omit the explicit
 * `role=` attribute to avoid redundancy.
 */
export const IMPLICIT_ROLES_BY_ELEMENT: Record<string, string> = {
  button: "button",
  a: "link",
  nav: "navigation",
  section: "region",
  article: "article",
  aside: "complementary",
  table: "table",
  form: "form",
  main: "main",
  header: "banner",
  footer: "contentinfo",
};

const COMPOUND_PARTS = new Set([
  "header",
  "footer",
  "body",
  "content",
  "title",
  "description",
  "panel",
  "item",
  "option",
  "group",
  "list",
  "tab",
  "trigger",
]);

export function getRootElement(contract: ComponentContract): string {
  const role = contract.a11y?.role;
  if (!role) return "div";
  return ROLE_TO_ELEMENT[role] || "div";
}

export function isCompoundPart(part: string): boolean {
  if (ROOT_ONLY_PARTS.has(part)) return false;
  return COMPOUND_PARTS.has(part);
}

export function getCompoundParts(contract: ComponentContract): string[] {
  const parts = getParts(contract.anatomy);
  return parts.filter((p) => isCompoundPart(p) && p !== "root");
}

/**
 * Normalized "how this host element exposes a channel value to a
 * DOM event listener." A framework-neutral fact derived from the
 * host tag + channel value type. Every framework emitter consumes
 * this fact rather than re-deriving host capability locally.
 *
 * Authority: this is shared DOM-semantic knowledge, NOT framework
 * realization. The framework emitter only knows how to lower a
 * given strategy into its idiomatic event-handler syntax.
 *
 * - `checked`     — read `.checked` from a checkbox/radio input.
 * - `value`       — read `.value` from an input/select/textarea
 *                   that natively exposes a string value.
 * - `numberValue` — read `Number(.value)` from a numeric input.
 * - `toggle`      — host has no DOM-native readback for this
 *                   channel value (e.g. `<button role="switch">`).
 *                   Dispatch `!currentValue` instead of reading.
 * - `event`       — caller wants the raw event object (the
 *                   contract's `callbackKind === "event"`).
 *
 * See docs/codegen-authority.md and CODEGEN-IR-EVENT-VALUE-STRATEGY-01.
 */
export type EventValueStrategy =
  | "checked"
  | "value"
  | "numberValue"
  | "toggle"
  | "event";

/** Host elements that natively expose a `.value` / `.checked` DOM property. */
const FORM_CONTROL_HOSTS = new Set(["input", "select", "textarea"]);

/**
 * Resolve the event-value strategy for a channel change binding at a
 * specific host element. Framework emitters call this with the host
 * tag (from `dom-tree.node.tag`), the channel value type (from IR),
 * and the channel's callback kind. The returned strategy tells the
 * emitter what to dispatch when the host fires its change/click event.
 *
 * Removable when: contracts gain explicit `eventValueStrategy`
 * declarations on channel bindings (CODEGEN-CONTRACT-EVENT-STRATEGY-02),
 * at which point this resolver becomes a default-only fallback.
 */
export function resolveEventValueStrategy(args: {
  hostTag: string;
  channelValueType: string | undefined;
  callbackKind: "value" | "event";
}): EventValueStrategy {
  if (args.callbackKind === "event") return "event";
  const isFormControl = FORM_CONTROL_HOSTS.has(args.hostTag.toLowerCase());
  const t = args.channelValueType;
  if (t === "boolean") {
    if (!isFormControl) return "toggle";
    return "checked";
  }
  if (t === "number") {
    if (!isFormControl) return "value";
    return "numberValue";
  }
  // string / undefined / unknown — default to reading .value when the
  // host supports it, otherwise read .value via a non-form-control
  // shim (the emitter lowers this case as the calling framework
  // requires).
  return "value";
}

// ---------------------------------------------------------------------------
// Anchored-surface kind policy (CODEGEN-SURFACE-KIND-POLICY-01)
// ---------------------------------------------------------------------------

/**
 * The substrate family a surface kind realizes against. Each
 * family has its own controller-and-listener machinery in the per-
 * framework primitives packages.
 */
export type SurfaceFamily =
  | "anchored-presence" // tooltip, popover, menu, select (anchored, non-modal)
  | "modal-presence" // dialog (centered, blocking)
  | "edge-presence" // toast, sheet (viewport-edge or slide-in)
  | "inline-presence"; // coachmark (inline-rendered guidance)

/**
 * Consumer-facing dismissal prop description. Promoted from the
 * framework-local DISMISSAL_PROP_SPECS maps in React + Vue surface
 * emitters (atom B + F-3B-1-B) so the prop-shape decision lives
 * once in shared semantics.
 *
 * `prop === null` means the dismissal mode has no public knob and
 * is substrate-internal only (Tooltip's pointer-leave grace path).
 */
export interface PublicDismissalProp {
  mode: ContractSurfaceDismissalMode;
  prop: string | null;
  defaultValue: boolean;
  /**
   * When true, the prop is read via a runtime getter so toggling
   * it at the consumer remounts the controller. When false, the
   * mode is always-on in the dismissal array (no public toggle).
   */
  runtimeToggleable: boolean;
}

/**
 * Resolved policy for an anchored-presence-family surface. Framework
 * surface emitters consume this rather than re-deriving kind-specific
 * behavior locally. The policy is purely contract-derived; it does
 * NOT carry framework-progress state (i.e. "has Svelte landed this
 * kind yet?"). Each framework retains its own implemented-set if
 * needed, but the semantic shape of "what does this kind mean"
 * lives here.
 *
 * Authority: shared codegen semantics derived from `surface.{kind,
 * presence, modality, anchor, content, openTriggers, dismissal}`.
 *
 * Removable when: contracts begin declaring policy directly (no
 * sane reason to expect this soon — the policy IS the contract's
 * normalized form for emitter consumption).
 */
export interface AnchoredSurfacePolicy {
  family: "anchored-presence";
  kind: ContractSurfaceKind;
  /**
   * Default ARIA role for the content element when the contract
   * does not declare one explicitly (anatomy.parts.<content>.aria.role).
   * tooltip-kind surfaces default to "tooltip"; other anchored
   * kinds (popover) emit no forced role and rely on the anchor
   * relation + content interactivity for screen-reader semantics.
   */
  defaultContentRole: string | null;
  /**
   * Ordered list of consumer-facing dismissal props derived from
   * `surface.dismissal`. Each entry tells the emitter the prop
   * name, default value, and whether it's runtime-toggleable.
   * Entries with `prop: null` are filtered for public-API emission
   * but kept for substrate-internal dismissal-array assembly.
   */
  publicDismissalProps: PublicDismissalProp[];
}

/**
 * Canonical map from dismissal mode → consumer prop shape. Owned
 * here rather than in each framework's surface emitter so emitters
 * agree on consumer ergonomics. Modes with `prop: null` have no
 * consumer knob (pointer-leave is a substrate-internal Tooltip
 * grace path).
 */
const DISMISSAL_PROP_TABLE: Record<
  ContractSurfaceDismissalMode,
  PublicDismissalProp
> = {
  escape: { mode: "escape", prop: "closeOnEscape", defaultValue: true, runtimeToggleable: true },
  blur: { mode: "blur", prop: "closeOnBlur", defaultValue: true, runtimeToggleable: true },
  "outside-click": {
    mode: "outside-click",
    prop: "closeOnOutsideClick",
    defaultValue: true,
    runtimeToggleable: true,
  },
  "pointer-leave": {
    mode: "pointer-leave",
    prop: null,
    defaultValue: true,
    runtimeToggleable: false,
  },
  "close-button": {
    mode: "close-button",
    prop: null,
    defaultValue: true,
    runtimeToggleable: false,
  },
  timeout: { mode: "timeout", prop: null, defaultValue: true, runtimeToggleable: false },
};

/**
 * Anchored-presence kinds that the substrate currently
 * understands. As more kinds (menu, select) get contracts on the
 * same substrate, they're added here. This set declares
 * "contract-level admissibility into the anchored family" — it is
 * NOT a per-framework progress allowlist.
 */
const ANCHORED_PRESENCE_KINDS = new Set<ContractSurfaceKind>([
  "tooltip",
  "popover",
]);

export function isAnchoredPresenceKind(kind: ContractSurfaceKind): boolean {
  return ANCHORED_PRESENCE_KINDS.has(kind);
}

/**
 * Minimal surface shape the policy resolver needs. Defined locally
 * to avoid an import cycle with ir.ts (which already imports from
 * semantics.ts). Structurally compatible with SurfaceIR.
 */
export interface SurfacePolicyInput {
  kind: ContractSurfaceKind;
  dismissal: readonly ContractSurfaceDismissalMode[];
  content?: { part: { details?: { aria?: { role?: string } } } };
}

/**
 * Resolve the anchored-surface policy for an IR surface. Throws
 * when the kind is not in the anchored family — emitters should
 * gate on `isAnchoredPresenceKind` before calling.
 */
export function resolveAnchoredSurfacePolicy(
  surface: SurfacePolicyInput,
): AnchoredSurfacePolicy {
  if (!isAnchoredPresenceKind(surface.kind)) {
    throw new Error(
      `resolveAnchoredSurfacePolicy: kind "${surface.kind}" is not in the anchored-presence family. ` +
        `Allowed: ${[...ANCHORED_PRESENCE_KINDS].join(", ")}.`,
    );
  }
  const contractRole = surface.content?.part.details?.aria?.role;
  const defaultContentRole =
    contractRole ?? (surface.kind === "tooltip" ? "tooltip" : null);

  const publicDismissalProps = surface.dismissal.map(
    (mode) => DISMISSAL_PROP_TABLE[mode],
  );

  return {
    family: "anchored-presence",
    kind: surface.kind,
    defaultContentRole,
    publicDismissalProps,
  };
}
