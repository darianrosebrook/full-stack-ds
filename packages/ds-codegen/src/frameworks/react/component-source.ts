/**
 * React-specific component source emission.
 *
 * Consumes the framework-neutral `ComponentIR`. Anything not React-specific
 * (anatomy, class recipe, root semantics, prop list) flows from the IR; only
 * concerns particular to React (`React.*` namespacing, JSX shape, `as` prop
 * mapping) live here.
 *
 * Output is partitioned into named regions via `preserve.ts`. Codegen owns
 * `@generated:*` regions; users own `@custom:*` regions and they survive
 * regeneration.
 */
import type {
  BindingExpression,
  ComponentIR,
  DomNodeIR,
  NormalizedChannelIR,
  PartIR,
} from "../../ir.js";
import { hasChildrenPlaceholder } from "../../ir.js";
import { renderSections, type Section } from "../../preserve.js";

/**
 * Generate the full React TSX source for a component IR.
 *
 * Emits regions, in order:
 *   `imports`         (gen)
 *   `imports`         (cust, empty default)
 *   `types`           (gen — type aliases from contract.types)
 *   `types`           (cust, empty default)
 *   `props`           (gen — the Props interface)
 *   `subcomponents`   (gen — compound part components, may be empty)
 *   `component`       (gen — the root component function)
 *   `trailing`        (cust — for wrappers/overrides; empty default)
 */
export function generateReactComponentSource(
  ir: ComponentIR,
  stackImportPath: string,
): string {
  const reactImports = collectReactImports(ir);

  const importLines = [
    `import { ${reactImports.join(", ")} } from "react";`,
  ];
  // Stack is needed for legacy single-root output AND for compound parts
  // (ModalHeader etc. still use <Stack as="header"> regardless of whether
  // the parent has a dom tree).
  if (!ir.dom || ir.compoundParts.length > 0) {
    importLines.push(`import { Stack } from "${stackImportPath}";`);
  }
  if (ir.dom && ir.behavior.normalizedChannels.length > 0) {
    importLines.push(`import { use${ir.name} } from "./use${ir.name}";`);
  }
  importLines.push(`import "./${ir.name}.css";`);
  const importsBody = importLines.join("\n");

  const typesBody = generateTypes(ir).trimEnd();
  const propsBody = generatePropsInterface(ir);

  const subcomponentsBody = ir.compoundParts
    .map((part) =>
      [
        generateSubComponentProps(ir.name, part),
        "",
        generateSubComponent(ir.name, ir.cssPrefix, part),
      ].join("\n"),
    )
    .join("\n\n");

  const componentBody = generateRootComponent(ir);

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
    { kind: "generated", id: "props", body: propsBody },
    blank(),
    { kind: "generated", id: "subcomponents", body: subcomponentsBody },
    blank(),
    { kind: "generated", id: "component", body: componentBody },
    blank(),
    { kind: "custom", id: "trailing", body: "" },
    { kind: "between", body: "" },
  ];

  return renderSections(sections, "line");
}

// ---------------------------------------------------------------------------
// Type resolution (React-specific)
// ---------------------------------------------------------------------------

/**
 * React-DOM type identifiers the generator knows how to import. Each is
 * imported as `type X` from `"react"` when it appears anywhere in the IR's
 * emitted text (styled prop types, defined-type values/aliases). The
 * generator never emits the `React.X` namespace form — bare identifiers
 * with a matching `import type` line are unambiguous and avoid the
 * "React is not defined" pitfall when the JSX runtime doesn't expose a
 * global namespace.
 */
const REACT_TYPE_IDENTIFIERS = [
  // Common
  "ReactNode",
  "ReactElement",
  "ComponentType",
  "CSSProperties",
  "Ref",
  "RefObject",
  "MutableRefObject",
  "ForwardedRef",
  // Synthetic events
  "SyntheticEvent",
  "MouseEvent",
  "KeyboardEvent",
  "ChangeEvent",
  "FocusEvent",
  "FormEvent",
  "TouchEvent",
  "PointerEvent",
  "DragEvent",
  "ClipboardEvent",
  "AnimationEvent",
  "TransitionEvent",
  // Event handlers
  "MouseEventHandler",
  "KeyboardEventHandler",
  "ChangeEventHandler",
  "FocusEventHandler",
  "FormEventHandler",
  "TouchEventHandler",
  "PointerEventHandler",
  "DragEventHandler",
  "ClipboardEventHandler",
  "EventHandler",
  // Attribute interfaces
  "AllHTMLAttributes",
  "HTMLAttributes",
  "ButtonHTMLAttributes",
  "InputHTMLAttributes",
  "TextareaHTMLAttributes",
  "SelectHTMLAttributes",
  "AnchorHTMLAttributes",
  "FormHTMLAttributes",
  "DialogHTMLAttributes",
  "DetailsHTMLAttributes",
  "OptionHTMLAttributes",
  "AriaAttributes",
] as const;

/** Word-boundary regex for "X is referenced in this text" detection. */
function identifierRegex(name: string): RegExp {
  return new RegExp(`(?<![.\\w])${name}(?![\\w])`, "g");
}

