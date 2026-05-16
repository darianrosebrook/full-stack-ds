import { toKebab } from "./contract.js";
import type {
  ComponentIR,
  NormalizedChannelIR,
  NormalizedDismissalTriggerIR,
} from "./ir.js";
import { hasChildrenPlaceholder } from "./ir.js";

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
    variants: Object.entries(ir.variants).flatMap(([dimension, values]) =>
      values.map((value) => ({
        dimension,
        value,
        className: `${ir.cssPrefix}--${value}`,
      })),
    ),
    channels,
    escapeDismissals,
    overlayClickDismissals,
    accessibility,
  };
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
  } else {
    interaction = "change";
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
  // Root bindings first
  for (const expr of Object.values(ir.dom.bindings)) {
    if (
      expr.kind === "channel" &&
      expr.channel === channel.name &&
      expr.field === "onChange"
    ) {
      return "root";
    }
  }
  // Walk descendants
  const stack = [...(ir.dom.children ?? [])];
  while (stack.length > 0) {
    const node = stack.pop()!;
    for (const expr of Object.values(node.bindings)) {
      if (
        expr.kind === "channel" &&
        expr.channel === channel.name &&
        expr.field === "onChange"
      ) {
        return "deep";
      }
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
