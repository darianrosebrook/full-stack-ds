import { onBeforeUnmount, watchEffect, type Ref } from "vue";

let lockCount = 0;
let savedOverflow: string | null = null;

function acquire(): void {
  if (lockCount === 0) {
    savedOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
  }
  lockCount += 1;
}

function release(): void {
  lockCount = Math.max(0, lockCount - 1);
  if (lockCount === 0 && savedOverflow !== null) {
    document.body.style.overflow = savedOverflow;
    savedOverflow = null;
  }
}

/**
 * Reference-counted body scroll lock. Pass a `Ref<boolean>` so the lock
 * tracks the source-of-truth reactive value; releasing on unmount is
 * automatic.
 */
export function useScrollLock(active: Ref<boolean>): void {
  let acquired = false;
  watchEffect(() => {
    if (active.value && !acquired) {
      acquire();
      acquired = true;
    } else if (!active.value && acquired) {
      release();
      acquired = false;
    }
  });
  onBeforeUnmount(() => {
    if (acquired) release();
  });
}
