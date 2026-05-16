/**
 * Svelte 5 behavior file emitter — the framework-equivalent of
 * `frameworks/vue/hook-source.ts`. Produces a `use<Name>.svelte.ts` file
 * that composes Svelte-side primitives from `@full-stack-ds/svelte`.
 *
 * The `.svelte.ts` extension tells the Svelte compiler that this non-component
 * file uses Svelte 5 runes ($state, $derived, $effect). Output uses plain
 * object getters for reactivity rather than Vue's `Ref<T>`.
 *
 * Dispatches on the same `ir.behavior.normalized*` fields as Vue/React,
 * proving the IR is framework-neutral.
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

/**
 * Identical dispatch logic to the Vue hook emitter — the IR is
 * framework-neutral so the same heuristics apply.
 */
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
  // AnchorToggle requires a boolean "open" channel. Components like
  // Walkthrough that have only a numeric step-index channel fall through
  // to standalone Dismissal.
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

function generateImports(bindings: PrimitiveBindings): string {
  const primitives: string[] = [];
  if (bindings.useControllableState.length > 0)
    primitives.push("createControllableState");
  if (bindings.useFocusTrap) primitives.push("createFocusTrap");
  if (bindings.useScrollLock) primitives.push("createScrollLock");
  if (bindings.usePortal) primitives.push("createPortal");
  if (bindings.useAnchorToggle) primitives.push("createAnchorToggle");
  if (bindings.useDismissal) primitives.push("createDismissal");

  if (primitives.length === 0) return "";
  return `import { ${primitives.sort().join(", ")} } from "../../primitives/index.js";`;
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
  const lines: string[] = [`export interface Use${ir.name}Options {`];

  for (const ch of bindings.useControllableState) {
    const t = ch.valueType ?? "unknown";
    // Svelte 5: ALL prop fields are getter-shaped so $state/$derived
    // reactivity flows through prop updates. Consumer pattern:
    // useX({ checked: () => checkedProp, onChange: () => onChangeProp, ... }).
    lines.push(`  ${ch.valueProp}?: () => ${t} | undefined;`);
    if (ch.defaultValueProp)
      lines.push(`  ${ch.defaultValueProp}?: () => ${t} | undefined;`);
    lines.push(
      `  ${ch.changeHandlerProp}?: () => ((value: ${t}) => void) | undefined;`,
    );
  }

  for (const t of ir.behavior.normalizedDismissalTriggers) {
    if (!t.enabledByProp) continue;
    lines.push(`  ${t.enabledByProp}?: () => boolean | undefined;`);
  }

  if (bindings.usePortal) {
    const targetProp = ir.behavior.portal?.targetProp;
    if (targetProp) lines.push(`  ${targetProp}?: Element | string;`);
  }

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
    // Svelte 5: expose as readonly getter (plain value, not Ref)
    lines.push(`  readonly ${ch.name}: ${t};`);
    lines.push(`  ${setter}(next: ${t}): void;`);
  }

  if (
    bindings.useFocusTrap ||
    bindings.usePortal ||
    bindings.useAnchorToggle ||
    bindings.useDismissal
  ) {
    lines.push(`  panelRef: { el: HTMLElement | null };`);
  }
  if (bindings.useAnchorToggle) {
    lines.push(`  anchorRef: { el: HTMLElement | null };`);
  }
  if (bindings.usePortal) {
    lines.push(`  readonly portalTarget: Element | null;`);
  }

  lines.push(`}`);
  return lines.join("\n");
}