/**
 * Strip a leading `React.` namespace prefix from any reference to a known
 * React DOM identifier. The contract data may carry `React.MouseEventHandler`
 * for historical reasons; we accept it but emit bare `MouseEventHandler`
 * with an explicit `import type` line.
 */
function stripReactNamespace(typeStr: string): string {
  let result = typeStr;
  for (const name of REACT_TYPE_IDENTIFIERS) {
    result = result.replace(new RegExp(`(?<![.\\w])React\\.${name}\\b`, "g"), name);
  }
  return result;
}

/**
 * Resolve a contract type string for emission. The generator never emits
 * `React.X` namespace references — those are stripped — and types defined
 * in the contract's own `types` block are left as bare identifiers.
 */
function resolveReactType(typeStr: string, ir: ComponentIR): string {
  if (ir.definedTypes[typeStr]) return typeStr;
  return stripReactNamespace(typeStr);
}

/**
 * Build the `import type { ... } from "react"` identifier list by scanning
 * every text source the generator will emit (styled prop types, defined
 * types' values/aliases). `ReactNode` is always included because the props
 * interface adds `children?: ReactNode` by default.
 */
function collectReactImports(ir: ComponentIR): string[] {
  const imports = new Set<string>(["ReactNode"]);
  const sources: string[] = [];

  for (const p of ir.styledProps) sources.push(stripReactNamespace(p.type));

  for (const def of Object.values(ir.definedTypes)) {
    if (def.alias) sources.push(stripReactNamespace(def.alias));
    if (def.values) sources.push(def.values.join(" "));
  }

  const haystack = sources.join(" ");
  for (const name of REACT_TYPE_IDENTIFIERS) {
    if (identifierRegex(name).test(haystack)) imports.add(name);
  }

  return [...imports]
    .sort()
    .map((name) => `type ${name}`);
}

// ---------------------------------------------------------------------------
// Sections
// ---------------------------------------------------------------------------

/**
 * Emit type alias declarations from the contract's `types` block.
 *
 * Unresolved type references are *not* emitted as `TODO`/`unknown` stubs.
 * They are surfaced by the CLI from `ir.unresolvedTypeRefs` (warning by
 * default; failure under `--strict-types`). Generated source therefore
 * stays free of placeholder identifiers — a missing type is now a contract
 * authoring problem, not a generated-code TODO.
 */
function generateTypes(ir: ComponentIR): string {
  const lines: string[] = [];
  for (const [name, def] of Object.entries(ir.definedTypes)) {
    if (def.kind === "union" && def.values) {
      lines.push(
        `export type ${name} = ${def.values.map((v) => `"${v}"`).join(" | ")};`,
      );
    } else if (def.kind === "alias" && def.alias) {
      lines.push(`export type ${name} = ${stripReactNamespace(def.alias)};`);
    }
    lines.push("");
  }
  return lines.join("\n");
}

function generatePropsInterface(ir: ComponentIR): string {
  const propNames = new Set(ir.styledProps.map((p) => p.name));
  const lines: string[] = [];

  lines.push(`export interface ${ir.name}Props {`);

  for (const p of ir.styledProps) {
    const optional = p.required ? "" : "?";
    const propName = p.name.includes("-") ? `"${p.name}"` : p.name;
    const tsType = resolveReactType(p.type, ir);
    lines.push(`  ${propName}${optional}: ${tsType};`);
  }

  for (const dim of Object.keys(ir.variants)) {
    if (!propNames.has(dim)) {
      lines.push(`  ${dim}?: string;`);
    }
  }
  if (!propNames.has("className")) lines.push(`  className?: string;`);
  if (!propNames.has("data-testid")) lines.push(`  "data-testid"?: string;`);
  // When the dom tree has a dialog node, include aria-label/aria-labelledby so
  // consumers can name the dialog and tests/axe can find it.
  if (ir.dom && domTreeHasRole(ir.dom, "dialog")) {
    if (!propNames.has("aria-label")) lines.push(`  "aria-label"?: string;`);
    if (!propNames.has("aria-labelledby")) lines.push(`  "aria-labelledby"?: string;`);
  }
  // Only expose a `children` prop when the component actually renders
  // children. For dom-tree components, that means a `{ tag: "children" }`
  // placeholder in the contract. For legacy no-dom-tree components, the
  // emitter always wraps the body in `<Stack>{children}</Stack>`, so they
  // always accept children. Visual leaf components (e.g. <Image>, <Spinner>)
  // get a clean API with no dead prop.
  const componentAcceptsChildren = ir.dom ? hasChildrenPlaceholder(ir) : true;
  if (!propNames.has("children") && componentAcceptsChildren) {
    lines.push(`  children?: ReactNode;`);
  }

  // Named slots from the dom tree → `slots` prop with each named slot as
  // an optional ReactNode. Consumers pass `<MyComponent slots={{ title: ... }}>`.
  const namedSlots = collectReactNamedSlots(ir);
  if (namedSlots.length > 0) {
    lines.push(`  slots?: {`);
    for (const slot of namedSlots) {
      lines.push(`    ${slot}?: ReactNode;`);
    }
    lines.push(`  };`);
  }

  lines.push(`}`);
  return lines.join("\n");
}

