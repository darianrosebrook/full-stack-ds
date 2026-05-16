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
