import type { ContractTypeDef } from "./contract.js";
import { toKebab } from "./contract.js";
import type {
  BindingExpression,
  ComponentIR,
  DomNodeIR,
  NormalizedChannelIR,
  NormalizedDismissalTriggerIR,
  ResolvedPropIR,
} from "./ir.js";
import { computeTaintedAxes, hasChildrenPlaceholder } from "./ir.js";
import {
  getInteractiveItemPart,
  getMultipleItemPart,
  getRegionPart,
  isDisclosureContainer,
} from "./frameworks/react/hook-source.js";

/**
 * Roles that are conventionally bound to an inner element (input, button,
 * etc.) rather than the root, so generated tests should not assert them on
 * the root wrapper.
 */
const INNER_ELEMENT_ROLES = new Set([
  "checkbox",
  "radio",
  "switch",
  "textbox",
  "searchbox",
  "slider",
  "spinbutton",
  "combobox",
  "dialog",
  "tooltip",
  "menu",
  "tablist",
  "listbox",
]);

/** Roles that require a label to be axe-clean. */
const ROLES_NEEDING_LABEL = new Set([
  "region",
  "dialog",
  "navigation",
  "complementary",
  "form",
  "group",
  "tablist",
  "toolbar",
  "menu",
  "listbox",
  "combobox",
  "searchbox",
]);

const INNER_ROLES_NEEDING_LABEL = new Set([
  "checkbox",
  "radio",
  "switch",
  "textbox",
  "searchbox",
  "slider",
  "spinbutton",
  "combobox",
]);

/**
 * Native elements and ARIA roles whose root element responds to click/change
 * by firing a handler.
 */
const CLICKABLE_ROOT_ELEMENTS = new Set(["button", "input", "a"]);
const CLICKABLE_ROOT_ROLES = new Set(["button", "checkbox", "switch", "radio"]);

export type ChannelInteractionKind = "click" | "change" | "render-only";

export interface VariantTestCase {
  dimension: string;
  value: string;
  className: string;
}

export interface RoleTestCase {
  role: string;
}

export interface ChannelTestCase {
  channel: NormalizedChannelIR;
  spyName: string;
  interaction: ChannelInteractionKind;
}

export interface EscapeDismissalTestCase {
  trigger: NormalizedDismissalTriggerIR;
  channel: NormalizedChannelIR;
  spyName: string;
  defaultProp: string;
}

export type OverlayClickDismissalTestCase = EscapeDismissalTestCase;

export interface AccessibilityLabelInput {
  /** Public input name used by a generated axe fixture. */
  name: string;
  /** Non-empty accessible name supplied by the fixture. */
  value: string;
  /** Whether the input is a declared component prop or a host attribute. */
  kind: "prop" | "attribute";
}

export interface AccessibilityContentFixture {
  /** Named consumer slot/snippet; undefined means the default child surface. */
  slotName: string | undefined;
  /** Static HTML whose shape is valid for the contract-declared host. */
  html: string;
}

export interface AccessibilityTestCase {
  labelInput: AccessibilityLabelInput | undefined;
  needsListParent: boolean;
  /** Prop values required to activate the contract's accessible role branch. */
  props: Array<{ name: string; value: string | number | boolean }>;
  /**
   * Contract-derived content that makes the axe fixture exercise real naming
   * and DOM-structure paths. In particular, an aria-labelledby target must
   * not be left empty and a list must not be tested with a bare text node.
   */
  content: AccessibilityContentFixture[];
}

/**
 * Required non-channel prop that must appear on every generated
 * render call site so the component contract is satisfied at the
 * test type level. The `expression` is a JS literal/cast string the
 * test emitter can interpolate directly into JSX (e.g. `""`, `0`,
 * `"info"`, `{} as PostcardAuthor`).
 *
 * Surfaced by FRAMEWORK-EMIT-VALIDATE-01: components with required
 * non-channel props (AnimatedText.text, Avatar.name, Image.alt,
 * Icon.icon, Details.summary, Field.name, Status.status,
 * Postcard.{postId,author,timestamp,stats}, Select.options) had no
 * generated placeholder, so the generated tests were green at
 * runtime but red under tsc with TS2741/TS2739.
 */