function collectReactNamedSlots(ir: ComponentIR): string[] {
  if (!ir.dom) return [];
  const names: string[] = [];
  const stack = [ir.dom];
  while (stack.length > 0) {
    const node = stack.pop()!;
    if (node.tag === "slot" && node.slotName && !names.includes(node.slotName)) {
      names.push(node.slotName);
    }
    if (node.children) stack.push(...node.children);
  }
  return names.sort();
}

function generateSubComponentProps(name: string, part: PartIR): string {
  const subName = `${name}${capitalize(part.name)}`;
  return [
    `export interface ${subName}Props {`,
    `  children?: ReactNode;`,
    `  className?: string;`,
    `  "data-testid"?: string;`,
    `}`,
  ].join("\n");
}

function generateSubComponent(
  name: string,
  prefix: string,
  part: PartIR,
): string {
  const subName = `${name}${capitalize(part.name)}`;
  const cssClass = `${prefix}__${part.name}`;
  const asElement = part.semanticElement;
  const asProp = asElement && asElement !== "div" ? ` as="${asElement}"` : "";
  const layoutProp =
    part.layoutVariant === "horizontal" ? ` variant="horizontal"` : "";

  return [
    `export function ${subName}({`,
    `  children,`,
    `  className,`,
    `  "data-testid": testId,`,
    `}: ${subName}Props) {`,
    `  const classNames = ["${cssClass}", className].filter(Boolean).join(" ");`,
    `  return (`,
    `    <Stack${asProp}${layoutProp} className={classNames} data-testid={testId}>`,
    `      {children}`,
    `    </Stack>`,
    `  );`,
    `}`,
  ].join("\n");
}

function generateRootComponent(ir: ComponentIR): string {
  if (ir.dom) {
    return generateDomTreeRootComponent(ir);
  }
  const { name, classRecipe, root } = ir;

  // A prop is "destructured" once, in a stable order matching the historical
  // generator: value-modifier props first (with defaults), then className,
  // testid, children, ...rest.
  const destructured: string[] = [];
  const classExprs: string[] = [`"${classRecipe.base}"`];
  const handled = new Set<string>();

  // Map prop name to ResolvedPropIR for fast lookup.
  const propByName = new Map(ir.styledProps.map((p) => [p.name, p]));

  for (const mod of classRecipe.valueModifiers) {
    const resolved = propByName.get(mod.propName);
    const aliased = mod.propName.includes("-")
      ? `"${mod.propName}": ${mod.safeName}`
      : mod.propName;
    const def = resolved?.defaultExpr ?? mod.defaultExpr;
    destructured.push(def ? `${aliased} = ${def}` : aliased);
    classExprs.push(
      `${mod.safeName} && \`${classRecipe.base}--\${${mod.safeName}}\``,
    );
    handled.add(mod.propName);
  }

  for (const mod of classRecipe.booleanModifiers) {
    if (handled.has(mod.propName)) continue;
    destructured.push(mod.propName);
    classExprs.push(
      `${mod.safeName} && "${classRecipe.base}--${mod.safeName}"`,
    );
    handled.add(mod.propName);
  }

  if (!handled.has("className")) destructured.push("className");
  destructured.push('"data-testid": testId');
  // Legacy no-dom-tree path always wraps in <Stack>{children}</Stack>, so
  // children is part of the API regardless of contract placement.
  if (!handled.has("children")) destructured.push("children");
  handled.add("className");
  handled.add("data-testid");
  handled.add("children");

  // Consume any remaining contract-declared styled props out of the param
  // before `...rest` so they don't leak into <Stack {...rest}>, which has
  // its own typed Props (e.g. `variant?: "vertical" | "horizontal"`)
  // that would conflict with component-specific shapes (Indicator's
  // `variant?: IndicatorVariant`, ListItem's `variant?: "single" | ...`,
  // etc.).
  for (const p of ir.styledProps) {
    if (handled.has(p.name)) continue;
    const aliased = p.name.includes("-")
      ? `"${p.name}": ${p.safeName}`
      : p.safeName;
    const def = p.defaultExpr;
    destructured.push(def ? `${aliased} = ${def}` : aliased);
    handled.add(p.name);
  }

  classExprs.push("className");
  // If the dom tree references named slots, destructure `slots` so the
  // template can read `{slots?.title}` etc.
  if (collectReactNamedSlots(ir).length > 0) {
    destructured.push("slots");
  }
  destructured.push("...rest");

  const asProp = root.element !== "div" ? `as="${root.element}"` : "";
  const roleProp = root.effectiveRole ? `role="${root.effectiveRole}"` : "";

  const jsxAttrs: string[] = [];
  if (asProp) jsxAttrs.push(`      ${asProp}`);
  if (roleProp) jsxAttrs.push(`      ${roleProp}`);
  jsxAttrs.push(`      className={classNames}`);
  jsxAttrs.push(`      data-testid={testId}`);
  jsxAttrs.push(`      {...rest}`);

  const lines: string[] = [];
  lines.push(`export function ${name}({`);
  lines.push(`  ${destructured.join(",\n  ")}`);
  lines.push(`}: ${name}Props) {`);
  lines.push(`  const classNames = [`);
  for (const expr of classExprs) lines.push(`    ${expr},`);
  lines.push(`  ]`);
  lines.push(`    .filter(Boolean)`);
  lines.push(`    .join(" ");`);
  lines.push(``);
  lines.push(`  return (`);
  lines.push(`    <Stack`);
  lines.push(jsxAttrs.join("\n"));
  lines.push(`    >`);
  lines.push(`      {children}`);
  lines.push(`    </Stack>`);
  lines.push(`  );`);
  lines.push(`}`);
  return lines.join("\n");
}

