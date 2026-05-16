import type { ReactiveControllerHost } from 'lit';

export interface ScrollLockOptions {
  /** Returns true when the scroll lock should be held. */
  getActive: () => boolean;
}

let lockCount = 0;
let savedOverflow = '';

function acquire() {
  if (lockCount === 0) {
    savedOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
  }
  lockCount++;
}

function release() {
  lockCount = Math.max(0, lockCount - 1);
  if (lockCount === 0) document.body.style.overflow = savedOverflow;
}

/**
 * ReactiveController that locks `document.body` scroll when active.
 * Uses a reference count so multiple simultaneous locks are handled
 * correctly (the lock is only released when all holders release it).
 */
export class ScrollLockController {
  private opts: ScrollLockOptions;
  private held = false;

  constructor(host: ReactiveControllerHost, opts: ScrollLockOptions) {
    this.opts = opts;
    host.addController(this);
  }

  hostUpdate() {
    const active = this.opts.getActive();
    if (active && !this.held) { acquire(); this.held = true; }
    else if (!active && this.held) { release(); this.held = false; }
  }

  hostDisconnected() {
    if (this.held) { release(); this.held = false; }
  }
}