export interface RequiredPropPlaceholder {
  /** Prop name as authored. */
  name: string;
  /** JS expression string to splat into render-call JSX, e.g. `""`. */
  expression: string;
}

/**
 * Remove the named-type assertion from a required-prop placeholder when the
 * framework test harness intentionally accepts `Record<string, unknown>`.
 * The runtime value is still supplied, but the generated test no longer
 * refers to a component-local type alias that is not in the test module.
 * React keeps the assertion because its JSX call site is type-checked and
 * imports the alias explicitly.
 */
export function runtimeRequiredPropExpression(expression: string): string {
  return expression.replace(
    /^(\{\})\s+as\s+[A-Za-z_$][A-Za-z0-9_$]*$/,
    "$1",
  );
}

export interface ComponentTestPlan {
  name: string;
  cssPrefix: string;
  testId: string;
  compoundImports: string[];
  renderOpenProp?: string;
  hasBehaviorTests: boolean;
  needsAct: boolean;
  needsFireEvent: boolean;
  needsUserEvent: boolean;
  /**
   * Required non-channel props that the test emitter must splat
   * into every render call. Channel-controlled props are emitted
   * separately by the channel-specific render paths; this bag
   * carries the props that the type signature insists on but the
   * test framework wouldn't otherwise know to provide.
   */
  requiredProps: RequiredPropPlaceholder[];
  /**
   * Whether the component renders a child placement (either a dom-tree
   * `{ tag: "children" }` placeholder, or the legacy no-dom-tree path which
   * always wraps in `<Stack>{children}</Stack>`). Test generators consult
   * this to avoid passing JSX children to void elements (img, hr, input).
   */
  acceptsChildren: boolean;
  role: RoleTestCase | undefined;
  variants: VariantTestCase[];
  channels: ChannelTestCase[];
  escapeDismissals: EscapeDismissalTestCase[];
  overlayClickDismissals: OverlayClickDismissalTestCase[];
  accessibility: AccessibilityTestCase;
}

/** True when clicking the component root should exercise a change/click handler. */
export function canClickToToggle(ir: ComponentIR): boolean {
  const elem = ir.root.element;
  const role = ir.root.explicitRole ?? ir.root.implicitRole;
  return (
    CLICKABLE_ROOT_ELEMENTS.has(elem) ||
    (role !== undefined && CLICKABLE_ROOT_ROLES.has(role))
  );
}

/**
 * DOM-PROPERTY-REFLECTION-IR-CHECKBOX-INDETERMINATE-01: find every node
 * carrying a `propertyBindings.indeterminate` entry paired with an
 * `aria-checked` attribute binding whose conditional includes the literal
 * "mixed" — the specific fact pattern this spec's A5/A7 acceptance proves
 * for each framework, not a name check on the component. Shared across
 * framework test generators (not React-specific) because the fact it
 * detects is an IR shape, not a React concern.
 */
export interface IndeterminateAriaCheckedNode {
  propertyKey: string;
  /**
   * The anatomy part carrying the fact, when it is NOT the root node.
   *
   * The finder has always recursed into children, but every framework's test
   * generator assumed the fact sat on the root and reached for it with
   * `getByTestId(testId)` — the test id only ever lands on the root. That held
   * while Checkbox's whole realization WAS the bare `<input>`; the moment its
   * composite topology was restored (`<label>` > `<input>` + indicator) the
   * generated proof read `.indeterminate` off a `<label>` and got `undefined`.
   * Carrying the part lets each generator address the element that actually
   * holds the property instead of guessing it is the host.
   */
  part: string | undefined;
}

export function findIndeterminateAriaCheckedFact(
  node: DomNodeIR | null | undefined,
  isRoot = true,
): IndeterminateAriaCheckedNode | undefined {
  if (!node) return undefined;
  const hasIndeterminateProperty = Object.keys(node.propertyBindings).some(
    (key) => key === "indeterminate",
  );
  const ariaChecked = node.bindings["aria-checked"];
  const hasMixedConditional =
    ariaChecked !== undefined &&
    ariaChecked.kind === "conditional" &&
    isMixedLiteral(ariaChecked.whenTrue, ariaChecked.whenFalse);
  if (hasIndeterminateProperty && hasMixedConditional) {
    return { propertyKey: "indeterminate", part: isRoot ? undefined : node.part };
  }
  for (const child of node.children) {
    const found = findIndeterminateAriaCheckedFact(child, false);
    if (found) return found;
  }
  return undefined;
}

