import { createElement, type ReactNode } from "react";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

type HostProps = Record<string, unknown> & { children?: ReactNode };

function host(name: string) {
  return function HostComponent({ children, ...props }: HostProps) {
    return createElement(name, props, children);
  };
}

export const View = host("View");
export const Text = host("Text");
export const Pressable = host("Pressable");
export const TextInput = host("TextInput");
export const Image = host("Image");
export const Switch = host("Switch");
export const GestureResponderEvent = undefined;

export const StyleSheet = {
  create<T extends Record<string, unknown>>(styles: T): T {
    return styles;
  },
};
