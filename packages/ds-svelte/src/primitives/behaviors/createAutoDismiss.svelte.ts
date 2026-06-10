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
}

export interface AutoDismissResult {
  pause(): void;
  resume(): void;
  /** Re-evaluate open/duration; call from a $effect in the consumer. */
  sync(): void;
  /** Stop the timer; call on component teardown. */
  destroy(): void;
  /** Attach to the surface element to wire interaction pausing. */
  pauseListeners: {
    onpointerenter: () => void;
    onpointerleave: () => void;
    onfocusin: () => void;
    onfocusout: () => void;
  };
}

/**
 * Svelte equivalent of React's useAutoDismiss. House style for behaviors
 * is explicit lifecycle (like createAnchorToggle's listeners), so the
 * consumer drives reactivity: call `sync()` from a `$effect` reading
 * open/duration, and `destroy()` on teardown. Tracks the remaining budget
 * across pause/resume.
 */
export function createAutoDismiss(opts: AutoDismissOptions): AutoDismissResult {
  const pauseOnInteraction = opts.pauseOnInteraction ?? true;

  let timer: ReturnType<typeof setTimeout> | null = null;
  let deadline = 0;
  let remaining = 0;
  let paused = false;

  function clear() {
    if (timer !== null) {
      clearTimeout(timer);
      timer = null;
    }
  }

  function start(ms: number) {
    clear();
    deadline = Date.now() + ms;
    timer = setTimeout(() => {
      timer = null;
      opts.onDismiss();
    }, ms);
  }

  function pause() {
    if (timer === null) return;
    remaining = Math.max(deadline - Date.now(), 0);
    paused = true;
    clear();
  }

  function resume() {
    if (!paused) return;
    paused = false;
    start(remaining);
  }

  function sync() {
    const duration = opts.durationMs();
    paused = false;
    if (!opts.open() || typeof duration !== "number" || duration <= 0) {
      clear();
      return;
    }
    start(duration);
  }

  return {
    pause,
    resume,
    sync,
    destroy: clear,
    pauseListeners: {
      onpointerenter: () => {
        if (pauseOnInteraction) pause();
      },
      onpointerleave: () => {
        if (pauseOnInteraction) resume();
      },
      onfocusin: () => {
        if (pauseOnInteraction) pause();
      },
      onfocusout: () => {
        if (pauseOnInteraction) resume();
      },
    },
  };
}