function isMixedLiteral(a: BindingExpression, b: BindingExpression): boolean {
  return (
    (a.kind === "literal" && a.value === "mixed") ||
    (b.kind === "literal" && b.value === "mixed")
  );
}

/**
 * True when the component's root element can receive a synthetic `change`
 * event with `target.value` set (i.e. testing-library's
 * `fireEvent.change(el, { target: { value: "..." } })` works on it).
 *
 * Only native form-value elements have a `value` setter. Firing `change`
 * on a `<div>` or `<span>` throws "The given element does not have a
 * value setter" — happened in practice for Shuttle whose root is a
 * `<div role="listbox">` container. This gate lets the test plan fall
 * back to render-only for non-form roots.
 */
function rootTagSupportsChangeEvent(ir: ComponentIR): boolean {
  return CHANGE_EVENT_ROOT_ELEMENTS.has(ir.root.element);
}

const CHANGE_EVENT_ROOT_ELEMENTS = new Set([
  "input",
  "textarea",
  "select",
]);

export function buildComponentTestPlan(ir: ComponentIR): ComponentTestPlan {
  const channels = ir.behavior.normalizedChannels.map((channel) =>
    buildChannelTestCase(ir, channel),
  );
  const dismissalTriggers = ir.behavior.normalizedDismissalTriggers;
  const escapeDismissals = buildEscapeDismissalTestCases(ir, dismissalTriggers);
  const overlayClickDismissals = buildOverlayClickDismissalTestCases(ir, dismissalTriggers);
  const hasBehaviorTests = channels.length > 0 || dismissalTriggers.length > 0;
  const role = buildRoleTestCase(ir);
  const accessibility = buildAccessibilityTestCase(ir);
  const requiredProps = buildRequiredPropPlaceholders(ir);

  const acceptsChildren = ir.dom ? hasChildrenPlaceholder(ir) : true;

  return {
    name: ir.name,
    cssPrefix: ir.cssPrefix,
    testId: toKebab(ir.name),
    compoundImports: disclosureSubcomponentNames(ir) ??
      ir.compoundParts.map((part) => `${ir.name}${capitalize(part.name)}`),
    renderOpenProp: findRenderOpenProp(ir),
    hasBehaviorTests,
    acceptsChildren,
    needsAct: dismissalTriggers.length > 0,
    needsFireEvent:
      channels.some((testCase) => testCase.interaction === "change") ||
      overlayClickDismissals.length > 0,
    needsUserEvent:
      hasBehaviorTests &&
      channels.some((testCase) => testCase.interaction === "click"),
    role,
    variants: ((taintedAxes) =>
      Object.entries(ir.variants).flatMap(([dimension, values]) =>
        values.map((value) => ({
          dimension,
          value,
          // Colliding axes emit a namespaced class so the generated smoke test
          // asserts the same unambiguous token the component template renders.
          className: taintedAxes.has(dimension)
            ? `${ir.cssPrefix}--${dimension}-${value}`
            : `${ir.cssPrefix}--${value}`,
        })),
      ))(computeTaintedAxes(ir.variants)),
    channels,
    escapeDismissals,
    overlayClickDismissals,
    accessibility,
    requiredProps,
  };
}

/**
 * For every required non-channel non-renderOpen prop, synthesize a
 * type-correct placeholder so generated test render calls satisfy
 * the component's TypeScript contract.
 *
 * Excluded categories:
 *   - Channel-controlled props (valueProp / defaultValueProp /
 *     changeHandlerProp) are emitted by the channel-specific test
 *     paths.
 *   - The renderOpenProp ("open" / "isOpen") is emitted separately
 *     by the open-renderProps mechanism in the React test emitter.
 *   - Props with a `defaultExpr` (have a default value) are not
 *     required at the call site even if `required: true` —
 *     defaults make the prop optional at the JSX boundary.
 *
 * Placeholder resolution:
 *   string                  → ""
 *   number                  → 0
 *   boolean                 → false
 *   T[]                     → []
 *   <Type> kind=union       → first union value as string literal
 *   <Type> any other alias  → {} as <Type>   (named object types)
 *   unknown                 → null as never   (forces author to fix)
 */