function capitalize(s: string): string {
  return s[0].toUpperCase() + s.slice(1);
}

// ---------------------------------------------------------------------------
// DOM-tree-driven component (B.2c)
// ---------------------------------------------------------------------------

/** Returns true if any node in the dom tree has the given role attribute. */
function domTreeHasRole(node: DomNodeIR | null | undefined, role: string): boolean {
  if (!node) return false;
  if (node.attrs["role"] === role) return true;
  return node.children.some((child) => domTreeHasRole(child, role));
}

/**
 * Generate a React component that renders the contract's `dom` tree. Native
 * HTML elements with attribute and event bindings; consumer-provided children
 * land at the `tag: "slot"` / `tag: "children"` placeholder. Unlike the
 * legacy path, this does not wrap in `<Stack>` — `dom.tag` is the rendered
 * root, matching the contract's intent.
 *
 * Relies on the generated `useX` hook for channel state (the channel hook
 * composes `useControllableState` and any other primitives).
 */
function generateDomTreeRootComponent(ir: ComponentIR): string {
  if (!ir.dom) throw new Error("generateDomTreeRootComponent requires ir.dom");

  const { name, classRecipe } = ir;
  const propByName = new Map(ir.styledProps.map((p) => [p.name, p]));
  const channels = ir.behavior.normalizedChannels;
  const channelByName = new Map(channels.map((c) => [c.name, c]));
  const channelValueProps = new Set(channels.map((c) => c.valueProp));

  const controlledAliasFor = (propName: string): string =>
    `controlled${capitalize(propName)}`;

  // Process channels FIRST so the controlled-value props get renamed to
  // `controlled<Name>`. This avoids collision with the same-named binding
  // returned by the hook (`useSwitch` returns `{ checked, setChecked }`).
  const destructured: string[] = [];
  const handled = new Set<string>();
  const classExprs: string[] = [`"${classRecipe.base}"`];

  for (const ch of channels) {
    const alias = controlledAliasFor(ch.valueProp);
    destructured.push(`${ch.valueProp}: ${alias}`);
    handled.add(ch.valueProp);
    if (ch.defaultValueProp) {
      destructured.push(ch.defaultValueProp);
      handled.add(ch.defaultValueProp);
    }
    destructured.push(ch.changeHandlerProp);
    handled.add(ch.changeHandlerProp);
  }

  for (const mod of classRecipe.valueModifiers) {
    if (handled.has(mod.propName)) continue;
    const resolved = propByName.get(mod.propName);
    const aliased = mod.propName.includes("-")
      ? `"${mod.propName}": ${mod.safeName}`
      : mod.propName;
    const def = resolved?.defaultExpr ?? mod.defaultExpr;
    destructured.push(def ? `${aliased} = ${def}` : aliased);
    classExprs.push(
      `${mod.safeName} && \`${classRecipe.base}--\${${mod.safeName}}\``,
    );
    handled.add(mod.propName);
  }

  const channelNamesEarly = new Set(channels.map((c) => c.name));
  const channelByValueProp = new Map(channels.map((c) => [c.valueProp, c]));
  for (const mod of classRecipe.booleanModifiers) {
    // When the boolean-modifier name matches a channel value-prop, the class
    // is driven by the HOOK-RESOLVED value (which reflects controlled +
    // uncontrolled state) rather than the prop directly. The prop itself is
    // typically destructured as `controlled<Name>`, so we must reference the
    // channel NAME (which the hook returns and the component destructures).
    if (channelValueProps.has(mod.propName)) {
      const channelName = channelByValueProp.get(mod.propName)?.name;
      const ref = channelName ?? mod.propName;
      classExprs.push(`${ref} && "${classRecipe.base}--${mod.safeName}"`);
      continue;
    }
    // When the modifier name matches a channel NAME (e.g. Modal's `open`
    // is a channel name with valueProp `isOpen`), reference the hook return.
    if (channelNamesEarly.has(mod.propName)) {
      classExprs.push(
        `${mod.propName} && "${classRecipe.base}--${mod.safeName}"`,
      );
      continue;
    }
    if (handled.has(mod.propName)) continue;
    destructured.push(mod.propName);
    classExprs.push(
      `${mod.safeName} && "${classRecipe.base}--${mod.safeName}"`,
    );
    handled.add(mod.propName);
  }

  if (!handled.has("className")) {
    destructured.push("className");
    handled.add("className");
  }
  destructured.push('"data-testid": testId');
  handled.add("data-testid");
  // When the dom tree contains a dialog node, extract aria-label/aria-labelledby
  // from props so they can be forwarded to the dialog element (not the root).
  const hasDialogNode = domTreeHasRole(ir.dom, "dialog");
  if (hasDialogNode) {
    destructured.push('"aria-label": ariaLabel');
    destructured.push('"aria-labelledby": ariaLabelledBy');
    handled.add("aria-label");
    handled.add("aria-labelledby");
  }
  if (!handled.has("children") && hasChildrenPlaceholder(ir)) {
    destructured.push("children");
    handled.add("children");
  }

  // Pass through any remaining contract-declared props before ...rest so they
  // don't unexpectedly leak into the root element via spread.
  const channelNames = new Set(channels.map((c) => c.name));
  for (const p of ir.styledProps) {
    if (handled.has(p.name)) continue;
    // Don't destructure props whose name collides with a channel name —
    // the hook return will shadow them. Modal has both `open` (v2 prop)
    // and a channel named `open` whose valueProp is `isOpen`.
    if (channelNames.has(p.name)) continue;
    const aliased = p.name.includes("-")
      ? `"${p.name}": ${p.safeName}`
      : p.safeName;
    const def = p.defaultExpr;
    destructured.push(def ? `${aliased} = ${def}` : aliased);
    handled.add(p.name);
  }

  classExprs.push("className");
  // If the dom tree references named slots, destructure `slots` so the
  // template can read `{slots?.title}` etc.
  if (collectReactNamedSlots(ir).length > 0) {
    destructured.push("slots");
  }
  destructured.push("...rest");

  // Build the hook call. The hook returns `{ <name>: <value>, set<Name>: ... }`
  // for each channel (per the per-framework hook-source.ts).
  const hookResultParts: string[] = [];
  for (const ch of channels) {
    hookResultParts.push(ch.name);
    hookResultParts.push(`set${capitalize(ch.name)}`);
  }

  const hookOptionsLines: string[] = [];
  for (const ch of channels) {
    const controlledAlias = controlledAliasFor(ch.valueProp);
    hookOptionsLines.push(`    ${ch.valueProp}: ${controlledAlias}`);
    if (ch.defaultValueProp) {
      hookOptionsLines.push(`    ${ch.defaultValueProp}`);
    }
    hookOptionsLines.push(`    ${ch.changeHandlerProp}`);
  }
  // Forward dismissal-trigger enabledBy props (closeOnEscape, etc.) to the
  // generated hook so its useDismissal call sees the user's settings.
  for (const trigger of ir.behavior.normalizedDismissalTriggers) {
    if (!trigger.enabledByProp) continue;
    if (!handled.has(trigger.enabledByProp)) {
      // Destructure the prop too if not already done.
      const aliased = trigger.enabledByProp;
      destructured.push(aliased);
      handled.add(aliased);
    }
    hookOptionsLines.push(`    ${trigger.enabledByProp}`);
  }

  const lines: string[] = [];
  lines.push(`export function ${name}({`);
  lines.push(`  ${destructured.join(",\n  ")}`);
  lines.push(`}: ${name}Props) {`);
  if (channels.length > 0) {
    lines.push(`  const { ${hookResultParts.join(", ")} } = use${name}({`);
    lines.push(hookOptionsLines.join(",\n") + ",");
    lines.push(`  });`);
    lines.push(``);
  }
  lines.push(`  const classNames = [`);
  for (const expr of classExprs) lines.push(`    ${expr},`);
  lines.push(`  ]`);
  lines.push(`    .filter(Boolean)`);
  lines.push(`    .join(" ");`);
  lines.push(``);

  // Overlay-click dismissal: find the trigger and the boolean channel's setter.
  const overlayClickTrigger = ir.behavior.normalizedDismissalTriggers.find(
    (t) => t.event === "overlayClick",
  );
  const booleanChannel = channels.find((c) => c.valueType === "boolean");
  const overlayClickSetter = overlayClickTrigger && booleanChannel
    ? `set${capitalize(booleanChannel.name)}`
    : undefined;

  const renderCtx: ReactRenderContext = {
    classRecipe: classRecipe.base,
    channelByName,
    isRoot: true,
    overlayClickSetter,
    overlayClickEnabledProp: overlayClickTrigger?.enabledByProp,
    forwardAriaLabel: hasDialogNode,
    rootRole: ir.root.effectiveRole,
  };

  // When the root has an if-guard, render the conditional at the return
  // level (cleaner than wrapping in `()` braces inside `return (...)`).
  if (ir.dom.ifProp) {
    let guard: string;
    if (ir.dom.ifProp === "children") {
      guard = "children";
    } else {
      const matchingChannel = [...channelByName.values()].find(
        (c) => c.valueProp === ir.dom!.ifProp || c.name === ir.dom!.ifProp,
      );
      guard = matchingChannel ? matchingChannel.name : ir.dom.ifProp;
    }
    // Render the body without the if-guard (we handle it at this level).
    const unguarded: DomNodeIR = { ...ir.dom, ifProp: undefined };
    const treeJsx = renderReactDomNode(unguarded, renderCtx, 4);
    lines.push(`  if (!${guard}) return null;`);
    lines.push(`  return (`);
    lines.push(treeJsx);
    lines.push(`  );`);
  } else {
    const treeJsx = renderReactDomNode(ir.dom, renderCtx, 2);
    lines.push(`  return (`);
    lines.push(treeJsx);
    lines.push(`  );`);
  }
  lines.push(`}`);
  return lines.join("\n");
}

