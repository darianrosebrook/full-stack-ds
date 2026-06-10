import { type DestroyRef } from '@angular/core';

export interface AutoDismissOptions {
  /** Getter for the open state. The timer only runs while open. */
  open: () => boolean;
  /**
   * Getter for the presence budget in milliseconds (design default flows
   * from the component's `*.timing.auto-dismiss` token). `undefined`,
   * `null`, or `0` disables the timer.
   */
  durationMs: () => number | null | undefined;
  /** Called when the budget elapses. */
  onDismiss: () => void;
  /**
   * Pause while the surface is hovered or contains focus (WCAG 2.2.1
   * Timing Adjustable). Default true.
   */
  pauseOnInteraction?: boolean;
  destroyRef: DestroyRef;
}

export interface AutoDismissResult {
  pause(): void;
  resume(): void;
  /** Re-evaluate open/duration; call when either input changes. */
  sync(): void;
  /** Attach to the surface element to wire interaction pausing. */
  pauseListeners: {
    pointerenter: () => void;
    pointerleave: () => void;
    focusin: () => void;
    focusout: () => void;
  };
}

/**
 * Angular equivalent of React's useAutoDismiss. House style (matching
 * createAnchorToggle) is imperative: the consumer calls `sync()` when
 * open/duration change; the timer clears via DestroyRef. Tracks the
 * remaining budget across pause/resume.
 */
export function createAutoDismiss(opts: AutoDismissOptions): AutoDismissResult {
  const pauseOnInteraction = opts.pauseOnInteraction ?? true;

  let timer: ReturnType<typeof setTimeout> | null = null;
  let deadline = 0;
  let remaining = 0;
  let paused = false;

  function clear(): void {
    if (timer !== null) {
      clearTimeout(timer);
      timer = null;
    }
  }

  function start(ms: number): void {
    clear();
    deadline = Date.now() + ms;
    timer = setTimeout(() => {
      timer = null;
      opts.onDismiss();
    }, ms);
  }

  function pause(): void {
    if (timer === null) return;
    remaining = Math.max(deadline - Date.now(), 0);
    paused = true;
    clear();
  }

  function resume(): void {
    if (!paused) return;
    paused = false;
    start(remaining);
  }

  function sync(): void {
    const duration = opts.durationMs();
    paused = false;
    if (!opts.open() || typeof duration !== 'number' || duration <= 0) {
      clear();
      return;
    }
    start(duration);
  }

  opts.destroyRef.onDestroy(clear);

  return {
    pause,
    resume,
    sync,
    pauseListeners: {
      pointerenter: () => {
        if (pauseOnInteraction) pause();
      },
      pointerleave: () => {
        if (pauseOnInteraction) resume();
      },
      focusin: () => {
        if (pauseOnInteraction) pause();
      },
      focusout: () => {
        if (pauseOnInteraction) resume();
      },
    },
  };
}