function buildRequiredPropPlaceholders(
  ir: ComponentIR,
): RequiredPropPlaceholder[] {
  const channelProps = new Set<string>();
  for (const channel of ir.behavior.normalizedChannels) {
    channelProps.add(channel.valueProp);
    channelProps.add(channel.changeHandlerProp);
    if (channel.defaultValueProp) channelProps.add(channel.defaultValueProp);
  }
  const renderOpenProp = findRenderOpenProp(ir);
  if (renderOpenProp) channelProps.add(renderOpenProp);

  const out: RequiredPropPlaceholder[] = [];
  for (const prop of ir.styledProps) {
    if (!prop.required) continue;
    if (prop.defaultExpr !== undefined) continue;
    if (channelProps.has(prop.name)) continue;
    out.push({
      name: prop.name,
      expression: placeholderForPropType(prop, ir.definedTypes),
    });
  }
  return out;
}

function placeholderForPropType(
  prop: ResolvedPropIR,
  definedTypes: Record<string, ContractTypeDef>,
): string {
  const type = prop.type.trim();
  // Use a non-empty string so axe a11y tests don't trip
  // `presentation-role-conflict` when the prop is something like
  // `alt` — an empty alt makes the image presentational, which
  // conflicts if any other ARIA role is present. The actual value
  // doesn't matter for typecheck or behavioral assertions; it just
  // has to be a non-empty string.
  if (type === "string") return '"placeholder"';
  if (type === "number") return "0";
  if (type === "boolean") return "false";
  // Array suffix on a type alias or primitive: `Foo[]` or `string[]`.
  if (/\[\s*\]\s*$/.test(type)) return "[]";
  // Try a declared union type (e.g. StatusIntent → "info"). Use the
  // first declared value; the test only needs assignability.
  for (const ref of prop.typeRefs) {
    const def = definedTypes[ref];
    if (def && def.kind === "union" && def.values && def.values.length > 0) {
      return `"${def.values[0]}"`;
    }
  }
  // Named alias with non-union shape (e.g. PostcardAuthor): cast an
  // empty object. This is sufficient for assignability in render-only
  // tests that don't read the value.
  if (prop.typeRefs.length > 0) {
    return `{} as ${prop.typeRefs[0]}`;
  }
  // Last resort: force the call site to fail loudly rather than
  // silently swap in a wrong primitive.
  return "null as never";
}

function findRenderOpenProp(ir: ComponentIR): string | undefined {
  const openProp = ir.styledProps.find(
    (prop) => prop.name === "open" || prop.name === "isOpen",
  );
  return openProp?.name;
}

function buildRoleTestCase(ir: ComponentIR): RoleTestCase | undefined {
  const role = ir.root.explicitRole;
  if (
    !role ||
    role === "none" ||
    role === "compound" ||
    role === ir.root.implicitRole ||
    Boolean(ir.dom?.bindings.role) ||
    INNER_ELEMENT_ROLES.has(role)
  ) {
    return undefined;
  }

  return { role };
}

function buildChannelTestCase(
  ir: ComponentIR,
  channel: NormalizedChannelIR,
): ChannelTestCase {
  const handlerLocation = findChannelHandlerLocation(ir, channel);

  let interaction: ChannelInteractionKind;
  // When the channel's onChange isn't bound on the root dom node, the
  // auto-test (which fires events on the testid-bearing root) cannot
  // reach the handler. Fall back to render-only so the test verifies
  // prop acceptance instead of trying to simulate a deep interaction.
  //
  // - "root":  handler is on root → fire a change/click on root.
  // - "deep":  handler is on a descendant → render-only.
  // - "none":  handler isn't wired at all in the dom tree (compound
  //            components feed it via props elsewhere) → render-only.
  if (handlerLocation !== "root") {
    interaction = "render-only";
  } else if (channel.valueType === "boolean" && canClickToToggle(ir)) {
    interaction = "click";
  } else if (channel.valueType === "boolean") {
    interaction = "render-only";
  } else if (rootTagSupportsChangeEvent(ir)) {
    interaction = "change";
  } else {
    // Handler IS on root but the root is a non-input element (e.g.
    // Shuttle's listbox <div>). fireEvent.change on a div throws
    // "The given element does not have a value setter" — fall back to
    // render-only so the test exercises prop acceptance instead.
    interaction = "render-only";
  }

  return {
    channel,
    spyName: `${channel.changeHandlerProp}Spy`,
    interaction,
  };
}

