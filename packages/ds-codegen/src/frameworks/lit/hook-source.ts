/**
 * Lit behavior class emitter — the framework-equivalent of
 * `frameworks/vue/hook-source.ts`. Produces a `${Name}Behavior.ts` file
 * that composes ReactiveControllers from `@full-stack-ds/lit/primitives`.
 *
 * Dispatches on the same `ir.behavior.normalized*` fields as React and
 * Vue, proving the IR is framework-neutral. The output shape uses Lit's
 * ReactiveController pattern: a plain class that wires controllers in its
 * constructor and exposes typed getters/setters.
 *
 * For compound-state-container components (Tabs-shaped), the behavior class
 * gains `registeredTabs: string[]`, `registerTab(value)`, and
 * `unregisterTab(value)` — the equivalent of React's useState-based
 * registeredTabs in useTabs.
 */
import type { ComponentIR, NormalizedChannelIR } from "../../ir.js";
import { renderSections, type Section } from "../../preserve.js";
import {
  isCompoundStateContainer,
  isDisclosureContainer,
} from "../react/hook-source.js";

interface PrimitiveBindings {
  useControllableState: NormalizedChannelIR[];
  useFocusTrap: boolean;
  useScrollLock: boolean;
  usePortal: boolean;
  useAnchorToggle: boolean;
  /** Standalone Escape dismissal for trap-focus components (Modal). */
  useDismissal: boolean;
  /** Prop name that gates Escape dismissal (e.g. closeOnEscape). */
  escapeEnabledByProp: string | undefined;
  /** True when the IR matches the compound-state-container (Tabs-shaped) pattern. */
  isCompoundStateContainer: boolean;
}

/**
 * Inspect the IR's normalized behavior metadata and decide which
 * ReactiveControllers are needed. Returns `null` when no behavior is
 * required (the emitter skips the file entirely in that case).
 */
function resolveBindings(ir: ComponentIR): PrimitiveBindings | null {
  const channels = ir.behavior.normalizedChannels;
  const focus = ir.behavior.focus;
  const triggers = ir.behavior.normalizedDismissalTriggers;

  const hasFocusTrap = focus?.strategy === "trap";
  const hasScrollLock = focus?.scrollLock === true;
  // FIX-PORTAL-CONSUMPTION-01: no generated Lit component reads the portal
  // target (no PortalController is mounted into a component render), so every
  // portalTarget the hook emitted was dead scaffolding. Suppressed for all
  // Lit components. React (the only framework with a consumer) gates on
  // portalsRootToBody; the cross-framework portal path is a successor feature.
  const hasPortal = false;
  const escapeTrigger = triggers.find((t) => t.event === "escape");
  const hasEscape = escapeTrigger !== undefined;
  const hasOutsideClick = triggers.some(
    (t) => t.event === "outsideClick" || t.event === "overlayClick",
  );
  // AnchorToggle needs a boolean "open" state to drive escape/outside-click
  // dismissal. Components like Walkthrough that have a non-boolean "step
  // index" channel can't bind AnchorToggle without a type mismatch — fall
  // through to standalone Dismissal in that case.
  const hasBooleanOpenChannel = channels.some(
    (c) => c.isDisclosureChannel,
  );
  const useAnchor =
    !hasFocusTrap && (hasEscape || hasOutsideClick) && hasBooleanOpenChannel;
  // Standalone dismissal for trap-focus components: outside-click is handled
  // template-side (overlay onClick), so only Escape needs a document listener.
  const useDismissal = !useAnchor && hasEscape;

  const compoundContainer =
    isCompoundStateContainer(ir) && !isDisclosureContainer(ir);

  if (
    channels.length === 0 &&
    !hasFocusTrap &&
    !hasScrollLock &&
    !hasPortal &&
    !useAnchor &&
    !useDismissal &&
    !compoundContainer
  ) {
    return null;
  }

  return {
    useControllableState: channels,
    useFocusTrap: hasFocusTrap,
    useScrollLock: hasScrollLock,
    usePortal: hasPortal,
    useAnchorToggle: useAnchor,
    useDismissal,
    escapeEnabledByProp: escapeTrigger?.enabledByProp,
    isCompoundStateContainer: compoundContainer,
  };
}

