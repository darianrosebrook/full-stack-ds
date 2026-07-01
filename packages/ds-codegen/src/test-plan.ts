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

export interface AccessibilityTestCase {
  axeProps: string;
  needsListParent: boolean;
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
}

export function findIndeterminateAriaCheckedFact(
  node: DomNodeIR | null | undefined,
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
    return { propertyKey: "indeterminate" };
  }
  for (const child of node.children) {
    const found = findIndeterminateAriaCheckedFact(child);
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
    compoundImports: ir.compoundParts.map(
      (part) => `${ir.name}${capitalize(part.name)}`,
    ),
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

  return {
    axeProps: axeNeedsLabel ? ` aria-label="Test ${ir.name}"` : "",
    needsListParent: role === "listitem",
  };
}


function capitalize(value: string): string {
  return value[0].toUpperCase() + value.slice(1);
}
