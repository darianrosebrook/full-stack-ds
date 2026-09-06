import { Children, Fragment, cloneElement, createElement, isValidElement, type ElementType, type HTMLAttributes, type MouseEvent, type ReactElement, type ReactNode, type Ref } from "react";
import { composeRefs, composeEventHandlers } from "./surfaces/compose";
import { canActivateInteraction } from "./interaction";

export interface InteractionHostProps extends HTMLAttributes<HTMLElement> {
  as?: ElementType;
  asChild?: boolean;
  children?: ReactNode;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  ref?: Ref<HTMLElement>;
  onActivate?: (event: MouseEvent<HTMLElement>) => void;
}

/** Adopt a single host while preserving each binding's handlers, refs and
 * descriptive relationships. State-bearing ARIA comes from the binding. */
export function bindInteractionHost(child: ReactNode, ...bindingGroups: Array<Record<string, unknown>>): ReactElement {
  const children = Children.toArray(child);
  if (children.length !== 1) throw new Error("InteractionHost asChild requires exactly one child.");
  const only = Children.only(children[0]);
  if (!isValidElement(only) || only.type === Fragment) {
    throw new Error("InteractionHost asChild requires one element that forwards its props and ref to a host.");
  }
  const element = only as ReactElement<Record<string, unknown>>;
  const own = element.props;
  let merged = { ...own };
  for (const bindings of bindingGroups) {
    const own = merged;
    merged = { ...own, ...bindings };
    for (const key of new Set([...Object.keys(own), ...Object.keys(bindings)])) {
      if (/^on[A-Z]/.test(key) && typeof own[key] === "function" && typeof bindings[key] === "function") {
        merged[key] = composeEventHandlers(own[key] as (event: MouseEvent<HTMLElement>) => void, bindings[key] as (event: MouseEvent<HTMLElement>) => void);
      }
    }
    for (const key of ["aria-describedby", "aria-labelledby"]) {
      const tokens = [own[key], bindings[key]].filter(value => typeof value === "string").join(" ").split(/\s+/).filter(Boolean);
      if (tokens.length) merged[key] = [...new Set(tokens)].join(" ");
    }
    if (own.disabled || bindings.disabled) merged.disabled = true;
    if (own["aria-disabled"] === true || own["aria-disabled"] === "true" || bindings["aria-disabled"] === true || bindings["aria-disabled"] === "true") merged["aria-disabled"] = true;
    merged.className = [own.className, bindings.className].filter(Boolean).join(" ") || undefined;
    merged.style = { ...(own.style as object), ...(bindings.style as object) };
    merged.ref = composeRefs(own.ref as Ref<HTMLElement>, bindings.ref as Ref<HTMLElement>);
  }
  return cloneElement(element, merged);
}

/** Default and adopted hosts execute the same activation path. */
export function InteractionHost({ as: tag = "button", asChild = false, children, onActivate, onClick, ...props }: InteractionHostProps): ReactElement {
  const bindings = { ...props, onClick: composeEventHandlers(onClick, event => {
    if (canActivateInteraction(event)) onActivate?.(event);
  }) };
  return asChild ? bindInteractionHost(children, bindings) : createElement(tag, { ...(tag === "button" ? { type: "button" } : {}), ...bindings }, children);
}
