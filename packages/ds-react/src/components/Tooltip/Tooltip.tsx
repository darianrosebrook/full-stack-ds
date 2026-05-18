// @generated:start imports
import {
  type ReactNode,
  type HTMLAttributes,
  type ButtonHTMLAttributes,
  type ReactElement,
  type Ref,
  Children,
  cloneElement,
  createContext,
  isValidElement,
  useContext,
} from "react";
import { useAnchoredSurface, type SurfaceTriggerHandlers } from "../../primitives/surfaces/useAnchoredSurface";
import { composeRefs, composeEventHandlers } from "../../primitives/surfaces/compose";
import "./Tooltip.css";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
export type TooltipPlacement = "top" | "bottom" | "left" | "right" | "auto";
// @generated:end

// @custom:start types

// @custom:end

// @generated:start props
export interface TooltipProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  placement?: TooltipPlacement;
  disabled?: boolean;
  closeOnEscape?: boolean;
  closeOnBlur?: boolean;
  className?: string;
  "data-testid"?: string;
  children?: ReactNode;
}

export interface TooltipTriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * Adopt the consumer's single child element as the trigger host
   * instead of rendering a default `<button>`. The adopted element
   * receives the merged ref, ARIA props, data marker, and surface
   * event handlers. Consumer event handlers run first; if they call
   * `event.preventDefault()` the surface handler is suppressed.
   */
  asChild?: boolean;
  children?: ReactNode;
}

export interface TooltipContentProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
}
// @generated:end

// @generated:start context
interface TooltipContextValue {
  open: boolean;
  contentId: string;
  ariaAttrForAnchor: "aria-describedby";
  registerAnchor: (node: HTMLElement | null) => void;
  registerAnchorRefOnly: (node: HTMLElement | null) => void;
  registerContent: (node: HTMLElement | null) => void;
  getTriggerHandlers: () => SurfaceTriggerHandlers;
}

const TooltipContext = createContext<TooltipContextValue | null>(null);
TooltipContext.displayName = "TooltipContext";

function useTooltipContext(): TooltipContextValue {
  const value = useContext(TooltipContext);
  if (value === null) {
    throw new Error(
      "Tooltip compound component used outside of <Tooltip> provider.",
    );
  }
  return value;
}
// @generated:end

// @generated:start component
export function Tooltip({
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
}: TooltipProps) {
  const dismissal = [
    closeOnEscape && "escape",
    closeOnBlur && "blur",
    "pointer-leave",
  ].filter(Boolean) as readonly ("escape" | "blur" | "pointer-leave")[];

  const surface = useAnchoredSurface({
    open,
    defaultOpen,
    onOpenChange,
    openTriggers: ["hover","focus"],
    dismissal,
    anchorRelation: "describedby",
    disabled,
  });

  const classNames = [
    "tooltip",
    placement && `tooltip--${placement}`,
    disabled && "tooltip--disabled",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <TooltipContext.Provider
      value={{
        open: surface.open,
        contentId: surface.contentId,
        ariaAttrForAnchor: "aria-describedby",
        registerAnchor: surface.registerAnchor,
        registerAnchorRefOnly: surface.registerAnchorRefOnly,
        registerContent: surface.registerContent,
        getTriggerHandlers: surface.getTriggerHandlers,
      }}
    >
      <span className={classNames} data-testid={testId}>
        {children}
      </span>
    </TooltipContext.Provider>
  );
}

Tooltip.Trigger = function TooltipTrigger({
  asChild,
  children,
  ...rest
}: TooltipTriggerProps) {
  const ctx = useTooltipContext();
  const ariaProps = ctx.open
    ? { "aria-describedby": ctx.contentId }
    : {};

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
      data-tooltip-trigger=""
      {...ariaProps}
      {...rest}
    >
      {children}
    </button>
  );
};

interface AdoptChildArgs {
  child: ReactNode;
  ctx: TooltipContextValue;
  ariaProps: Record<string, unknown>;
  rest: Omit<TooltipTriggerProps, "asChild" | "children">;
}

function adoptChildAsTrigger({ child, ctx, ariaProps, rest }: AdoptChildArgs) {
  // Validate exactly one valid React element child. React.Children.only
  // throws when count !== 1 (handles 0 and >1 cases). isValidElement
  // catches strings/numbers/fragments that slipped past Children.only.
  const only = Children.only(child);
  if (!isValidElement(only)) {
    throw new Error(
      "Tooltip.Trigger asChild requires its child to be a valid React element. " +
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
    "data-tooltip-trigger": "",
    ref: composeRefs(childRef, ctx.registerAnchorRefOnly as Ref<HTMLElement>),
  });
}

Tooltip.Content = function TooltipContent({
  children,
  ...rest
}: TooltipContentProps) {
  const ctx = useTooltipContext();
  if (!ctx.open) return null;
  return (
    <div
      ref={(node) => ctx.registerContent(node)}
      id={ctx.contentId}
      role="tooltip"
      data-tooltip-content=""
      {...rest}
    >
      {children}
    </div>
  );
};
// @generated:end

// @custom:start trailing

// @custom:end
