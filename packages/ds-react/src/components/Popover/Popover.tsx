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
import "./Popover.css";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
export type PopoverPlacement = "top" | "bottom" | "left" | "right" | "auto";
// @generated:end

// @custom:start types

// @custom:end

// @generated:start props
export interface PopoverProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  placement?: PopoverPlacement;
  disabled?: boolean;
  closeOnEscape?: boolean;
  closeOnOutsideClick?: boolean;
  closeOnBlur?: boolean;
  className?: string;
  "data-testid"?: string;
  children?: ReactNode;
}

export interface PopoverTriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {
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

export interface PopoverContentProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
}
// @generated:end

// @generated:start context
interface PopoverContextValue {
  open: boolean;
  contentId: string;
  ariaAttrForAnchor: "aria-controls";
  registerAnchor: (node: HTMLElement | null) => void;
  registerAnchorRefOnly: (node: HTMLElement | null) => void;
  registerContent: (node: HTMLElement | null) => void;
  getTriggerHandlers: () => SurfaceTriggerHandlers;
}

const PopoverContext = createContext<PopoverContextValue | null>(null);
PopoverContext.displayName = "PopoverContext";

function usePopoverContext(): PopoverContextValue {
  const value = useContext(PopoverContext);
  if (value === null) {
    throw new Error(
      "Popover compound component used outside of <Popover> provider.",
    );
  }
  return value;
}
// @generated:end

// @generated:start component
export function Popover({
  open,
  defaultOpen,
  onOpenChange,
  placement,
  disabled,
  className,
  closeOnEscape = true,
  closeOnOutsideClick = true,
  closeOnBlur = true,
  "data-testid": testId,
  children,
}: PopoverProps) {
  const dismissal = [
    closeOnEscape && "escape",
    closeOnOutsideClick && "outside-click",
    closeOnBlur && "blur",
  ].filter(Boolean) as readonly ("escape" | "outside-click" | "blur")[];

  const surface = useAnchoredSurface({
    open,
    defaultOpen,
    onOpenChange,
    openTriggers: ["click"],
    dismissal,
    anchorRelation: "controls-expanded",
    disabled,
  });

  const classNames = [
    "popover",
    placement && `popover--${placement}`,
    disabled && "popover--disabled",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <PopoverContext.Provider
      value={{
        open: surface.open,
        contentId: surface.contentId,
        ariaAttrForAnchor: "aria-controls",
        registerAnchor: surface.registerAnchor,
        registerAnchorRefOnly: surface.registerAnchorRefOnly,
        registerContent: surface.registerContent,
        getTriggerHandlers: surface.getTriggerHandlers,
      }}
    >
      <span className={classNames} data-testid={testId}>
        {children}
      </span>
    </PopoverContext.Provider>
  );
}

Popover.Trigger = function PopoverTrigger({
  asChild,
  children,
  ...rest
}: PopoverTriggerProps) {
  const ctx = usePopoverContext();
  const ariaProps = {
    "aria-controls": ctx.contentId,
    "aria-expanded": ctx.open,
  };

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
      data-popover-trigger=""
      {...ariaProps}
      {...rest}
    >
      {children}
    </button>
  );
};

interface AdoptChildArgs {
  child: ReactNode;
  ctx: PopoverContextValue;
  ariaProps: Record<string, unknown>;
  rest: Omit<PopoverTriggerProps, "asChild" | "children">;
}

function adoptChildAsTrigger({ child, ctx, ariaProps, rest }: AdoptChildArgs) {
  // Validate exactly one valid React element child. React.Children.only
  // throws when count !== 1 (handles 0 and >1 cases). isValidElement
  // catches strings/numbers/fragments that slipped past Children.only.
  const only = Children.only(child);
  if (!isValidElement(only)) {
    throw new Error(
      "Popover.Trigger asChild requires its child to be a valid React element. " +
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
    "data-popover-trigger": "",
    ref: composeRefs(childRef, ctx.registerAnchorRefOnly as Ref<HTMLElement>),
  });
}

Popover.Content = function PopoverContent({
  children,
  ...rest
}: PopoverContentProps) {
  const ctx = usePopoverContext();
  if (!ctx.open) return null;
  return (
    <div
      ref={(node) => ctx.registerContent(node)}
      id={ctx.contentId}
      data-popover-content=""
      {...rest}
    >
      {children}
    </div>
  );
};
// @generated:end

// @custom:start trailing

// @custom:end
