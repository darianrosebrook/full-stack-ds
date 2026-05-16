import { useEffect } from "react";

/**
 * Lock document body scroll while `active` is true. Restores the prior
 * `overflow` value when unlocked.
 *
 * Stacking (multiple modals open at once) is handled by a shared counter
 * so the body unlocks only when the last consumer releases.
 */

let lockCount = 0;
let savedOverflow: string | null = null;

function acquire() {
  if (lockCount === 0) {
    savedOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
  }
  lockCount += 1;
}

function release() {
  lockCount = Math.max(0, lockCount - 1);
  if (lockCount === 0 && savedOverflow !== null) {
    document.body.style.overflow = savedOverflow;
    savedOverflow = null;
  }
}

export function useScrollLock(active: boolean): void {
  useEffect(() => {
    if (!active) return;
    acquire();
    return () => release();
  }, [active]);
}