type HandlerLocation = "root" | "deep" | "none";

/**
 * Find where the channel's onChange handler is wired in the dom tree:
 *   - "root" — bound on the root node (auto-test can fire events on it)
 *   - "deep" — bound on a descendant (auto-test can't reach generically)
 *   - "none" — not bound anywhere in the dom (fed via props/slots)
 * Contracts without a dom-tree fall back to "root" since the emitter
 * wires the handler on the single rendered element.
 */
function findChannelHandlerLocation(
  ir: ComponentIR,
  channel: NormalizedChannelIR,
): HandlerLocation {
  if (!ir.dom) return "root";
  // Channel-onChange handlers may live in `node.events` (post-IR-DOM-
  // BINDING-CAPABILITY-01 canonical shape) or, historically, in
  // `node.bindings` under an event-shaped key. Walk both maps for each
  // node so the test planner finds the handler regardless of which
  // authoring path the contract used.
  const matchesChannelOnChange = (expr: BindingExpression): boolean =>
    expr.kind === "channel" &&
    expr.channel === channel.name &&
    expr.field === "onChange";

  for (const expr of Object.values(ir.dom.bindings)) {
    if (matchesChannelOnChange(expr)) return "root";
  }
  for (const expr of Object.values(ir.dom.events)) {
    if (matchesChannelOnChange(expr)) return "root";
  }
  // Walk descendants
  const stack = [...(ir.dom.children ?? [])];
  while (stack.length > 0) {
    const node = stack.pop()!;
    for (const expr of Object.values(node.bindings)) {
      if (matchesChannelOnChange(expr)) return "deep";
    }
    for (const expr of Object.values(node.events)) {
      if (matchesChannelOnChange(expr)) return "deep";
    }
    if (node.children) stack.push(...node.children);
  }
  return "none";
}

function buildEscapeDismissalTestCases(
  ir: ComponentIR,
  dismissalTriggers: NormalizedDismissalTriggerIR[],
): EscapeDismissalTestCase[] {
  const openChannel = ir.behavior.normalizedChannels.find(
    (channel) => channel.valueType === "boolean",
  );
  if (!openChannel) return [];

  return dismissalTriggers
    .filter((trigger) => trigger.event === "escape")
    .map((trigger) => ({
      trigger,
      channel: openChannel,
      spyName: `${openChannel.changeHandlerProp}Spy`,
      defaultProp: openChannel.defaultValueProp ?? openChannel.valueProp,
    }));
}

function buildOverlayClickDismissalTestCases(
  ir: ComponentIR,
  dismissalTriggers: NormalizedDismissalTriggerIR[],
): OverlayClickDismissalTestCase[] {
  const openChannel = ir.behavior.normalizedChannels.find(
    (channel) => channel.valueType === "boolean",
  );
  if (!openChannel) return [];

  return dismissalTriggers
    .filter((trigger) => trigger.event === "overlayClick")
    .map((trigger) => ({
      trigger,
      channel: openChannel,
      spyName: `${openChannel.changeHandlerProp}Spy`,
      defaultProp: openChannel.defaultValueProp ?? openChannel.valueProp,
    }));
}