function generateImports(bindings: PrimitiveBindings): string {
  const primitives: string[] = [];
  if (bindings.useControllableState.length > 0)
    primitives.push("ControllableStateController");
  if (bindings.useFocusTrap) primitives.push("FocusTrapController");
  if (bindings.useScrollLock) primitives.push("ScrollLockController");
  if (bindings.usePortal) primitives.push("PortalController");
  if (bindings.useAnchorToggle) primitives.push("AnchorToggleController");
  if (bindings.useDismissal) primitives.push("DismissalController");

  const lines: string[] = [
    `import type { ReactiveControllerHost } from 'lit';`,
  ];
  if (primitives.length > 0) {
    lines.push(
      `import { ${primitives.sort().join(", ")} } from '../../primitives/index.js';`,
    );
  }
  return lines.join("\n");
}

function generateInlineTypes(
  ir: ComponentIR,
  bindings: PrimitiveBindings,
): string {
  const referenced = new Set<string>();
  for (const ch of bindings.useControllableState) {
    if (ch.valueType && ir.definedTypes[ch.valueType]) {
      referenced.add(ch.valueType);
    }
  }
  if (referenced.size === 0) return "";
  const lines: string[] = [];
  for (const name of [...referenced].sort()) {
    const def = ir.definedTypes[name];
    if (def.kind === "union" && def.values) {
      lines.push(
        `export type ${name} = ${def.values.map((v) => `"${v}"`).join(" | ")};`,
      );
    } else if (def.kind === "alias" && def.alias) {
      lines.push(`export type ${name} = ${def.alias};`);
    }
  }
  return lines.join("\n");
}

function generateOptionsInterface(
  ir: ComponentIR,
  bindings: PrimitiveBindings,
): string {
  const lines: string[] = [`export interface ${ir.name}BehaviorOptions {`];

  for (const ch of bindings.useControllableState) {
    const t = ch.valueType ?? "unknown";
    // Lit: controlled values are getter-shaped so the LitElement's reactive
    // property changes propagate. Consumer pattern (in element constructor):
    // new XBehavior(this, { checked: () => this.checked, ... }).
    lines.push(`  ${ch.valueProp}?: () => ${t} | undefined;`);
    if (ch.defaultValueProp) lines.push(`  ${ch.defaultValueProp}?: ${t};`);
    lines.push(`  ${ch.changeHandlerProp}?: (value: ${t}) => void;`);
  }

  for (const t of ir.behavior.normalizedDismissalTriggers) {
    if (!t.enabledByProp) continue;
    lines.push(`  ${t.enabledByProp}?: boolean;`);
  }

  if (bindings.usePortal) {
    const targetProp = ir.behavior.portal?.targetProp;
    if (targetProp) lines.push(`  ${targetProp}?: Element | string;`);
  }

  if (bindings.useFocusTrap) {
    lines.push(`  containerEl?: HTMLElement;`);
  }

  lines.push(`}`);
  return lines.join("\n");
}

