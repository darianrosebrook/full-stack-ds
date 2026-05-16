import { onMount } from 'svelte';

export interface DismissalOptions {
  /** Whether the dismissable surface is currently open. */
  open: () => boolean;
  /** Called when a dismissal trigger fires. */
  onDismiss: () => void;
  /** Close on Escape key (default: true). */
  closeOnEscape?: () => boolean | undefined;
  /** Close on click/tap outside the panel (default: false; opt-in per call). */
  closeOnOutsideClick?: () => boolean | undefined;
  /** Element that bounds "inside"; outside clicks here do not dismiss. */
  panelRef?: { el: HTMLElement | null };
  /** Optional anchor element; clicks here also do not dismiss. */
  anchorRef?: { el: HTMLElement | null };
}

/**
 * Generic dismissal primitive — Svelte 5 equivalent of React's useDismissal.
 *
 * Listens for Escape and outside-pointer events while open and calls
 * onDismiss when triggered. State is owned by the consumer.
 */
export function createDismissal(opts: DismissalOptions): void {
  const isEscapeEnabled = () =>
    opts.closeOnEscape ? opts.closeOnEscape() !== false : true;
  const isOutsideClickEnabled = () =>
    opts.closeOnOutsideClick ? opts.closeOnOutsideClick() === true : false;

  function onKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape' && opts.open() && isEscapeEnabled()) {
      opts.onDismiss();
    }
  }

  function onPointerDown(e: PointerEvent) {
    if (!opts.open() || !isOutsideClickEnabled()) return;
    const target = e.target as Node;
    if (opts.panelRef?.el && opts.panelRef.el.contains(target)) return;
    if (opts.anchorRef?.el && opts.anchorRef.el.contains(target)) return;
    opts.onDismiss();
  }

  onMount(() => {
    document.addEventListener('keydown', onKeydown);
    document.addEventListener('pointerdown', onPointerDown);
    return () => {
      document.removeEventListener('keydown', onKeydown);
      document.removeEventListener('pointerdown', onPointerDown);
    };
  });
}