function buildAccessibilityTestCase(ir: ComponentIR): AccessibilityTestCase {
  const role = ir.root.explicitRole;
  const needsLabel =
    ir.root.labeling.includes("aria-label") ||
    ir.root.labeling.includes("aria-labelledby");
  const axeNeedsLabel =
    needsLabel ||
    (role !== undefined && ROLES_NEEDING_LABEL.has(role)) ||
    (role !== undefined && INNER_ROLES_NEEDING_LABEL.has(role));
  const authoredLabelProp = findAuthoredRoleLabelProp(ir, role);
  const accessibilityProps = findRoleActivationProps(ir.dom, role);
  const idRefContent = findIdRefContentFixtures(ir.dom, ir.name);
  const defaultContent = findDefaultContentFixture(ir.dom);
  const content = [
    ...idRefContent.fixtures,
    ...(defaultContent ? [defaultContent] : []),
  ];

  return {
    // Prefer exercising a real aria-labelledby relationship over injecting a
    // parallel aria-label. A raw host attribute is only a fallback when the
    // contract exposes no naming-content path. This prevents TextField-like
    // composites from putting aria-label on a role-less outer wrapper while
    // leaving the actual input unnamed.
    labelInput: axeNeedsLabel && !idRefContent.suppliesAccessibleName
      ? {
          name: authoredLabelProp ?? "aria-label",
          value: `Test ${ir.name}`,
          kind: authoredLabelProp ? "prop" : "attribute",
        }
      : undefined,
    needsListParent: role === "listitem",
    props: accessibilityProps,
    content,
  };
}

function findRoleActivationProps(
  root: DomNodeIR | null | undefined,
  role: string | undefined,
): Array<{ name: string; value: boolean }> {
  if (!root || !role) return [];

  const visit = (node: DomNodeIR): Array<{ name: string; value: boolean }> => {
    const roleBinding = node.bindings.role;
    if (
      roleBinding?.kind === "conditional" &&
      roleBinding.condition.kind === "prop" &&
      (!roleBinding.condition.path || roleBinding.condition.path.length === 0)
    ) {
      const trueMatches =
        roleBinding.whenTrue.kind === "literal" &&
        roleBinding.whenTrue.value === role;
      const falseMatches =
        roleBinding.whenFalse.kind === "literal" &&
        roleBinding.whenFalse.value === role;
      if (trueMatches !== falseMatches) {
        return [{
          name: roleBinding.condition.prop,
          value: trueMatches,
        }];
      }
    }
    for (const child of node.children) {
      const found = visit(child);
      if (found.length > 0) return found;
    }
    return [];
  };

  return visit(root);
}

function findIdRefContentFixtures(
  root: DomNodeIR | null | undefined,
  componentName: string,
): { fixtures: AccessibilityContentFixture[]; suppliesAccessibleName: boolean } {
  if (!root) return { fixtures: [], suppliesAccessibleName: false };

  const nodes: DomNodeIR[] = [];
  const collect = (node: DomNodeIR): void => {
    nodes.push(node);
    node.children.forEach(collect);
  };
  collect(root);

  const fixtures = new Map<string, AccessibilityContentFixture>();
  let suppliesAccessibleName = false;
  for (const source of nodes) {
    for (const idRef of source.idRefAttrs) {
      if (idRef.attribute !== "aria-labelledby" && idRef.attribute !== "aria-describedby") {
        continue;
      }
      for (const ref of idRef.refs) {
        const target = nodes.find((node) => node.generatedIdSlug === ref.slug);
        if (!target) continue;
        for (const slotName of namedSlotsUnder(target)) {
          if (!fixtures.has(slotName)) {
            fixtures.set(slotName, {
              slotName,
              html: `<span>Test ${componentName} ${slotName}</span>`,
            });
          }
          if (idRef.attribute === "aria-labelledby") {
            suppliesAccessibleName = true;
          }
        }
      }
    }
  }
  return { fixtures: [...fixtures.values()], suppliesAccessibleName };
}

function namedSlotsUnder(node: DomNodeIR): string[] {
  const slots: string[] = [];
  const visit = (current: DomNodeIR): void => {
    if (current.tag === "slot" && current.slotName) slots.push(current.slotName);
    current.children.forEach(visit);
  };
  visit(node);
  return slots;
}

/**
 * Find the default child placement and preserve the nearest native list
 * container's content model. The generic fixture previously rendered the
 * string "content" directly inside ul/ol, which axe correctly rejected.
 */
