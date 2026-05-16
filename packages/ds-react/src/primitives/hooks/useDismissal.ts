import { type RefObject, useEffect } from "react";

export interface UseDismissalOptions {
  /** Whether the dismissable surface is currently open. */
  open: boolean;
  /** Called when a dismissal trigger fires. */
  onDismiss: () => void;
  /** Close on Escape key (default: true). */
  closeOnEscape?: boolean;
  /** Close on click/tap outside the panel (default: false; opt-in per call). */
  closeOnOutsideClick?: boolean;
  /** Element that bounds "inside"; outside clicks here do not dismiss. */
  panelRef?: RefObject<HTMLElement | null>;
  /** Optional anchor element; clicks here also do not dismiss. */
  anchorRef?: RefObject<HTMLElement | null>;
}

/**
 * Generic dismissal primitive used by overlay components (Modal, Dropdown,
 * Popover, Tooltip, etc.). Listens for Escape and/or outside-pointer events
 * while `open` is true, and calls `onDismiss` when triggered. Consumer decides
 * what happens on dismissal (typically: close the surface, restore focus).
 *
 * Decoupled from controlled-state so it can be composed with any open/close
 * machine — including `useAnchorToggle` (anchor-panel pattern) and standalone
 * `useControllableState` (modal pattern).
 */
export function useDismissal(options: UseDismissalOptions): void {
  const {
    open,
    onDismiss,
    closeOnEscape = true,
    closeOnOutsideClick = false,
    panelRef,
    anchorRef,
  } = options;

  useEffect(() => {
    if (!open || !closeOnEscape) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onDismiss();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, closeOnEscape, onDismiss]);

  useEffect(() => {
    if (!open || !closeOnOutsideClick) return;
    const onPointer = (e: MouseEvent | PointerEvent) => {
      const target = e.target as Node | null;
      if (!target) return;
      if (panelRef?.current && panelRef.current.contains(target)) return;
      if (anchorRef?.current && anchorRef.current.contains(target)) return;
      onDismiss();
    };
    document.addEventListener("mousedown", onPointer);
    return () => document.removeEventListener("mousedown", onPointer);
  }, [open, closeOnOutsideClick, onDismiss, panelRef, anchorRef]);
}
