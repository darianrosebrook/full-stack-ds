import { type DestroyRef } from '@angular/core';

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
  panelRef?: { nativeElement: HTMLElement | null };
  /** Optional anchor element; clicks here also do not dismiss. */
  anchorRef?: { nativeElement: HTMLElement | null };
  /** DestroyRef for cleanup; injected by the consuming component. */
  destroyRef: DestroyRef;
}

/**
 * Generic dismissal primitive — Angular equivalent of React's useDismissal.
 *
 * Registers document-level listeners immediately and removes them via
 * DestroyRef. Listeners short-circuit when `open()` returns false, so it is
 * safe to call this once in component construction even when the surface
 * starts closed.
 */
export function createDismissal(opts: DismissalOptions): void {
  const isEscapeEnabled = () =>
    opts.closeOnEscape ? opts.closeOnEscape() !== false : true;
  const isOutsideClickEnabled = () =>
    opts.closeOnOutsideClick ? opts.closeOnOutsideClick() === true : false;

  function onKeydown(e: KeyboardEvent): void {
    if (e.key === 'Escape' && opts.open() && isEscapeEnabled()) {
      opts.onDismiss();
    }
  }

  function onPointerDown(e: PointerEvent): void {
    if (!opts.open() || !isOutsideClickEnabled()) return;
    const target = e.target as Node;
    if (opts.panelRef?.nativeElement && opts.panelRef.nativeElement.contains(target)) return;
    if (opts.anchorRef?.nativeElement && opts.anchorRef.nativeElement.contains(target)) return;
    opts.onDismiss();
  }

  document.addEventListener('keydown', onKeydown);
  document.addEventListener('pointerdown', onPointerDown);

  opts.destroyRef.onDestroy(() => {
    document.removeEventListener('keydown', onKeydown);
    document.removeEventListener('pointerdown', onPointerDown);
  });
}
