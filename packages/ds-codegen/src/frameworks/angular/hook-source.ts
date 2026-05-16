/**
 * Angular behavior hook emitter — the framework-equivalent of
 * `frameworks/vue/hook-source.ts`. Produces a `useX.ts` file that
 * composes Angular-side primitives shipped from `@full-stack-ds/angular`.
 *
 * Dispatches on the same `ir.behavior.normalized*` fields as React and Vue,
 * proving the IR is framework-neutral. Output shape uses Angular 17+ signals:
 * `Signal<T>` for reactive state, plain ref-like objects for DOM handles.
 *
 * Angular's lifecycle is handled via `DestroyRef`, which the consuming
 * component passes in (injected with `inject(DestroyRef)` in the constructor
 * or field initializer). The generated function always accepts a `destroyRef`
 * on its options so primitives can self-clean.
 */
import type { ComponentIR, NormalizedChannelIR } from "../../ir.js";
import { renderSections, type Section } from "../../preserve.js";

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
}

// ---------------------------------------------------------------------------
// Binding resolution (identical logic to Vue hook-source.ts)
// ---------------------------------------------------------------------------

function resolveBindings(ir: ComponentIR): PrimitiveBindings | null {
  const channels = ir.behavior.normalizedChannels;
  const focus = ir.behavior.focus;
  const portal = ir.behavior.portal;
  const triggers = ir.behavior.normalizedDismissalTriggers;

  const hasFocusTrap = focus?.strategy === "trap";
  const hasScrollLock = focus?.scrollLock === true;
  const hasPortal = portal?.enabled === true;
  const escapeTrigger = triggers.find((t) => t.event === "escape");
  const hasEscape = escapeTrigger !== undefined;
  const hasOutsideClick = triggers.some(
    (t) => t.event === "outsideClick" || t.event === "overlayClick",
  );
  // AnchorToggle needs a boolean "open" state. Components without a boolean
  // channel (e.g. Walkthrough's `step: number`) get standalone Dismissal
  // instead — avoids handing AnchorToggle a number-typed value where it
  // expects a boolean.
  const hasBooleanOpenChannel = channels.some(
    (c) => c.valueType === "boolean" || c.name === "open",
  );
  const useAnchor =
    !hasFocusTrap && (hasEscape || hasOutsideClick) && hasBooleanOpenChannel;
  // Standalone dismissal for trap-focus components: outside-click is handled
  // template-side (overlay onClick), so only Escape needs a document listener.
  const useDismissal = !useAnchor && hasEscape;

  if (
    channels.length === 0 &&
    !hasFocusTrap &&
    !hasScrollLock &&
    !hasPortal &&
    !useAnchor &&
    !useDismissal
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
  };
}

// ---------------------------------------------------------------------------
// Imports
// ---------------------------------------------------------------------------

function generateImports(bindings: PrimitiveBindings): string {
  const coreNamed = new Set<string>();
  coreNamed.add("DestroyRef");

  if (bindings.useControllableState.length > 0) {
    coreNamed.add("type Signal");
  }
  if (bindings.useFocusTrap || bindings.useScrollLock || bindings.useAnchorToggle) {
    coreNamed.add("type Signal");
  }

  const primitives: string[] = [];
  if (bindings.useControllableState.length > 0) {
    primitives.push("createControllableState");
  }
  if (bindings.useFocusTrap) primitives.push("createFocusTrap");
  if (bindings.useScrollLock) primitives.push("createScrollLock");
  if (bindings.usePortal) primitives.push("createPortal");
  if (bindings.useAnchorToggle) primitives.push("createAnchorToggle");
  if (bindings.useDismissal) primitives.push("createDismissal");

  const lines: string[] = [];
  lines.push(
    `import { ${[...coreNamed].sort().join(", ")} } from "@angular/core";`,
  );
  if (primitives.length > 0) {
    lines.push(
      `import { ${primitives.sort().join(", ")} } from "../../primitives/index.js";`,
    );
  }
  return lines.join("\n");
}

// ---------------------------------------------------------------------------
// Inline types
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Options / Result interfaces
// ---------------------------------------------------------------------------

