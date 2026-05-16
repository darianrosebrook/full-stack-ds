import { onBeforeUnmount, watchEffect, type Ref } from "vue";

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
  active: Ref<boolean>;
  initialFocusRef?: Ref<HTMLElement | null>;
  returnFocusRef?: Ref<HTMLElement | null>;
}

/**
 * Trap focus inside `containerRef` while `options.active` is true. Tab
 * cycles forward, Shift+Tab cycles backward; on deactivation focus
 * returns to `returnFocusRef` or the previously focused element.
 */
export function useFocusTrap(
  containerRef: Ref<HTMLElement | null>,
  options: UseFocusTrapOptions,
): void {
  let previouslyFocused: HTMLElement | null = null;

  function onKey(e: KeyboardEvent): void {
    if (e.key !== "Tab") return;
    const container = containerRef.value;
    if (!container) return;
    const focusables = Array.from(
      container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
    );
    if (focusables.length === 0) {
      e.preventDefault();
      container.focus({ preventScroll: true });
      return;
    }
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    const active = document.activeElement as HTMLElement | null;
    if (e.shiftKey && active === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && active === last) {
      e.preventDefault();
      first.focus();
    }
  }

  watchEffect((onCleanup) => {
    if (!options.active.value) return;
    const container = containerRef.value;
    if (!container) return;

    previouslyFocused = (document.activeElement as HTMLElement | null) ?? null;
    const initial =
      options.initialFocusRef?.value ??
      container.querySelector<HTMLElement>(FOCUSABLE_SELECTOR) ??
      container;
    if (initial && typeof initial.focus === "function") {
      initial.focus({ preventScroll: true });
    }
    container.addEventListener("keydown", onKey);
    onCleanup(() => {
      container.removeEventListener("keydown", onKey);
      const restoreTo = options.returnFocusRef?.value ?? previouslyFocused;
      if (restoreTo && typeof restoreTo.focus === "function") {
        restoreTo.focus({ preventScroll: true });
      }
    });
  });

  onBeforeUnmount(() => {
    const container = containerRef.value;
    if (container) container.removeEventListener("keydown", onKey);
  });
}
