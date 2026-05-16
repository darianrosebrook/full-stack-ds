import {
  createElement,
  type ElementType,
  type ComponentPropsWithoutRef,
  type ReactNode,
  type Ref,
} from "react";
import "./stack.css";

type StackVariant = "vertical" | "horizontal";

type StackOwnProps<T extends ElementType = "div"> = {
  as?: T;
  variant?: StackVariant;
  ref?: Ref<Element>;
  children?: ReactNode;
};

export type StackProps<T extends ElementType = "div"> = StackOwnProps<T> &
  Omit<ComponentPropsWithoutRef<T>, keyof StackOwnProps<T>>;

export function Stack<T extends ElementType = "div">({
  as,
  variant = "vertical",
  className,
  ref,
  ...rest
}: StackProps<T>) {
  const Component = as || "div";
  const classNames = ["stack", `stack--${variant}`, className]
    .filter(Boolean)
    .join(" ");

  return createElement(Component, { ref, className: classNames, ...rest });
}
