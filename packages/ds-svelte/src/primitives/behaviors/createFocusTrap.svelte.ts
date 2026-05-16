import { onMount } from 'svelte';

export interface FocusTrapOptions {
  getActive: () => boolean;
  containerRef: { el: HTMLElement | null };
}

export function createFocusTrap(opts: FocusTrapOptions): void {
  function focusables(): HTMLElement[] {
    return Array.from(
      opts.containerRef.el?.querySelectorAll<HTMLElement>(
        'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])',
      ) ?? [],
    );
  }

  function onKeydown(e: KeyboardEvent) {
    if (!opts.getActive() || e.key !== 'Tab') return;
    const els = focusables();
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

  onMount(() => {
    document.addEventListener('keydown', onKeydown);
    return () => document.removeEventListener('keydown', onKeydown);
  });
}