function generateClassBody(ir: ComponentIR, bindings: PrimitiveBindings): string {
  const className = `${ir.name}Behavior`;
  const lines: string[] = [];

  lines.push(`export class ${className} {`);

  // When compound-state-container, we need to store the host ref so the
  // register/unregisterTab methods can call host.requestUpdate().
  if (bindings.isCompoundStateContainer) {
    lines.push(`  private _host: ReactiveControllerHost;`);
  }

  // Field declarations.
  //
  // `openChannel` is the controllable-state binding that the AnchorToggle
  // owns (when present). It must be the boolean / "open" channel, not the
  // first declared channel: components like Select declare a selection
  // channel (`value`) before the open channel, and wiring AnchorToggle to
  // the selection channel mis-types it and breaks Escape-dismissal at
  // runtime. Match by `valueType === "boolean"` or `name === "open"`,
  // mirroring the heuristic used below for focus-trap / scroll-lock.
  const openChannel =
    bindings.useControllableState.find(
      (c) => c.isDisclosureChannel,
    ) ?? bindings.useControllableState[0];
  const anchorOwnsChannel =
    bindings.useAnchorToggle &&
    !!openChannel &&
    openChannel.valueType === "boolean";

  for (const ch of bindings.useControllableState) {
    if (anchorOwnsChannel && ch === openChannel) continue;
    const t = ch.valueType ?? "unknown";
    lines.push(`  readonly ${ch.name}State: ControllableStateController<${t}>;`);
  }
  if (bindings.useAnchorToggle) {
    lines.push(`  readonly anchorToggle: AnchorToggleController;`);
  }
  if (bindings.useFocusTrap) {
    lines.push(`  readonly focusTrap: FocusTrapController;`);
  }
  if (bindings.useScrollLock) {
    lines.push(`  readonly scrollLock: ScrollLockController;`);
  }
  if (bindings.usePortal) {
    lines.push(`  readonly portal: PortalController;`);
  }
  if (bindings.useDismissal) {
    lines.push(`  readonly dismissal: DismissalController;`);
  }

  // Constructor
  lines.push(``);
  lines.push(
    `  constructor(host: ReactiveControllerHost, private opts: ${className}Options = {}) {`,
  );
  if (bindings.isCompoundStateContainer) {
    lines.push(`    this._host = host;`);
  }

  for (const ch of bindings.useControllableState) {
    if (anchorOwnsChannel && ch === openChannel) continue;
    const t = ch.valueType ?? "unknown";
    const def = defaultExprFor(ch.defaultValueProp, t);
    const defaultExpr = ch.defaultValueProp
      ? `opts.${ch.defaultValueProp} ?? ${def}`
      : def;
    lines.push(`    this.${ch.name}State = new ControllableStateController<${t}>(host, {`);
    // opts.<valueProp> is itself a getter; pass it directly.
    lines.push(`      controlled: opts.${ch.valueProp},`);
    lines.push(`      defaultValue: ${defaultExpr},`);
    lines.push(`      onChange: opts.${ch.changeHandlerProp},`);
    lines.push(`    });`);
  }

  if (bindings.useAnchorToggle && openChannel) {
    lines.push(`    this.anchorToggle = new AnchorToggleController(`);
    lines.push(`      host as ReactiveControllerHost & EventTarget,`);
    lines.push(`      {`);
    lines.push(`        open: opts.${openChannel.valueProp},`);
    // Only emit defaultOpen if the contract declares one for this channel.
    // Components like Toast omit `defaultValue` since they have an external
    // controller (ToastProvider) managing state.
    if (openChannel.defaultValueProp) {
      lines.push(`        defaultOpen: opts.${openChannel.defaultValueProp} ?? false,`);
    } else {
      lines.push(`        defaultOpen: false,`);
    }
    lines.push(`        onOpenChange: opts.${openChannel.changeHandlerProp},`);
    lines.push(`      },`);
    lines.push(`    );`);
  }

  if (bindings.useFocusTrap) {
    const boolChannel = bindings.useControllableState.find(
      (c) => c.isDisclosureChannel,
    );
    const activeExpr = boolChannel
      ? `this.${boolChannel.name}State.value`
      : "true";
    lines.push(`    this.focusTrap = new FocusTrapController(host, {`);
    lines.push(`      getActive: () => ${activeExpr},`);
    lines.push(`      getContainer: () => opts.containerEl ?? null,`);
    lines.push(`    });`);
  }

  if (bindings.useScrollLock) {
    const boolChannel = bindings.useControllableState.find(
      (c) => c.isDisclosureChannel,
    );
    const activeExpr = boolChannel
      ? `this.${boolChannel.name}State.value`
      : "true";
    lines.push(`    this.scrollLock = new ScrollLockController(host, {`);
    lines.push(`      getActive: () => ${activeExpr},`);
    lines.push(`    });`);
  }

  if (bindings.usePortal) {
    const targetProp = ir.behavior.portal?.targetProp;
    const target = targetProp
      ? `() => opts.${targetProp}`
      : "() => undefined";
    lines.push(`    this.portal = new PortalController(host, {`);
    lines.push(`      enabled: true,`);
    lines.push(`      getTarget: ${target},`);
    lines.push(`    });`);
  }

  if (bindings.useDismissal) {
    const boolChannel = bindings.useControllableState.find(
      (c) => c.isDisclosureChannel,
    );
    const openExpr = boolChannel
      ? `this.${boolChannel.name}State.value`
      : "true";
    const setterCall = boolChannel
      ? `this.${boolChannel.name}State.set(false)`
      : `void 0`;
    const closeOnEscapeExpr = bindings.escapeEnabledByProp
      ? `() => opts.${bindings.escapeEnabledByProp}`
      : `() => true`;
    lines.push(`    this.dismissal = new DismissalController(host, {`);
    lines.push(`      open: () => ${openExpr},`);
    lines.push(`      closeOnEscape: ${closeOnEscapeExpr},`);
    lines.push(`      onDismiss: () => { ${setterCall}; },`);
    lines.push(`    });`);
  }

  lines.push(`  }`);

  // Convenience getters/setters.
  //
  // Anchor-toggle channels delegate to `this.anchorToggle.open` / `setOpen`,
  // since the AnchorToggleController owns that state. All other controllable
  // state channels delegate to their per-channel `${name}State` controller.
  // Previously the two cases were mutually exclusive — the if-else branched
  // the entire emission, so components with both an anchor channel and an
  // additional controllable channel (Command's `search`, Select's `selection`)
  // got accessors only for the anchor channel. Restructure so the anchor
  // accessor emits alongside the per-channel accessors for everything else.
  const anchorEmitsOpen = bindings.useAnchorToggle && !!openChannel;
  if (anchorEmitsOpen && openChannel) {
    lines.push(``);
    lines.push(`  get ${openChannel.name}(): boolean { return this.anchorToggle.open; }`);
    lines.push(`  set${capitalize(openChannel.name)}(value: boolean) { this.anchorToggle.setOpen(value); }`);
  }
  for (const ch of bindings.useControllableState) {
    // Skip the open channel only when AnchorToggle has already emitted its
    // accessor pair above. When AnchorToggle isn't in use, the channel state
    // still lives in `${ch.name}State` and needs its own accessors.
    if (anchorEmitsOpen && ch === openChannel) continue;
    const t = ch.valueType ?? "unknown";
    lines.push(``);
    lines.push(`  get ${ch.name}(): ${t} { return this.${ch.name}State.value; }`);
    lines.push(`  set${capitalize(ch.name)}(value: ${t}) { this.${ch.name}State.set(value); }`);
  }

  // Compound-state-container (Tabs-shaped): add registeredTabs list and
  // register/unregister methods. Lit controllers don't have @state, so we
  // store it as a plain field and call host.requestUpdate() after mutations.
  if (bindings.isCompoundStateContainer) {
    lines.push(``);
    lines.push(`  /** DOM-order list of registered tab values. */`);
    lines.push(`  registeredTabs: string[] = [];`);
    lines.push(``);
    lines.push(`  registerTab(value: string): void {`);
    lines.push(`    if (this.registeredTabs.includes(value)) return;`);
    lines.push(`    this.registeredTabs = [...this.registeredTabs, value];`);
    lines.push(`    this._host.requestUpdate();`);
    lines.push(`  }`);
    lines.push(``);
    lines.push(`  unregisterTab(value: string): void {`);
    lines.push(`    const next = this.registeredTabs.filter((v) => v !== value);`);
    lines.push(`    if (next.length === this.registeredTabs.length) return;`);
    lines.push(`    this.registeredTabs = next;`);
    lines.push(`    this._host.requestUpdate();`);
    lines.push(`  }`);
  }

  lines.push(`}`);
  return lines.join("\n");
}