function generateBody(ir: ComponentIR, bindings: PrimitiveBindings): string {
  const lines: string[] = [];
  lines.push(
    `export function use${ir.name}(opts: Use${ir.name}Options = {}): Use${ir.name}Result {`,
  );

  // `openChannel` must be the boolean/"open" channel when AnchorToggle is
  // present — Select-like components declare a selection channel first, and
  // wiring AnchorToggle to that mis-types it.
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
    const varName = `${ch.name}State`;
    const t = ch.valueType ?? "unknown";
    const def = defaultExprFor(ch.defaultValueProp, t);
    const defaultExpr = ch.defaultValueProp
      ? `opts.${ch.defaultValueProp}?.() ?? ${def}`
      : def;
    lines.push(`  const ${varName} = createControllableState<${t}>({`);
    // opts.<valueProp> is itself a getter; pass it directly.
    lines.push(`    controlled: opts.${ch.valueProp},`);
    lines.push(`    defaultValue: ${defaultExpr},`);
    // opts.<changeHandlerProp> is a getter — invoke per-change to read latest fn.
    lines.push(
      `    onChange: (v) => opts.${ch.changeHandlerProp}?.()?.(v),`,
    );
    lines.push(`  });`);
    lines.push(``);
  }

  if (bindings.useAnchorToggle && openChannel) {
    const defaultOpenAccess = openChannel.defaultValueProp
      ? `opts.${openChannel.defaultValueProp}?.()`
      : `opts.defaultOpen?.()`;
    lines.push(
      `  const anchorToggle = createAnchorToggle({`,
      `    open: opts.${openChannel.valueProp},`,
      `    defaultOpen: ${defaultOpenAccess} ?? false,`,
      `    onOpenChange: (v) => opts.${openChannel.changeHandlerProp}?.()?.(v),`,
      `  });`,
      ``,
    );
  }

  // panelRef for focus trap, portal, or dismissal-only components
  if (bindings.useFocusTrap || bindings.usePortal || bindings.useDismissal) {
    lines.push(`  const panelRef = { el: null as HTMLElement | null };`);
  }

  if (bindings.useFocusTrap) {
    const channel = bindings.useControllableState.find(
      (c) => c.valueType === "boolean" || c.name === "open",
    );
    const activeGetter = channel
      ? `() => ${channel.name}State.value`
      : `() => true`;
    lines.push(
      `  createFocusTrap({ getActive: ${activeGetter}, containerRef: panelRef });`,
    );
    lines.push(``);
  }

  if (bindings.useScrollLock) {
    const channel = bindings.useControllableState.find(
      (c) => c.valueType === "boolean" || c.name === "open",
    );
    const activeGetter = channel
      ? `() => ${channel.name}State.value`
      : `() => true`;
    lines.push(`  createScrollLock(${activeGetter});`);
    lines.push(``);
  }

  if (bindings.usePortal) {
    const targetProp = ir.behavior.portal?.targetProp;
    const target = targetProp ? `() => opts.${targetProp}` : "() => undefined";
    lines.push(`  const portal = createPortal({`);
    lines.push(`    enabled: true,`);
    lines.push(`    target: ${target},`);
    lines.push(`  });`);
    lines.push(``);
  }

  if (bindings.useDismissal) {
    const channel = bindings.useControllableState.find(
      (c) => c.valueType === "boolean" || c.name === "open",
    );
    const openGetter = channel
      ? `() => ${channel.name}State.value`
      : `() => true`;
    const setterCall = channel
      ? `${channel.name}State.set(false)`
      : `void 0`;
    // opts.<escapeEnabledByProp> is itself a getter; pass it directly.
    const closeOnEscapeGetter = bindings.escapeEnabledByProp
      ? `opts.${bindings.escapeEnabledByProp}`
      : `() => true`;
    lines.push(`  createDismissal({`);
    lines.push(`    open: ${openGetter},`);
    lines.push(`    closeOnEscape: ${closeOnEscapeGetter},`);
    lines.push(`    onDismiss: () => { ${setterCall}; },`);
    lines.push(`  });`);
    lines.push(``);
  }

  // Build return object
  lines.push(`  return {`);
  for (const ch of bindings.useControllableState) {
    const setter = `set${capitalize(ch.name)}`;
    if (anchorOwnsChannel && ch === openChannel) {
      lines.push(
        `    get ${ch.name}() { return anchorToggle.open; },`,
      );
      lines.push(`    ${setter}(v) { anchorToggle.setOpen(v); },`);
    } else {
      const varName = `${ch.name}State`;
      lines.push(`    get ${ch.name}() { return ${varName}.value; },`);
      lines.push(`    ${setter}(v) { ${varName}.set(v); },`);
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
    lines.push(`    get portalTarget() { return portal.target; },`);
  }
  lines.push(`  };`);
  lines.push(`}`);
  return lines.join("\n");
}

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

export function generateSvelteHookSource(ir: ComponentIR): string | null {
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
