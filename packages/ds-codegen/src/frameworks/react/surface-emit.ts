/**
 * React emitter — Anchored Presence Surface path.
 *
 * Activated for any `ir.surface` whose kind is in the anchored-
 * presence family (per shared semantics policy). Emits the compound
 * API:
 *
 *   <Surface>
 *     <Surface.Trigger>...</Surface.Trigger>
 *     <Surface.Content>...</Surface.Content>
 *   </Surface>
 *
 * The emitter is data-driven on the AnchoredSurfacePolicy returned
 * by `resolveAnchoredSurfacePolicy` — Tooltip and Popover share the
 * same code path; only the contract differs (dismissal modes, anchor
 * relation, content role).
 *
 * Bypasses the legacy `ir.dom` and compound-state-container paths
 * entirely — this is forward-facing replacement, not augmentation.
 */
import type { ComponentIR, SurfaceIR } from "../../ir.js";
import {
  isAnchoredPresenceKind,
  resolveAnchoredSurfacePolicy,
  type AnchoredSurfacePolicy,
  type PublicDismissalProp,
} from "../../semantics.js";

export function isSurfaceComponent(ir: ComponentIR): boolean {
  // Kind-aware like svelte/angular/lit: non-anchored kinds (dialog, sheet,
  // toast, …) may declare a surface taxonomy block for fact-tracking while
  // keeping the existing generic/hook emission path on web.
  return ir.surface !== undefined && isAnchoredPresenceKind(ir.surface.kind);
}

export function generateReactSurfaceComponentSource(ir: ComponentIR): string {
  const surface = ir.surface;
  if (!surface) {
    throw new Error(
      `generateReactSurfaceComponentSource called on ${ir.name} without ir.surface`,
    );
  }
  if (!isAnchoredPresenceKind(surface.kind)) {
    throw new Error(
      `React surface emitter expected an anchored-presence kind (got "${surface.kind}"). ` +
        `Add the kind to ANCHORED_PRESENCE_KINDS in semantics.ts when its substrate is ready.`,
    );
  }
  const policy = resolveAnchoredSurfacePolicy(surface);
  return emitAnchoredSurfaceSource(ir, surface, policy);
}

