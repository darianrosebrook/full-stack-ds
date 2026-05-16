import { effect, type Signal, type DestroyRef } from '@angular/core';

let lockCount = 0;
let savedOverflow = '';

function acquire(): void {
  if (lockCount === 0) {
    savedOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
  }
  lockCount++;
}

function release(): void {
  lockCount = Math.max(0, lockCount - 1);
  if (lockCount === 0) {
    document.body.style.overflow = savedOverflow;
  }
}

/**
 * Reference-counted body scroll lock for Angular. Pass an Angular signal
 * so the lock tracks the source-of-truth reactive value. Releasing on
 * destroy is automatic via DestroyRef.
 */
export function createScrollLock(active: Signal<boolean>, destroyRef: DestroyRef): void {
  let held = false;

  const cleanup = effect(() => {
    if (active() && !held) {
      acquire();
      held = true;
    } else if (!active() && held) {
      release();
      held = false;
    }
  });

  destroyRef.onDestroy(() => {
    if (held) {
      release();
      held = false;
    }
    cleanup.destroy();
  });
}