interface ReactRenderContext {
  classRecipe: string;
  channelByName: Map<string, NormalizedChannelIR>;
  isRoot: boolean;
  /** When set, emit onClick to dismiss the overlay on root click. */
  overlayClickSetter?: string;
  /** Prop name that controls whether overlay click dismissal is enabled. */
  overlayClickEnabledProp?: string;
  /** When true, forward aria-label/aria-labelledby props to this node's element. */
  forwardAriaLabel?: boolean;
  /**
   * Effective ARIA role to emit on the root node, when the contract's
   * `a11y.role` differs from the element's implicit role and the dom tree
   * doesn't already declare `attrs.role`. Mirrors the legacy non-dom path
   * which always emits `role={effectiveRole}` on the root.
   */
  rootRole?: string;
}

/**
 * Recursive React JSX emitter for `DomNodeIR`. Indentation is parameter-passed
 * so output stays formatted; final line counts include each sub-tree's own
 * indentation.
 */
function renderReactDomNode(
  node: DomNodeIR,
  ctx: ReactRenderContext,
  indent: number,
): string {
  const pad = " ".repeat(indent);

  // Slot / children placement
  if (node.tag === "slot" || node.tag === "children") {
    if (node.slotName) {
      // Named slots are exposed via the `slots` prop on the React API:
      //   <MyComponent slots={{ title: <h2>Hello</h2> }} />
      return `${pad}{slots?.${node.slotName}}`;
    }
    return `${pad}{children}`;
  }

  // Build attribute list. Order: static attrs, then bound attrs, then class, then root-only data-testid + ...rest.
  const attrs: string[] = [];
  const classParts: string[] = [];

  if (node.part) classParts.push(`"${ctx.classRecipe}__${node.part}"`);

  for (const [key, value] of Object.entries(node.attrs)) {
    if (key === "class" || key === "className") {
      classParts.push(`"${value}"`);
      continue;
    }
    const jsxKey = jsxAttrName(key);
    // Numeric JSX attributes need expression syntax (`tabIndex={-1}`),
    // not string syntax (`tabIndex="-1"`).
    if (NUMERIC_JSX_ATTRS.has(jsxKey) && /^-?\d+$/.test(value)) {
      attrs.push(`${jsxKey}={${value}}`);
    } else {
      attrs.push(`${jsxKey}="${escapeJsxString(value)}"`);
    }
  }

  // Text-content bindings render as a child node, not a JSX attribute —
  // React does not have a `textContent` prop. We collect them here and
  // splice them into the child render below.
  const textChildren: string[] = [];
  for (const [key, expr] of Object.entries(node.bindings)) {
    const valueExpr = renderReactBinding(key, expr, ctx);
    if (valueExpr === null) continue; // skip unsupported
    if (key === "textContent") {
      textChildren.push(`{${valueExpr}}`);
      continue;
    }
    const jsxKey = jsxAttrName(key);
    // ARIA boolean-ish attributes have React type `Booleanish` (`boolean |
    // "true" | "false"`). Three cases:
    //   1. Boolean prop or boolean channel — pass through. React accepts
    //      `boolean | undefined` for Booleanish, and a missing prop simply
    //      omits the attr at render time.
    //   2. Non-boolean channel bound to a boolean-ish attr — coerce via
    //      `String(...) as "true" | "false"`. This is a contract smell
    //      (the channel's domain doesn't match the attribute's domain)
    //      but the cast preserves correctness for callers that pass valid
    //      values.
    //   3. Prop binding with non-boolean type (rare) — same as case 2.
    if (ARIA_BOOLEAN_ATTRS.has(jsxKey)) {
      const sourceType = inferBindingValueType(expr, ctx);
      if (sourceType === "boolean" || sourceType === undefined) {
        attrs.push(`${jsxKey}={${valueExpr}}`);
      } else {
        // Non-boolean channel coerced to Booleanish via String(). Use a
        // ternary so an undefined channel value renders no attribute
        // (React omits attrs with `undefined`), rather than the literal
        // string "undefined" which axe correctly flags as invalid.
        attrs.push(
          `${jsxKey}={${valueExpr} !== undefined ? (String(${valueExpr}) as "true" | "false") : undefined}`,
        );
      }
      continue;
    }
    // Numeric JSX attributes (e.g. aria-valuemin) typed as `number` reject
    // a string literal. When the binding is a literal that parses as a
    // number, emit the unquoted form so React sees a number.
    if (
      NUMERIC_JSX_ATTRS.has(jsxKey) &&
      expr.kind === "literal" &&
      /^-?\d+$/.test(expr.value)
    ) {
      attrs.push(`${jsxKey}={${expr.value}}`);
      continue;
    }
    attrs.push(`${jsxKey}={${valueExpr}}`);
  }

  if (ctx.isRoot) {
    if (classParts.length > 0) {
      attrs.unshift(`className={\`${classRootClassExpr(classParts)}\`}`);
    } else {
      attrs.unshift(`className={classNames}`);
    }
    // Apply contract-declared a11y.role on the root unless the dom tree
    // already set `attrs.role` (which is consumed in the loop above and
    // would already appear in `attrs`).
    if (ctx.rootRole && !node.attrs["role"]) {
      attrs.push(`role="${ctx.rootRole}"`);
    }
    attrs.push(`data-testid={testId}`);
    // Overlay-click dismissal: close when the backdrop is clicked directly.
    // `e.target === e.currentTarget` ensures clicks on descendants (the
    // dialog panel and its children) do NOT trigger dismissal — removes the
    // need for a stopPropagation handler on the inner non-interactive panel.
    if (ctx.overlayClickSetter) {
      const guard = ctx.overlayClickEnabledProp
        ? `${ctx.overlayClickEnabledProp} ? `
        : "";
      const tail = ctx.overlayClickEnabledProp ? " : undefined" : "";
      attrs.push(
        `onClick={${guard}(e) => { if (e.target === e.currentTarget) ${ctx.overlayClickSetter}(false); }${tail}}`,
      );
    }
    attrs.push(`{...rest}`);
  } else if (classParts.length > 0) {
    attrs.unshift(`className=${classPartsExpr(classParts)}`);
  }

  // Forward aria-label/aria-labelledby to the dialog element so axe can find
  // the name. Only inject when the contract didn't already declare a literal
  // attr OR a binding for that attribute — contract authorship wins.
  if (!ctx.isRoot && node.attrs["role"] === "dialog") {
    if (ctx.forwardAriaLabel) {
      const hasLabelAttr =
        node.attrs["aria-label"] !== undefined ||
        node.bindings["aria-label"] !== undefined;
      const hasLabelledByAttr =
        node.attrs["aria-labelledby"] !== undefined ||
        node.bindings["aria-labelledby"] !== undefined;
      if (!hasLabelAttr) attrs.push(`aria-label={ariaLabel}`);
      if (!hasLabelledByAttr) attrs.push(`aria-labelledby={ariaLabelledBy}`);
    }
  }

  // Children rendering
  const childCtx: ReactRenderContext = { ...ctx, isRoot: false };
  const renderedChildren = node.children.map((c) =>
    renderReactDomNode(c, childCtx, indent + 2),
  );

  // Inline text from textContent bindings precedes any child elements.
  // Indent matches child indent so the source reads consistently.
  const textChildLines = textChildren.map((tc) => `${" ".repeat(indent + 2)}${tc}`);
  const allChildren = [...textChildLines, ...renderedChildren];

  // Self-closing vs open tag
  const tag = node.tag;
  const isVoidEl = VOID_HTML_ELEMENTS.has(tag);

  let body: string;
  if (allChildren.length === 0 && isVoidEl) {
    body = `${pad}<${tag}${formatAttrs(attrs)} />`;
  } else if (allChildren.length === 0) {
    body = `${pad}<${tag}${formatAttrs(attrs)} />`;
  } else {
    body = [
      `${pad}<${tag}${formatAttrs(attrs)}>`,
      ...allChildren,
      `${pad}</${tag}>`,
    ].join("\n");
  }

  // if-guard: wrap in a JSX expression. When the guard prop matches a
  // channel value-prop, reference the hook-resolved value (which reflects
  // controlled + uncontrolled state) rather than the controlled prop alone.
  if (node.ifProp) {
    let guard: string;
    if (node.ifProp === "children") {
      guard = "children";
    } else {
      const matchingChannel = [...ctx.channelByName.values()].find(
        (c) => c.valueProp === node.ifProp || c.name === node.ifProp,
      );
      guard = matchingChannel ? matchingChannel.name : node.ifProp;
    }
    return `${pad}{${guard} && (\n${body.replace(/^/gm, "  ")}\n${pad})}`;
  }

  return body;
}

