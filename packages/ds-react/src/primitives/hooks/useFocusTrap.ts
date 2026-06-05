import { type RefObject, useEffect, useRef } from "react";

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
  '[contenteditable="true"]',
].join(",");

export interface UseFocusTrapOptions {
  /** When false, the trap is inert; existing focus is left untouched. */
  active: boolean;
  /** Element receiving initial focus (defaults to first focusable in container). */
  initialFocusRef?: RefObject<HTMLElement | null>;
  /** Element to restore focus to when the trap deactivates. Defaults to whatever was active before. */
  returnFocusRef?: RefObject<HTMLElement | null>;
}

/**
 * Trap focus inside `containerRef` while `active` is true.
 *
 * - Tab cycles forward; Shift+Tab cycles backward.
 * - Initial focus goes to `initialFocusRef`, the first focusable child, or
 *   the container itself.
 * - On deactivation, focus returns to `returnFocusRef` or whichever element
 *   was active before the trap engaged.
 */
export function useFocusTrap<T extends HTMLElement>(
  containerRef: RefObject<T | null>,
  options: UseFocusTrapOptions,
): void {
  const { active, initialFocusRef, returnFocusRef } = options;
  const previouslyFocused = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!active) return;
    const container = containerRef.current;
    if (!container) return;

    previouslyFocused.current =
      (document.activeElement as HTMLElement | null) ?? null;

    const restoreTo = returnFocusRef?.current ?? previouslyFocused.current;
    const focusables = () =>
      Array.from(
        container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
      );

    const initial = initialFocusRef?.current ?? focusables()[0] ?? container;
    if (initial && typeof initial.focus === "function") {
      initial.focus({ preventScroll: true });
    }

    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const candidates = focusables();
      if (candidates.length === 0) {
        e.preventDefault();
        container.focus({ preventScroll: true });
        return;
      }
      const first = candidates[0];
      const last = candidates[candidates.length - 1];
      const active = document.activeElement as HTMLElement | null;
      if (e.shiftKey && active === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };

    container.addEventListener("keydown", onKey);
    return () => {
      container.removeEventListener("keydown", onKey);
      if (restoreTo && typeof restoreTo.focus === "function") {
        restoreTo.focus({ preventScroll: true });
      }
    };
  }, [active, containerRef, initialFocusRef, returnFocusRef]);
}