function generateOptionsInterface(
  ir: ComponentIR,
  bindings: PrimitiveBindings,
): string {
  const lines: string[] = [`export interface Use${ir.name}Options {`];

  for (const ch of bindings.useControllableState) {
    const t = ch.valueType ?? "unknown";
    // Angular: controlled values are getter-shaped so signal/computed
    // reactivity flows through @Input updates. Consumer pattern:
    // useX({ checked: () => this.checked, ... }).
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

  // DestroyRef is always required — the consuming component injects it
  lines.push(`  destroyRef: DestroyRef;`);

  lines.push(`}`);
  return lines.join("\n");
}

function generateResultInterface(
  ir: ComponentIR,
  bindings: PrimitiveBindings,
): string {
  const lines: string[] = [`export interface Use${ir.name}Result {`];

  for (const ch of bindings.useControllableState) {
    const t = ch.valueType ?? "unknown";
    const setter = `set${capitalize(ch.name)}`;
    lines.push(`  ${ch.name}: Signal<${t}>;`);
    lines.push(`  ${setter}: (next: ${t}) => void;`);
  }

  if (
    bindings.useFocusTrap ||
    bindings.usePortal ||
    bindings.useAnchorToggle ||
    bindings.useDismissal
  ) {
    lines.push(`  panelRef: { nativeElement: HTMLElement | null };`);
  }
  if (bindings.useAnchorToggle) {
    lines.push(`  anchorRef: { nativeElement: HTMLElement | null };`);
  }
  if (bindings.usePortal) {
    lines.push(`  portalTarget: Signal<Element | null>;`);
  }

  lines.push(`}`);
  return lines.join("\n");
}

// ---------------------------------------------------------------------------
// Function body
// ---------------------------------------------------------------------------

function generateBody(ir: ComponentIR, bindings: PrimitiveBindings): string {
  const lines: string[] = [];
  // Options default: cast to any so the destroyRef is "required" only at runtime
  lines.push(
    `export function use${ir.name}(options: Use${ir.name}Options): Use${ir.name}Result {`,
  );

  // `openChannel` must be the boolean/"open" controllable-state binding
  // when AnchorToggle is present — components like Select declare a
  // selection channel first, and wiring AnchorToggle to that mis-types it.
  const openChannel =
    bindings.useControllableState.find(
      (c) => c.valueType === "boolean" || c.name === "open",
    ) ?? bindings.useControllableState[0];
  const anchorOwnsChannel =
    bindings.useAnchorToggle &&
    !!openChannel &&
    openChannel.valueType === "boolean";

  for (const ch of bindings.useControllableState) {
    if (anchorOwnsChannel && ch === openChannel) continue;
    const setter = `set${capitalize(ch.name)}`;
    const t = ch.valueType ?? "unknown";
    const def = defaultExprFor(ch.defaultValueProp, t);
    const defaultExpr = ch.defaultValueProp
      ? `options.${ch.defaultValueProp} ?? ${def}`
      : def;
    lines.push(
      `  const { value: ${ch.name}, set: ${setter} } = createControllableState<${t}>({`,
    );
    // options.<valueProp> is itself a getter; pass it directly.
    lines.push(`    controlled: options.${ch.valueProp},`);
    lines.push(`    defaultValue: ${defaultExpr},`);
    lines.push(`    onChange: options.${ch.changeHandlerProp},`);
    lines.push(`  });`);
    lines.push(``);
  }

  if (bindings.useFocusTrap || bindings.usePortal || bindings.useDismissal) {
    lines.push(`  const panelRef: { nativeElement: HTMLElement | null } = { nativeElement: null };`);
  }

  if (bindings.useAnchorToggle && openChannel) {
    // Only emit defaultOpen when the contract declares one for the open
    // channel — components like Toast omit it (external state controller).
    const defaultOpenLine = openChannel.defaultValueProp
      ? `    defaultOpen: options.${openChannel.defaultValueProp} ?? false,`
      : `    defaultOpen: false,`;
    lines.push(
      `  const anchorToggle = createAnchorToggle({`,
      `    open: options.${openChannel.valueProp},`,
      defaultOpenLine,
      `    onOpenChange: options.${openChannel.changeHandlerProp},`,
      `    destroyRef: options.destroyRef,`,
      `  });`,
      ``,
    );
  }

  if (bindings.useFocusTrap) {
    const channel = bindings.useControllableState.find(
      (c) => c.valueType === "boolean" || c.name === "open",
    );
    const activeRef = channel ? channel.name : `{ value: true } as unknown as Signal<boolean>`;
    lines.push(`  createFocusTrap(panelRef, { active: ${activeRef}, destroyRef: options.destroyRef });`);
    lines.push(``);
  }

  if (bindings.useScrollLock) {
    const channel = bindings.useControllableState.find(
      (c) => c.valueType === "boolean" || c.name === "open",
    );
    const activeSignal = channel?.name ?? "{ value: true } as unknown as Signal<boolean>";
    lines.push(`  createScrollLock(${activeSignal}, options.destroyRef);`);
    lines.push(``);
  }

  if (bindings.usePortal) {
    const targetProp = ir.behavior.portal?.targetProp;
    const target = targetProp ? `() => options.${targetProp}` : "() => undefined";
    lines.push(`  const { target: portalTarget } = createPortal({`);
    lines.push(`    enabled: true,`);
    lines.push(`    target: ${target},`);
    lines.push(`  });`);
    lines.push(``);
  }

  if (bindings.useDismissal) {
    const channel = bindings.useControllableState.find(
      (c) => c.valueType === "boolean" || c.name === "open",
    );
    const openGetter = channel ? `() => ${channel.name}()` : `() => true`;
    const setterCall = channel
      ? `set${capitalize(channel.name)}(false)`
      : `void 0`;
    const closeOnEscapeGetter = bindings.escapeEnabledByProp
      ? `() => options.${bindings.escapeEnabledByProp}`
      : `() => true`;
    lines.push(`  createDismissal({`);
    lines.push(`    open: ${openGetter},`);
    lines.push(`    closeOnEscape: ${closeOnEscapeGetter},`);
    lines.push(`    onDismiss: () => { ${setterCall}; },`);
    lines.push(`    destroyRef: options.destroyRef,`);
    lines.push(`  });`);
    lines.push(``);
  }

  // Build return object
  lines.push(`  return {`);
  for (const ch of bindings.useControllableState) {
    const setter = `set${capitalize(ch.name)}`;
    if (anchorOwnsChannel && ch === openChannel) {
      lines.push(`    ${ch.name}: anchorToggle.open,`);
      lines.push(`    ${setter}: anchorToggle.setOpen,`);
    } else {
      lines.push(`    ${ch.name},`);
      lines.push(`    ${setter},`);
    }
  }
  if (bindings.useAnchorToggle) {
    lines.push(`    anchorRef: anchorToggle.anchorRef,`);
    lines.push(`    panelRef: anchorToggle.panelRef,`);
  } else if (
    bindings.useFocusTrap ||
    bindings.usePortal ||
    bindings.useDismissal
  ) {
    lines.push(`    panelRef,`);
  }
  if (bindings.usePortal) {
    lines.push(`    portalTarget,`);
  }
  lines.push(`  };`);
  lines.push(`}`);
  return lines.join("\n");
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function defaultExprFor(
  _defaultProp: string | undefined,
  valueType: string,
): string {
  if (valueType === "boolean") return "false";
  if (valueType === "number") return "0";
  if (valueType === "string") return '""';
  return "undefined as never";
}

function capitalize(s: string): string {
  return s[0].toUpperCase() + s.slice(1);
}

// ---------------------------------------------------------------------------
// Public entry point
// ---------------------------------------------------------------------------

export function generateAngularHookSource(ir: ComponentIR): string | null {
  const bindings = resolveBindings(ir);
  if (!bindings) return null;

  const importsBody = generateImports(bindings);
  const inlineTypesBody = generateInlineTypes(ir, bindings);
  const optionsBody = generateOptionsInterface(ir, bindings);
  const resultBody = generateResultInterface(ir, bindings);
  const hookBody = generateBody(ir, bindings);

  const typesBody = [inlineTypesBody, optionsBody, resultBody]
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
    { kind: "generated", id: "hook", body: hookBody },
    blank(),
    { kind: "custom", id: "trailing", body: "" },
    blank(),
  ];

  return renderSections(sections, "line");
}
