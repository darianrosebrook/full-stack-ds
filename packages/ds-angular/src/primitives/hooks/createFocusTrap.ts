import { effect, type Signal, type DestroyRef } from '@angular/core';

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
  '[contenteditable="true"]',
].join(',');

export interface FocusTrapOptions {
  active: Signal<boolean>;
  destroyRef: DestroyRef;
}

/**
 * Angular equivalent of Vue's useFocusTrap. Traps Tab focus inside
 * `containerRef` while `options.active` is true. Uses `effect()` to
 * reactively attach / detach the keydown listener.
 */
export function createFocusTrap(
  containerRef: { nativeElement: HTMLElement | null },
  opts: FocusTrapOptions,
): void {
  function getFocusables(): HTMLElement[] {
    return Array.from(
      containerRef.nativeElement?.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR) ?? [],
    );
  }

  function onKeydown(e: KeyboardEvent): void {
    if (!opts.active() || e.key !== 'Tab') return;
    const els = getFocusables();
    if (els.length === 0) {
      e.preventDefault();
      return;
    }
    const first = els[0];
    const last = els[els.length - 1];
    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }

  const cleanup = effect(() => {
    if (opts.active()) {
      document.addEventListener('keydown', onKeydown);
    } else {
      document.removeEventListener('keydown', onKeydown);
    }
  });

  opts.destroyRef.onDestroy(() => {
    document.removeEventListener('keydown', onKeydown);
    cleanup.destroy();
  });
}
