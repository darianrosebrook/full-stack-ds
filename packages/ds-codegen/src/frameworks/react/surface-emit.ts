/**
 * React emitter — Anchored Presence Surface path.
 *
 * Activated when `ir.surface?.kind === "tooltip"` (and, after F-3, other
 * anchored kinds). Emits the compound API:
 *
 *   <Tooltip>
 *     <Tooltip.Trigger>...</Tooltip.Trigger>
 *     <Tooltip.Content>...</Tooltip.Content>
 *   </Tooltip>
 *
 * Bypasses the legacy `ir.dom` and compound-state-container paths
 * entirely — this is forward-facing replacement, not augmentation.
 */
import type { ComponentIR, SurfaceIR } from "../../ir.js";

export function isSurfaceComponent(ir: ComponentIR): boolean {
  return ir.surface !== undefined;
}

export function generateReactSurfaceComponentSource(ir: ComponentIR): string {
  const surface = ir.surface;
  if (!surface) {
    throw new Error(
      `generateReactSurfaceComponentSource called on ${ir.name} without ir.surface`,
    );
  }
  if (surface.kind !== "tooltip") {
    throw new Error(
      `React surface emitter only supports kind "tooltip" in F-2A (got "${surface.kind}").`,
    );
  }
  return emitTooltipSource(ir, surface);
}

function emitTooltipSource(ir: ComponentIR, surface: SurfaceIR): string {
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

  const imports = [
    `import {`,
    `  type ReactNode,`,
    `  type HTMLAttributes,`,
    `  type ButtonHTMLAttributes,`,
    `  type ReactElement,`,
    `  type Ref,`,
    `  Children,`,
    `  cloneElement,`,
    `  createContext,`,
    `  isValidElement,`,
    `  useContext,`,
    `} from "react";`,
    `import { useAnchoredSurface, type SurfaceTriggerHandlers } from "../../primitives/surfaces/useAnchoredSurface";`,
    `import { composeRefs, composeEventHandlers } from "../../primitives/surfaces/compose";`,
    `import "./${name}.css";`,
  ].join("\n");

  const contentRole = surface.content?.part.details?.aria?.role ?? "tooltip";

  // Stable types
  const typesBody = placementTypeAlias.trimEnd();

  // Compound props
  const propsBody = `export interface ${name}Props {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  placement?: ${placementType};
  disabled?: boolean;
  closeOnEscape?: boolean;
  closeOnBlur?: boolean;
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
  const contextBody = `interface ${name}ContextValue {
  open: boolean;
  contentId: string;
  ariaAttrForAnchor: ${ariaAttrForAnchor ? `"${ariaAttrForAnchor}"` : "null"};
  registerAnchor: (node: HTMLElement | null) => void;
  registerAnchorRefOnly: (node: HTMLElement | null) => void;
  registerContent: (node: HTMLElement | null) => void;
  getTriggerHandlers: () => SurfaceTriggerHandlers;
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
  const rootBody = `export function ${name}({
  open,
  defaultOpen,
  onOpenChange,
  placement,
  disabled,
  className,
  closeOnEscape = true,
  closeOnBlur = true,
  "data-testid": testId,
  children,
}: ${name}Props) {
  const dismissal = [
    ${surface.dismissal.includes("escape") ? `closeOnEscape && "escape"` : `null`},
    ${surface.dismissal.includes("blur") ? `closeOnBlur && "blur"` : `null`},
    ${surface.dismissal.includes("pointer-leave") ? `"pointer-leave"` : `null`},
  ].filter(Boolean) as readonly ("escape" | "blur" | "pointer-leave")[];

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
        getTriggerHandlers: surface.getTriggerHandlers,
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

  // Content subcomponent (default host: <div role="${contentRole}">)
  const contentBody = `${name}.Content = function ${name}Content({
  children,
  ...rest
}: ${name}ContentProps) {
  const ctx = use${name}Context();
  if (!ctx.open) return null;
  return (
    <div
      ref={(node) => ctx.registerContent(node)}
      id={ctx.contentId}
      role="${contentRole}"
      data-${cssPrefix}-content=""
      {...rest}
    >
      {children}
    </div>
  );
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
