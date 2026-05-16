import { watchEffect, type Ref } from "vue";

export interface UseDismissalOptions {
  /** Whether the dismissable surface is currently open. */
  open: () => boolean;
  /** Called when a dismissal trigger fires. */
  onDismiss: () => void;
  /** Close on Escape key (default: true). */
  closeOnEscape?: () => boolean | undefined;
  /** Close on click/tap outside the panel (default: false; opt-in per call). */
  closeOnOutsideClick?: () => boolean | undefined;
  /** Element that bounds "inside"; outside clicks here do not dismiss. */
  panelRef?: Ref<HTMLElement | null>;
  /** Optional anchor element; clicks here also do not dismiss. */
  anchorRef?: Ref<HTMLElement | null>;
}

/**
 * Generic dismissal primitive — Vue 3 equivalent of React's useDismissal.
 *
 * Composes Escape-to-dismiss and outside-click-to-dismiss listeners that
 * auto-attach while `open()` is true and detach when closed or unmounted.
 * Consumer supplies `onDismiss`; this primitive does not own state.
 */
export function useDismissal(options: UseDismissalOptions): void {
  const {
    open,
    onDismiss,
    closeOnEscape,
    closeOnOutsideClick,
    panelRef,
    anchorRef,
  } = options;

  function isEscapeEnabled(): boolean {
    return closeOnEscape ? closeOnEscape() !== false : true;
  }

  function isOutsideClickEnabled(): boolean {
    return closeOnOutsideClick ? closeOnOutsideClick() === true : false;
  }

  function onKey(e: KeyboardEvent): void {
    if (e.key === "Escape" && isEscapeEnabled()) onDismiss();
  }

  function onPointer(e: MouseEvent | PointerEvent): void {
    if (!isOutsideClickEnabled()) return;
    const target = e.target as Node | null;
    if (!target) return;
    if (panelRef?.value && panelRef.value.contains(target)) return;
    if (anchorRef?.value && anchorRef.value.contains(target)) return;
    onDismiss();
  }

  watchEffect((onCleanup) => {
    if (!open()) return;
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onPointer);
    onCleanup(() => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onPointer);
    });
  });

}