function defaultExprFor(_defaultProp: string | undefined, valueType: string): string {
  if (valueType === "boolean") return "false";
  if (valueType === "number") return "0";
  if (valueType === "string") return '""';
  return "undefined as never";
}

function capitalize(s: string): string {
  return s[0].toUpperCase() + s.slice(1);
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Emit a Lit `${Name}Behavior` class for a `ComponentIR`. Returns `null`
 * when the contract has no behavior that needs a controller.
 */
export function generateLitHookSource(ir: ComponentIR): string | null {
  const bindings = resolveBindings(ir);
  if (!bindings) return null;

  const importsBody = generateImports(bindings);
  const inlineTypesBody = generateInlineTypes(ir, bindings);
  const optionsBody = generateOptionsInterface(ir, bindings);
  const classBody = generateClassBody(ir, bindings);

  const typesBody = [inlineTypesBody, optionsBody]
    .filter((s) => s.length > 0)
    .join("\n\n");

  const blank = (): Section => ({ kind: "between", body: "" });
  const sections: Section[] = [
    { kind: "generated", id: "imports", body: importsBody },
    blank(),
    { kind: "custom", id: "imports", body: "" },
    blank(),
    { kind: "generated", id: "types", body: typesBody },
    blank(),
    { kind: "custom", id: "types", body: "" },
    blank(),
    { kind: "generated", id: "hook", body: classBody },
    blank(),
    { kind: "custom", id: "trailing", body: "" },
    blank(),
  ];

  return renderSections(sections, "line");
}