/**
 * Build the root className JSX expression. For the root node, the class
 * recipe (variant + boolean modifiers) is computed in `classNames`. We
 * concatenate the per-part class with `classNames` so the root carries both
 * its BEM block class AND any modifier classes.
 */
function classRootClassExpr(_parts: string[]): string {
  // Note: we always emit the user's `className` via the existing
  // `classNames` concatenation. The dom-tree's part class for the root is
  // already included in classRecipe.base, so we don't double-emit it.
  return `\${classNames}`;
}

function classPartsExpr(parts: string[]): string {
  if (parts.length === 1) return parts[0];
  return `[${parts.join(", ")}].filter(Boolean).join(" ")`;
}

function formatAttrs(attrs: string[]): string {
  if (attrs.length === 0) return "";
  return " " + attrs.join(" ");
}

/**
 * Convert HTML attribute name to JSX attribute name. JSX uses camelCase for
 * most attributes but a few special cases (`for` → `htmlFor`, `class` →
 * `className`) need explicit handling.
 */
function jsxAttrName(name: string): string {
  if (name === "for") return "htmlFor";
  if (name === "class") return "className";
  if (name === "tabindex") return "tabIndex";
  if (name === "readonly") return "readOnly";
  if (name === "maxlength") return "maxLength";
  if (name === "minlength") return "minLength";
  if (name === "autocomplete") return "autoComplete";
  if (name === "autofocus") return "autoFocus";
  if (name === "contenteditable") return "contentEditable";
  if (name === "spellcheck") return "spellCheck";
  if (name === "inputmode") return "inputMode";
  if (name === "enterkeyhint") return "enterKeyHint";
  if (name === "crossorigin") return "crossOrigin";
  if (name === "formaction") return "formAction";
  if (name === "formenctype") return "formEncType";
  if (name === "formmethod") return "formMethod";
  if (name === "formnovalidate") return "formNoValidate";
  if (name === "formtarget") return "formTarget";
  // ARIA / data attributes pass through as-is.
  if (name.startsWith("aria-") || name.startsWith("data-")) return name;
  return name;
}

