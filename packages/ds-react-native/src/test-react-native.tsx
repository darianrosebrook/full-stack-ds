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
export const Modal = host("Modal");
export const GestureResponderEvent = undefined;

type BackListener = () => boolean | null | undefined;
const backListeners = new Set<BackListener>();

/**
 * Records hardwareBackPress listeners. `press()` mirrors the platform: the
 * newest listener runs first and the first to return true consumes the press.
 * Returns whether any listener consumed it.
 */
export const BackHandler = {
  addEventListener(_event: "hardwareBackPress", listener: BackListener) {
    backListeners.add(listener);
    return { remove: () => backListeners.delete(listener) };
  },
  press(): boolean {
    return [...backListeners].reverse().some((listener) => listener() === true);
  },
  listenerCount(): number {
    return backListeners.size;
  },
};

export const StyleSheet = {
  create<T extends Record<string, unknown>>(styles: T): T {
    return styles;
  },
};
