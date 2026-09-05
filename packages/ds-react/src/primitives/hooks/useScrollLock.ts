import { useEffect } from "react";
import { usePortalTarget } from "./usePortal";

/**
 * Lock document body scroll while `active` is true. Restores the prior
 * `overflow` value when unlocked.
 *
 * Stacking (multiple modals open at once) is handled by a shared counter
 * so the body unlocks only when the last consumer releases.
 */

interface LockState {
  count: number;
  savedOverflow: string;
}

const locks = new WeakMap<HTMLElement, LockState>();

function acquire(target: HTMLElement) {
  const current = locks.get(target);
  if (!current) {
    locks.set(target, { count: 1, savedOverflow: target.style.overflow });
    target.style.overflow = "hidden";
    return;
  }
  current.count += 1;
}

function release(target: HTMLElement) {
  const current = locks.get(target);
  if (!current) return;
  current.count = Math.max(0, current.count - 1);
  if (current.count === 0) {
    target.style.overflow = current.savedOverflow;
    locks.delete(target);
  }
}

export function useScrollLock(active: boolean): void {
  const portalTarget = usePortalTarget();
  useEffect(() => {
    if (!active || !(portalTarget instanceof HTMLElement)) return;
    acquire(portalTarget);
    return () => release(portalTarget);
  }, [active, portalTarget]);
}
