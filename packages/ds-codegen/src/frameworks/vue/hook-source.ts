/**
 * Vue 3 composable emitter — the framework-equivalent of
 * `frameworks/react/hook-source.ts`. Produces a `useX.ts` file that
 * composes Vue-side primitives shipped from `@full-stack-ds/vue`.
 *
 * Dispatches on the same `ir.behavior.normalized*` fields as React,
 * proving the IR is framework-neutral. The output shape uses Vue's
 * Composition API: `Ref<T>` for state, `computed`-style getters
 * exposed through plain functions, refs returned as `Ref<HTMLElement | null>`.
 *
 * For compound-state-container IRs (Tabs-shaped), the emitter also
 * generates the `TabsContextValue` interface and the shared
 * `[provideTabsContext, useTabsContext]` pair so all sub-component SFCs
 * can import from the same module (matching the idBase counter pattern).
 */
import type { ComponentIR, NormalizedChannelIR } from "../../ir.js";
import { renderSections, type Section } from "../../preserve.js";
import {
  isCompoundStateContainer,
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
  // AnchorToggle needs a boolean "open" state to bind. Non-boolean channels
  // (Walkthrough's step index) fall through to standalone Dismissal.
  const hasBooleanOpenChannel = channels.some(
    (c) => c.valueType === "boolean" || c.name === "open",
  );
  const useAnchor =
    !hasFocusTrap && (hasEscape || hasOutsideClick) && hasBooleanOpenChannel;
  // Standalone dismissal: when the anchor-toggle pattern doesn't apply but
  // the contract still declares Escape (e.g. Modal with focus.strategy=trap).
  // Outside-click for trap-focus components is handled at the template layer
  // (overlay onClick), not document-level, so we only wire Escape here.
  const useDismissal = !useAnchor && hasEscape;
  const compoundContainer = isCompoundStateContainer(ir);

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
  const vueNamed = new Set<string>();
  if (
    bindings.useFocusTrap ||
    bindings.usePortal ||
    bindings.useAnchorToggle ||
    bindings.useDismissal
  ) {
    vueNamed.add("ref");
    vueNamed.add("type Ref");
  }
  // Channel state always surfaces in the result interface as Ref<T> (see
  // line 144), so the `Ref` type must be importable whenever there are
  // controllable channels — even without focus/portal/anchor primitives.
  if (bindings.useControllableState.length > 0) {
    vueNamed.add("type Ref");
  }
  if (bindings.isCompoundStateContainer) {
    vueNamed.add("ref");
    vueNamed.add("type Ref");
  }

  const primitives: string[] = [];
  if (bindings.useControllableState.length > 0)
    primitives.push("useControllableState");
  if (bindings.useFocusTrap) primitives.push("useFocusTrap");
  if (bindings.useScrollLock) primitives.push("useScrollLock");
  if (bindings.usePortal) primitives.push("usePortal");
  if (bindings.useAnchorToggle) primitives.push("useAnchorToggle");
  if (bindings.useDismissal) primitives.push("useDismissal");
  if (bindings.isCompoundStateContainer) primitives.push("createCompoundContext");

  const lines: string[] = [];
  if (vueNamed.size > 0) {
    lines.push(`import { ${[...vueNamed].sort().join(", ")} } from "vue";`);
  }
  if (primitives.length > 0) {
    lines.push(
      `import { ${primitives.sort().join(", ")} } from "../../primitives/index.js";`,
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
  const lines: string[] = [`export interface Use${ir.name}Options {`];

  for (const ch of bindings.useControllableState) {
    const t = ch.valueType ?? "unknown";
    // Vue: controlled values are getter-shaped so prop reactivity flows through.
    // Consumer pattern: useSwitch({ checked: () => props.checked, ... }).
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

  if (bindings.isCompoundStateContainer) {
    lines.push(`  /** Base string for generating tab and panel IDs. Defaults to a generated id. */`);
    lines.push(`  idBase?: string;`);
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
    lines.push(`  ${ch.name}: Ref<${t}>;`);
    lines.push(`  ${setter}: (next: ${t}) => void;`);
  }

  if (
    bindings.useFocusTrap ||
    bindings.usePortal ||
    bindings.useAnchorToggle ||
    bindings.useDismissal
  ) {
    lines.push(`  panelRef: Ref<HTMLElement | null>;`);
  }
  if (bindings.useAnchorToggle) {
    lines.push(`  anchorRef: Ref<HTMLElement | null>;`);
  }
  if (bindings.usePortal) {
    lines.push(`  portalTarget: Ref<Element | null>;`);
  }

  if (bindings.isCompoundStateContainer) {
    lines.push(`  /** DOM-order list of registered tab values. */`);
    lines.push(`  registeredTabs: Ref<string[]>;`);
    lines.push(`  registerTab: (value: string) => void;`);
    lines.push(`  unregisterTab: (value: string) => void;`);
    lines.push(`  /** Base string for generating tab and panel IDs. */`);
    lines.push(`  idBase: string;`);
  }

  lines.push(`}`);
  return lines.join("\n");
}

/**
 * Mirror of the React side: pick the boolean open-channel for
 * `useAnchorToggle` to wire. Non-boolean channels (Walkthrough's
 * `step: number`, Select's `value: string|string[]`) are managed by
 * useControllableState independently, never wired into anchor-toggle.
 */
function pickOpenChannel(
  channels: NormalizedChannelIR[],
): NormalizedChannelIR | undefined {
  const boolChannels = channels.filter((c) => c.valueType === "boolean");
  return (
    boolChannels.find((c) => c.name === "open") ??
    boolChannels.find((c) => c.name === "expanded") ??
    boolChannels[0]
  );
}

function generateBody(ir: ComponentIR, bindings: PrimitiveBindings): string {
  const lines: string[] = [];

  // Module-level counter for stable idBase generation
  if (bindings.isCompoundStateContainer) {
    lines.push(`let _${ir.name.toLowerCase()}IdCounter = 0;`);
    lines.push(``);
  }

  lines.push(
    `export function use${ir.name}(options: Use${ir.name}Options = {}): Use${ir.name}Result {`,
  );

  const openChannel = pickOpenChannel(bindings.useControllableState);
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
      `  const { value: ${ch.name}, set: ${setter} } = useControllableState<${t}>({`,
    );
    // options.<valueProp> is itself a getter; pass it directly to the
    // controllable-state primitive (it expects `() => T | undefined`).
    lines.push(`    controlled: options.${ch.valueProp},`);
    lines.push(`    defaultValue: ${defaultExpr},`);
    lines.push(`    onChange: options.${ch.changeHandlerProp},`);
    lines.push(`  });`);
    lines.push(``);
  }

  if (bindings.useFocusTrap || bindings.usePortal || bindings.useDismissal) {
    lines.push(`  const panelRef = ref<HTMLElement | null>(null);`);
  }

  if (bindings.useAnchorToggle) {
    lines.push(`  const anchorToggle = useAnchorToggle({`);
    if (openChannel && openChannel.valueType === "boolean") {
      lines.push(`    open: options.${openChannel.valueProp},`);
      if (openChannel.defaultValueProp) {
        lines.push(
          `    defaultOpen: options.${openChannel.defaultValueProp} ?? false,`,
        );
      } else {
        lines.push(`    defaultOpen: false,`);
      }
      lines.push(`    onOpenChange: options.${openChannel.changeHandlerProp},`);
    }
    lines.push(`  });`, ``);
  }

  if (bindings.useFocusTrap) {
    const channel = bindings.useControllableState.find(
      (c) => c.valueType === "boolean" || c.name === "open",
    );
    const activeRef = channel ? channel.name : `ref(true)`;
    lines.push(`  useFocusTrap(panelRef, { active: ${activeRef} });`);
    lines.push(``);
  }

  if (bindings.useScrollLock) {
    const channel = bindings.useControllableState.find(
      (c) => c.valueType === "boolean" || c.name === "open",
    );
    lines.push(`  useScrollLock(${channel?.name ?? "ref(true)"});`);
    lines.push(``);
  }

  if (bindings.usePortal) {
    const targetProp = ir.behavior.portal?.targetProp;
    const target = targetProp ? `() => options.${targetProp}` : "() => undefined";
    lines.push(`  const { target: portalTarget } = usePortal({`);
    lines.push(`    enabled: true,`);
    lines.push(`    target: ${target},`);
    lines.push(`  });`, ``);
  }

  if (bindings.useDismissal) {
    const channel = bindings.useControllableState.find(
      (c) => c.valueType === "boolean" || c.name === "open",
    );
    const openExpr = channel ? `${channel.name}.value` : "true";
    const setterCall = channel
      ? `set${capitalize(channel.name)}(false)`
      : `void 0`;
    const closeOnEscapeExpr = bindings.escapeEnabledByProp
      ? `() => options.${bindings.escapeEnabledByProp}`
      : `() => true`;
    lines.push(`  useDismissal({`);
    lines.push(`    open: () => ${openExpr},`);
    lines.push(`    closeOnEscape: ${closeOnEscapeExpr},`);
    lines.push(`    onDismiss: () => ${setterCall},`);
    lines.push(`  });`, ``);
  }

  // Compound-state-container (Tabs-shaped) wiring
  if (bindings.isCompoundStateContainer) {
    lines.push(`  const registeredTabs = ref<string[]>([]);`);
    lines.push(``);
    lines.push(`  const resolvedIdBase = options.idBase ?? \`${ir.name.toLowerCase()}-\${++_${ir.name.toLowerCase()}IdCounter}\`;`);
    lines.push(``);
    lines.push(`  function registerTab(value: string): void {`);
    lines.push(`    if (!registeredTabs.value.includes(value)) {`);
    lines.push(`      registeredTabs.value = [...registeredTabs.value, value];`);
    lines.push(`    }`);
    lines.push(`  }`);
    lines.push(``);
    lines.push(`  function unregisterTab(value: string): void {`);
    lines.push(`    registeredTabs.value = registeredTabs.value.filter((v) => v !== value);`);
    lines.push(`  }`);
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
  if (bindings.isCompoundStateContainer) {
    lines.push(`    registeredTabs,`);
    lines.push(`    registerTab,`);
    lines.push(`    unregisterTab,`);
    lines.push(`    idBase: resolvedIdBase,`);
  }
  lines.push(`  };`);
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

/**
 * Generate the TabsContextValue interface and shared provide/inject pair
 * that all sub-component SFCs import from the same module.
 *
 * Must be in the same file as useTabs so all sub-components share one
 * symbol instance (a per-file createCompoundContext call would produce a
 * distinct symbol that doesn't match the provided value).
 */
function generateCompoundContextTypes(ir: ComponentIR): string {
  const { name } = ir;
  const channel = ir.behavior.normalizedChannels[0];
  const channelName = channel?.name ?? "activeTab";
  const setterName = `set${capitalize(channelName)}`;

  const lines: string[] = [];
  lines.push(`export interface ${name}ContextValue {`);
  lines.push(`  ${channelName}: Ref<string>;`);
  lines.push(`  ${setterName}: (value: string) => void;`);
  lines.push(`  registerTab: (value: string) => void;`);
  lines.push(`  unregisterTab: (value: string) => void;`);
  lines.push(`  registeredTabs: Ref<string[]>;`);
  lines.push(`  idBase: string;`);
  lines.push(`  orientation: "horizontal" | "vertical";`);
  lines.push(`  activationMode: "automatic" | "manual";`);
  lines.push(`  loop: boolean;`);
  lines.push(`  unmountInactive: boolean;`);
  lines.push(`}`);
  lines.push(``);
  lines.push(
    `export const [provide${name}Context, use${name}Context] =`,
  );
  lines.push(`  createCompoundContext<${name}ContextValue>("${name}");`);
  return lines.join("\n");
}

export function generateVueHookSource(ir: ComponentIR): string | null {
  const bindings = resolveBindings(ir);
  if (!bindings) return null;

  const importsBody = generateImports(bindings);
  const inlineTypesBody = generateInlineTypes(ir, bindings);
  const optionsBody = generateOptionsInterface(ir, bindings);
  const resultBody = generateResultInterface(ir, bindings);
  const contextTypesBody = bindings.isCompoundStateContainer
    ? generateCompoundContextTypes(ir)
    : "";
  const hookBody = generateBody(ir, bindings);

  const typesBody = [inlineTypesBody, optionsBody, resultBody, contextTypesBody]
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
