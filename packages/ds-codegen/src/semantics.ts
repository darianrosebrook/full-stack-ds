import type { ComponentContract } from "./contract.js";
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