function escapeJsxString(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

/**
 * Infer the runtime type of a binding expression's resolved value, so the
 * emitter can decide whether an ARIA boolean-ish attribute needs coercion.
 * Returns `"boolean"` for boolean prop/channel sources, the channel's
 * declared `valueType` for non-boolean channels, and `undefined` for prop
 * bindings whose typed prop the caller can't introspect (in which case the
 * emitter pass-through assumes the prop type is correct).
 */
function inferBindingValueType(
  expr: BindingExpression,
  ctx: ReactRenderContext,
): string | undefined {
  if (expr.kind === "channel") {
    return ctx.channelByName.get(expr.channel)?.valueType;
  }
  if (expr.kind === "prop") {
    // No introspection of styled prop types in this context — caller
    // contract is that prop types match the attribute they're bound to.
    return undefined;
  }
  return undefined;
}

/**
 * Map a binding expression into a React JSX expression value. Channel
 * onChange handlers are wrapped to extract the value from the DOM event in
 * a shape that depends on (a) the host JSX attribute name and (b) the
 * channel's value type. `onChange` reads `e.target.{checked,value}`; other
 * event handlers (e.g. `onClick`) cannot — for a boolean channel wired to a
 * click, we emit a toggle callback; for other valueTypes wired to a click,
 * we pass through the current value.
 */
function renderReactBinding(
  attr: string,
  expr: BindingExpression,
  ctx: ReactRenderContext,
): string | null {
  switch (expr.kind) {
    case "prop":
      return expr.prop.includes("-")
        ? toCamelCase(expr.prop)
        : expr.prop;
    case "literal":
      return JSON.stringify(expr.value);
    case "channel": {
      const ch = ctx.channelByName.get(expr.channel);
      if (!ch) return null;
      if (expr.field === "value") return ch.name;
      if (expr.field === "defaultValue") {
        if (!ch.defaultValueProp) return null;
        return ch.defaultValueProp;
      }
      // Event-shaped channels skip unwrapping — the consumer's handler
      // receives the raw DOM event and is responsible for state updates.
      if (ch.callbackKind === "event") {
        return ch.changeHandlerProp;
      }
      const setter = `set${capitalize(ch.name)}`;
      const isChangeEvent = attr === "onChange";
      // onChange synthesis: read e.target.{checked,value} based on valueType.
      if (isChangeEvent) {
        if (ch.valueType === "boolean") {
          return `(e) => ${setter}(e.target.checked)`;
        }
        if (ch.valueType === "number") {
          return `(e) => ${setter}(Number(e.target.value))`;
        }
        if (ch.valueType === "string" || ch.valueType === undefined) {
          return `(e) => ${setter}(e.target.value)`;
        }
        return `(e) => ${setter}(e as unknown as ${ch.valueType})`;
      }
      // Non-change events (onClick, onPointerDown, etc.): for boolean
      // channels, emit a toggle using the current closure value. The
      // generated hook setter is typed `(next: T) => void` (no updater
      // form), so we read the channel value from scope. For other
      // valueTypes, the click event carries no payload — pass the current
      // channel value through (no-op write; uncommon).
      if (ch.valueType === "boolean") {
        return `() => ${setter}(!${ch.name})`;
      }
      return `() => ${setter}(${ch.name})`;
    }
  }
}

function toCamelCase(name: string): string {
  return name.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
}

const VOID_HTML_ELEMENTS = new Set([
  "area", "base", "br", "col", "embed", "hr", "img",
  "input", "link", "meta", "source", "track", "wbr",
]);

/**
 * ARIA attributes whose React type is `Booleanish` (`boolean | "true" | "false"`).
 * Channel-bound or comparison-derived values do not satisfy that union
 * automatically, so the emitter wraps the rendered value in `String(...)`
 * — `String(true) === "true"`, which Booleanish accepts.
 */
const ARIA_BOOLEAN_ATTRS = new Set([
  "aria-selected",
  "aria-pressed",
  "aria-expanded",
  "aria-checked",
  "aria-busy",
  "aria-disabled",
  "aria-hidden",
  "aria-readonly",
  "aria-required",
  "aria-modal",
  "aria-multiselectable",
  "aria-haspopup",
  "aria-invalid",
  "aria-current",
  "aria-grabbed",
]);

const NUMERIC_JSX_ATTRS = new Set([
  "tabIndex", "maxLength", "minLength", "size", "rowSpan", "colSpan",
  "min", "max", "step", "rows", "cols", "span", "start",
  "aria-valuemin", "aria-valuemax", "aria-valuenow",
  "aria-level", "aria-posinset", "aria-setsize",
  "aria-colcount", "aria-colindex", "aria-colspan",
  "aria-rowcount", "aria-rowindex", "aria-rowspan",
]);
