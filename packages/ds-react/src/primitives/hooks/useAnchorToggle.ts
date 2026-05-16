import { type RefObject, useCallback, useEffect, useRef } from "react";
import { useControllableState } from "./useControllableState";

export interface UseAnchorToggleOptions {
  /** Controlled open state. When undefined, the hook owns it. */
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Close on Escape key (default: true). */
  closeOnEscape?: boolean;
  /** Close on click/tap outside the panel (and outside the anchor, if provided). */
  closeOnOutsideClick?: boolean;
}

export interface UseAnchorToggleResult<P extends HTMLElement, A extends HTMLElement> {
  open: boolean;
  setOpen: (next: boolean) => void;
  panelRef: RefObject<P | null>;
  anchorRef: RefObject<A | null>;
  /** Toggle handler suitable for binding to the anchor element's onClick. */
  toggle: () => void;
  /** Convenience: stable open/close pair. */
  openPanel: () => void;
  closePanel: () => void;
}

/**
 * Compose the controlled/uncontrolled open state with the
 * click-outside + Escape-to-dismiss listeners that every overlay
 * component (Dropdown, Menu, Popover, ColorPicker, DatePicker, Tooltip,
 * SelectMenu, QuickSearch, Combobox) repeats verbatim.
 *
 * Bind `panelRef` to the floating element and (optionally) `anchorRef`
 * to the trigger so a click on the trigger doesn't immediately close
 * the panel that just opened.
 */
export function useAnchorToggle<
  P extends HTMLElement = HTMLElement,
  A extends HTMLElement = HTMLElement,
>(options: UseAnchorToggleOptions = {}): UseAnchorToggleResult<P, A> {
  const {
    open: controlled,
    defaultOpen = false,
    onOpenChange,
    closeOnEscape = true,
    closeOnOutsideClick = true,
  } = options;

  const [open, setOpenState] = useControllableState<boolean>({
    controlled,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  });

  const panelRef = useRef<P | null>(null);
  const anchorRef = useRef<A | null>(null);

  const setOpen = useCallback((next: boolean) => setOpenState(next), [setOpenState]);
  const openPanel = useCallback(() => setOpenState(true), [setOpenState]);
  const closePanel = useCallback(() => setOpenState(false), [setOpenState]);
  const toggle = useCallback(() => setOpenState((p) => !p), [setOpenState]);

  useEffect(() => {
    if (!open || !closeOnEscape) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenState(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, closeOnEscape, setOpenState]);

  useEffect(() => {
    if (!open || !closeOnOutsideClick) return;
    const onPointer = (e: MouseEvent | PointerEvent) => {
      const target = e.target as Node | null;
      if (!target) return;
      if (panelRef.current && panelRef.current.contains(target)) return;
      if (anchorRef.current && anchorRef.current.contains(target)) return;
      setOpenState(false);
    };
    document.addEventListener("mousedown", onPointer);
    return () => document.removeEventListener("mousedown", onPointer);
  }, [open, closeOnOutsideClick, setOpenState]);

  return { open, setOpen, panelRef, anchorRef, toggle, openPanel, closePanel };
}