function emitAnchoredSurfaceSource(
  ir: ComponentIR,
  surface: SurfaceIR,
  policy: AnchoredSurfacePolicy,
): string {
  const name = ir.name;
  const cssPrefix = ir.cssPrefix;
  const placementValues: string[] | undefined = ir.variants["placement"];
  const placementType = placementValues ? `${name}Placement` : "string";

  // Surface lookups
  const openTriggersList = JSON.stringify(surface.openTriggers);
  const anchorRelation = surface.anchor?.relation ?? "describedby";
  const ariaAttrForAnchor =
    anchorRelation === "describedby"
      ? "aria-describedby"
      : anchorRelation === "controls-expanded"
        ? "aria-controls"
        : anchorRelation === "labelledby"
          ? "aria-labelledby"
          : null;

  const placementTypeAlias = placementValues
    ? `export type ${placementType} = ${placementValues.map((v) => `"${v}"`).join(" | ")};\n`
    : "";

  // Positioning + portal are driven by the contract:
  //   - surface.positioning.strategy === "anchored" → emit
  //     useAnchoredPosition wiring on Content and apply position: fixed
  //   - behavior.portal.enabled === true            → wrap Content in
  //     createPortal targeting document.body
  // Both flags are independent: a contract can opt into anchored
  // positioning without portalling (the content stays in-tree but uses
  // fixed positioning), though Popover and Tooltip enable both.
  const positioningEnabled = surface.positioning?.strategy === "anchored";
  const portalEnabled = ir.behavior.portal?.enabled === true;
  const collision = surface.positioning?.collision ?? "flip-shift";

  const reactImports = [
    `type ReactNode`,
    `type HTMLAttributes`,
    `type ButtonHTMLAttributes`,
    `type ReactElement`,
    `type Ref`,
    `Children`,
    `cloneElement`,
    `createContext`,
    `isValidElement`,
    `useContext`,
  ];
  const extraImportLines: string[] = [];
  if (portalEnabled) {
    // createPortal lives in react-dom, not react itself.
    extraImportLines.push(`import { createPortal } from "react-dom";`);
  }
  if (positioningEnabled) {
    extraImportLines.push(
      `import { useAnchoredPosition } from "../../primitives/surfaces/useAnchoredPosition";`,
    );
  }

  const imports = [
    `import {`,
    ...reactImports.map((line) => `  ${line},`),
    `} from "react";`,
    `import { useAnchoredSurface, type SurfaceTriggerHandlers } from "../../primitives/surfaces/useAnchoredSurface";`,
    `import { composeRefs, composeEventHandlers } from "../../primitives/surfaces/compose";`,
    ...extraImportLines,
    `import "./${name}.css";`,
  ].join("\n");

  // Policy-derived facts. The default content role and the public
  // dismissal-prop spec list now live in shared semantics
  // (AnchoredSurfacePolicy) — see docs/codegen-authority.md.
  const contentRole = policy.defaultContentRole;
  const dismissalProps = policy.publicDismissalProps.filter(
    (spec): spec is PublicDismissalProp & { prop: string } => spec.prop !== null,
  );

  // Stable types
  const typesBody = placementTypeAlias.trimEnd();

  // Compound props
  const closeOnPropLines = dismissalProps
    .map((spec) => `  ${spec.prop}?: boolean;`)
    .join("\n");
  const propsBody = `export interface ${name}Props {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  placement?: ${placementType};
  disabled?: boolean;
${closeOnPropLines}
  className?: string;
  "data-testid"?: string;
  children?: ReactNode;
}

export interface ${name}TriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * Adopt the consumer's single child element as the trigger host
   * instead of rendering a default \`<button>\`. The adopted element
   * receives the merged ref, ARIA props, data marker, and surface
   * event handlers. Consumer event handlers run first; if they call
   * \`event.preventDefault()\` the surface handler is suppressed.
   */
  asChild?: boolean;
  children?: ReactNode;
}

export interface ${name}ContentProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
}`;

  // The compound context exposes the surface state to Trigger/Content.
  // Positioning-aware contexts also carry the live anchor/content nodes
  // and the resolved placement so Content can call useAnchoredPosition
  // without re-implementing the registration plumbing.
  const positioningContextLines = positioningEnabled
    ? `\n  anchorEl: HTMLElement | null;\n  contentEl: HTMLElement | null;\n  placement: ${placementType} | undefined;`
    : "";
  const contextBody = `interface ${name}ContextValue {
  open: boolean;
  contentId: string;
  ariaAttrForAnchor: ${ariaAttrForAnchor ? `"${ariaAttrForAnchor}"` : "null"};
  registerAnchor: (node: HTMLElement | null) => void;
  registerAnchorRefOnly: (node: HTMLElement | null) => void;
  registerContent: (node: HTMLElement | null) => void;
  getTriggerHandlers: () => SurfaceTriggerHandlers;${positioningContextLines}
}

const ${name}Context = createContext<${name}ContextValue | null>(null);
${name}Context.displayName = "${name}Context";

function use${name}Context(): ${name}ContextValue {
  const value = useContext(${name}Context);
  if (value === null) {
    throw new Error(
      "${name} compound component used outside of <${name}> provider.",
    );
  }
  return value;
}`;

  // Root component
  const destructuredCloseProps = dismissalProps
    .map((spec) => `  ${spec.prop} = ${spec.defaultValue},`)
    .join("\n");

  // Build the runtime dismissal array literal. Each declared
  // dismissal mode contributes one entry: gated by its closeOn* prop
  // when the policy says the mode is public + runtime-toggleable,
  // otherwise inlined as a string literal.
  const dismissalEntries = policy.publicDismissalProps
    .map((spec) =>
      spec.prop && spec.runtimeToggleable
        ? `${spec.prop} && "${spec.mode}"`
        : `"${spec.mode}"`,
    );
  const dismissalTypeUnion = policy.publicDismissalProps
    .map((spec) => `"${spec.mode}"`)
    .join(" | ");

  const rootBody = `export function ${name}({
  open,
  defaultOpen,
  onOpenChange,
  placement,
  disabled,
  className,
${destructuredCloseProps}
  "data-testid": testId,
  children,
}: ${name}Props) {
  const dismissal = [
    ${dismissalEntries.join(",\n    ")},
  ].filter(Boolean) as readonly (${dismissalTypeUnion})[];

  const surface = useAnchoredSurface({
    open,
    defaultOpen,
    onOpenChange,
    openTriggers: ${openTriggersList},
    dismissal,
    anchorRelation: "${anchorRelation}",
    disabled,
  });

  const classNames = [
    "${cssPrefix}",
    placement && \`${cssPrefix}--\${placement}\`,
    disabled && "${cssPrefix}--disabled",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <${name}Context.Provider
      value={{
        open: surface.open,
        contentId: surface.contentId,
        ariaAttrForAnchor: ${ariaAttrForAnchor ? `"${ariaAttrForAnchor}"` : "null"},
        registerAnchor: surface.registerAnchor,
        registerAnchorRefOnly: surface.registerAnchorRefOnly,
        registerContent: surface.registerContent,
        getTriggerHandlers: surface.getTriggerHandlers,${positioningEnabled ? `\n        anchorEl: surface.anchorEl,\n        contentEl: surface.contentEl,\n        placement,` : ""}
      }}
    >
      <span className={classNames} data-testid={testId}>
        {children}
      </span>
    </${name}Context.Provider>
  );
}`;

  // Trigger subcomponent (default host: <button>). aria wiring is
  // emitted to match the surface's anchorRelation exactly — dead
  // branches for other relations are deliberately omitted to keep tsc
  // narrowing clean.
  const triggerAriaProps = (() => {
    if (anchorRelation === "describedby") {
      // aria-describedby on the anchor references the content id only
      // when the surface is actually open; otherwise screen readers
      // would announce a non-rendered description.
      return `  const ariaProps = ctx.open
    ? { "aria-describedby": ctx.contentId }
    : {};`;
    }
    if (anchorRelation === "controls-expanded") {
      return `  const ariaProps = {
    "aria-controls": ctx.contentId,
    "aria-expanded": ctx.open,
  };`;
    }
    if (anchorRelation === "labelledby") {
      return `  const ariaProps = ctx.open
    ? { "aria-labelledby": ctx.contentId }
    : {};`;
    }
    return `  const ariaProps = {};`;
  })();

  const triggerBody = `${name}.Trigger = function ${name}Trigger({
  asChild,
  children,
  ...rest
}: ${name}TriggerProps) {
  const ctx = use${name}Context();
${triggerAriaProps}

  if (asChild) {
    return adoptChildAsTrigger({
      child: children,
      ctx,
      ariaProps,
      rest,
    });
  }

  return (
    <button
      type="button"
      ref={(node) => ctx.registerAnchor(node)}
      data-${cssPrefix}-trigger=""
      {...ariaProps}
      {...rest}
    >
      {children}
    </button>
  );
};

interface AdoptChildArgs {
  child: ReactNode;
  ctx: ${name}ContextValue;
  ariaProps: Record<string, unknown>;
  rest: Omit<${name}TriggerProps, "asChild" | "children">;
}

function adoptChildAsTrigger({ child, ctx, ariaProps, rest }: AdoptChildArgs) {
  // Validate exactly one valid React element child. React.Children.only
  // throws when count !== 1 (handles 0 and >1 cases). isValidElement
  // catches strings/numbers/fragments that slipped past Children.only.
  const only = Children.only(child);
  if (!isValidElement(only)) {
    throw new Error(
      "${name}.Trigger asChild requires its child to be a valid React element. " +
        "Strings, numbers, and fragments are not adoptable as a host element.",
    );
  }
  const element = only as ReactElement<Record<string, unknown>> & {
    ref?: Ref<HTMLElement>;
  };
  const childProps = element.props ?? {};
  const childRef = element.ref;

  const handlers = ctx.getTriggerHandlers();
  const mergedHandlers: Record<string, unknown> = {};
  for (const key of [
    "onPointerEnter",
    "onPointerLeave",
    "onFocus",
    "onBlur",
    "onClick",
  ] as const) {
    const surfaceHandler = handlers[key];
    if (!surfaceHandler) continue;
    const consumerHandler = childProps[key] as
      | ((event: never) => void)
      | undefined;
    mergedHandlers[key] = composeEventHandlers(
      consumerHandler as never,
      surfaceHandler as never,
    );
  }

  // ARIA precedence: consumer wins. The surface only supplies the
  // anchor-relation attribute (e.g. aria-describedby); other aria-*
  // belong to the consumer's element.
  const mergedAria: Record<string, unknown> = { ...ariaProps };
  for (const k of Object.keys(childProps)) {
    if (k.startsWith("aria-") && childProps[k] !== undefined) {
      mergedAria[k] = childProps[k];
    }
  }

  // Composition order: start from rest (consumer-passed-to-Trigger),
  // then child's own props (child wins), then merged aria/handlers,
  // then the data marker, then the composed ref last.
  const composedClassName = [rest.className, childProps.className as string | undefined]
    .filter(Boolean)
    .join(" ") || undefined;

  return cloneElement(element, {
    ...rest,
    ...childProps,
    ...mergedAria,
    ...mergedHandlers,
    className: composedClassName,
    "data-${cssPrefix}-trigger": "",
    ref: composeRefs(childRef, ctx.registerAnchorRefOnly as Ref<HTMLElement>),
  });
}`;

  // Content subcomponent. For surfaces that declare a content role
  // (Tooltip emits role="tooltip"), the role is emitted as an
  // attribute. Popover-family surfaces omit the role — the contract
  // anchor.relation already supplies the semantic relationship via
  // aria-controls/aria-expanded on the trigger, and forcing a
  // role="dialog" would imply modal semantics that Popover does not
  // satisfy. Consumers wanting an explicit role can pass one via
  // `...rest`.
  const contentRoleAttr =
    contentRole !== null ? `\n      role="${contentRole}"` : "";

  // Positioning + portal wiring on the Content subcomponent.
  // - Positioning: call useAnchoredPosition with the anchor + content
  //   nodes already tracked by the surface. The hook returns
  //   { top, left, ready }; we apply fixed-position style on the div
  //   and hide it (visibility) until first measurement to avoid a
  //   flash at (0, 0). Passes collision strategy from the contract.
  // - Portal: when enabled, wrap the div in createPortal(node, document.body).
  //   Guard against SSR by checking typeof document; falls back to in-place
  //   render server-side, which positioning hooks will correct on hydration.
  const positioningHookCall = positioningEnabled
    ? `\n  const position = useAnchoredPosition({
    anchor: ctx.anchorEl,
    content: ctx.contentEl,
    open: ctx.open,
    placement: ctx.placement ?? "auto",
    collision: "${collision}",
  });`
    : "";
  // Consumer style is spread first so our computed positioning wins.
  // Destructure rest.style out into a named local so consumers can still
  // pass style through (it merges with our computed top/left, with our
  // values taking precedence). The remaining rest spread (sans style)
  // attaches everything else verbatim.
  const positioningStyleProp = positioningEnabled
    ? `\n      style={{
        ...consumerStyle,
        position: "fixed",
        top: \`\${position.top}px\`,
        left: \`\${position.left}px\`,
        visibility: position.ready ? "visible" : "hidden",
      }}
      data-placement={position.placement}`
    : "";
  const restSpread = positioningEnabled
    ? "{...restWithoutStyle}"
    : "{...rest}";
  const restDestructure = positioningEnabled
    ? `\n  const { style: consumerStyle, ...restWithoutStyle } = rest;`
    : "";
  const contentDiv = `<div
      ref={(node) => ctx.registerContent(node)}
      id={ctx.contentId}${contentRoleAttr}${positioningStyleProp}
      data-${cssPrefix}-content=""
      ${restSpread}
    >
      {children}
    </div>`;
  const portalWrappedContent = portalEnabled
    ? `typeof document !== "undefined"
    ? createPortal(
        ${contentDiv.split("\n").map((line) => `    ${line}`).join("\n").trim()},
        document.body,
      )
    : (
        ${contentDiv.split("\n").map((line) => `    ${line}`).join("\n").trim()}
      )`
    : `(\n    ${contentDiv}\n  )`;

  const contentBody = `${name}.Content = function ${name}Content({
  children,
  ...rest
}: ${name}ContentProps) {
  const ctx = use${name}Context();${positioningHookCall}${restDestructure}
  if (!ctx.open) return null;
  return ${portalWrappedContent};
};`;

  return [
    `// @generated:start imports`,
    imports,
    `// @generated:end`,
    ``,
    `// @custom:start imports`,
    ``,
    `// @custom:end`,
    ``,
    `// @generated:start types`,
    typesBody,
    `// @generated:end`,
    ``,
    `// @custom:start types`,
    ``,
    `// @custom:end`,
    ``,
    `// @generated:start props`,
    propsBody,
    `// @generated:end`,
    ``,
    `// @generated:start context`,
    contextBody,
    `// @generated:end`,
    ``,
    `// @generated:start component`,
    rootBody,
    ``,
    triggerBody,
    ``,
    contentBody,
    `// @generated:end`,
    ``,
    `// @custom:start trailing`,
    ``,
    `// @custom:end`,
    ``,
  ].join("\n");
}