function findDefaultContentFixture(
  root: DomNodeIR | null | undefined,
): AccessibilityContentFixture | undefined {
  if (!root) return undefined;
  type ContentModel =
    | "flow"
    | "list"
    | "table"
    | "table-section"
    | "table-row"
    | "description-list"
    | "select";
  const visit = (
    node: DomNodeIR,
    inheritedModel: ContentModel,
  ): string | undefined => {
    const model: ContentModel =
      node.tag === "ul" || node.tag === "ol"
        ? "list"
        : node.tag === "table"
          ? "table"
          : node.tag === "thead" || node.tag === "tbody" || node.tag === "tfoot"
            ? "table-section"
            : node.tag === "tr"
              ? "table-row"
              : node.tag === "dl"
                ? "description-list"
                : node.tag === "select"
                  ? "select"
                  : inheritedModel;
    if (node.tag === "children" || (node.tag === "slot" && !node.slotName)) {
      switch (model) {
        case "list":
          return "<li>content</li>";
        case "table":
          return "<tbody><tr><td>content</td></tr></tbody>";
        case "table-section":
          return "<tr><td>content</td></tr>";
        case "table-row":
          return "<td>content</td>";
        case "description-list":
          return "<div><dt>Term</dt><dd>content</dd></div>";
        case "select":
          return "<option>content</option>";
        default:
          return "<span>content</span>";
      }
    }
    for (const child of node.children) {
      const found = visit(child, model);
      if (found) return found;
    }
    return undefined;
  };
  const html = visit(root, "flow");
  if (!html) return undefined;
  return {
    slotName: undefined,
    html,
  };
}

/**
 * Resolve the prop that the authored role owner binds to `aria-label`.
 * This keeps the axe fixture on the same public API path a consumer uses
 * (`ariaLabel` for Dialog, `label` for Command) instead of fabricating a raw
 * host attribute that may land on an outer layout wrapper.
 */
function findAuthoredRoleLabelProp(
  ir: ComponentIR,
  role: string | undefined,
): string | undefined {
  if (!ir.dom) return undefined;

  const boundLabelProp = (node: DomNodeIR): string | undefined => {
    const binding = node.bindings["aria-label"];
    if (binding?.kind === "prop" && (!binding.path || binding.path.length === 0)) {
      return binding.prop;
    }
    return undefined;
  };

  const find = (
    node: DomNodeIR,
    predicate: (candidate: DomNodeIR, isRoot: boolean) => boolean,
    isRoot = false,
  ): string | undefined => {
    if (predicate(node, isRoot)) {
      const prop = boundLabelProp(node);
      if (prop) return prop;
    }
    for (const child of node.children) {
      const found = find(child, predicate, false);
      if (found) return found;
    }
    return undefined;
  };

  // Prefer the node that actually owns the contract role. The role can be
  // authored directly in anatomy.dom, synthesized on the DOM root, or implicit
  // in the root element (for example input -> textbox).
  if (role) {
    const roleOwnerProp = find(
      ir.dom,
      (node, isRoot) =>
        node.attrs.role === role ||
        (isRoot &&
          (ir.root.rootRole === role || ir.root.implicitRole === role)),
      true,
    );
    if (roleOwnerProp) return roleOwnerProp;
  }

  // Some native controls declare labeling requirements without spelling an
  // explicit a11y role. A prop-bound aria-label is still stronger evidence
  // than injecting an arbitrary host attribute, especially for Svelte and
  // shadow-DOM targets where host attributes do not fall through.
  return find(ir.dom, (node) => boundLabelProp(node) !== undefined, true);
}


function capitalize(value: string): string {
  return value[0].toUpperCase() + value.slice(1);
}

/**
 * Subcomponent import names a repeated-disclosure container (Accordion) emits:
 * the multiple-item wrapper, the interactive trigger, and the region — the
 * exact three sub-components `generateDisclosureStateSubcomponents` exports.
 * Returns `null` for non-disclosure components so the caller keeps the legacy
 * per-compound-part derivation. Contract-derived (parts, not name literals).
 */
function disclosureSubcomponentNames(ir: ComponentIR): string[] | null {
  if (!isDisclosureContainer(ir)) return null;
  const multiplePart = getMultipleItemPart(ir);
  const itemPart = getInteractiveItemPart(ir);
  const regionPart = getRegionPart(ir);
  if (!multiplePart || !itemPart || !regionPart) return null;
  return [
    `${ir.name}${capitalize(multiplePart.name)}`,
    `${ir.name}${capitalize(itemPart.name)}`,
    `${ir.name}${capitalize(regionPart.name)}`,
  ];
}
